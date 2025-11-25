'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import type { Student } from '@/lib/types';

type UserRole = 'viewer' | 'admin';

type ScanResult = {
  rawText: string;
  studentId?: string;
};

type DetectedBarcodeLike = {
  rawValue?: string;
};

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource | ImageBitmapSource) => Promise<DetectedBarcodeLike[]>;
};

type BarcodeDetectorConstructorLike = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructorLike;
  }
}

export default function ScanPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Hostel Warden');
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [supportsScanner, setSupportsScanner] = useState(true);
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(scanning);
  const [scanError, setScanError] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [studentError, setStudentError] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    scanningRef.current = scanning;
  }, [scanning]);

  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? localStorage.getItem('hostelUser') : null;
    if (!stored) {
      router.replace('/');
      return;
    }
    const parsed = JSON.parse(stored) as { name?: string; role?: UserRole };
    if (parsed?.name) {
      setUserName(parsed.name);
    }
    if (parsed?.role) {
      setUserRole(parsed.role);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!window.BarcodeDetector) {
      setSupportsScanner(false);
      return;
    }
    detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
  }, []);

  useEffect(() => {
    if (!scanning) {
      stopStream();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError('Camera access is not supported in this browser.');
      setScanning(false);
      return;
    }

    let cancelled = false;
    setScanError('');
    setScanResult(null);
    setStudent(null);
    setStudentError('');
    setStudentLoading(false);

    async function startStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        requestNextFrame();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to access the camera. Please check permissions.';
        setScanError(message);
        setScanning(false);
      }
    }

    startStream();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [scanning]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  function stopStream() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }

  function requestNextFrame() {
    if (!detectorRef.current || !videoRef.current || !scanningRef.current) {
      return;
    }
    rafRef.current = requestAnimationFrame(() => {
      void scanFrame();
    });
  }

  async function scanFrame() {
    if (!detectorRef.current || !videoRef.current || !scanningRef.current) {
      return;
    }
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0) {
        const rawValue = barcodes[0].rawValue?.trim();
        if (rawValue) {
          handleScanSuccess(rawValue);
          return;
        }
      }
    } catch (err) {
      setScanError((prev) =>
        prev || 'Unable to read the QR code. Adjust lighting and try again.'
      );
    }
    requestNextFrame();
  }

  function handleScanSuccess(rawValue: string) {
    stopStream();
    setScanning(false);
    const studentId = extractStudentId(rawValue);
    setScanResult({ rawText: rawValue, studentId });
    if (!studentId) {
      setStudentError('Scan succeeded, but no student ID was detected.');
      return;
    }
    fetchStudent(studentId);
  }

  async function fetchStudent(studentId: string) {
    setStudentLoading(true);
    setStudentError('');
    setStudent(null);
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No resident record matches this pass.');
        }
        throw new Error('Unable to load resident details.');
      }
      const data = (await response.json()) as Student;
      setStudent(data);
    } catch (err) {
      setStudentError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setStudentLoading(false);
    }
  }

  function beginScan() {
    if (!supportsScanner) {
      return;
    }
    setScanError('');
    setStudentError('');
    setScanResult(null);
    setStudent(null);
    setScanning(true);
  }

  function toggleScanning() {
    if (scanning) {
      setScanning(false);
      stopStream();
    } else {
      beginScan();
    }
  }

  function scanAnother() {
    beginScan();
  }

  function handleLogout() {
    localStorage.removeItem('hostelUser');
    router.replace('/');
  }

  function clearLastResult() {
    setScanResult(null);
    setStudent(null);
    setStudentError('');
  }

  return (
    <main className="page-shell">
      <TopNav onLogout={handleLogout} userName={userName} userRole={userRole} />

      <section style={gridStyle}>
        <div style={panelStyle}>
          <p style={eyebrow}>On-site scanner</p>
          <h1 style={{ margin: '0.25rem 0 0.5rem' }}>Scan resident QR passes</h1>
          <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
            Use your device camera to scan the pass generated in the admin panel.
            The system will pull up the latest record instantly.
          </p>

          {supportsScanner ? (
            <>
              <div style={previewFrame}>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                />
                {!scanning && (
                  <div style={previewOverlay}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Camera idle</p>
                    <small style={{ color: 'var(--color-text-muted)' }}>
                      Start scanning to enable the camera feed.
                    </small>
                  </div>
                )}
              </div>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
                {scanError
                  ? scanError
                  : scanning
                    ? 'Align the QR code inside the frame.'
                    : 'Grant camera access when prompted to begin scanning.'}
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={toggleScanning}
                  style={primaryButtonStyle}
                >
                  {scanning ? 'Stop scanning' : 'Start scanning'}
                </button>
                <button
                  type="button"
                  onClick={clearLastResult}
                  disabled={!scanResult}
                  style={{ ...secondaryButtonStyle, opacity: scanResult ? 1 : 0.6 }}
                >
                  Clear last result
                </button>
              </div>
            </>
          ) : (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-danger)' }}>
                QR scanning is not supported in this browser.
              </p>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)' }}>
                Use Chrome, Edge, or another Chromium-based browser to scan directly inside the dashboard, or open the QR link on any device to view the pass.
              </p>
            </div>
          )}
        </div>

        <div style={panelStyle}>
          <p style={eyebrow}>Latest scan</p>
          <h2 style={{ margin: '0.25rem 0 1rem' }}>Resident details</h2>

          {scanResult ? (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Raw data</p>
              <code style={codeStyle}>{scanResult.rawText}</code>
              {scanResult.studentId && (
                <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)' }}>
                  Student ID extracted: <strong>{scanResult.studentId}</strong>
                </p>
              )}
            </div>
          ) : (
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
              No scan yet. Hold a QR pass over the camera to load the resident record.
            </p>
          )}

          {studentLoading && (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Fetching resident...</p>
          )}

          {student && (
            <div style={detailCardStyle}>
              <h3 style={{ margin: '0 0 0.5rem' }}>{student.name}</h3>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                {student.studentId} &bull; Block {student.block} {student.roomNumber}
              </p>
              <div style={infoGridStyle}>
                <InfoRow label="Programme" value={student.programme} />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Residency" value={student.status} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <Link
                  href={`/pass/${student.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={primaryButtonStyle}
                >
                  Open live pass
                </Link>
                <button
                  type="button"
                  onClick={scanAnother}
                  style={secondaryButtonStyle}
                  disabled={!supportsScanner}
                >
                  Scan another pass
                </button>
              </div>
            </div>
          )}

          {studentError && (
            <p style={{ marginTop: '0.5rem', color: 'var(--color-danger)', fontWeight: 600 }}>
              {studentError}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function extractStudentId(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split('/').filter(Boolean);
    const passIndex = segments.indexOf('pass');
    if (passIndex !== -1 && segments[passIndex + 1]) {
      return segments[passIndex + 1];
    }
  } catch {
    // not a full URL, continue to other heuristics
  }
  const relativeMatch = trimmed.match(/pass\/([A-Za-z0-9-]+)/);
  if (relativeMatch?.[1]) {
    return relativeMatch[1];
  }
  const likelyId = trimmed.match(/[0-9a-fA-F-]{10,}/);
  return likelyId ? likelyId[0] : undefined;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <p style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>{value}</p>
    </div>
  );
}

const panelStyle: CSSProperties = {
  background: 'var(--color-card)',
  borderRadius: '28px',
  border: '1px solid rgba(148,163,184,0.2)',
  padding: '1.75rem',
  boxShadow: '0 25px 55px rgba(2, 6, 23, 0.65)'
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1.5rem',
  alignItems: 'start'
};

const previewFrame: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '4 / 3',
  borderRadius: '24px',
  border: '1px dashed rgba(148,163,184,0.35)',
  overflow: 'hidden',
  background: 'rgba(15,23,42,0.7)'
};

const previewOverlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '1rem',
  background: 'linear-gradient(180deg, rgba(2,6,23,0.65), rgba(2,6,23,0.85))'
};

const codeStyle: CSSProperties = {
  display: 'block',
  padding: '0.75rem',
  borderRadius: '12px',
  background: 'rgba(15,23,42,0.6)',
  wordBreak: 'break-all',
  marginTop: '0.25rem'
};

const infoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '0.75rem',
  marginTop: '1rem'
};

const detailCardStyle: CSSProperties = {
  borderRadius: '24px',
  border: '1px solid rgba(148,163,184,0.25)',
  background: 'rgba(15,23,42,0.5)',
  padding: '1.25rem'
};

const primaryButtonStyle: CSSProperties = {
  flex: 1,
  minWidth: '180px',
  padding: '0.9rem 1.25rem',
  borderRadius: '999px',
  border: 'none',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
  color: '#041225',
  fontWeight: 700,
  textAlign: 'center',
  cursor: 'pointer'
};

const secondaryButtonStyle: CSSProperties = {
  flex: 1,
  minWidth: '180px',
  padding: '0.9rem 1.25rem',
  borderRadius: '999px',
  border: '1px solid rgba(148,163,184,0.5)',
  background: 'transparent',
  color: 'var(--color-text)',
  fontWeight: 600,
  cursor: 'pointer'
};

const eyebrow: CSSProperties = {
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.78rem',
  color: 'var(--color-text-muted)'
};

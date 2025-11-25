'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import type { Student } from '@/lib/types';

interface StudentQrPanelProps {
  student: Student;
  passUrl: string;
}

export default function StudentQrPanel({
  student,
  passUrl
}: StudentQrPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleCopy() {
    setError('');
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setError('Clipboard API unavailable. Copy the link manually.');
      return;
    }
    try {
      await navigator.clipboard.writeText(passUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Unable to copy link. Copy manually below.');
    }
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('QR code is still rendering. Try again in a moment.');
      return;
    }
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${student.studentId || student.name}-hostel-pass.png`;
    link.click();
  }

  return (
    <div style={{ maxWidth: '420px' }}>
      <p style={{ margin: '0 0 0.85rem', color: 'var(--color-text-muted)' }}>
        Scan to view the live resident record. Share this code with security so they can
        confirm {student.name}&rsquo;s status on arrival.
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.5rem',
          borderRadius: '24px',
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(148,163,184,0.25)'
        }}
      >
        <QRCodeCanvas
          ref={canvasRef}
          value={passUrl}
          size={220}
          includeMargin
          bgColor="#0b1220"
          fgColor="#f8fafc"
        />
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{student.name}</p>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>
            {student.studentId} • Block {student.block} {student.roomNumber}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleDownload} style={primaryButton}>
            Download QR
          </button>
          <button type="button" onClick={handleCopy} style={secondaryButton}>
            {copied ? 'Link Copied' : 'Copy share link'}
          </button>
        </div>
        <div style={linkBox}>
          <small style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            Shareable link
          </small>
          <code style={{ fontSize: '0.9rem', wordBreak: 'break-all', color: 'var(--color-text)' }}>
            {passUrl}
          </code>
        </div>
        {error && (
          <p style={{ color: 'var(--color-danger)', fontWeight: 600, margin: 0 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  flex: 1,
  minWidth: '160px',
  padding: '0.85rem',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
  color: '#041225',
  border: 'none',
  fontWeight: 700,
  cursor: 'pointer'
};

const secondaryButton: React.CSSProperties = {
  flex: 1,
  minWidth: '160px',
  padding: '0.85rem',
  borderRadius: '14px',
  background: 'rgba(15,23,42,0.6)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  fontWeight: 700,
  cursor: 'pointer'
};

const linkBox: React.CSSProperties = {
  padding: '0.85rem',
  borderRadius: '16px',
  border: '1px dashed rgba(148,163,184,0.4)',
  background: 'rgba(15,23,42,0.35)',
  display: 'flex',
  flexDirection: 'column'
};

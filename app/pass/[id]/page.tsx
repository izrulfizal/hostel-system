import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentById } from '@/lib/studentStore';

interface PassPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params
}: PassPageProps): Promise<Metadata> {
  const student = await getStudentById(params.id);
  if (!student) {
    return {
      title: 'Hostel Resident Not Found'
    };
  }

  return {
    title: `${student.name} • Hostel Pass`,
    description: `Scan result for ${student.name} (${student.studentId})`
  };
}

export default async function StudentPassPage({
  params
}: PassPageProps) {
  const student = await getStudentById(params.id);
  if (!student) {
    notFound();
  }

  const verifiedAt = new Date().toLocaleString('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.2), transparent 45%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.2), transparent 35%)'
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--color-card)',
          borderRadius: '32px',
          border: '1px solid rgba(148,163,184,0.25)',
          boxShadow: '0 40px 90px rgba(2, 6, 23, 0.8)',
          padding: '2rem'
        }}
      >
        <p style={{ margin: 0, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
          Hostel Access Pass
        </p>
        <h1 style={{ margin: '0.35rem 0 0.75rem', fontSize: 'clamp(2rem, 4vw, 2.9rem)' }}>
          {student.name}
        </h1>
        <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
          Student ID: <strong>{student.studentId}</strong>
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}
        >
          <InfoCard label="Programme" value={student.programme} />
          <InfoCard label="Block" value={student.block} />
          <InfoCard label="Room" value={student.roomNumber} />
          <InfoCard label="Gender" value={student.gender} />
          <InfoCard label="Residency" value={student.status} />
        </div>

        <div
          style={{
            marginTop: '1.75rem',
            padding: '1.25rem',
            borderRadius: '18px',
            background:
              student.status === 'International'
                ? 'rgba(14,165,233,0.15)'
                : 'rgba(34,197,94,0.15)',
            border:
              student.status === 'International'
                ? '1px solid rgba(14,165,233,0.35)'
                : '1px solid rgba(34,197,94,0.35)'
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>
            Status: {student.status === 'International' ? 'International Resident' : 'Local Resident'}
          </p>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)' }}>
            Verified at {verifiedAt}. If this resident does not match the person presenting
            the pass, contact the warden immediately.
          </p>
        </div>

        <div
          style={{
            marginTop: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Need to revoke or update this resident?{' '}
            <Link
              href="/students"
              style={{ color: 'var(--color-primary)', fontWeight: 600 }}
            >
              Go to admin panel
            </Link>
          </p>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.35)'
            }}
          >
            Return to login
          </Link>
        </div>
      </section>
    </main>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '16px',
        background: 'rgba(15,23,42,0.35)',
        border: '1px solid rgba(148,163,184,0.35)'
      }}
    >
      <p
        style={{
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)'
        }}
      >
        {label}
      </p>
      <p style={{ margin: '0.35rem 0 0', fontSize: '1.1rem', fontWeight: 600 }}>
        {value}
      </p>
    </div>
  );
}

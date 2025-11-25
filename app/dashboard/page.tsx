'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from '@/components/DashboardStats';
import TopNav from '@/components/TopNav';
import type { Student } from '@/lib/types';

type UserRole = 'viewer' | 'admin';

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Hostel Warden');
  const [userRole, setUserRole] = useState<UserRole>('viewer');

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
    fetchStudents();
  }, [router]);

  async function fetchStudents() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to load student data');
      }
      const data = (await response.json()) as Student[];
      setStudents(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('hostelUser');
    router.replace('/');
  }

  return (
    <main className="page-shell">
      <TopNav onLogout={handleLogout} userName={userName} userRole={userRole} />

      <section className="dashboard-hero">
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Welcome back
        </p>
        <h1 style={{ margin: '0.25rem 0 0.5rem', fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>
          Hostel Dashboard
        </h1>
        <p style={{ margin: 0, maxWidth: '46ch', lineHeight: 1.6 }}>
          Get a quick overview of all HA-HH residents, top-level occupancy, and
          residency breakdown. Head to the students page for full CRUD
          management.
        </p>
        <div className="dashboard-hero__actions">
          <Link
            href="/students"
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '999px',
              background: 'var(--color-primary)',
              color: '#0f172a',
              fontWeight: 700,
              display: 'inline-flex',
              justifyContent: 'center'
            }}
          >
            Manage Students
          </Link>
          <button
            onClick={fetchStudents}
            disabled={loading}
            style={{
              padding: '0.9rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'transparent',
              color: 'var(--color-text)',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'inline-flex',
              justifyContent: 'center'
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        {error && (
          <p style={{ marginTop: '1rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            {error}
          </p>
        )}
      </section>

      <DashboardStats students={students} />
    </main>
  );
}

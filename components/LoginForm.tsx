'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'viewer' | 'admin';

interface ApiResponse {
  token: string;
  name: string;
  role: UserRole;
}

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = (await response.json()) as ApiResponse;
      localStorage.setItem(
        'hostelUser',
        JSON.stringify({ token: data.token, name: data.name, role: data.role })
      );
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(15,23,42,0.75)',
        padding: '2.75rem',
        borderRadius: '28px',
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 35px 80px rgba(2,6,23,0.9)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <h1 style={{ margin: '0 0 0.25rem', fontSize: '2.25rem' }}>
        Hostel Manager
      </h1>
      <p style={{ margin: '0 0 2rem', color: 'var(--color-text-muted)' }}>
        Sign in to administer HA-HH student blocks.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            fontWeight: 500,
            color: 'var(--color-text-muted)'
          }}
        >
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              fontSize: '1rem',
              background: 'rgba(2,6,23,0.45)',
              color: 'var(--color-text)'
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            fontWeight: 500,
            color: 'var(--color-text-muted)'
          }}
        >
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              fontSize: '1rem',
              background: 'rgba(2,6,23,0.45)',
              color: 'var(--color-text)'
            }}
          />
        </label>
        {error && (
          <p style={{ color: 'var(--color-danger)', margin: 0, fontWeight: 600 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.95rem 1rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: '#041225',
            border: 'none',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Demo logins: warden / hostel123 (view only) · admin / admin123 (full access)
        </p>
      </form>
    </div>
  );
}

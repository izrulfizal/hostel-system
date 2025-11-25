'use client';

import LoginForm from '@/components/LoginForm';

export default function HomePage() {
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
      <LoginForm />
    </main>
  );
}

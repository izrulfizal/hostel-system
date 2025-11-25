'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type UserRole = 'viewer' | 'admin';

interface TopNavProps {
  onLogout: () => void;
  userName?: string;
  userRole?: UserRole;
}

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/scan', label: 'Scanner' }
];

export default function TopNav({ onLogout, userName, userRole }: TopNavProps) {
  const pathname = usePathname();
  const roleLabel = userRole === 'admin' ? 'Admin' : 'View Only';

  return (
    <header className="top-nav">
      <div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Logged in as
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>{userName ?? 'Hostel Warden'}</strong>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.4)',
              color: userRole === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      <nav className="top-nav__links">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                border: `1px solid ${
                  isActive ? 'rgba(56, 189, 248, 0.4)' : 'transparent'
                }`,
                fontWeight: isActive ? 600 : 500
              }}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          className="top-nav__logout"
          onClick={onLogout}
          style={{
            border: '1px solid rgba(248, 113, 113, 0.4)',
            background: 'rgba(248, 113, 113, 0.1)',
            color: 'var(--color-danger)',
            padding: '0.5rem 1.25rem',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Log out
        </button>
      </nav>
    </header>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hostel Management',
  description: 'Fullstack hostel management system for HA-HH blocks'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

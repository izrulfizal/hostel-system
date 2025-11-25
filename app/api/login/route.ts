import { NextResponse } from 'next/server';

const USERS = [
  {
    username: 'warden',
    password: 'hostel123',
    name: 'Hostel Warden',
    role: 'viewer' as const,
    token: 'warden-demo-token'
  },
  {
    username: 'admin',
    password: 'admin123',
    name: 'Hostel Admin',
    role: 'admin' as const,
    token: 'admin-demo-token'
  }
];

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const user = USERS.find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({
    token: user.token,
    name: user.name,
    role: user.role
  });
}

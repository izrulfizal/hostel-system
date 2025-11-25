import { NextResponse } from 'next/server';
import { createStudent, getStudents } from '@/lib/studentStore';
import type { StudentPayload } from '@/lib/types';

export async function GET() {
  const students = await getStudents();
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as StudentPayload;
  const requiredFields: (keyof StudentPayload)[] = [
    'name',
    'programme',
    'roomNumber',
    'gender',
    'status',
    'block'
  ];

  for (const field of requiredFields) {
    if (!payload[field]) {
      return NextResponse.json(
        { message: `Missing field: ${field}` },
        { status: 400 }
      );
    }
  }

  const student = await createStudent(payload);
  return NextResponse.json(student, { status: 201 });
}

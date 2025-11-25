import { NextResponse } from 'next/server';
import { deleteStudent, getStudents, updateStudent } from '@/lib/studentStore';
import type { StudentPayload } from '@/lib/types';

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  const students = await getStudents();
  const student = students.find((item) => item.id === params.id);
  if (!student) {
    return NextResponse.json({ message: 'Student not found' }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const payload = (await request.json()) as StudentPayload;
  const student = await updateStudent(params.id, payload);
  if (!student) {
    return NextResponse.json({ message: 'Student not found' }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const deleted = await deleteStudent(params.id);
  if (!deleted) {
    return NextResponse.json({ message: 'Student not found' }, { status: 404 });
  }
  return NextResponse.json({}, { status: 204 });
}

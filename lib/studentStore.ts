import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Student, StudentPayload } from './types';

const dataPath = path.join(process.cwd(), 'data', 'students.json');

async function readStudents(): Promise<Student[]> {
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data) as Student[];
}

async function writeStudents(students: Student[]) {
  await fs.writeFile(dataPath, JSON.stringify(students, null, 2), 'utf-8');
}

export async function getStudents() {
  return readStudents();
}

export async function getStudentById(id: string) {
  const students = await readStudents();
  return students.find((student) => student.id === id) ?? null;
}

export async function createStudent(payload: StudentPayload) {
  const students = await readStudents();
  const { id, ...rest } = payload;
  const student: Student = {
    ...(rest as Student),
    id: id && id.trim().length > 0 ? id : randomUUID()
  };
  students.push(student);
  await writeStudents(students);
  return student;
}

export async function updateStudent(id: string, payload: StudentPayload) {
  const students = await readStudents();
  const idx = students.findIndex((student) => student.id === id);
  if (idx === -1) {
    return null;
  }
  const { id: _ignored, ...rest } = payload;
  const updated: Student = { ...students[idx], ...rest };
  students[idx] = updated;
  await writeStudents(students);
  return updated;
}

export async function deleteStudent(id: string) {
  const students = await readStudents();
  const filtered = students.filter((student) => student.id !== id);
  if (filtered.length === students.length) {
    return false;
  }
  await writeStudents(filtered);
  return true;
}

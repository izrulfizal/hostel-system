export type BlockCode = 'HA' | 'HB' | 'HC' | 'HD' | 'HE' | 'HF' | 'HG' | 'HH';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  programme: string;
  roomNumber: string;
  gender: 'Male' | 'Female';
  status: 'Local' | 'International';
  block: BlockCode;
}

export type StudentPayload = Omit<Student, 'id'> & { id?: string };

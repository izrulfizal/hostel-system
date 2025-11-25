'use client';

import { useEffect, useState } from 'react';
import type { Student, StudentPayload } from '@/lib/types';

interface StudentFormProps {
  student: Student | null;
  onSubmit: (payload: StudentPayload) => void | Promise<void>;
  onCancel: () => void;
}

const blockOptions = ['HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH'];
const genderOptions = ['Male', 'Female'] as const;
const statusOptions = ['Local', 'International'] as const;

const initialForm: StudentPayload = {
  id: '',
  studentId: '',
  name: '',
  programme: '',
  roomNumber: '',
  gender: 'Male',
  status: 'Local',
  block: 'HA'
};

export default function StudentForm({
  student,
  onSubmit,
  onCancel
}: StudentFormProps) {
  const [form, setForm] = useState<StudentPayload>(initialForm);

  useEffect(() => {
    if (student) {
      setForm({
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        programme: student.programme,
        roomNumber: student.roomNumber,
        gender: student.gender,
        status: student.status,
        block: student.block
      });
    } else {
      setForm({ ...initialForm });
    }
  }, [student]);

  function handleChange<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  const isEditing = Boolean(student);

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div>
        <h2 style={{ margin: 0 }}>
          {isEditing ? 'Update Student' : 'Add Student'}
        </h2>
        <p style={{ margin: '0.25rem 0', color: 'var(--color-text-muted)' }}>
          {isEditing
            ? 'Modify student details and save changes.'
            : 'Register a new hostel resident.'}
        </p>
      </div>

      <label style={labelStyle}>
        Student ID
        <input
          value={form.studentId}
          onChange={(event) => handleChange('studentId', event.target.value)}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Full name
        <input
          value={form.name}
          onChange={(event) => handleChange('name', event.target.value)}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Programme
        <input
          value={form.programme}
          onChange={(event) => handleChange('programme', event.target.value)}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Room number
        <input
          value={form.roomNumber}
          onChange={(event) => handleChange('roomNumber', event.target.value)}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Block
        <select
          value={form.block}
          onChange={(event) => handleChange('block', event.target.value as (typeof form)['block'])}
          required
          style={inputStyle}
        >
          {blockOptions.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Gender
        <select
          value={form.gender}
          onChange={(event) =>
            handleChange('gender', event.target.value as (typeof form)['gender'])
          }
          required
          style={inputStyle}
        >
          {genderOptions.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Residency
        <select
          value={form.status}
          onChange={(event) =>
            handleChange('status', event.target.value as (typeof form)['status'])
          }
          required
          style={inputStyle}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" style={primaryButton}>
          {isEditing ? 'Save Changes' : 'Add Student'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            style={secondaryButton}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const formStyle: React.CSSProperties = {
  background: 'var(--color-card)',
  padding: '1.75rem',
  borderRadius: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  border: '1px solid var(--color-border)',
  boxShadow: '0 25px 55px rgba(2, 6, 23, 0.65)',
  width: '100%'
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)'
};

const inputStyle: React.CSSProperties = {
  padding: '0.85rem',
  borderRadius: '14px',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  background: 'rgba(2, 6, 23, 0.35)',
  color: 'var(--color-text)'
};

const primaryButton: React.CSSProperties = {
  flex: 1,
  padding: '0.85rem',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
  color: '#061326',
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer'
};

const secondaryButton: React.CSSProperties = {
  flex: 1,
  padding: '0.85rem',
  borderRadius: '12px',
  background: 'rgba(15,23,42,0.6)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  fontWeight: 600,
  cursor: 'pointer'
};

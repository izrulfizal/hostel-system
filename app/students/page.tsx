'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import StudentForm from '@/components/StudentForm';
import StudentQrPanel from '@/components/StudentQrPanel';
import StudentTable from '@/components/StudentTable';
import Modal from '@/components/Modal';
import type { Student, StudentPayload } from '@/lib/types';

const BLOCKS = ['ALL', 'HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH'] as const;
const GENDERS = ['ALL', 'Male', 'Female'] as const;
const STATUS_OPTIONS = ['ALL', 'Local', 'International'] as const;
const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'block', label: 'Block' },
  { value: 'room', label: 'Room Number' }
] as const;

type BlockFilter = (typeof BLOCKS)[number];
type GenderFilter = (typeof GENDERS)[number];
type ResidencyFilter = (typeof STATUS_OPTIONS)[number];
type SortOption = (typeof SORT_OPTIONS)[number]['value'];
type UserRole = 'viewer' | 'admin';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filterBlock, setFilterBlock] = useState<BlockFilter>('ALL');
  const [filterGender, setFilterGender] = useState<GenderFilter>('ALL');
  const [filterResidency, setFilterResidency] =
    useState<ResidencyFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Hostel Warden');
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const [qrShareLink, setQrShareLink] = useState('');

  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? localStorage.getItem('hostelUser') : null;
    if (!stored) {
      router.replace('/');
      return;
    }
    const parsed = JSON.parse(stored) as { name?: string; role?: UserRole };
    if (parsed?.name) {
      setUserName(parsed.name);
    }
    if (parsed?.role) {
      setUserRole(parsed.role);
    }
    fetchStudents();
  }, [router]);

  const canManage = userRole === 'admin';

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return students
      .filter((student) => {
        const matchesBlock =
          filterBlock === 'ALL' ? true : student.block === filterBlock;
        const matchesGender =
          filterGender === 'ALL' ? true : student.gender === filterGender;
        const matchesResidency =
          filterResidency === 'ALL'
            ? true
            : student.status === filterResidency;
        const matchesSearch =
          query.length === 0
            ? true
            : `${student.studentId} ${student.name} ${student.programme} ${student.roomNumber}`
                .toLowerCase()
                .includes(query);
        return (
          matchesBlock && matchesGender && matchesResidency && matchesSearch
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'block':
            if (a.block === b.block) {
              return a.roomNumber.localeCompare(b.roomNumber);
            }
            return a.block.localeCompare(b.block);
          case 'room':
            return a.roomNumber.localeCompare(b.roomNumber);
          case 'name-asc':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [students, filterBlock, filterGender, filterResidency, searchTerm, sortBy]);

  async function fetchStudents() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to load student data');
      }
      const data = (await response.json()) as Student[];
      setStudents(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(payload: StudentPayload) {
    setError('');
    if (!canManage) {
      setError('Only admins can save changes.');
      return;
    }
    try {
      const isEditing = Boolean(payload.id);
      const url = isEditing ? `/api/students/${payload.id}` : '/api/students';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(
          isEditing ? 'Unable to update student' : 'Unable to add student'
        );
      }
      await fetchStudents();
      setSelectedStudent(null);
      setFormModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: string) {
    setError('');
    if (!canManage) {
      setError('Only admins can delete records.');
      return;
    }
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      await fetchStudents();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('hostelUser');
    router.replace('/');
  }

  function openAdd() {
    if (!canManage) {
      setError('Only admins can add students.');
      return;
    }
    setSelectedStudent(null);
    setFormModalOpen(true);
  }

  function openEdit(student: Student) {
    if (!canManage) {
      setError('Only admins can edit students.');
      return;
    }
    setSelectedStudent(student);
    setFormModalOpen(true);
  }

  function openQr(student: Student) {
    setQrStudent(student);
    const base =
      typeof window !== 'undefined' ? window.location.origin : '';
    const url = base
      ? `${base}/pass/${student.id}`
      : `/pass/${student.id}`;
    setQrShareLink(url);
    setQrModalOpen(true);
  }

  function closeQr() {
    setQrModalOpen(false);
    setQrStudent(null);
    setQrShareLink('');
  }

  return (
    <main className="page-shell">
      <TopNav onLogout={handleLogout} userName={userName} userRole={userRole} />

      <section className="students-header">
        <div>
          <h1 style={{ margin: 0 }}>Residents</h1>
          <p style={{ margin: '0.25rem 0', color: 'var(--color-text-muted)' }}>
            Add, filter, sort, and manage HA-HH residents in one view.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <button
            onClick={openAdd}
            disabled={!canManage}
            style={{
              padding: '0.95rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: '#041225',
              fontWeight: 700,
              cursor: canManage ? 'pointer' : 'not-allowed',
              opacity: canManage ? 1 : 0.6
            }}
          >
            + Add Student
          </button>
          {!canManage && (
            <small style={{ color: 'var(--color-text-muted)' }}>
              View-only access. Log in as admin to make changes.
            </small>
          )}
        </div>
      </section>

      <section className="students-filters">
        <select value={filterBlock} onChange={(event) => setFilterBlock(event.target.value as BlockFilter)}>
          {BLOCKS.map((block) => (
            <option key={block} value={block}>
              {block === 'ALL' ? 'All Blocks' : `Block ${block}`}
            </option>
          ))}
        </select>
        <select value={filterGender} onChange={(event) => setFilterGender(event.target.value as GenderFilter)}>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender === 'ALL' ? 'All Genders' : gender}
            </option>
          ))}
        </select>
        <select value={filterResidency} onChange={(event) => setFilterResidency(event.target.value as ResidencyFilter)}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === 'ALL' ? 'All Residency Types' : status}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by ID, name, programme"
        />
      </section>

      <StudentTable
        students={filteredStudents}
        allStudents={students}
        loading={loading}
        error={error}
        canManage={canManage}
        onEdit={openEdit}
        onDelete={(student) => handleDelete(student.id)}
        onShowQr={openQr}
      />

      <Modal open={qrModalOpen} onClose={closeQr} title="Resident QR Pass">
        {qrStudent && qrShareLink ? (
          <StudentQrPanel student={qrStudent} passUrl={qrShareLink} />
        ) : (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Preparing QR code...
          </p>
        )}
      </Modal>

      {canManage && (
        <Modal
          open={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setSelectedStudent(null);
          }}
          title={selectedStudent ? 'Edit Student' : 'Add Student'}
        >
          <StudentForm
            key={selectedStudent?.id ?? 'new'}
            student={selectedStudent}
            onCancel={() => {
              setFormModalOpen(false);
              setSelectedStudent(null);
            }}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}
    </main>
  );
}

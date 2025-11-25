'use client';

import type { Student } from '@/lib/types';

interface StudentTableProps {
  students: Student[];
  allStudents: Student[];
  loading: boolean;
  error: string;
  canManage: boolean;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void | Promise<void>;
  onShowQr: (student: Student) => void;
}

export default function StudentTable({
  students,
  allStudents,
  loading,
  error,
  canManage,
  onEdit,
  onDelete,
  onShowQr
}: StudentTableProps) {
  const columnCount = canManage ? 9 : 8;

  return (
    <section style={tableCard}>
      <header className="table-header">
        <div>
          <h2 style={{ margin: 0 }}>Students</h2>
          <p style={{ margin: '0.25rem 0', color: 'var(--color-text-muted)' }}>
            {students.length} shown / {allStudents.length} total
          </p>
        </div>
      </header>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontWeight: 600, marginTop: 0 }}>
          {error}
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={headerCell}>Student ID</th>
              <th style={headerCell}>Name</th>
              <th style={headerCell}>Programme</th>
              <th style={headerCell}>Block</th>
              <th style={headerCell}>Room</th>
              <th style={headerCell}>Gender</th>
              <th style={headerCell}>Status</th>
              <th style={headerCell}>QR Pass</th>
              {canManage && <th style={headerCell} />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columnCount} style={emptyCell}>
                  Loading students...
                </td>
              </tr>
            )}
            {!loading && students.length === 0 && (
              <tr>
                <td colSpan={columnCount} style={emptyCell}>
                  No students match the selected filters.
                </td>
              </tr>
            )}
            {!loading &&
              students.map((student) => (
                <tr key={student.id}>
                  <td style={cell}>{student.studentId}</td>
                  <td style={cell}>{student.name}</td>
                  <td style={cell}>{student.programme}</td>
                  <td style={cell}>{student.block}</td>
                  <td style={cell}>{student.roomNumber}</td>
                  <td style={cell}>{student.gender}</td>
                  <td style={cell}>{student.status}</td>
                  <td style={cell}>
                    <button onClick={() => onShowQr(student)} style={linkButton}>
                      View QR
                    </button>
                  </td>
                  {canManage && (
                    <td style={{ ...cell, textAlign: 'right' }}>
                      <button
                        onClick={() => onEdit(student)}
                        style={linkButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const confirmDelete = window.confirm(
                            `Delete ${student.name}?`
                          );
                          if (confirmDelete) {
                            onDelete(student);
                          }
                        }}
                        style={{ ...linkButton, color: 'var(--color-danger)' }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const tableCard: React.CSSProperties = {
  background: 'var(--color-card)',
  borderRadius: '24px',
  border: '1px solid var(--color-border)',
  boxShadow: '0 25px 55px rgba(2, 6, 23, 0.65)',
  padding: '1.5rem'
};

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  color: 'var(--color-text)'
};

const emptyCell: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  color: 'var(--color-text-muted)'
};

const linkButton: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  fontWeight: 600,
  marginLeft: '0.5rem'
};

const headerCell: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-muted)',
  borderBottom: '1px solid rgba(148,163,184,0.25)'
};

const cell: React.CSSProperties = {
  padding: '0.9rem 0.75rem',
  borderBottom: '1px solid rgba(148,163,184,0.12)'
};

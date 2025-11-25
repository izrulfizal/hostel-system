import type { Student } from '@/lib/types';

interface DashboardStatsProps {
  students: Student[];
}

const BLOCKS = ['HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH'];

export default function DashboardStats({ students }: DashboardStatsProps) {
  const total = students.length;
  const blockCounts = BLOCKS.map((block) => ({
    block,
    count: students.filter((student) => student.block === block).length
  }));
  const genderCounts = {
    Male: students.filter((student) => student.gender === 'Male').length,
    Female: students.filter((student) => student.gender === 'Female').length
  };
  const statusCounts = {
    Local: students.filter((student) => student.status === 'Local').length,
    International: students.filter((student) => student.status === 'International').length
  };

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}
    >
      <article style={cardStyle}>
        <h3 style={cardTitle}>Total Residents</h3>
        <p style={cardValue}>{total}</p>
      </article>
      <SplitCard
        title="Local vs International"
        splits={[
          { label: 'Local', value: statusCounts.Local, color: 'var(--color-primary)' },
          { label: 'International', value: statusCounts.International, color: '#fbbf24' }
        ]}
      />
      <SplitCard
        title="Gender Balance"
        splits={[
          { label: 'Male', value: genderCounts.Male, color: '#38bdf8' },
          { label: 'Female', value: genderCounts.Female, color: '#f472b6' }
        ]}
      />
      <article style={{ ...cardStyle, gridColumn: '1 / -1' }}>
        <h3 style={cardTitle}>Block Distribution</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {blockCounts.map(({ block, count }) => (
            <div
              key={block}
              style={{
                background: 'rgba(15,23,42,0.7)',
                borderRadius: '16px',
                padding: '0.85rem 0.75rem',
                textAlign: 'center',
                border: '1px solid rgba(148,163,184,0.2)'
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{block}</p>
              <p style={{ margin: '0.15rem 0 0', color: 'var(--color-text-muted)' }}>{count}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

interface SplitCardProps {
  title: string;
  splits: { label: string; value: number; color: string }[];
}

function SplitCard({ title, splits }: SplitCardProps) {
  const total = splits.reduce((sum, item) => sum + item.value, 0);
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>{title}</h3>
      {total === 0 ? (
        <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)' }}>No data</p>
      ) : (
        <>
          <div style={splitList}>
            {splits.map((split) => {
              const percentage = Math.round((split.value / total) * 100);
              return (
                <div key={split.label} style={splitRow}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {split.label}
                  </span>
                  <strong style={{ color: 'var(--color-text)' }}>
                    {split.value} <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>({percentage}%)</span>
                  </strong>
                </div>
              );
            })}
          </div>
          <div style={progressTrack}>
            {splits.map((split) => {
              const width = total === 0 ? 0 : (split.value / total) * 100;
              return (
                <span
                  key={split.label}
                  style={{
                    display: 'block',
                    height: '100%',
                    width: `${width}%`,
                    background: split.color,
                    transition: 'width 0.3s ease'
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-card)',
  padding: '1.75rem',
  borderRadius: '28px',
  border: '1px solid rgba(56,189,248,0.15)',
  boxShadow: '0 35px 75px rgba(2, 6, 23, 0.65)'
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: 'var(--color-text-muted)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

const cardValue: React.CSSProperties = {
  margin: '0.35rem 0 0',
  fontSize: '2.5rem',
  fontWeight: 700,
  color: 'var(--color-text)'
};

const splitList: React.CSSProperties = {
  margin: '0.85rem 0 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem'
};

const splitRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const progressTrack: React.CSSProperties = {
  width: '100%',
  height: '10px',
  borderRadius: '999px',
  background: 'rgba(148,163,184,0.25)',
  overflow: 'hidden',
  display: 'flex'
};

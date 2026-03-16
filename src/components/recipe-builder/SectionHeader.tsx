interface SectionHeaderProps {
  title: string;
  section: string;
  collapsed: boolean;
  onToggle: (s: string) => void;
  summary?: string | React.ReactNode;
}

export const SectionHeader = ({ title, section, collapsed, onToggle, summary }: SectionHeaderProps) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsed ? '0' : '1.5rem' }} onClick={() => onToggle(section)}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
      <h3 style={{ margin: 0, border: 'none', padding: 0, lineHeight: '1.2', whiteSpace: 'nowrap' }}>{title}</h3>
      {collapsed && summary && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', marginRight: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold', lineHeight: '1.2', textAlign: 'right' }}>{summary}</span>
        </div>
      )}
    </div>
    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', minWidth: '20px', justifyContent: 'center' }}>{collapsed ? '▼' : '▲'}</span>
  </div>
);

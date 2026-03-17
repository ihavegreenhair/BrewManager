import React, { useState, useMemo } from 'react';
import { fermentables as fermentableLibrary } from '../../data/fermentables';

interface FermentableVarietyPickerProps {
  value: string;
  onChange: (variety: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
}

export const FermentableVarietyPicker = ({ value, onChange, onFocus, onBlur, style }: FermentableVarietyPickerProps) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return [];
    return fermentableLibrary
      .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 15);
  }, [search]);

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <input
        style={{
          width: '100%',
          padding: '0.6rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          color: 'white',
          fontWeight: 'bold',
          outline: 'none'
        }}
        value={isOpen ? search : value}
        placeholder={value || "Search fermentables..."}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => {
          setIsOpen(true);
          onFocus?.();
        }}
        onBlur={() => {
          // Small delay to allow clicking items
          setTimeout(() => {
            setIsOpen(false);
            setSearch('');
            onBlur?.();
          }, 200);
        }}
      />
      {isOpen && search && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '6px',
          marginTop: '4px',
          maxHeight: '250px',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {filtered.length > 0 ? (
            filtered.map(f => (
              <div
                key={f.id}
                onClick={() => onChange(f)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '0.85rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontWeight: 'bold', color: 'white' }}>{f.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {f.category} | {f.yield} PPG | {f.color} SRM
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>No ingredients found.</div>
          )}
        </div>
      )}
    </div>
  );
};

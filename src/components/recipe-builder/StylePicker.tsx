import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';
import type { BeerStyle } from '../../types/brewing';

interface StylePickerProps {
  value: string;
  styles: BeerStyle[];
  onChange: (id: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
}

export const StylePicker: React.FC<StylePickerProps> = ({ value, styles, onChange, onFocus, onBlur, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeStyle = styles.find(s => s.id === value);
  const [search, setSearch] = useState(activeStyle ? activeStyle.name : '');
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (activeStyle) {
      setSearch(activeStyle.name);
    }
  }, [activeStyle]);

  const filteredStyles = useMemo(() => {
    if (!search || (activeStyle && search === activeStyle.name && !isOpen)) return styles.slice(0, 50);
    const s = search.toLowerCase();
    return styles
      .filter(style => 
        style.name.toLowerCase().includes(s) || 
        style.id.toLowerCase().includes(s) ||
        style.category.toLowerCase().includes(s)
      )
      .slice(0, 50);
  }, [search, styles, activeStyle, isOpen]);

  const updateCoords = () => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 300)
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
    color: 'inherit',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    ...style
  };

  const dropdown = isOpen ? createPortal(
    <div style={{
      position: 'absolute',
      top: coords.top + 4,
      left: coords.left,
      width: coords.width,
      backgroundColor: '#1a1a1a',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
      zIndex: 1000,
      maxHeight: '400px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {filteredStyles.map(s => (
        <div
          key={s.id}
          style={{
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: s.id === value ? 'rgba(255,179,0,0.1)' : 'transparent'
          }}
          onMouseDown={() => {
            onChange(s.id);
            setSearch(s.name);
            setIsOpen(false);
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = s.id === value ? 'rgba(255,179,0,0.15)' : 'rgba(255,255,255,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = s.id === value ? 'rgba(255,179,0,0.1)' : 'transparent'}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: s.id === value ? 'var(--accent-primary)' : 'inherit' }}>
              {s.id} - {s.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.category}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
             <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
               {s.stats.og.min.toFixed(3)}-{s.stats.og.max.toFixed(3)}
             </span>
          </div>
        </div>
      ))}
      {filteredStyles.length === 0 && (
        <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>
          No styles found matching "{search}"
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={inputContainerRef} style={{ position: 'relative', width: '100%' }}>
      <Search 
        size={16} 
        style={{ 
          position: 'absolute', 
          left: '0.8rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          opacity: 0.4,
          pointerEvents: 'none'
        }} 
      />
      
      <input
        style={inputStyle}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          onFocus?.();
        }}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false);
            if (activeStyle && search !== activeStyle.name) {
               setSearch(activeStyle.name);
            }
            onBlur?.();
          }, 200);
        }}
        placeholder="Search BJCP/BA Styles..."
      />

      <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {search && (
          <X 
            size={14} 
            style={{ opacity: 0.4, cursor: 'pointer' }}
            onMouseDown={(e) => {
              e.preventDefault();
              setSearch('');
              setIsOpen(true);
            }}
          />
        )}
        <ChevronDown size={16} style={{ opacity: 0.4, cursor: 'pointer' }} onMouseDown={(e) => {
           e.preventDefault();
           setIsOpen(!isOpen);
        }} />
      </div>

      {dropdown}
    </div>
  );
};

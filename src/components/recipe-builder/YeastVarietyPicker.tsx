import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { yeasts } from '../../data/yeasts';
import type { YeastVariety } from '../../types/brewing';
import { CustomYeastModal } from './CustomYeastModal';
import { Search, Plus, X } from 'lucide-react';

interface YeastVarietyPickerProps {
  value: string;
  onChange: (variety: YeastVariety) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
}

export const YeastVarietyPicker: React.FC<YeastVarietyPickerProps> = ({ value, onChange, onFocus, onBlur, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const filteredYeasts = useMemo(() => {
    if (!search) return yeasts.slice(0, 50);
    return yeasts
      .filter(y => y.name.toLowerCase().includes(search.toLowerCase()) || y.brand.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [search]);

  const updateCoords = () => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 250)
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
    border: '1px solid transparent',
    borderRadius: '4px',
    padding: '0.5rem 1.75rem 0.5rem 30px',
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
      zIndex: 100,
      maxHeight: '300px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {filteredYeasts.map(y => (
        <div
          key={`${y.name}-${y.brand}`}
          style={{
            padding: '0.6rem 1rem',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
          onMouseDown={() => {
            onChange(y);
            setSearch(y.name);
            setIsOpen(false);
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{y.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{y.brand} • {y.attenuation.avg}% Atten.</div>
          </div>
          {y.tags && y.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {y.tags.slice(0, 2).map(t => (
                <span key={t} style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', color: 'var(--text-muted)' }}>
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <div
        style={{
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'black',
          backgroundColor: 'var(--accent-primary)',
          borderTop: '1px solid var(--border-color)',
          position: 'sticky',
          bottom: 0,
          whiteSpace: 'nowrap'
        }}
        onMouseDown={() => {
          setShowCustomModal(true);
          setIsOpen(false);
        }}
        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
      >
        <Plus size={14} />
        <span style={{ fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {filteredYeasts.length === 0 ? `Create custom "${search}"...` : 'Add custom strain...'}
        </span>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={inputContainerRef} style={{ position: 'relative', width: '100%' }}>
      <Search 
        size={14} 
        style={{ 
          position: 'absolute', 
          left: '0.7rem', 
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
            onBlur?.();
          }, 200);
        }}
        placeholder="Search yeast strains..."
      />

      {search && (
        <X 
          size={14} 
          style={{ 
            position: 'absolute', 
            right: '0.5rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            opacity: 0.4, 
            cursor: 'pointer' 
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setSearch('');
            setIsOpen(true);
          }}
        />
      )}

      {dropdown}

      {showCustomModal && (
        <CustomYeastModal 
          initialName={search}
          onClose={() => setShowCustomModal(false)}
          onSave={(v) => {
            onChange(v);
            setSearch(v.name);
            setShowCustomModal(false);
          }}
        />
      )}
    </div>
  );
};

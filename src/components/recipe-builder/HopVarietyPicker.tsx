import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { hops } from '../../data/hops';
import type { HopVariety } from '../../types/brewing';
import { CustomHopModal } from './CustomHopModal';
import { Search, Plus, X } from 'lucide-react';

interface HopVarietyPickerProps {
  value: string;
  onChange: (variety: HopVariety) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
}

export const HopVarietyPicker: React.FC<HopVarietyPickerProps> = ({ value, onChange, onFocus, onBlur, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const filteredHops = useMemo(() => {
    if (!search) return hops.slice(0, 50);
    return hops
      .filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [search]);

  const updateCoords = () => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 250) // min-width: 250px as requested
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
    padding: '0.5rem 1.75rem 0.5rem 30px', // padding-left: 30px as requested
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
      position: 'absolute', // position: absolute as requested
      top: coords.top + 4,
      left: coords.left,
      width: coords.width,
      backgroundColor: '#1a1a1a',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
      zIndex: 50, // z-index: 50 as requested
      maxHeight: '300px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {filteredHops.map(h => (
        <div
          key={`${h.name}-${h.country}`}
          style={{
            padding: '0.6rem 1rem',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex', // flexbox as requested
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
          onMouseDown={() => {
            onChange(h);
            setSearch(h.name);
            setIsOpen(false);
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.country}</div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {h.alphaAcid.avg}% AA
          </span>
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
          {filteredHops.length === 0 ? `Create custom "${search}"...` : 'Add custom variety...'}
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
        placeholder="Search hops..."
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
        <CustomHopModal 
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

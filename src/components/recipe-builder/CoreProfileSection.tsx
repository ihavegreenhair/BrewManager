import React from 'react';
import type { BrewMethod, BeerStyle } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { StylePicker } from './StylePicker';

interface CoreProfileSectionProps {
  name: string;
  setName: (n: string) => void;
  author: string;
  setAuthor: (a: string) => void;
  version: string;
  setVersion: (v: string) => void;
  brewMethod: BrewMethod;
  setBrewMethod: (m: BrewMethod) => void;
  selectedStyleId: string;
  handleStyleSelect: (id: string) => void;
  allStyles: BeerStyle[];
  collapsed: boolean;
  onToggle: (s: string) => void;
}

const CoreProfileSectionComponent = ({
  name, setName, author, setAuthor, version, setVersion, brewMethod, setBrewMethod,
  selectedStyleId, handleStyleSelect, allStyles,
  collapsed, onToggle
}: CoreProfileSectionProps) => {

  const activeStyle = allStyles.find(s => s.id === selectedStyleId);
  const summary = `${name || 'Unnamed'} • ${activeStyle ? activeStyle.name : 'No Style'} • ${brewMethod}`;

  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.4rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem', color: 'inherit', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
      <SectionHeader title="Core Profile" section="core" collapsed={collapsed} onToggle={onToggle} summary={summary} />
      
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Recipe Name</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Citra IPA" />
            </div>
            <div>
              <label style={labelStyle}>Author</label>
              <input style={inputStyle} value={author} onChange={e => setAuthor(e.target.value)} placeholder="BrewManager User" />
            </div>
            <div>
              <label style={labelStyle}>Version</label>
              <input style={inputStyle} value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Brew Method</label>
              <select style={{ ...inputStyle, background: 'var(--bg-main)', cursor: 'pointer' }} value={brewMethod} onChange={e => setBrewMethod(e.target.value as BrewMethod)}>
                <option value="All Grain">All Grain</option>
                <option value="Extract">Extract</option>
                <option value="Partial Mash">Partial Mash</option>
                <option value="BIAB">BIAB</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Style Target</label>
              <StylePicker 
                value={selectedStyleId}
                styles={allStyles}
                onChange={handleStyleSelect}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export const CoreProfileSection = React.memo(CoreProfileSectionComponent);

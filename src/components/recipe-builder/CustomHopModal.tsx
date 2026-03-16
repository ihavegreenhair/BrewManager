import React, { useState } from 'react';
import type { HopVariety } from '../../types/brewing';

interface CustomHopModalProps {
  onClose: () => void;
  onSave: (variety: HopVariety) => void;
  initialName?: string;
}

export const CustomHopModal: React.FC<CustomHopModalProps> = ({ onClose, onSave, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const [alpha, setAlpha] = useState(10);
  const [totalOils, setTotalOils] = useState(1.5);
  const [myrcene, setMyrcene] = useState(40);
  const [humulene, setHumulene] = useState(20);
  const [caryophyllene, setCaryophyllene] = useState(10);
  const [farnesene, setFarnesene] = useState(1);
  const [flavorProfile, setFlavorProfile] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const labelStyle: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.4rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.6rem', color: 'inherit', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };

  const handleSave = () => {
    const variety: HopVariety = {
      name,
      purpose: 'Dual',
      country: 'Custom',
      alphaAcid: { range: [alpha, alpha], avg: alpha },
      betaAcid: { range: [0, 0], avg: 0 },
      coHumulone: { range: [0, 0], avg: 0 },
      totalOils: { range: [totalOils, totalOils], avg: totalOils },
      oilBreakdown: {
        myrcene: { range: [myrcene, myrcene], avg: myrcene },
        humulene: { range: [humulene, humulene], avg: humulene },
        caryophyllene: { range: [caryophyllene, caryophyllene], avg: caryophyllene },
        farnesene: { range: [farnesene, farnesene], avg: farnesene },
        other: 100 - (myrcene + humulene + caryophyllene + farnesene)
      },
      flavorProfile,
      tags,
      substitutes: []
    };
    onSave(variety);
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag.toLowerCase().replace(/\s+/g, '_')]);
      setNewTag('');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>Define Custom Hop</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Hop Variety Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Secret Hop" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Alpha Acid %</label>
              <input type="number" style={inputStyle} value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} />
            </div>
            <div>
              <label style={labelStyle}>Total Oils (mL/100g)</label>
              <input type="number" step="0.1" style={inputStyle} value={totalOils} onChange={e => setTotalOils(parseFloat(e.target.value))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Oil Breakdown (%)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
              <div>
                <label style={{ ...labelStyle, textTransform: 'none', color: 'var(--text-secondary)' }}>Myrcene</label>
                <input type="number" style={{ ...inputStyle, padding: '0.4rem' }} value={myrcene} onChange={e => setMyrcene(parseFloat(e.target.value))} />
              </div>
              <div>
                <label style={{ ...labelStyle, textTransform: 'none', color: 'var(--text-secondary)' }}>Humulene</label>
                <input type="number" style={{ ...inputStyle, padding: '0.4rem' }} value={humulene} onChange={e => setHumulene(parseFloat(e.target.value))} />
              </div>
              <div>
                <label style={{ ...labelStyle, textTransform: 'none', color: 'var(--text-secondary)' }}>Caryophyllene</label>
                <input type="number" style={{ ...inputStyle, padding: '0.4rem' }} value={caryophyllene} onChange={e => setCaryophyllene(parseFloat(e.target.value))} />
              </div>
              <div>
                <label style={{ ...labelStyle, textTransform: 'none', color: 'var(--text-secondary)' }}>Farnesene</label>
                <input type="number" style={{ ...inputStyle, padding: '0.4rem' }} value={farnesene} onChange={e => setFarnesene(parseFloat(e.target.value))} />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Flavor Profile</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }} 
              value={flavorProfile} 
              onChange={e => setFlavorProfile(e.target.value)} 
              placeholder="Describe the flavor and aroma..." 
            />
          </div>

          <div>
            <label style={labelStyle}>Descriptive Tags</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                style={inputStyle} 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                placeholder="e.g. citrus, pine..." 
                onKeyDown={e => e.key === 'Enter' && addTag()}
              />
              <button onClick={addTag} style={{ padding: '0 1rem', backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: 'bold', borderRadius: '4px', border: 'none' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {tags.map(t => (
                <span key={t} style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(255,179,0,0.1)', color: 'var(--accent-primary)', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  #{t.replace(/_/g, ' ')}
                  <span onClick={() => setTags(tags.filter(x => x !== t))} style={{ cursor: 'pointer', opacity: 0.6 }}>×</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '4px', fontWeight: 'bold' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--accent-primary)', border: 'none', color: 'black', borderRadius: '4px', fontWeight: 'bold' }}>Save Variety</button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { YeastVariety } from '../../types/brewing';

interface CustomYeastModalProps {
  onClose: () => void;
  onSave: (variety: YeastVariety) => void;
  initialName?: string;
}

export const CustomYeastModal: React.FC<CustomYeastModalProps> = ({ onClose, onSave, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState('Custom');
  const [attenuation, setAttenuation] = useState(75);
  const [flocculation, setFlocculation] = useState('Medium');
  const [alcoholTolerance, setAlcoholTolerance] = useState(10);
  const [tempMin, setTempMin] = useState(64);
  const [tempMax, setTempMax] = useState(72);
  const [flavorProfile, setFlavorProfile] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const labelStyle: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.4rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.6rem', color: 'inherit', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };

  const handleSave = () => {
    const variety: YeastVariety = {
      name,
      brand,
      type: 'Yeast',
      form: 'Liquid',
      species: 'Saccharomyces cerevisiae',
      attenuation: { range: [attenuation, attenuation], avg: attenuation },
      flocculation,
      alcoholTolerance,
      tempRange: {
        f: [tempMin, tempMax],
        c: [Math.round((tempMin - 32) * 5 / 9), Math.round((tempMax - 32) * 5 / 9)]
      },
      description: '',
      styles: [],
      flavorProfile,
      tags,
      characteristicScores: {
        fruity: 3,
        spicy: 1,
        maltiness: 3,
        clean: 3,
        funky: 0
      }
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
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>Define Custom Yeast</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Strain Name</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My House Yeast" />
            </div>
            <div>
              <label style={labelStyle}>Brand</label>
              <input style={inputStyle} value={brand} onChange={e => setBrand(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Atten. %</label>
              <input type="number" style={inputStyle} value={attenuation} onChange={e => setAttenuation(parseFloat(e.target.value))} />
            </div>
            <div>
              <label style={labelStyle}>Flocculation</label>
              <select style={{ ...inputStyle, background: 'var(--bg-main)', cursor: 'pointer' }} value={flocculation} onChange={e => setFlocculation(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium-Low">Med-Low</option>
                <option value="Medium">Medium</option>
                <option value="Medium-High">Med-High</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>ABV Tol. %</label>
              <input type="number" style={inputStyle} value={alcoholTolerance} onChange={e => setAlcoholTolerance(parseFloat(e.target.value))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Temperature Range (°F)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="number" style={inputStyle} value={tempMin} onChange={e => setTempMin(parseFloat(e.target.value))} />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input type="number" style={inputStyle} value={tempMax} onChange={e => setTempMax(parseFloat(e.target.value))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Flavor Profile</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }} 
              value={flavorProfile} 
              onChange={e => setFlavorProfile(e.target.value)} 
              placeholder="Describe the flavor and aroma contribution..." 
            />
          </div>

          <div>
            <label style={labelStyle}>Descriptive Tags</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                style={inputStyle} 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                placeholder="e.g. banana, spicy, clean..." 
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

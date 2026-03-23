import React from 'react';
import type { FermenterEntity, YeastVariety } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { YeastVarietyPicker } from './YeastVarietyPicker';
import { RecipeYeastProfile } from './RecipeYeastProfile';
import { yeasts as allYeasts } from '../../data/yeasts';

interface YeastPitchSectionProps {
  primaryFermenter: FermenterEntity;
  setPrimaryFermenter: (f: (prev: FermenterEntity) => FermenterEntity) => void;
  collapsed: boolean;
  onToggle: (s: string) => void;
}

const YeastPitchSectionComponent = ({
  primaryFermenter, setPrimaryFermenter, collapsed, onToggle
}: YeastPitchSectionProps) => {

  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid transparent', borderRadius: '6px', padding: '0.5rem', color: 'inherit', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = 'var(--accent-primary)';
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = 'transparent';

  const addYeast = () => {
    setPrimaryFermenter(prev => ({
      ...prev, 
      yeast: [...prev.yeast, { 
        id: crypto.randomUUID(), 
        name: '', 
        attenuation: 75, 
        type: 'ale', 
        form: 'liquid' 
      }]
    }));
  };

  const updateYeast = (id: string, updates: any) => {
    setPrimaryFermenter(prev => ({
      ...prev,
      yeast: prev.yeast.map(y => y.id === id ? { ...y, ...updates } : y)
    }));
  };

  const handleVarietyChange = (id: string, variety: YeastVariety) => {
    const isStandard = allYeasts.some(standard => standard.name === variety.name && standard.brand === variety.brand);
    updateYeast(id, {
      name: variety.name,
      attenuation: variety.attenuation.avg,
      type: variety.type.toLowerCase().includes('lager') ? 'lager' : 'ale',
      form: variety.form.toLowerCase(),
      customVariety: isStandard ? undefined : variety
    });
  };

  const mainYeast = primaryFermenter.yeast[0]?.name || 'No Yeast';
  const avgAtten = primaryFermenter.yeast.length > 0 
    ? (primaryFermenter.yeast.reduce((acc, y) => acc + y.attenuation, 0) / primaryFermenter.yeast.length).toFixed(0)
    : 0;
  const summary = `${mainYeast}${primaryFermenter.yeast.length > 1 ? ` (+${primaryFermenter.yeast.length - 1})` : ''} • ${avgAtten}% ATTEN.`;

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
      <SectionHeader title="Yeast Pitch" section="yeast" collapsed={collapsed} onToggle={onToggle} summary={summary} />
      
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div>
              <label style={labelStyle}>Total Strains</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{primaryFermenter.yeast.length}</div>
            </div>
            <button 
              type="button" 
              onClick={addYeast}
              style={{ alignSelf: 'center', backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: 'bold', padding: '0.6rem 1.2rem', borderRadius: '6px' }}
            >
              + Add Yeast
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {primaryFermenter.yeast.map((y, idx) => (
              <div key={y.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '20px' }}>{idx + 1}</div>
                
                <div style={{ flex: 3 }}>
                  <label style={labelStyle}>Strain Name</label>
                  <YeastVarietyPicker 
                    value={y.name}
                    onChange={(v) => handleVarietyChange(y.id, v)}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Atten. %</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                      onClick={() => updateYeast(y.id, { attenuation: Math.max(0, y.attenuation - 1) })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.25rem', cursor: 'pointer' }}
                    >−</button>
                    <input 
                      type="number" 
                      className="no-spinners"
                      style={{ ...inputStyle, textAlign: 'center', padding: '0.5rem 0' }} 
                      value={y.attenuation} 
                      onChange={e => updateYeast(y.id, { attenuation: Number(e.target.value) })}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    <button 
                      onClick={() => updateYeast(y.id, { attenuation: Math.min(100, y.attenuation + 1) })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.25rem', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setPrimaryFermenter(prev => ({ ...prev, yeast: prev.yeast.filter(item => item.id !== y.id) }))}
                  style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '1.2rem', padding: '0.5rem', cursor: 'pointer', opacity: 0.6 }}
                  title="Remove Yeast"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {primaryFermenter.yeast.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              No yeast strains defined. Click "+ Add Yeast" to begin.
            </div>
          )}

          <RecipeYeastProfile 
            pitchedYeasts={primaryFermenter.yeast} 
            compact 
          />
        </div>
      )}
    </section>
  );
};

export const YeastPitchSection = React.memo(YeastPitchSectionComponent);

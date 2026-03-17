import type { FermenterEntity, FermentationStep } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { fermentationProfiles } from '../../data/profiles';
import { celsiusToFahrenheit, fahrenheitToCelsius } from '../../utils/units';

interface FermentationSectionProps {
  primaryFermenter: FermenterEntity;
  setPrimaryFermenter: (f: (prev: FermenterEntity) => FermenterEntity) => void;
  measurementSystem: 'metric' | 'imperial';
  co2Volumes: number;
  setCo2Volumes: (v: number) => void;
  collapsed: boolean;
  onToggle: (s: string) => void;
}

export const FermentationSection = ({
  primaryFermenter, setPrimaryFermenter, measurementSystem, co2Volumes, setCo2Volumes, collapsed, onToggle
}: FermentationSectionProps) => {

  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid transparent', borderRadius: '6px', padding: '0.5rem', color: 'inherit', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };
  const selectStyle: React.CSSProperties = { ...inputStyle, background: 'var(--bg-main)', cursor: 'pointer', appearance: 'none', paddingRight: '2rem' };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = 'var(--accent-primary)';
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = 'transparent';

  const addStep = () => {
    setPrimaryFermenter(prev => ({
      ...prev, 
      fermentationSteps: [...prev.fermentationSteps, { 
        id: crypto.randomUUID(), 
        name: 'Secondary', 
        stepTemp: 18, // Default 18C
        stepTime: 7 
      }]
    }));
  };

  const updateStep = (id: string, updates: Partial<FermentationStep>) => {
    setPrimaryFermenter(prev => ({
      ...prev,
      fermentationSteps: prev.fermentationSteps.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const loadProfile = (profileId: string) => {
    if (!profileId) return;
    const profile = fermentationProfiles.find(p => p.id === profileId);
    if (profile) {
      const newSteps = profile.steps.map(s => ({
        ...s,
        id: crypto.randomUUID(),
        stepTemp: s.stepTemp // Already in Celsius in data/profiles
      }));
      setPrimaryFermenter(prev => ({
        ...prev,
        fermentationSteps: newSteps as FermentationStep[]
      }));
    }
  };

  const firstStep = primaryFermenter.fermentationSteps[0];
  const totalDays = primaryFermenter.fermentationSteps.reduce((acc, s) => acc + s.stepTime, 0);
  
  const displayFirstTemp = firstStep ? (measurementSystem === 'metric' ? firstStep.stepTemp : celsiusToFahrenheit(firstStep.stepTemp)) : 0;
  
  const summary = firstStep 
    ? `${displayFirstTemp.toFixed(1)}°${measurementSystem === 'metric' ? 'C' : 'F'} • ${totalDays} DAYS TOTAL • ${co2Volumes} VOLS`
    : <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem', opacity: 0.8 }}>+ Define Fermentation</span>;

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
      <SectionHeader title="Fermentation & Packaging" section="fermentation" collapsed={collapsed} onToggle={onToggle} summary={summary} />

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <style>{`
            .ferm-packaging-row {
              display: grid;
              grid-template-columns: 1fr;
              gap: 1rem;
              margin-bottom: 1.5rem;
              padding: 1rem;
              background-color: var(--bg-main);
              border-radius: 8px;
              border: 1px solid var(--border-color);
            }
            @media (min-width: 768px) {
              .ferm-packaging-row {
                grid-template-columns: 1.5fr 1fr;
                align-items: center;
                gap: 2rem;
              }
            }
            .ferm-controls-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 1rem;
              margin-bottom: 1.5rem;
              padding: 1rem;
              background-color: var(--bg-main);
              border-radius: 8px;
              border: 1px solid var(--border-color);
            }
            @media (min-width: 1024px) {
              .ferm-controls-grid {
                grid-template-columns: 1fr 1fr auto;
                gap: 2rem;
                align-items: end;
              }
            }
            .ferm-step-card {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.75rem;
              padding: 1rem;
              background-color: rgba(255,255,255,0.02);
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.05);
            }
            @media (min-width: 768px) {
              .ferm-step-card {
                grid-template-columns: 20px 3fr 1.5fr 1.5fr 1.2fr 40px;
                align-items: center;
                gap: 1rem;
              }
            }
            .ferm-name-col { grid-column: span 2; }
            @media (min-width: 768px) { .ferm-name-col { grid-column: span 1; } }
          `}</style>
          
          {/* Packaging Row */}
          <div className="ferm-packaging-row">
            <div>
              <label style={labelStyle}>Carbonation Level</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" step="0.1" 
                  style={{ ...inputStyle, width: '70px', textAlign: 'center', border: '1px solid var(--border-color)' }} 
                  value={co2Volumes} 
                  onChange={e => setCo2Volumes(Number(e.target.value))}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.8rem' }}>VOLUMES CO2</span>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
              Tip: Higher carbonation increases the crispness and aromatic lift of the beer.
            </div>
          </div>

          {/* Controls Row */}
          <div className="ferm-controls-grid">
            <div>
              <label style={labelStyle}>Load Standard Profile</label>
              <div style={{ position: 'relative' }}>
                <select 
                  style={selectStyle} 
                  onChange={(e) => loadProfile(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  defaultValue=""
                >
                  <option value="" disabled>Select a profile...</option>
                  {fermentationProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>▼</div>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', display: 'flex', gap: '2rem' }}>
              <div>
                <label style={labelStyle}>Total Duration</label>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)', lineHeight: 1 }}>{totalDays} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DAYS</span></div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={addStep}
              style={{ alignSelf: 'center', backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: 'bold', padding: '0.65rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%' }}
            >
              + Add Custom Phase
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {primaryFermenter.fermentationSteps.map((step, idx) => (
              <div key={step.id} className="ferm-step-card">
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '20px', alignSelf: 'center' }}>{idx + 1}</div>
                
                <div className="ferm-name-col">
                  <label style={labelStyle}>Phase Name</label>
                  <input 
                    style={inputStyle} 
                    placeholder="Phase name" 
                    value={step.name} 
                    onChange={e => updateStep(step.id, { name: e.target.value })} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Temp</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    <button 
                      onClick={() => updateStep(step.id, { stepTemp: step.stepTemp - (measurementSystem === 'metric' ? 1 : 0.5555) })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                    >−</button>
                    <input 
                      type="number" 
                      className="no-spinners"
                      style={{ ...inputStyle, background: 'transparent', textAlign: 'center', padding: '0.4rem 0' }} 
                      value={Number((measurementSystem === 'metric' ? step.stepTemp : celsiusToFahrenheit(step.stepTemp)).toFixed(1))} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        updateStep(step.id, { stepTemp: measurementSystem === 'metric' ? val : fahrenheitToCelsius(val) });
                      }}
                    />
                    <button 
                      onClick={() => updateStep(step.id, { stepTemp: step.stepTemp + (measurementSystem === 'metric' ? 1 : 0.5555) })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Pressure</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    <button 
                      onClick={() => updateStep(step.id, { pressure: Math.max(0, (step.pressure || 0) - 1) })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                    >−</button>
                    <input 
                      type="number" 
                      className="no-spinners"
                      style={{ ...inputStyle, background: 'transparent', textAlign: 'center', padding: '0.4rem 0' }} 
                      value={step.pressure || 0} 
                      onChange={e => updateStep(step.id, { pressure: Number(e.target.value) })}
                    />
                    <button 
                      onClick={() => updateStep(step.id, { pressure: (step.pressure || 0) + 1 })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Days</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    <button 
                      onClick={() => updateStep(step.id, { stepTime: Math.max(0, step.stepTime - 1) })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                    >−</button>
                    <input 
                      type="number" 
                      className="no-spinners"
                      style={{ ...inputStyle, background: 'transparent', textAlign: 'center', padding: '0.4rem 0' }} 
                      value={step.stepTime} 
                      onChange={e => updateStep(step.id, { stepTime: Number(e.target.value) })}
                    />
                    <button 
                      onClick={() => updateStep(step.id, { stepTime: step.stepTime + 1 })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => setPrimaryFermenter(prev => ({ ...prev, fermentationSteps: prev.fermentationSteps.filter(s => s.id !== step.id) }))}
                    style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '1.4rem', padding: '0.4rem', cursor: 'pointer', opacity: 0.6 }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {primaryFermenter.fermentationSteps.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              No fermentation steps defined. Select a profile above or click "+ Add Custom Phase" to begin.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

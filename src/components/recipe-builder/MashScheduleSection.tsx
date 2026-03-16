import { useMemo } from 'react';
import type { MashStep } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { mashProfiles } from '../../data/profiles';
import { celsiusToFahrenheit, fahrenheitToCelsius } from '../../utils/units';

interface MashScheduleSectionProps {
  mashSteps: MashStep[];
  setMashSteps: (steps: MashStep[]) => void;
  measurementSystem: 'metric' | 'imperial';
  collapsed: boolean;
  onToggle: (s: string) => void;
}

export const MashScheduleSection = ({
  mashSteps, setMashSteps, measurementSystem, collapsed, onToggle
}: MashScheduleSectionProps) => {

  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid transparent', borderRadius: '6px', padding: '0.5rem', color: 'inherit', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };
  const selectStyle: React.CSSProperties = { ...inputStyle, background: 'var(--bg-main)', cursor: 'pointer', appearance: 'none', paddingRight: '2rem' };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = 'var(--accent-primary)';
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = 'transparent';

  const addStep = () => {
    const lastStep = mashSteps[mashSteps.length - 1];
    const newTemp = lastStep ? lastStep.stepTemp + 5 : (measurementSystem === 'metric' ? 65 : 150);
    setMashSteps([...mashSteps, { 
      id: crypto.randomUUID(), 
      name: `Step ${mashSteps.length + 1}`, 
      type: 'temperature', 
      stepTemp: newTemp, 
      stepTime: 60 
    }]);
  };

  const updateStep = (id: string, updates: Partial<MashStep>) => {
    setMashSteps(mashSteps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const loadProfile = (profileId: string) => {
    if (!profileId) return;
    const profile = mashProfiles.find(p => p.id === profileId);
    if (profile) {
      const isMetric = measurementSystem === 'metric';
      const newSteps = profile.steps.map(s => ({
        ...s,
        id: crypto.randomUUID(),
        stepTemp: isMetric ? s.stepTemp : Math.round(celsiusToFahrenheit(s.stepTemp))
      }));
      setMashSteps(newSteps as MashStep[]);
    }
  };

  const calculateRampTime = (step: MashStep, index: number, steps: MashStep[]) => {
    if (step.rampTime !== undefined && step.rampTime !== null && step.rampTime.toString() !== '') {
      return Number(step.rampTime);
    }
    if (index === 0) return 0;
    
    const prevStep = steps[index - 1];
    const prevTempC = measurementSystem === 'metric' ? prevStep.stepTemp : fahrenheitToCelsius(prevStep.stepTemp);
    const currentTempC = measurementSystem === 'metric' ? step.stepTemp : fahrenheitToCelsius(step.stepTemp);
    
    if (currentTempC <= prevTempC) return 0;
    
    // Auto-calculate default assuming 1°C per minute heating rate
    return Math.round(currentTempC - prevTempC);
  };

  const getStepDescription = (tempValue: number) => {
    const tempC = measurementSystem === 'metric' ? tempValue : fahrenheitToCelsius(tempValue);
    if (tempC < 45) return "Acid / Glucan Rest: Lowers pH and breaks down gummy beta-glucans to prevent a stuck mash.";
    if (tempC < 60) return "Protein Rest: Breaks down large proteins to improve head retention and reduce chill haze.";
    if (tempC < 66) return "Beta-Amylase Rest: Creates highly fermentable sugars, driving a higher ABV and a crisp, dry finish.";
    if (tempC < 68) return "Balanced Saccharification: Yields an even mix of fermentable sugars and unfermentable dextrins for a medium body.";
    if (tempC < 73) return "Alpha-Amylase Rest: Leaves complex unfermentable dextrins, driving sweetness and a full, chewy mouthfeel.";
    if (tempC < 95) return "Mash Out: Denatures enzymes to lock in the sugar profile and thins the wort to improve lauter efficiency.";
    return "Decoction Boil: Triggers Maillard reactions, deepening color and driving rich, bready, or toasty melanoidin flavors.";
  };

  const mashNarrative = useMemo(() => {
    if (mashSteps.length === 0) return null;

    let betaTime = 0;
    let alphaTime = 0;
    let totalSaccTime = 0;
    let weightedSaccTemp = 0;
    
    mashSteps.forEach(step => {
      const tempC = measurementSystem === 'metric' ? step.stepTemp : fahrenheitToCelsius(step.stepTemp);
      if (tempC >= 55 && tempC < 65) {
        betaTime += step.stepTime;
        totalSaccTime += step.stepTime;
        weightedSaccTemp += tempC * step.stepTime;
      } else if (tempC >= 65 && tempC < 68) {
        totalSaccTime += step.stepTime;
        weightedSaccTemp += tempC * step.stepTime;
      } else if (tempC >= 68 && tempC < 74) {
        alphaTime += step.stepTime;
        totalSaccTime += step.stepTime;
        weightedSaccTemp += tempC * step.stepTime;
      }
    });

    let outcome = "Expect a balanced, medium-bodied beer with moderate fermentability.";
    let estFerm = 75;

    if (totalSaccTime > 0) {
      const avgSaccTemp = weightedSaccTemp / totalSaccTime;
      // Map 60C -> 85%, 72C -> 65% roughly
      estFerm = 85 - ((avgSaccTemp - 60) * (20 / 12));
      estFerm = Math.max(60, Math.min(90, Math.round(estFerm)));

      if (estFerm > 80) {
        outcome = "Expect a crisp, dry, highly attenuated beer with a lighter body.";
      } else if (estFerm < 70) {
        outcome = "Expect a sweet, full-bodied beer with a rich, chewy mouthfeel.";
      } else {
        outcome = "Expect a balanced, medium-bodied beer with an even mix of fermentability and structure.";
      }
    } else {
      outcome = "Warning: No saccharification rest detected. Starches will not fully convert to fermentable sugars.";
      estFerm = 0;
    }

    return { outcome, estFerm };
  }, [mashSteps, measurementSystem]);

  const totalTime = mashSteps.reduce((acc, step, idx) => acc + step.stepTime + calculateRampTime(step, idx, mashSteps), 0);
  
  const summary = mashSteps.length > 0 ? (
    `${totalTime} MIN • EST. FERMENTABILITY: ${mashNarrative?.estFerm}%`
  ) : (
    <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem', opacity: 0.8 }}>+ Add Mash Steps</span>
  );

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
      <SectionHeader title="Mash Schedule" section="mash" collapsed={collapsed} onToggle={onToggle} summary={summary} />

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          
          {mashNarrative && (
            <div style={{ marginBottom: '1.5rem', padding: '1.2rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1rem' }}>⚡</span> WORT PROFILE ANALYSIS
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                <strong style={{ color: 'white' }}>The Outcome:</strong> {mashNarrative.outcome}
              </p>
            </div>
          )}

          {/* Controls Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '2rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
            <div>
              <label style={labelStyle}>Load Standard Profile</label>
              <div style={{ position: 'relative' }}>
                <select 
                  style={{ ...selectStyle, padding: '0.4rem 2rem 0.4rem 0.5rem' }} 
                  onChange={(e) => loadProfile(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  defaultValue=""
                >
                  <option value="" disabled>Select a profile...</option>
                  {mashProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>▼</div>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Total Mash Time</label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{totalTime}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>MIN</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Est. Fermentability</label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{mashNarrative?.estFerm || 0}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>%</span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={addStep}
              style={{ backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: 'bold', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', height: 'fit-content' }}
            >
              + Add Custom Step
            </button>
          </div>

          {/* Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mashSteps.map((step, idx) => {
              const rampTimeDisplay = calculateRampTime(step, idx, mashSteps);
              
              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {/* Top Half: Inputs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '20px' }}>{idx + 1}</div>
                    
                    <div style={{ flex: 3 }}>
                      <label style={labelStyle}>Step Name</label>
                      <input 
                        style={inputStyle} 
                        placeholder="e.g. Saccharification" 
                        value={step.name} 
                        onChange={e => updateStep(step.id, { name: e.target.value })} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Temp (°{measurementSystem === 'metric' ? 'C' : 'F'})</label>
                      <input 
                        type="number" 
                        className="no-spinners"
                        style={{ ...inputStyle, textAlign: 'right' }} 
                        value={step.stepTemp} 
                        onChange={e => updateStep(step.id, { stepTemp: Number(e.target.value) })}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Time (Min)</label>
                      <input 
                        type="number" 
                        className="no-spinners"
                        style={{ ...inputStyle, textAlign: 'right' }} 
                        value={step.stepTime} 
                        onChange={e => updateStep(step.id, { stepTime: Number(e.target.value) })}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Ramp (Min)</label>
                      <input 
                        type="number" 
                        className="no-spinners"
                        style={{ ...inputStyle, textAlign: 'right', color: step.rampTime === undefined || step.rampTime === null || step.rampTime.toString() === '' ? 'var(--text-muted)' : 'inherit' }} 
                        value={step.rampTime !== undefined && step.rampTime !== null ? step.rampTime : ''} 
                        placeholder={rampTimeDisplay.toString()}
                        onChange={e => updateStep(step.id, { rampTime: e.target.value === '' ? undefined : Number(e.target.value) })}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        title="Time to heat to this step. Auto-calculates at 1°C/min if blank."
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: '0.2rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setMashSteps(mashSteps.filter(s => s.id !== step.id))}
                        style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '1.2rem', padding: '0.5rem', cursor: 'pointer', opacity: 0.6 }}
                        title="Remove Step"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Bottom Half: Contextual Description */}
                  <div style={{ paddingLeft: 'calc(20px + 1rem)', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {getStepDescription(step.stepTemp)}
                  </div>
                </div>
              );
            })}
          </div>

          {mashSteps.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              No mash steps defined. Select a profile above or click "+ Add Custom Step" to begin.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

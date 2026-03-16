import { useState } from 'react';
import { calculateABV } from '../utils/brewingMath';

export const Calculators = () => {
  // ABV Calculator State
  const [og, setOg] = useState(1.050);
  const [fg, setFg] = useState(1.010);

  // Strike Water State
  const [grainWeight, setGrainWeight] = useState(10); // lbs
  const [targetMashTemp, setTargetMashTemp] = useState(152); // F
  const [grainTemp, setGrainTemp] = useState(70); // F
  const [waterToGrainRatio, setWaterToGrainRatio] = useState(1.5); // qts/lb

  // Strike water formula:
  // Strike Temp = (0.2 / Ratio) * (TargetMashTemp - GrainTemp) + TargetMashTemp
  const strikeTemp = (0.2 / waterToGrainRatio) * (targetMashTemp - grainTemp) + targetMashTemp;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Brewing Calculators</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* ABV Calculator */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            ABV Calculator
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Original Gravity (OG)</label>
              <input type="number" step="0.001" style={{ width: '100%' }} value={og} onChange={e => setOg(Number(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Final Gravity (FG)</label>
              <input type="number" step="0.001" style={{ width: '100%' }} value={fg} onChange={e => setFg(Number(e.target.value))} />
            </div>
            
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated ABV</span>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {calculateABV(og, fg)}%
              </div>
            </div>
          </div>
        </div>

        {/* Strike Water Calculator */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Strike Water Temperature
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grain Weight (lbs)</label>
              <input type="number" style={{ width: '100%' }} value={grainWeight} onChange={e => setGrainWeight(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Mash (°F)</label>
                <input type="number" style={{ width: '100%' }} value={targetMashTemp} onChange={e => setTargetMashTemp(Number(e.target.value))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grain Temp (°F)</label>
                <input type="number" style={{ width: '100%' }} value={grainTemp} onChange={e => setGrainTemp(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Thickness (qts/lb)</label>
              <input type="number" step="0.1" style={{ width: '100%' }} value={waterToGrainRatio} onChange={e => setWaterToGrainRatio(Number(e.target.value))} />
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Strike Temp Target</span>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {strikeTemp.toFixed(1)}°F
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

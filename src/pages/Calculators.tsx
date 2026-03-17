import { useState } from 'react';
import { calculateABV } from '../utils/brewingMath';
import { useBrewStore } from '../store/useBrewStore';

export const Calculators = () => {
  const { measurementSystem } = useBrewStore();
  const isMetric = measurementSystem === 'metric';

  // ABV Calculator State
  const [og, setOg] = useState(1.050);
  const [fg, setFg] = useState(1.010);

  // Strike Water State
  const [grainWeight, setGrainWeight] = useState(isMetric ? 5 : 10); // kg or lbs
  const [targetMashTemp, setTargetMashTemp] = useState(isMetric ? 67 : 152); // C or F
  const [grainTemp, setGrainTemp] = useState(isMetric ? 20 : 70); // C or F
  const [waterToGrainRatio, setWaterToGrainRatio] = useState(isMetric ? 3 : 1.5); // L/kg or qts/lb

  // Strike water formula:
  // Imperial: Strike Temp = (0.2 / Ratio) * (TargetMashTemp - GrainTemp) + TargetMashTemp
  // Metric: Strike Temp = (0.41 / Ratio) * (TargetMashTemp - GrainTemp) + TargetMashTemp
  const ratioConstant = isMetric ? 0.41 : 0.2;
  const strikeTemp = (ratioConstant / waterToGrainRatio) * (targetMashTemp - grainTemp) + targetMashTemp;

  const tempUnit = isMetric ? '°C' : '°F';
  const weightUnit = isMetric ? 'kg' : 'lbs';
  const ratioUnit = isMetric ? 'L/kg' : 'qts/lb';

  return (
    <div className="calculators-container">
      <style>{`
        .calculators-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .calculators-header {
          margin-bottom: 2rem;
        }
        .calculators-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .calculators-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }
        .calc-card {
          background-color: var(--bg-surface);
          padding: 1.5rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }
        .calc-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color: var(--accent-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .input-row {
          display: flex;
          gap: 1rem;
        }
        .input-field {
          flex: 1;
        }
        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .result-box {
          margin-top: 1rem;
          padding: 1rem;
          background-color: var(--bg-main);
          border-radius: var(--border-radius);
          text-align: center;
        }
        .result-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .result-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-primary);
          font-family: var(--font-mono);
        }
      `}</style>
      
      <div className="calculators-header">
        <h2 style={{ marginBottom: '0.5rem' }}>Brewing Calculators</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Quick tools for day-of calculations.</p>
      </div>

      <div className="calculators-grid">
        {/* ABV Calculator */}
        <div className="calc-card">
          <h3 className="calc-title">ABV Calculator</h3>
          <div className="input-group">
            <div className="input-field">
              <label className="input-label">Original Gravity (OG)</label>
              <input type="number" step="0.001" style={{ width: '100%' }} value={og} onChange={e => setOg(Number(e.target.value))} />
            </div>
            <div className="input-field">
              <label className="input-label">Final Gravity (FG)</label>
              <input type="number" step="0.001" style={{ width: '100%' }} value={fg} onChange={e => setFg(Number(e.target.value))} />
            </div>
            
            <div className="result-box">
              <span className="result-label">Estimated ABV</span>
              <div className="result-value">
                {calculateABV(og, fg)}%
              </div>
            </div>
          </div>
        </div>

        {/* Strike Water Calculator */}
        <div className="calc-card">
          <h3 className="calc-title">Strike Water Temperature</h3>
          <div className="input-group">
            <div className="input-field">
              <label className="input-label">Grain Weight ({weightUnit})</label>
              <input type="number" style={{ width: '100%' }} value={grainWeight} onChange={e => setGrainWeight(Number(e.target.value))} />
            </div>
            <div className="input-row">
              <div className="input-field">
                <label className="input-label">Target Mash ({tempUnit})</label>
                <input type="number" style={{ width: '100%' }} value={targetMashTemp} onChange={e => setTargetMashTemp(Number(e.target.value))} />
              </div>
              <div className="input-field">
                <label className="input-label">Grain Temp ({tempUnit})</label>
                <input type="number" style={{ width: '100%' }} value={grainTemp} onChange={e => setGrainTemp(Number(e.target.value))} />
              </div>
            </div>
            <div className="input-field">
              <label className="input-label">Thickness ({ratioUnit})</label>
              <input type="number" step="0.1" style={{ width: '100%' }} value={waterToGrainRatio} onChange={e => setWaterToGrainRatio(Number(e.target.value))} />
            </div>

            <div className="result-box">
              <span className="result-label">Strike Temp Target</span>
              <div className="result-value">
                {strikeTemp.toFixed(1)}{tempUnit}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

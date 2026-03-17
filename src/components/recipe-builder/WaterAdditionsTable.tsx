import React, { useState } from 'react';
import { useBrewStore } from '../../store/useBrewStore';
import { gramsToOz, ozToGrams } from '../../utils/units';

interface WaterAdditionsTableProps {
  saltAdditionPosition: 'split' | 'mash_only' | 'kettle_only';
  handleSaltStrategyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  saltCalculationMode: 'auto' | 'manual';
  setSaltCalculationMode: (v: 'auto' | 'manual') => void;
  manualSaltAdditions: { gypsum: number; cacl2: number; epsom: number; bakingSoda: number };
  setManualSaltAdditions: (v: { gypsum: number; cacl2: number; epsom: number; bakingSoda: number }) => void;
  totalSaltMath: any;
  mashSaltMathSplit: any;
  spargeSaltMathSplit: any;
}

export const WaterAdditionsTable = ({
  saltAdditionPosition, handleSaltStrategyChange,
  saltCalculationMode, setSaltCalculationMode,
  manualSaltAdditions, setManualSaltAdditions,
  totalSaltMath, mashSaltMathSplit, spargeSaltMathSplit
}: WaterAdditionsTableProps) => {

  const { measurementSystem } = useBrewStore();
  const isMetric = measurementSystem === 'metric';
  const unit = isMetric ? 'g' : 'oz';

  const [activeSalt, setActiveSalt] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string>('');

  const handleFocus = (salt: string, currentVal: number) => {
    setActiveSalt(salt);
    const displayVal = isMetric ? currentVal : gramsToOz(currentVal);
    setLocalValue(displayVal === 0 ? '' : displayVal.toFixed(2));
  };

  const handleBlur = () => {
    setActiveSalt(null);
  };

  const handleSaltInput = (salt: keyof typeof manualSaltAdditions, valStr: string) => {
    setLocalValue(valStr);
    
    // Allow empty string or ending in decimal for smooth typing, but parse it for the math engine
    const numValue = valStr === '' ? 0 : parseFloat(valStr) || 0;
    const valueGrams = isMetric ? numValue : ozToGrams(numValue);
    
    if (saltCalculationMode === 'auto') {
      setSaltCalculationMode('manual');
      setManualSaltAdditions({
        gypsum: totalSaltMath.additions.gypsum,
        cacl2: totalSaltMath.additions.cacl2,
        epsom: totalSaltMath.additions.epsom,
        bakingSoda: totalSaltMath.additions.bakingSoda,
        [salt]: valueGrams
      });
    } else {
      setManualSaltAdditions({ ...manualSaltAdditions, [salt]: valueGrams });
    }
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: '4px',
    padding: '0.4rem',
    width: '65px',
    textAlign: 'right',
    outline: 'none',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <style>{`
        .water-grid-container {
          width: 100%;
          font-size: 0.85rem;
        }
        .water-grid-header {
          display: none;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.65rem;
          font-weight: bold;
        }
        @media (min-width: 768px) {
          .water-grid-header {
            display: grid;
          }
        }
        .water-grid-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: center;
        }
        @media (min-width: 768px) {
          .water-grid-row {
            grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
            padding: 0.75rem 0;
            gap: 0.5rem;
          }
        }
        .salt-name-col {
          font-weight: bold;
          color: var(--text-primary);
          grid-column: span 2;
        }
        @media (min-width: 768px) {
          .salt-name-col {
            grid-column: span 1;
          }
        }
        .water-mobile-label {
          display: block;
          font-size: 0.6rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        @media (min-width: 768px) {
          .water-mobile-label {
            display: none;
          }
        }
        .val-col {
          text-align: right;
        }
        @media (min-width: 768px) {
          .val-col {
            padding: 0 0.5rem;
          }
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Calculation Mode</label>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: saltCalculationMode === 'manual' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
              {saltCalculationMode === 'manual' ? 'MANUAL OVERRIDE' : 'AUTO-CALCULATED'}
            </div>
          </div>
          {saltCalculationMode === 'manual' && (
            <button 
              type="button"
              onClick={() => {
                setSaltCalculationMode('auto');
                setActiveSalt(null);
              }}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Reset
            </button>
          )}
        </div>

        <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Salt Addition Strategy</label>
          <select 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: 'var(--bg-surface)', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} 
            value={saltAdditionPosition} 
            onChange={handleSaltStrategyChange}
          >
            <option value="split">Split (Mash & Sparge)</option>
            <option value="mash_only">Mash Only</option>
            <option value="kettle_only">Kettle Only</option>
          </select>
        </div>
      </div>

      <div className="water-grid-container">
        <div className="water-grid-header">
          <div>Salt</div>
          <div style={{ textAlign: 'right' }}>Mash</div>
          <div style={{ textAlign: 'right' }}>Sparge</div>
          <div style={{ textAlign: 'right' }}>Total</div>
        </div>

        {(['gypsum', 'cacl2', 'epsom', 'bakingSoda'] as const).map((salt) => {
          const totalGrams = totalSaltMath.additions[salt];
          const mashVal = saltAdditionPosition === 'split' ? mashSaltMathSplit.additions[salt] : totalGrams;
          const spargeVal = saltAdditionPosition === 'split' ? spargeSaltMathSplit.additions[salt] : 0;
          
          const isEditing = activeSalt === salt;
          const currentValGrams = saltCalculationMode === 'manual' ? manualSaltAdditions[salt] : totalGrams;
          const currentDisplayVal = isMetric ? currentValGrams : gramsToOz(currentValGrams);

          const displayValue = isEditing 
            ? localValue 
            : (currentDisplayVal === 0 ? '0.00' : currentDisplayVal.toFixed(2));

          return (
            <div key={salt} className="water-grid-row">
              <div className="salt-name-col">
                {salt === 'cacl2' ? 'Calcium Chloride' : salt === 'gypsum' ? 'Gypsum' : salt === 'epsom' ? 'Epsom Salt' : 'Baking Soda'}
              </div>
              
              {saltAdditionPosition === 'split' ? (
                <>
                  <div className="val-col">
                    <span className="water-mobile-label">Mash</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {(isMetric ? mashVal : gramsToOz(mashVal)).toFixed(2)}{unit}
                    </span>
                  </div>
                  <div className="val-col">
                    <span className="water-mobile-label">Sparge</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {(isMetric ? spargeVal : gramsToOz(spargeVal)).toFixed(2)}{unit}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ gridColumn: 'span 2', display: 'none' }} className="desktop-only-filler" />
              )}

              <div className="val-col">
                <span className="water-mobile-label">Total Addition</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                  <input 
                    type="text"
                    inputMode="decimal"
                    style={{
                      ...inputStyle,
                      border: saltCalculationMode === 'manual' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      background: saltCalculationMode === 'manual' ? 'rgba(255,179,0,0.05)' : 'transparent',
                      color: 'white',
                      width: '60px',
                      padding: '0.4rem',
                      textAlign: 'right'
                    }}
                    value={displayValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      if (val.split('.').length <= 2) {
                        handleSaltInput(salt, val);
                      }
                    }}
                    onFocus={() => handleFocus(salt, currentValGrams)}
                    onBlur={handleBlur}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold' }}>{unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalSaltMath.warnings && totalSaltMath.warnings.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', border: '1px solid #721c24', backgroundColor: 'rgba(114, 28, 36, 0.05)', color: '#f8d7da' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#f5c6cb' }}>Water Treatment Warnings</h5>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
            {totalSaltMath.warnings.map((warning: string, idx: number) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';

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

  const [activeSalt, setActiveSalt] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string>('');

  const handleFocus = (salt: string, currentVal: number) => {
    setActiveSalt(salt);
    setLocalValue(currentVal === 0 ? '' : currentVal.toString());
  };

  const handleBlur = () => {
    setActiveSalt(null);
  };

  const handleSaltInput = (salt: keyof typeof manualSaltAdditions, valStr: string) => {
    setLocalValue(valStr);
    
    // Allow empty string or ending in decimal for smooth typing, but parse it for the math engine
    const numValue = valStr === '' ? 0 : parseFloat(valStr) || 0;
    
    if (saltCalculationMode === 'auto') {
      setSaltCalculationMode('manual');
      setManualSaltAdditions({
        gypsum: totalSaltMath.additions.gypsum,
        cacl2: totalSaltMath.additions.cacl2,
        epsom: totalSaltMath.additions.epsom,
        bakingSoda: totalSaltMath.additions.bakingSoda,
        [salt]: numValue
      });
    } else {
      setManualSaltAdditions({ ...manualSaltAdditions, [salt]: numValue });
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)' }}>
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
              Reset to Auto
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
            <option value="mash_only">Mash Only (Full amount in Mash)</option>
            <option value="kettle_only">Kettle Only (Full amount in Boil)</option>
          </select>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            <th style={{ padding: '0.5rem', fontWeight: 'bold' }}>Salt</th>
            {saltAdditionPosition === 'split' && <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>Mash</th>}
            {saltAdditionPosition === 'split' && <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>Sparge</th>}
            <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>Total Addition</th>
          </tr>
        </thead>
        <tbody>
          {(['gypsum', 'cacl2', 'epsom', 'bakingSoda'] as const).map((salt) => {
            const totalGrams = totalSaltMath.additions[salt];
            const mashVal = saltAdditionPosition === 'split' ? mashSaltMathSplit.additions[salt] : totalGrams;
            const spargeVal = saltAdditionPosition === 'split' ? spargeSaltMathSplit.additions[salt] : 0;
            
            const isEditing = activeSalt === salt;
            const displayValue = isEditing 
              ? localValue 
              : (saltCalculationMode === 'manual' ? (manualSaltAdditions[salt] === 0 ? '' : manualSaltAdditions[salt].toString()) : (totalGrams === 0 ? '' : totalGrams.toFixed(2)));

            return (
              <tr key={salt} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {salt === 'cacl2' ? 'Calcium Chloride' : salt === 'gypsum' ? 'Gypsum' : salt === 'epsom' ? 'Epsom Salt' : 'Baking Soda'}
                </td>
                {saltAdditionPosition === 'split' && <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{mashVal.toFixed(2)}g</td>}
                {saltAdditionPosition === 'split' && <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{spargeVal.toFixed(2)}g</td>}
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <input 
                      type="text"
                      inputMode="decimal"
                      style={{
                        ...inputStyle,
                        border: saltCalculationMode === 'manual' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                        background: saltCalculationMode === 'manual' ? 'rgba(255,179,0,0.05)' : 'transparent',
                        color: saltCalculationMode === 'manual' ? 'white' : 'var(--text-primary)'
                      }}
                      value={displayValue}
                      onChange={(e) => {
                        // Only allow numbers and a single decimal
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        if (val.split('.').length <= 2) {
                          handleSaltInput(salt, val);
                        }
                      }}
                      onFocus={() => handleFocus(salt, saltCalculationMode === 'manual' ? manualSaltAdditions[salt] : totalGrams)}
                      onBlur={handleBlur}
                      placeholder="0.0"
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>g</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

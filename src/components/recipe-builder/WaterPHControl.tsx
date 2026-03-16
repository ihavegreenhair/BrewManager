interface WaterPHControlProps {
  acidMode: 'manual' | 'auto';
  setAcidMode: (v: 'manual' | 'auto') => void;
  acidAddition: { type: 'lactic' | 'phosphoric'; concentration: number; volumeMl: number };
  setAcidAddition: (v: any) => void;
  targetPH: number;
  setTargetPH: (v: number) => void;
  predictedPH: number;
  hasFermentables: boolean;
}

export const WaterPHControl = ({
  acidMode, setAcidMode,
  acidAddition, setAcidAddition,
  targetPH, setTargetPH,
  predictedPH,
  hasFermentables
}: WaterPHControlProps) => {
  return (
    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Acid Additions (Mash pH Correction)</h4>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', borderRadius: '4px', padding: '2px' }}>
          <button 
            onClick={() => setAcidMode('manual')} 
            style={{ padding: '2px 8px', fontSize: '0.7rem', border: 'none', borderRadius: '3px', backgroundColor: acidMode === 'manual' ? 'var(--accent-primary)' : 'transparent', color: acidMode === 'manual' ? '#0F172A' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Manual
          </button>
          <button 
            onClick={() => setAcidMode('auto')} 
            style={{ padding: '2px 8px', fontSize: '0.7rem', border: 'none', borderRadius: '3px', backgroundColor: acidMode === 'auto' ? 'var(--accent-primary)' : 'transparent', color: acidMode === 'auto' ? '#0F172A' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Auto
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1.5 }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Acid Type</label>
          <select 
            style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }} 
            value={acidAddition.type} 
            onChange={e => setAcidAddition({ ...acidAddition, type: e.target.value as 'lactic' | 'phosphoric' })}
          >
            <option value="lactic">Lactic Acid</option>
            <option value="phosphoric">Phosphoric Acid</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Conc%</label>
          <input 
            type="number" 
            style={{ width: '100%', padding: '0.5rem' }} 
            value={acidAddition.concentration} 
            onChange={e => setAcidAddition({ ...acidAddition, concentration: Number(e.target.value) })} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            {acidMode === 'auto' ? 'Target pH' : 'Vol (ml)'}
          </label>
          {acidMode === 'auto' ? (
            <input 
              type="number" 
              step="0.05" 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--accent-primary)' }} 
              value={targetPH} 
              onChange={e => setTargetPH(Number(e.target.value))} 
            />
          ) : (
            <input 
              type="number" 
              step="0.1" 
              style={{ width: '100%', padding: '0.5rem' }} 
              value={acidAddition.volumeMl} 
              onChange={e => setAcidAddition({ ...acidAddition, volumeMl: Number(e.target.value) })} 
            />
          )}
        </div>
        {acidMode === 'auto' && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Rec. Vol</label>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center' }}>
              {acidAddition.volumeMl.toFixed(1)}ml
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--border-radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Predicted Mash pH:</span>
        {hasFermentables ? (
          <strong style={{ fontSize: '1.25rem', color: (predictedPH >= 5.2 && predictedPH <= 5.6) ? 'var(--status-success)' : 'var(--status-danger)' }}>
            {predictedPH.toFixed(2)}
          </strong>
        ) : (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A - Add fermentables</span>
        )}
      </div>
    </div>
  );
};

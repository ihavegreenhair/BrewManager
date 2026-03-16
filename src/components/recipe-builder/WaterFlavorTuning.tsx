import type { WaterProfile } from '../../types/brewing';
import { getWaterNarrative } from '../../utils/waterChemistry';

interface WaterFlavorTuningProps {
  so4ClRatio: string;
  activeTargetWater: WaterProfile;
  onProfileChange: (updates: Partial<WaterProfile>) => void;
  onIonChange: (key: keyof WaterProfile, value: number) => void;
  isCustomTarget: boolean;
}

export const WaterFlavorTuning = ({
  so4ClRatio, activeTargetWater,
  onProfileChange, onIonChange,
  isCustomTarget
}: WaterFlavorTuningProps) => {
  const { calcium, sulfate, chloride, bicarbonate } = activeTargetWater;

  const narrative = getWaterNarrative(activeTargetWater);
  const { summary, words } = narrative;

  // --- 2. TWO-WAY BINDING HELPERS ---
  const intensityPpm = sulfate + chloride;
  const handleBalanceSlider = (pct: number) => {
    const sRatio = pct / 100;
    onProfileChange({
      sulfate: Math.round(intensityPpm * sRatio),
      chloride: Math.round(intensityPpm * (1 - sRatio))
    });
  };

  const handleIntensitySlider = (val: number) => {
    const currentRatio = intensityPpm > 0 ? sulfate / intensityPpm : 0.5;
    onProfileChange({
      sulfate: Math.round(val * currentRatio),
      chloride: Math.round(val * (1 - currentRatio))
    });
  };

  const activeBalancePct = intensityPpm > 0 ? (sulfate / intensityPpm) * 100 : 50;

  // UI Styles
  const labelRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' };
  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' };
  const readoutStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-main)' };
  const sliderSubLabelStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase' };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
        
        {/* Header with 4-Word Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>Flavor Profile Tuning</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isCustomTarget ? 'var(--accent-primary)' : 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {summary}
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem 3rem', marginBottom: '2rem' }}>
          
          {/* Slider 1: Balance */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Flavor Balance</span>
              <span style={readoutStyle}><strong style={{color: 'var(--accent-primary)'}}>{words?.balance || ''}</strong> ({so4ClRatio})</span>
            </div>
            <input type="range" min="0" max="100" step="1" value={Math.round(activeBalancePct)} onChange={e => handleBalanceSlider(Number(e.target.value))} style={{ width: '100%' }} />
            <div style={sliderSubLabelStyle}>
              <span>Malty</span>
              <span>Hoppy</span>
            </div>
          </div>

          {/* Slider 2: Intensity */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Mineral Intensity</span>
              <span style={readoutStyle}><strong>{words?.intensity || ''}</strong> ({intensityPpm} ppm)</span>
            </div>
            <input type="range" min="0" max="600" step="5" value={intensityPpm} onChange={e => handleIntensitySlider(Number(e.target.value))} style={{ width: '100%' }} />
            <div style={sliderSubLabelStyle}>
              <span>Soft</span>
              <span>Bold</span>
            </div>
          </div>

          {/* Slider 3: Body */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Body / Mouthfeel</span>
              <span style={readoutStyle}><strong>{words?.body || ''}</strong> ({calcium} ppm Ca)</span>
            </div>
            <input type="range" min="0" max="300" step="5" value={calcium} onChange={e => onProfileChange({ calcium: Number(e.target.value) })} style={{ width: '100%' }} />
            <div style={sliderSubLabelStyle}>
              <span>Thin</span>
              <span>Heavy</span>
            </div>
          </div>

          {/* Slider 4: Alkalinity */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Mash Buffer / Alkalinity</span>
              <span style={readoutStyle}><strong>{words?.alkalinity || ''}</strong> ({bicarbonate} ppm)</span>
            </div>
            <input type="range" min="0" max="500" step="5" value={bicarbonate} onChange={e => onProfileChange({ bicarbonate: Number(e.target.value) })} style={{ width: '100%' }} />
            <div style={sliderSubLabelStyle}>
              <span>Bright</span>
              <span>Buffered</span>
            </div>
          </div>

        </div>

        {/* Final Output Panel */}
        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            {['Ca', 'Mg', 'Na', 'SO4', 'Cl', 'HCO3'].map((ion, idx) => {
              const keys: (keyof WaterProfile)[] = ['calcium', 'magnesium', 'sodium', 'sulfate', 'chloride', 'bicarbonate'];
              const key = keys[idx];
              const val = Math.round((activeTargetWater as any)[key]);
              const isWarning = (ion === 'SO4' && val > 400) || (ion === 'Cl' && val > 250) || (ion === 'Na' && val > 100);
              
              return (
                <div key={ion} style={{ backgroundColor: 'var(--bg-surface)', padding: '0.5rem 0.2rem', borderRadius: '6px', border: isWarning ? '1px solid var(--status-warning)' : '1px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{ion}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <button 
                      onClick={() => onIonChange(key, Math.max(0, val - 1))} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '0.2rem', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                    >−</button>
                    <input 
                      type="number" 
                      className="no-spinners"
                      value={val} 
                      onChange={e => onIonChange(key, Number(e.target.value))}
                      style={{ 
                        width: '100%',
                        minWidth: 0,
                        background: 'transparent', 
                        border: 'none', 
                        textAlign: 'center', 
                        fontWeight: '900', 
                        fontSize: '1rem',
                        color: isWarning ? 'var(--status-warning)' : 'inherit',
                        outline: 'none',
                        padding: 0
                      }} 
                    />
                    <button 
                      onClick={() => onIonChange(key, val + 1)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '0.2rem', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', margin: '1rem 0 0' }}>
             SO4:Cl Ratio: <strong>{so4ClRatio}</strong> | Tip: Directly edit the ion values below to manually override the sliders.
          </p>
        </div>
      </div>
    </div>
  );
};

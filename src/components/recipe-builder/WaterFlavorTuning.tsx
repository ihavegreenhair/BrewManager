import { ChevronUp, ChevronDown } from 'lucide-react';
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
  const activeIntensityPct = (intensityPpm / 600) * 100;
  const activeBodyPct = (calcium / 300) * 100;
  const activeAlkalinityPct = (bicarbonate / 500) * 100;

  // UI Styles
  const labelRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' };
  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' };
  const readoutStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '900' };
  const sliderSubLabelStyle = (pct: number, isRight: boolean): React.CSSProperties => ({ 
    fontSize: '0.65rem', 
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: isRight 
      ? `color-mix(in srgb, var(--accent-primary), var(--text-muted) ${100 - pct}%)`
      : `color-mix(in srgb, var(--accent-primary), var(--text-muted) ${pct}%)`,
    transition: 'color 0.2s ease'
  });

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
              <span style={readoutStyle}>{words?.balance?.toUpperCase() || ''} <span style={{fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>({so4ClRatio})</span></span>
            </div>
            <input type="range" min="0" max="100" step="1" value={Math.round(activeBalancePct)} onChange={e => handleBalanceSlider(Number(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={sliderSubLabelStyle(activeBalancePct, false)}>Malty</span>
              <span style={sliderSubLabelStyle(activeBalancePct, true)}>Hoppy</span>
            </div>
          </div>

          {/* Slider 2: Intensity */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Mineral Intensity</span>
              <span style={readoutStyle}>{words?.intensity?.toUpperCase() || ''} <span style={{fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>({intensityPpm} ppm)</span></span>
            </div>
            <input type="range" min="0" max="600" step="5" value={intensityPpm} onChange={e => handleIntensitySlider(Number(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={sliderSubLabelStyle(activeIntensityPct, false)}>Soft</span>
              <span style={sliderSubLabelStyle(activeIntensityPct, true)}>Bold</span>
            </div>
          </div>

          {/* Slider 3: Body */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Body / Mouthfeel</span>
              <span style={readoutStyle}>{words?.body?.toUpperCase() || ''} <span style={{fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>({calcium} ppm Ca)</span></span>
            </div>
            <input type="range" min="0" max="300" step="5" value={calcium} onChange={e => onProfileChange({ calcium: Number(e.target.value) })} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={sliderSubLabelStyle(activeBodyPct, false)}>Thin</span>
              <span style={sliderSubLabelStyle(activeBodyPct, true)}>Heavy</span>
            </div>
          </div>

          {/* Slider 4: Alkalinity */}
          <div>
            <div style={labelRowStyle}>
              <span style={labelStyle}>Mash Buffer / Alkalinity</span>
              <span style={readoutStyle}>{words?.alkalinity?.toUpperCase() || ''} <span style={{fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>({bicarbonate} ppm)</span></span>
            </div>
            <input type="range" min="0" max="500" step="5" value={bicarbonate} onChange={e => onProfileChange({ bicarbonate: Number(e.target.value) })} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={sliderSubLabelStyle(activeAlkalinityPct, false)}>Bright</span>
              <span style={sliderSubLabelStyle(activeAlkalinityPct, true)}>Buffered</span>
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
                <div key={ion} style={{ 
                  backgroundColor: 'var(--bg-surface)', 
                  padding: '0.4rem 0.2rem', 
                  borderRadius: '6px', 
                  border: isWarning ? '1px solid var(--status-warning)' : '1px solid transparent', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem', fontWeight: 'bold' }}>{ion}</span>
                  
                  <button 
                    type="button"
                    onClick={() => onIonChange(key, val + 1)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Increase"
                  >
                    <ChevronUp size={14} />
                  </button>

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
                      padding: 0,
                      lineHeight: 1
                    }} 
                  />

                  <button 
                    type="button"
                    onClick={() => onIonChange(key, Math.max(0, val - 1))} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Decrease"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem', margin: '1rem 0 0', fontWeight: '500' }}>
             SO4:Cl Ratio: <strong style={{color: 'var(--accent-primary)'}}>{so4ClRatio}</strong> | Tip: Directly edit the ion values below to manually override the sliders.
          </p>
        </div>
      </div>
    </div>
  );
};

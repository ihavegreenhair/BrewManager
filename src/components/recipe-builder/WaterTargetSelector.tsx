import { useState, useEffect } from 'react';
import type { WaterProfile } from '../../types/brewing';
import { getWaterNarrative } from '../../utils/waterChemistry';

interface WaterTargetSelectorProps {
  targetWaterId: string;
  setTargetWaterId: (id: string) => void;
  targetWaterProfiles: WaterProfile[];
  isCustomTarget: boolean;
  customTargetWater: WaterProfile;
  setCustomTargetWater: (w: WaterProfile) => void;
  baseTargetWater: WaterProfile;
  activeTargetWater: WaterProfile;
}

export const WaterTargetSelector = ({
  targetWaterId, setTargetWaterId, targetWaterProfiles,
  isCustomTarget, customTargetWater, setCustomTargetWater,
  activeTargetWater
}: WaterTargetSelectorProps) => {
  const [debouncedDesc, setDebouncedDesc] = useState('');
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Start fading out slightly before update
    const fadeOutTimer = setTimeout(() => setOpacity(0.5), 150);
    
    const handler = setTimeout(() => {
      const { description } = getWaterNarrative(activeTargetWater);
      setDebouncedDesc(description);
      setOpacity(1);
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(handler);
    };
  }, [activeTargetWater]);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ color: 'var(--text-secondary)' }}>Target Water Profile Template</label>
        {isCustomTarget && (
          <button 
            type="button" 
            onClick={() => setCustomTargetWater({ ...customTargetWater, calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 })} 
            style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            Zero Out Profile
          </button>
        )}
      </div>
      <select 
        style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: 'var(--bg-main)', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }} 
        value={targetWaterId} 
        onChange={e => {
          setTargetWaterId(e.target.value);
          const selected = targetWaterProfiles.find(wp => wp.id === e.target.value);
          if (selected) {
            setCustomTargetWater({ ...selected, id: 'wp-custom', name: `Custom ${selected.name}` });
          }
        }}
      >
        {targetWaterProfiles.map(wp => <option key={wp.id} value={wp.id}>{wp.name}</option>)}
        <option value="wp-custom">Custom / Manual Target...</option>
      </select>
      
      <p style={{ 
        fontSize: '0.8125rem', 
        color: 'var(--text-muted)', 
        fontStyle: 'italic', 
        lineHeight: '1.4', 
        minHeight: '3.5rem',
        opacity: opacity,
        transition: 'opacity 0.3s ease-in-out'
      }}>
        {debouncedDesc || getWaterNarrative(activeTargetWater).description}
      </p>
    </div>
  );
};

import type { WaterProfile } from '../../types/brewing';

interface WaterSourceProfileProps {
  sourceWater: WaterProfile;
  setSourceWater: (w: WaterProfile) => void;
  onSaveDefault: () => void;
}

export const WaterSourceProfile = ({
  sourceWater, setSourceWater, onSaveDefault
}: WaterSourceProfileProps) => {
  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ color: 'var(--text-secondary)' }}>Source Water</label>
        <div>
          <button type="button" onClick={() => setSourceWater({ ...sourceWater, calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 })} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginRight: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Clear to RO</button>
          <button type="button" onClick={onSaveDefault} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Set as Global Default</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
        {['calcium', 'magnesium', 'sodium', 'sulfate', 'chloride', 'bicarbonate'].map((key) => (
          <div key={key} style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {key === 'calcium' ? 'Ca+2' : key === 'magnesium' ? 'Mg+2' : key === 'sodium' ? 'Na+' : key === 'sulfate' ? 'SO4-2' : key === 'chloride' ? 'Cl-' : 'HCO3-'}
            </span>
            <input 
              type="number" 
              style={{ width: '100%', padding: '0.5rem' }} 
              value={(sourceWater as any)[key]} 
              onChange={e => setSourceWater({ ...sourceWater, [key]: Number(e.target.value) })} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

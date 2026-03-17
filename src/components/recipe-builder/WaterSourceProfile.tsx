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
      <style>{`
        .source-water-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .source-water-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
        .source-header {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 640px) {
          .source-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
      <div className="source-header">
        <label style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source Water Profile</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => setSourceWater({ ...sourceWater, calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 })} style={{ flex: 1, fontSize: '0.7rem', padding: '0.4rem 0.6rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>Clear to RO</button>
          <button type="button" onClick={onSaveDefault} style={{ flex: 1, fontSize: '0.7rem', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Set as Global Default</button>
        </div>
      </div>
      <div className="source-water-grid">
        {['calcium', 'magnesium', 'sodium', 'sulfate', 'chloride', 'bicarbonate'].map((key) => (
          <div key={key}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.2rem', textAlign: 'center' }}>
              {key === 'calcium' ? 'Ca' : key === 'magnesium' ? 'Mg' : key === 'sodium' ? 'Na' : key === 'sulfate' ? 'SO4' : key === 'chloride' ? 'Cl' : 'HCO3'}
            </span>
            <input 
              type="number" 
              className="no-spinners"
              style={{ width: '100%', padding: '0.5rem 0.25rem', textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }} 
              value={(sourceWater as any)[key]} 
              onChange={e => setSourceWater({ ...sourceWater, [key]: Number(e.target.value) })} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

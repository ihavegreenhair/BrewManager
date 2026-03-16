import type { WaterVolumes } from '../../types/brewing';

interface WaterVolumesSummaryProps {
  manualStrikeVolume: number | undefined;
  setManualStrikeVolume: (v: number | undefined) => void;
  manualSpargeVolume: number | undefined;
  setManualSpargeVolume: (v: number | undefined) => void;
  waterVolumes: WaterVolumes;
}

export const WaterVolumesSummary = ({
  manualStrikeVolume, setManualStrikeVolume,
  manualSpargeVolume, setManualSpargeVolume,
  waterVolumes
}: WaterVolumesSummaryProps) => {
  const opStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '1.2rem', paddingBottom: '0.5rem' };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '1.25rem', marginBottom: '1.5rem' }}>
      {/* Row 1: Mash Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${waterVolumes.mashTunDeadspace > 0 ? 9 : 7}, 1fr)`, gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight: 'bold' }}>STRIKE</span>
            {manualStrikeVolume !== undefined && <button onClick={() => setManualStrikeVolume(undefined)} style={{ fontSize: '0.6rem', padding: '0', background: 'transparent', border: 'none', color: 'var(--status-warning)', cursor: 'pointer' }}>Reset</button>}
          </div>
          <input 
            type="number" step="0.1" 
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: manualStrikeVolume !== undefined ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', color: 'inherit', fontWeight: 'bold', fontSize: '1.1rem' }} 
            value={manualStrikeVolume ?? waterVolumes.mashWater} 
            onChange={e => setManualStrikeVolume(Number(e.target.value))} 
          />
        </div>
        <div style={opStyle}>+</div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight: 'bold' }}>SPARGE</span>
            {manualSpargeVolume !== undefined && <button onClick={() => setManualSpargeVolume(undefined)} style={{ fontSize: '0.6rem', padding: '0', background: 'transparent', border: 'none', color: 'var(--status-warning)', cursor: 'pointer' }}>Reset</button>}
          </div>
          <input 
            type="number" step="0.1" 
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: manualSpargeVolume !== undefined ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', color: 'inherit', fontWeight: 'bold', fontSize: '1.1rem' }} 
            value={manualSpargeVolume ?? waterVolumes.spargeWater} 
            onChange={e => setManualSpargeVolume(Number(e.target.value))} 
          />
        </div>
        <div style={opStyle}>-</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>ABSORP.</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--status-danger)' }}>{waterVolumes.grainAbsorption.toFixed(1)}L</strong>
        </div>
        {waterVolumes.mashTunDeadspace > 0 && (
          <>
            <div style={opStyle}>-</div>
            <div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>DEADSPACE</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--status-danger)' }}>{waterVolumes.mashTunDeadspace.toFixed(1)}L</strong>
            </div>
          </>
        )}
        <div style={opStyle}>=</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>PRE-BOIL</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{waterVolumes.boilVolume.toFixed(1)}L</strong>
        </div>
      </div>

      {/* Row 2: Kettle Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr 20px 1fr 20px 1fr', gap: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>PRE-BOIL</span>
          <strong style={{ fontSize: '1.1rem' }}>{waterVolumes.boilVolume.toFixed(1)}L</strong>
        </div>
        <div style={opStyle}>-</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>BOIL-OFF</span>
          <strong style={{ fontSize: '1.1rem' }}>{waterVolumes.boilOffLoss.toFixed(1)}L</strong>
        </div>
        <div style={opStyle}>-</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>TRUB LOSS</span>
          <strong style={{ fontSize: '1.1rem' }}>{waterVolumes.trubLoss.toFixed(1)}L</strong>
        </div>
        <div style={opStyle}>=</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>BATCH SIZE</span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--status-success)' }}>{waterVolumes.batchVolume.toFixed(1)}L</strong>
        </div>
      </div>
    </div>
  );
};

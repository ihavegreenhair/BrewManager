import type { WaterVolumes } from '../../types/brewing';
import { useBrewStore } from '../../store/useBrewStore';
import { litersToGal, galToLiters } from '../../utils/units';

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
  const { measurementSystem } = useBrewStore();
  const unit = measurementSystem === 'metric' ? 'L' : 'GAL';
  const isMetric = measurementSystem === 'metric';

  const opStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '1.2rem', paddingBottom: '0.5rem' };

  const formatVol = (liters: number) => isMetric ? liters.toFixed(1) : litersToGal(liters).toFixed(2);

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
            value={Number(formatVol(manualStrikeVolume ?? waterVolumes.mashWater))} 
            onChange={e => {
              const val = Number(e.target.value);
              setManualStrikeVolume(isMetric ? val : galToLiters(val));
            }} 
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
            value={Number(formatVol(manualSpargeVolume ?? waterVolumes.spargeWater))} 
            onChange={e => {
              const val = Number(e.target.value);
              setManualSpargeVolume(isMetric ? val : galToLiters(val));
            }} 
          />
        </div>
        <div style={opStyle}>-</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>ABSORP.</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--status-danger)' }}>{formatVol(waterVolumes.grainAbsorption)}{unit}</strong>
        </div>
        {waterVolumes.mashTunDeadspace > 0 && (
          <>
            <div style={opStyle}>-</div>
            <div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>DEADSPACE</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--status-danger)' }}>{formatVol(waterVolumes.mashTunDeadspace)}{unit}</strong>
            </div>
          </>
        )}
        <div style={opStyle}>=</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>PRE-BOIL</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{formatVol(waterVolumes.boilVolume)}{unit}</strong>
        </div>
      </div>

      {/* Row 2: Kettle Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr 20px 1fr 20px 1fr', gap: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>PRE-BOIL</span>
          <strong style={{ fontSize: '1.1rem' }}>{formatVol(waterVolumes.boilVolume)}{unit}</strong>
        </div>
        <div style={opStyle}>-</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>BOIL-OFF</span>
          <strong style={{ fontSize: '1.1rem' }}>{formatVol(waterVolumes.boilOffLoss)}{unit}</strong>
        </div>
        <div style={opStyle}>-</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>TRUB LOSS</span>
          <strong style={{ fontSize: '1.1rem' }}>{formatVol(waterVolumes.trubLoss)}{unit}</strong>
        </div>
        <div style={opStyle}>=</div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>BATCH SIZE</span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--status-success)' }}>{formatVol(waterVolumes.batchVolume)}{unit}</strong>
        </div>
      </div>
    </div>
  );
};

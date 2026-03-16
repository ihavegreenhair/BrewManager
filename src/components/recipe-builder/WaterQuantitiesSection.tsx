import { useState } from 'react';
import type { BrewMethod, Equipment, WaterVolumes } from '../../types/brewing';
import { predefinedEquipment } from '../../data/equipment';
import { SectionHeader } from './SectionHeader';
import { litersToGal, galToLiters } from '../../utils/units';

interface WaterQuantitiesSectionProps {
  brewMethod: BrewMethod;
  equipment: Equipment;
  handleEquipmentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  batchVolume: number;
  setBatchVolume: (v: number) => void;
  boilTime: number;
  setBoilTime: (v: number) => void;
  efficiency: number;
  setEfficiency: (v: number) => void;
  grainAbsorptionRate: number;
  setGrainAbsorptionRate: (v: number) => void;
  trubLoss: number;
  setTrubLoss: (v: number) => void;
  mashTunDeadspace: number;
  setMashTunDeadspace: (v: number) => void;
  boilOffRate: number;
  setBoilOffRate: (v: number) => void;
  isCustomOverride: boolean;
  handleResetOverrides: () => void;
  measurementSystem: 'metric' | 'imperial';
  
  manualStrikeVolume: number | undefined;
  setManualStrikeVolume: (v: number | undefined) => void;
  manualSpargeVolume: number | undefined;
  setManualSpargeVolume: (v: number | undefined) => void;
  waterVolumes: WaterVolumes;

  collapsed: boolean;
  onToggle: (s: string) => void;
}

export const WaterQuantitiesSection = ({
  brewMethod, equipment, handleEquipmentChange,
  batchVolume, setBatchVolume, boilTime, setBoilTime,
  efficiency, setEfficiency, grainAbsorptionRate, setGrainAbsorptionRate,
  trubLoss, setTrubLoss, mashTunDeadspace, setMashTunDeadspace,
  boilOffRate, setBoilOffRate,
  isCustomOverride, handleResetOverrides,
  measurementSystem,
  manualStrikeVolume, setManualStrikeVolume,
  manualSpargeVolume, setManualSpargeVolume,
  waterVolumes,
  collapsed, onToggle
}: WaterQuantitiesSectionProps) => {

  const [showLosses, setShowLosses] = useState(false);

  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.35rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid transparent', borderRadius: '6px', padding: '0.6rem', color: 'inherit', fontWeight: 'bold', fontSize: '1rem', width: '100%', outline: 'none', transition: 'border-color 0.2s' };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--accent-primary)';
    e.target.style.background = 'rgba(255,255,255,0.08)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'transparent';
    e.target.style.background = 'rgba(255,255,255,0.05)';
  };

  const tooltipIconStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.5rem', marginLeft: '0.25rem', cursor: 'help', verticalAlign: 'middle', border: '1px solid var(--border-color)' };

  const TooltipIcon = ({ text }: { text: string }) => (
    <span style={tooltipIconStyle} title={text}>i</span>
  );

  const unit = measurementSystem === 'metric' ? 'L' : 'GAL';
  // const totalLosses = waterVolumes.trubLoss + waterVolumes.boilOffLoss + waterVolumes.mashTunDeadspace + waterVolumes.grainAbsorption;
  const totalWaterLiters = waterVolumes.mashWater + waterVolumes.spargeWater;
  
  const displayTotalWater = measurementSystem === 'metric' ? totalWaterLiters : litersToGal(totalWaterLiters);
  const displayBatchVolume = measurementSystem === 'metric' ? batchVolume : litersToGal(batchVolume);

  const summary = `TOTAL: ${displayTotalWater.toFixed(1)}${unit} • BATCH: ${displayBatchVolume.toFixed(1)}${unit} • ${equipment.name}`;

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
      <SectionHeader title="Equipment & Water" section="quantities" collapsed={collapsed} onToggle={onToggle} summary={summary} />

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. EQUIPMENT & TARGETS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Equipment Profile</label>
                {isCustomOverride && (
                  <button onClick={handleResetOverrides} style={{ background: 'none', border: 'none', color: 'var(--status-warning)', fontSize: '0.65rem', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>Reset to defaults</button>
                )}
              </div>
              <select 
                style={{ ...inputStyle, background: 'var(--bg-main)', cursor: 'pointer' }} 
                value={equipment.id} 
                onChange={handleEquipmentChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                {predefinedEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Batch Size ({unit})</label>
              <input 
                type="number" step="0.1" 
                style={inputStyle} 
                value={Number(displayBatchVolume.toFixed(2))} 
                onChange={e => {
                  const val = Number(e.target.value);
                  setBatchVolume(measurementSystem === 'metric' ? val : galToLiters(val));
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Boil Time (min)</label>
              <input 
                type="number" 
                style={inputStyle} 
                value={boilTime} 
                onChange={e => setBoilTime(Number(e.target.value))}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Efficiency (%)</label>
              <input 
                type="number" 
                disabled={brewMethod === 'Extract'} 
                style={{ ...inputStyle, opacity: brewMethod === 'Extract' ? 0.5 : 1 }} 
                value={efficiency} 
                onChange={e => setEfficiency(Number(e.target.value))}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* 2. PROGRESSIVE DISCLOSURE: SYSTEM LOSSES */}
          <div>
            <button 
              onClick={() => setShowLosses(!showLosses)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', padding: '0.5rem 0' }}
            >
              <span>{showLosses ? '▼' : '▶'}</span>
              <span>⚙️ SYSTEM LOSSES & VARIABLES</span>
              {!showLosses && <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.7rem', marginLeft: '0.5rem' }}>(Trub, Deadspace, Boil-off...)</span>}
            </button>

            {showLosses && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>Trub Loss ({unit}) <TooltipIcon text="Volume left in kettle after transfer" /></label>
                  <input 
                    type="number" step="0.1" className="no-spinners" 
                    style={inputStyle} 
                    value={Number((measurementSystem === 'metric' ? trubLoss : litersToGal(trubLoss)).toFixed(2))} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      setTrubLoss(measurementSystem === 'metric' ? val : galToLiters(val));
                    }} 
                    onFocus={handleFocus} onBlur={handleBlur} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Boil-Off Rate ({unit}/hr) <TooltipIcon text="Evaporation per hour" /></label>
                  <input 
                    type="number" step="0.1" className="no-spinners" 
                    style={inputStyle} 
                    value={Number((measurementSystem === 'metric' ? boilOffRate : litersToGal(boilOffRate)).toFixed(2))} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBoilOffRate(measurementSystem === 'metric' ? val : galToLiters(val));
                    }} 
                    onFocus={handleFocus} onBlur={handleBlur} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Deadspace ({unit}) <TooltipIcon text="Volume trapped in mash tun" /></label>
                  <input 
                    type="number" step="0.1" className="no-spinners" 
                    style={inputStyle} 
                    value={Number((measurementSystem === 'metric' ? mashTunDeadspace : litersToGal(mashTunDeadspace)).toFixed(2))} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      setMashTunDeadspace(measurementSystem === 'metric' ? val : galToLiters(val));
                    }} 
                    onFocus={handleFocus} onBlur={handleBlur} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Grain Abs. (L/kg) <TooltipIcon text="Water soaked up by grain" /></label>
                  <input type="number" step="0.01" className="no-spinners" style={inputStyle} value={grainAbsorptionRate} onChange={e => setGrainAbsorptionRate(Number(e.target.value))} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
            )}
          </div>

          {/* 3. WATER VOLUMES CARD */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ ...labelStyle, color: 'var(--accent-primary)', fontSize: '0.75rem' }}>Total Water Needed</label>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-primary)', lineHeight: 1 }}>
                  {displayTotalWater.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{unit}</span>
                </div>
                {/* Equation Receipt Style */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'baseline', fontStyle: 'italic' }}>
                  <span style={{ color: 'var(--text-main)' }}>{displayBatchVolume.toFixed(1)}{unit} <span style={{fontSize: '0.6rem', fontStyle: 'normal', fontWeight: 'bold'}}>BATCH</span></span>
                  <span>+</span>
                  <span>{(measurementSystem === 'metric' ? waterVolumes.trubLoss : litersToGal(waterVolumes.trubLoss)).toFixed(1)}{unit} <span style={{fontSize: '0.6rem', fontStyle: 'normal', fontWeight: 'bold'}}>TRUB</span></span>
                  <span>+</span>
                  <span>{(measurementSystem === 'metric' ? waterVolumes.boilOffLoss : litersToGal(waterVolumes.boilOffLoss)).toFixed(1)}{unit} <span style={{fontSize: '0.6rem', fontStyle: 'normal', fontWeight: 'bold'}}>BOIL-OFF</span></span>
                  <span>+</span>
                  <span>{(measurementSystem === 'metric' ? waterVolumes.mashTunDeadspace : litersToGal(waterVolumes.mashTunDeadspace)).toFixed(1)}{unit} <span style={{fontSize: '0.6rem', fontStyle: 'normal', fontWeight: 'bold'}}>DEADSPACE</span></span>
                  <span>+</span>
                  <span>{(measurementSystem === 'metric' ? waterVolumes.grainAbsorption : litersToGal(waterVolumes.grainAbsorption)).toFixed(1)}{unit} <span style={{fontSize: '0.6rem', fontStyle: 'normal', fontWeight: 'bold'}}>ABS.</span></span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontStyle: 'normal', marginLeft: '0.2rem' }}>= {displayTotalWater.toFixed(1)}{unit}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={labelStyle}>Pre-Boil Volume</label>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  {(measurementSystem === 'metric' ? waterVolumes.boilVolume : litersToGal(waterVolumes.boilVolume)).toFixed(1)} <span style={{ fontSize: '0.8rem' }}>{unit}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Strike Water</label>
                  {manualStrikeVolume !== undefined && (
                    <button onClick={() => setManualStrikeVolume(undefined)} style={{ fontSize: '0.6rem', color: 'var(--status-warning)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Auto (Ratio)</button>
                  )}
                </div>
                <input 
                  type="number" step="0.1" 
                  style={{ ...inputStyle, fontSize: '1.25rem', backgroundColor: 'rgba(0,0,0,0.15)', borderBottom: manualStrikeVolume !== undefined ? '2px solid var(--accent-primary)' : '2px solid transparent' }} 
                  value={Number((measurementSystem === 'metric' ? (manualStrikeVolume ?? waterVolumes.mashWater) : litersToGal(manualStrikeVolume ?? waterVolumes.mashWater)).toFixed(2))} 
                  onChange={e => {
                    const val = Number(e.target.value);
                    setManualStrikeVolume(measurementSystem === 'metric' ? val : galToLiters(val));
                  }} 
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Sparge Water</label>
                  <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', color: manualSpargeVolume === undefined ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={manualSpargeVolume === undefined} 
                      onChange={(e) => setManualSpargeVolume(e.target.checked ? undefined : waterVolumes.spargeWater)}
                    />
                    Auto-calculate
                  </label>
                </div>
                <input 
                  type="number" step="0.1" 
                  disabled={manualSpargeVolume === undefined}
                  style={{ ...inputStyle, fontSize: '1.25rem', backgroundColor: 'rgba(0,0,0,0.15)', opacity: manualSpargeVolume === undefined ? 0.4 : 1, cursor: manualSpargeVolume === undefined ? 'not-allowed' : 'text', borderBottom: manualSpargeVolume !== undefined ? '2px solid var(--accent-primary)' : '2px solid transparent' }} 
                  value={Number((measurementSystem === 'metric' ? (manualSpargeVolume ?? waterVolumes.spargeWater) : litersToGal(manualSpargeVolume ?? waterVolumes.spargeWater)).toFixed(2))} 
                  onChange={e => {
                    const val = Number(e.target.value);
                    setManualSpargeVolume(measurementSystem === 'metric' ? val : galToLiters(val));
                  }} 
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
};

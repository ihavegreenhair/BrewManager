import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Hop } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { HopVarietyPicker } from './HopVarietyPicker';
import { HopVisualizer } from './HopVisualizer';
import { RecipeHopProfile } from './RecipeHopProfile';
import { hops as allHops } from '../../data/hops';
import { calculateHopProfile, calculateSingleHopIBU, calculateWeightToHitIBU } from '../../utils/brewingMath';
import { gramsToOz, ozToGrams } from '../../utils/units';

interface KettleHopsSectionProps {
  kettleHops: Hop[];
  setKettleHops: (hops: Hop[]) => void;
  targetIBU: number;
  measurementSystem: 'metric' | 'imperial';
  collapsed: boolean;
  onToggle: (s: string) => void;
  targetOG: number;
  batchVolume: number;
  boilVolume: number;
}

export const KettleHopsSection = ({
  kettleHops, setKettleHops, measurementSystem, collapsed, onToggle, targetOG, batchVolume, boilVolume
}: KettleHopsSectionProps) => {
  const [expandedVisualizers, setExpandedVisualizers] = useState<Record<string, boolean>>({});
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const headerLabelStyle: React.CSSProperties = { 
    fontSize: '0.65rem', 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase', 
    fontWeight: 'bold', 
    letterSpacing: '0.05em',
    textAlign: 'center'
  };

  const inputStyle: React.CSSProperties = { 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid transparent', 
    borderRadius: '4px', 
    padding: '0.5rem 0.25rem', 
    color: 'inherit', 
    fontWeight: 'bold', 
    fontSize: '0.9rem', 
    width: '100%', 
    outline: 'none',
    transition: 'border-color 0.2s',
    textAlign: 'center'
  };
  
  const handleFocus = (id: string) => {
    setActiveRowId(id);
  };
  const handleBlur = () => {
    setTimeout(() => setActiveRowId(null), 200);
  };

  const addHop = () => {
    setKettleHops([...kettleHops, { 
      id: crypto.randomUUID(), 
      name: '', 
      weight: 0, 
      alphaAcid: 0, 
      use: 'boil', 
      time: 60 
    }]);
  };

  const updateHop = (id: string, updates: Partial<Hop>) => {
    setKettleHops(kettleHops.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const toggleVisualizer = (id: string) => {
    setExpandedVisualizers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const profile = useMemo(() => {
    return calculateHopProfile(kettleHops, allHops);
  }, [kettleHops]);

  const currentTotalIBU = useMemo(() => {
    return kettleHops.reduce((acc, h) => acc + calculateSingleHopIBU(h, targetOG, batchVolume, boilVolume), 0);
  }, [kettleHops, targetOG, batchVolume, boilVolume]);

  const summary = (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginRight: '0.5rem' }}>{currentTotalIBU.toFixed(1)} IBU</span>
      {profile?.topTags.map(tag => (
        <span key={tag} style={{ 
          padding: '0.1rem 0.4rem', 
          backgroundColor: 'rgba(255, 179, 0, 0.1)', 
          color: 'var(--accent-primary)', 
          borderRadius: '3px', 
          fontSize: '0.65rem',
          fontWeight: 'bold'
        }}>
          #{tag.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );

  const weightUnit = measurementSystem === 'metric' ? 'g' : 'oz';

  const handleTargetIBUClick = (hop: Hop) => {
    const current = calculateSingleHopIBU(hop, targetOG, batchVolume, boilVolume);
    const target = prompt(`Enter target IBU contribution for ${hop.name || 'this addition'}:`, current.toFixed(1));
    if (target !== null) {
      const targetVal = parseFloat(target);
      if (!isNaN(targetVal)) {
        const newWeight = calculateWeightToHitIBU(targetVal, hop, targetOG, batchVolume, boilVolume);
        updateHop(hop.id, { weight: newWeight });
      }
    }
  };

  // Define a stable grid layout that fits within 100% width
  const gridTemplate = '24px minmax(120px, 2.5fr) 1fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 90px';

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)', width: '100%', boxSizing: 'border-box' }}>
      <SectionHeader title="Kettle Hops" section="hops" collapsed={collapsed} onToggle={onToggle} summary={summary} />

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', overflow: 'hidden' }}>
          
          <RecipeHopProfile 
            kettleHops={kettleHops} 
            targetOG={targetOG}
            batchVolume={batchVolume}
            boilVolume={boilVolume}
          />

          {/* Table Headers */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: gridTemplate, 
            gap: '0.5rem', 
            padding: '0 0.5rem 0.5rem 0.5rem',
            alignItems: 'center'
          }}>
            <div />
            <div style={{ ...headerLabelStyle, textAlign: 'left' }}>Hop Variety</div>
            <div style={{ ...headerLabelStyle, textAlign: 'right' }}>Weight</div>
            <div style={{ ...headerLabelStyle, textAlign: 'right' }}>AA %</div>
            <div style={{ ...headerLabelStyle, textAlign: 'left' }}>Use</div>
            <div style={{ ...headerLabelStyle, textAlign: 'right' }}>Time/Day</div>
            <div style={{ ...headerLabelStyle, textAlign: 'right' }}>Temp</div>
            <div style={{ ...headerLabelStyle, textAlign: 'right' }}>IBU</div>
            <div />
          </div>

          {/* Hops List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {kettleHops.map((h, idx) => {
              const variety = h.customVariety || allHops.find(v => v.name.toLowerCase() === h.name.toLowerCase());
              const isExpanded = expandedVisualizers[h.id];
              const individualIBU = calculateSingleHopIBU(h, targetOG, batchVolume, boilVolume);
              const isRowActive = activeRowId === h.id;
              const isWhirlpool = h.use === 'whirlpool' || h.use === 'aroma';
              
              const displayWeight = measurementSystem === 'metric' ? h.weight : gramsToOz(h.weight);

              return (
                <div key={h.id} className="hover-bg" style={{ 
                  backgroundColor: 'rgba(255,255,255,0.015)', 
                  borderRadius: '6px', 
                  border: isRowActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.03)',
                  position: 'relative',
                  zIndex: isRowActive ? 100 : 1,
                  overflow: 'hidden',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: gridTemplate, 
                    gap: '0.5rem', 
                    padding: '0.6rem 0.5rem',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{idx + 1}</div>
                    
                    <div style={{ minWidth: 0 }}>
                      <HopVarietyPicker 
                        value={h.name}
                        onChange={(v) => {
                          const isStandard = allHops.some(standard => standard.name === v.name && standard.country === v.country);
                          updateHop(h.id, { 
                            name: v.name, 
                            alphaAcid: v.alphaAcid.avg,
                            customVariety: isStandard ? undefined : v
                          });
                        }}
                        onFocus={() => handleFocus(h.id)}
                        onBlur={handleBlur}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <input 
                        type="number" 
                        className="no-spinners"
                        style={inputStyle} 
                        value={displayWeight === 0 ? '' : Number(displayWeight.toFixed(2))} 
                        placeholder="0.0"
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          const weightGrams = measurementSystem === 'metric' ? val : ozToGrams(val);
                          updateHop(h.id, { weight: weightGrams });
                        }}
                        onFocus={() => handleFocus(h.id)}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div>
                      <input 
                        type="number" 
                        step="0.1"
                        className="no-spinners"
                        style={inputStyle} 
                        value={h.alphaAcid === 0 ? '' : h.alphaAcid} 
                        placeholder="0.0"
                        onChange={e => updateHop(h.id, { alphaAcid: parseFloat(e.target.value) || 0 })}
                        onFocus={() => handleFocus(h.id)}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div>
                      <select 
                        style={{ ...inputStyle, textAlign: 'left', paddingLeft: '0.5rem', background: 'var(--bg-main)', cursor: 'pointer' }} 
                        value={h.use} 
                        onChange={e => {
                          const newUse = e.target.value as any;
                          updateHop(h.id, { 
                            use: newUse,
                            temp: (newUse === 'whirlpool' || newUse === 'aroma') ? h.temp || 80 : undefined,
                            time: newUse === 'dry_hop' ? (h.time > 14 ? 3 : h.time) : h.time
                          });
                        }}
                        onFocus={() => handleFocus(h.id)}
                        onBlur={handleBlur}
                      >
                        <option value="boil">Boil</option>
                        <option value="first_wort">First Wort</option>
                        <option value="whirlpool">Whirlpool</option>
                        <option value="aroma">Aroma</option>
                        <option value="dry_hop">Dry Hop</option>
                      </select>
                    </div>

                    <div>
                      <input 
                        type="number" 
                        className="no-spinners"
                        style={inputStyle} 
                        value={h.time === 0 ? '' : h.time} 
                        placeholder={h.use === 'dry_hop' ? "Day" : "0"}
                        onChange={e => updateHop(h.id, { time: parseInt(e.target.value) || 0 })}
                        onFocus={() => handleFocus(h.id)}
                        onBlur={handleBlur}
                        title={h.use === 'dry_hop' ? "Day of fermentation to add" : "Minutes"}
                      />
                    </div>

                    <div>
                      <input 
                        type="number" 
                        className="no-spinners"
                        style={{ ...inputStyle, opacity: isWhirlpool ? 1 : 0.3 }} 
                        value={h.temp === undefined ? '' : h.temp} 
                        placeholder={isWhirlpool ? "80" : "—"}
                        disabled={!isWhirlpool}
                        onChange={e => updateHop(h.id, { temp: parseFloat(e.target.value) || undefined })}
                        onFocus={() => handleFocus(h.id)}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div 
                        style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 'bold', 
                          color: h.use === 'boil' ? 'var(--accent-primary)' : 'var(--text-muted)',
                          cursor: h.use === 'boil' ? 'pointer' : 'default'
                        }}
                        onClick={() => h.use === 'boil' && handleTargetIBUClick(h)}
                        title={h.use === 'boil' ? "Click to calculate weight for target IBU" : ""}
                      >
                        {individualIBU.toFixed(1)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'flex-end' }}>
                      {h.use === 'boil' && (
                         <button 
                            type="button"
                            onClick={() => handleTargetIBUClick(h)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '1.1rem', padding: '0.5rem', cursor: 'pointer', opacity: 0.8, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Calculate weight to hit target IBU"
                          >
                            ⌖
                          </button>
                      )}
                      {variety && (
                        <button 
                          type="button" 
                          onClick={() => toggleVisualizer(h.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '1.3rem', padding: '0.5rem', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={isExpanded ? "Collapse variety details" : "Expand variety details (Oil & Flavor)"}
                        >
                          {isExpanded ? '−' : '⊕'}
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => setKettleHops(kettleHops.filter(item => item.id !== h.id))}
                        style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '1.4rem', padding: '0.5rem', cursor: 'pointer', opacity: 0.7, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove this hop addition"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {variety && isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.25rem' }}>
                      <HopVisualizer variety={variety} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            type="button" 
            onClick={addHop}
            style={{ 
              marginTop: '1rem',
              width: '100%',
              padding: '0.85rem',
              backgroundColor: 'var(--accent-soft)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '6px',
              color: 'var(--accent-primary)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-soft)';
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
          >
            <Plus size={18} /> Add another hop addition
          </button>

          {kettleHops.length > 0 && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '2rem'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...headerLabelStyle, textAlign: 'right' }}>Total Hops</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {(() => {
                    const totalGrams = kettleHops.reduce((acc, h) => acc + h.weight, 0);
                    const displayTotal = measurementSystem === 'metric' ? totalGrams : gramsToOz(totalGrams);
                    return displayTotal.toFixed(1);
                  })()} <span style={{ fontSize: '0.7rem' }}>{weightUnit.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...headerLabelStyle, textAlign: 'right' }}>EST. IBU</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {currentTotalIBU.toFixed(1)}
                </div>
              </div>
            </div>
          )}

          {kettleHops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              No hop additions defined. Click "+ Add another hop addition" to begin.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

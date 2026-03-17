import type { Fermentable } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { kgToLbs, lbsToKg } from '../../utils/units';

interface FermentablesSectionProps {
  fermentableSearch: string;
  setFermentableSearch: (v: string) => void;
  filteredLibraryFermentables: any[];
  fermentables: Fermentable[];
  setFermentables: (f: Fermentable[]) => void;
  totalGrainWeight: number;
  targetOG: number;
  measurementSystem: 'metric' | 'imperial';
  collapsed: boolean;
  onToggle: (s: string) => void;
  grainBillMode: 'weight' | 'percentage';
  setGrainBillMode: (m: 'weight' | 'percentage') => void;
  targetABV: number;
  setTargetABV: (v: number) => void;
}

export const FermentablesSection = ({
  fermentableSearch, setFermentableSearch, filteredLibraryFermentables,
  fermentables, setFermentables, totalGrainWeight, targetOG,
  measurementSystem, collapsed, onToggle,
  grainBillMode, setGrainBillMode, targetABV, setTargetABV
}: FermentablesSectionProps) => {

  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.4rem', display: 'block' };
  const inputStyle: React.CSSProperties = { background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', outline: 'none' };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = 'var(--accent-primary)';
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = 'var(--border-color)';

  const getMouthfeelImpact = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('hull')) return null; // Rice hulls are neutral mash aids
    if (n.includes('rice') || n.includes('corn') || n.includes('maize') || n.includes('sugar') || n.includes('dextrose')) {
      return { label: 'Thinning', color: '#64B5F6' };
    }
    if (n.includes('wheat') || n.includes('oat') || n.includes('rye') || n.includes('flaked') || n.includes('carapils')) {
      return { label: 'Building', color: '#FFB300' };
    }
    return null;
  };

  const updateFermentable = (id: string, updates: Partial<Fermentable>) => {
    setFermentables(fermentables.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const onPercentageChange = (id: string, newPercent: number) => {
    setGrainBillMode('percentage');
    
    // Logic for auto-scaling other UNLOCKED items
    const otherItems = fermentables.filter(f => f.id !== id);
    const unlockedOtherItems = otherItems.filter(f => !f.locked);
    const lockedTotalPercent = otherItems.filter(f => f.locked).reduce((acc, f) => acc + (f.percentage || 0), 0);
    
    const remainingPercentForUnlocked = 100 - newPercent - lockedTotalPercent;
    const currentUnlockedTotal = unlockedOtherItems.reduce((acc, f) => acc + (f.percentage || 0), 0);

    const newFermentables = fermentables.map(f => {
      if (f.id === id) return { ...f, percentage: newPercent, locked: true };
      if (f.locked) return f;
      
      let scaledPercent = 0;
      if (currentUnlockedTotal > 0) {
        scaledPercent = (f.percentage || 0) * (remainingPercentForUnlocked / currentUnlockedTotal);
      } else if (unlockedOtherItems.length > 0) {
        scaledPercent = remainingPercentForUnlocked / unlockedOtherItems.length;
      }
      return { ...f, percentage: Math.max(0, Number(scaledPercent.toFixed(2))) };
    });

    setFermentables(newFermentables);
  };

  const onWeightChange = (id: string, newDisplayWeight: number) => {
    const newWeightKg = measurementSystem === 'metric' ? newDisplayWeight : lbsToKg(newDisplayWeight);
    setGrainBillMode('weight');
    
    const changedItem = fermentables.find(f => f.id === id);
    if (!changedItem) return;

    let newFermentables = [...fermentables];

    if (changedItem.locked) {
      // User changed a FIXED item's weight. 
      // To keep its % the same, we must scale all other items by the exact same ratio.
      const oldWeight = changedItem.weight;
      if (oldWeight > 0) {
        const scaleFactor = newWeightKg / oldWeight;
        newFermentables = fermentables.map(f => {
          if (f.id === id) return { ...f, weight: newWeightKg };
          return { ...f, weight: Number((f.weight * scaleFactor).toFixed(3)) };
        });
      } else {
        newFermentables = fermentables.map(f => f.id === id ? { ...f, weight: newWeightKg } : f);
      }
    } else {
      // User changed an UNLOCKED item's weight.
      // Other UNLOCKED items remain their current absolute weights.
      // FIXED items must scale to maintain their locked percentages against the NEW total weight.
      newFermentables = fermentables.map(f => f.id === id ? { ...f, weight: newWeightKg } : f);

      const lockedItems = newFermentables.filter(f => f.locked);
      const unlockedItems = newFermentables.filter(f => !f.locked);
      const lockedPercentTotal = lockedItems.reduce((acc, f) => acc + (f.percentage || 0), 0);
      
      if (lockedItems.length > 0 && lockedPercentTotal < 100 && unlockedItems.length > 0) {
        const unlockedWeightTotal = unlockedItems.reduce((acc, f) => acc + f.weight, 0);
        if (unlockedWeightTotal > 0) {
          const totalTargetWeight = unlockedWeightTotal / (1 - (lockedPercentTotal / 100));
          newFermentables = newFermentables.map(f => {
            if (f.locked) {
              const targetWeight = totalTargetWeight * ((f.percentage || 0) / 100);
              return { ...f, weight: Number(targetWeight.toFixed(3)) };
            }
            return f;
          });
        }
      }
    }

    // Keep internal percentages synced for unlocked items so switching to % mode is seamless
    const newTotalWeight = newFermentables.reduce((acc, f) => acc + f.weight, 0);
    if (newTotalWeight > 0) {
      newFermentables = newFermentables.map(f => {
        if (!f.locked) {
          return { ...f, percentage: Number(((f.weight / newTotalWeight) * 100).toFixed(2)) };
        }
        return f;
      });
    }

    setFermentables(newFermentables);
  };

  const toggleLock = (id: string) => {
    setFermentables(fermentables.map(f => f.id === id ? { ...f, locked: !f.locked } : f));
  };

  const addFermentable = (lf: any) => {
    const newF: Fermentable = { 
      ...lf, 
      id: crypto.randomUUID(), 
      weight: 1.0, // ALWAYS 1.0kg internally
      percentage: fermentables.length === 0 ? 100 : 0,
      locked: false
    };
    
    const newFermentables = [...fermentables, newF];
    if (grainBillMode === 'percentage') {
      const count = newFermentables.length;
      setFermentables(newFermentables.map(f => ({ ...f, percentage: 100 / count })));
    } else {
      setFermentables(newFermentables);
    }
    setFermentableSearch('');
  };

  const removeFermentable = (id: string) => {
    const itemToRemove = fermentables.find(f => f.id === id);
    if (!itemToRemove) return;

    const remainingItems = fermentables.filter(f => f.id !== id);
    if (remainingItems.length === 0) {
      setFermentables([]);
      return;
    }

    const unlockedItems = remainingItems.filter(f => !f.locked);
    
    if (unlockedItems.length > 0) {
      const removedPercent = itemToRemove.percentage || 0;
      const currentUnlockedTotalPercent = unlockedItems.reduce((acc, f) => acc + (f.percentage || 0), 0);

      const updatedFermentables = remainingItems.map(f => {
        if (f.locked) return f;
        
        // Redistribute removedPercent based on relative ratios of unlocked items
        let additionalPercent = 0;
        if (currentUnlockedTotalPercent > 0) {
          additionalPercent = (f.percentage || 0) / currentUnlockedTotalPercent * removedPercent;
        } else {
          // If all unlocked were 0%, split removed percent equally
          additionalPercent = removedPercent / unlockedItems.length;
        }
        
        return { ...f, percentage: Number(( (f.percentage || 0) + additionalPercent ).toFixed(2)) };
      });

      setFermentables(updatedFermentables);
    } else {
      // If no unlocked items, just remove (total will likely be != 100%)
      setFermentables(remainingItems);
    }
  };

  const totalPercentage = fermentables.reduce((acc, f) => acc + (f.percentage || 0), 0);
  const isPercentError = Math.abs(totalPercentage - 100) > 0.1;
  
  const weightUnit = measurementSystem === 'metric' ? 'kg' : 'lbs';
  const displayTotalWeight = measurementSystem === 'metric' ? totalGrainWeight : kgToLbs(totalGrainWeight);
  const summary = `${displayTotalWeight.toFixed(2)} ${weightUnit} • EST. OG: ${targetOG.toFixed(3)}`;

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
      <SectionHeader title="Grain Bill" section="fermentables" collapsed={collapsed} onToggle={onToggle} summary={summary} />
      
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <style>{`
            .grain-controls {
              display: flex;
              flex-direction: column;
              gap: 1rem;
              margin-bottom: 1.5rem;
              padding-bottom: 1.5rem;
              border-bottom: 1px dashed var(--border-color);
            }
            @media (min-width: 768px) {
              .grain-controls {
                flex-direction: row;
                align-items: flex-end;
              }
            }
            .grain-grid-header {
              display: none;
              grid-template-columns: 3fr 100px 140px 60px 60px 30px;
              gap: 1rem;
              margin-bottom: 0.5rem;
              padding: 0 0.5rem;
              font-size: 0.65rem;
              color: var(--text-muted);
              text-transform: uppercase;
              font-weight: bold;
            }
            @media (min-width: 1024px) {
              .grain-grid-header {
                display: grid;
              }
            }
            .grain-item {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.75rem;
              align-items: center;
              background-color: rgba(255,255,255,0.015);
              padding: 1rem;
              border-radius: 6px;
              border: 1px solid rgba(255,255,255,0.03);
              transition: background-color 0.2s;
            }
            @media (min-width: 1024px) {
              .grain-item {
                grid-template-columns: 3fr 100px 140px 60px 60px 40px;
                gap: 1rem;
                padding: 0.5rem;
              }
            }
            .mobile-label {
              display: block;
              font-size: 0.6rem;
              color: var(--text-muted);
              text-transform: uppercase;
              margin-bottom: 0.25rem;
            }
            @media (min-width: 1024px) {
              .mobile-label {
                display: none;
              }
            }
            .name-col { grid-column: span 2; }
            @media (min-width: 1024px) { .name-col { grid-column: span 1; } }
          `}</style>
          
          <div className="grain-controls">
            <div style={{ flex: 1, position: 'relative' }}>
              <label style={labelStyle}>Add Fermentable</label>
              <input 
                style={{ ...inputStyle, background: 'var(--bg-main)' }} 
                placeholder="Search library..." 
                value={fermentableSearch} 
                onChange={e => setFermentableSearch(e.target.value)} 
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {fermentableSearch && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {filteredLibraryFermentables.length > 0 ? filteredLibraryFermentables.map(lf => (
                    <div 
                      key={lf.id} 
                      style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => addFermentable(lf)}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>{lf.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lf.category} | {lf.yield} PPG | {lf.color} SRM</div>
                    </div>
                  )) : (
                    <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>No ingredients found.</div>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => {
                setFermentables([...fermentables, { id: crypto.randomUUID(), name: 'Custom Grain', weight: 1.0, yield: 36, color: 2, percentage: 0, locked: false }]);
                setFermentableSearch('');
              }} style={{ flex: 1, padding: '0.6rem 1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}>+ Custom</button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <input 
                  type="checkbox" 
                  id="scaleToAbvToggle"
                  checked={grainBillMode === 'percentage'}
                  onChange={(e) => setGrainBillMode(e.target.checked ? 'percentage' : 'weight')}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', width: '14px', height: '14px', margin: 0 }}
                />
                <label htmlFor="scaleToAbvToggle" style={{ fontSize: '0.65rem', color: grainBillMode === 'percentage' ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', cursor: 'pointer', margin: 0 }}>
                  Scale to ABV
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" step="0.1" 
                  style={{ 
                    ...inputStyle, 
                    width: '60px', 
                    textAlign: 'center', 
                    border: isPercentError ? '1px solid var(--status-danger)' : (grainBillMode === 'percentage' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)'), 
                    padding: '0.4rem', 
                    color: isPercentError ? 'var(--status-danger)' : 'white',
                    opacity: grainBillMode === 'percentage' ? 1 : 0.5
                  }} 
                  value={targetABV} 
                  disabled={isPercentError || grainBillMode !== 'percentage'}
                  onChange={e => setTargetABV(Number(e.target.value))}
                />
                <span style={{ fontWeight: 'bold', color: grainBillMode === 'percentage' && !isPercentError ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '0.8rem' }}>% ABV</span>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <label style={labelStyle}>Total Weight</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {displayTotalWeight.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{weightUnit.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {fermentables.length > 0 && (
            <div className="grain-grid-header">
              <div>Ingredient Name</div>
              <div style={{ textAlign: 'right' }}>Weight ({weightUnit})</div>
              <div style={{ textAlign: 'right' }}>% / Scale</div>
              <div style={{ textAlign: 'right' }}>PPG</div>
              <div style={{ textAlign: 'right' }}>SRM</div>
              <div></div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {fermentables.map(f => {
              const calcPercentage = totalGrainWeight > 0 ? (f.weight / totalGrainWeight) * 100 : 0;
              const displayWeight = measurementSystem === 'metric' ? f.weight : kgToLbs(f.weight);
              const impact = getMouthfeelImpact(f.name);
              return (
                <div key={f.id} className="grain-item">
                  <div className="name-col">
                    <span className="mobile-label">Ingredient</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        style={{ ...inputStyle, padding: '0.4rem', background: 'transparent', border: 'none', color: 'white' }} 
                        placeholder="Ingredient name" 
                        value={f.name} 
                        onChange={e => updateFermentable(f.id, { name: e.target.value })} 
                      />
                      {impact && (
                        <span 
                          onClick={() => updateFermentable(f.id, { ignoreMouthfeel: !f.ignoreMouthfeel })}
                          style={{ 
                            fontSize: '0.55rem', 
                            padding: '0.1rem 0.3rem', 
                            backgroundColor: f.ignoreMouthfeel ? 'transparent' : `${impact.color}20`, 
                            color: f.ignoreMouthfeel ? 'var(--text-muted)' : impact.color, 
                            border: `1px solid ${f.ignoreMouthfeel ? 'var(--border-color)' : `${impact.color}50`}`, 
                            borderRadius: '3px', 
                            fontWeight: 'bold',
                            marginLeft: '0.5rem',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            textDecoration: f.ignoreMouthfeel ? 'line-through' : 'none',
                            opacity: f.ignoreMouthfeel ? 0.5 : 1
                          }}
                        >
                          {impact.label}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="mobile-label">Weight ({weightUnit})</span>
                    <input 
                      type="number" step="0.01" 
                      className="no-spinners"
                      style={{ 
                        ...inputStyle, 
                        padding: '0.4rem', 
                        textAlign: 'right', 
                        border: '1px solid transparent',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'white'
                      }} 
                      value={displayWeight || ''} 
                      onChange={e => onWeightChange(f.id, Number(e.target.value))} 
                    />
                  </div>

                  <div>
                    <span className="mobile-label">% / Mode</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <input 
                        type="number" step="0.1"
                        className="no-spinners"
                        style={{ 
                          ...inputStyle, 
                          padding: '0.4rem', 
                          textAlign: 'right', 
                          border: '1px solid transparent',
                          background: 'rgba(255,255,255,0.02)',
                          color: 'white',
                          flex: 1 
                        }} 
                        value={grainBillMode === 'percentage' ? (f.percentage || '') : Number(calcPercentage.toFixed(1))}
                        onChange={e => onPercentageChange(f.id, Number(e.target.value))}
                      />
                      <button 
                        type="button"
                        onClick={() => toggleLock(f.id)}
                        style={{ 
                          background: f.locked ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', 
                          border: f.locked ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          color: f.locked ? '#0F172A' : 'var(--text-secondary)', 
                          fontSize: '0.6rem', 
                          fontWeight: 'bold', 
                          padding: '0.4rem 0.5rem', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          minWidth: '45px'
                        }}
                      >
                        {f.locked ? 'FIXED' : 'AUTO'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="mobile-label">Yield (PPG)</span>
                    <input type="number" className="no-spinners" style={{ ...inputStyle, padding: '0.4rem', textAlign: 'right', background: 'transparent', border: 'none', opacity: 0.6 }} value={f.yield} onChange={e => updateFermentable(f.id, { yield: Number(e.target.value) })} />
                  </div>
                  <div>
                    <span className="mobile-label">Color (SRM)</span>
                    <input type="number" className="no-spinners" style={{ ...inputStyle, padding: '0.4rem', textAlign: 'right', background: 'transparent', border: 'none', opacity: 0.6 }} value={f.color} onChange={e => updateFermentable(f.id, { color: Number(e.target.value) })} />
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" onClick={() => removeFermentable(f.id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>

          {fermentables.length > 0 && isPercentError && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-danger)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--status-danger)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                ⚠️ Grain bill total is {totalPercentage.toFixed(1)}%. Please adjust your percentages to equal 100%.
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

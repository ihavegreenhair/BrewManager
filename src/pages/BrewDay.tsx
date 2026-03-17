import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight, 
  ClipboardList,
  FlaskConical,
  GripVertical
} from 'lucide-react';
import type { Session, BrewEvent, Hop, Fermentable } from '../types/brewing';
import { StyleMatchSidebar } from '../components/recipe-builder';
import { calculateABV, calculateFG, calculateIBU, calculateSRM, calculateOG, calculateWaterVolumes } from '../utils/brewingMath';
import { calculateProfileFromSalts } from '../utils/waterChemistry';
import { HopVarietyPicker } from '../components/recipe-builder/HopVarietyPicker';
import { YeastVarietyPicker } from '../components/recipe-builder/YeastVarietyPicker';
import { FermentableVarietyPicker } from '../components/recipe-builder/FermentableVarietyPicker';

export const BrewDay = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, updateSession, completeSession } = useBrewStore();
  
  const session = sessions.find(s => s.id === sessionId);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (session) {
      setActiveEventIndex(session.currentEventIndex);
    }
  }, [session?.id]);

  const activeEvent = session?.events[activeEventIndex];

  // Ingredient Swapping Handlers
  const handleSwapHop = (newVariety: any) => {
    if (!session || !activeEvent || !activeEvent.metadata?.hopDetails) return;
    const oldId = activeEvent.metadata.hopDetails.id;
    const newRecipe = JSON.parse(JSON.stringify(session.recipeSnapshot));
    const hopIdx = newRecipe.kettleHops.findIndex((h: any) => h.id === oldId || h.name === activeEvent.metadata!.hopDetails!.name);
    if (hopIdx > -1) {
      newRecipe.kettleHops[hopIdx].name = newVariety.name;
      newRecipe.kettleHops[hopIdx].alphaAcid = newVariety.alphaAcid.avg;
      newRecipe.kettleHops[hopIdx].customVariety = newVariety;
    }

    const newEvents = [...session.events];
    newEvents[activeEventIndex] = {
      ...activeEvent,
      label: `Add Hop: ${newVariety.name}`,
      metadata: {
        ...activeEvent.metadata,
        hopDetails: {
          ...activeEvent.metadata.hopDetails,
          name: newVariety.name,
          alpha: newVariety.alphaAcid.avg
        }
      }
    };

    updateSession(session.id, { recipeSnapshot: newRecipe, events: newEvents });
  };

  const handleSwapYeast = (newVariety: any) => {
    if (!session || !activeEvent || !activeEvent.metadata?.yeastDetails) return;
    const newRecipe = JSON.parse(JSON.stringify(session.recipeSnapshot));
    if (newRecipe.fermenters[0]?.yeast[0]) {
      newRecipe.fermenters[0].yeast[0].name = newVariety.name;
      newRecipe.fermenters[0].yeast[0].attenuation = newVariety.attenuation.avg || 75;
      newRecipe.fermenters[0].yeast[0].customVariety = newVariety;
    }

    const newEvents = [...session.events];
    newEvents[activeEventIndex] = {
      ...activeEvent,
      label: `Pitch Yeast: ${newVariety.name}`,
      metadata: {
        ...activeEvent.metadata,
        yeastDetails: {
          ...activeEvent.metadata.yeastDetails,
          name: newVariety.name
        }
      }
    };

    updateSession(session.id, { recipeSnapshot: newRecipe, events: newEvents });
  };

  const handleSwapMalt = (oldId: string, newMaltBase: any) => {
    if (!session || !activeEvent) return;
    const newRecipe = JSON.parse(JSON.stringify(session.recipeSnapshot));
    const grainIdx = newRecipe.fermentables.findIndex((f: any) => f.id === oldId);
    if (grainIdx > -1) {
      newRecipe.fermentables[grainIdx] = { 
        ...newRecipe.fermentables[grainIdx], 
        name: newMaltBase.name, 
        yield: newMaltBase.yield, 
        color: newMaltBase.color 
      };
    }
    
    const newDetailed = activeEvent.detailedActuals?.map(da => 
      da.id === oldId ? { ...da, label: newMaltBase.name } : da
    );

    updateSession(session.id, { 
      recipeSnapshot: newRecipe,
      events: session.events.map(e => e.id === activeEvent.id ? { ...e, detailedActuals: newDetailed } : e)
    });
  };

  // Timer Logic
  useEffect(() => {
    if (timerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  const startTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleEventCompletion = (index: number) => {
    if (!session) return;
    const newEvents = [...session.events];
    newEvents[index].completed = !newEvents[index].completed;
    newEvents[index].timestamp = newEvents[index].completed ? new Date().toISOString() : undefined;
    
    let nextIndex = activeEventIndex;
    if (newEvents[index].completed && index === activeEventIndex) {
      nextIndex = Math.min(index + 1, newEvents.length - 1);
      setActiveEventIndex(nextIndex);
    }
    
    updateSession(session.id, { 
      events: newEvents,
      currentEventIndex: nextIndex
    });
  };

  const handleActualChange = (key: keyof Session['actuals'], value: number) => {
    if (!session) return;
    updateSession(session.id, {
      actuals: { ...session.actuals, [key]: value }
    });
  };

  const updateActiveEvent = (updates: Partial<BrewEvent>) => {
    if (!session || !activeEvent) return;
    const newEvents = [...session.events];
    newEvents[activeEventIndex] = { ...activeEvent, ...updates };
    
    // If hop properties changed, we need to trigger reordering
    if ('hopUse' in updates || 'hopTime' in updates || 'hopTemp' in updates) {
      reorderHopEvents(session.id, newEvents);
    } else {
      updateSession(session.id, { events: newEvents });
    }
  };

  const updateDetailedActual = (actualId: string, value: number) => {
    if (!session || !activeEvent?.detailedActuals) return;
    const newDetailed = activeEvent.detailedActuals.map(da => 
      da.id === actualId ? { ...da, actual: value } : da
    );
    updateActiveEvent({ detailedActuals: newDetailed });
  };

  const reorderHopEvents = (sid: string, currentEvents: BrewEvent[]) => {
    // Extract non-hop events and hop events separately
    const otherEvents = currentEvents.filter(e => e.type !== 'hop');
    const kettleHopEvents = currentEvents.filter(e => e.type === 'hop' && e.hopUse !== 'dry_hop');
    const dryHopEvents = currentEvents.filter(e => e.type === 'hop' && e.hopUse === 'dry_hop');

    // Sort kettle hops
    kettleHopEvents.sort((a, b) => (b.hopTime || 0) - (a.hopTime || 0));
    
    // Construct new sequence
    const finalEvents: BrewEvent[] = [];
    
    // 1. Water to Boil
    const boilIndex = otherEvents.findIndex(e => e.type === 'boil');
    finalEvents.push(...otherEvents.slice(0, boilIndex + 1));

    // 2. Add Hops (handling whirlpool cooling)
    let whirlpoolPhaseStarted = false;
    kettleHopEvents.forEach(h => {
      if ((h.hopUse === 'whirlpool' || h.hopUse === 'aroma' || h.hopUse === 'hopstand') && !whirlpoolPhaseStarted) {
        // Insert a cooling step if not present
        finalEvents.push({
          id: crypto.randomUUID(),
          type: 'cooling',
          label: 'Reduce to Whirlpool Temperature',
          subLabel: `Chill wort to ${h.hopTemp || 80}°C.`,
          targetTemp: h.hopTemp || 80,
          completed: false
        });
        whirlpoolPhaseStarted = true;
      }
      finalEvents.push(h);
    });

    // 3. Cooling to Yeast
    const coolingIndex = otherEvents.findIndex(e => e.type === 'cooling');
    const yeastIndex = otherEvents.findIndex(e => e.type === 'yeast');
    finalEvents.push(...otherEvents.slice(coolingIndex, yeastIndex + 1));

    // 4. Dry Hops
    finalEvents.push(...dryHopEvents);

    // 5. Checkpoints & Packaging
    finalEvents.push(...otherEvents.slice(yeastIndex + 1));

    updateSession(sid, { events: finalEvents });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    if (!session) return;
    const newEvents = [...session.events];
    const draggedItem = newEvents[draggedItemIndex];
    newEvents.splice(draggedItemIndex, 1);
    newEvents.splice(index, 0, draggedItem);
    
    let newActiveIndex = activeEventIndex;
    if (activeEventIndex === draggedItemIndex) newActiveIndex = index;
    else if (draggedItemIndex < activeEventIndex && index >= activeEventIndex) newActiveIndex--;
    else if (draggedItemIndex > activeEventIndex && index <= activeEventIndex) newActiveIndex++;

    setActiveEventIndex(newActiveIndex);
    setDraggedItemIndex(index);
    updateSession(session.id, { events: newEvents, currentEventIndex: newActiveIndex });
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleFinish = () => {
    if (!session) return;
    if (window.confirm('Are you sure you want to complete this brew day?')) {
      completeSession(session.id);
      navigate('/sessions');
    }
  };

  const updatedTargets = useMemo(() => {
    if (!session) return null;
    const recipe = session.recipeSnapshot;
    
    // 1. Reconstruct Ingredients from Actuals
    const actualFermentables: Fermentable[] = recipe.fermentables.map(f => {
      const mashInStep = session.events.find(e => e.label === 'Mash In');
      const actualWeight = mashInStep?.detailedActuals?.find(da => da.id === f.id)?.actual;
      return { ...f, weight: actualWeight ?? f.weight };
    });

    const actualHops: Hop[] = session.events
      .filter(e => e.type === 'hop')
      .map(e => ({
        id: e.metadata?.hopDetails?.id || e.id,
        name: e.metadata?.hopDetails?.name || e.label,
        weight: e.actualValue ?? e.targetValue ?? 0,
        alphaAcid: e.metadata?.hopDetails?.alpha || 0,
        use: e.hopUse || 'boil',
        time: e.hopTime ?? 0,
        temp: e.hopTemp
      }));

    const actualMashSteps = session.events
      .filter(e => e.type === 'mash' && e.metadata?.mashDetails)
      .map(e => ({
        id: e.id,
        name: e.metadata!.mashDetails!.name || e.label,
        type: 'infusion' as const,
        stepTemp: e.actualTemp ?? e.targetTemp ?? 67,
        stepTime: e.actualDuration ?? e.duration ?? 60,
      }));
    const mashStepsToUse = actualMashSteps.length > 0 ? actualMashSteps : recipe.mashSteps;

    // Move variables up for use in water volumes
    const equipment = recipe.equipment;
    const boilTime = recipe.boilTime;
    const efficiency = recipe.efficiency;

    let activeTargetWater = recipe.targetWaterProfile || recipe.waterProfile || { id: 'w', name: 'W', calcium:0, magnesium:0, sodium:0, sulfate:0, chloride:0, bicarbonate:0 };
    const saltStep = session.events.find(e => e.label === 'Add Water Salts');
    if (saltStep?.detailedActuals && recipe.waterProfile) {
      const getSalt = (id: string) => saltStep.detailedActuals?.find(da => da.id === id)?.actual ?? saltStep.detailedActuals?.find(da => da.id === id)?.target ?? 0;
      const actualSalts = {
        gypsum: getSalt('gypsum'),
        cacl2: getSalt('cacl2'),
        epsom: getSalt('epsom'),
        bakingSoda: getSalt('bakingSoda')
      };
      const totalVolLiters = calculateWaterVolumes(equipment, actualFermentables, boilTime, recipe.type, recipe.batchVolume, recipe.waterSettings?.manualStrikeVolume, recipe.waterSettings?.manualSpargeVolume, recipe.trubLoss).mashWater + calculateWaterVolumes(equipment, actualFermentables, boilTime, recipe.type, recipe.batchVolume, recipe.waterSettings?.manualStrikeVolume, recipe.waterSettings?.manualSpargeVolume, recipe.trubLoss).spargeWater;
      
      const { resultingProfile } = calculateProfileFromSalts(recipe.waterProfile, actualSalts, totalVolLiters);
      activeTargetWater = { id: 'custom-actual', name: 'Actual Water Profile', ...resultingProfile };
    }

    const eventActuals: Partial<Session['actuals']> = {};
    session.events.forEach(e => {
      if (e.label.includes('Post-boil Measurements') && e.actualValue) eventActuals.og = e.actualValue;
      if (e.label.includes('Pre-boil Measurements') && e.actualValue) eventActuals.preBoilVolume = e.actualValue;
    });

    const mergedActuals = { ...session.actuals, ...eventActuals };

    // 2. Re-calculate Metrics
    let targetOG = calculateOG(actualFermentables, efficiency, recipe.batchVolume, recipe.type, recipe.trubLoss || equipment.trubLoss);
    let targetVolume = recipe.batchVolume;

    if (mergedActuals.preBoilGravity && mergedActuals.preBoilVolume) {
      const preBoilPoints = (mergedActuals.preBoilGravity - 1) * mergedActuals.preBoilVolume;
      const expectedPostBoilVol = mergedActuals.postBoilVolume || (mergedActuals.preBoilVolume - (recipe.boilOffRate ?? equipment.boilOffRate) * (boilTime / 60));
      if (expectedPostBoilVol > 0) {
        targetOG = 1 + (preBoilPoints / expectedPostBoilVol);
        targetVolume = expectedPostBoilVol;
      }
    }
    
    if (mergedActuals.og) targetOG = mergedActuals.og;
    if (mergedActuals.postBoilVolume) targetVolume = mergedActuals.postBoilVolume;

    const targetSRM = calculateSRM(actualFermentables, targetVolume);
    const targetIBU = calculateIBU(actualHops, targetOG, targetVolume, recipe.boilVolume);

    const primaryFermenter = recipe.fermenters[0];
    let fg = primaryFermenter.targetFG;
    let abv = primaryFermenter.targetABV;

    if (mergedActuals.fg) {
      fg = mergedActuals.fg;
      abv = calculateABV(targetOG, fg);
    } else {
       fg = calculateFG(targetOG, primaryFermenter.yeast);
       abv = calculateABV(targetOG, fg);
    }

    return {
      sharedTargets: { targetOG, targetSRM, targetIBU },
      primaryFermenter: { ...primaryFermenter, targetFG: fg, targetABV: abv },
      batchVolume: targetVolume,
      fermentables: actualFermentables,
      hops: actualHops,
      activeTargetWater,
      mashSteps: mashStepsToUse,
      mergedActuals
    };
  }, [session?.events, session?.actuals, session?.recipeSnapshot]);

  if (!session) return <div style={{ padding: '2rem', textAlign: 'center' }}>Session not found.</div>;

  const progress = session.events.length > 0 ? (session.events.filter(e => e.completed).length / session.events.length) * 100 : 0;

  const aggregatedNotes = session.events
    .filter(e => e.notes && e.notes.trim().length > 0)
    .map(e => `• ${e.label}: ${e.notes}`)
    .join('\n');

  return (
    <div className="brew-day-container">
      <style>{`
        .brew-day-container {
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: 5rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .brew-day-container {
            grid-template-columns: 1fr 380px;
          }
        }
        .brew-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--bg-surface);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          position: sticky;
          top: 0.5rem;
          z-index: 100;
          grid-column: 1 / -1;
        }
        .hero-card {
          background: var(--bg-surface);
          border: 2px solid var(--accent-primary);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .timer-display {
          font-size: 4rem;
          font-family: var(--font-mono);
          font-weight: bold;
          color: var(--accent-primary);
          margin: 1rem 0;
        }
        .event-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .event-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-surface);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .event-item.completed {
          opacity: 0.6;
          border-color: transparent;
          background: rgba(255,255,255,0.02);
        }
        .event-item.active {
          border-color: var(--accent-primary);
          background: var(--accent-soft);
        }
        .actual-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }
        .actual-input-group label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: bold;
        }
        .actual-input-group input, .actual-input-group select {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          padding: 0.6rem;
          border-radius: 6px;
          color: white;
          font-weight: bold;
        }
        .detailed-actuals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
          text-align: left;
        }
      `}</style>

      {/* Header */}
      <div className="brew-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{session.name}</h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {new Date(session.date).toLocaleDateString()} • {Math.round(progress)}% Complete
          </div>
        </div>
        <button onClick={handleFinish} className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#4CAF50', borderColor: '#4CAF50' }}>
          FINISH BREW
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {activeEvent && (
          <div className="hero-card">
            <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              Current Step
            </div>
            <h1 style={{ margin: '0.5rem 0', fontSize: '2rem' }}>{activeEvent.label}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{activeEvent.subLabel}</p>

            {/* Editable Hop Stage/Time/Temp */}
            {activeEvent.type === 'hop' && (
              <div className="detailed-actuals-grid" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="actual-input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Hop Variety</label>
                  <HopVarietyPicker 
                    value={activeEvent.metadata?.hopDetails?.name || ''}
                    onChange={(v) => handleSwapHop(v)}
                    onFocus={() => {}}
                    onBlur={() => {}}
                  />
                </div>
                <div className="actual-input-group">
                  <label>Stage</label>
                  <select value={activeEvent.hopUse} onChange={e => updateActiveEvent({ hopUse: e.target.value as any })}>
                    <option value="boil">Boil</option>
                    <option value="whirlpool">Whirlpool</option>
                    <option value="dry_hop">Dry Hop</option>
                    <option value="first_wort">First Wort</option>
                  </select>
                </div>
                <div className="actual-input-group">
                  <label>{activeEvent.hopUse === 'dry_hop' ? 'Day' : 'Mins'}</label>
                  <input type="number" value={activeEvent.hopTime ?? ''} onChange={e => updateActiveEvent({ hopTime: Number(e.target.value) })} />
                </div>
                {(activeEvent.hopUse === 'whirlpool' || activeEvent.hopUse === 'aroma') && (
                  <div className="actual-input-group">
                    <label>Temp °C</label>
                    <input type="number" value={activeEvent.hopTemp ?? ''} onChange={e => updateActiveEvent({ hopTemp: Number(e.target.value) })} />
                  </div>
                )}
              </div>
            )}

            {/* Editable Yeast */}
            {activeEvent.type === 'yeast' && (
              <div className="detailed-actuals-grid" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="actual-input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Yeast Strain</label>
                  <YeastVarietyPicker 
                    value={activeEvent.metadata?.yeastDetails?.name || ''}
                    onChange={(v) => handleSwapYeast(v)}
                    onFocus={() => {}}
                    onBlur={() => {}}
                  />
                </div>
              </div>
            )}

            {/* Variables */}
            <div className="detailed-actuals-grid">
              {activeEvent.targetValue !== undefined && (
                <div className="actual-input-group">
                  <label>Actual {activeEvent.unit || 'Weight/Vol'} (Target: {activeEvent.targetValue})</label>
                  <input type="number" step="any" value={activeEvent.actualValue || ''} onChange={e => updateActiveEvent({ actualValue: Number(e.target.value) })} placeholder={activeEvent.targetValue.toString()} />
                </div>
              )}
              {activeEvent.targetTemp !== undefined && (
                <div className="actual-input-group">
                  <label>Actual Temp °C (Target: {activeEvent.targetTemp})</label>
                  <input type="number" step="any" value={activeEvent.actualTemp || ''} onChange={e => updateActiveEvent({ actualTemp: Number(e.target.value) })} placeholder={activeEvent.targetTemp.toString()} />
                </div>
              )}
              {activeEvent.duration !== undefined && (
                <div className="actual-input-group">
                  <label>Actual Time (min) (Target: {activeEvent.duration})</label>
                  <input type="number" step="1" value={activeEvent.actualDuration || ''} onChange={e => updateActiveEvent({ actualDuration: Number(e.target.value) })} placeholder={activeEvent.duration.toString()} />
                </div>
              )}
            </div>

            {/* Detailed Actuals (Grain weights, Salts) */}
            {activeEvent.detailedActuals && activeEvent.detailedActuals.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <div className="detailed-actuals-grid" style={{ marginTop: 0 }}>
                  {activeEvent.detailedActuals.map(da => (
                    <div key={da.id} className="actual-input-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>{activeEvent.label === 'Mash In' ? 'Grain Variety' : da.label} ({da.unit})</span>
                        <span>Target: {da.target}</span>
                      </label>
                      
                      {activeEvent.label === 'Mash In' ? (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <FermentableVarietyPicker 
                            value={da.label}
                            onChange={(v) => handleSwapMalt(da.id, v)}
                          />
                        </div>
                      ) : null}

                      <input 
                        type="number" 
                        step="any" 
                        value={da.actual || ''} 
                        onChange={e => updateDetailedActual(da.id, Number(e.target.value))} 
                        placeholder={da.target.toString()} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="actual-input-group" style={{ marginTop: '1.5rem' }}>
              <label>Step Notes</label>
              <textarea style={{ width: '100%', minHeight: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem', color: 'white', resize: 'vertical', outline: 'none' }} placeholder="Any observations?" value={activeEvent.notes || ''} onChange={e => updateActiveEvent({ notes: e.target.value })} />
            </div>

            {/* Timer */}
            {activeEvent.duration && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                {timeLeft === null ? (
                  <button onClick={() => startTimer(activeEvent.duration!)} style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <Play fill="var(--accent-primary)" color="var(--accent-primary)" /> START {activeEvent.duration}m TIMER
                  </button>
                ) : (
                  <div>
                    <div className="timer-display">{formatTime(timeLeft)}</div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button onClick={() => setTimerRunning(!timerRunning)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white' }}>
                        {timerRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />} {timerRunning ? 'PAUSE' : 'RESUME'}
                      </button>
                      <button onClick={() => setTimeLeft(activeEvent.duration! * 60)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white' }}>
                        <RotateCcw size={20} /> RESET
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button className="primary" onClick={() => toggleEventCompletion(activeEventIndex)} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {activeEvent.completed ? 'MARK INCOMPLETE' : 'DONE • NEXT STEP'} {!activeEvent.completed && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        )}

        <div>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Timeline (Drag to Reorder)</h3>
          <div className="event-list">
            {session.events.map((event, idx) => (
              <div key={event.id} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd} className={`event-item ${event.completed ? 'completed' : ''} ${idx === activeEventIndex ? 'active' : ''}`} onClick={() => setActiveEventIndex(idx)}>
                <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={20} /></div>
                {event.completed ? <CheckCircle2 color="#4CAF50" size={24} /> : <Circle color="var(--border-color)" size={24} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: event.completed ? 'var(--text-muted)' : 'white' }}>{event.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.subLabel}</div>
                </div>
                {event.duration && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {event.duration}m</div>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={18} /> Global Measured Actuals
          </h3>
          <div className="actuals-grid">
            {(['mashPh', 'preBoilVolume', 'preBoilGravity', 'postBoilVolume', 'og', 'fg'] as const).map(key => (
              <div key={key} className="actual-input-group">
                <label>{key.replace(/([A-Z])/g, ' $1')}</label>
                <input type="number" step="any" value={session.actuals[key] || ''} onChange={e => handleActualChange(key, Number(e.target.value))} placeholder="..." />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} /> Session Notes
          </h3>
          {aggregatedNotes && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', borderLeft: '3px solid var(--accent-primary)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>Step Comments</div>
              {aggregatedNotes}
            </div>
          )}
          <textarea style={{ width: '100%', minHeight: '120px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', color: 'white', resize: 'vertical', outline: 'none' }} placeholder="Record overall observations..." value={session.notes} onChange={e => updateSession(session.id, { notes: e.target.value })} />
        </div>
      </div>

      <div style={{ alignSelf: 'start', position: 'sticky', top: '5rem' }}>
         <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Predicted Result</h3>
         {updatedTargets && (
           <StyleMatchSidebar 
            activeStyle={session.recipeSnapshot.styleId ? { id: 'style', name: 'Target Style', category: '...', stats: { og: {min:1, max:1.2}, fg: {min:1, max:1.2}, abv: {min:0, max:20}, ibu: {min:0, max:150}, srm: {min:0, max:50} } } as any : null} 
            sharedTargets={updatedTargets.sharedTargets}
            primaryFermenter={updatedTargets.primaryFermenter}
            fermentables={updatedTargets.fermentables}
            kettleHops={updatedTargets.hops}
            mashSteps={updatedTargets.mashSteps}
            activeTargetWater={updatedTargets.activeTargetWater}
            predictedPH={updatedTargets.mergedActuals.mashPh}
            measurementSystem="metric"
            co2Volumes={2.5}
           />
         )}
      </div>
    </div>
  );
};

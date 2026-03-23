import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import type { RaptTelemetry, FermentationStep, BrewEvent, Session } from '../types/brewing';

// Hooks
import { useRaptTelemetry } from '../hooks/useRaptTelemetry';
import { useBrewTimer } from '../hooks/useBrewTimer';
import { useRaptSync } from '../hooks/useRaptSync';
import { useBrewCalculations } from '../hooks/useBrewCalculations';

// Components
import { StepHero } from '../components/brew-day/StepHero';
import { FermentationMonitor } from '../components/brew-day/FermentationMonitor';
import { RaptIntegrationSidebar } from '../components/brew-day/RaptIntegrationSidebar';

import styles from './BrewDay.module.css';

const getEventGroup = (e: BrewEvent) => {
  if (['water', 'mash'].includes(e.type) || (e.type === 'checkpoint' && e.label.includes('pH'))) {
    return { id: 'prep', name: 'Preparation & Mashing', color: '#ff9800' };
  }
  if (['boil'].includes(e.type) || (e.type === 'hop' && e.hopUse !== 'dry_hop') || (e.type === 'cooling' && e.targetTemp && e.targetTemp > 30) || (e.type === 'checkpoint' && !e.label.includes('pH') && !e.label.includes('OG'))) {
    return { id: 'boil', name: 'Boil & Whirlpool', color: '#f44336' };
  }
  return { id: 'ferment', name: 'Fermentation & Packaging', color: '#2196f3' };
};

export const BrewDay = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const monitorRef = useRef<HTMLDivElement | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  const { 
    sessions, 
    updateSession, 
    completeSession, 
    raptDevices, 
    raptSettings, 
    updateRaptSettings 
  } = useBrewStore();
  
  const session = sessions.find(s => s.id === sessionId);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // 1. Calculations & Logic Extraction
  const {
    fermentationSteps,
    totalFermentDays,
    timelineMilestones,
    updatedTargets,
    insights,
    projectedData
  } = useBrewCalculations(session);

  // 2. RAPT Syncing Hook
  const { syncing, syncHistory } = useRaptSync(
    session, 
    raptSettings, 
    updateSession, 
    updateRaptSettings
  );

  // 3. Real-time Telemetry
  const handlePillData = useCallback((data: RaptTelemetry) => {
    if (!session || !data.gravity || !data.temperature || !session.raptLogStart || session.raptLogEnd) return;
    
    const lastPoint = session.raptPillData?.[session.raptPillData.length - 1];
    if (!lastPoint || Math.abs(lastPoint.gravity - data.gravity) > 0.0005) {
      updateSession(session.id, { 
        raptPillData: [
          ...(session.raptPillData || []), 
          { 
            gravity: data.gravity, 
            temperature: data.temperature, 
            timestamp: new Date().toISOString(), 
            gravityVelocity: data.gravityVelocity 
          }
        ] 
      });
    }
  }, [session, updateSession]);

  const bzTelemetry = useRaptTelemetry(session?.raptBrewZillaId).telemetry;
  const pillTelemetry = useRaptTelemetry(session?.raptPillId, 300, handlePillData).telemetry;

  // 4. Sync activeEventIndex with store
  useEffect(() => {
    if (session && session.currentEventIndex !== activeEventIndex) {
      setActiveEventIndex(session.currentEventIndex);
    }
  }, [session?.id, session?.currentEventIndex, activeEventIndex]);

  // 5. Centered Scrolling logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!session) return;
      const group = getEventGroup(session.events[activeEventIndex]);
      
      if (group.id === 'ferment' && monitorRef.current) {
        monitorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const targetEl = stepRefs.current[activeEventIndex];
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeEventIndex, session]);

  const activeEvent = session?.events[activeEventIndex];
  const { 
    timeLeft, 
    timerRunning, 
    startTimer, 
    toggleTimer, 
    resetTimer, 
    formatTime 
  } = useBrewTimer(activeEvent?.duration);

  const activeMilestoneId = useMemo(() => {
    if (!activeEvent) return null;
    if (activeEvent.type === 'fermentation') return activeEvent.metadata?.stepDetails?.id || activeEvent.metadata?.mashDetails?.id;
    if (activeEvent.type === 'hop' && activeEvent.hopUse === 'dry_hop') return activeEvent.metadata?.hopDetails?.id;
    return null;
  }, [activeEvent]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!session || draggedIdx === null || draggedIdx === index) return;
    
    const draggedGroup = getEventGroup(session.events[draggedIdx]);
    const targetGroup = getEventGroup(session.events[index]);
    if (draggedGroup.id !== targetGroup.id) return;

    const newEvents = [...session.events];
    const item = newEvents[draggedIdx];
    newEvents.splice(draggedIdx, 1);
    newEvents.splice(index, 0, item);
    
    setDraggedIdx(index);
    updateSession(session.id, { events: newEvents });
  };

  const handleDragEnd = () => setDraggedIdx(null);

  const handleSelectEvent = (index: number) => {
    if (!session) return;
    setActiveEventIndex(index);
    updateSession(session.id, { currentEventIndex: index });
  };

  const handleSelectMilestone = (id: string, type: string) => {
    if (!session) return;
    const eventIndex = session.events.findIndex(e => {
      if (type === 'hop') return e.type === 'hop' && e.metadata?.hopDetails?.id === id;
      if (type === 'phase' || type === 'crash') {
        const eventId = e.metadata?.stepDetails?.id || e.metadata?.mashDetails?.id;
        return e.type === 'fermentation' && eventId === id;
      }
      return false;
    });
    if (eventIndex > -1) {
      handleSelectEvent(eventIndex);
    }
  };

  const linkBrewZilla = (id: string) => {
    if (!session) return;
    updateSession(session.id, { 
      raptBrewZillaId: id,
      raptBrewZillaLinkedAt: new Date().toISOString()
    });
  };

  const linkPill = (id: string) => {
    if (!session) return;
    updateSession(session.id, { 
      raptPillId: id,
      raptPillLinkedAt: new Date().toISOString()
    });
  };

  const handleUpdateSession = useCallback((updates: Partial<typeof session>) => {
    if (!session) return;
    updateSession(session.id, updates as any);
  }, [session?.id, updateSession]);

  const startLogging = useCallback(() => {
    if (!session) return;
    updateSession(session.id, { 
      raptLogStart: new Date().toISOString(), 
      raptLogEnd: new Date(new Date().getTime() + (totalFermentDays + 2) * 86400000).toISOString(), 
      raptPillData: [] 
    });
  }, [session?.id, updateSession, totalFermentDays]);

  const stopLogging = useCallback(() => {
    if (!session) return;
    updateSession(session.id, { raptLogEnd: new Date().toISOString() });
  }, [session?.id, updateSession]);

  const handleUpdateFermentStep = useCallback((stepId: string, updates: Partial<FermentationStep>) => {
    if (!session) return;
    const newRecipe = structuredClone(session.recipeSnapshot);
    const step = newRecipe.fermenters[0]?.fermentationSteps.find((s: any) => s.id === stepId);
    if (step) {
      Object.assign(step, updates);
      updateSession(session.id, { recipeSnapshot: newRecipe });
    }
  }, [session, updateSession]);

  const handleSwapHop = useCallback((newVariety: any) => {
    if (!session || !activeEvent || !activeEvent.metadata?.hopDetails) return;
    const oldId = activeEvent.metadata.hopDetails.id;
    const newRecipe = structuredClone(session.recipeSnapshot);
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
      metadata: { ...activeEvent.metadata, hopDetails: { ...activeEvent.metadata.hopDetails, name: newVariety.name, alpha: newVariety.alphaAcid.avg } } 
    };
    updateSession(session.id, { recipeSnapshot: newRecipe, events: newEvents });
  }, [session, activeEvent, activeEventIndex, updateSession]);

  const handleSwapYeast = useCallback((newVariety: any) => {
    if (!session || !activeEvent || !activeEvent.metadata?.yeastDetails) return;
    const newRecipe = structuredClone(session.recipeSnapshot);
    if (newRecipe.fermenters[0]?.yeast[0]) {
      newRecipe.fermenters[0].yeast[0].name = newVariety.name;
      newRecipe.fermenters[0].yeast[0].attenuation = newVariety.attenuation.avg || 75;
      newRecipe.fermenters[0].yeast[0].customVariety = newVariety;
    }
    const newEvents = [...session.events];
    newEvents[activeEventIndex] = { 
      ...activeEvent, 
      label: `Pitch Yeast: ${newVariety.name}`, 
      metadata: { ...activeEvent.metadata, yeastDetails: { ...activeEvent.metadata.yeastDetails, name: newVariety.name } } 
    };
    updateSession(session.id, { recipeSnapshot: newRecipe, events: newEvents });
  }, [session, activeEvent, activeEventIndex, updateSession]);

  const toggleEventCompletion = useCallback((index: number) => {
    if (!session) return;
    const newEvents = [...session.events];
    newEvents[index].completed = !newEvents[index].completed;
    newEvents[index].timestamp = newEvents[index].completed ? new Date().toISOString() : undefined;
    let nextIndex = activeEventIndex;
    if (newEvents[index].completed && index === activeEventIndex) {
      nextIndex = Math.min(index + 1, newEvents.length - 1);
      setActiveEventIndex(nextIndex);
    }
    updateSession(session.id, { events: newEvents, currentEventIndex: nextIndex });
  }, [session, activeEventIndex, updateSession]);

  const handleAutoScaleSchedule = useCallback(() => {
    if (!session || !projectedData || projectedData.length === 0) return;
    const targetFG = session.recipeSnapshot.fermenters[0]?.targetFG || 1.010;
    const dRestThreshold = targetFG + 0.005;
    const startTime = new Date(session.raptLogStart!).getTime();
    const dRestPoint = projectedData.find(p => p.gravity <= dRestThreshold);
    const finishPoint = projectedData.find(p => p.gravity <= targetFG);
    if (!dRestPoint) return;
    const newRecipe = structuredClone(session.recipeSnapshot);
    const steps = newRecipe.fermenters[0]?.fermentationSteps;
    if (steps && steps.length >= 1) {
      const primaryDays = Math.max(1, Math.round(((dRestPoint.unix - startTime) / 86400000) * 10) / 10);
      steps[0].stepTime = primaryDays;
      if (steps.length >= 2 && finishPoint) {
        const dRestDays = Math.max(1, Math.round(((finishPoint.unix - dRestPoint.unix) / 86400000) * 10) / 10);
        steps[1].stepTime = dRestDays;
      }
      updateSession(session.id, { recipeSnapshot: newRecipe });
    }
  }, [session, projectedData, updateSession]);

  const handleFinish = useCallback(() => { 
    if (session && window.confirm('Are you sure you want to complete this brew day?')) { 
      completeSession(session.id); 
      navigate('/sessions'); 
    } 
  }, [session?.id, completeSession, navigate]);

  const toLocalISO = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  // Group events once for rendering
  const renderedItems = useMemo(() => {
    if (!session) return [];
    const items: any[] = [];
    let currentGroupId = '';
    let monitorInjected = false;

    session.events.forEach((event, idx) => {
      const group = getEventGroup(event);
      if (group.id !== currentGroupId) {
        currentGroupId = group.id;
        items.push({ type: 'header', group, id: `header-${group.id}`, idx });
      }

      if (group.id === 'ferment') {
        if (!monitorInjected) {
          items.push({ type: 'monitor', group, id: 'ferment-monitor', idx });
          monitorInjected = true;
        }
        items.push({ type: 'ferment-anchor', id: event.id, idx });
      } else {
        items.push({ type: 'step', group, event, id: event.id, idx });
      }
    });
    return items;
  }, [session?.events]);

  const handleActualChange = useCallback((key: keyof Session['actuals'], value: number) => {
    if (!session) return;
    updateSession(session.id, { actuals: { ...session.actuals, [key]: value } });
  }, [session?.id, session?.actuals, updateSession]);

  const updateActiveEventFromMonitor = useCallback((u: Partial<BrewEvent>) => {
    if (!session) return;
    const evs = [...session.events];
    evs[activeEventIndex] = { ...evs[activeEventIndex], ...u };
    updateSession(session.id, { events: evs });
  }, [session?.id, session?.events, activeEventIndex, updateSession]);

  const toggleActiveCompletion = useCallback(() => toggleEventCompletion(activeEventIndex), [activeEventIndex, toggleEventCompletion]);

  if (!session) return <div style={{ padding: '2rem', textAlign: 'center' }}>Session not found.</div>;

  const progress = session.events.length > 0 ? (session.events.filter(e => e.completed).length / session.events.length) * 100 : 0;
  const aggregatedNotes = session.events.filter(e => e.notes && e.notes.trim().length > 0).map(e => `• ${e.label}: ${e.notes}`).join('\n');

  return (
    <div className={styles.brewDayContainer}>
      <div className={styles.brewHeader}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{session.name}</h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {new Date(session.date).toLocaleDateString()} • {Math.round(progress)}% Complete
          </div>
        </div>
        <button onClick={handleFinish} className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#4CAF50', borderColor: '#4CAF50' }}>FINISH BREW</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
        <div className={styles.heroScrollList}>
          {renderedItems.map((item) => {
            const isActive = item.idx === activeEventIndex;
            
            if (item.type === 'header') {
              return (
                <div key={item.id} style={{ marginTop: item.idx === 0 ? '0' : '2rem', padding: '0.5rem 1rem', fontSize: '0.8rem', color: item.group.color, textTransform: 'uppercase', fontWeight: 'bold', borderLeft: `4px solid ${item.group.color}`, background: 'rgba(255,255,255,0.02)', borderRadius: '8px', alignSelf: 'flex-start' }}>
                  {item.group.name}
                </div>
              );
            }

            if (item.type === 'monitor') {
              const isFermentActive = session.events.slice(item.idx).some((_, i) => (item.idx + i) === activeEventIndex);
              return (
                <div 
                  key={item.id} 
                  ref={monitorRef}
                  className={styles.raptCard} 
                  style={{ 
                    position: 'sticky', top: '5rem', zIndex: 10,
                    marginTop: '0.5rem', borderLeft: `4px solid ${item.group.color}`,
                    border: isFermentActive ? `2px solid ${item.group.color}` : '1px solid var(--border-color)',
                    boxShadow: isFermentActive ? `0 10px 30px rgba(0,0,0,0.4)` : 'none'
                  }}
                >
                  <FermentationMonitor 
                    session={session} insights={insights} projectedData={projectedData} pillTelemetry={pillTelemetry || undefined} timelineMilestones={timelineMilestones} fermentationSteps={fermentationSteps} syncing={syncing} activeMilestoneId={activeMilestoneId}
                    activeEvent={isFermentActive ? session.events[activeEventIndex] : null}
                    onStartLogging={startLogging} onSyncHistory={syncHistory} onStopLogging={stopLogging} onUpdateSession={handleUpdateSession} onUpdateFermentStep={handleUpdateFermentStep}
                    onSelectMilestone={handleSelectMilestone} onAutoScaleSchedule={handleAutoScaleSchedule}
                    updateActiveEvent={updateActiveEventFromMonitor}
                    onToggleCompletion={toggleActiveCompletion}
                    toLocalISO={toLocalISO}
                  />
                </div>
              );
            }

            if (item.type === 'ferment-anchor') {
              return <div key={item.id} ref={el => { if (el) stepRefs.current[item.idx] = el; }} style={{ height: 0 }} />;
            }

            return (
              <div 
                key={item.id} ref={el => { if (el) stepRefs.current[item.idx] = el; }}
                draggable onDragStart={(e) => handleDragStart(e, item.idx)} onDragOver={(e) => handleDragOver(e, item.idx)} onDragEnd={handleDragEnd}
                onClick={() => handleSelectEvent(item.idx)} style={{ cursor: 'pointer' }}
              >
                <StepHero 
                  activeEvent={item.event!} isActive={isActive} bzTelemetry={isActive ? (bzTelemetry || undefined) : undefined} timeLeft={isActive ? timeLeft : null} timerRunning={isActive ? timerRunning : false}
                  onStartTimer={startTimer} onToggleTimer={toggleTimer} onResetTimer={resetTimer} formatTime={formatTime}
                  updateActiveEvent={(u) => {
                    const evs = [...session.events];
                    evs[item.idx] = { ...evs[item.idx], ...u };
                    updateSession(session.id, { events: evs });
                  }}
                  handleSwapHop={handleSwapHop} handleSwapYeast={handleSwapYeast} updateDetailedActual={(id, val) => {
                    const newEvents = [...session.events];
                    const newDetailed = (newEvents[item.idx].detailedActuals || []).map(da => da.id === id ? { ...da, actual: val } : da);
                    newEvents[item.idx] = { ...newEvents[item.idx], detailedActuals: newDetailed };
                    updateSession(session.id, { events: newEvents });
                  }}
                  onToggleCompletion={() => toggleEventCompletion(item.idx)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <RaptIntegrationSidebar 
        session={session} raptSettings={raptSettings} raptDevices={raptDevices} bzTelemetry={bzTelemetry || undefined} pillTelemetry={pillTelemetry || undefined} updatedTargets={updatedTargets}
        onLinkBrewZilla={linkBrewZilla} onLinkPill={linkPill} onUpdateSession={handleUpdateSession}
        actuals={session.actuals} computedActuals={updatedTargets?.mergedActuals} onActualChange={handleActualChange}
        notes={session.notes} aggregatedNotes={aggregatedNotes} onNotesChange={(v) => updateSession(session.id, { notes: v })}
      />
    </div>
  );
};

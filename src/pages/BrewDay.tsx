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
import type { Session, BrewEvent } from '../types/brewing';
import { StyleMatchSidebar } from '../components/recipe-builder';
import { calculateABV, calculateFG } from '../utils/brewingMath';

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
  }, [session?.id]); // Only run when session ID changes to avoid losing active index on update

  const activeEvent = session?.events[activeEventIndex];

  // Timer Logic
  useEffect(() => {
    if (timerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      // Play sound or notification?
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
    
    // Also move to next step if completing
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
    updateSession(session.id, { events: newEvents });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    // Reorder array
    if (!session) return;
    const newEvents = [...session.events];
    const draggedItem = newEvents[draggedItemIndex];
    newEvents.splice(draggedItemIndex, 1);
    newEvents.splice(index, 0, draggedItem);
    
    // Adjust active index if necessary
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

  // Recalculated Targets based on actuals
  const updatedTargets = useMemo(() => {
    if (!session) return null;
    const recipe = session.recipeSnapshot;
    let targetOG = recipe.targetOG;
    let targetVolume = recipe.batchVolume;

    // If pre-boil gravity and volume are known, we can predict OG
    if (session.actuals.preBoilGravity && session.actuals.preBoilVolume) {
      const preBoilPoints = (session.actuals.preBoilGravity - 1) * session.actuals.preBoilVolume;
      const expectedPostBoilVol = session.actuals.postBoilVolume || (session.actuals.preBoilVolume - (recipe.boilOffRate ?? recipe.equipment.boilOffRate) * (recipe.boilTime / 60));
      if (expectedPostBoilVol > 0) {
        targetOG = 1 + (preBoilPoints / expectedPostBoilVol);
        targetVolume = expectedPostBoilVol;
      }
    }
    
    // If post-boil (OG) is measured, use it directly
    if (session.actuals.og) targetOG = session.actuals.og;
    if (session.actuals.postBoilVolume) targetVolume = session.actuals.postBoilVolume;

    const primaryFermenter = recipe.fermenters[0];
    let fg = primaryFermenter.targetFG;
    let abv = primaryFermenter.targetABV;

    if (session.actuals.fg) {
      fg = session.actuals.fg;
      abv = calculateABV(targetOG, fg);
    } else if (targetOG !== recipe.targetOG) {
       fg = calculateFG(targetOG, primaryFermenter.yeast);
       abv = calculateABV(targetOG, fg);
    }

    const updatedFermenter = { ...primaryFermenter, targetFG: fg, targetABV: abv };

    return {
      sharedTargets: { targetOG, targetSRM: recipe.targetSRM, targetIBU: recipe.targetIBU },
      primaryFermenter: updatedFermenter,
      batchVolume: targetVolume
    };
  }, [session?.actuals, session?.recipeSnapshot]);

  if (!session) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Session not found.</div>;
  }

  const progress = session.events.length > 0 ? (session.events.filter(e => e.completed).length / session.events.length) * 100 : 0;

  const aggregatedNotes = session.events
    .filter(e => e.notes && e.notes.trim().length > 0)
    .map(e => `• ${e.label}: ${e.notes}`)
    .join('\n');

  return (
    <div className="brew-day-container">
      <style>{`
        .brew-day-container {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 5rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .brew-day-container {
            grid-template-columns: 1.5fr 1fr;
          }
        }
        .brew-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
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
        .event-item.dragging {
          opacity: 0.5;
        }
        .actuals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
          padding: 1.5rem;
          background: var(--bg-main);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .actual-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }
        .actual-input-group label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: bold;
        }
        .actual-input-group input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          padding: 0.6rem;
          border-radius: 6px;
          color: white;
          font-weight: bold;
        }
        .actual-input-group input:focus {
          border-color: var(--accent-primary);
          outline: none;
        }
        .metadata-box {
          background: rgba(0,0,0,0.2);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          text-align: left;
          font-size: 0.85rem;
          border: 1px solid rgba(255,255,255,0.05);
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
        <button 
          onClick={handleFinish}
          className="primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#4CAF50', borderColor: '#4CAF50' }}
        >
          FINISH BREW
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Hero Card / Active Action */}
        {activeEvent && (
          <div className="hero-card">
            <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              Current Step
            </div>
            <h1 style={{ margin: '0.5rem 0', fontSize: '2rem' }}>{activeEvent.label}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{activeEvent.subLabel}</p>

            {/* Rich Metadata Display */}
            {activeEvent.metadata?.salts && (
              <div className="metadata-box">
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Salts to Add:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {activeEvent.metadata.salts.map((s, i) => <li key={i}>{s.amount.toFixed(1)}{s.unit} {s.name}</li>)}
                </ul>
              </div>
            )}
            
            {activeEvent.metadata?.hopDetails && (
              <div className="metadata-box">
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Hop Details:</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{activeEvent.metadata.hopDetails.weight}g</span> {activeEvent.metadata.hopDetails.name} ({activeEvent.metadata.hopDetails.alpha}% AA)
                </div>
              </div>
            )}

            {/* Editable Actuals for this step */}
            {(activeEvent.targetValue !== undefined || activeEvent.targetTemp !== undefined) && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                {activeEvent.targetValue !== undefined && (
                  <div className="actual-input-group" style={{ flex: 1, maxWidth: '200px' }}>
                    <label>Actual {activeEvent.unit ? `(${activeEvent.unit})` : 'Value'} (Target: {activeEvent.targetValue})</label>
                    <input 
                      type="number" 
                      step="any"
                      value={activeEvent.actualValue || ''} 
                      onChange={e => updateActiveEvent({ actualValue: Number(e.target.value) })}
                      placeholder={activeEvent.targetValue.toString()}
                    />
                  </div>
                )}
                {activeEvent.targetTemp !== undefined && (
                  <div className="actual-input-group" style={{ flex: 1, maxWidth: '200px' }}>
                    <label>Actual Temp °C (Target: {activeEvent.targetTemp})</label>
                    <input 
                      type="number" 
                      step="any"
                      value={activeEvent.actualTemp || ''} 
                      onChange={e => updateActiveEvent({ actualTemp: Number(e.target.value) })}
                      placeholder={activeEvent.targetTemp.toString()}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step Notes */}
            <div className="actual-input-group" style={{ marginTop: '1.5rem' }}>
              <label>Step Notes / Comments</label>
              <textarea 
                style={{ width: '100%', minHeight: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem', color: 'white', resize: 'vertical', outline: 'none' }}
                placeholder="Any issues or observations for this step?"
                value={activeEvent.notes || ''}
                onChange={e => updateActiveEvent({ notes: e.target.value })}
              />
            </div>

            {/* Timer */}
            {activeEvent.duration && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                {timeLeft === null ? (
                  <button 
                    onClick={() => startTimer(activeEvent.duration!)}
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white' }}
                  >
                    <Play fill="var(--accent-primary)" color="var(--accent-primary)" /> START {activeEvent.duration}m TIMER
                  </button>
                ) : (
                  <div>
                    <div className="timer-display">{formatTime(timeLeft)}</div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => setTimerRunning(!timerRunning)}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white' }}
                      >
                        {timerRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />} {timerRunning ? 'PAUSE' : 'RESUME'}
                      </button>
                      <button 
                        onClick={() => setTimeLeft(activeEvent.duration! * 60)}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white' }}
                      >
                        <RotateCcw size={20} /> RESET
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button 
                className="primary"
                onClick={() => toggleEventCompletion(activeEventIndex)}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {activeEvent.completed ? 'MARK INCOMPLETE' : 'DONE • NEXT STEP'} {!activeEvent.completed && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Timeline</h3>
          <div className="event-list">
            {session.events.map((event, idx) => (
              <div 
                key={event.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`event-item ${event.completed ? 'completed' : ''} ${idx === activeEventIndex ? 'active' : ''} ${idx === draggedItemIndex ? 'dragging' : ''}`}
                onClick={() => setActiveEventIndex(idx)}
              >
                <div style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <GripVertical size={20} />
                </div>
                {event.completed ? (
                  <CheckCircle2 color="#4CAF50" size={24} />
                ) : (
                  <Circle color="var(--border-color)" size={24} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: event.completed ? 'var(--text-muted)' : 'white' }}>{event.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.subLabel}</div>
                </div>
                {event.duration && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {event.duration}m</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Actuals Global Section */}
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={18} /> Global Measured Actuals
          </h3>
          <div className="actuals-grid">
            <div className="actual-input-group">
              <label>Mash pH</label>
              <input type="number" step="0.01" value={session.actuals.mashPh || ''} onChange={e => handleActualChange('mashPh', Number(e.target.value))} placeholder="5.40" />
            </div>
            <div className="actual-input-group">
              <label>Pre-boil Vol (L)</label>
              <input type="number" step="0.1" value={session.actuals.preBoilVolume || ''} onChange={e => handleActualChange('preBoilVolume', Number(e.target.value))} placeholder="24.0" />
            </div>
            <div className="actual-input-group">
              <label>Pre-boil SG</label>
              <input type="number" step="0.001" value={session.actuals.preBoilGravity || ''} onChange={e => handleActualChange('preBoilGravity', Number(e.target.value))} placeholder="1.045" />
            </div>
            <div className="actual-input-group">
              <label>Post-boil Vol (L)</label>
              <input type="number" step="0.1" value={session.actuals.postBoilVolume || ''} onChange={e => handleActualChange('postBoilVolume', Number(e.target.value))} placeholder="19.0" />
            </div>
            <div className="actual-input-group">
              <label>Measured OG</label>
              <input type="number" step="0.001" value={session.actuals.og || ''} onChange={e => handleActualChange('og', Number(e.target.value))} placeholder="1.050" />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} /> Session Notes
          </h3>
          
          {aggregatedNotes && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', borderLeft: '3px solid var(--accent-primary)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>Step Comments</div>
              {aggregatedNotes}
            </div>
          )}

          <textarea 
            style={{ width: '100%', minHeight: '120px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', color: 'white', resize: 'vertical', outline: 'none' }}
            placeholder="Record overall observations, deviations, or smells..."
            value={session.notes}
            onChange={e => updateSession(session.id, { notes: e.target.value })}
          />
        </div>
      </div>

      {/* Sidebar with Updated Summary */}
      <div style={{ alignSelf: 'start', position: 'sticky', top: '5rem' }}>
         <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Predicted Result</h3>
         {updatedTargets && (
           <StyleMatchSidebar 
            activeStyle={session.recipeSnapshot.styleId ? { id: 'style', name: 'Target Style', category: '...', stats: { og: {min:1, max:1.2}, fg: {min:1, max:1.2}, abv: {min:0, max:20}, ibu: {min:0, max:150}, srm: {min:0, max:50} } } as any : null} 
            sharedTargets={updatedTargets.sharedTargets}
            primaryFermenter={updatedTargets.primaryFermenter}
            fermentables={session.recipeSnapshot.fermentables}
            kettleHops={session.recipeSnapshot.kettleHops}
            mashSteps={session.recipeSnapshot.mashSteps}
            activeTargetWater={session.recipeSnapshot.targetWaterProfile || session.recipeSnapshot.waterProfile || { id: 'w', name: 'W', calcium:0, magnesium:0, sodium:0, sulfate:0, chloride:0, bicarbonate:0 }}
            measurementSystem="metric"
            co2Volumes={2.5}
           />
         )}
      </div>

    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
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
  FlaskConical
} from 'lucide-react';
import type { Session } from '../types/brewing';

export const BrewDay = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, updateSession, completeSession } = useBrewStore();
  
  const session = sessions.find(s => s.id === sessionId);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (session) {
      setActiveEventIndex(session.currentEventIndex);
    }
  }, [session]);

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
    
    updateSession(session.id, { 
      events: newEvents,
      currentEventIndex: newEvents[index].completed ? Math.min(index + 1, newEvents.length - 1) : index
    });
  };

  const handleActualChange = (key: keyof Session['actuals'], value: number) => {
    if (!session) return;
    updateSession(session.id, {
      actuals: { ...session.actuals, [key]: value }
    });
  };

  const handleFinish = () => {
    if (!session) return;
    if (window.confirm('Are you sure you want to complete this brew day?')) {
      completeSession(session.id);
      navigate('/sessions');
    }
  };

  if (!session) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Session not found.</div>;
  }

  const progress = (session.events.filter(e => e.completed).length / session.events.length) * 100;

  return (
    <div className="brew-day-container">
      <style>{`
        .brew-day-container {
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 5rem;
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
        .actuals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--bg-main);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .actual-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .actual-input-group label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: bold;
        }
        .actual-input-group input {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 0.6rem;
          border-radius: 6px;
          color: white;
          font-weight: bold;
          text-align: center;
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

      {/* Hero Card / Active Action */}
      {activeEvent && (
        <div className="hero-card">
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
            Current Step
          </div>
          <h1 style={{ margin: '0.5rem 0', fontSize: '2rem' }}>{activeEvent.label}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{activeEvent.subLabel}</p>

          {activeEvent.duration && (
            <div style={{ marginTop: '1.5rem' }}>
              {timeLeft === null ? (
                <button 
                  onClick={() => startTimer(activeEvent.duration!)}
                  style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                >
                  <Play fill="currentColor" /> START {activeEvent.duration}m TIMER
                </button>
              ) : (
                <div>
                  <div className="timer-display">{formatTime(timeLeft)}</div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => setTimerRunning(!timerRunning)}
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {timerRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />} {timerRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button 
                      onClick={() => setTimeLeft(activeEvent.duration! * 60)}
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
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
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px' }}
            >
              DONE • NEXT STEP <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ padding: '0 1rem' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Timeline</h3>
        <div className="event-list">
          {session.events.map((event, idx) => (
            <div 
              key={event.id} 
              className={`event-item ${event.completed ? 'completed' : ''} ${idx === activeEventIndex ? 'active' : ''}`}
              onClick={() => setActiveEventIndex(idx)}
              style={{ cursor: 'pointer' }}
            >
              {event.completed ? (
                <CheckCircle2 color="#4CAF50" size={24} />
              ) : (
                <Circle color="var(--border-color)" size={24} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{event.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.subLabel}</div>
              </div>
              {event.duration && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {event.duration}m</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Actuals Section */}
      <div style={{ padding: '0 1rem', marginTop: '3rem' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={18} /> Measured Actuals
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
            <label>Measured OG</label>
            <input type="number" step="0.001" value={session.actuals.og || ''} onChange={e => handleActualChange('og', Number(e.target.value))} placeholder="1.050" />
          </div>
          <div className="actual-input-group">
            <label>Post-boil Vol (L)</label>
            <input type="number" step="0.1" value={session.actuals.postBoilVolume || ''} onChange={e => handleActualChange('postBoilVolume', Number(e.target.value))} placeholder="19.0" />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div style={{ padding: '0 1rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={18} /> Session Notes
        </h3>
        <textarea 
          style={{ width: '100%', minHeight: '150px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', color: 'white', resize: 'vertical', outline: 'none' }}
          placeholder="Record observations, deviations, or smells..."
          value={session.notes}
          onChange={e => updateSession(session.id, { notes: e.target.value })}
        />
      </div>
    </div>
  );
};

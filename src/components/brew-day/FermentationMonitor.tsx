import React, { useState } from 'react';
import { Activity, Play, Download, Pause, Clock3, Circle, TrendingUp, TrendingDown, Minus, CheckCircle2, Plus, Zap, Snowflake, Leaf, Settings, Calendar, Timer } from 'lucide-react';
import { RaptTelemetryChart } from '../recipe-builder/RaptTelemetryChart';
import type { Session, FermentationStep, RaptTelemetry, BrewEvent } from '../../types/brewing';
import type { TimelineMilestone, BrewInsights } from '../../hooks/useBrewCalculations';
import styles from '../../pages/BrewDay.module.css';

interface Props {
  session: Session;
  insights: BrewInsights | null;
  projectedData?: { unix: number; gravity: number; abv: number; temperature: number }[] | null;
  pillTelemetry?: RaptTelemetry;
  timelineMilestones: TimelineMilestone[];
  fermentationSteps: FermentationStep[];
  syncing: boolean;
  activeMilestoneId?: string | null;
  activeEvent?: BrewEvent | null;
  onStartLogging: () => void;
  onSyncHistory: () => void;
  onStopLogging: () => void;
  onUpdateSession: (updates: Partial<Session>) => void;
  onUpdateFermentStep: (stepId: string, updates: Partial<FermentationStep>) => void;
  updateActiveEvent?: (updates: Partial<BrewEvent>) => void;
  onToggleCompletion?: () => void;
  onToggleMilestone?: (id: string, type: 'lag' | 'phase' | 'hop' | 'crash') => void;
  onSelectMilestone?: (id: string, type: string) => void;
  onAutoScaleSchedule?: () => void;
  toLocalISO: (isoString?: string) => string;
}

export const FermentationMonitor: React.FC<Props> = React.memo(({
  session,
  insights,
  projectedData,
  pillTelemetry,
  timelineMilestones,
  fermentationSteps,
  syncing,
  activeMilestoneId,
  activeEvent,
  onStartLogging,
  onSyncHistory,
  onStopLogging,
  onUpdateSession,
  onUpdateFermentStep,
  updateActiveEvent,
  onToggleCompletion,
  onToggleMilestone,
  onSelectMilestone,
  onAutoScaleSchedule,
  toLocalISO
}) => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showLoggingSettings, setShowLoggingSettings] = useState(false);
  const [manualGravity, setManualGravity] = useState(insights?.currentSG || 1.050);
  const [manualTemp, setManualTemp] = useState(insights?.temp || 20);
  const [manualTime, setManualTime] = useState(new Date().toISOString().slice(0, 16));

  const handleAddManualReading = () => {
    const newPoint = {
      gravity: Number(manualGravity),
      temperature: Number(manualTemp),
      timestamp: new Date(manualTime).toISOString(),
      gravityVelocity: 0
    };

    const newData = [...(session.raptPillData || []), newPoint].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    onUpdateSession({ raptPillData: newData });
    setShowManualEntry(false);
  };

  const renderTrend = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return <TrendingUp size={12} color="#4CAF50" />;
    if (trend === 'down') return <TrendingDown size={12} color="#f44336" />;
    return <Minus size={12} color="var(--text-muted)" />;
  };

  const getIcon = (item: TimelineMilestone) => {
    if (item.isComplete) return <CheckCircle2 size={16} color="#4CAF50" />;
    if (item.type === 'hop') return <Leaf size={14} />;
    if (item.type === 'crash') return <Snowflake size={14} />;
    if (item.type === 'lag') return <Clock3 size={14} />;
    return <Circle size={14} />;
  };

  return (
    <div className={styles.fermentContainer} style={{ textAlign: 'left' }}>
      {/* 1. COMPACT HEADER */}
      <div className={styles.fermentHeader}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>
          <Activity size={16} /> FERMENTATION
        </h4>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {!session.raptLogStart ? (
            <button onClick={onStartLogging} className={styles.syncButton} style={{ padding: '0.3rem 0.6rem', fontSize: '0.65rem' }}>
              <Play size={12} fill="currentColor" /> START
            </button>
          ) : (
            <>
              {onAutoScaleSchedule && projectedData && (
                <button onClick={onAutoScaleSchedule} className={styles.syncButton} style={{ color: '#4CAF50', borderColor: '#4CAF50', padding: '0.3rem 0.6rem', fontSize: '0.65rem' }} title="Trajectory Auto-Calc">
                  <Zap size={12} fill="currentColor" /> AUTO
                </button>
              )}
              {session.raptPillId && (
                <button onClick={onSyncHistory} disabled={syncing} className={styles.syncButton} style={{ padding: '0.3rem 0.6rem', fontSize: '0.65rem' }} title="Sync RAPT">
                  <Download size={12} className={syncing ? styles.spin : ''} /> SYNC
                </button>
              )}
              <button onClick={() => { setShowLoggingSettings(!showLoggingSettings); setShowManualEntry(false); }} className={styles.syncButton} style={{ background: showLoggingSettings ? 'var(--bg-surface-hover)' : 'transparent', padding: '0.3rem 0.6rem', fontSize: '0.65rem' }} title="Logging Settings">
                <Settings size={12} /> LOGGING
              </button>
              <button onClick={() => { setShowManualEntry(!showManualEntry); setShowLoggingSettings(false); }} className={styles.syncButton} style={{ background: showManualEntry ? 'var(--bg-surface-hover)' : 'transparent', padding: '0.3rem 0.6rem', fontSize: '0.65rem' }} title="Add Manual Reading">
                <Plus size={12} /> MANUAL
              </button>
              {!session.raptLogEnd && (
                <button onClick={onStopLogging} className={styles.syncButton} style={{ borderColor: '#f44336', color: '#f44336', padding: '0.3rem 0.6rem', fontSize: '0.65rem' }}>
                  <Pause size={12} fill="currentColor" /> STOP
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. TOP ROW (Settings + Metrics) */}
      <div className={styles.fermentTopRow}>
        <div className={styles.fermentMetricsGrid}>
          {[
            { label: 'ABV', val: `${insights?.abv || '0.0'}%` },
            { label: 'ATTEN', val: `${insights?.attenuation.toFixed(0) || '0'}%` },
            { label: 'PP/DAY', val: insights?.ppd || '0.0', trend: insights?.ppdTrend },
            { label: 'SG', val: insights?.currentSG.toFixed(4) || '1.0000' },
            { label: 'TEMP', val: `${pillTelemetry?.temperature?.toFixed(1) || insights?.temp?.toFixed(1) || '---'}°C`, trend: insights?.tempTrend }
          ].map((m, i) => (
            <div key={i} className={styles.fermentMetricCard}>
              <div className={styles.fermentMetricValue} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {m.val} {m.trend && renderTrend(m.trend)}
              </div>
              <div className={styles.fermentMetricLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Modal for Logging Settings */}
        {showLoggingSettings && (
          <div className={styles.modalOverlay} onClick={() => setShowLoggingSettings(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={18} /> Logging Configuration
                </h3>
                <button onClick={() => setShowLoggingSettings(false)} className={styles.syncButton} style={{ border: 'none' }}>×</button>
              </div>
              <div className={styles.modalBody}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Adjust the start and end timestamps for RAPT data collection. This affects which data points are included in the graph.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.actualInputGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={12} /> Log Start
                    </label>
                    <input 
                      type="datetime-local" 
                      value={toLocalISO(session.raptLogStart)} 
                      onChange={(e) => onUpdateSession({ raptLogStart: new Date(e.target.value).toISOString() })} 
                    />
                  </div>
                  <div className={styles.actualInputGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Timer size={12} /> Log End
                    </label>
                    <input 
                      type="datetime-local" 
                      value={toLocalISO(session.raptLogEnd)} 
                      onChange={(e) => onUpdateSession({ raptLogEnd: new Date(e.target.value).toISOString() })} 
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setShowLoggingSettings(false)} className="primary" style={{ padding: '0.5rem 1.5rem' }}>CLOSE</button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Manual/Logging inputs adjacent to metrics on desktop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: showManualEntry ? '100%' : 'auto', maxWidth: '400px' }}>
          {showManualEntry && (
            <div style={{ background: 'var(--bg-main)', padding: '0.75rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <div className={styles.actualInputGroup}>
                <label style={{ fontSize: '0.55rem' }}>SG</label>
                <input type="number" step="0.001" value={manualGravity} onChange={(e) => setManualGravity(Number(e.target.value))} style={{ padding: '0.3rem', fontSize: '0.75rem', background: 'var(--bg-surface)' }} />
              </div>
              <div className={styles.actualInputGroup}>
                <label style={{ fontSize: '0.55rem' }}>TEMP</label>
                <input type="number" step="0.1" value={manualTemp} onChange={(e) => setManualTemp(Number(e.target.value))} style={{ padding: '0.3rem', fontSize: '0.75rem', background: 'var(--bg-surface)' }} />
              </div>
              <div className={styles.actualInputGroup}>
                <label style={{ fontSize: '0.55rem' }}>TIME</label>
                <input type="datetime-local" value={manualTime} onChange={(e) => setManualTime(e.target.value)} style={{ padding: '0.3rem', fontSize: '0.7rem', background: 'var(--bg-surface)' }} />
              </div>
              <button onClick={handleAddManualReading} className="primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>ADD</button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MIDDLE ROW (Phase Details Hero + Chart) */}
      <div className={styles.fermentMiddleRow}>
        {activeEvent && (
          <div className={styles.fermentPhaseDetails}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Active Phase</div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-display)', lineHeight: '1.1' }}>{activeEvent.label}</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleCompletion?.(); }}
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem', background: activeEvent.completed ? 'rgba(76, 175, 80, 0.15)' : 'var(--accent-primary)', color: activeEvent.completed ? '#4CAF50' : 'var(--bg-main)', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s', boxShadow: activeEvent.completed ? 'none' : '0 0 12px rgba(33, 150, 243, 0.3)' }}
              >
                {activeEvent.completed && <CheckCircle2 size={12} />}
                {activeEvent.completed ? 'DONE' : 'COMPLETE'}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', alignItems: 'flex-start' }}>
              {activeEvent.targetValue !== undefined && (
                <div className={styles.actualInputGroup} style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: '0.6rem' }}>{activeEvent.unit || 'VAL'} (Tgt: {activeEvent.targetValue})</label>
                  <input type="number" step="any" value={activeEvent.actualValue || ''} onChange={e => updateActiveEvent?.({ actualValue: Number(e.target.value) })} style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'var(--bg-main)' }} />
                </div>
              )}
              {activeEvent.targetTemp !== undefined && (
                <div className={styles.actualInputGroup} style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: '0.6rem' }}>TEMP (Tgt: {activeEvent.targetTemp})</label>
                  <input type="number" step="any" value={activeEvent.actualTemp || ''} onChange={e => updateActiveEvent?.({ actualTemp: Number(e.target.value) })} style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'var(--bg-main)' }} />
                </div>
              )}
              <div className={styles.actualInputGroup} style={{ flex: '2 1 300px' }}>
                <label style={{ fontSize: '0.6rem' }}>OBSERVATIONS</label>
                <textarea 
                  style={{ width: '100%', minHeight: '40px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '0.6rem', color: 'white', resize: 'vertical', outline: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-sans)', borderRadius: '0' }} 
                  placeholder="Log activity..."
                  value={activeEvent.notes || ''} 
                  onChange={e => updateActiveEvent?.({ notes: e.target.value })} 
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.fermentChartArea}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Telemetry Graph</h5>
          </div>
          <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '400px', overflow: 'hidden' }}>
            <RaptTelemetryChart 
              data={session.raptPillData || []} 
              projectedData={projectedData}
              timelineMilestones={timelineMilestones}
              fermentationSteps={fermentationSteps} 
              logStart={session.raptLogStart} 
              targetOG={session.actuals.og || session.recipeSnapshot.targetOG} 
              targetFG={session.recipeSnapshot.fermenters[0]?.targetFG} 
              activePhaseId={activeMilestoneId}
              height="100%"
              hideCard={true}
            />
          </div>
        </div>
      </div>
      
      {/* 4. DENSE TIMELINE */}
      <div style={{ borderTop: '2px solid var(--bg-surface-hover)', paddingTop: '1.25rem' }}>
        <h5 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>Batch Schedule</h5>
        <div className={styles.fermentTimeline}>
          {timelineMilestones.map((item, idx) => {
            const isPast = new Date() > item.date;
            const isActive = activeMilestoneId === item.id;
            
            return (
              <div 
                key={item.id + idx} 
                className={styles.fermentStepCard} 
                style={{ 
                  minWidth: '280px',
                  background: isActive ? 'var(--bg-surface-hover)' : 'var(--bg-surface-inset)',
                  borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-color)',
                  opacity: item.isComplete ? 0.6 : 1,
                  cursor: onSelectMilestone ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => onSelectMilestone?.(item.id, item.type)}
              >
                {item.progress !== undefined && item.progress > 0 && item.progress < 100 && !isPast && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${item.progress}%`, background: 'rgba(76, 175, 80, 0.08)', pointerEvents: 'none', zIndex: 0 }} />
                )}

                <div 
                  style={{ width: '28px', height: '28px', borderRadius: '0', background: isPast || item.isComplete || isActive ? (isActive ? 'var(--accent-primary)' : 'var(--bg-surface-highest)') : 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'var(--bg-main)' : (item.isComplete ? '#4CAF50' : (isPast ? 'var(--accent-primary)' : 'var(--text-muted)')), cursor: 'default', zIndex: 1 }}
                  onClick={(e) => {
                    if (onToggleMilestone && item.type !== 'lag') {
                      e.stopPropagation();
                      onToggleMilestone(item.id, item.type);
                    }
                  }}
                >
                  {getIcon(item)}
                </div>
                <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isPast || item.isComplete ? 'white' : 'var(--text-primary)', textDecoration: item.isComplete ? 'line-through' : 'none', fontFamily: 'var(--font-sans)' }}>{item.name}</div>
                    {item.progress !== undefined && item.progress > 0 && item.progress < 100 && (
                      <span style={{ fontSize: '0.6rem', color: '#4CAF50', fontWeight: 'bold', background: 'rgba(76, 175, 80, 0.15)', padding: '1px 3px' }}>{item.progress}%</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isPast || item.isComplete ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {item.type === 'phase' || item.type === 'crash' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <input type="number" className={styles.stepTimeInput} value={item.days} onChange={(e) => onUpdateFermentStep(item.id, { stepTime: Number(e.target.value) })} />d @ <input type="number" className={styles.stepTimeInput} value={item.temp} onChange={(e) => onUpdateFermentStep(item.id, { stepTemp: Number(e.target.value) })} />°C
                      </span>
                    ) : item.type === 'hop' ? (
                      <span>{item.weight}g addition</span>
                    ) : (
                      <span>Observed: {item.days}d</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', zIndex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isPast || item.isComplete ? 'white' : 'var(--text-primary)' }}>
                    {item.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                    {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

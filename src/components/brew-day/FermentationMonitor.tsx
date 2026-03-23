import React, { useState, useCallback } from 'react';
import { Activity, Play, Download, Pause, Clock3, Circle, TrendingUp, TrendingDown, Minus, CheckCircle2, Plus, Zap, Snowflake, Leaf, Settings, X } from 'lucide-react';
import { RaptTelemetryChart } from '../recipe-builder/RaptTelemetryChart';
import type { Session, FermentationStep, RaptTelemetry, BrewEvent } from '../../types/brewing';
import type { TimelineMilestone, BrewInsights } from '../../hooks/useBrewCalculations';
import styles from './FermentationMonitor.module.css';

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
  
  const [manualGravity, setManualGravity] = useState<string | number>(insights?.currentSG?.toFixed(3) || '1.050');
  const [manualTemp, setManualTemp] = useState<string | number>(insights?.temp?.toFixed(1) || '20.0');
  const [manualTime, setManualTime] = useState(new Date().toISOString().slice(0, 16));

  const handleAddManualReading = useCallback(() => {
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
  }, [manualGravity, manualTemp, manualTime, session.raptPillData, onUpdateSession]);

  const renderTrend = (trend?: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return <TrendingUp size={20} color="#4CAF50" />;
    if (trend === 'down') return <TrendingDown size={20} color="#f44336" />;
    return <Minus size={20} color="var(--text-muted)" />;
  };

  const getIcon = (item: TimelineMilestone) => {
    if (item.isComplete) return <CheckCircle2 size={20} color="#4CAF50" />;
    if (item.type === 'hop') return <Leaf size={18} />;
    if (item.type === 'crash') return <Snowflake size={18} />;
    if (item.type === 'lag') return <Clock3 size={18} />;
    return <Circle size={18} />;
  };

  return (
    <div className={styles.container}>
      {/* 1. HEADER & TOOLBAR */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Activity size={28} /> Fermentation Control
        </h2>
        <div className={styles.toolbar}>
          {!session.raptLogStart ? (
            <button onClick={onStartLogging} className={`${styles.btn} ${styles.btnPrimary}`}>
              <Play size={16} fill="currentColor" /> Start Logging
            </button>
          ) : (
            <>
              {onAutoScaleSchedule && projectedData && (
                <button onClick={onAutoScaleSchedule} className={styles.btn} title="Auto-Scale Trajectory" style={{ color: '#4CAF50', borderColor: '#4CAF50' }}>
                  <Zap size={16} fill="currentColor" /> Auto Calc
                </button>
              )}
              {session.raptPillId && (
                <button onClick={onSyncHistory} disabled={syncing} className={styles.btn} title="Sync RAPT Data">
                  <Download size={16} className={syncing ? 'spin' : ''} /> Sync
                </button>
              )}
              <button 
                onClick={() => { setShowLoggingSettings(!showLoggingSettings); setShowManualEntry(false); }} 
                className={`${styles.btn} ${showLoggingSettings ? styles.btnActive : ''}`}
              >
                <Settings size={16} /> Config
              </button>
              <button 
                onClick={() => { setShowManualEntry(!showManualEntry); setShowLoggingSettings(false); }} 
                className={`${styles.btn} ${showManualEntry ? styles.btnActive : ''}`}
              >
                <Plus size={16} /> Manual Reading
              </button>
              {!session.raptLogEnd && (
                <button onClick={onStopLogging} className={`${styles.btn} ${styles.btnDanger}`}>
                  <Pause size={16} fill="currentColor" /> Stop
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MANUAL ENTRY DROPDOWN */}
      {showManualEntry && (
        <div className={styles.panel} style={{ background: 'var(--bg-surface-inset)', padding: '16px', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px' }}>
          <div className={styles.inputGroup} style={{ flex: '1 1 150px' }}>
            <label>Specific Gravity</label>
            <input type="number" step="0.001" value={manualGravity} onChange={(e) => setManualGravity(e.target.value)} />
          </div>
          <div className={styles.inputGroup} style={{ flex: '1 1 150px' }}>
            <label>Temperature (°C)</label>
            <input type="number" step="0.1" value={manualTemp} onChange={(e) => setManualTemp(e.target.value)} />
          </div>
          <div className={styles.inputGroup} style={{ flex: '1 1 200px' }}>
            <label>Time</label>
            <input type="datetime-local" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
          </div>
          <button onClick={handleAddManualReading} className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '12px 24px', height: 'max-content' }}>
            Save Reading
          </button>
        </div>
      )}

      {/* LOGGING CONFIG MODAL */}
      {showLoggingSettings && (
        <div className={styles.panel} style={{ background: 'var(--bg-surface-inset)', padding: '16px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
            Telemetry Configuration
            <X size={18} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowLoggingSettings(false)} />
          </h4>
          <div className={styles.twoCol}>
            <div className={styles.inputGroup}>
              <label>Log Start</label>
              <input type="datetime-local" value={toLocalISO(session.raptLogStart)} onChange={(e) => onUpdateSession({ raptLogStart: new Date(e.target.value).toISOString() })} />
            </div>
            <div className={styles.inputGroup}>
              <label>Log End</label>
              <input type="datetime-local" value={toLocalISO(session.raptLogEnd)} onChange={(e) => onUpdateSession({ raptLogEnd: new Date(e.target.value).toISOString() })} />
            </div>
          </div>
        </div>
      )}

      {/* 2. METRICS GRID */}
      <div className={styles.metricsGrid}>
        {[
          { label: 'ABV', val: `${insights?.abv?.toFixed(1) || '0.0'}%` },
          { label: 'Attenuation', val: `${insights?.attenuation?.toFixed(0) || '0'}%` },
          { label: 'Pts / Day', val: insights?.ppd || '0.0', trend: insights?.ppdTrend },
          { label: 'Current SG', val: insights?.currentSG?.toFixed(4) || '1.0000' },
          { label: 'Temperature', val: `${pillTelemetry?.temperature?.toFixed(1) || insights?.temp?.toFixed(1) || '---'}°C`, trend: insights?.tempTrend }
        ].map((m, i) => (
          <div key={i} className={styles.metricCard}>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={styles.metricValue}>
              {m.val} {m.trend && renderTrend(m.trend)}
            </div>
          </div>
        ))}
      </div>

      {/* 3. GRAPH AREA */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Profile & Telemetry</h3>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
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

      {/* 4. BOTTOM PANELS (Active Phase & Timeline side-by-side) */}
      <div className={styles.bottomGrid}>
        
        {/* LEFT: ACTIVE PHASE CONTROL */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Active Phase</h3>
            {activeEvent && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleCompletion?.(); }}
                className={styles.btn}
                style={{
                  background: activeEvent.completed ? 'rgba(76, 175, 80, 0.1)' : 'var(--accent-primary)',
                  color: activeEvent.completed ? '#4CAF50' : 'var(--bg-main)',
                  border: 'none'
                }}
              >
                {activeEvent.completed && <CheckCircle2 size={16} />}
                {activeEvent.completed ? 'Completed' : 'Mark Complete'}
              </button>
            )}
          </div>
          
          {activeEvent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)' }}>
                  {activeEvent.label}
                </div>
              </div>
              
              <div className={styles.twoCol}>
                {activeEvent.targetValue !== undefined && (
                  <div className={styles.inputGroup}>
                    <label>Actual {activeEvent.unit || 'Value'} (Target: {activeEvent.targetValue})</label>
                    <input type="number" step="any" value={activeEvent.actualValue || ''} onChange={e => updateActiveEvent?.({ actualValue: Number(e.target.value) })} placeholder={`E.g. ${activeEvent.targetValue}`} />
                  </div>
                )}
                {activeEvent.targetTemp !== undefined && (
                  <div className={styles.inputGroup}>
                    <label>Actual Temp °C (Target: {activeEvent.targetTemp})</label>
                    <input type="number" step="any" value={activeEvent.actualTemp || ''} onChange={e => updateActiveEvent?.({ actualTemp: Number(e.target.value) })} placeholder={`E.g. ${activeEvent.targetTemp}`} />
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Observation Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Record aromas, activity level, gravity readings..."
                  value={activeEvent.notes || ''} 
                  onChange={e => updateActiveEvent?.({ notes: e.target.value })} 
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No fermentation phase is currently active.
            </div>
          )}
        </div>

        {/* RIGHT: TIMELINE */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Schedule</h3>
          </div>
          <div className={styles.timeline}>
            {timelineMilestones.map((item, idx) => {
              const isPast = new Date() > item.date;
              const isActive = activeMilestoneId === item.id;
              
              return (
                <div 
                  key={item.id + idx} 
                  className={`${styles.timelineItem} ${isActive ? styles.timelineItemActive : ''}`}
                  style={{ opacity: item.isComplete ? 0.6 : 1 }}
                  onClick={() => onSelectMilestone?.(item.id, item.type)}
                >
                  <div className={styles.timelineIcon} onClick={(e) => {
                    if (onToggleMilestone && item.type !== 'lag') {
                      e.stopPropagation();
                      onToggleMilestone(item.id, item.type);
                    }
                  }}>
                    {getIcon(item)}
                  </div>
                  
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineRow}>
                      <span className={styles.timelineTitle} style={{ textDecoration: item.isComplete ? 'line-through' : 'none' }}>
                        {item.name}
                        {item.progress !== undefined && item.progress > 0 && item.progress < 100 && !isPast && (
                          <span style={{ fontSize: '0.7rem', color: '#4CAF50', marginLeft: '8px', background: 'rgba(76,175,80,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.progress.toFixed(0)}%
                          </span>
                        )}
                      </span>
                      <span className={styles.timelineDate}>
                        {item.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className={styles.timelineDetails}>
                      {item.type === 'phase' || item.type === 'crash' ? (
                        <>
                          <input 
                            type="number" 
                            className={styles.inlineInput} 
                            value={item.days} 
                            onChange={(e) => onUpdateFermentStep(item.id, { stepTime: Number(e.target.value) })} 
                            onClick={(e) => e.stopPropagation()}
                          /> days @ 
                          <input 
                            type="number" 
                            className={styles.inlineInput} 
                            value={item.temp} 
                            onChange={(e) => onUpdateFermentStep(item.id, { stepTemp: Number(e.target.value) })} 
                            onClick={(e) => e.stopPropagation()}
                          /> °C
                        </>
                      ) : item.type === 'hop' ? (
                        <span>{item.weight}g addition</span>
                      ) : (
                        <span>Observed duration: {item.days}d</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
});

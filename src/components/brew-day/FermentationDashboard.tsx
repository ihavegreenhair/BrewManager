import React, { useState, useCallback } from 'react';
import { Activity, Play, Download, Pause, Settings, Plus, Zap, CheckCircle2, Leaf, Snowflake, Clock3, Circle } from 'lucide-react';
import { RaptTelemetryChart } from '../recipe-builder/RaptTelemetryChart';
import type { Session, FermentationStep, RaptTelemetry, BrewEvent } from '../../types/brewing';
import type { TimelineMilestone, BrewInsights } from '../../hooks/useBrewCalculations';
import styles from './FermentationDashboard.module.css';

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

export const FermentationDashboard: React.FC<Props> = React.memo(({
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
  const [showConfig, setShowConfig] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualGravity, setManualGravity] = useState<string>(insights?.currentSG?.toFixed(3) || '1.050');
  const [manualTemp, setManualTemp] = useState<string>(insights?.temp?.toFixed(1) || '20.0');
  const [manualTime, setManualTime] = useState<string>(new Date().toISOString().slice(0, 16));

  const handleSaveManualReading = useCallback(() => {
    const newPoint = {
      gravity: Number(manualGravity),
      temperature: Number(manualTemp),
      timestamp: new Date(manualTime).toISOString(),
      gravityVelocity: 0
    };
    const currentData = session.raptPillData || [];
    const newData = [...currentData, newPoint].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    onUpdateSession({ raptPillData: newData });
    setShowManual(false);
  }, [manualGravity, manualTemp, manualTime, session.raptPillData, onUpdateSession]);

  return (
    <div className={styles.dashboard}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Activity size={22} color="#60a5fa" /> Fermentation
        </h2>
        
        <div className={styles.actions}>
          {!session.raptLogStart ? (
            <button onClick={onStartLogging} className={`${styles.actionBtn} ${styles.primaryBtn}`}>
              <Play size={16} /> Start
            </button>
          ) : (
            <>
              {onAutoScaleSchedule && projectedData && (
                <button onClick={onAutoScaleSchedule} className={styles.actionBtn} style={{ color: '#34d399', borderColor: '#34d399' }}>
                  <Zap size={16} /> Auto-Calc
                </button>
              )}
              {session.raptPillId && (
                <button onClick={onSyncHistory} disabled={syncing} className={styles.actionBtn}>
                  <Download size={16} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} /> Sync
                </button>
              )}
              <button 
                onClick={() => { setShowConfig(!showConfig); setShowManual(false); }} 
                className={styles.actionBtn}
                style={showConfig ? { background: '#374151' } : {}}
              >
                <Settings size={16} /> Config
              </button>
              <button 
                onClick={() => { setShowManual(!showManual); setShowConfig(false); }} 
                className={styles.actionBtn}
                style={showManual ? { background: '#374151' } : {}}
              >
                <Plus size={16} /> Manual
              </button>
              {!session.raptLogEnd && (
                <button onClick={onStopLogging} className={`${styles.actionBtn} ${styles.dangerBtn}`}>
                  <Pause size={16} /> Stop
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* DROPDOWNS */}
      {showManual && (
        <div className={styles.sectionBox} style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label>Specific Gravity</label>
            <input type="number" step="0.001" value={manualGravity} onChange={e => setManualGravity(e.target.value)} />
          </div>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label>Temp (°C)</label>
            <input type="number" step="0.1" value={manualTemp} onChange={e => setManualTemp(e.target.value)} />
          </div>
          <div className={styles.inputGroup} style={{ flex: 1.5 }}>
            <label>Timestamp</label>
            <input type="datetime-local" value={manualTime} onChange={e => setManualTime(e.target.value)} />
          </div>
          <button onClick={handleSaveManualReading} className={`${styles.actionBtn} ${styles.primaryBtn}`} style={{ height: '42px', padding: '0 2rem' }}>
            Save Reading
          </button>
        </div>
      )}

      {showConfig && (
        <div className={styles.sectionBox}>
          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label>Log Start Time</label>
              <input type="datetime-local" value={toLocalISO(session.raptLogStart)} onChange={e => onUpdateSession({ raptLogStart: new Date(e.target.value).toISOString() })} />
            </div>
            <div className={styles.inputGroup}>
              <label>Log End Time</label>
              <input type="datetime-local" value={toLocalISO(session.raptLogEnd)} onChange={e => onUpdateSession({ raptLogEnd: new Date(e.target.value).toISOString() })} />
            </div>
          </div>
        </div>
      )}

      {/* KPI GRID */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>ABV</span>
          <span className={styles.kpiValue}>{insights?.abv?.toFixed(1) || '0.0'}%</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Attenuation</span>
          <span className={styles.kpiValue}>{insights?.attenuation?.toFixed(0) || '0'}%</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Points / Day</span>
          <span className={styles.kpiValue}>{insights?.ppd || '0.0'}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Current SG</span>
          <span className={styles.kpiValue} style={{ color: '#60a5fa' }}>{insights?.currentSG?.toFixed(4) || '1.0000'}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Temperature</span>
          <span className={styles.kpiValue} style={{ color: '#f87171' }}>{pillTelemetry?.temperature?.toFixed(1) || insights?.temp?.toFixed(1) || '--'}°C</span>
        </div>
      </div>

      {/* ORIGINAL CHART IMPLEMENTATION */}
      <div className={styles.chartWrapper}>
        <RaptTelemetryChart 
          data={session.raptPillData || []} 
          projectedData={projectedData}
          timelineMilestones={timelineMilestones}
          fermentationSteps={fermentationSteps} 
          logStart={session.raptLogStart} 
          targetOG={insights?.og || session.actuals.og || session.recipeSnapshot.targetOG} 
          targetFG={session.recipeSnapshot.fermenters[0]?.targetFG} 
          activePhaseId={activeMilestoneId}
          height="100%"
          hideCard={true}
        />
      </div>

      {/* BOTTOM SPLIT */}
      <div className={styles.splitView}>
        {/* Active Phase Controls */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>
            Current Phase Details
            {activeEvent && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleCompletion?.(); }}
                className={styles.actionBtn}
                style={activeEvent.completed ? { background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', borderColor: '#34d399' } : { background: '#60a5fa', color: '#111418', borderColor: '#60a5fa' }}
              >
                {activeEvent.completed && <CheckCircle2 size={16} />}
                {activeEvent.completed ? 'Completed' : 'Complete Phase'}
              </button>
            )}
          </h3>

          {activeEvent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                {activeEvent.label}
              </div>

              <div className={styles.grid2}>
                {activeEvent.targetValue !== undefined && (
                  <div className={styles.inputGroup}>
                    <label>Actual {activeEvent.unit || 'Value'} (Target: {activeEvent.targetValue})</label>
                    <input type="number" step="any" value={activeEvent.actualValue || ''} onChange={e => updateActiveEvent?.({ actualValue: Number(e.target.value) })} />
                  </div>
                )}
                {activeEvent.targetTemp !== undefined && (
                  <div className={styles.inputGroup}>
                    <label>Actual Temp °C (Target: {activeEvent.targetTemp})</label>
                    <input type="number" step="any" value={activeEvent.actualTemp || ''} onChange={e => updateActiveEvent?.({ actualTemp: Number(e.target.value) })} />
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Phase Notes & Observations</label>
                <textarea 
                  rows={4} 
                  placeholder="Record gravity readings, off-flavors, visual activity..." 
                  value={activeEvent.notes || ''} 
                  onChange={e => updateActiveEvent?.({ notes: e.target.value })} 
                />
              </div>
            </div>
          ) : (
            <div style={{ color: '#6b7280', padding: '2rem', textAlign: 'center' }}>
              No active phase currently selected.
            </div>
          )}
        </div>

        {/* Schedule / Timeline */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>Fermentation Schedule</h3>
          
          <div className={styles.list}>
            {timelineMilestones.map((item, idx) => {
              const isActive = activeMilestoneId === item.id;
              
              let Icon = Circle;
              if (item.isComplete) Icon = CheckCircle2;
              else if (item.type === 'hop') Icon = Leaf;
              else if (item.type === 'crash') Icon = Snowflake;
              else if (item.type === 'lag') Icon = Clock3;

              return (
                <div 
                  key={item.id + idx} 
                  className={`${styles.listItem} ${isActive ? styles.active : ''}`}
                  style={{ opacity: item.isComplete ? 0.5 : 1 }}
                  onClick={() => onSelectMilestone?.(item.id, item.type)}
                >
                  <div 
                    className={styles.listIcon} 
                    onClick={(e) => {
                      if (onToggleMilestone && item.type !== 'lag') {
                        e.stopPropagation();
                        onToggleMilestone(item.id, item.type);
                      }
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  
                  <div className={styles.listContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.listTitle} style={item.isComplete ? { textDecoration: 'line-through' } : {}}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className={styles.listSubtitle}>
                      {item.type === 'phase' || item.type === 'crash' ? (
                        <>
                          <input type="number" className={styles.inlineEdit} value={item.days} onChange={e => onUpdateFermentStep(item.id, { stepTime: Number(e.target.value) })} onClick={e => e.stopPropagation()} /> days @ 
                          <input type="number" className={styles.inlineEdit} value={item.temp} onChange={e => onUpdateFermentStep(item.id, { stepTemp: Number(e.target.value) })} onClick={e => e.stopPropagation()} /> °C
                        </>
                      ) : item.type === 'hop' ? (
                        <span>{item.weight}g addition</span>
                      ) : (
                        <span>{item.days}d duration</span>
                      )}

                      {item.progress !== undefined && item.progress > 0 && item.progress < 100 && (
                        <span style={{ marginLeft: 'auto', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
                          {item.progress.toFixed(0)}%
                        </span>
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

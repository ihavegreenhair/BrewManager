import React from 'react';
import { Play, Pause, RotateCcw, Zap, CheckCircle2 } from 'lucide-react';
import type { BrewEvent, RaptTelemetry } from '../../types/brewing';
import { HopVarietyPicker } from '../recipe-builder/HopVarietyPicker';
import { YeastVarietyPicker } from '../recipe-builder/YeastVarietyPicker';
import styles from '../../pages/BrewDay.module.css';

interface Props {
  activeEvent: BrewEvent;
  isActive: boolean;
  bzTelemetry?: RaptTelemetry;
  timeLeft: number | null;
  timerRunning: boolean;
  onStartTimer: (mins: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  formatTime: (seconds: number) => string;
  updateActiveEvent: (updates: Partial<BrewEvent>) => void;
  handleSwapHop: (newVariety: any) => void;
  handleSwapYeast: (newVariety: any) => void;
  updateDetailedActual: (id: string, value: number) => void;
  onToggleCompletion: () => void;
  children?: React.ReactNode;
}

export const StepHero = React.memo<Props>(({
  activeEvent,
  isActive,
  bzTelemetry,
  timeLeft,
  timerRunning,
  onStartTimer,
  onToggleTimer,
  onResetTimer,
  formatTime,
  updateActiveEvent,
  handleSwapHop,
  handleSwapYeast,
  updateDetailedActual,
  onToggleCompletion,
  children
}) => {
  return (
    <div 
      className={`${styles.heroCard} ${activeEvent.completed ? styles.heroCompleted : ''} ${isActive ? styles.heroActive : ''}`}
      style={{ 
        opacity: isActive ? 1 : 0.6,
        transform: isActive ? 'scale(1)' : 'scale(0.98)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        filter: isActive ? 'none' : 'grayscale(30%)',
        border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
        scrollSnapAlign: 'center',
        padding: isActive ? '2rem' : '0.75rem 1.5rem',
        marginBottom: isActive ? '2rem' : '0.25rem'
      }}
    >
      {/* ... */}
      {bzTelemetry && (activeEvent.type === 'mash' || activeEvent.type === 'boil' || activeEvent.type === 'cooling') && (
        <div className={styles.raptOverlay}>
          <Zap size={12} fill="currentColor" />
          <span>BZ: <strong>{bzTelemetry.temperature?.toFixed(1)}°C</strong></span>
        </div>
      )}
      
      {isActive && (
        <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.15em' }}>
          Current Step
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isActive ? 'center' : 'flex-start', gap: '0.75rem' }}>
        {!isActive && activeEvent.completed && <CheckCircle2 color="var(--status-success)" size={16} />}
        <h1 style={{ margin: '0.25rem 0', fontFamily: 'var(--font-display)', fontSize: isActive ? '2.5rem' : '1.1rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{activeEvent.label}</h1>
      </div>
      
      {isActive && <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '1.2rem', marginTop: '0.5rem' }}>{activeEvent.subLabel}</p>}

      {/* Inputs only visible if active to collapse non-selected steps */}
      {isActive && (
        <div style={{ pointerEvents: 'auto' }}> 
          {activeEvent.type === 'hop' && (
            <div className={styles.detailedActualsGrid} style={{ marginBottom: '1rem', background: 'var(--bg-surface-inset)', padding: '1.5rem', borderRadius: '0' }}>
              <div className={styles.actualInputGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Hop Variety</label>
                <HopVarietyPicker 
                  value={activeEvent.metadata?.hopDetails?.name || ''} 
                  onChange={handleSwapHop} 
                  onFocus={()=>{}} 
                  onBlur={()=>{}} 
                />
              </div>
              <div className={styles.actualInputGroup}>
                <label>Stage</label>
                <select value={activeEvent.hopUse} onChange={e => updateActiveEvent({ hopUse: e.target.value as any })}>
                  <option value="boil">Boil</option>
                  <option value="whirlpool">Whirlpool</option>
                  <option value="dry_hop">Dry Hop</option>
                  <option value="first_wort">First Wort</option>
                </select>
              </div>
              <div className={styles.actualInputGroup}>
                <label>{activeEvent.hopUse === 'dry_hop' ? 'Day' : 'Mins'}</label>
                <input type="number" value={activeEvent.hopTime ?? ''} onChange={e => updateActiveEvent({ hopTime: Number(e.target.value) })} />
              </div>
              {(activeEvent.hopUse === 'whirlpool' || activeEvent.hopUse === 'aroma') && (
                <div className={styles.actualInputGroup}>
                  <label>Temp °C</label>
                  <input type="number" value={activeEvent.hopTemp ?? ''} onChange={e => updateActiveEvent({ hopTemp: Number(e.target.value) })} />
                </div>
              )}
            </div>
          )}

          {activeEvent.type === 'yeast' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', background: 'var(--bg-surface-inset)', padding: '1.5rem', borderRadius: '0' }}>
              <div className={styles.actualInputGroup}>
                <label>Yeast Strain</label>
                <YeastVarietyPicker 
                  value={activeEvent.metadata?.yeastDetails?.name || ''} 
                  onChange={handleSwapYeast} 
                  onFocus={()=>{}} 
                  onBlur={()=>{}} 
                />
              </div>
            </div>
          )}

          <div className={styles.detailedActualsGrid}>
            {activeEvent.targetValue !== undefined && (
              <div className={styles.actualInputGroup}>
                <label>Actual {activeEvent.unit || 'Weight/Vol'} (Target: {activeEvent.targetValue})</label>
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
              <div className={styles.actualInputGroup}>
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
            {activeEvent.duration !== undefined && (
              <div className={styles.actualInputGroup}>
                <label>Actual Time (min) (Target: {activeEvent.duration})</label>
                <input 
                  type="number" 
                  step="1" 
                  value={activeEvent.actualDuration || ''} 
                  onChange={e => updateActiveEvent({ actualDuration: Number(e.target.value) })} 
                  placeholder={activeEvent.duration.toString()} 
                />
              </div>
            )}
          </div>

          {activeEvent.detailedActuals && activeEvent.detailedActuals.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <div className={styles.detailedActualsGrid} style={{ marginTop: 0 }}>
                {activeEvent.detailedActuals.map(da => (
                  <div key={da.id} className={styles.actualInputGroup}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{activeEvent.label === 'Mash In' ? 'Grain Variety' : da.label} ({da.unit})</span>
                      <span>Target: {da.target}</span>
                    </label>
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

          <div className={styles.actualInputGroup} style={{ marginTop: '1.5rem' }}>
            <label>Step Notes</label>
            <textarea 
              style={{ width: '100%', minHeight: '60px', fontFamily: 'var(--font-sans)', background: 'var(--bg-surface-inset)', border: '1px solid var(--border-color)', borderRadius: '0', padding: '0.8rem', color: 'white', resize: 'vertical', outline: 'none' }} 
              placeholder="Any observations?" 
              value={activeEvent.notes || ''} 
              onChange={e => updateActiveEvent({ notes: e.target.value })} 
            />
          </div>
        </div>
      )}

      {isActive && children}

      {isActive && activeEvent.duration && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          {timeLeft === null ? (
            <button onClick={() => onStartTimer(activeEvent.duration!)} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 700, borderRadius: '0', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--accent-soft)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
              <Play fill="currentColor" size={20} /> START {activeEvent.duration}m TIMER
            </button>
          ) : (
            <div>
              <div className={styles.timerDisplay}>{formatTime(timeLeft)}</div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={onToggleTimer} style={{ padding: '0.75rem 2rem', fontFamily: 'var(--font-display)', fontWeight: 600, borderRadius: '0', cursor: 'pointer', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {timerRunning ? <Pause fill="currentColor" size={16} /> : <Play fill="currentColor" size={16} />} {timerRunning ? 'PAUSE' : 'RESUME'}
                </button>
                <button onClick={onResetTimer} style={{ padding: '0.75rem 2rem', fontFamily: 'var(--font-display)', fontWeight: 600, borderRadius: '0', cursor: 'pointer', background: 'var(--bg-surface-inset)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RotateCcw size={16} /> RESET
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isActive && (
        <div style={{ marginTop: '2rem' }}>
          <button 
            className={activeEvent.completed ? '' : 'primary'} 
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompletion();
            }} 
            style={{ 
              width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontWeight: 700, borderRadius: '0', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              background: activeEvent.completed ? 'var(--bg-surface-highest)' : 'var(--accent-primary)',
              color: activeEvent.completed ? 'var(--status-success)' : '#003258', /* Kinetic text-on-primary */
              border: 'none',
              borderBottom: activeEvent.completed ? '2px solid var(--status-success)' : 'none',
              opacity: isActive ? 1 : 0.5
            }}
          >
            {activeEvent.completed ? <CheckCircle2 size={24} /> : null}
            {activeEvent.completed ? 'COMPLETED' : 'MARK STEP COMPLETE'} 
            {isActive && !activeEvent.completed && <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>→</span>}
          </button>
        </div>
      )}
    </div>
  );
});

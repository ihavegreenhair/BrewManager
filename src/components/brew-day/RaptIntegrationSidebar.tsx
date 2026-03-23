import React from 'react';
import { Zap, ExternalLink, Unlink, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Session, RaptDevice, RaptTelemetry, RaptSettings } from '../../types/brewing';
import { StyleMatchSidebar } from '../recipe-builder';
import { bjcpStyles } from '../../data/bjcp';
import { baStyles } from '../../data/ba';
import { GlobalActualsGrid } from './GlobalActualsGrid';
import styles from '../../pages/BrewDay.module.css';

const allStyles = [...bjcpStyles, ...baStyles];

interface Props {
  session: Session;
  raptSettings: RaptSettings;
  raptDevices: RaptDevice[];
  bzTelemetry?: RaptTelemetry;
  pillTelemetry?: RaptTelemetry;
  updatedTargets: any;
  onLinkBrewZilla: (id: string) => void;
  onLinkPill: (id: string) => void;
  onUpdateSession: (updates: Partial<Session>) => void;
  actuals?: Session['actuals'];
  computedActuals?: Partial<Session['actuals']> | null;
  onActualChange?: (key: keyof Session['actuals'], value: number) => void;
  notes?: string;
  aggregatedNotes?: string;
  onNotesChange?: (value: string) => void;
}

export const RaptIntegrationSidebar: React.FC<Props> = React.memo(({
  session,
  raptSettings,
  raptDevices,
  bzTelemetry,
  pillTelemetry,
  updatedTargets,
  onLinkBrewZilla,
  onLinkPill,
  onUpdateSession,
  actuals,
  computedActuals,
  onActualChange,
  notes,
  aggregatedNotes,
  onNotesChange
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ alignSelf: 'start', position: 'sticky', top: '5rem' }}>
      <div className={styles.raptCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="var(--accent-primary)" fill="var(--accent-primary)" /> RAPT Devices
          </h3>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Configure <ExternalLink size={10} />
          </button>
        </div>

        {raptSettings.username ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>BrewZilla</div>
              {session.raptBrewZillaId ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    {raptDevices.find(d => d.id === session.raptBrewZillaId)?.name || 'Linked Device'}
                    {bzTelemetry && (
                      <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.2rem' }}>
                        {bzTelemetry.temperature?.toFixed(1)}°C
                      </div>
                    )}
                  </div>
                  <button onClick={() => onUpdateSession({ raptBrewZillaId: undefined })} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Unlink size={16} />
                  </button>
                </div>
              ) : (
                <select 
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }} 
                  onChange={(e) => onLinkBrewZilla(e.target.value)} 
                  value=""
                >
                  <option value="" disabled>Link BrewZilla...</option>
                  {raptDevices.filter(d => d.type === 'BrewZilla').map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>RAPT Pill</div>
              {session.raptPillId ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    {raptDevices.find(d => d.id === session.raptPillId)?.name || 'Linked Pill'}
                    {pillTelemetry && (
                      <div style={{ marginTop: '0.2rem' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1rem' }}>{pillTelemetry.gravity?.toFixed(4)}</span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>{pillTelemetry.temperature?.toFixed(1)}°C</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => onUpdateSession({ raptPillId: undefined })} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Unlink size={16} />
                  </button>
                </div>
              ) : (
                <select 
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }} 
                  onChange={(e) => onLinkPill(e.target.value)} 
                  value=""
                >
                  <option value="" disabled>Link RAPT Pill...</option>
                  {raptDevices.filter(d => d.type === 'RAPTPill').map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Configure RAPT credentials in Settings to enable real-time tracking.
          </p>
        )}
      </div>

      {/* Global Measured Actuals — relocated from main scroll area for permanent visibility */}
      {actuals && onActualChange && (
        <div className={styles.raptCard} style={{ marginTop: '1rem' }}>
          <GlobalActualsGrid actuals={actuals} computed={computedActuals} onActualChange={onActualChange} />
        </div>
      )}

      {/* Session Notes — relocated for permanent sidebar visibility */}
      {onNotesChange && (
        <div className={styles.raptCard} style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={16} /> Session Notes
          </h3>
          {aggregatedNotes && (
            <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', borderLeft: '3px solid var(--accent-primary)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 'bold' }}>Step Comments</div>
              {aggregatedNotes}
            </div>
          )}
          <textarea 
            style={{ width: '100%', minHeight: '80px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', color: 'white', resize: 'vertical', outline: 'none', fontSize: '0.8rem' }} 
            placeholder="Record overall observations..." 
            value={notes || ''} 
            onChange={e => onNotesChange(e.target.value)} 
          />
        </div>
      )}

      <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '1rem' }}>
        Predicted Result
      </h3>
      {updatedTargets && (
        <StyleMatchSidebar 
          activeStyle={session.recipeSnapshot.styleId ? allStyles.find(s => s.id === session.recipeSnapshot.styleId) || null : null} 
          sharedTargets={updatedTargets.sharedTargets} 
          primaryFermenter={updatedTargets.primaryFermenter} 
          fermentables={updatedTargets.fermentables} 
          kettleHops={updatedTargets.hops} 
          mashSteps={updatedTargets.mashSteps} 
          activeTargetWater={updatedTargets.activeTargetWater} 
          predictedPH={updatedTargets.mergedActuals.mashPh} 
          measurementSystem="metric" 
          co2Volumes={session.recipeSnapshot.co2Volumes || 2.5} 
        />
      )}
    </div>
  );
});

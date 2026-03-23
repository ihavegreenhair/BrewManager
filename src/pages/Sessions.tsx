import { useNavigate } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import { Play, CheckCircle2, Zap } from 'lucide-react';
import { useRaptTelemetry } from '../hooks/useRaptTelemetry';

const SessionItem = ({ session, onClick }: { session: any, onClick: () => void }) => {
  const { telemetry: pillTelemetry } = useRaptTelemetry(session.raptPillId);
  const progress = (session.events.filter((e: any) => e.completed).length / session.events.length) * 100;

  return (
    <div 
      onClick={onClick}
      style={{ 
        background: 'linear-gradient(180deg, var(--bg-surface-hover) 0%, var(--bg-surface) 100%)', 
        padding: '2rem', 
        borderRadius: '0',
        border: 'none',
        borderLeft: '2px solid var(--accent-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'none'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--accent-glow)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0', margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{session.name}</h3>
          {session.raptPillId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--bg-main)', background: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '0', fontWeight: 'bold' }}>
              <Zap size={12} fill="currentColor" /> RAPT LIVE
            </div>
          )}
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Started {new Date(session.date).toLocaleDateString()}</span>
          {pillTelemetry && (
            <div style={{ marginTop: '0.75rem', fontSize: '1rem', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1.5rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>SG</span> 
                <strong style={{ color: 'var(--accent-primary)' }}>{pillTelemetry.gravity?.toFixed(4)}</strong>
              </span>
              <span style={{ color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>Temp</span> 
                <strong style={{ color: 'var(--accent-secondary)' }}>{pillTelemetry.temperature?.toFixed(1)}°C</strong>
              </span>
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--accent-primary)', lineHeight: 1 }}>{Math.round(progress)}%</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Progress</div>
      </div>
    </div>
  );
};

export const Sessions = () => {
  const { sessions } = useBrewStore();
  const navigate = useNavigate();

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>Brew Sessions</h2>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={18} fill="currentColor" /> ACTIVE STREAMS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activeSessions.map(session => (
               <SessionItem key={session.id} session={session} onClick={() => navigate(`/brew-day/${session.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> ARCHIVED LOGS
        </h3>
        
        {completedSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-surface-inset)', borderLeft: '2px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.1rem' }}>No completed sessions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {completedSessions.map(session => (
               <div key={session.id} style={{ 
                 background: 'var(--bg-surface-inset)', 
                 padding: '1.5rem 2rem', 
                 borderRadius: '0',
                 border: 'none',
                 borderLeft: '2px solid var(--border-color)',
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 transition: 'all 0.2s ease',
                 cursor: 'pointer'
               }}
               onClick={() => navigate(`/brew-day/${session.id}`)}
               onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = 'var(--status-success)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-surface-inset)'; }}
               >
                 <div>
                   <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{session.name}</h3>
                   <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{new Date(session.date).toLocaleDateString()}</span>
                 </div>
                 <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '1rem', display: 'flex', gap: '1.5rem' }}>
                   <div style={{ color: 'var(--text-primary)' }}>
                     <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>OG</span>
                     {session.actuals.og?.toFixed(4) || '---'}
                   </div>
                   <div style={{ color: 'var(--accent-secondary)' }}>
                     <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>FG</span>
                     {session.actuals.fg?.toFixed(4) || '---'}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { useNavigate } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import { History, Play, CheckCircle2 } from 'lucide-react';

export const Sessions = () => {
  const { sessions } = useBrewStore();
  const navigate = useNavigate();

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <History size={28} color="var(--accent-primary)" />
        <h2>Brew Sessions</h2>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={16} fill="currentColor" /> Active Sessions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeSessions.map(session => {
              const progress = (session.events.filter(e => e.completed).length / session.events.length) * 100;
              return (
                <div 
                  key={session.id} 
                  onClick={() => navigate(`/brew-day/${session.id}`)}
                  style={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    padding: '1.5rem', 
                    borderRadius: '12px',
                    border: '1px solid var(--accent-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>{session.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Started {new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{Math.round(progress)}%</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      <div>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> Completed Sessions
        </h3>
        
        {completedSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--border-radius)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No completed sessions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {completedSessions.map(session => (
              <div key={session.id} style={{ 
                backgroundColor: 'var(--bg-surface)', 
                padding: '1.25rem', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.25rem' }}>{session.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>OG: <span style={{ color: 'white' }}>{session.actuals.og?.toFixed(3) || '---'}</span></div>
                  <div style={{ color: 'var(--text-secondary)' }}>FG: <span style={{ color: 'white' }}>{session.actuals.fg?.toFixed(3) || '---'}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

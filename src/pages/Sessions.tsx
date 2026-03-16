import { useBrewStore } from '../store/useBrewStore';
import { History } from 'lucide-react';

export const Sessions = () => {
  const { sessions, recipes } = useBrewStore();

  const getRecipeName = (id: string) => {
    return recipes.find(r => r.id === id)?.name || 'Unknown Recipe';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <History size={28} color="var(--accent-primary)" />
        <h2>Brew Sessions</h2>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--border-radius)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No active or past sessions.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Go to a Recipe to start a new brew session.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map(session => (
            <div key={session.id} style={{ 
              backgroundColor: 'var(--bg-surface)', 
              padding: '1.5rem', 
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>{getRecipeName(session.recipeId)}</h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(session.date).toLocaleDateString()}</span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <div>OG: {session.measuredOG ? session.measuredOG.toFixed(3) : '---'}</div>
                <div>FG: {session.measuredFG ? session.measuredFG.toFixed(3) : '---'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

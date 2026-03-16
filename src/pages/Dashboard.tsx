import { useBrewStore } from '../store/useBrewStore';

export const Dashboard = () => {
  const { recipes, sessions } = useBrewStore();
  
  return (
    <div>
      <h2>Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Welcome to BrewManager. Your command center for crafting the perfect brew.
      </p>
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' 
      }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3>Active Brews</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            {sessions.filter(s => !s.measuredFG).length}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3>Total Recipes</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            {recipes.length}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3>Completed Sessions</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            {sessions.filter(s => s.measuredFG).length}
          </p>
        </div>
      </div>
    </div>
  );
};


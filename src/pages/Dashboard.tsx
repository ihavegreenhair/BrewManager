import { useBrewStore } from '../store/useBrewStore';

export const Dashboard = () => {
  const { recipes, sessions } = useBrewStore();
  
  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        .dashboard-header {
          margin-bottom: 3rem;
          border-left: 4px solid var(--accent-primary);
          padding-left: 1rem;
        }
        .dashboard-header h2 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          margin: 0;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .dashboard-welcome {
          color: var(--text-secondary);
          margin-top: 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        }
        .stat-card {
          background: linear-gradient(180deg, var(--bg-surface-hover) 0%, var(--bg-surface) 100%);
          padding: 2rem;
          border-radius: 0;
          border-left: 2px solid var(--border-color);
          position: relative;
        }
        .stat-card:hover {
          border-left-color: var(--accent-primary);
          box-shadow: var(--accent-glow);
        }
        .stat-card h3 {
          font-family: var(--font-sans);
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 3.5rem;
          color: var(--text-primary);
          font-weight: 700;
          line-height: 1;
        }
        .stat-value.active { color: var(--accent-secondary); }
        .stat-value.completed { color: var(--status-success); }
      `}</style>
      
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-welcome">
          Brewprint Engineering Command Center
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Brews</h3>
          <p className="stat-value active">
            {sessions.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Recipes</h3>
          <p className="stat-value">
            {recipes.length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Completed Sessions</h3>
          <p className="stat-value completed">
            {sessions.filter(s => s.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
};


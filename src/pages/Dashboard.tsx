import { useBrewStore } from '../store/useBrewStore';

export const Dashboard = () => {
  const { recipes, sessions } = useBrewStore();
  
  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          max-width: 1000px;
        }
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-welcome {
          color: var(--text-secondary);
          margin-top: 1rem;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 2rem;
        }
        @media (min-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }
        .stat-card {
          background-color: var(--bg-surface);
          padding: 1.5rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }
        .stat-value {
          font-size: 2rem;
          color: var(--accent-primary);
          font-weight: bold;
          margin-top: 0.5rem;
        }
      `}</style>
      
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-welcome">
          Welcome to Brewprint. Your engineering command center for technical brewing.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Brews</h3>
          <p className="stat-value">
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
          <p className="stat-value">
            {sessions.filter(s => s.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
};


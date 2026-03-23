import { Link } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import { Plus, Beer } from 'lucide-react';

export const Recipes = () => {
  const { recipes } = useBrewStore();

  return (
    <div className="recipes-container">
      <style>{`
        .recipes-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        .recipes-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
          border-left: 4px solid var(--accent-primary);
          padding-left: 1rem;
        }
        .recipes-header h2 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          margin: 0;
          line-height: 1;
        }
        @media (min-width: 640px) {
          .recipes-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .recipe-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .recipe-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }
        }
        .recipe-card {
           background: linear-gradient(180deg, var(--bg-surface-hover) 0%, var(--bg-surface) 100%);
           padding: 2rem; 
           border-radius: 0;
           border: none;
           border-left: 2px solid var(--border-color);
           transition: all 0.2s ease;
           cursor: pointer;
           height: 100%;
        }
        .recipe-card:hover {
          border-left-color: var(--accent-primary);
          box-shadow: var(--accent-glow);
        }
        .recipe-card h3 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        .recipe-card-style {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .recipe-metrics {
          display: flex;
          gap: 1.5rem;
          font-family: var(--font-mono);
          font-size: 1rem;
          color: var(--accent-primary);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1rem;
        }
        .recipe-metric-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .new-recipe-btn {
          font-family: var(--font-display);
          font-weight: 700;
          border-radius: 0;
          padding: 1rem 2rem;
          letter-spacing: 0.05em;
        }
      `}</style>
      
      <div className="recipes-header">
        <h2>Recipe Book</h2>
        <Link to="/recipes/new" style={{ textDecoration: 'none' }}>
          <button className="primary new-recipe-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
            <Plus size={18} strokeWidth={3} /> NEW RECIPE
          </button>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-surface-inset)', borderLeft: '2px solid var(--border-color)' }}>
          <Beer size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', textTransform: 'uppercase' }}>No recipes found. Create your first brew.</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <Link key={recipe.id} to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="recipe-card">
                <h3>{recipe.name}</h3>
                <p className="recipe-card-style">{recipe.styleId || 'No Style Selected'}</p>
                
                <div className="recipe-metrics">
                  <div>
                    <div className="recipe-metric-label">Target OG</div>
                    {recipe.targetOG.toFixed(3)}
                  </div>
                  <div>
                    <div className="recipe-metric-label">Est. IBU</div>
                    {recipe.targetIBU}
                  </div>
                  <div>
                    <div className="recipe-metric-label">Target ABV</div>
                    {recipe.fermenters[0]?.targetABV.toFixed(1) || 0}%
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

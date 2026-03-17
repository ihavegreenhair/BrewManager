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
        }
        .recipes-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
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
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .recipe-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          }
        }
        .recipe-card {
          background-color: var(--bg-surface); 
          padding: 1.5rem; 
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
          cursor: pointer;
          height: 100%;
        }
        .recipe-card:hover {
          border-color: var(--accent-primary);
          background-color: var(--bg-surface-hover);
        }
      `}</style>
      
      <div className="recipes-header">
        <h2>Recipe Book</h2>
        <Link to="/recipes/new" style={{ textDecoration: 'none' }}>
          <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
            <Plus size={16} /> New Recipe
          </button>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Beer size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <p>No recipes found. Create your first brew!</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <Link key={recipe.id} to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="recipe-card">
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{recipe.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{recipe.styleId || 'No Style Selected'}</p>
                
                <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  <div>OG: {recipe.targetOG.toFixed(3)}</div>
                  <div>IBU: {recipe.targetIBU}</div>
                  <div>ABV: {recipe.fermenters[0]?.targetABV.toFixed(1) || 0}%</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

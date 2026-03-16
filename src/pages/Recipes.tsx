import { Link } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import { Plus, Beer } from 'lucide-react';

export const Recipes = () => {
  const { recipes } = useBrewStore();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Recipe Book</h2>
        <Link to="/recipes/new">
          <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {recipes.map(recipe => (
            <div key={recipe.id} style={{ 
              backgroundColor: 'var(--bg-surface)', 
              padding: '1.5rem', 
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{recipe.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{recipe.styleId || 'No Style Selected'}</p>
              
              <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                <div>OG: {recipe.targetOG.toFixed(3)}</div>
                <div>IBU: {recipe.targetIBU}</div>
                <div>ABV: {recipe.fermenters[0]?.targetABV.toFixed(1) || 0}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface RecipeHeaderProps {
  measurementSystem: string;
  setMeasurementSystem: (system: 'metric' | 'imperial') => void;
  onImport: () => void;
  onExport: () => void;
  onSave: () => void;
}

export const RecipeHeader = ({
  measurementSystem, setMeasurementSystem, onImport, onExport, onSave
}: RecipeHeaderProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h2 style={{ margin: 0 }}>Recipe Builder</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--bg-surface)', 
          padding: '2px', 
          borderRadius: '20px', 
          border: '1px solid var(--border-color)',
          marginRight: '0.5rem'
        }}>
          <button 
            type="button" 
            onClick={() => setMeasurementSystem('metric')}
            style={{ 
              padding: '0.3rem 0.8rem', 
              borderRadius: '18px', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              border: 'none',
              backgroundColor: measurementSystem === 'metric' ? 'var(--accent-primary)' : 'transparent',
              color: measurementSystem === 'metric' ? '#0F172A' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >METRIC</button>
          <button 
            type="button" 
            onClick={() => setMeasurementSystem('imperial')}
            style={{ 
              padding: '0.3rem 0.8rem', 
              borderRadius: '18px', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              border: 'none',
              backgroundColor: measurementSystem === 'imperial' ? 'var(--accent-primary)' : 'transparent',
              color: measurementSystem === 'imperial' ? '#0F172A' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >US/IMP</button>
        </div>
        <button type="button" onClick={onImport} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Import JSON</button>
        <button type="button" onClick={onExport} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Export JSON</button>
        <button className="primary" onClick={onSave} style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>Save Recipe</button>
      </div>
    </div>
  );
};

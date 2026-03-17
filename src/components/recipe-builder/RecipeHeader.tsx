import { useState } from 'react';
import { Menu, X, Save, Upload, Download } from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      <style>{`
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }
        .desktop-actions {
          display: none;
          gap: 0.75rem;
          align-items: center;
        }
        .mobile-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .unit-toggle {
          display: flex; 
          background-color: var(--bg-surface); 
          padding: 2px; 
          border-radius: 20px; 
          border: 1px solid var(--border-color);
        }
        .unit-btn {
          padding: 0.3rem 0.8rem; 
          border-radius: 18px; 
          fontSize: 0.65rem; 
          fontWeight: bold;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mobile-menu {
          position: absolute;
          top: 100%;
          right: 0;
          left: 0;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 1rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: var(--shadow-md);
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .menu-item:hover {
          background-color: var(--bg-surface-hover);
        }
        @media (min-width: 768px) {
          .desktop-actions {
            display: flex;
          }
          .mobile-toggle {
            display: none;
          }
          .header-container {
            margin-bottom: 2rem;
          }
        }
      `}</style>

      <div className="header-container">
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Recipe Builder</h2>
        
        {/* Mobile Toggle & Save */}
        <div className="mobile-toggle">
          <button 
            className="primary" 
            onClick={onSave} 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={14} /> SAVE
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ padding: '0.4rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="desktop-actions">
          <div className="unit-toggle">
            <button 
              type="button" 
              onClick={() => setMeasurementSystem('metric')}
              className="unit-btn"
              style={{ 
                backgroundColor: measurementSystem === 'metric' ? 'var(--accent-primary)' : 'transparent',
                color: measurementSystem === 'metric' ? '#0F172A' : 'var(--text-muted)'
              }}
            >METRIC</button>
            <button 
              type="button" 
              onClick={() => setMeasurementSystem('imperial')}
              className="unit-btn"
              style={{ 
                backgroundColor: measurementSystem === 'imperial' ? 'var(--accent-primary)' : 'transparent',
                color: measurementSystem === 'imperial' ? '#0F172A' : 'var(--text-muted)'
              }}
            >US/IMP</button>
          </div>
          <button type="button" onClick={onImport} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Import JSON</button>
          <button type="button" onClick={onExport} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Export JSON</button>
          <button className="primary" onClick={onSave} style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>Save Recipe</button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Units</span>
            <div className="unit-toggle">
              <button 
                onClick={() => setMeasurementSystem('metric')}
                className="unit-btn"
                style={{ 
                  backgroundColor: measurementSystem === 'metric' ? 'var(--accent-primary)' : 'transparent',
                  color: measurementSystem === 'metric' ? '#0F172A' : 'var(--text-muted)',
                  fontSize: '0.6rem'
                }}
              >METRIC</button>
              <button 
                onClick={() => setMeasurementSystem('imperial')}
                className="unit-btn"
                style={{ 
                  backgroundColor: measurementSystem === 'imperial' ? 'var(--accent-primary)' : 'transparent',
                  color: measurementSystem === 'imperial' ? '#0F172A' : 'var(--text-muted)',
                  fontSize: '0.6rem'
                }}
              >US/IMP</button>
            </div>
          </div>
          
          <button className="menu-item" onClick={() => { onImport(); setIsMenuOpen(false); }}>
            <Upload size={18} /> Import Recipe (JSON)
          </button>
          <button className="menu-item" onClick={() => { onExport(); setIsMenuOpen(false); }}>
            <Download size={18} /> Export Recipe (JSON)
          </button>
          <button className="menu-item" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={() => { onSave(); setIsMenuOpen(false); }}>
            <Save size={18} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

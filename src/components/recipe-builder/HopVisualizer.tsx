import React from 'react';
import type { HopVariety } from '../../types/brewing';
import { RadarChart } from './RadarChart';

interface HopVisualizerProps {
  variety: HopVariety;
}

export const HopVisualizer: React.FC<HopVisualizerProps> = ({ variety }) => {
  const m = variety.oilBreakdown.myrcene?.avg || 0;
  const h = variety.oilBreakdown.humulene?.avg || 0;
  const c = variety.oilBreakdown.caryophyllene?.avg || 0;
  const f = variety.oilBreakdown.farnesene?.avg || 0;
  
  // Normalize scores to a 0-5 scale
  const scores = {
    Fruity: Math.min(5, (m / 15) + (variety.tags.includes('tropical_fruit') || variety.tags.includes('citrus') ? 1.5 : 0)),
    Floral: Math.min(5, (f / 3) + (variety.tags.includes('floral') ? 1.5 : 0.5)),
    Herbaceous: Math.min(5, (f / 5) + (c / 10) + (variety.tags.includes('herbal') ? 1 : 0.5)),
    Spicy: Math.min(5, (h / 8) + (variety.tags.includes('spicy') ? 1 : 0.5)),
    Earthy: Math.min(5, (c / 6) + (h / 15) + (variety.tags.includes('earthy') ? 1 : 0.5))
  };

  const oils = [
    { name: 'Myrcene', value: variety.oilBreakdown.myrcene?.avg || 0, color: '#FFD700' },
    { name: 'Humulene', value: variety.oilBreakdown.humulene?.avg || 0, color: '#90EE90' },
    { name: 'Caryophyllene', value: variety.oilBreakdown.caryophyllene?.avg || 0, color: '#FFA07A' },
    { name: 'Farnesene', value: variety.oilBreakdown.farnesene?.avg || 0, color: '#ADD8E6' }
  ].filter(o => o.value > 0);

  const barStyle = (width: number, color: string): React.CSSProperties => ({
    width: `${width}%`,
    height: '6px',
    backgroundColor: color,
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  });

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1.25rem',
      backgroundColor: 'rgba(0,0,0,0.25)',
      borderRadius: '12px',
      fontSize: '0.85rem',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* Left: Oils Bar Chart */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oil Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {oils.map(o => (
              <div key={o.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                  <span>{o.name}</span>
                  <span>{o.value}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', height: '6px' }}>
                  <div style={barStyle(o.value, o.color)} />
                </div>
              </div>
            ))}
            {oils.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.7rem' }}>Data unavailable</span>}
            
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Total Oils: </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{variety.totalOils.avg} mL/100g</span>
            </div>
          </div>
        </div>

        {/* Center: Aroma Spider Chart */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
           <RadarChart scores={scores} size={160} />
        </div>

        {/* Right: Info & Tags Section */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aroma Profile</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {variety.tags.map(tag => (
              <span key={tag} style={{
                padding: '0.25rem 0.6rem',
                backgroundColor: 'rgba(var(--accent-primary-rgb, 90, 178, 103), 0.12)',
                color: 'var(--accent-primary)',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                border: '1px solid rgba(var(--accent-primary-rgb, 90, 178, 103), 0.2)'
              }}>
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.5', fontStyle: 'italic', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
            {variety.flavorProfile.length > 150 ? variety.flavorProfile.substring(0, 150) + '...' : variety.flavorProfile}
          </div>

          {variety.substitutes.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Substitutes: </span>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{variety.substitutes.slice(0, 3).join(', ')}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};


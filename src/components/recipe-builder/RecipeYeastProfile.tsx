import React, { useMemo, useState } from 'react';
import type { Yeast } from '../../types/brewing';
import { yeasts as allYeasts } from '../../data/yeasts';

interface RecipeYeastProfileProps {
  pitchedYeasts: Yeast[];
  compact?: boolean;
}

const getTagColor = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('fruit') || t.includes('apple') || t.includes('pear') || t.includes('peach') || t.includes('apricot') || t.includes('banana') || t.includes('tropical') || t.includes('citrus'))
    return { bg: 'rgba(255, 165, 0, 0.1)', text: '#FFA500', border: 'rgba(255, 165, 0, 0.3)' }; // Orange/Fruity
  if (t.includes('spicy') || t.includes('clove') || t.includes('pepper') || t.includes('phenolic'))
    return { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63', border: 'rgba(233, 30, 99, 0.3)' }; // Pink/Spicy
  if (t.includes('clean') || t.includes('neutral') || t.includes('crisp'))
    return { bg: 'rgba(33, 150, 243, 0.1)', text: '#2196F3', border: 'rgba(33, 150, 243, 0.3)' }; // Blue/Clean
  if (t.includes('malt') || t.includes('biscuit') || t.includes('bread') || t.includes('nutty') || t.includes('caramel'))
    return { bg: 'rgba(121, 85, 72, 0.1)', text: '#795548', border: 'rgba(121, 85, 72, 0.3)' }; // Brown/Malty
  if (t.includes('funk') || t.includes('sour') || t.includes('tart') || t.includes('wild') || t.includes('earthy'))
    return { bg: 'rgba(76, 175, 80, 0.1)', text: '#4CAF50', border: 'rgba(76, 175, 80, 0.3)' }; // Green/Funky
  return { bg: 'rgba(var(--accent-primary-rgb, 255, 179, 0), 0.1)', text: 'var(--accent-primary)', border: 'rgba(var(--accent-primary-rgb, 255, 179, 0), 0.2)' };
};

const RadarChart: React.FC<{ scores: Record<string, number> }> = ({ scores }) => {
  const categories = Object.keys(scores);
  const size = 180;
  const center = size / 2;
  const radius = size * 0.3;

  const points = categories.map((cat, i) => {
    const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
    const value = Math.min(1, scores[cat] / 5); // Scale 0-5
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1.0].map(r => {
    return categories.map((_, i) => {
      const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
      const x = center + radius * r * Math.cos(angle);
      const y = center + radius * r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {gridPoints.map((gp, i) => (
        <polygon key={i} points={gp} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {categories.map((_, i) => {
        const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      <polygon points={points} fill="rgba(var(--accent-primary-rgb, 255, 179, 0), 0.4)" stroke="var(--accent-primary)" strokeWidth="2" />
      {categories.map((cat, i) => {
        const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
        const x = center + (radius + 18) * Math.cos(angle);
        const y = center + (radius + 18) * Math.sin(angle);
        return (
          <text key={cat} x={x} y={y} fontSize="8" fill="#BBB" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {cat}
          </text>
        );
      })}
    </svg>
  );
};

export const RecipeYeastProfile: React.FC<RecipeYeastProfileProps> = ({ pitchedYeasts, compact }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const profile = useMemo(() => {
    // ... same as before
    if (pitchedYeasts.length === 0) return null;

    const scores = { fruity: 0, spicy: 0, maltiness: 0, clean: 0, funky: 0 };
    const tags = new Set<string>();
    let count = 0;

    pitchedYeasts.forEach(py => {
      const variety = py.customVariety || allYeasts.find(v => v.name === py.name);
      if (variety) {
        count++;
        if (variety.characteristicScores) {
          scores.fruity += variety.characteristicScores.fruity;
          scores.spicy += variety.characteristicScores.spicy;
          scores.maltiness += variety.characteristicScores.maltiness;
          scores.clean += variety.characteristicScores.clean;
          scores.funky += variety.characteristicScores.funky;
        }
        variety.tags?.forEach(tag => tags.add(tag));
      }
    });

    if (count === 0) return null;

    const flavorProfiles = pitchedYeasts
      .map(py => py.customVariety || allYeasts.find(v => v.name === py.name))
      .filter(v => v && v.flavorProfile)
      .map(v => ({ name: v!.name, profile: v!.flavorProfile }));

    return {
      scores: {
        fruity: scores.fruity / count,
        spicy: scores.spicy / count,
        maltiness: scores.maltiness / count,
        clean: scores.clean / count,
        funky: scores.funky / count,
      },
      topTags: Array.from(tags).slice(0, 8),
      flavorProfiles
    };
  }, [pitchedYeasts]);

  if (!profile) return null;

  return (
    <div style={{
      padding: compact ? '1rem 0 0 0' : (isCollapsed ? '0.75rem 1rem' : '1.5rem'),
      backgroundColor: compact ? 'transparent' : 'var(--bg-main)',
      borderRadius: '8px',
      border: compact ? 'none' : '1px solid var(--border-color)',
      borderTop: compact ? '1px solid var(--border-color)' : (compact ? 'none' : '1px solid var(--border-color)'),
      marginTop: compact ? '1.5rem' : '0',
      marginBottom: compact ? '0' : '1.5rem'
    }}>
      {!compact && (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            marginBottom: isCollapsed ? 0 : '1rem'
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h3 style={{ 
            margin: 0, 
            fontSize: '0.8rem', 
            color: 'var(--text-main)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em' 
          }}>
            Yeast Character Profile
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isCollapsed && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {profile.topTags.slice(0, 3).map(tag => {
                  const colors = getTagColor(tag);
                  return (
                    <span key={tag} style={{
                      padding: '0.1rem 0.4rem',
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '3px',
                      fontSize: '0.6rem',
                      fontWeight: 'bold'
                    }}>
                      #{tag.replace(/_/g, ' ')}
                    </span>
                  );
                })}
              </div>
            )}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{isCollapsed ? '⊕' : '−'}</span>
          </div>
        </div>
      )}
      
      {(compact || !isCollapsed) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <RadarChart scores={profile.scores} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Predicted Flavor Contribution</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {profile.topTags.map(tag => {
                const colors = getTagColor(tag);
                return (
                  <span key={tag} style={{
                    padding: '0.2rem 0.6rem',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    #{tag.replace(/_/g, ' ')}
                  </span>
                );
              })}
            </div>
            
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Average attenuation: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{pitchedYeasts.reduce((acc, y) => acc + y.attenuation, 0) / pitchedYeasts.length}%</span>
            </div>

            {profile.flavorProfiles.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {profile.flavorProfiles.map((fp, i) => (
                  <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4', fontStyle: 'italic', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold', fontStyle: 'normal', color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>{fp.name} Profile</span>
                    {fp.profile}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

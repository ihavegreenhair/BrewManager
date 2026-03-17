import React, { useMemo, useState } from 'react';
import type { Hop } from '../../types/brewing';
import { hops as allHops } from '../../data/hops';
import { calculateHopProfile, calculateSingleHopIBU, getHopRetention } from '../../utils/brewingMath';
import { RadarChart } from './RadarChart';

interface RecipeHopProfileProps {
  kettleHops: Hop[];
  dryHops?: Hop[];
  targetOG?: number;
  batchVolume?: number;
  boilVolume?: number;
}

const getTagColor = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('citrus') || t.includes('grapefruit') || t.includes('orange') || t.includes('lemon') || t.includes('tangerine')) 
    return { bg: 'rgba(255, 165, 0, 0.1)', text: '#FFA500', border: 'rgba(255, 165, 0, 0.3)' }; // Orange
  if (t.includes('tropical') || t.includes('passion') || t.includes('mango') || t.includes('pineapple') || t.includes('melon'))
    return { bg: 'rgba(255, 215, 0, 0.1)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.3)' }; // Gold
  if (t.includes('pine') || t.includes('resin') || t.includes('dank') || t.includes('cannabis') || t.includes('herbal') || t.includes('grassy'))
    return { bg: 'rgba(76, 175, 80, 0.1)', text: '#4CAF50', border: 'rgba(76, 175, 80, 0.3)' }; // Green
  if (t.includes('floral') || t.includes('flower') || t.includes('rose') || t.includes('elderflower'))
    return { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63', border: 'rgba(233, 30, 99, 0.3)' }; // Pink
  if (t.includes('spicy') || t.includes('pepper') || t.includes('clove') || t.includes('earthy') || t.includes('woody'))
    return { bg: 'rgba(121, 85, 72, 0.1)', text: '#795548', border: 'rgba(121, 85, 72, 0.3)' }; // Brown
  return { bg: 'rgba(var(--accent-primary-rgb, 255, 179, 0), 0.1)', text: 'var(--accent-primary)', border: 'rgba(var(--accent-primary-rgb, 255, 179, 0), 0.2)' };
};

type TabType = 'overall' | 'boil' | 'whirlpool' | 'dry';

const TabButton = ({ id, label, activeTab, onClick }: { 
  id: TabType, 
  label: string, 
  activeTab: TabType, 
  onClick: (id: TabType) => void 
}) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(id); }}
    style={{
      padding: '0.4rem 0.8rem',
      backgroundColor: activeTab === id ? 'var(--accent-primary)' : 'transparent',
      color: activeTab === id ? '#000' : 'var(--text-muted)',
      border: `1px solid ${activeTab === id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
      borderRadius: '4px',
      fontSize: '0.65rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase'
    }}
  >
    {label}
  </button>
);

export const RecipeHopProfile: React.FC<RecipeHopProfileProps> = ({ 
  kettleHops, 
  dryHops = [], 
  targetOG = 1.050, 
  batchVolume = 19, 
  boilVolume = 24 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overall');
  const [breakdownView, setBreakdownView] = useState<'aroma' | 'bitterness'>('bitterness');
  
  const activeTabHops = useMemo(() => {
    const all = [...kettleHops, ...dryHops];
    if (activeTab === 'overall') return all;
    if (activeTab === 'boil') return all.filter(h => h.use === 'boil');
    if (activeTab === 'whirlpool') return all.filter(h => ['whirlpool', 'aroma', 'first_wort', 'hopstand', 'mash'].includes(h.use));
    if (activeTab === 'dry') return all.filter(h => h.use === 'dry_hop');
    return all;
  }, [activeTab, kettleHops, dryHops]);

  const activeProfile = useMemo(() => calculateHopProfile(activeTabHops, allHops, batchVolume), [activeTabHops, batchVolume]);
  const overallProfile = useMemo(() => calculateHopProfile([...kettleHops, ...dryHops], allHops, batchVolume), [kettleHops, dryHops, batchVolume]);

  const oilContributionTable = useMemo(() => {
    const additions = activeTabHops.map(h => {
      let stage = 'Boil';
      if (h.use === 'dry_hop') stage = 'Dry Hop';
      else if (h.use === 'whirlpool' || h.use === 'aroma' || h.use === 'hopstand') stage = 'WP/Stand';
      else if (h.use === 'first_wort') stage = 'First Wort';
      else if (h.use === 'mash') stage = 'Mash';
      return { ...h, stage };
    });
    
    // Calculate accurate retained oils concentration per addition (mL/L)
    const aromaData = additions.map(h => {
      const variety = h.customVariety || allHops.find(v => v.name.toLowerCase() === h.name.toLowerCase());
      const varietyTotalOil = variety?.totalOils?.avg || 0;
      const retention = getHopRetention(h.time, h.use, h.temp);
      const actualOilMl = (h.weight / 100) * varietyTotalOil * retention;
      const concentration = batchVolume > 0 ? actualOilMl / batchVolume : 0;
      return { ...h, oilPerLiter: concentration };
    });

    const totalRetainedOilsPerL = aromaData.reduce((sum, h) => sum + h.oilPerLiter, 0);

    // Calculate IBUs per addition
    const bitternessData = additions.map(h => {
      const ibu = calculateSingleHopIBU(h, targetOG, batchVolume, boilVolume);
      return { ...h, ibu };
    });

    const totalIBUs = bitternessData.reduce((sum, h) => sum + h.ibu, 0);

    return additions.map((h, i) => {
      const oilPerLiter = aromaData[i].oilPerLiter;
      const ibu = bitternessData[i].ibu;
      return {
        name: h.name,
        stage: h.stage,
        time: h.time,
        use: h.use,
        oilPerLiter,
        oilPercent: totalRetainedOilsPerL > 0 ? (oilPerLiter / totalRetainedOilsPerL) * 100 : 0,
        ibu,
        ibuPercent: totalIBUs > 0 ? (ibu / totalIBUs) * 100 : 0
      };
    });
  }, [activeTabHops, targetOG, batchVolume, boilVolume]);

  const sortedBitterness = useMemo(() => [...oilContributionTable].filter(h => h.ibu > 0).sort((a, b) => b.ibuPercent - a.ibuPercent), [oilContributionTable]);
  const sortedAroma = useMemo(() => [...oilContributionTable].sort((a, b) => b.oilPercent - a.oilPercent), [oilContributionTable]);

  const getAromaIntensity = (mlL: number) => {
    if (mlL === 0) return { label: 'None', color: 'var(--text-muted)' };
    if (mlL < 0.01) return { label: 'Low', color: '#4CAF50' };
    if (mlL < 0.03) return { label: 'Moderate', color: '#8BC34A' };
    if (mlL < 0.07) return { label: 'High', color: '#FFB300' };
    if (mlL < 0.12) return { label: 'Extreme', color: '#FF5722' };
    return { label: 'Saturated', color: '#F44336' };
  };

  if (!overallProfile) return null;

  const getActiveTabLabel = () => {
    if (activeTab === 'overall') return 'Overall';
    if (activeTab === 'boil') return 'Boil Only';
    if (activeTab === 'whirlpool') return 'WP / Stand / FW';
    if (activeTab === 'dry') return 'Dry Hop Only';
    return '';
  };

  const intensity = getAromaIntensity(activeProfile?.oilConcentration.perLiter || 0);

  const getIBUIntensity = (ibu: number) => {
    if (ibu === 0) return { label: 'None', color: 'var(--text-muted)' };
    if (ibu < 15) return { label: 'Low', color: '#4CAF50' };
    if (ibu < 30) return { label: 'Moderate', color: '#8BC34A' };
    if (ibu < 50) return { label: 'Firm', color: '#FFB300' };
    if (ibu < 75) return { label: 'Assertive', color: '#FF5722' };
    return { label: 'Aggressive', color: '#F44336' };
  };

  const ibuIntensity = getIBUIntensity(activeTab === 'overall' ? kettleHops.reduce((sum, h) => sum + calculateSingleHopIBU(h, targetOG, batchVolume, boilVolume), 0) : sortedBitterness.reduce((sum, h) => sum + h.ibu, 0));

  return (
    <div style={{
      padding: isCollapsed ? '0.75rem 1rem' : '1.5rem',
      backgroundColor: 'var(--bg-main)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      marginBottom: '1.5rem'
    }}>
      <style>{`
        .hop-profile-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
          margin-bottom: ${isCollapsed ? 0 : '1.5rem'};
        }
        @media (min-width: 1024px) {
          .hop-profile-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .hop-tabs-container {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          -webkit-overflow-scrolling: touch;
        }
        .hop-tabs-container::-webkit-scrollbar {
          height: 4px;
        }
        .hop-tabs-container::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 2px;
        }
        .hop-profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .hop-profile-grid {
            grid-template-columns: 1fr 1.2fr;
            gap: 1.5rem;
          }
        }
        .oil-breakdown-card {
          padding: 1rem;
          background-color: rgba(255,255,255,0.02);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .hop-intensity-grid {
          padding: 1rem;
          background-color: rgba(255,255,255,0.02);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
      `}</style>
      <div 
        className="hop-profile-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '0.8rem', 
            color: 'var(--text-main)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em' 
          }}>
            Hop Flavor Profile
          </h3>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{isCollapsed ? '⊕' : '−'}</span>
        </div>
        
        {!isCollapsed && (
          <div className="hop-tabs-container">
            <TabButton id="overall" label="Overall" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="boil" label="Boil" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="whirlpool" label="WP/ST/FW" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="dry" label="Dry Hop" activeTab={activeTab} onClick={setActiveTab} />
          </div>
        )}

        {isCollapsed && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {overallProfile.topTags.slice(0, 4).map(tag => {
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
      </div>
      
      {!isCollapsed && activeProfile && (
        <div className="hop-profile-grid">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <RadarChart scores={activeProfile.scores} size={180} />
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Top Aromas: {getActiveTabLabel()}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                {activeProfile.topTags.map(tag => {
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
            </div>

            <div style={{ width: '100%', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{getActiveTabLabel()} Contribution</div>
                <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '4px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setBreakdownView('bitterness'); }}
                    style={{ 
                      padding: '0.2rem 0.5rem', 
                      fontSize: '0.6rem', 
                      fontWeight: 'bold', 
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: breakdownView === 'bitterness' ? 'var(--accent-primary)' : 'transparent',
                      color: breakdownView === 'bitterness' ? '#000' : 'var(--text-muted)'
                    }}
                  >
                    IBU
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setBreakdownView('aroma'); }}
                    style={{ 
                      padding: '0.2rem 0.5rem', 
                      fontSize: '0.6rem', 
                      fontWeight: 'bold', 
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: breakdownView === 'aroma' ? 'var(--accent-primary)' : 'transparent',
                      color: breakdownView === 'aroma' ? '#000' : 'var(--text-muted)'
                    }}
                  >
                    OILS
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {breakdownView === 'bitterness' && sortedBitterness.map((h, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.7rem', 
                    padding: '0.4rem', 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    borderRadius: '4px' 
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: 0 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>({h.use === 'first_wort' ? 'FW' : `${h.time}m`})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{h.ibu.toFixed(1)} IBU</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', width: '35px', textAlign: 'right' }}>{h.ibuPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
                {breakdownView === 'bitterness' && sortedBitterness.length === 0 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>No bittering additions.</div>
                )}
                
                {breakdownView === 'aroma' && sortedAroma.map((h, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.7rem', 
                    padding: '0.4rem', 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    borderRadius: '4px' 
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: 0 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>({h.use === 'dry_hop' ? `D${h.time}` : h.stage})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{h.oilPerLiter.toFixed(3)}</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', width: '35px', textAlign: 'right' }}>{h.oilPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
                {breakdownView === 'aroma' && sortedAroma.length === 0 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>No aroma additions.</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="oil-breakdown-card">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Oil Breakdown: {getActiveTabLabel()}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(activeProfile.oilConcentration.breakdown).map(([name, value]) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.65rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{value.toFixed(1)}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', height: '3px' }}>
                      <div style={{ 
                        width: `${Math.min(100, value)}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--accent-primary)', 
                        borderRadius: '2px',
                        opacity: 0.8
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hop-intensity-grid">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 'bold' }}>Aroma Intensity</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: intensity.color, textTransform: 'uppercase' }}>{intensity.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{activeProfile.oilConcentration.perLiter.toFixed(3)} <span style={{ fontSize: '0.6rem' }}>mL/L</span></div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 'bold' }}>Bitterness Level</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: ibuIntensity.color, textTransform: 'uppercase' }}>{ibuIntensity.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{activeTab === 'overall' ? kettleHops.reduce((sum, h) => sum + calculateSingleHopIBU(h, targetOG, batchVolume, boilVolume), 0).toFixed(1) : sortedBitterness.reduce((sum, h) => sum + h.ibu, 0).toFixed(1)} <span style={{ fontSize: '0.6rem' }}>IBU</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

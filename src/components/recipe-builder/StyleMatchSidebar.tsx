import { StyleGauge } from './StyleGauge';
import { RadarChart } from './RadarChart';
import { BalanceBar } from './BalanceBar';
import type { Fermentable, Hop, FermenterEntity, WaterProfile, MeasurementSystem, BeerStyle, MashStep } from '../../types/brewing';
import { calculateHopProfile } from '../../utils/brewingMath';
import { generateOverallTastingNotes } from '../../utils/tastingNotes';
import type { TastingInput } from '../../utils/tastingNotes';
import { hops as allHopVarieties } from '../../data/hops';
import { yeasts as allYeastVarieties } from '../../data/yeasts';
import { getWaterNarrative } from '../../utils/waterChemistry';
import { useMemo } from 'react';

interface StyleMatchSidebarProps {
  activeStyle: BeerStyle | null;
  sharedTargets: { targetOG: number; targetSRM: number; targetIBU: number };
  primaryFermenter: FermenterEntity;
  fermentables: Fermentable[];
  kettleHops: Hop[];
  mashSteps: MashStep[];
  activeTargetWater: WaterProfile;
  measurementSystem: MeasurementSystem;
  co2Volumes?: number;
  predictedPH?: number;
}

export const StyleMatchSidebar = ({
  activeStyle, sharedTargets, primaryFermenter, fermentables, kettleHops, mashSteps, activeTargetWater,
  co2Volumes = 2.5, predictedPH = 5.4
}: StyleMatchSidebarProps) => {

  const yeastInfo = useMemo(() => {
    const yeast = primaryFermenter.yeast[0];
    if (!yeast) return null;
    return yeast.customVariety || allYeastVarieties.find(v => v.name.toLowerCase() === yeast.name.toLowerCase());
  }, [primaryFermenter.yeast]);

  const hopProfile = useMemo(() => {
    return calculateHopProfile(kettleHops, allHopVarieties);
  }, [kettleHops]);

  // Get advanced water descriptors
  const waterNarrative = useMemo(() => getWaterNarrative(activeTargetWater), [activeTargetWater]);

  // Transform current state into TastingInput structure
  const tastingInput: TastingInput = useMemo(() => {
    const formattedFermentables = fermentables.map(f => {
      let category: 'base' | 'crystal' | 'roasted' | 'adjunct' | 'fruit' | 'spice' | 'sugar' = 'base';
      const name = f.name.toLowerCase();
      
      let fermentability = 0.75;
      let proteinLevel: 'low' | 'med' | 'high' = 'med';

      if (name.includes('hull')) {
        category = 'adjunct';
        fermentability = 0; // Mash aid, not fermentable
        proteinLevel = 'med';
      } else if (name.includes('rice') || name.includes('corn') || name.includes('maize')) {
        category = 'adjunct';
        fermentability = 1.0;
        proteinLevel = 'low';
      } else if (name.includes('sugar') || name.includes('dextrose') || name.includes('honey') || name.includes('candi') || name.includes('syrup')) {
        category = 'sugar';
        fermentability = 1.0;
        proteinLevel = 'low';
      } else if (f.color >= 100 || name.includes('roast') || name.includes('chocolate') || name.includes('black')) {
        category = 'roasted';
        fermentability = 0.65;
      } else if (f.color >= 20 || name.includes('crystal') || name.includes('caramel') || name.includes('cara')) {
        category = 'crystal';
        fermentability = 0.7;
      } else if (name.includes('wheat') || name.includes('oat') || name.includes('rye') || name.includes('flaked')) {
        category = 'adjunct';
        proteinLevel = 'high';
      }
      
      return {
        name: f.name,
        category,
        weightKg: f.weight,
        fermentability,
        proteinLevel,
        ignoreMouthfeel: f.ignoreMouthfeel
      };
    });

    const activeDryHop = kettleHops.some(h => h.use === 'dry_hop');
    
    // Yeast mapping
    let profile: 'clean' | 'fruity' | 'phenolic' = 'clean';
    let biotransformation: 'low' | 'medium' | 'high' = 'low';
    const isLager = primaryFermenter.yeast[0]?.type === 'lager';
    
    if (yeastInfo) {
      const esterScore = yeastInfo.characteristicScores?.fruity || 0;
      const phenolScore = yeastInfo.characteristicScores?.funky || 0;

      if (esterScore > 3 || yeastInfo.tags?.includes('fruity') || yeastInfo.styles.some(s => s.toLowerCase().includes('neipa') || s.toLowerCase().includes('hazy'))) {
        profile = 'fruity';
        biotransformation = 'high';
      } else if (phenolScore > 3 || yeastInfo.tags?.includes('phenolic') || yeastInfo.tags?.includes('spicy')) {
        profile = 'phenolic';
      }
    }

    // Attempt to guess ferm temp if not specified
    const fermTempC = isLager ? 12 : (profile === 'fruity' ? 21 : 18);

    return {
      stats: {
        og: sharedTargets.targetOG,
        fg: primaryFermenter.targetFG,
        abv: primaryFermenter.targetABV,
        srm: sharedTargets.targetSRM,
        totalIBU: sharedTargets.targetIBU,
        co2Volumes
      },
      water: {
        sulfate: activeTargetWater.sulfate,
        chloride: activeTargetWater.chloride,
        calcium: activeTargetWater.calcium,
        residualAlkalinity: activeTargetWater.bicarbonate,
        mashPh: predictedPH,
        words: waterNarrative.words
      },
      fermentables: formattedFermentables,
      hops: {
        scores: hopProfile?.scores || { Fruity: 0, Floral: 0, Herbaceous: 0, Spicy: 0, Earthy: 0 },
        totalOilMl: hopProfile?.oilConcentration.total || 0,
        dominantTags: hopProfile?.topTags || [],
        activeDryHop
      },
      mashSteps: mashSteps.map((s: MashStep) => ({
        tempC: s.stepTemp,
        durationMins: s.stepTime
      })),
      yeast: {
        attenuation: yeastInfo?.attenuation.avg || 75,
        profile,
        biotransformation,
        fermTempC,
        isLager,
        scores: yeastInfo?.characteristicScores
      }
    };
  }, [sharedTargets, primaryFermenter, fermentables, kettleHops, mashSteps, activeTargetWater, predictedPH, co2Volumes, yeastInfo, hopProfile, waterNarrative]);

  // Run the Tasting Engine
  const tastingOutput = useMemo(() => generateOverallTastingNotes(tastingInput), [tastingInput]);

  const apparentAttenuation = useMemo(() => {
    if (sharedTargets.targetOG <= 1.0) return 0;
    return ((sharedTargets.targetOG - primaryFermenter.targetFG) / (sharedTargets.targetOG - 1)) * 100;
  }, [sharedTargets.targetOG, primaryFermenter.targetFG]);

  const buguRatio = useMemo(() => {
    if (sharedTargets.targetOG <= 1.0) return 0;
    return sharedTargets.targetIBU / ((sharedTargets.targetOG - 1) * 1000);
  }, [sharedTargets.targetIBU, sharedTargets.targetOG]);

  // Derive UI elements from the Matrix
  const beerBalance = useMemo(() => {
    return {
      bitterness: tastingOutput.matrix.bitternessIndex / 10,
      body: tastingOutput.matrix.bodyIndex / 10
    };
  }, [tastingOutput]);

  const detailedFlavorMap = useMemo(() => {
    const m = tastingOutput.matrix;
    return {
      Fruity: m.fruityScore / 2,
      Floral: m.floralScore / 2,
      Earthy: m.earthyScore / 2,
      Spicy: m.spicyScore / 2,
      Phenolic: m.phenolicScore / 2,
      Roasty: m.roastIndex / 2
    };
  }, [tastingOutput]);

  const statItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding: '0.5rem',
    borderRight: '1px solid rgba(255,255,255,0.05)'
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '0.55rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: '0.2rem'
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: '900',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)'
  };

  return (
    <div style={{ width: '100%' }}>
      <section style={{ 
        backgroundColor: 'var(--bg-surface)', 
        padding: '1.5rem', 
        borderRadius: 'var(--border-radius)', 
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>Beer Summary</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>
            {tastingOutput.notes.split('. ').map((note, i) => (
              note.trim() && (
                <div key={i} style={{ marginBottom: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span>
                  <span>{note.trim()}{!note.endsWith('.') && '.'}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Vital Stats Bar */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--bg-main)', 
          borderRadius: '8px', 
          marginBottom: '0.5rem', 
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>OG</span>
            <span style={statValueStyle}>{sharedTargets.targetOG.toFixed(3)}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>FG</span>
            <span style={statValueStyle}>{primaryFermenter.targetFG.toFixed(3)}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>ABV</span>
            <span style={statValueStyle}>{primaryFermenter.targetABV.toFixed(1)}%</span>
          </div>
          <div style={{ ...statItemStyle, borderRight: 'none' }}>
            <span style={statLabelStyle}>SRM</span>
            <span style={{ ...statValueStyle, color: `var(--srm-${Math.round(sharedTargets.targetSRM)})` }}>{sharedTargets.targetSRM.toFixed(1)}</span>
          </div>
        </div>

        {/* Efficiency & Balance Bar */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--bg-main)', 
          borderRadius: '8px', 
          marginBottom: '1.5rem', 
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Apparent Attenuation</span>
            <span style={statValueStyle}>{apparentAttenuation.toFixed(0)}%</span>
          </div>
          <div style={{ ...statItemStyle, borderRight: 'none' }}>
            <span style={statLabelStyle}>Bitterness Ratio (BU:GU)</span>
            <span style={statValueStyle}>{buguRatio.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <BalanceBar 
            label="Flavor Balance" 
            leftLabel="Malty/Sweet" 
            rightLabel="Bitter/Dry" 
            value={beerBalance.bitterness} 
            color="var(--accent-primary)"
          />
          <BalanceBar 
            label="Mouthfeel" 
            leftLabel="Crisp" 
            rightLabel="Full-Bodied" 
            value={beerBalance.body} 
            color="var(--accent-primary)"
          />
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', width: '100%', fontWeight: 'bold', letterSpacing: '0.05em' }}>Flavor Categories</div>
          <RadarChart scores={detailedFlavorMap} size={180} color="var(--accent-primary)" />
        </div>
        
        {activeStyle && (
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', marginTop: '1rem' }}>Style Match: {activeStyle.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '1rem' }}>
              <StyleGauge label="OG" value={sharedTargets.targetOG} min={activeStyle.stats.og.min} max={activeStyle.stats.og.max} />
              <StyleGauge label="FG" value={primaryFermenter.targetFG} min={activeStyle.stats.fg.min} max={activeStyle.stats.fg.max} />
              <StyleGauge label="ABV %" value={primaryFermenter.targetABV} min={activeStyle.stats.abv.min} max={activeStyle.stats.abv.max} />
              <StyleGauge label="IBU" value={sharedTargets.targetIBU} min={activeStyle.stats.ibu.min} max={activeStyle.stats.ibu.max} />
              <StyleGauge label="SRM" value={sharedTargets.targetSRM} min={activeStyle.stats.srm.min} max={activeStyle.stats.srm.max} />
            </div>
          </div>
        )}
        
        {activeStyle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeStyle.description && (
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Style Impression</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{activeStyle.description}</p>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {activeStyle.flavor && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>Style Flavor</label>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>{activeStyle.flavor}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!activeStyle && (
          <p style={{ color: 'var(--text-muted)' }}>No style selected.</p>
        )}
      </section>
    </div>
  );
};

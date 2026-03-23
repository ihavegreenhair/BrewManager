import React, { useState } from 'react';
import type { WaterProfile, WaterVolumes } from '../../types/brewing';
import { SectionHeader } from './SectionHeader';
import { WaterSourceProfile } from './WaterSourceProfile';
import { WaterTargetSelector } from './WaterTargetSelector';
import { WaterFlavorTuning } from './WaterFlavorTuning';
import { WaterAdditionsTable } from './WaterAdditionsTable';
import { WaterPHControl } from './WaterPHControl';
import { getWaterNarrative } from '../../utils/waterChemistry';
import { useBrewStore } from '../../store/useBrewStore';
import { gramsToOz } from '../../utils/units';

interface WaterChemistrySectionProps {
  sourceWater: WaterProfile;
  setSourceWater: (w: WaterProfile) => void;
  handleSaveSourceWater: () => void;
  targetWaterId: string;
  setTargetWaterId: (id: string) => void;
  targetWaterProfiles: WaterProfile[];
  isCustomTarget: boolean;
  customTargetWater: WaterProfile;
  setCustomTargetWater: (w: WaterProfile) => void;
  baseTargetWater: WaterProfile;
  saltAdditionPosition: 'split' | 'mash_only' | 'kettle_only';
  handleSaltStrategyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  saltCalculationMode: 'auto' | 'manual';
  setSaltCalculationMode: (v: 'auto' | 'manual') => void;
  manualSaltAdditions: { gypsum: number; cacl2: number; epsom: number; bakingSoda: number };
  setManualSaltAdditions: (v: { gypsum: number; cacl2: number; epsom: number; bakingSoda: number }) => void;
  manualStrikeVolume: number | undefined;
  setManualStrikeVolume: (v: number | undefined) => void;
  manualSpargeVolume: number | undefined;
  setManualSpargeVolume: (v: number | undefined) => void;
  waterVolumes: WaterVolumes;
  totalSaltMath: any;
  mashSaltMathSplit: any;
  spargeSaltMathSplit: any;
  so4ClRatio: string;
  activeTargetWater: WaterProfile;
  acidMode: 'manual' | 'auto';
  setAcidMode: (v: 'manual' | 'auto') => void;
  acidAddition: { type: 'lactic' | 'phosphoric'; concentration: number; volumeMl: number };
  setAcidAddition: (v: any) => void;
  targetPH: number;
  setTargetPH: (v: number) => void;
  predictedPH: number;
  hasFermentables: boolean;
  onProfileChange: (updates: Partial<WaterProfile>) => void;
  onIonChange: (key: keyof WaterProfile, value: number) => void;
  collapsed: boolean;
  onToggle: (s: string) => void;
}

const WaterChemistrySectionComponent = ({
  sourceWater, setSourceWater, handleSaveSourceWater,
  targetWaterId, setTargetWaterId, targetWaterProfiles,
  isCustomTarget, customTargetWater, setCustomTargetWater,
  baseTargetWater,
  saltAdditionPosition, handleSaltStrategyChange,
  saltCalculationMode, setSaltCalculationMode,
  manualSaltAdditions, setManualSaltAdditions,
  totalSaltMath, mashSaltMathSplit, spargeSaltMathSplit,
  so4ClRatio, activeTargetWater,

  acidMode, setAcidMode, acidAddition, setAcidAddition,
  targetPH, setTargetPH, predictedPH, hasFermentables,
  onProfileChange,
  onIonChange,
  collapsed, onToggle
}: WaterChemistrySectionProps) => {

  const [openSteps, setOpenOpenSteps] = useState<Record<string, boolean>>({
    source: false,
    target: true,
    plan: true
  });

  const toggleStep = (step: string) => {
    setOpenOpenSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const narrative = getWaterNarrative(activeTargetWater);

  const stepWrapperStyle: React.CSSProperties = { 
    marginBottom: '1rem',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)'
  };

  const stepHeaderStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    transition: 'background-color 0.2s'
  };

  const stepTitleStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  return (
    <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
       <SectionHeader title="Water Chemistry (ppm)" section="water" collapsed={collapsed} onToggle={onToggle} summary={narrative.summary} />
       
       {!collapsed && (
         <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

           {/* Step 1: Source Water */}
           <div style={stepWrapperStyle}>
             <div style={stepHeaderStyle} onClick={() => toggleStep('source')}>
               <h4 style={stepTitleStyle}>
                 <span>{openSteps.source ? '▼' : '▶'}</span>
                 STEP 1: SOURCE WATER PROFILE
               </h4>
               {!openSteps.source && (
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                   {sourceWater.name} ({sourceWater.calcium}/{sourceWater.sulfate}/{sourceWater.chloride})
                 </span>
               )}
             </div>
             {openSteps.source && (
               <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                 <WaterSourceProfile
                   sourceWater={sourceWater}
                   setSourceWater={setSourceWater}
                   onSaveDefault={handleSaveSourceWater}
                 />
               </div>
             )}
           </div>

           {/* Step 2: Target Design */}
           <div style={stepWrapperStyle}>
             <div style={stepHeaderStyle} onClick={() => toggleStep('target')}>
               <h4 style={stepTitleStyle}>
                 <span>{openSteps.target ? '▼' : '▶'}</span>
                 STEP 2: TARGET PROFILE DESIGN
               </h4>
               {!openSteps.target && (
                 <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                   {narrative.summary}
                 </span>
               )}
             </div>
             {openSteps.target && (
               <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                 <WaterTargetSelector
                   targetWaterId={targetWaterId}
                   setTargetWaterId={setTargetWaterId}
                   targetWaterProfiles={targetWaterProfiles}
                   isCustomTarget={isCustomTarget}
                   customTargetWater={customTargetWater}
                   setCustomTargetWater={setCustomTargetWater}
                   baseTargetWater={baseTargetWater}
                   activeTargetWater={activeTargetWater}
                 />

                 <WaterFlavorTuning
                   so4ClRatio={so4ClRatio}
                   activeTargetWater={activeTargetWater}
                   onProfileChange={onProfileChange}
                   onIonChange={onIonChange}
                   isCustomTarget={isCustomTarget}
                 />
               </div>
             )}
           </div>

           {/* Step 3: Treatment Plan */}
           <div style={stepWrapperStyle}>
             <div style={stepHeaderStyle} onClick={() => toggleStep('plan')}>
               <h4 style={stepTitleStyle}>
                 <span>{openSteps.plan ? '▼' : '▶'}</span>
                 STEP 3: WATER TREATMENT PLAN
               </h4>
               {!openSteps.plan && (
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                   {(() => {
                     const { measurementSystem } = useBrewStore.getState();
                     const totalGrams = totalSaltMath.additions.gypsum + totalSaltMath.additions.cacl2 + totalSaltMath.additions.epsom + totalSaltMath.additions.bakingSoda;
                     const displayTotal = measurementSystem === 'metric' ? totalGrams : gramsToOz(totalGrams);
                     const unit = measurementSystem === 'metric' ? 'g' : 'oz';
                     return `pH: ${predictedPH.toFixed(2)} | Total Additions: ${displayTotal.toFixed(1)}${unit}`;
                   })()}
                 </span>
               )}
             </div>
             {openSteps.plan && (
               <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                 <WaterAdditionsTable 
                   saltAdditionPosition={saltAdditionPosition}
                   handleSaltStrategyChange={handleSaltStrategyChange}
                   saltCalculationMode={saltCalculationMode}
                   setSaltCalculationMode={setSaltCalculationMode}
                   manualSaltAdditions={manualSaltAdditions}
                   setManualSaltAdditions={setManualSaltAdditions}
                   totalSaltMath={totalSaltMath}
                   mashSaltMathSplit={mashSaltMathSplit}
                   spargeSaltMathSplit={spargeSaltMathSplit}
                 />

                 <WaterPHControl 
                   acidMode={acidMode}
                   setAcidMode={setAcidMode}
                   acidAddition={acidAddition}
                   setAcidAddition={setAcidAddition}
                   targetPH={targetPH}
                   setTargetPH={setTargetPH}
                   predictedPH={predictedPH}
                   hasFermentables={hasFermentables}
                 />
               </div>
             )}
           </div>

         </div>
       )}
    </section>
  );
};

export const WaterChemistrySection = React.memo(WaterChemistrySectionComponent);

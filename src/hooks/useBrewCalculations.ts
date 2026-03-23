import { useMemo } from 'react';
import type { Session, WaterProfile } from '../types/brewing';
import {
  calculateABV,
  calculateFG,
  calculateIBU,
  calculateSRM,
  calculateOG,
  calculateWaterVolumes,
  calculateAdvancedFermentationProjection,
  correctGravityForTemperature
} from '../utils/brewingMath';
import { calculateProfileFromSalts } from '../utils/waterChemistry';

export interface TimelineMilestone {
  type: 'lag' | 'phase' | 'hop' | 'crash';
  id: string;
  name: string;
  days: number | string;
  temp?: number;
  weight?: number;
  date: Date;
  isComplete?: boolean;
  progress?: number;
}

export interface BrewInsights {
  abv: number;
  attenuation: number;
  currentSG: number;
  ppd: string;
  temp?: number;
  ppdTrend: 'up' | 'down' | 'flat';
  tempTrend: 'up' | 'down' | 'flat';
}

export const useBrewCalculations = (session: Session | undefined) => {
  const fermentationSteps = useMemo(() => {
    return session?.recipeSnapshot.fermenters[0]?.fermentationSteps || [];
  }, [session?.recipeSnapshot.fermenters]);

  const dryHops = useMemo(() => {
    return (session?.recipeSnapshot.kettleHops || []).filter(h => h.use === 'dry_hop');
  }, [session?.recipeSnapshot.kettleHops]);

  const totalFermentDays = useMemo(() => {
    return fermentationSteps.reduce((acc, step) => acc + step.stepTime, 0);
  }, [fermentationSteps]);

  const lagPhaseInfo = useMemo(() => {
    if (!session?.raptLogStart || !session.raptPillData || session.raptPillData.length === 0) return null;
    const start = new Date(session.raptLogStart).getTime();

    const lagEndPoint = session.raptPillData.find(p => Math.abs(p.gravityVelocity || 0) > 0.5);

    if (lagEndPoint) {
      const end = new Date(lagEndPoint.timestamp).getTime();
      return { end, durationDays: ((end - start) / 86400000).toFixed(1), isComplete: true };
    } else {
      const now = new Date().getTime();
      return { durationDays: ((now - start) / 86400000).toFixed(1), isComplete: false };
    }
  }, [session?.raptLogStart, session?.raptPillData]);

  const insights = useMemo(() => {
    if (!session) return null;

    const data = session.raptPillData;
    const lastPoint = data?.[data.length - 1];
    let currentSG = lastPoint?.gravity || 1.000;
    if (currentSG > 10) currentSG = currentSG / 1000;

    const og = session.actuals.og || session.recipeSnapshot.targetOG;
    const abv = calculateABV(og, currentSG);
    const attenuation = og > 1 ? ((og - currentSG) / (og - 1)) * 100 : 0;
    const rawPpd = lastPoint?.gravityVelocity || 0;

    let ppdTrend: 'up' | 'down' | 'flat' = 'flat';
    let tempTrend: 'up' | 'down' | 'flat' = 'flat';

    if (data && data.length > 1) {
      const sixHoursAgo = new Date(lastPoint!.timestamp).getTime() - (6 * 60 * 60 * 1000);
      let comparePoint = [...data].reverse().find(p => new Date(p.timestamp).getTime() <= sixHoursAgo);
      if (!comparePoint) comparePoint = data[data.length - 2];

      if (comparePoint) {
        const prevPpd = Math.abs(comparePoint.gravityVelocity || 0);
        const currPpd = Math.abs(rawPpd);
        if (currPpd > prevPpd + 0.5) ppdTrend = 'up';
        else if (currPpd < prevPpd - 0.5) ppdTrend = 'down';

        const prevTemp = comparePoint.temperature || 0;
        const currTemp = lastPoint!.temperature || 0;
        if (currTemp > prevTemp + 0.5) tempTrend = 'up';
        else if (currTemp < prevTemp - 0.5) tempTrend = 'down';
      }
    }

    return {
      abv,
      attenuation: Number(attenuation.toFixed(1)),
      currentSG: Number(currentSG.toFixed(4)),
      ppd: Math.abs(rawPpd).toFixed(1),
      temp: lastPoint?.temperature,
      ppdTrend,
      tempTrend
    };
  }, [session?.raptLogStart, session?.raptPillData, session?.actuals.og, session?.recipeSnapshot.targetOG]);

  const timelineMilestones = useMemo((): TimelineMilestone[] => {
    const logStart = session?.raptLogStart ? new Date(session.raptLogStart).getTime() : new Date().getTime();
    const milestones: TimelineMilestone[] = [];
    const now = new Date().getTime();

    const lagEnd = lagPhaseInfo?.end || logStart;
    const currentSG = insights?.currentSG || 1.050;
    const og = session?.actuals.og || session?.recipeSnapshot.targetOG || 1.050;
    const targetFG = session?.recipeSnapshot.fermenters[0]?.targetFG || 1.010;

    // 1. Lag Phase Progress
    let lagProgress = 0;
    if (lagPhaseInfo?.isComplete) lagProgress = 100;
    else if (session?.raptLogStart) {
      const elapsed = now - logStart;
      lagProgress = Math.min(99, (elapsed / (24 * 60 * 60 * 1000)) * 100);
    }

    milestones.push({
      type: 'lag',
      id: 'lag-phase',
      name: 'Lag Phase',
      days: lagPhaseInfo?.durationDays || 0,
      date: new Date(logStart),
      isComplete: lagPhaseInfo?.isComplete || false,
      progress: Math.round(lagProgress)
    });

    let currentMs = lagEnd;
    fermentationSteps.forEach((step, idx) => {
      const isCrash = step.stepTemp < 5;
      const correspondingEvent = session?.events.find(e => e.type === 'fermentation' && (e.metadata?.stepDetails?.id === step.id || e.metadata?.mashDetails?.id === step.id));
      const isComplete = correspondingEvent?.completed || false;
      const durationMs = step.stepTime * 86400000;
      const phaseEndMs = currentMs + durationMs;

      let progress = 0;
      if (isComplete) {
        progress = 100;
      } else if (now >= currentMs && now < phaseEndMs) {
        if (idx === 0) {
          const totalDrop = og - targetFG;
          const currentDrop = og - currentSG;
          progress = (totalDrop > 0) ? (currentDrop / totalDrop) * 100 : 0;
        } else {
          progress = ((now - currentMs) / durationMs) * 100;
        }
      } else if (now >= phaseEndMs) {
        progress = 100;
      }

      milestones.push({
        type: isCrash ? 'crash' : 'phase',
        id: step.id,
        name: step.name,
        days: step.stepTime,
        temp: step.stepTemp,
        date: new Date(currentMs),
        isComplete,
        progress: Math.round(Math.max(0, Math.min(100, progress)))
      });
      currentMs += durationMs;
    });

    dryHops.forEach(hop => {
      const correspondingEvent = session?.events.find(e => e.type === 'hop' && e.metadata?.hopDetails?.id === hop.id);
      const hopDateMs = lagEnd + (hop.time * 86400000);

      milestones.push({
        type: 'hop',
        id: hop.id,
        name: `Dry Hop: ${hop.name}`,
        days: hop.time,
        weight: hop.weight,
        date: new Date(hopDateMs),
        isComplete: correspondingEvent?.completed || false,
        progress: now >= hopDateMs ? 100 : 0
      });
    });

    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [session?.raptLogStart, session?.events, fermentationSteps, dryHops, lagPhaseInfo, insights?.currentSG, session?.actuals.og, session?.recipeSnapshot.targetOG, session?.recipeSnapshot.fermenters]);

  const updatedTargets = useMemo(() => {
    if (!session) return null;
    const recipe = session.recipeSnapshot;

    const actualFermentables = recipe.fermentables.map(f => {
      const actualWeight = session.events.find(e => e.label === 'Mash In')?.detailedActuals?.find(da => da.id === f.id)?.actual;
      return { ...f, weight: actualWeight ?? f.weight };
    });

    const actualHops = session.events
      .filter(e => e.type === 'hop')
      .map(e => ({
        id: e.metadata?.hopDetails?.id || e.id,
        name: e.metadata?.hopDetails?.name || e.label,
        weight: e.actualValue ?? e.targetValue ?? 0,
        alphaAcid: e.metadata?.hopDetails?.alpha || 0,
        use: e.hopUse || 'boil',
        time: e.hopTime ?? 0,
        temp: e.hopTemp
      }));

    const actualMashSteps = session.events
      .filter(e => e.type === 'mash' && e.metadata?.mashDetails)
      .map(e => ({
        id: e.id,
        name: e.metadata!.mashDetails!.name || e.label,
        type: 'infusion' as const,
        stepTemp: e.actualTemp ?? e.targetTemp ?? 67,
        stepTime: e.actualDuration ?? e.duration ?? 60
      }));

    const mashStepsToUse = actualMashSteps.length > 0 ? actualMashSteps : recipe.mashSteps;
    const equipment = recipe.equipment;
    const boilTime = recipe.boilTime;
    const efficiency = recipe.efficiency;

    let activeTargetWater: WaterProfile = recipe.targetWaterProfile || recipe.waterProfile || {
      id: 'w',
      name: 'W',
      calcium: 0,
      magnesium: 0,
      sodium: 0,
      sulfate: 0,
      chloride: 0,
      bicarbonate: 0
    };

    const saltStep = session.events.find(e => e.label === 'Add Water Salts');
    if (saltStep?.detailedActuals && recipe.waterProfile) {
      const getSalt = (id: string) => saltStep.detailedActuals?.find(da => da.id === id)?.actual ?? saltStep.detailedActuals?.find(da => da.id === id)?.target ?? 0;

      const volumes = calculateWaterVolumes(
        equipment,
        actualFermentables,
        boilTime,
        recipe.type,
        recipe.batchVolume,
        recipe.waterSettings?.manualStrikeVolume,
        recipe.waterSettings?.manualSpargeVolume,
        recipe.trubLoss
      );

      const totalVolLiters = volumes.mashWater + volumes.spargeWater;

      const { resultingProfile } = calculateProfileFromSalts(
        recipe.waterProfile,
        {
          gypsum: getSalt('gypsum'),
          cacl2: getSalt('cacl2'),
          epsom: getSalt('epsom'),
          bakingSoda: getSalt('bakingSoda')
        },
        totalVolLiters
      );
      activeTargetWater = { id: 'custom-actual', name: 'Actual Water Profile', ...resultingProfile };
    }

    const mergedActuals = { ...session.actuals };
    session.events.forEach(e => {
      if (e.label.includes('Post-boil Measurements') && e.actualValue) mergedActuals.og = e.actualValue;
      if (e.label.includes('Pre-boil Measurements') && e.actualValue) mergedActuals.preBoilVolume = e.actualValue;
    });

    // --- AUTO-TELEMETRY DETECTION LOGIC ---
    if (session.raptPillData && session.raptPillData.length > 0) {
      // 1. Auto-OG: Find the absolute maximum gravity in the first 24 hours, aggressively filtering out splash/drop anomalies.
      // This prevents the detector from settling on a slightly-attenuated number (e.g. 1.042) if the Pill takes a while to stabilize near true OG (1.044).
      if (!mergedActuals.og) {
        const firstPillTime = new Date(session.raptPillData[0].timestamp).getTime();
        const first24h = session.raptPillData.filter(
          p => (new Date(p.timestamp).getTime() - firstPillTime) <= 24 * 3600000
        );
        
        let detectedOG = 0;
        const ceilingLimit = (recipe.targetOG || 1.050) + 0.015; // Extremely tight 15-point ceiling to kill mechanical drop-in spikes
        
        first24h.forEach(p => {
          const corrected = correctGravityForTemperature(p.gravity, p.temperature);
          if (corrected > detectedOG && corrected < ceilingLimit) {
            detectedOG = corrected;
          }
        });
        
        if (detectedOG > 1.000) {
          mergedActuals.og = Number(detectedOG.toFixed(4));
        }
      }

      // 2. Auto-FG: If trailing kinetic velocity indicates a fermentation stall, lock in the minimum gravity.
      if (!mergedActuals.fg && session.raptPillData.length >= 2) {
        const lookbackCount = Math.min(session.raptPillData.length, 48);
        const recentPoints = session.raptPillData.slice(-lookbackCount);
        const firstRecent = recentPoints[0];
        const lastRecent = recentPoints[recentPoints.length - 1];

        const timeDeltaDays = (new Date(lastRecent.timestamp).getTime() - new Date(firstRecent.timestamp).getTime()) / 86400000;
        const g1 = correctGravityForTemperature(firstRecent.gravity, firstRecent.temperature);
        const g2 = correctGravityForTemperature(lastRecent.gravity, lastRecent.temperature);
        const gravityDelta = g1 - g2;

        if (timeDeltaDays >= 0.1) {
          const velocityPPD = gravityDelta / timeDeltaDays;
          const currentOG = mergedActuals.og || recipe.targetOG;
          if (velocityPPD < 0.0015 && g2 < currentOG - 0.005) {
            let minFG = 2.000;
            recentPoints.forEach(p => {
              const c = correctGravityForTemperature(p.gravity, p.temperature);
              if (c < minFG) minFG = c;
            });
            mergedActuals.fg = Number(minFG.toFixed(4));
          }
        }
      }
    }

    let targetOG = calculateOG(actualFermentables, efficiency, recipe.batchVolume, recipe.type, recipe.trubLoss || equipment.trubLoss);
    let targetVolume = recipe.batchVolume;

    if (mergedActuals.preBoilGravity && mergedActuals.preBoilVolume) {
      const preBoilPoints = (mergedActuals.preBoilGravity - 1) * mergedActuals.preBoilVolume;
      const expectedPostBoilVol = mergedActuals.postBoilVolume || (mergedActuals.preBoilVolume - (recipe.boilOffRate ?? equipment.boilOffRate) * (boilTime / 60));
      if (expectedPostBoilVol > 0) {
        targetOG = 1 + (preBoilPoints / expectedPostBoilVol);
        targetVolume = expectedPostBoilVol;
      }
    }

    if (mergedActuals.og) targetOG = mergedActuals.og;
    if (mergedActuals.postBoilVolume) targetVolume = mergedActuals.postBoilVolume;

    const targetSRM = calculateSRM(actualFermentables, targetVolume);
    const targetIBU = calculateIBU(actualHops, targetOG, targetVolume, recipe.boilVolume);
    const primaryFermenter = recipe.fermenters[0];

    let fg = primaryFermenter.targetFG;
    let abv = primaryFermenter.targetABV;

    if (mergedActuals.fg) {
      fg = mergedActuals.fg;
      abv = calculateABV(targetOG, fg);
    } else {
      fg = calculateFG(targetOG, primaryFermenter.yeast);
      abv = calculateABV(targetOG, fg);
    }

    return {
      sharedTargets: { targetOG, targetSRM, targetIBU },
      primaryFermenter: { ...primaryFermenter, targetFG: fg, targetABV: abv },
      batchVolume: targetVolume,
      fermentables: actualFermentables,
      hops: actualHops,
      activeTargetWater,
      mashSteps: mashStepsToUse,
      mergedActuals
    };
  }, [session?.events, session?.actuals, session?.recipeSnapshot, session?.raptPillData]);

  const projectedData = useMemo(() => {
    if (!session?.raptLogStart || !session.recipeSnapshot) return null;
    const og = session.actuals.og || session.recipeSnapshot.targetOG;
    const fg = session.recipeSnapshot.fermenters[0]?.targetFG || 1.010;
    const startTime = new Date(session.raptLogStart).getTime();

    const yeastAttenuation = session.recipeSnapshot.fermenters[0]?.yeast[0]?.attenuation || 75;

    return calculateAdvancedFermentationProjection(
      og,
      fg,
      startTime,
      fermentationSteps,
      session.raptPillData || [],
      yeastAttenuation
    );
  }, [session, fermentationSteps]);

  return {
    fermentationSteps,
    dryHops,
    totalFermentDays,
    lagPhaseInfo,
    timelineMilestones,
    updatedTargets,
    insights,
    projectedData
  };
};

import type { Fermentable, Hop, Yeast, FermenterEntity, WaterVolumes, Equipment, HopVariety, FermentationStep } from '../types/brewing';

/**
 * Calculates the required strike water temperature
 */
export const calculateStrikeTemp = (
  targetMashTemp: number, // Celsius
  grainTemp: number, // Celsius
  waterToGrainRatio: number, // L/kg
): number => {
  if (waterToGrainRatio <= 0) return targetMashTemp;
  // Formula: Ts = (0.41 / R) * (Tm - Tg) + Tm
  const strikeTemp = (0.41 / waterToGrainRatio) * (targetMashTemp - grainTemp) + targetMashTemp;
  return Number(strikeTemp.toFixed(1));
};

/**
 * Calculates all water volumes for a brew day
 */
export const calculateWaterVolumes = (
  equipment: Equipment,
  fermentables: Fermentable[],
  boilTime: number,
  brewMethod: 'All Grain' | 'Extract' | 'Partial Mash' | 'BIAB' = 'All Grain',
  overrideBatchVolume?: number,
  manualStrikeVolume?: number,
  manualSpargeVolume?: number,
  overrideTrubLoss?: number,
  overrideBoilOffRate?: number
): WaterVolumes => {
  const batchVolume = overrideBatchVolume !== undefined ? overrideBatchVolume : equipment.batchVolume;
  const trubLoss = overrideTrubLoss !== undefined ? overrideTrubLoss : equipment.trubLoss;
  const boilOffRate = overrideBoilOffRate !== undefined ? overrideBoilOffRate : equipment.boilOffRate;
  const totalGrainWeight = fermentables.reduce((acc, f) => {
    // If it has 0 PPG, treat it as having no impact on water volumes/absorption
    if (f.yield <= 0) return acc;
    return acc + f.weight;
  }, 0);
  
  const boilOffLoss = (boilOffRate * boilTime) / 60;
  const preBoilVolume = batchVolume + boilOffLoss + trubLoss;
  const grainAbsorption = brewMethod === 'Extract' ? 0 : totalGrainWeight * (equipment.grainAbsorptionRate || 0.8);
  const mashLoss = grainAbsorption + equipment.mashTunDeadspace;
  const totalWater = preBoilVolume + mashLoss;
  
  let defaultMashWater: number;
  if (brewMethod === 'Extract') {
    // Extract brewers typically steep in a smaller volume (e.g., 2.5-3.0 L/kg)
    defaultMashWater = Math.max(8, totalGrainWeight * 3); 
  } else if (brewMethod === 'BIAB') {
    defaultMashWater = totalWater;
  } else {
    defaultMashWater = Math.max(totalWater * 0.6, totalGrainWeight * 3);
  }

  const strikeWater = manualStrikeVolume !== undefined ? manualStrikeVolume : defaultMashWater;
  const spargeWater = manualSpargeVolume !== undefined ? manualSpargeVolume : Math.max(0, totalWater - strikeWater);

  return {
    mashWater: Number(strikeWater.toFixed(1)),
    spargeWater: Number(spargeWater.toFixed(1)),
    boilVolume: Number(preBoilVolume.toFixed(1)),
    batchVolume: Number(batchVolume.toFixed(1)),
    boilOffLoss: Number(boilOffLoss.toFixed(1)),
    trubLoss: trubLoss,
    grainAbsorption: Number(grainAbsorption.toFixed(1)),
    mashTunDeadspace: equipment.mashTunDeadspace
  };
};

/**
 * Estimated Original Gravity (OG)
 */
export const calculateOG = (
  fermentables: Fermentable[],
  efficiency: number,
  batchVolume: number, // in Liters (Target volume into fermenter)
  brewMethod: 'All Grain' | 'Extract' | 'Partial Mash' | 'BIAB' = 'All Grain',
  trubLoss: number = 0 // Liters lost in kettle
): number => {
  // Total volume of wort that actually receives extracted sugars
  const totalWortVolume = batchVolume + trubLoss;
  if (totalWortVolume <= 0) return 1.0;
  
  const totalWortVolGal = totalWortVolume * 0.264172;
  const totalGravityPoints = fermentables.reduce((acc, f) => {
    const weightLbs = f.weight * 2.20462;
    // f.yield is PPG. Theoretical max for sucrose is ~46 PPG.
    const appliedEfficiency = (brewMethod === 'Extract' || f.isExtract) ? 100 : efficiency;
    return acc + weightLbs * f.yield * (appliedEfficiency / 100);
  }, 0);
  
  // OG is based on the points extracted into the total volume collected post-mash.
  // Note: Mash tun deadspace reduces efficiency overall, but standard brewing software 
  // usually accounts for it in the global 'efficiency' number. 
  // For precise volume-based gravity, we divide points by total volume collected.
  const og = 1 + totalGravityPoints / totalWortVolGal / 1000;
  return Number(og.toFixed(3));
};

/**
 * Estimated Final Gravity (FG)
 */
export const calculateFG = (og: number, yeasts: Yeast[]): number => {
  if (og <= 1.0) return 1.0;
  
  // If no yeast, assume a typical 75% attenuation for planning purposes
  const avgAttenuation = (yeasts && yeasts.length > 0)
    ? yeasts.reduce((acc, y) => acc + y.attenuation, 0) / yeasts.length
    : 75;
    
  const fg = 1 + (og - 1) * (1 - avgAttenuation / 100);
  return Number(fg.toFixed(3));
};

/**
 * Alcohol By Volume (ABV)
 */
export const calculateABV = (og: number, fg: number): number => {
  if (og <= fg) return 0;
  // Advanced ABV formula for better accuracy at high gravities
  const abv = (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
  return Number(abv.toFixed(3)); // Increased precision for smoother telemetry curves
};

/**
 * Math utility for Specific Gravity Temperature Correction 
 * Uses standard polynomial approximation, assuming 20°C (68°F) hydrometer/pill calibration
 */
export const correctGravityForTemperature = (sg: number, tempC: number): number => {
  if (!sg || !tempC) return sg;
  const tempF = (tempC * 9) / 5 + 32;
  const calF = 68; 

  const correctionFactor = (t: number) =>
    1.00130346 - 0.000134722124 * t + 0.00000204052596 * Math.pow(t, 2) - 0.00000000232820948 * Math.pow(t, 3);

  const correctedSG = sg * (correctionFactor(tempF) / correctionFactor(calF));
  return Number(correctedSG.toFixed(4));
};

/**
 * Color (SRM) using Morey equation
 */
export const calculateSRM = (
  fermentables: Fermentable[],
  batchVolume: number // in Liters
): number => {
  if (batchVolume <= 0) return 0;
  const batchVolGal = batchVolume * 0.264172;
  const totalMCU = fermentables.reduce((acc, f) => {
    const weightLbs = f.weight * 2.20462;
    return acc + (weightLbs * f.color) / batchVolGal;
  }, 0);
  if (totalMCU === 0) return 0;
  const srm = 1.4922 * Math.pow(totalMCU, 0.6859);
  return Number(srm.toFixed(1));
};

/**
 * Bitterness (IBU) for a single hop addition using Tinseth formula
 */
export const calculateSingleHopIBU = (
  hop: Hop,
  og: number,
  batchVolume: number, // in Liters
  boilVolume: number // in Liters
): number => {
  if (batchVolume <= 0 || hop.weight <= 0 || hop.alphaAcid <= 0) return 0;
  
  // Only certain uses contribute significantly to IBU
  if (!['boil', 'first_wort', 'mash', 'whirlpool'].includes(hop.use)) return 0;

  // alphaAcid is always stored as a percentage (e.g. 12 = 12%)
  const aa = hop.alphaAcid;

  // Physics upgrade: Use Average Boil Gravity instead of OG
  const averageBoilVolume = (batchVolume + boilVolume) / 2;
  const averageBoilGravity = 1 + ((og - 1) * (batchVolume / averageBoilVolume));

  // Bigness factor: 1.65 * 0.000125^(boil_gravity - 1)
  const bignessFactor = 1.65 * Math.pow(0.000125, averageBoilGravity - 1);
  
  let utilizationTime = hop.time;
  let utilizationMultiplier = 1.0;

  if (hop.use === 'first_wort') {
    utilizationTime = 60; // Standardize FW to 60 min boil equivalent for utilization
    utilizationMultiplier = 1.1; // 10% bonus for FW
  } else if (hop.use === 'mash') {
    utilizationTime = 15; // Mash hopping contributes very little bitterness
    utilizationMultiplier = 0.2;
  } else if (hop.use === 'whirlpool') {
    // Whirlpool utilization depends heavily on temperature
    const whirlpoolTemp = hop.temp || 80;
    if (whirlpoolTemp >= 90) utilizationTime = hop.time * 0.5;
    else if (whirlpoolTemp >= 80) utilizationTime = hop.time * 0.2;
    else return 0; // Below 80C, alpha acid isomerization effectively stops
  }

  // Boil time factor: (1 - e^(-0.04 * time)) / 4.15
  const boilTimeFactor = (1 - Math.exp(-0.04 * utilizationTime)) / 4.15;
  const utilization = bignessFactor * boilTimeFactor * utilizationMultiplier;
  
  // IBU = (Utilization * mg/L of Alpha Acids)
  const mgLAlphaAcids = (hop.weight * aa * 10) / batchVolume;
  
  return utilization * mgLAlphaAcids;
};

/**
 * Bitterness (IBU) using Tinseth formula for all hops
 */
export const calculateIBU = (
  hops: Hop[],
  og: number,
  batchVolume: number, // in Liters
  boilVolume: number // in Liters
): number => {
  const totalIBU = hops.reduce((acc, hop) => acc + calculateSingleHopIBU(hop, og, batchVolume, boilVolume), 0);
  return Number(totalIBU.toFixed(1));
};

/**
 * Calculates the weight (g) required for a hop addition to hit a target IBU contribution.
 */
export const calculateWeightToHitIBU = (
  targetIBUContribution: number,
  hop: Hop,
  og: number,
  batchVolume: number, // in Liters
  boilVolume: number // in Liters
): number => {
  if (batchVolume <= 0 || hop.alphaAcid <= 0) return 0;
  if (!['boil', 'first_wort', 'mash', 'whirlpool'].includes(hop.use)) return 0;

  // alphaAcid is always stored as a percentage (e.g. 12 = 12%)
  const aa = hop.alphaAcid;

  const averageBoilVolume = (batchVolume + boilVolume) / 2;
  const averageBoilGravity = 1 + ((og - 1) * (batchVolume / averageBoilVolume));

  const bignessFactor = 1.65 * Math.pow(0.000125, averageBoilGravity - 1);
  
  let utilizationTime = hop.time;
  let utilizationMultiplier = 1.0;

  if (hop.use === 'first_wort') {
    utilizationTime = 60;
    utilizationMultiplier = 1.1;
  } else if (hop.use === 'mash') {
    utilizationTime = 15;
    utilizationMultiplier = 0.2;
  } else if (hop.use === 'whirlpool') {
    const whirlpoolTemp = hop.temp || 80;
    if (whirlpoolTemp >= 90) utilizationTime = hop.time * 0.5;
    else if (whirlpoolTemp >= 80) utilizationTime = hop.time * 0.2;
    else return 0;
  }

  const boilTimeFactor = (1 - Math.exp(-0.04 * utilizationTime)) / 4.15;
  const utilization = bignessFactor * boilTimeFactor * utilizationMultiplier;
  
  if (utilization <= 0) return 0;
  const weight = (targetIBUContribution * batchVolume) / (utilization * aa * 10);
  return Number(weight.toFixed(1));
};

/**
 * Calculates the retention factor for hop aroma/flavor volatiles based on addition time.
 * Adjusted for realistic boil-off rates and volatilization temperatures.
 */
export const getHopRetention = (time: number, use: string, temp?: number): number => {
  if (use === 'dry_hop') return 1.0;
  
  if (use === 'whirlpool' || use === 'aroma' || use === 'hopstand') {
    const whirlpoolTemp = temp || 80;
    const retention = Math.max(0, 1 - (whirlpoolTemp - 30) / 100); 
    return Number(retention.toFixed(2));
  } 

  if (use === 'first_wort') return 0.10; // FW retains some aroma but is exposed to full boil
  if (use === 'mash') return 0.05;
  
  const retention = Math.exp(-0.1 * time);
  return retention < 0.01 ? 0 : retention;
};

/**
 * Calculates overall hop profile scores, top tags, and oil concentration for a set of hop additions.
 */
export const calculateHopProfile = (
  hops: Hop[],
  allHopVarieties: HopVariety[],
  batchVolume: number = 20
) => {
  if (!hops || hops.length === 0) return null;

  let totalEffectiveOilContribution = 0;
  let totalOilMl = 0;
  let weightedScores = { fruity: 0, floral: 0, herbaceous: 0, spicy: 0, earthy: 0 };
  let weightedOils = { myrcene: 0, humulene: 0, caryophyllene: 0, farnesene: 0 };
  const tagCounts: Record<string, number> = {};

  hops.forEach(h => {
    const variety = h.customVariety || allHopVarieties.find(v => v.name.toLowerCase() === h.name.toLowerCase());
    if (!variety) return;

    const retention = getHopRetention(h.time, h.use, h.temp);
    const varietyTotalOil = variety.totalOils?.avg || 1.0; // mL/100g
    
    // Weight for weighted averages
    const weightFactor = h.weight * varietyTotalOil * retention;
    totalEffectiveOilContribution += weightFactor;
    
    // Absolute oil in mL
    const actualOilMl = (h.weight / 100) * varietyTotalOil * (h.use === 'dry_hop' ? 1.0 : retention);
    totalOilMl += actualOilMl;

    const m = variety.oilBreakdown?.myrcene?.avg || 0;
    const h_oil = variety.oilBreakdown?.humulene?.avg || 0;
    const c = variety.oilBreakdown?.caryophyllene?.avg || 0;
    const f = variety.oilBreakdown?.farnesene?.avg || 0;

    weightedOils.myrcene += m * weightFactor;
    weightedOils.humulene += h_oil * weightFactor;
    weightedOils.caryophyllene += c * weightFactor;
    weightedOils.farnesene += f * weightFactor;

    // Prefer pre-computed aromaScores when available; fall back to oil-derived heuristic
    const scores = variety.aromaScores
      ? {
          fruity: Math.min(5, variety.aromaScores.fruity),
          floral: Math.min(5, variety.aromaScores.floral),
          herbaceous: Math.min(5, variety.aromaScores.herbaceous),
          spicy: Math.min(5, variety.aromaScores.spicy),
          earthy: Math.min(5, variety.aromaScores.earthy)
        }
      : {
          fruity: Math.min(5, (m / 15) + (variety.tags.includes('tropical_fruit') || variety.tags.includes('citrus') ? 1.5 : 0)),
          floral: Math.min(5, (f / 3) + (variety.tags.includes('floral') ? 1.5 : 0.5)),
          herbaceous: Math.min(5, (f / 5) + (c / 10) + (variety.tags.includes('herbal') ? 1 : 0.5)),
          spicy: Math.min(5, (h_oil / 8) + (variety.tags.includes('spicy') ? 1 : 0.5)),
          earthy: Math.min(5, (c / 6) + (h_oil / 15) + (variety.tags.includes('earthy') ? 1 : 0.5))
        };

    weightedScores.fruity += scores.fruity * weightFactor;
    weightedScores.floral += scores.floral * weightFactor;
    weightedScores.herbaceous += scores.herbaceous * weightFactor;
    weightedScores.spicy += scores.spicy * weightFactor;
    weightedScores.earthy += scores.earthy * weightFactor;

    variety.tags.forEach((t: string) => {
      tagCounts[t] = (tagCounts[t] || 0) + weightFactor;
    });
  });

  if (totalEffectiveOilContribution === 0 && totalOilMl === 0) return null;

  const oilPerLiter = batchVolume > 0 ? totalOilMl / batchVolume : 0;

  return {
    scores: {
      Fruity: totalEffectiveOilContribution > 0 ? weightedScores.fruity / totalEffectiveOilContribution : 0,
      Floral: totalEffectiveOilContribution > 0 ? weightedScores.floral / totalEffectiveOilContribution : 0,
      Herbaceous: totalEffectiveOilContribution > 0 ? weightedScores.herbaceous / totalEffectiveOilContribution : 0,
      Spicy: totalEffectiveOilContribution > 0 ? weightedScores.spicy / totalEffectiveOilContribution : 0,
      Earthy: totalEffectiveOilContribution > 0 ? weightedScores.earthy / totalEffectiveOilContribution : 0
    },
    oilConcentration: {
      total: totalOilMl,
      perLiter: oilPerLiter,
      breakdown: {
        Myrcene: totalEffectiveOilContribution > 0 ? weightedOils.myrcene / totalEffectiveOilContribution : 0,
        Humulene: totalEffectiveOilContribution > 0 ? weightedOils.humulene / totalEffectiveOilContribution : 0,
        Caryophyllene: totalEffectiveOilContribution > 0 ? weightedOils.caryophyllene / totalEffectiveOilContribution : 0,
        Farnesene: totalEffectiveOilContribution > 0 ? weightedOils.farnesene / totalEffectiveOilContribution : 0
      }
    },
    topTags: Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(e => e[0])
  };
};

/**
 * Calculates the required Original Gravity (OG) to hit a target ABV given an attenuation.
 */
export const calculateTargetOGFromABV = (
  targetABV: number,
  attenuation: number // e.g. 0.75
): number => {
  if (targetABV <= 0 || attenuation <= 0) return 1.040;
  
  // Binary search to find OG that produces the target ABV via the advanced formula
  let low = 1.000;
  let high = 1.200;
  
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const fg = 1 + (mid - 1) * (1 - attenuation);
    const currentABV = (76.08 * (mid - fg) / (1.775 - mid)) * (fg / 0.794);
    
    if (currentABV < targetABV) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return Number(((low + high) / 2).toFixed(3));
};

/**
 * Calculates absolute weights for fermentables based on their percentages and a target OG.
 * Ensures that weights are correctly proportional to hit the target OG points.
 */
export const calculateWeightsFromPercentages = (
  fermentables: Fermentable[],
  targetOG: number,
  efficiency: number,
  batchVolume: number, // in Liters
  brewMethod: 'All Grain' | 'Extract' | 'Partial Mash' | 'BIAB' = 'All Grain',
  trubLoss: number = 0
): Fermentable[] => {
  const totalWortVolume = batchVolume + trubLoss;
  if (totalWortVolume <= 0 || targetOG <= 1.0) return fermentables;
  
  const totalPercentage = fermentables.reduce((acc, f) => acc + (f.percentage || 0), 0);
  if (Math.abs(totalPercentage - 100) > 0.01) return fermentables; // Don't scale if not 100%

  const totalWortVolGal = totalWortVolume * 0.264172;
  const totalGravityPointsNeeded = (targetOG - 1) * 1000 * totalWortVolGal;
  
  // First, calculate the weighted average PPG*efficiency for the entire grain bill
  // This allows us to find the TOTAL grain weight needed first.
  let weightedPotentialPPG = 0;
  fermentables.forEach(f => {
    const appliedEfficiency = (brewMethod === 'Extract' || f.isExtract) ? 100 : efficiency;
    weightedPotentialPPG += (f.yield * (appliedEfficiency / 100)) * ((f.percentage || 0) / 100);
  });

  if (weightedPotentialPPG <= 0) return fermentables;

  // Total weight in Lbs = Total Points / Weighted PPG
  const totalWeightLbs = totalGravityPointsNeeded / weightedPotentialPPG;
  
  return fermentables.map(f => {
    const weightLbs = totalWeightLbs * ((f.percentage || 0) / 100);
    const weightKg = weightLbs / 2.20462;
    return { ...f, weight: Number(weightKg.toFixed(3)) };
  });
};

/**
 * Recalculate all shared targets (Post-boil)
 */
export const calculateSharedTargets = (
  fermentables: Fermentable[],
  kettleHops: Hop[],
  efficiency: number,
  batchVolume: number, // in Liters
  boilVolume: number, // in Liters
  brewMethod: 'All Grain' | 'Extract' | 'Partial Mash' | 'BIAB' = 'All Grain',
  trubLoss: number = 0
) => {
  const og = calculateOG(fermentables, efficiency, batchVolume, brewMethod, trubLoss);
  const srm = calculateSRM(fermentables, batchVolume);
  const ibu = calculateIBU(kettleHops, og, batchVolume, boilVolume);
  return { targetOG: og, targetSRM: srm, targetIBU: ibu };
};

/**
 * Recalculate specific fermenter targets (Post-pitching)
 */
export const calculateFermenterTargets = (
  og: number,
  fermenter: FermenterEntity
) => {
  const fg = calculateFG(og, fermenter.yeast);
  const abv = calculateABV(og, fg);
  return { targetFG: fg, targetABV: abv };
};

/**
 * Advanced Fermentation Projection Model
 * 
 * Uses a modified Logistic Growth Curve (Sigmoid) that adapts its fermentation rate (k)
 * based on temperature, yeast dynamics, and real-time gravity velocity.
 */
export interface ProjectionPoint {
  unix: number;
  gravity: number;
  abv: number;
  temperature: number;
}

export const calculateAdvancedFermentationProjection = (
  og: number,
  targetFG: number,
  startTime: number, // unix timestamp
  fermentationSteps: FermentationStep[],
  rawActualDataPoints: { gravity: number; temperature: number; timestamp: string; gravityVelocity?: number }[] = [],
  yeastAttenuation: number = 75
): ProjectionPoint[] => {
  if (og <= 1.0) return [];

  // Pre-process real-time telemetry: normalize specific gravity to 20°C calibration to eliminate temperature-induced density noise.
  const actualDataPoints = rawActualDataPoints.map(p => ({
    ...p,
    gravity: correctGravityForTemperature(p.gravity, p.temperature)
  }));
  const points: ProjectionPoint[] = [];
  const fg = targetFG || (1 + (og - 1) * (1 - yeastAttenuation / 100));
  
  // 1. Detect Lag Phase
  let lagDurationDays = 1.0; 
  if (actualDataPoints.length > 1) {
    const firstDrop = actualDataPoints.find(p => (og - p.gravity) > 0.001);
    if (firstDrop) {
      lagDurationDays = (new Date(firstDrop.timestamp).getTime() - startTime) / 86400000;
    }
  }

  // 2. Base Model Params
  const primaryStep = fermentationSteps[0];
  const primaryDuration = primaryStep?.stepTime || 7;
  const k_base = 0.7 + (yeastAttenuation / 100); 
  
  // 3. Anchoring & Kinetic FG Estimation
  const lastActual = actualDataPoints[actualDataPoints.length - 1];
  const lastActualTimeDays = lastActual ? (new Date(lastActual.timestamp).getTime() - startTime) / 86400000 : 0;

  let projectedFG = fg;

  if (actualDataPoints.length >= 2) { 
    // Use up to the last 48 points (2 days if hourly) to judge recent velocity
    const lookbackCount = Math.min(actualDataPoints.length, 48);
    const recentPoints = actualDataPoints.slice(-lookbackCount);
    const firstRecent = recentPoints[0];
    const lastRecent = recentPoints[recentPoints.length - 1];
    
    const timeDeltaDays = (new Date(lastRecent.timestamp).getTime() - new Date(firstRecent.timestamp).getTime()) / 86400000;
    const gravityDelta = firstRecent.gravity - lastRecent.gravity; 
    
    // Need at least 2.4 hours of data baseline to calculate a real trajectory vs noise
    if (timeDeltaDays >= 0.1) {
      const velocityPPD = gravityDelta / timeDeltaDays; // Gravity points dropped per day
      
      // Determine the current step's target temperature to find the current active k_adj
      let currentAnchorTemp = 20;
      let elapsed = 0;
      for (const step of fermentationSteps) {
        if (lastActualTimeDays <= (elapsed + lagDurationDays + step.stepTime)) {
          currentAnchorTemp = step.stepTemp;
          break;
        }
        elapsed += step.stepTime;
      }

      // Calculate the kinetic rate constant at this exact temperature
      const T_ref = 20;
      const Q10 = 2.5;
      const k_adj_current = k_base * Math.pow(Q10, (currentAnchorTemp - T_ref) / 10);

      if (velocityPPD < 0.0015 && lastActual.gravity < og - 0.005) {
        // Fermentation has stalled or finished
        projectedFG = lastActual.gravity;
      } else if (velocityPPD > 0) {
        // SUPER ADVANCED KINETICS: First-Order Velocity Derivative
        // In exponential decay, dG/dt = -k * (G - FG)
        // Therefore, velocity = k * (G - FG)  =>  FG = G - (velocity / k)
        // This dynamically maps the exact theoretical FG based on current speed and temperature.
        const kineticFG = lastActual.gravity - (velocityPPD / k_adj_current);
        
        // Sanity constraints: Even super-yeast won't usually go below 0.990, 
        // and we don't want to forecast a stuck fermentation unhelpfully high if velocity is just a little noisy.
        projectedFG = Math.max(0.990, Math.min(lastActual.gravity, kineticFG));
      }
    }
  }

  // Calculate base t0
  let t0 = lagDurationDays + (primaryDuration * 0.4); 

  // If we have data past the lag phase, solve for an "effective t0" that fits the curve to the last point
  if (lastActual && lastActual.gravity < og - 0.001 && lastActual.gravity > projectedFG) {
    // Find temperature at anchor point to get local k
    let anchorTargetTemp = 20;
    let anchorElapsed = 0;
    for (const step of fermentationSteps) {
      if (lastActualTimeDays <= (anchorElapsed + lagDurationDays + step.stepTime)) {
        anchorTargetTemp = step.stepTemp;
        break;
      }
      anchorElapsed += step.stepTime;
    }
    const Q10 = 2.5;
    const T_ref = 20;
    const anchor_k_adj = k_base * Math.pow(Q10, (anchorTargetTemp - T_ref) / 10);

    // Solve G = FG + (OG - FG) / (1 + exp(k(t - t0))) for t0
    // exp(k(t - t0)) = (OG - FG) / (G - FG) - 1 = (OG - G) / (G - FG)
    const ratio = (og - lastActual.gravity) / (lastActual.gravity - projectedFG);
    if (ratio > 0) {
      t0 = lastActualTimeDays - (Math.log(ratio) / anchor_k_adj);
    }
  }

  const T_ref = 20;
  const Q10 = 2.5; 
  const totalDurationDays = fermentationSteps.reduce((acc, s) => acc + s.stepTime, 0) + lagDurationDays;

  for (let t = 0; t <= totalDurationDays + 3; t += (4/24)) {
    let currentTargetTemp = 20;
    let elapsed = 0;
    for (const step of fermentationSteps) {
      if (t <= (elapsed + lagDurationDays + step.stepTime)) {
        currentTargetTemp = step.stepTemp;
        break;
      }
      elapsed += step.stepTime;
    }

    // Logistic decay formula
    const k_adj = k_base * Math.pow(Q10, (currentTargetTemp - T_ref) / 10);
    
    let gravity: number;
    if (t < lagDurationDays && (!lastActual || lastActual.gravity >= og - 0.001)) {
      // STRICT LAG PHASE: Flat line at OG
      gravity = og;
    } else {
      // LOGISTIC CURVE starting from effective t0
      const exponent = k_adj * (t - t0);
      gravity = projectedFG + (og - projectedFG) / (1 + Math.exp(exponent));
    }

    // Anchoring logic for transition Smoothing (if needed)
    // ...

    // ENSURE MONOTONICITY: Gravity can never be higher than the previous point
    const lastPoint = points[points.length - 1];
    if (lastPoint && gravity > lastPoint.gravity) {
      gravity = lastPoint.gravity;
    }
    
    // Fermentation Halt: If temperature is very low (e.g. cold crash), 
    // biological activity stops.
    if (currentTargetTemp < 5 && lastPoint) {
      gravity = lastPoint.gravity;
    }
    
    gravity = Math.max(projectedFG, Math.min(og, gravity));

    // Smooth the transition closely if we have actual data (epsilon = half a step)
    if (lastActual && Math.abs(t - lastActualTimeDays) < (2/24)) {
      gravity = lastActual.gravity;
    }

    points.push({
      unix: startTime + (t * 86400000),
      gravity: Number(gravity.toFixed(3)),
      abv: calculateABV(og, gravity),
      temperature: currentTargetTemp
    });
  }

  return points;
};

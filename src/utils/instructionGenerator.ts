import type { Recipe, BrewEvent, MashStep, Hop, FermenterEntity } from '../types/brewing';
import { calculateWaterVolumes, calculateStrikeTemp, calculateOG } from './brewingMath';
import { calculateWaterAdditions } from './waterChemistry';

const DEFAULT_SETTINGS = {
  strikeTemp: 67,
  grainTemp: 20,
  whirlpoolTemp: 80,
  pitchTemp: 20,
  mashPh: 5.4,
  co2Volumes: 2.5,
  boilingTemp: 100,
};

const getWaterEvents = (recipe: Recipe, volumes: any): BrewEvent[] => {
  const events: BrewEvent[] = [];
  const fermentables = recipe.fermentables || [];
  const mashSteps = recipe.mashSteps || [];
  
  const totalGrainWeight = fermentables.reduce((acc, f) => acc + f.weight, 0);
  const grainRatio = totalGrainWeight > 0 ? volumes.mashWater / totalGrainWeight : 1;
  const initialMashTemp = mashSteps[0]?.stepTemp || DEFAULT_SETTINGS.strikeTemp;

  const strikeTemp = calculateStrikeTemp(
    initialMashTemp,
    DEFAULT_SETTINGS.grainTemp,
    grainRatio
  );

  events.push({
    id: crypto.randomUUID(),
    type: 'water',
    label: 'Prepare Strike Water',
    subLabel: `Heat ${volumes.mashWater.toFixed(1)}L to ${strikeTemp}°C.`,
    targetValue: volumes.mashWater,
    targetTemp: strikeTemp,
    unit: 'L',
    completed: false
  });

  const totalWaterVolumeLiters = volumes.mashWater + volumes.spargeWater;
  if (recipe.targetWaterProfile && recipe.waterProfile) {
    const saltMath = calculateWaterAdditions(recipe.waterProfile, recipe.targetWaterProfile, totalWaterVolumeLiters);
    const detailedSalts = [
      { id: 'gypsum', label: 'Gypsum', target: saltMath.additions.gypsum, unit: 'g' },
      { id: 'cacl2', label: 'Calcium Chloride', target: saltMath.additions.cacl2, unit: 'g' },
      { id: 'epsom', label: 'Epsom Salt', target: saltMath.additions.epsom, unit: 'g' },
      { id: 'bakingSoda', label: 'Baking Soda', target: saltMath.additions.bakingSoda, unit: 'g' }
    ].filter(s => s.target > 0);

    if (detailedSalts.length > 0) {
      events.push({
        id: crypto.randomUUID(),
        type: 'water',
        label: 'Add Water Salts',
        subLabel: 'Add calculated minerals to strike water.',
        detailedActuals: detailedSalts,
        completed: false
      });
    }
  }

  if (recipe.acidAddition && recipe.acidAddition.volumeMl > 0) {
    events.push({
      id: crypto.randomUUID(),
      type: 'water',
      label: `Acidify Mash (${recipe.acidAddition.type})`,
      subLabel: `Add ${recipe.acidAddition.volumeMl}ml of ${recipe.acidAddition.type} acid.`,
      targetValue: recipe.acidAddition.volumeMl,
      unit: 'ml',
      completed: false
    });
  }

  return events;
};

const getMashEvents = (recipe: Recipe, volumes: any): BrewEvent[] => {
  const events: BrewEvent[] = [];
  const fermentables = recipe.fermentables || [];
  const mashSteps = recipe.mashSteps || [];
  
  const totalGrainWeight = fermentables.reduce((acc, f) => acc + f.weight, 0);
  const grainRatio = totalGrainWeight > 0 ? volumes.mashWater / totalGrainWeight : 1;
  const initialMashTemp = mashSteps[0]?.stepTemp || DEFAULT_SETTINGS.strikeTemp;

  const strikeTemp = calculateStrikeTemp(
    initialMashTemp,
    DEFAULT_SETTINGS.grainTemp,
    grainRatio
  );

  const grainActuals = fermentables.map(f => ({
    id: f.id,
    label: f.name,
    target: f.weight,
    unit: 'kg'
  }));

  events.push({
    id: crypto.randomUUID(),
    type: 'mash',
    label: 'Mash In',
    subLabel: 'Mix milled grains with strike water. Ensure no dough balls.',
    detailedActuals: grainActuals,
    completed: false
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Mash pH Check',
    subLabel: `Target: ${DEFAULT_SETTINGS.mashPh} pH at room temp. Check ~10 mins into mash.`,
    targetValue: DEFAULT_SETTINGS.mashPh,
    unit: 'pH',
    completed: false
  });

  mashSteps.forEach((step: MashStep, idx: number) => {
    const prevTemp = idx > 0 ? mashSteps[idx-1].stepTemp : strikeTemp;
    const tempChange = step.stepTemp - prevTemp;
    
    let instruction = `Rest at ${step.stepTemp}°C.`;
    if (tempChange > 0) instruction = `Heat wort ${tempChange.toFixed(1)}°C, then rest at ${step.stepTemp}°C.`;
    else if (tempChange < 0) instruction = `Cool/Wait for ${Math.abs(tempChange).toFixed(1)}°C drop, then rest at ${step.stepTemp}°C.`;

    events.push({
      id: crypto.randomUUID(),
      type: 'mash',
      label: `Mash Step: ${step.name}`,
      subLabel: instruction,
      duration: step.stepTime,
      targetTemp: step.stepTemp,
      metadata: { mashDetails: { name: step.name, temp: step.stepTemp, time: step.stepTime } },
      completed: false
    });
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'water',
    label: 'Collect Wort & Sparge',
    subLabel: `Sparge with ${volumes.spargeWater.toFixed(1)}L.`,
    targetValue: volumes.spargeWater,
    unit: 'L',
    completed: false
  });

  return events;
};

const getBoilEvents = (recipe: Recipe): BrewEvent[] => {
  const events: BrewEvent[] = [];
  const kettleHops = recipe.kettleHops || [];
  
  // First Wort Hops occur before the boil starts, right after collection
  const firstWortHops = kettleHops.filter(h => h.use === 'first_wort');
  firstWortHops.forEach((hop: Hop) => {
    events.push({
      id: crypto.randomUUID(),
      type: 'hop',
      label: `Add Hop: ${hop.name}`,
      subLabel: 'First Wort',
      targetValue: hop.weight,
      unit: 'g',
      hopUse: hop.use,
      hopTime: hop.time,
      hopTemp: hop.temp,
      metadata: { hopDetails: { id: hop.id, name: hop.name, weight: hop.weight, alpha: hop.alphaAcid } },
      completed: false
    });
  });

  // Calculate predicted pre-boil gravity based on recipe targets
  const preBoilGravity = calculateOG(
    recipe.fermentables || [],
    recipe.efficiency,
    recipe.boilVolume,
    recipe.type,
    recipe.trubLoss || recipe.equipment.trubLoss
  );

  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Pre-boil Measurements',
    subLabel: `Target Vol: ${recipe.boilVolume.toFixed(1)}L | Target SG: ${preBoilGravity.toFixed(3)}`,
    targetValue: recipe.boilVolume,
    unit: 'L',
    completed: false
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'boil',
    label: 'Boil & Hops',
    subLabel: `Total boil time: ${recipe.boilTime} minutes. Start timer when it hits a rolling boil.`,
    duration: recipe.boilTime,
    targetValue: recipe.boilTime,
    unit: 'min',
    completed: false
  });

  const boilAndWhirlpoolHops = kettleHops.filter(h => h.use !== 'dry_hop' && h.use !== 'first_wort');
  const sortedHops = [...boilAndWhirlpoolHops].sort((a, b) => b.time - a.time);
  
  let currentTemp = DEFAULT_SETTINGS.boilingTemp;

  sortedHops.forEach((hop: Hop) => {
    let timingLabel = '';
    
    if (hop.use === 'boil') {
      timingLabel = `${hop.time}m remaining`;
    } else if (hop.use === 'whirlpool' || hop.use === 'aroma' || hop.use === 'hopstand') {
      const hopTargetTemp = hop.temp || DEFAULT_SETTINGS.whirlpoolTemp;
      
      if (hopTargetTemp < currentTemp) {
        events.push({
          id: crypto.randomUUID(),
          type: 'cooling',
          label: 'Reduce Wort Temperature',
          subLabel: `Chill wort to ${hopTargetTemp}°C for hop additions.`,
          targetTemp: hopTargetTemp,
          completed: false
        });
        currentTemp = hopTargetTemp;
      }
      timingLabel = `${hop.time}m whirlpool at ${hopTargetTemp}°C`;
    }

    events.push({
      id: crypto.randomUUID(),
      type: 'hop',
      label: `Add Hop: ${hop.name}`,
      subLabel: timingLabel,
      targetValue: hop.weight,
      unit: 'g',
      hopUse: hop.use,
      hopTime: hop.time,
      hopTemp: hop.temp,
      metadata: { hopDetails: { id: hop.id, name: hop.name, weight: hop.weight, alpha: hop.alphaAcid } },
      completed: false
    });
  });

  return events;
};

const getFermentationEvents = (recipe: Recipe): BrewEvent[] => {
  const events: BrewEvent[] = [];
  const fermenters = recipe.fermenters || [];
  const primaryFermenter = fermenters[0];
  
  let pitchTemp = DEFAULT_SETTINGS.pitchTemp;
  if (primaryFermenter?.yeast?.[0]?.customVariety?.tempRange?.c?.[0]) {
    pitchTemp = primaryFermenter.yeast[0].customVariety.tempRange.c[0];
  }

  events.push({
    id: crypto.randomUUID(),
    type: 'cooling',
    label: 'Chill Wort',
    subLabel: `Chill to pitching temperature (${pitchTemp}°C).`,
    targetTemp: pitchTemp, 
    unit: '°C',
    completed: false
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Post-boil Measurements (OG)',
    subLabel: `Target OG: ${recipe.targetOG.toFixed(3)} | Target Volume: ${recipe.batchVolume.toFixed(1)}L`,
    targetValue: recipe.targetOG,
    unit: 'SG',
    completed: false
  });

  fermenters.forEach((f: FermenterEntity) => {
    (f.yeast || []).forEach(y => {
      events.push({
        id: crypto.randomUUID(),
        type: 'yeast',
        label: `Pitch ${y.name}`,
        subLabel: `Fermenter: ${f.name} at ${pitchTemp}°C`,
        metadata: { yeastDetails: { name: y.name } },
        completed: false
      });
    });

    (f.fermentationSteps || []).forEach(step => {
      events.push({
        id: crypto.randomUUID(),
        type: 'fermentation',
        label: `Phase: ${step.name}`,
        subLabel: `${step.stepTime} days at ${step.stepTemp}°C`,
        targetTemp: step.stepTemp,
        unit: '°C',
        metadata: { mashDetails: { name: step.name, temp: step.stepTemp, time: step.stepTime, id: step.id } as any },
        completed: false
      });
    });
  });

  const dryHops = (recipe.kettleHops || []).filter(h => h.use === 'dry_hop');
  dryHops.forEach(hop => {
    events.push({
      id: crypto.randomUUID(),
      type: 'hop',
      label: `Dry Hop: ${hop.name}`,
      subLabel: `Add on fermentation day ${hop.time}.`,
      targetValue: hop.weight,
      unit: 'g',
      hopUse: hop.use,
      hopTime: hop.time,
      metadata: { hopDetails: { id: hop.id, name: hop.name, weight: hop.weight, alpha: hop.alphaAcid } },
      completed: false
    });
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'packaging',
    label: 'Packaging',
    subLabel: `Carbonate to ${primaryFermenter?.volume ? DEFAULT_SETTINGS.co2Volumes : 2.5} vols CO2. Bottle or Keg.`,
    completed: false
  });

  return events;
};

export const generateBrewEvents = (recipe: Recipe): BrewEvent[] => {
  const volumes = calculateWaterVolumes(
    recipe.equipment, 
    recipe.fermentables, 
    recipe.boilTime, 
    recipe.type, 
    recipe.batchVolume, 
    recipe.waterSettings?.manualStrikeVolume, 
    recipe.waterSettings?.manualSpargeVolume,
    recipe.trubLoss
  );

  return [
    ...getWaterEvents(recipe, volumes),
    ...getMashEvents(recipe, volumes),
    ...getBoilEvents(recipe),
    ...getFermentationEvents(recipe)
  ];
};

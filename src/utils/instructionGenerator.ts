import type { Recipe, BrewEvent, MashStep, Hop } from '../types/brewing';
import { calculateWaterVolumes, calculateStrikeTemp } from './brewingMath';
import { calculateWaterAdditions } from './waterChemistry';

export const generateBrewEvents = (recipe: Recipe): BrewEvent[] => {
  const events: BrewEvent[] = [];
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

  // 1. Water & Salts Phase
  const strikeTemp = calculateStrikeTemp(
    recipe.mashSteps[0]?.stepTemp || 67,
    20, // Assume 20C grain temp if not specified
    volumes.mashWater / (recipe.fermentables.reduce((acc, f) => acc + f.weight, 0) || 1)
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

  // 2. Mash In Phase
  const grainActuals = recipe.fermentables.map(f => ({
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

  // 3. Mash Rests Phase
  recipe.mashSteps.forEach((step: MashStep, idx: number) => {
    const prevTemp = idx > 0 ? recipe.mashSteps[idx-1].stepTemp : strikeTemp;
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
      completed: false
    });
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Mash pH Check',
    subLabel: 'Target: 5.2 - 5.5 pH at room temp.',
    targetValue: 5.4,
    unit: 'pH',
    completed: false
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

  // 4. Pre-boil Checkpoint
  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Pre-boil Measurements',
    subLabel: `Target: ${recipe.boilVolume.toFixed(1)}L`,
    targetValue: recipe.boilVolume,
    unit: 'L',
    completed: false
  });

  // 5. Boil Phase
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

  const kettleHops = recipe.kettleHops.filter(h => h.use !== 'dry_hop');
  const sortedKettleHops = [...kettleHops].sort((a, b) => b.time - a.time);
  
  let whirlpoolPhaseAdded = false;

  sortedKettleHops.forEach((hop: Hop) => {
    let timingLabel = '';
    if (hop.use === 'boil') timingLabel = `${hop.time}m remaining`;
    else if (hop.use === 'first_wort') timingLabel = 'First Wort';
    else if (hop.use === 'whirlpool' || hop.use === 'aroma' || hop.use === 'hopstand') {
      if (!whirlpoolPhaseAdded) {
        events.push({
          id: crypto.randomUUID(),
          type: 'cooling',
          label: 'Reduce to Whirlpool Temperature',
          subLabel: `Chill wort to ${hop.temp || 80}°C.`,
          targetTemp: hop.temp || 80,
          completed: false
        });
        whirlpoolPhaseAdded = true;
      }
      timingLabel = `${hop.time}m whirlpool at ${hop.temp || 80}°C`;
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

  // 6. Post-boil / Cooling
  events.push({
    id: crypto.randomUUID(),
    type: 'cooling',
    label: 'Chill Wort',
    subLabel: 'Chill to pitching temperature.',
    targetTemp: 20, 
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

  // 7. Yeast & Fermentation
  recipe.fermenters.forEach(f => {
    f.yeast.forEach(y => {
      events.push({
        id: crypto.randomUUID(),
        type: 'yeast',
        label: `Pitch ${y.name}`,
        subLabel: `Fermenter: ${f.name}`,
        metadata: { yeastDetails: { name: y.name } },
        completed: false
      });
    });
  });

  // 8. Dry Hops (After Pitching)
  const dryHops = recipe.kettleHops.filter(h => h.use === 'dry_hop');
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

  // 9. Packaging
  events.push({
    id: crypto.randomUUID(),
    type: 'packaging',
    label: 'Packaging',
    subLabel: `Carbonate to ${recipe.fermenters[0]?.volume || 2.5} vols CO2. Bottle or Keg.`,
    completed: false
  });

  return events;
};

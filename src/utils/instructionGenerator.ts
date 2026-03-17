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
    const saltList = [
      { name: 'Gypsum', amount: saltMath.additions.gypsum, unit: 'g' },
      { name: 'Calcium Chloride', amount: saltMath.additions.cacl2, unit: 'g' },
      { name: 'Epsom Salt', amount: saltMath.additions.epsom, unit: 'g' },
      { name: 'Baking Soda', amount: saltMath.additions.bakingSoda, unit: 'g' }
    ].filter(s => s.amount > 0);

    if (saltList.length > 0) {
      events.push({
        id: crypto.randomUUID(),
        type: 'water',
        label: 'Add Water Salts',
        subLabel: 'Add salts to strike water.',
        metadata: { salts: saltList },
        completed: false
      });
    }
  }

  if (recipe.acidAddition && recipe.acidAddition.volumeMl > 0) {
    events.push({
      id: crypto.randomUUID(),
      type: 'water',
      label: 'Acidify Mash Water',
      subLabel: `Add ${recipe.acidAddition.volumeMl}ml of ${recipe.acidAddition.type} acid.`,
      targetValue: recipe.acidAddition.volumeMl,
      unit: 'ml',
      completed: false
    });
  }

  // 2. Mash Phase
  recipe.mashSteps.forEach((step: MashStep, idx: number) => {
    const prevTemp = idx > 0 ? recipe.mashSteps[idx-1].stepTemp : strikeTemp;
    const tempChange = step.stepTemp - prevTemp;
    
    let instruction = `Rest at ${step.stepTemp}°C.`;
    if (tempChange > 0) instruction = `Heat water ${tempChange.toFixed(1)}°C, then rest at ${step.stepTemp}°C.`;
    else if (tempChange < 0) instruction = `Cool/Wait for ${Math.abs(tempChange).toFixed(1)}°C drop, then rest at ${step.stepTemp}°C.`;

    events.push({
      id: crypto.randomUUID(),
      type: 'mash',
      label: `Mash Step: ${step.name}`,
      subLabel: instruction,
      duration: step.stepTime,
      targetValue: step.stepTime,
      targetTemp: step.stepTemp,
      unit: 'min',
      metadata: { mashDetails: { name: step.name, temp: step.stepTemp, time: step.stepTime } },
      completed: false
    });
  });

  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Mash pH Check',
    subLabel: 'Measure and record mash pH after 15-20 minutes.',
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

  // 3. Pre-boil Checkpoint
  events.push({
    id: crypto.randomUUID(),
    type: 'checkpoint',
    label: 'Pre-boil Measurements',
    subLabel: `Target: ${recipe.boilVolume.toFixed(1)}L`,
    targetValue: recipe.boilVolume,
    unit: 'L',
    completed: false
  });

  // 4. Boil Phase
  events.push({
    id: crypto.randomUUID(),
    type: 'boil',
    label: 'Bring to Boil',
    subLabel: `Total boil time: ${recipe.boilTime} minutes.`,
    duration: recipe.boilTime,
    targetValue: recipe.boilTime,
    unit: 'min',
    completed: false
  });

  // Sort hops by time (descending for boil additions)
  const sortedHops = [...recipe.kettleHops].sort((a, b) => b.time - a.time);
  
  sortedHops.forEach((hop: Hop) => {
    let timingLabel = '';
    if (hop.use === 'boil') timingLabel = `${hop.time}m remaining`;
    else if (hop.use === 'first_wort') timingLabel = 'First Wort';
    else if (hop.use === 'whirlpool' || hop.use === 'aroma') timingLabel = 'Flameout / Whirlpool';

    events.push({
      id: crypto.randomUUID(),
      type: 'hop',
      label: `Add ${hop.weight}g ${hop.name}`,
      subLabel: timingLabel,
      targetValue: hop.weight,
      unit: 'g',
      metadata: { hopDetails: { name: hop.name, weight: hop.weight, alpha: hop.alphaAcid } },
      completed: false
    });
  });

  // 5. Post-boil / Cooling
  events.push({
    id: crypto.randomUUID(),
    type: 'cooling',
    label: 'Chill Wort',
    subLabel: 'Chill to pitching temperature.',
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

  // 6. Yeast
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

  return events;
};

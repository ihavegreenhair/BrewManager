import type { Recipe, BrewEvent, MashStep, Hop } from '../types/brewing';
import { calculateWaterVolumes } from './brewingMath';

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
  events.push({
    id: crypto.randomUUID(),
    type: 'water',
    label: 'Prepare Strike Water',
    subLabel: `Heat ${volumes.mashWater.toFixed(1)}L to strike temperature.`,
    targetValue: volumes.mashWater,
    unit: 'L',
    completed: false
  });

  if (recipe.targetWaterProfile) {
    events.push({
      id: crypto.randomUUID(),
      type: 'water',
      label: 'Add Water Salts',
      subLabel: 'Add calculated salts to strike water.',
      completed: false
    });
  }

  if (recipe.acidAddition && recipe.acidAddition.volumeMl > 0) {
    events.push({
      id: crypto.randomUUID(),
      type: 'water',
      label: 'Acidify Mash Water',
      subLabel: `Add ${recipe.acidAddition.volumeMl}ml of ${recipe.acidAddition.type} acid.`,
      completed: false
    });
  }

  // 2. Mash Phase
  recipe.mashSteps.forEach((step: MashStep) => {
    events.push({
      id: crypto.randomUUID(),
      type: 'mash',
      label: `Mash Step: ${step.name}`,
      subLabel: `Rest at ${step.stepTemp}°C.`,
      duration: step.stepTime,
      targetValue: step.stepTemp,
      unit: '°C',
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
    subLabel: `Target: ${recipe.boilVolume.toFixed(1)}L at approx ${(recipe.targetOG > 1 ? (1 + (recipe.targetOG - 1) * 0.8).toFixed(3) : '1.0XX')}`,
    completed: false
  });

  // 4. Boil Phase
  events.push({
    id: crypto.randomUUID(),
    type: 'boil',
    label: 'Bring to Boil',
    subLabel: `Total boil time: ${recipe.boilTime} minutes.`,
    duration: recipe.boilTime,
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
        completed: false
      });
    });
  });

  return events;
};

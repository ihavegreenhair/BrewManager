export interface TastingInput {
  stats: { 
    og: number; 
    fg: number; 
    abv: number; 
    srm: number; 
    totalIBU: number;
    co2Volumes: number;
  };
  water: { 
    sulfate: number; 
    chloride: number; 
    calcium: number; 
    residualAlkalinity: number;
    mashPh: number;
    words?: { balance: string; intensity: string; body: string; alkalinity: string };
  };
  fermentables: Array<{ 
    name: string; 
    category: 'base' | 'crystal' | 'roasted' | 'adjunct' | 'fruit' | 'spice' | 'sugar';
    weightKg: number; 
    fermentability?: number; 
    proteinLevel?: 'low' | 'med' | 'high';
    ignoreMouthfeel?: boolean;
  }>;
  hops: {
    scores: { Fruity: number; Floral: number; Herbaceous: number; Spicy: number; Earthy: number };
    totalOilMl: number;
    dominantTags: string[];
    activeDryHop: boolean;
  };
  mashSteps: Array<{ tempC: number; durationMins: number }>;
  yeast: { 
    attenuation: number; 
    profile: 'clean' | 'fruity' | 'phenolic'; 
    biotransformation: 'low' | 'medium' | 'high';
    fermTempC: number;
    isLager?: boolean;
    scores?: { fruity: number; spicy: number; maltiness: number; clean: number; funky: number };
  };
}

export interface TastingOutput {
  notes: string;
  matrix: {
    sweetnessIndex: number;
    bitternessIndex: number;
    bodyIndex: number;
    roastIndex: number;
    hopAromaIndex: number;
    yeastEsterIndex: number;
    yeastPhenolIndex: number;
    mashFermentabilityScore: number;
    // Composite Sensory Scores (0-10) for Radar Chart
    fruityScore: number;
    floralScore: number;
    earthyScore: number;
    spicyScore: number;
    phenolicScore: number;
  };
}

const BrewingConstants = {
  BASELINE_AA: 0.76,
  HIGH_PROTEIN_THRESHOLD: 0.15,
  HIGH_RA_THRESHOLD: 100,
  HIGH_MASH_PH: 5.6,
};

const Synonyms = {
  entry: ["opens with", "presents", "leads with", "delivers", "showcases"],
  finish: ["concludes with", "finishes with", "leaves a final impression of", "ends on"],
};

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function analyzeMash(steps: Array<{ tempC: number; durationMins: number }>): number {
  let betaTime = 0;
  let alphaTime = 0;
  let totalTime = 0;

  for (const step of steps) {
    totalTime += step.durationMins;
    if (step.tempC >= 60 && step.tempC <= 65) betaTime += step.durationMins;
    else if (step.tempC >= 68 && step.tempC <= 72) alphaTime += step.durationMins;
    else if (step.tempC >= 66 && step.tempC <= 67) {
      betaTime += step.durationMins * 0.5;
      alphaTime += step.durationMins * 0.5;
    }
  }

  if (totalTime === 0) return 0;
  // Result: -1.0 (Very Alpha/Full) to 1.0 (Very Beta/Thin)
  return (betaTime - alphaTime) / (betaTime + alphaTime || 1);
}

function formatList(items: string[]): string {
  if (items.length === 0) return '';
  const uniqueItems = Array.from(new Set(items));
  if (uniqueItems.length === 1) return uniqueItems[0];
  if (uniqueItems.length === 2) return `${uniqueItems[0]} and ${uniqueItems[1]}`;
  return `${uniqueItems.slice(0, -1).join(', ')}, and ${uniqueItems[uniqueItems.length - 1]}`;
}

function cleanMaltName(name: string): string {
  const cleaned = name.replace(/malt|extract|syrup|grain/gi, '').trim() || 'base';
  const lowBodyGrains = ['rice', 'corn', 'sugar', 'dextrose'];
  if (lowBodyGrains.some(g => cleaned.toLowerCase().includes(g))) return 'delicate grain';
  return cleaned;
}

export function generateOverallTastingNotes(recipe: TastingInput): TastingOutput {
  const { stats, water, fermentables, hops, mashSteps, yeast } = recipe;

  if (fermentables.length === 0) {
    return {
      notes: "Add fermentables to define the beer's core identity.",
      matrix: { 
        sweetnessIndex: 0, bitternessIndex: 0, bodyIndex: 0, roastIndex: 0, hopAromaIndex: 0, 
        yeastEsterIndex: 0, yeastPhenolIndex: 0, mashFermentabilityScore: 0,
        fruityScore: 0, floralScore: 0, earthyScore: 0, spicyScore: 0, phenolicScore: 0
      }
    };
  }

  // --- CALCULATIONS ---
  const mashFermentabilityScore = analyzeMash(mashSteps);
  const totalGrainWeight = fermentables.reduce((acc, f) => acc + f.weightKg, 0) || 1;
  
  let crystalPct = 0, roastPct = 0, bodyBuildingPct = 0, bodyThinningPct = 0;
  let maxBaseWeight = 0, dominantBase = "base";

  fermentables.forEach(f => {
    const pct = f.weightKg / totalGrainWeight;
    if (f.category === 'crystal') crystalPct += pct;
    else if (f.category === 'roasted') roastPct += pct;
    
    // Explicit body impact from ingredients
    // Skip hulls (mash aids) which have 0 fermentability
    // Skip if user explicitly ignored the mouthfeel impact
    if (f.fermentability > 0 && !f.ignoreMouthfeel) {
      if (f.category === 'sugar' || (f.category === 'adjunct' && f.proteinLevel === 'low')) {
        bodyThinningPct += pct;
      } else if (f.proteinLevel === 'high') {
        bodyBuildingPct += pct;
      }
    }
    
    if (f.category === 'base' && f.weightKg > maxBaseWeight) {
      maxBaseWeight = f.weightKg;
      dominantBase = cleanMaltName(f.name);
    }
  });

  const apparentAttenuation = stats.og > 1.0 ? (stats.og - stats.fg) / (stats.og - 1) : 0.75;
  const realAttenuation = apparentAttenuation * 0.819;

  // 1. Sweetness & Bitterness
  let sweetnessIndex = Math.min(10, (1 - realAttenuation) * 20 + crystalPct * 25);
  if (water.words?.balance === 'Malty' || water.words?.balance === 'Rich') sweetnessIndex *= 1.1;
  
  const bugu = stats.og > 1.0 ? stats.totalIBU / ((stats.og - 1) * 1000) : 0;
  const rbr = bugu * (1 + (apparentAttenuation - BrewingConstants.BASELINE_AA));
  let bitternessIndex = rbr * 12 * (water.sulfate / (water.chloride || 1) > 2.0 ? 1.15 : 1);
  if (water.words?.balance === 'Bitter' || water.words?.balance === 'Assertive' || water.words?.balance === 'Dry') bitternessIndex *= 1.1;
  bitternessIndex = Math.min(10, bitternessIndex);

  // 2. Body / Mouthfeel Logic (The "Core" of the request)
  // Baseline body from residual extract (FG)
  let bodyIndex = (1 - realAttenuation) * 15; 
  
  // Mash Impact: -1.0 (Full) to +1.0 (Thin) mapping
  // We flip it because analyzeMash returns positive for Beta-dominant (Thin)
  bodyIndex -= (mashFermentabilityScore * 2.0);

  // Ingredient Impact (Weighted by Grain Bill %)
  // These now effectively "cancel" each other out
  bodyIndex += (bodyBuildingPct * 15); // Wheat/Oats increase body
  bodyIndex -= (bodyThinningPct * 10); // Rice/Corn/Sugar decrease body

  // Alcohol Impact: ABV adds perceived weight/mouthfeel up to a point
  bodyIndex += (stats.abv * 0.2);

  // Water Chemistry Impact (Calcium, Chloride vs Sulfate)
  // Calcium contributes to perceived 'hardness' or 'structure'
  if (water.calcium > 80) bodyIndex += 0.3;
  if (water.calcium > 150) bodyIndex += 0.4;

  // High chloride enhances perceived roundness/fullness
  if (water.chloride > 100) bodyIndex += 0.5;
  if (water.chloride > 200) bodyIndex += 0.5;
  const clSo4Ratio = water.chloride / (water.sulfate || 1);
  if (clSo4Ratio > 2) bodyIndex += 0.5; // "Juicy/Soft" water effect
  if (clSo4Ratio < 0.5) bodyIndex -= 0.5; // "Dry/Crisp" water effect

  // Carbonation Impact
  if (stats.co2Volumes > 3.0) bodyIndex -= 0.5; // Highly carbonated feels thinner/sharper
  
  bodyIndex = Math.max(0, Math.min(10, bodyIndex));

  // 3. Aroma Indices
  const fruityScore = Math.min(10, (hops.scores.Fruity * 2) + (yeast.scores?.fruity || 0) * 1.2);
  const floralScore = Math.min(10, (hops.scores.Floral * 2));
  const earthyScore = Math.min(10, (hops.scores.Earthy * 2));
  const spicyScore = Math.min(10, (hops.scores.Spicy * 2) + (yeast.scores?.spicy || 0) * 1.2);
  const phenolicScore = Math.min(10, (yeast.scores?.funky || 0) * 2);

  const hopAromaIndex = Math.min(10, hops.totalOilMl * 1.5 * (hops.activeDryHop && yeast.biotransformation === 'high' ? 1.3 : 1));
  const yeastEsterIndex = Math.min(10, (yeast.profile === 'fruity' ? 7 : 2) * (yeast.fermTempC > 22 ? 1.4 : 1));
  const yeastPhenolIndex = Math.min(10, (yeast.profile === 'phenolic' ? 8 : 0));

  const matrix = {
    sweetnessIndex, bitternessIndex, bodyIndex, 
    roastIndex: Math.min(10, (stats.srm / 30) * 10 + (roastPct * 40)),
    hopAromaIndex, yeastEsterIndex, yeastPhenolIndex, mashFermentabilityScore,
    fruityScore, floralScore, earthyScore, spicyScore, phenolicScore
  };

  // --- STRING BUILDING ---
  const proteinRich = bodyBuildingPct > BrewingConstants.HIGH_PROTEIN_THRESHOLD;
  let haze = (proteinRich && hops.activeDryHop && yeast.biotransformation === 'high') ? "hazy, glowing " : (proteinRich && stats.srm < 10 ? "cloudy " : "");
  
  let appearance = stats.srm < 4 ? "pale straw" : stats.srm < 8 ? "golden hue" : stats.srm < 15 ? "deep amber" : stats.srm < 25 ? "deep mahogany" : "pitch black";
  let head = (bodyBuildingPct > 0.1 || stats.totalIBU > 40) ? ", capped with a dense, rocky head" : "";

  const sensoryDrivers = [
    { label: 'fruity', value: matrix.fruityScore, desc: "vibrant, fruit-forward notes" },
    { label: 'floral', value: matrix.floralScore, desc: "bright floral aromatics" },
    { label: 'earthy', value: matrix.earthyScore, desc: "subtle earthy and woody undertones" },
    { label: 'spicy', value: matrix.spicyScore, desc: "complex, spicy yeast and hop notes" },
    { label: 'phenolic', value: matrix.phenolicScore, desc: "bold, phenolic spice" },
    { label: 'roasty', value: matrix.roastIndex, desc: "robust roasted malt aromas" }
  ].sort((a, b) => b.value - a.value);

  const primaryDriver = sensoryDrivers[0];
  const allTags = Array.from(new Set(hops.dominantTags));
  const dominantTags = formatList(allTags.slice(0, 3));
  
  let aroma = "";
  if (matrix.hopAromaIndex > 7 && dominantTags) {
    aroma = `a saturated wave of ${dominantTags}`;
  } else if (primaryDriver.value > 4) {
    aroma = primaryDriver.desc;
    if (dominantTags && primaryDriver.label !== 'roasty') aroma += ` featuring ${dominantTags}`;
  } else if (matrix.yeastEsterIndex < 3 && yeast.isLager) {
    aroma = "a crisp, clean profile";
  } else {
    aroma = `subtle ${dominantBase} malt aromas`;
  }

  let maltParts = [`a ${dominantBase} foundation`];
  if (matrix.roastIndex > 7) maltParts = ["a robust, espresso-like roasted backbone"];
  else if (matrix.roastIndex > 3) maltParts.push("a chocolatey roasted edge");
  
  if (crystalPct > 0.05 && matrix.sweetnessIndex > 5) maltParts.push("caramel sweetness");
  if (bodyBuildingPct > 0.1) maltParts.push("a soft, velvety texture");
  if (bodyThinningPct > 0.1 && matrix.bodyIndex < 4) {
    const adjunctName = fermentables.find(f => f.category === 'adjunct' && f.proteinLevel === 'low')?.name.toLowerCase().includes('rice') ? 'rice' : 'corn';
    maltParts.push(`a lean, crisp structure from ${adjunctName} additions`);
  }
  
  let abvDesc = `${stats.abv.toFixed(1)}% ABV`;
  if (stats.abv > 8) {
    abvDesc = matrix.bodyIndex < 4 ? `solvent, warming ${stats.abv.toFixed(1)}% ABV` : `rich, dangerously smooth ${stats.abv.toFixed(1)}% ABV`;
  } else if (stats.abv < 4.5) {
    abvDesc = `sessionable ${stats.abv.toFixed(1)}% ABV`;
  }

  let finish = "a balanced finish";
  if (matrix.sweetnessIndex > 7 && matrix.bitternessIndex > 7) finish = "a bold, bittersweet finish";
  else if (matrix.bitternessIndex > 7) finish = `a sharp, ${matrix.bitternessIndex > 8 ? 'aggressive' : 'firm'} bitterness`;
  else if (matrix.sweetnessIndex > 7) finish = "a lush, lingering sweetness";
  else if (matrix.bodyIndex < 3) finish = "a bone-dry, crisp finish";

  const waterImpact = water.words ? `, rounded by its ${water.words.balance.toLowerCase()} and ${water.words.body.toLowerCase()} water profile` : "";

  const s1 = `Pouring a ${haze}${appearance}${head}, this ${abvDesc} beer ${getRandom(Synonyms.entry)} ${matrix.hopAromaIndex > 6 ? 'pronounced' : 'subtle'} ${aroma}.`;
  
  let mouthfeelDesc = "medium-bodied";
  if (matrix.bodyIndex > 8) mouthfeelDesc = "heavy and chewy";
  else if (matrix.bodyIndex > 7) mouthfeelDesc = "thick and coating";
  else if (matrix.bodyIndex > 6) mouthfeelDesc = "full-bodied and smooth";
  else if (matrix.bodyIndex < 2) mouthfeelDesc = "very thin and watery";
  else if (matrix.bodyIndex < 3) mouthfeelDesc = "light and crisp";
  else if (matrix.bodyIndex < 4) mouthfeelDesc = "lean and refreshing";

  const s2 = `The palate is ${mouthfeelDesc}, anchored by ${maltParts.join(', ')}.`;
  const s3 = `It ${getRandom(Synonyms.finish)} ${finish}${waterImpact}.`;

  return { notes: `${s1} ${s2} ${s3}`, matrix };
}

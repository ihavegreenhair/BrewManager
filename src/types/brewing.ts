// Global Settings
export type MeasurementSystem = 'metric' | 'imperial';

// Core Units
export type UnitVolume = 'gal' | 'l' | 'ml';
export type UnitWeightMass = 'lb' | 'oz' | 'kg' | 'g';
export type UnitTemp = 'F' | 'C';
export type UnitColor = 'SRM' | 'EBC' | 'Lovibond';

// ---------------------------------------------------------
// Water Volumes & Calculations
// ---------------------------------------------------------
export interface WaterVolumes {
  mashWater: number;   // Strike water volume
  spargeWater: number; // Sparge water volume
  boilVolume: number;   // Total pre-boil volume
  batchVolume: number;  // Final volume into fermenter
  boilOffLoss: number;  // Volume lost to boil-off
  trubLoss: number;     // Volume lost in kettle
  grainAbsorption: number; // Volume absorbed by grain
  mashTunDeadspace: number; // Volume unrecoverable from mash tun
}

// ---------------------------------------------------------
// Equipment Profile
// ---------------------------------------------------------
export interface Equipment {
  id: string;
  name: string;
  efficiency: number; // Mash efficiency percentage
  batchVolume: number; // Target volume into fermenter
  boilVolume: number; // Pre-boil volume
  boilTime: number; // Default boil time in minutes
  boilOffRate: number; // Volume lost per hour (L/hr)
  trubLoss: number; // Volume lost in kettle/chiller
  mashTunDeadspace: number; // Volume unrecoverable from mash tun
  grainAbsorptionRate: number; // L/kg (default ~1.0)
}

// ---------------------------------------------------------
// Ingredients
// ---------------------------------------------------------
export interface Fermentable {
  id: string;
  name: string;
  weight: number; 
  percentage?: number; // Target percentage of total grain bill
  locked?: boolean;    // Whether the percentage is locked during auto-scaling
  yield: number; // Potential extract (e.g., 36 for 1.036 or ~78%)
  color: number; 
  moisture?: number;
  isExtract?: boolean;
  ignoreMouthfeel?: boolean;
}

export type HopUse = 'boil' | 'whirlpool' | 'dry_hop' | 'mash' | 'first_wort' | 'aroma' | 'hopstand';

export interface Hop {
  id: string;
  name: string;
  weight: number;
  alphaAcid: number;
  use: HopUse;
  time: number; // Minutes for boil, days for dry hop, etc.
  temp?: number; // Temperature for whirlpool/aroma additions (Celsius)
  customVariety?: HopVariety;
}

export interface HopCharacteristic {
  range: [number, number];
  avg: number;
}

export interface HopVariety {
  name: string;
  purpose: string;
  country: string;
  internationalCode?: string;
  cultivarId?: string;
  ownership?: string;
  alphaAcid: HopCharacteristic;
  betaAcid: HopCharacteristic;
  coHumulone: HopCharacteristic;
  totalOils: HopCharacteristic;
  totalOil?: [number, number];
  beta?: [number, number];
  alpha?: [number, number];
  oilBreakdown: {
    myrcene?: HopCharacteristic;
    humulene?: HopCharacteristic;
    caryophyllene?: HopCharacteristic;
    farnesene?: HopCharacteristic;
    bPinene?: HopCharacteristic;
    linalool?: HopCharacteristic;
    geraniol?: HopCharacteristic;
    selinene?: HopCharacteristic;
    other?: number; // Calculated as 100 - sum(others)
  };
  flavorProfile: string;
  tags: string[];
  substitutes: string[];
  aromaScores?: {
    fruity: number;
    floral: number;
    herbaceous: number;
    spicy: number;
    earthy: number;
  };
}

export interface Yeast {
  id: string;
  name: string;
  attenuation: number; // Percentage
  type: 'ale' | 'lager' | 'wine' | 'champagne' | 'kweik' | 'other';
  form: 'liquid' | 'dry';
  cellsPerPack?: number; // In billions
  customVariety?: YeastVariety;
}

export interface YeastVariety {
  name: string;
  brand: string;
  type: string;
  form: 'Liquid' | 'Dry';
  species: string;
  attenuation: {
    range: [(number | null), (number | null)];
    avg: number | null;
  };
  flocculation: string;
  alcoholTolerance: number;
  tempRange: {
    f: [number, number];
    c: [number, number];
  };
  description: string;
  styles: string[];
  flavorProfile?: string;
  tags?: string[];
  characteristicScores?: {
    fruity: number;
    spicy: number;
    maltiness: number;
    clean: number;
    funky: number;
  };
}

export interface WaterProfile {
  id: string;
  name: string;
  description?: string;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
  ph?: number;
}

// ---------------------------------------------------------
// Process Steps
// ---------------------------------------------------------
export interface MashStep {
  id: string;
  name: string;
  type: 'infusion' | 'temperature' | 'decoction';
  stepTemp: number;
  stepTime: number; // Minutes
  rampTime?: number; // Minutes to reach this temp
  infusionVolume?: number; // Optional: Volume of water to add
}

export interface FermentationStep {
  id: string;
  name: string;
  stepTemp: number;
  stepTime: number; // Days
  pressure?: number; // PSI
}

// ---------------------------------------------------------
// Recipe Data Model (Relational / Split-Batch Ready)
// ---------------------------------------------------------

// Child Entity (The Fermenter)
export interface FermenterEntity {
  id: string;
  name: string;
  volume: number; // Volume in this specific fermenter
  yeast: Yeast[]; // Yeasts pitched into this specific vessel
  dryHops: Hop[]; // Hops added to this specific vessel
  fermentationSteps: FermentationStep[];
  
  // Specific results
  targetFG: number;
  targetABV: number;
}

export type BrewMethod = 'All Grain' | 'Extract' | 'Partial Mash' | 'BIAB';

// Parent Entity (The Boil/Mash)
export interface Recipe {
  id: string;
  name: string;
  author: string;
  version: string;
  type: BrewMethod;
  styleId?: string; // Reference to BJCP style
  equipment: Equipment; // The original hardware profile
  
  // Recipe-level overrides (The actual constraints for THIS brew)
  batchVolume: number; 
  boilVolume: number;
  boilTime: number;
  efficiency: number;
  grainAbsorptionRate?: number;
  boilOffRate?: number;
  mashTunDeadspace?: number;
  trubLoss?: number;

  waterProfile?: WaterProfile;
  targetWaterProfile?: WaterProfile;
  waterSettings?: {
    manualStrikeVolume?: number;
    manualSpargeVolume?: number;
    saltAdditionPosition: 'split' | 'mash_only' | 'kettle_only'; // Where to add salts
  };
  acidAddition?: {
    type: 'lactic' | 'phosphoric';
    concentration: number; // percentage
    volumeMl: number;
  };
  
  grainBillMode?: 'weight' | 'percentage';
  targetABV?: number;

  // Base Ingredients (Shared across all split batches)
  fermentables: Fermentable[];
  kettleHops: Hop[]; // Hops used during mash/boil/whirlpool
  mashSteps: MashStep[];
  
  // The Split Batches
  fermenters: FermenterEntity[];
  
  // Shared Calculated targets (Post-boil metrics)
  targetOG: number;
  targetIBU: number;
  targetSRM: number;
}

export interface BeerStyle {
  id: string;
  name: string;
  category: string;
  description?: string;
  aroma?: string;
  appearance?: string;
  flavor?: string;
  mouthfeel?: string;
  stats: {
    og: { min: number; max: number };
    fg: { min: number; max: number };
    ibu: { min: number; max: number };
    srm: { min: number; max: number };
    abv: { min: number; max: number };
  };
}

// ---------------------------------------------------------
// Active Brew Session
// ---------------------------------------------------------
export interface BrewEvent {
  id: string;
  type: 'water' | 'mash' | 'boil' | 'hop' | 'cooling' | 'yeast' | 'checkpoint';
  label: string;
  subLabel?: string;
  targetValue?: number;
  unit?: string;
  duration?: number; // Minutes
  completed: boolean;
  timestamp?: string;
}

export interface Session {
  id: string;
  recipeId: string;
  recipeSnapshot: Recipe;
  name: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  
  // Phase tracking
  currentEventIndex: number;
  
  // High-fidelity actuals
  actuals: {
    strikeVolume?: number;
    strikeTemp?: number;
    mashPh?: number;
    preBoilVolume?: number;
    preBoilGravity?: number;
    postBoilVolume?: number;
    og?: number;
    fg?: number;
    pitchTemp?: number;
  };
  
  events: BrewEvent[];
}

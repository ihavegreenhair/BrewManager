import type { MashStep, FermentationStep } from '../types/brewing';

export interface MashProfile {
  id: string;
  name: string;
  description: string;
  steps: Omit<MashStep, 'id'>[];
}

export interface FermentationProfile {
  id: string;
  name: string;
  description: string;
  steps: Omit<FermentationStep, 'id'>[];
}

export const mashProfiles: MashProfile[] = [
  {
    id: 'single-infusion-light',
    name: 'Single Infusion, Light Body',
    description: 'Low mash temperature for higher fermentability and a drier finish.',
    steps: [
      { name: 'Saccharification', type: 'temperature', stepTemp: 64, stepTime: 60 }
    ]
  },
  {
    id: 'single-infusion-medium',
    name: 'Single Infusion, Medium Body',
    description: 'Standard mash temperature for a balanced malt profile.',
    steps: [
      { name: 'Saccharification', type: 'temperature', stepTemp: 67, stepTime: 60 }
    ]
  },
  {
    id: 'single-infusion-full',
    name: 'Single Infusion, Full Body',
    description: 'Higher mash temperature for more unfermentable sugars and a fuller mouthfeel.',
    steps: [
      { name: 'Saccharification', type: 'temperature', stepTemp: 69, stepTime: 60 }
    ]
  },
  {
    id: 'hochkurz-short',
    name: 'Hochkurz (Short)',
    description: 'Traditional German two-step mash for efficiency and fermentability.',
    steps: [
      { name: 'Maltose Rest', type: 'temperature', stepTemp: 62, stepTime: 30 },
      { name: 'Dextrinization Rest', type: 'temperature', stepTemp: 72, stepTime: 30 },
      { name: 'Mash Out', type: 'temperature', stepTemp: 78, stepTime: 10 }
    ]
  },
  {
    id: 'hochkurz-full',
    name: 'Hochkurz (Full)',
    description: 'Full German step mash including protein rest.',
    steps: [
      { name: 'Protein Rest', type: 'temperature', stepTemp: 52, stepTime: 20 },
      { name: 'Maltose Rest', type: 'temperature', stepTemp: 62, stepTime: 30 },
      { name: 'Dextrinization Rest', type: 'temperature', stepTemp: 72, stepTime: 30 },
      { name: 'Mash Out', type: 'temperature', stepTemp: 78, stepTime: 10 }
    ]
  },
  {
    id: 'decoction-single',
    name: 'Single Decoction',
    description: 'Traditional method for enhancing malt character and depth.',
    steps: [
      { name: 'Protein Rest', type: 'temperature', stepTemp: 50, stepTime: 20 },
      { name: 'Saccharification', type: 'temperature', stepTemp: 66, stepTime: 45 },
      { name: 'Decoction Boil', type: 'decoction', stepTemp: 100, stepTime: 15 },
      { name: 'Mash Out', type: 'temperature', stepTemp: 76, stepTime: 10 }
    ]
  },
  {
    id: 'turbid-mash',
    name: 'Turbid Mash (Lambic)',
    description: 'Specialized mash for Lambic production, leaving complex starches for wild yeast.',
    steps: [
      { name: 'Gelatinization', type: 'temperature', stepTemp: 45, stepTime: 15 },
      { name: 'Saccharification 1', type: 'temperature', stepTemp: 58, stepTime: 20 },
      { name: 'Saccharification 2', type: 'temperature', stepTemp: 65, stepTime: 30 },
      { name: 'Saccharification 3', type: 'temperature', stepTemp: 72, stepTime: 20 },
      { name: 'Mash Out', type: 'temperature', stepTemp: 85, stepTime: 15 }
    ]
  }
];

export const fermentationProfiles: FermentationProfile[] = [
  {
    id: 'ale-standard',
    name: 'Ale (Standard)',
    description: 'Standard ale fermentation at room temperature.',
    steps: [
      { name: 'Primary', stepTemp: 19, stepTime: 14, pressure: 0 }
    ]
  },
  {
    id: 'lager-quick',
    name: 'Lager (Quick)',
    description: 'Accelerated lager fermentation with a diacetyl rest.',
    steps: [
      { name: 'Primary', stepTemp: 10, stepTime: 7, pressure: 0 },
      { name: 'Diacetyl Rest', stepTemp: 18, stepTime: 3, pressure: 0 },
      { name: 'Cold Crash / Lagering', stepTemp: 2, stepTime: 7, pressure: 0 }
    ]
  },
  {
    id: 'lager-traditional',
    name: 'Lager (Traditional)',
    description: 'Traditional long lager fermentation and cold storage.',
    steps: [
      { name: 'Primary', stepTemp: 10, stepTime: 14, pressure: 0 },
      { name: 'Diacetyl Rest', stepTemp: 18, stepTime: 2, pressure: 0 },
      { name: 'Lagering', stepTemp: 2, stepTime: 30, pressure: 0 }
    ]
  },
  {
    id: 'kveik-hot',
    name: 'Kveik (Hot)',
    description: 'Fast, high-temperature fermentation typical for Kveik strains.',
    steps: [
      { name: 'Fermentation', stepTemp: 35, stepTime: 3, pressure: 0 }
    ]
  },
  {
    id: 'belgian-ramp',
    name: 'Belgian Ale (Ramp)',
    description: 'Ramping temperature to encourage ester production in Belgian styles.',
    steps: [
      { name: 'Primary Low', stepTemp: 18, stepTime: 2, pressure: 0 },
      { name: 'Primary Mid', stepTemp: 20, stepTime: 2, pressure: 0 },
      { name: 'Primary High', stepTemp: 22, stepTime: 2, pressure: 0 },
      { name: 'Conditioning', stepTemp: 24, stepTime: 7, pressure: 0 }
    ]
  },
  {
    id: 'pressure-ferment',
    name: 'Pressure Fermentation (Lager/Ale)',
    description: 'Fermenting under pressure to reduce esters and fusels at higher temperatures.',
    steps: [
      { name: 'Active Fermentation', stepTemp: 18, stepTime: 5, pressure: 12 },
      { name: 'Cleanup / Carb', stepTemp: 20, stepTime: 3, pressure: 15 },
      { name: 'Cold Crash', stepTemp: 2, stepTime: 3, pressure: 15 }
    ]
  },
  {
    id: 'mixed-culture',
    name: 'Mixed Culture / Sour',
    description: 'Extended fermentation with Brettanomyces and bacteria.',
    steps: [
      { name: 'Primary', stepTemp: 20, stepTime: 14, pressure: 0 },
      { name: 'Secondary Aging', stepTemp: 22, stepTime: 180, pressure: 0 },
      { name: 'Conditioning', stepTemp: 15, stepTime: 30, pressure: 0 }
    ]
  },
  {
    id: 'fruit-addition',
    name: 'Fruit Addition Phase',
    description: 'Primary fermentation followed by fruit addition and refermentation.',
    steps: [
      { name: 'Primary', stepTemp: 19, stepTime: 7, pressure: 0 },
      { name: 'Fruit Maceration', stepTemp: 21, stepTime: 14, pressure: 0 },
      { name: 'Conditioning', stepTemp: 18, stepTime: 7, pressure: 0 }
    ]
  }
];

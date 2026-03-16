import type { Fermentable } from '../types/brewing';
import fermentablesJson from './fermentables.json';

export interface FermentableTemplate extends Omit<Fermentable, 'id' | 'weight'> {
  id: string;
  description?: string;
  category: 'Grain' | 'Sugar' | 'Extract' | 'Adjunct' | 'Fruit' | 'Misc';
}

export const fermentables: FermentableTemplate[] = fermentablesJson as unknown as FermentableTemplate[];

import type { YeastVariety } from '../types/brewing';
import yeastsJson from './yeasts.json';

export const yeasts: YeastVariety[] = yeastsJson as unknown as YeastVariety[];

import type { HopVariety } from '../types/brewing';
import hopsJson from './hops.json';

export const hops: HopVariety[] = hopsJson as unknown as HopVariety[];

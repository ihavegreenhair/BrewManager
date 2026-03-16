import type { Equipment } from '../types/brewing';

export const predefinedEquipment: Equipment[] = [
  {
    id: 'eq-standard-20l',
    name: 'Standard 20L (5 Gal) System',
    efficiency: 70,
    batchVolume: 20, // L
    boilVolume: 26,  // L
    boilTime: 60,
    boilOffRate: 4,  // L/hr
    trubLoss: 0,     // L
    mashTunDeadspace: 0, // L
    grainAbsorptionRate: 0.8 // L/kg
  },
  {
    id: 'eq-grainfather-g30',
    name: 'Grainfather G30',
    efficiency: 75,
    batchVolume: 23,
    boilVolume: 28,
    boilTime: 60,
    boilOffRate: 2.5,
    trubLoss: 0,
    mashTunDeadspace: 0,
    grainAbsorptionRate: 0.8
  },
  {
    id: 'eq-speidel-20l',
    name: 'Speidel Braumeister 20L',
    efficiency: 72,
    batchVolume: 20,
    boilVolume: 25,
    boilTime: 60,
    boilOffRate: 2.5,
    trubLoss: 0,
    mashTunDeadspace: 0,
    grainAbsorptionRate: 0.8
  },
  {
    id: 'eq-pilot-1bbl',
    name: '1 BBL Pilot System',
    efficiency: 80,
    batchVolume: 117, // ~31 gal
    boilVolume: 140,
    boilTime: 60,
    boilOffRate: 15,
    trubLoss: 0,
    mashTunDeadspace: 0,
    grainAbsorptionRate: 0.8
  }
];

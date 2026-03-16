/**
 * Unit Conversion Utilities
 * Handles translation between Metric and Imperial values for the UI.
 * 
 * NOTE: It is best practice to store internal state in ONE unit system 
 * (e.g., Metric) and only convert at the UI layer. 
 */

export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;

export const gramsToOz = (g: number): number => g * 0.035274;
export const ozToGrams = (oz: number): number => oz / 0.035274;

export const litersToGal = (l: number): number => l * 0.264172;
export const galToLiters = (gal: number): number => gal / 0.264172;

export const celsiusToFahrenheit = (c: number): number => (c * 9/5) + 32;
export const fahrenheitToCelsius = (f: number): number => (f - 32) * 5/9;

export const ebcToSrm = (ebc: number): number => ebc * 0.508;
export const srmToEbc = (srm: number): number => srm * 1.97;

/**
 * Utility to format weight based on the selected system.
 * Internal math will use kg for fermentables, grams for hops.
 */
export const formatWeight = (
  value: number, 
  system: 'metric' | 'imperial', 
  type: 'fermentable' | 'hop'
): string => {
  if (system === 'metric') {
    return type === 'fermentable' 
      ? `${value.toFixed(2)} kg` 
      : `${value.toFixed(1)} g`;
  } else {
    return type === 'fermentable' 
      ? `${kgToLbs(value).toFixed(2)} lbs` 
      : `${gramsToOz(value).toFixed(2)} oz`;
  }
};

/**
 * Utility to format volume based on the selected system.
 * Internal math will use Liters.
 */
export const formatVolume = (
  liters: number, 
  system: 'metric' | 'imperial'
): string => {
  if (system === 'metric') {
    return `${liters.toFixed(1)} L`;
  } else {
    return `${litersToGal(liters).toFixed(2)} gal`;
  }
};

/**
 * Utility to format temperature based on the selected system.
 * Internal math will use Celsius.
 */
export const formatTemp = (
  celsius: number, 
  system: 'metric' | 'imperial'
): string => {
  if (system === 'metric') {
    return `${celsius.toFixed(1)}°C`;
  } else {
    return `${celsiusToFahrenheit(celsius).toFixed(1)}°F`;
  }
};

import type { Recipe, Fermentable, Hop, FermenterEntity, MashStep, Yeast } from '../types/brewing';

/**
 * Enhanced BeerJSON v1 Export Utility.
 * Maps our internal data structure to the official BeerJSON schema,
 * while preserving full internal state in an extension block.
 */
export const exportRecipeToBeerJSON = (recipe: Recipe): string => {
  const primaryFermenter = recipe.fermenters[0];
  const yeasts = primaryFermenter?.yeast || [];

  const beerjson = {
    beerjson: {
      version: 1.0,
      recipes: [
        {
          name: recipe.name,
          type: recipe.type.toLowerCase(),
          author: recipe.author || "BrewManager User",
          batch_size: {
            value: recipe.batchVolume,
            unit: "l"
          },
          boil_size: {
            value: recipe.boilVolume,
            unit: "l"
          },
          boil_time: {
            value: recipe.boilTime,
            unit: "min"
          },
          efficiency: {
            value: recipe.efficiency,
            unit: "%"
          },
          style: {
            name: recipe.styleId || "Unknown",
            category: "BJCP",
            style_guide: "BJCP 2021"
          },
          ingredients: {
            fermentable_additions: recipe.fermentables.map(f => ({
              name: f.name,
              type: f.isExtract ? "extract" : "grain",
              amount: {
                value: f.weight,
                unit: "kg"
              },
              yield: {
                value: f.yield,
                unit: "ppg"
              },
              color: {
                value: f.color,
                unit: "SRM"
              }
            })),
            hop_additions: recipe.kettleHops.map(h => ({
              name: h.name,
              alpha_acid: {
                value: h.alphaAcid,
                unit: "%"
              },
              amount: {
                value: h.weight,
                unit: "g"
              },
              timing: {
                time: {
                  value: h.time,
                  unit: "min"
                },
                use: h.use
              }
            })),
            culture_additions: yeasts.map(y => ({
              name: y.name,
              type: y.type,
              form: y.form,
              attenuation: {
                value: y.attenuation,
                unit: "%"
              }
            }))
          },
          mash: {
            name: "Mash Schedule",
            mash_steps: recipe.mashSteps.map(s => ({
              name: s.name,
              type: s.type,
              step_temperature: {
                value: s.stepTemp,
                unit: "C"
              },
              step_time: {
                value: s.stepTime,
                unit: "min"
              }
            }))
          },
          // PRESERVE FULL INTERNAL STATE IN EXTENSION
          extensions: [
            {
              name: "brewmanager-metadata",
              description: "Internal BrewManager State",
              data: {
                ...recipe
              }
            }
          ]
        }
      ]
    }
  };

  return JSON.stringify(beerjson, null, 2);
};

/**
 * Enhanced BeerJSON Importer
 * Prioritizes our native extension data to restore 100% of the UI state,
 * but falls back to standard BeerJSON fields for external files.
 */
export const importRecipeFromBeerJSON = (jsonString: string): Recipe | null => {
  try {
    const data = JSON.parse(jsonString);
    const recipeData = data?.beerjson?.recipes?.[0];
    
    if (!recipeData) throw new Error("Invalid BeerJSON format");

    // 1. Check for our native extension first
    const nativeExtension = recipeData.extensions?.find((e: any) => e.name === "brewmanager-metadata");
    if (nativeExtension?.data) {
      return nativeExtension.data as Recipe;
    }

    // 2. Otherwise, perform standard mapping (Importing from external apps)
    const mappedFermentables: Fermentable[] = (recipeData.ingredients?.fermentable_additions || []).map((f: any) => ({
      id: crypto.randomUUID(),
      name: f.name || 'Unknown Grain',
      weight: f.amount?.value || 0,
      yield: f.yield?.value || 36,
      color: f.color?.value || 2,
      isExtract: f.type === 'extract'
    }));

    const mappedHops: Hop[] = (recipeData.ingredients?.hop_additions || []).map((h: any) => ({
      id: crypto.randomUUID(),
      name: h.name || 'Unknown Hop',
      weight: h.amount?.value || 0,
      alphaAcid: h.alpha_acid?.value || 5.0,
      time: h.timing?.time?.value || 60,
      use: h.timing?.use || 'boil',
      temp: h.timing?.temp?.value
    }));

    const mappedMash: MashStep[] = (recipeData.mash?.mash_steps || []).map((s: any) => ({
      id: crypto.randomUUID(),
      name: s.name || 'Mash Step',
      type: s.type || 'temperature',
      stepTemp: s.step_temperature?.value || 65,
      stepTime: s.step_time?.value || 60
    }));

    const mappedYeast: Yeast[] = (recipeData.ingredients?.culture_additions || []).map((y: any) => ({
      id: crypto.randomUUID(),
      name: y.name || 'Unknown Yeast',
      type: y.type || 'ale',
      form: y.form || 'dry',
      attenuation: y.attenuation?.value || 75
    }));

    const fermenter: FermenterEntity = {
      id: crypto.randomUUID(),
      name: 'Primary',
      volume: recipeData.batch_size?.value || 20,
      yeast: mappedYeast,
      dryHops: [],
      fermentationSteps: [],
      targetFG: 1.010,
      targetABV: 5.0
    };

    // Construct a valid Recipe object from standard BeerJSON
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name: recipeData.name || 'Imported Recipe',
      author: recipeData.author || '',
      version: '1.0',
      type: (recipeData.type === 'extract' ? 'Extract' : 'All Grain'),
      batchVolume: recipeData.batch_size?.value || 20,
      boilVolume: recipeData.boil_size?.value || 25,
      boilTime: recipeData.boil_time?.value || 60,
      efficiency: recipeData.efficiency?.value || 75,
      fermentables: mappedFermentables,
      kettleHops: mappedHops,
      mashSteps: mappedMash,
      fermenters: [fermenter],
      targetOG: 1.050,
      targetIBU: 30,
      targetSRM: 5,
      equipment: {
        id: 'imported',
        name: 'Imported Equipment',
        efficiency: recipeData.efficiency?.value || 75,
        batchVolume: recipeData.batch_size?.value || 20,
        boilVolume: recipeData.boil_size?.value || 25,
        boilTime: recipeData.boil_time?.value || 60,
        boilOffRate: 3.0,
        trubLoss: 0,
        mashTunDeadspace: 0,
        grainAbsorptionRate: 0.8
      }
    };

    return recipe;
  } catch (error) {
    console.error("Failed to parse BeerJSON:", error);
    return null;
  }
};

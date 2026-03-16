import type { Fermentable } from '../types/brewing';

export interface FermentableTemplate extends Omit<Fermentable, 'id' | 'weight'> {
  id: string;
  description?: string;
  category: 'Grain' | 'Sugar' | 'Extract' | 'Adjunct' | 'Fruit' | 'Misc';
}

/**
 * Fermentables Library
 * Data sourced from Brewer's Friend (Top 100+ most popular/standard).
 */
export const fermentables: FermentableTemplate[] = [
  {
    "id": "f-2-row-pale-malt",
    "name": "2-Row Pale Malt",
    "yield": 37,
    "color": 2.5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-6-row-pale-malt",
    "name": "6-Row Pale Malt",
    "yield": 35,
    "color": 2,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-abbey-malt",
    "name": "Abbey Malt",
    "yield": 33,
    "color": 17,
    "category": "Grain"
  },
  {
    "id": "f-acidulated-malt",
    "name": "Acidulated Malt",
    "yield": 27,
    "color": 3,
    "category": "Grain"
  },
  {
    "id": "f-agave-nectar",
    "name": "Agave Nectar",
    "yield": 35,
    "color": 2,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-ale-malt",
    "name": "Ale Malt",
    "yield": 37,
    "color": 3,
    "category": "Grain"
  },
  {
    "id": "f-amber",
    "name": "Amber",
    "yield": 32,
    "color": 27,
    "category": "Grain"
  },
  {
    "id": "f-amber-malt",
    "name": "Amber Malt",
    "yield": 32,
    "color": 26,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-american-ale-malt",
    "name": "American Ale Malt",
    "yield": 37.3,
    "color": 3,
    "category": "Grain"
  },
  {
    "id": "f-apple-juice",
    "name": "Apple juice",
    "yield": 5.8,
    "color": 1,
    "category": "Misc"
  },
  {
    "id": "f-aromatic",
    "name": "Aromatic",
    "yield": 33,
    "color": 38,
    "category": "Grain"
  },
  {
    "id": "f-aromatic-malt",
    "name": "Aromatic Malt",
    "yield": 35,
    "color": 20,
    "category": "Grain"
  },
  {
    "id": "f-ashburne-mild",
    "name": "Ashburne Mild",
    "yield": 36,
    "color": 5,
    "category": "Grain"
  },
  {
    "id": "f-aurora-malt",
    "name": "Aurora Malt",
    "yield": 37.2,
    "color": 29,
    "category": "Grain"
  },
  {
    "id": "f-belgian-candi-sugar-60",
    "name": "Belgian Candi Sugar - Amber/Brown (60L)",
    "yield": 38,
    "color": 60,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-belgian-candi-sugar-0",
    "name": "Belgian Candi Sugar - Clear/Blond (0L)",
    "yield": 38,
    "color": 0,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-belgian-candi-sugar-275",
    "name": "Belgian Candi Sugar - Dark (275L)",
    "yield": 38,
    "color": 275,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-belgian-candi-syrup-d90",
    "name": "Belgian Candi Syrup - D-90",
    "yield": 32,
    "color": 90,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-biscuit",
    "name": "Biscuit",
    "yield": 35,
    "color": 23,
    "category": "Grain"
  },
  {
    "id": "f-biscuit-malt",
    "name": "Biscuit Malt",
    "yield": 35,
    "color": 30,
    "category": "Grain"
  },
  {
    "id": "f-black-patent-malt",
    "name": "Black (Patent) Malt",
    "yield": 27,
    "color": 450,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-black-barley",
    "name": "Black Barley",
    "yield": 27,
    "color": 530,
    "category": "Grain"
  },
  {
    "id": "f-black-malt",
    "name": "Black Malt",
    "yield": 28,
    "color": 500,
    "category": "Grain"
  },
  {
    "id": "f-black-patent",
    "name": "Black Patent",
    "yield": 27,
    "color": 525,
    "category": "Grain"
  },
  {
    "id": "f-blackprinz",
    "name": "Blackprinz",
    "yield": 36,
    "color": 500,
    "category": "Grain"
  },
  {
    "id": "f-bohemian-pilsner",
    "name": "Bohemian Pilsner",
    "yield": 38,
    "color": 2,
    "category": "Grain"
  },
  {
    "id": "f-brewers-crystals",
    "name": "Brewers Crystals",
    "yield": 44,
    "color": 2,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-brown",
    "name": "Brown",
    "yield": 32,
    "color": 65,
    "category": "Grain"
  },
  {
    "id": "f-brown-malt",
    "name": "Brown Malt",
    "yield": 34,
    "color": 90,
    "category": "Grain"
  },
  {
    "id": "f-brown-rice-syrup",
    "name": "Brown Rice Syrup - Gluten Free",
    "yield": 44,
    "color": 2,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-brown-sugar",
    "name": "Brown Sugar",
    "yield": 45,
    "color": 15,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-buckwheat-malt",
    "name": "Buckwheat Malt - Gluten Free",
    "yield": 25,
    "color": 2,
    "category": "Grain"
  },
  {
    "id": "f-cane-sugar",
    "name": "Cane Sugar",
    "yield": 46,
    "color": 0,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-cara-20l",
    "name": "Cara 20L",
    "yield": 34,
    "color": 22,
    "category": "Grain"
  },
  {
    "id": "f-cara-45l",
    "name": "Cara 45L",
    "yield": 34,
    "color": 42,
    "category": "Grain"
  },
  {
    "id": "f-cara-malt",
    "name": "Cara Malt",
    "yield": 35,
    "color": 18,
    "category": "Grain"
  },
  {
    "id": "f-cara-pale",
    "name": "Cara Pale",
    "yield": 35,
    "color": 4,
    "category": "Grain"
  },
  {
    "id": "f-cara-ruby",
    "name": "Cara Ruby",
    "yield": 33,
    "color": 19.5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-caraamber",
    "name": "CaraAmber",
    "yield": 34,
    "color": 23,
    "category": "Grain"
  },
  {
    "id": "f-caraaroma",
    "name": "CaraAroma",
    "yield": 34,
    "color": 130,
    "category": "Grain"
  },
  {
    "id": "f-carabohemian",
    "name": "CaraBohemian",
    "yield": 33,
    "color": 75,
    "category": "Grain"
  },
  {
    "id": "f-carabrown",
    "name": "CaraBrown",
    "yield": 34,
    "color": 55,
    "category": "Grain"
  },
  {
    "id": "f-caracrystal-wheat",
    "name": "CaraCrystal Wheat Malt",
    "yield": 34,
    "color": 55,
    "category": "Grain"
  },
  {
    "id": "f-carafa-i",
    "name": "Carafa I",
    "yield": 32,
    "color": 340,
    "category": "Grain"
  },
  {
    "id": "f-carafa-ii",
    "name": "Carafa II",
    "yield": 32,
    "color": 425,
    "category": "Grain"
  },
  {
    "id": "f-carafa-iii",
    "name": "Carafa III",
    "yield": 32,
    "color": 535,
    "category": "Grain"
  },
  {
    "id": "f-carafoam",
    "name": "CaraFoam",
    "yield": 37,
    "color": 2,
    "category": "Grain"
  },
  {
    "id": "f-carahell",
    "name": "CaraHell",
    "yield": 34,
    "color": 11,
    "category": "Grain"
  },
  {
    "id": "f-crystal-10l",
    "name": "Caramel / Crystal 10L",
    "yield": 35,
    "color": 10,
    "category": "Grain"
  },
  {
    "id": "f-crystal-120l",
    "name": "Caramel / Crystal 120L",
    "yield": 33,
    "color": 120,
    "category": "Grain"
  },
  {
    "id": "f-crystal-150l",
    "name": "Caramel / Crystal 150L",
    "yield": 33,
    "color": 150,
    "category": "Grain"
  },
  {
    "id": "f-crystal-15l",
    "name": "Caramel / Crystal 15L",
    "yield": 35,
    "color": 15,
    "category": "Grain"
  },
  {
    "id": "f-crystal-20l",
    "name": "Caramel / Crystal 20L",
    "yield": 35,
    "color": 20,
    "category": "Grain"
  },
  {
    "id": "f-crystal-30l",
    "name": "Caramel / Crystal 30L",
    "yield": 34,
    "color": 30,
    "category": "Grain"
  },
  {
    "id": "f-crystal-40l",
    "name": "Caramel / Crystal 40L",
    "yield": 34,
    "color": 40,
    "category": "Grain"
  },
  {
    "id": "f-crystal-60l",
    "name": "Caramel / Crystal 60L",
    "yield": 34,
    "color": 60,
    "category": "Grain"
  },
  {
    "id": "f-crystal-75l",
    "name": "Caramel / Crystal 75L",
    "yield": 33,
    "color": 75,
    "category": "Grain"
  },
  {
    "id": "f-crystal-80l",
    "name": "Caramel / Crystal 80L",
    "yield": 33,
    "color": 80,
    "category": "Grain"
  },
  {
    "id": "f-crystal-90l",
    "name": "Caramel / Crystal 90L",
    "yield": 33,
    "color": 90,
    "category": "Grain"
  },
  {
    "id": "f-caramel-pils",
    "name": "Caramel Pils",
    "yield": 34,
    "color": 8,
    "category": "Grain"
  },
  {
    "id": "f-caramel-wheat",
    "name": "Caramel Wheat",
    "yield": 34,
    "color": 46,
    "category": "Grain"
  },
  {
    "id": "f-caramel-crystal-malt",
    "name": "Caramel/Crystal Malt",
    "yield": 35,
    "color": 60,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-caramunich-i",
    "name": "CaraMunich I",
    "yield": 34,
    "color": 39,
    "category": "Grain"
  },
  {
    "id": "f-caramunich-ii",
    "name": "CaraMunich II",
    "yield": 34,
    "color": 46,
    "category": "Grain"
  },
  {
    "id": "f-caramunich-iii",
    "name": "CaraMunich III",
    "yield": 34,
    "color": 57,
    "category": "Grain"
  },
  {
    "id": "f-carapils-briess",
    "name": "Carapils",
    "yield": 35,
    "color": 1,
    "category": "Grain"
  },
  {
    "id": "f-carapils-dextrin",
    "name": "Carapils (Dextrin)",
    "yield": 33,
    "color": 1.5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-carapils-dextrine",
    "name": "Carapils (Dextrine Malt)",
    "yield": 33,
    "color": 2,
    "category": "Grain"
  },
  {
    "id": "f-carared",
    "name": "CaraRed",
    "yield": 34,
    "color": 20,
    "category": "Grain"
  },
  {
    "id": "f-cararye",
    "name": "CaraRye",
    "yield": 34,
    "color": 67,
    "category": "Grain"
  },
  {
    "id": "f-carastan",
    "name": "Carastan (30/37)",
    "yield": 35,
    "color": 34,
    "category": "Grain"
  },
  {
    "id": "f-caravienne",
    "name": "CaraVienne",
    "yield": 34,
    "color": 20,
    "category": "Grain"
  },
  {
    "id": "f-chit-malt",
    "name": "Chit Malt",
    "yield": 30,
    "color": 1.5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-chocolate",
    "name": "Chocolate",
    "yield": 29,
    "color": 350,
    "category": "Grain"
  },
  {
    "id": "f-chocolate-malt",
    "name": "Chocolate Malt",
    "yield": 25,
    "color": 350,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-chocolate-rye",
    "name": "Chocolate Rye",
    "yield": 31,
    "color": 240,
    "category": "Grain"
  },
  {
    "id": "f-chocolate-wheat",
    "name": "Chocolate Wheat",
    "yield": 31,
    "color": 413,
    "category": "Grain"
  },
  {
    "id": "f-coffee-malt",
    "name": "Coffee Malt",
    "yield": 36,
    "color": 150,
    "category": "Grain"
  },
  {
    "id": "f-corn-sugar",
    "name": "Corn Sugar - Dextrose",
    "yield": 42,
    "color": 1,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-corn-syrup",
    "name": "Corn Syrup",
    "yield": 37,
    "color": 1,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-cracked-corn",
    "name": "Cracked Corn",
    "yield": 30,
    "color": 1,
    "category": "Adjunct"
  },
  {
    "id": "f-crystal-140l",
    "name": "Crystal 140L",
    "yield": 33,
    "color": 140,
    "category": "Grain"
  },
  {
    "id": "f-crystal-45l",
    "name": "Crystal 45L",
    "yield": 34,
    "color": 45,
    "category": "Grain"
  },
  {
    "id": "f-crystal-60l-uk",
    "name": "Crystal 60L",
    "yield": 34,
    "color": 60,
    "category": "Grain"
  },
  {
    "id": "f-crystal-rye",
    "name": "Crystal Rye",
    "yield": 33,
    "color": 90,
    "category": "Grain"
  },
  {
    "id": "f-dark-chocolate",
    "name": "Dark Chocolate",
    "yield": 29,
    "color": 420,
    "category": "Grain"
  },
  {
    "id": "f-dark-crystal-80l",
    "name": "Dark Crystal 80L",
    "yield": 33,
    "color": 80,
    "category": "Grain"
  },
  {
    "id": "f-dark-wheat",
    "name": "Dark Wheat",
    "yield": 39,
    "color": 7,
    "category": "Grain"
  },
  {
    "id": "f-debittered-black",
    "name": "De-Bittered Black",
    "yield": 34,
    "color": 566,
    "category": "Grain"
  },
  {
    "id": "f-dextrine-malt",
    "name": "Dextrine Malt",
    "yield": 33,
    "color": 2,
    "category": "Grain"
  },
  {
    "id": "f-dextrose-corn-sugar",
    "name": "Dextrose (Corn Sugar)",
    "yield": 41,
    "color": 0,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-dme-amber",
    "name": "Dry Malt Extract - Amber",
    "yield": 42,
    "color": 10,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dme-dark",
    "name": "Dry Malt Extract - Dark",
    "yield": 44,
    "color": 30,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dme-extra-light",
    "name": "Dry Malt Extract - Extra Light",
    "yield": 42,
    "color": 3,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dme-light",
    "name": "Dry Malt Extract - Light",
    "yield": 42,
    "color": 4,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dme-munich",
    "name": "Dry Malt Extract - Munich",
    "yield": 42,
    "color": 8,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dme-pilsen",
    "name": "Dry Malt Extract - Pilsen",
    "yield": 42,
    "color": 2,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dme-wheat",
    "name": "Dry Malt Extract - Wheat",
    "yield": 42,
    "color": 3,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-dry-malt-extract-dme",
    "name": "Dry Malt Extract (DME)",
    "yield": 44,
    "color": 10.5,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-extra-dark-crystal-120",
    "name": "Extra Dark Crystal 120L",
    "yield": 33,
    "color": 120,
    "category": "Grain"
  },
  {
    "id": "f-extra-dark-crystal-160",
    "name": "Extra Dark Crystal 160L",
    "yield": 33,
    "color": 160,
    "category": "Grain"
  },
  {
    "id": "f-flaked-barley",
    "name": "Flaked Barley",
    "yield": 32,
    "color": 2,
    "category": "Adjunct"
  },
  {
    "id": "f-flaked-corn",
    "name": "Flaked Corn",
    "yield": 40,
    "color": 1,
    "category": "Adjunct"
  },
  {
    "id": "f-flaked-corn-maize",
    "name": "Flaked Corn (Maize)",
    "yield": 40,
    "color": 1,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-flaked-oats",
    "name": "Flaked Oats",
    "yield": 33,
    "color": 2,
    "category": "Adjunct"
  },
  {
    "id": "f-flaked-rice",
    "name": "Flaked Rice",
    "yield": 40,
    "color": 1,
    "category": "Adjunct"
  },
  {
    "id": "f-flaked-rye",
    "name": "Flaked Rye",
    "yield": 36,
    "color": 3,
    "category": "Adjunct"
  },
  {
    "id": "f-flaked-spelt",
    "name": "Flaked Spelt",
    "yield": 32,
    "color": 1.5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-flaked-wheat",
    "name": "Flaked Wheat",
    "yield": 34,
    "color": 2,
    "category": "Adjunct"
  },
  {
    "id": "f-golden-naked-oats",
    "name": "Golden Naked Oats",
    "yield": 33,
    "color": 10,
    "category": "Adjunct"
  },
  {
    "id": "f-golden-promise",
    "name": "Golden Promise",
    "yield": 37,
    "color": 3,
    "category": "Grain"
  },
  {
    "id": "f-grits",
    "name": "Grits",
    "yield": 37,
    "color": 1,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-honey",
    "name": "Honey",
    "yield": 35,
    "color": 2,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-honey-malt",
    "name": "Honey Malt",
    "yield": 37,
    "color": 25,
    "category": "Grain"
  },
  {
    "id": "f-lactose-milk-sugar",
    "name": "Lactose (Milk Sugar)",
    "yield": 41,
    "color": 0,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-liquid-malt-extract-lme",
    "name": "Liquid Malt Extract (LME)",
    "yield": 37,
    "color": 10.5,
    "category": "Extract",
    "isExtract": true
  },
  {
    "id": "f-malted-oats",
    "name": "Malted Oats",
    "yield": 30,
    "color": 2.25,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-maltodextrin",
    "name": "Maltodextrin",
    "yield": 40,
    "color": 0,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-maple-syrup",
    "name": "Maple Syrup",
    "yield": 30,
    "color": 35,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-maris-otter",
    "name": "Maris Otter",
    "yield": 38,
    "color": 2.5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-mild-malt",
    "name": "Mild Malt",
    "yield": 37,
    "color": 4,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-molasses",
    "name": "Molasses",
    "yield": 36,
    "color": 80,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-munich-malt",
    "name": "Munich Malt",
    "yield": 38,
    "color": 15,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-peat-smoked-malt",
    "name": "Peat Smoked Malt",
    "yield": 38,
    "color": 3,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-pilsner-malt",
    "name": "Pilsner Malt",
    "yield": 37,
    "color": 1.75,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-rice-hulls",
    "name": "Rice Hulls",
    "yield": 0,
    "color": 0,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-roasted-barley",
    "name": "Roasted Barley",
    "yield": 30,
    "color": 400,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-roasted-wheat",
    "name": "Roasted Wheat",
    "yield": 34,
    "color": 425,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-rye-malt",
    "name": "Rye Malt",
    "yield": 38,
    "color": 4,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-smoked-malt",
    "name": "Smoked Malt",
    "yield": 37,
    "color": 5,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-special-roast",
    "name": "Special Roast",
    "yield": 33,
    "color": 45,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-table-sugar-sucrose",
    "name": "Table Sugar (Sucrose)",
    "yield": 46,
    "color": 1,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-torrified-wheat",
    "name": "Torrified Wheat",
    "yield": 37,
    "color": 2,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-turbinado",
    "name": "Turbinado",
    "yield": 44,
    "color": 10,
    "category": "Sugar",
    "isExtract": true
  },
  {
    "id": "f-vienna-malt",
    "name": "Vienna Malt",
    "yield": 37,
    "color": 4,
    "category": "Grain",
    "isExtract": false
  },
  {
    "id": "f-wheat-malt",
    "name": "Wheat Malt",
    "yield": 39,
    "color": 5,
    "category": "Grain",
    "isExtract": false
  }
];

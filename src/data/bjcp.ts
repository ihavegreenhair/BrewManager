import type { BeerStyle } from '../types/brewing';

export const bjcpStyles: BeerStyle[] = [
  {
    "id": "1A",
    "name": "American Light Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.028,
        "max": 1.04
      },
      "fg": {
        "min": 0.998,
        "max": 1.008
      },
      "ibu": {
        "min": 8,
        "max": 12
      },
      "srm": {
        "min": 2,
        "max": 3
      },
      "abv": {
        "min": 2.8,
        "max": 4.2
      }
    }
  },
  {
    "id": "1B",
    "name": "American Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.05
      },
      "fg": {
        "min": 1.004,
        "max": 1.01
      },
      "ibu": {
        "min": 8,
        "max": 18
      },
      "srm": {
        "min": 2,
        "max": 3.5
      },
      "abv": {
        "min": 4.2,
        "max": 5.3
      }
    }
  },
  {
    "id": "1C",
    "name": "Cream Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.042,
        "max": 1.055
      },
      "fg": {
        "min": 1.006,
        "max": 1.012
      },
      "ibu": {
        "min": 8,
        "max": 20
      },
      "srm": {
        "min": 2,
        "max": 5
      },
      "abv": {
        "min": 4.2,
        "max": 5.6
      }
    }
  },
  {
    "id": "1D",
    "name": "American Wheat Beer",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.055
      },
      "fg": {
        "min": 1.008,
        "max": 1.013
      },
      "ibu": {
        "min": 15,
        "max": 30
      },
      "srm": {
        "min": 3,
        "max": 6
      },
      "abv": {
        "min": 4,
        "max": 5.5
      }
    }
  },
  {
    "id": "2A",
    "name": "International Pale Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.042,
        "max": 1.05
      },
      "fg": {
        "min": 1.008,
        "max": 1.012
      },
      "ibu": {
        "min": 18,
        "max": 25
      },
      "srm": {
        "min": 2,
        "max": 6
      },
      "abv": {
        "min": 4.5,
        "max": 6
      }
    }
  },
  {
    "id": "2B",
    "name": "International Amber Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.042,
        "max": 1.055
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 8,
        "max": 25
      },
      "srm": {
        "min": 6,
        "max": 14
      },
      "abv": {
        "min": 4.5,
        "max": 6
      }
    }
  },
  {
    "id": "2C",
    "name": "International Dark Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.056
      },
      "fg": {
        "min": 1.008,
        "max": 1.012
      },
      "ibu": {
        "min": 8,
        "max": 20
      },
      "srm": {
        "min": 14,
        "max": 30
      },
      "abv": {
        "min": 4.2,
        "max": 6
      }
    }
  },
  {
    "id": "3A",
    "name": "Czech Pale Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.028,
        "max": 1.044
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 20,
        "max": 35
      },
      "srm": {
        "min": 3,
        "max": 6
      },
      "abv": {
        "min": 3,
        "max": 4.1
      }
    }
  },
  {
    "id": "3B",
    "name": "Czech Premium Pale Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.06
      },
      "fg": {
        "min": 1.013,
        "max": 1.017
      },
      "ibu": {
        "min": 30,
        "max": 45
      },
      "srm": {
        "min": 3.5,
        "max": 6
      },
      "abv": {
        "min": 4.2,
        "max": 5.8
      }
    }
  },
  {
    "id": "3C",
    "name": "Czech Amber Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.06
      },
      "fg": {
        "min": 1.013,
        "max": 1.017
      },
      "ibu": {
        "min": 20,
        "max": 35
      },
      "srm": {
        "min": 10,
        "max": 16
      },
      "abv": {
        "min": 4.4,
        "max": 5.8
      }
    }
  },
  {
    "id": "3D",
    "name": "Czech Dark Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.06
      },
      "fg": {
        "min": 1.013,
        "max": 1.017
      },
      "ibu": {
        "min": 18,
        "max": 34
      },
      "srm": {
        "min": 17,
        "max": 35
      },
      "abv": {
        "min": 4.4,
        "max": 5.8
      }
    }
  },
  {
    "id": "4A",
    "name": "Munich Helles",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.048
      },
      "fg": {
        "min": 1.006,
        "max": 1.012
      },
      "ibu": {
        "min": 16,
        "max": 22
      },
      "srm": {
        "min": 3,
        "max": 5
      },
      "abv": {
        "min": 4.7,
        "max": 5.4
      }
    }
  },
  {
    "id": "4B",
    "name": "Festbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.054,
        "max": 1.057
      },
      "fg": {
        "min": 1.01,
        "max": 1.012
      },
      "ibu": {
        "min": 18,
        "max": 25
      },
      "srm": {
        "min": 4,
        "max": 6
      },
      "abv": {
        "min": 5.8,
        "max": 6.3
      }
    }
  },
  {
    "id": "4C",
    "name": "Helles Bock",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.064,
        "max": 1.072
      },
      "fg": {
        "min": 1.011,
        "max": 1.018
      },
      "ibu": {
        "min": 23,
        "max": 35
      },
      "srm": {
        "min": 6,
        "max": 9
      },
      "abv": {
        "min": 6.3,
        "max": 7.4
      }
    }
  },
  {
    "id": "5A",
    "name": "German Leichtbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.026,
        "max": 1.034
      },
      "fg": {
        "min": 1.006,
        "max": 1.01
      },
      "ibu": {
        "min": 15,
        "max": 28
      },
      "srm": {
        "min": 1.5,
        "max": 4
      },
      "abv": {
        "min": 2.4,
        "max": 3.6
      }
    }
  },
  {
    "id": "5B",
    "name": "Kölsch",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.05
      },
      "fg": {
        "min": 1.007,
        "max": 1.011
      },
      "ibu": {
        "min": 18,
        "max": 30
      },
      "srm": {
        "min": 3.5,
        "max": 5
      },
      "abv": {
        "min": 4.4,
        "max": 5.2
      }
    }
  },
  {
    "id": "5C",
    "name": "German Helles Exportbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.05,
        "max": 1.058
      },
      "fg": {
        "min": 1.008,
        "max": 1.015
      },
      "ibu": {
        "min": 20,
        "max": 30
      },
      "srm": {
        "min": 4,
        "max": 6
      },
      "abv": {
        "min": 5,
        "max": 6
      }
    }
  },
  {
    "id": "5D",
    "name": "German Pils",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.05
      },
      "fg": {
        "min": 1.008,
        "max": 1.013
      },
      "ibu": {
        "min": 22,
        "max": 40
      },
      "srm": {
        "min": 2,
        "max": 4
      },
      "abv": {
        "min": 4.4,
        "max": 5.2
      }
    }
  },
  {
    "id": "6A",
    "name": "Märzen",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.054,
        "max": 1.06
      },
      "fg": {
        "min": 1.01,
        "max": 1.014
      },
      "ibu": {
        "min": 18,
        "max": 24
      },
      "srm": {
        "min": 8,
        "max": 17
      },
      "abv": {
        "min": 5.6,
        "max": 6.3
      }
    }
  },
  {
    "id": "6B",
    "name": "Rauchbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.05,
        "max": 1.057
      },
      "fg": {
        "min": 1.012,
        "max": 1.016
      },
      "ibu": {
        "min": 20,
        "max": 30
      },
      "srm": {
        "min": 12,
        "max": 22
      },
      "abv": {
        "min": 4.8,
        "max": 6
      }
    }
  },
  {
    "id": "6C",
    "name": "Dunkles Bock",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.064,
        "max": 1.072
      },
      "fg": {
        "min": 1.013,
        "max": 1.019
      },
      "ibu": {
        "min": 20,
        "max": 27
      },
      "srm": {
        "min": 14,
        "max": 22
      },
      "abv": {
        "min": 6.3,
        "max": 7.2
      }
    }
  },
  {
    "id": "7A",
    "name": "Vienna Lager",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.055
      },
      "fg": {
        "min": 1.01,
        "max": 1.014
      },
      "ibu": {
        "min": 18,
        "max": 30
      },
      "srm": {
        "min": 9,
        "max": 15
      },
      "abv": {
        "min": 4.7,
        "max": 5.5
      }
    }
  },
  {
    "id": "7B",
    "name": "Altbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.052
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 25,
        "max": 50
      },
      "srm": {
        "min": 9,
        "max": 17
      },
      "abv": {
        "min": 4.3,
        "max": 5.5
      }
    }
  },
  {
    "id": "8A",
    "name": "Munich Dunkel",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.056
      },
      "fg": {
        "min": 1.01,
        "max": 1.016
      },
      "ibu": {
        "min": 18,
        "max": 28
      },
      "srm": {
        "min": 17,
        "max": 28
      },
      "abv": {
        "min": 4.5,
        "max": 5.6
      }
    }
  },
  {
    "id": "8B",
    "name": "Schwarzbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.046,
        "max": 1.052
      },
      "fg": {
        "min": 1.01,
        "max": 1.016
      },
      "ibu": {
        "min": 20,
        "max": 35
      },
      "srm": {
        "min": 19,
        "max": 30
      },
      "abv": {
        "min": 4.4,
        "max": 5.4
      }
    }
  },
  {
    "id": "9A",
    "name": "Doppelbock",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.072,
        "max": 1.112
      },
      "fg": {
        "min": 1.016,
        "max": 1.024
      },
      "ibu": {
        "min": 16,
        "max": 26
      },
      "srm": {
        "min": 6,
        "max": 25
      },
      "abv": {
        "min": 7,
        "max": 10
      }
    }
  },
  {
    "id": "9B",
    "name": "Eisbock",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.078,
        "max": 1.12
      },
      "fg": {
        "min": 1.02,
        "max": 1.035
      },
      "ibu": {
        "min": 25,
        "max": 35
      },
      "srm": {
        "min": 17,
        "max": 30
      },
      "abv": {
        "min": 9,
        "max": 14
      }
    }
  },
  {
    "id": "9C",
    "name": "Baltic Porter",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.06,
        "max": 1.09
      },
      "fg": {
        "min": 1.016,
        "max": 1.024
      },
      "ibu": {
        "min": 20,
        "max": 40
      },
      "srm": {
        "min": 17,
        "max": 30
      },
      "abv": {
        "min": 6.5,
        "max": 9.5
      }
    }
  },
  {
    "id": "10A",
    "name": "Weissbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.053
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 8,
        "max": 15
      },
      "srm": {
        "min": 2,
        "max": 6
      },
      "abv": {
        "min": 4.3,
        "max": 5.6
      }
    }
  },
  {
    "id": "10B",
    "name": "Dunkles Weissbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.057
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 10,
        "max": 18
      },
      "srm": {
        "min": 14,
        "max": 23
      },
      "abv": {
        "min": 4.3,
        "max": 5.6
      }
    }
  },
  {
    "id": "10C",
    "name": "Weizenbock",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.064,
        "max": 1.09
      },
      "fg": {
        "min": 1.015,
        "max": 1.022
      },
      "ibu": {
        "min": 15,
        "max": 30
      },
      "srm": {
        "min": 6,
        "max": 25
      },
      "abv": {
        "min": 6.5,
        "max": 9
      }
    }
  },
  {
    "id": "11A",
    "name": "Ordinary Bitter",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.03,
        "max": 1.039
      },
      "fg": {
        "min": 1.007,
        "max": 1.011
      },
      "ibu": {
        "min": 25,
        "max": 35
      },
      "srm": {
        "min": 8,
        "max": 14
      },
      "abv": {
        "min": 3.2,
        "max": 3.8
      }
    }
  },
  {
    "id": "11B",
    "name": "Best Bitter",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.048
      },
      "fg": {
        "min": 1.008,
        "max": 1.012
      },
      "ibu": {
        "min": 25,
        "max": 40
      },
      "srm": {
        "min": 8,
        "max": 16
      },
      "abv": {
        "min": 3.8,
        "max": 4.6
      }
    }
  },
  {
    "id": "11C",
    "name": "Strong Bitter",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.06
      },
      "fg": {
        "min": 1.01,
        "max": 1.016
      },
      "ibu": {
        "min": 30,
        "max": 50
      },
      "srm": {
        "min": 8,
        "max": 18
      },
      "abv": {
        "min": 4.6,
        "max": 6.2
      }
    }
  },
  {
    "id": "12A",
    "name": "British Golden Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.038,
        "max": 1.053
      },
      "fg": {
        "min": 1.006,
        "max": 1.012
      },
      "ibu": {
        "min": 20,
        "max": 45
      },
      "srm": {
        "min": 2,
        "max": 5
      },
      "abv": {
        "min": 3.8,
        "max": 5
      }
    }
  },
  {
    "id": "12B",
    "name": "Australian Sparkling Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.038,
        "max": 1.05
      },
      "fg": {
        "min": 1.004,
        "max": 1.006
      },
      "ibu": {
        "min": 20,
        "max": 35
      },
      "srm": {
        "min": 4,
        "max": 7
      },
      "abv": {
        "min": 4.5,
        "max": 6
      }
    }
  },
  {
    "id": "12C",
    "name": "English IPA",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.05,
        "max": 1.07
      },
      "fg": {
        "min": 1.01,
        "max": 1.015
      },
      "ibu": {
        "min": 40,
        "max": 60
      },
      "srm": {
        "min": 6,
        "max": 14
      },
      "abv": {
        "min": 5,
        "max": 7.5
      }
    }
  },
  {
    "id": "13A",
    "name": "Dark Mild",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.03,
        "max": 1.038
      },
      "fg": {
        "min": 1.008,
        "max": 1.013
      },
      "ibu": {
        "min": 10,
        "max": 25
      },
      "srm": {
        "min": 14,
        "max": 25
      },
      "abv": {
        "min": 3,
        "max": 3.8
      }
    }
  },
  {
    "id": "13B",
    "name": "British Brown Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.052
      },
      "fg": {
        "min": 1.008,
        "max": 1.013
      },
      "ibu": {
        "min": 20,
        "max": 30
      },
      "srm": {
        "min": 12,
        "max": 22
      },
      "abv": {
        "min": 4.2,
        "max": 5.9
      }
    }
  },
  {
    "id": "13C",
    "name": "English Porter",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.052
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 18,
        "max": 35
      },
      "srm": {
        "min": 20,
        "max": 30
      },
      "abv": {
        "min": 4,
        "max": 5.4
      }
    }
  },
  {
    "id": "14A",
    "name": "Scottish Light",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.03,
        "max": 1.035
      },
      "fg": {
        "min": 1.01,
        "max": 1.013
      },
      "ibu": {
        "min": 10,
        "max": 20
      },
      "srm": {
        "min": 17,
        "max": 25
      },
      "abv": {
        "min": 2.5,
        "max": 3.3
      }
    }
  },
  {
    "id": "14B",
    "name": "Scottish Heavy",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.035,
        "max": 1.04
      },
      "fg": {
        "min": 1.01,
        "max": 1.015
      },
      "ibu": {
        "min": 10,
        "max": 20
      },
      "srm": {
        "min": 12,
        "max": 20
      },
      "abv": {
        "min": 3.3,
        "max": 3.9
      }
    }
  },
  {
    "id": "14C",
    "name": "Scottish Export",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.06
      },
      "fg": {
        "min": 1.01,
        "max": 1.016
      },
      "ibu": {
        "min": 15,
        "max": 30
      },
      "srm": {
        "min": 12,
        "max": 20
      },
      "abv": {
        "min": 3.9,
        "max": 6
      }
    }
  },
  {
    "id": "15A",
    "name": "Irish Red Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.036,
        "max": 1.046
      },
      "fg": {
        "min": 1.01,
        "max": 1.014
      },
      "ibu": {
        "min": 18,
        "max": 28
      },
      "srm": {
        "min": 9,
        "max": 14
      },
      "abv": {
        "min": 3.8,
        "max": 5
      }
    }
  },
  {
    "id": "15B",
    "name": "Irish Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.036,
        "max": 1.044
      },
      "fg": {
        "min": 1.007,
        "max": 1.011
      },
      "ibu": {
        "min": 25,
        "max": 45
      },
      "srm": {
        "min": 25,
        "max": 40
      },
      "abv": {
        "min": 3.8,
        "max": 5
      }
    }
  },
  {
    "id": "15C",
    "name": "Irish Extra Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.052,
        "max": 1.062
      },
      "fg": {
        "min": 1.01,
        "max": 1.014
      },
      "ibu": {
        "min": 35,
        "max": 50
      },
      "srm": {
        "min": 30,
        "max": 40
      },
      "abv": {
        "min": 5,
        "max": 6.5
      }
    }
  },
  {
    "id": "16A",
    "name": "Sweet Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.06
      },
      "fg": {
        "min": 1.012,
        "max": 1.024
      },
      "ibu": {
        "min": 20,
        "max": 40
      },
      "srm": {
        "min": 30,
        "max": 40
      },
      "abv": {
        "min": 4,
        "max": 6
      }
    }
  },
  {
    "id": "16B",
    "name": "Oatmeal Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.045,
        "max": 1.065
      },
      "fg": {
        "min": 1.01,
        "max": 1.018
      },
      "ibu": {
        "min": 25,
        "max": 40
      },
      "srm": {
        "min": 22,
        "max": 40
      },
      "abv": {
        "min": 4.2,
        "max": 5.9
      }
    }
  },
  {
    "id": "16C",
    "name": "Tropical Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.056,
        "max": 1.075
      },
      "fg": {
        "min": 1.01,
        "max": 1.018
      },
      "ibu": {
        "min": 30,
        "max": 50
      },
      "srm": {
        "min": 30,
        "max": 40
      },
      "abv": {
        "min": 5.5,
        "max": 8
      }
    }
  },
  {
    "id": "16D",
    "name": "Foreign Extra Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.056,
        "max": 1.075
      },
      "fg": {
        "min": 1.01,
        "max": 1.018
      },
      "ibu": {
        "min": 50,
        "max": 70
      },
      "srm": {
        "min": 30,
        "max": 40
      },
      "abv": {
        "min": 6.3,
        "max": 8
      }
    }
  },
  {
    "id": "17A",
    "name": "British Strong Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.055,
        "max": 1.08
      },
      "fg": {
        "min": 1.015,
        "max": 1.022
      },
      "ibu": {
        "min": 30,
        "max": 60
      },
      "srm": {
        "min": 8,
        "max": 22
      },
      "abv": {
        "min": 5.5,
        "max": 8
      }
    }
  },
  {
    "id": "17B",
    "name": "Old Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.055,
        "max": 1.088
      },
      "fg": {
        "min": 1.015,
        "max": 1.022
      },
      "ibu": {
        "min": 30,
        "max": 60
      },
      "srm": {
        "min": 10,
        "max": 22
      },
      "abv": {
        "min": 5.5,
        "max": 9
      }
    }
  },
  {
    "id": "17C",
    "name": "Wee Heavy",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.07,
        "max": 1.13
      },
      "fg": {
        "min": 1.018,
        "max": 1.04
      },
      "ibu": {
        "min": 17,
        "max": 35
      },
      "srm": {
        "min": 14,
        "max": 25
      },
      "abv": {
        "min": 6.5,
        "max": 10
      }
    }
  },
  {
    "id": "17D",
    "name": "English Barley Wine",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.08,
        "max": 1.12
      },
      "fg": {
        "min": 1.018,
        "max": 1.03
      },
      "ibu": {
        "min": 35,
        "max": 70
      },
      "srm": {
        "min": 8,
        "max": 22
      },
      "abv": {
        "min": 8,
        "max": 12
      }
    }
  },
  {
    "id": "18A",
    "name": "Blonde Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.038,
        "max": 1.054
      },
      "fg": {
        "min": 1.008,
        "max": 1.013
      },
      "ibu": {
        "min": 15,
        "max": 28
      },
      "srm": {
        "min": 3,
        "max": 6
      },
      "abv": {
        "min": 3.8,
        "max": 5.5
      }
    }
  },
  {
    "id": "18B",
    "name": "American Pale Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.045,
        "max": 1.06
      },
      "fg": {
        "min": 1.01,
        "max": 1.015
      },
      "ibu": {
        "min": 30,
        "max": 50
      },
      "srm": {
        "min": 5,
        "max": 10
      },
      "abv": {
        "min": 4.5,
        "max": 6.2
      }
    }
  },
  {
    "id": "19A",
    "name": "American Amber Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.045,
        "max": 1.06
      },
      "fg": {
        "min": 1.01,
        "max": 1.015
      },
      "ibu": {
        "min": 25,
        "max": 40
      },
      "srm": {
        "min": 10,
        "max": 17
      },
      "abv": {
        "min": 4.5,
        "max": 6.2
      }
    }
  },
  {
    "id": "19B",
    "name": "California Common",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.054
      },
      "fg": {
        "min": 1.011,
        "max": 1.014
      },
      "ibu": {
        "min": 30,
        "max": 45
      },
      "srm": {
        "min": 9,
        "max": 14
      },
      "abv": {
        "min": 4.5,
        "max": 5.5
      }
    }
  },
  {
    "id": "19C",
    "name": "American Brown Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.045,
        "max": 1.06
      },
      "fg": {
        "min": 1.01,
        "max": 1.016
      },
      "ibu": {
        "min": 20,
        "max": 30
      },
      "srm": {
        "min": 18,
        "max": 35
      },
      "abv": {
        "min": 4.3,
        "max": 6.2
      }
    }
  },
  {
    "id": "20A",
    "name": "American Porter",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.05,
        "max": 1.07
      },
      "fg": {
        "min": 1.012,
        "max": 1.018
      },
      "ibu": {
        "min": 25,
        "max": 50
      },
      "srm": {
        "min": 22,
        "max": 40
      },
      "abv": {
        "min": 4.8,
        "max": 6.5
      }
    }
  },
  {
    "id": "20B",
    "name": "American Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.05,
        "max": 1.075
      },
      "fg": {
        "min": 1.01,
        "max": 1.022
      },
      "ibu": {
        "min": 35,
        "max": 75
      },
      "srm": {
        "min": 30,
        "max": 40
      },
      "abv": {
        "min": 5,
        "max": 7
      }
    }
  },
  {
    "id": "20C",
    "name": "Imperial Stout",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.075,
        "max": 1.115
      },
      "fg": {
        "min": 1.018,
        "max": 1.03
      },
      "ibu": {
        "min": 50,
        "max": 90
      },
      "srm": {
        "min": 30,
        "max": 40
      },
      "abv": {
        "min": 8,
        "max": 12
      }
    }
  },
  {
    "id": "21A",
    "name": "American IPA",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.056,
        "max": 1.07
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 40,
        "max": 70
      },
      "srm": {
        "min": 6,
        "max": 14
      },
      "abv": {
        "min": 5.5,
        "max": 7.5
      }
    }
  },
  {
    "id": "21B",
    "name": "Specialty IPA",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.046,
        "max": 1.057
      },
      "fg": {
        "min": 0.99,
        "max": 1.004
      },
      "ibu": {
        "min": 20,
        "max": 30
      },
      "srm": {
        "min": 2,
        "max": 4
      },
      "abv": {
        "min": 6,
        "max": 7.5
      }
    }
  },
  {
    "id": "21C",
    "name": "Hazy IPA",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.06,
        "max": 1.085
      },
      "fg": {
        "min": 1.01,
        "max": 1.015
      },
      "ibu": {
        "min": 25,
        "max": 60
      },
      "srm": {
        "min": 3,
        "max": 7
      },
      "abv": {
        "min": 6,
        "max": 9
      }
    }
  },
  {
    "id": "22A",
    "name": "Double IPA",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.065,
        "max": 1.085
      },
      "fg": {
        "min": 1.008,
        "max": 1.018
      },
      "ibu": {
        "min": 60,
        "max": 100
      },
      "srm": {
        "min": 6,
        "max": 14
      },
      "abv": {
        "min": 7.5,
        "max": 10
      }
    }
  },
  {
    "id": "22B",
    "name": "American Strong Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.062,
        "max": 1.09
      },
      "fg": {
        "min": 1.014,
        "max": 1.024
      },
      "ibu": {
        "min": 50,
        "max": 100
      },
      "srm": {
        "min": 7,
        "max": 18
      },
      "abv": {
        "min": 6.3,
        "max": 10
      }
    }
  },
  {
    "id": "22C",
    "name": "American Barleywine",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.08,
        "max": 1.12
      },
      "fg": {
        "min": 1.016,
        "max": 1.03
      },
      "ibu": {
        "min": 50,
        "max": 100
      },
      "srm": {
        "min": 9,
        "max": 18
      },
      "abv": {
        "min": 8,
        "max": 12
      }
    }
  },
  {
    "id": "22D",
    "name": "Wheatwine",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.08,
        "max": 1.12
      },
      "fg": {
        "min": 1.016,
        "max": 1.03
      },
      "ibu": {
        "min": 30,
        "max": 60
      },
      "srm": {
        "min": 6,
        "max": 14
      },
      "abv": {
        "min": 8,
        "max": 12
      }
    }
  },
  {
    "id": "23A",
    "name": "Berliner Weisse",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.028,
        "max": 1.032
      },
      "fg": {
        "min": 1.003,
        "max": 1.006
      },
      "ibu": {
        "min": 3,
        "max": 8
      },
      "srm": {
        "min": 2,
        "max": 3
      },
      "abv": {
        "min": 2.8,
        "max": 3.8
      }
    }
  },
  {
    "id": "23B",
    "name": "Flanders Red Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.057
      },
      "fg": {
        "min": 1.002,
        "max": 1.012
      },
      "ibu": {
        "min": 10,
        "max": 25
      },
      "srm": {
        "min": 10,
        "max": 17
      },
      "abv": {
        "min": 4.6,
        "max": 6.5
      }
    }
  },
  {
    "id": "23C",
    "name": "Oud Bruin",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.074
      },
      "fg": {
        "min": 1.008,
        "max": 1.012
      },
      "ibu": {
        "min": 20,
        "max": 25
      },
      "srm": {
        "min": 17,
        "max": 22
      },
      "abv": {
        "min": 4,
        "max": 8
      }
    }
  },
  {
    "id": "23D",
    "name": "Lambic",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.054
      },
      "fg": {
        "min": 1.001,
        "max": 1.01
      },
      "ibu": {
        "min": 0,
        "max": 10
      },
      "srm": {
        "min": 3,
        "max": 6
      },
      "abv": {
        "min": 5,
        "max": 6.5
      }
    }
  },
  {
    "id": "23E",
    "name": "Gueuze",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.054
      },
      "fg": {
        "min": 1,
        "max": 1.006
      },
      "ibu": {
        "min": 0,
        "max": 10
      },
      "srm": {
        "min": 5,
        "max": 6
      },
      "abv": {
        "min": 5,
        "max": 8
      }
    }
  },
  {
    "id": "23F",
    "name": "Fruit Lambic",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.04,
        "max": 1.06
      },
      "fg": {
        "min": 1,
        "max": 1.01
      },
      "ibu": {
        "min": 0,
        "max": 10
      },
      "srm": {
        "min": 3,
        "max": 7
      },
      "abv": {
        "min": 5,
        "max": 7
      }
    }
  },
  {
    "id": "23G",
    "name": "Gose",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.036,
        "max": 1.056
      },
      "fg": {
        "min": 1.006,
        "max": 1.01
      },
      "ibu": {
        "min": 5,
        "max": 12
      },
      "srm": {
        "min": 3,
        "max": 4
      },
      "abv": {
        "min": 4.2,
        "max": 4.8
      }
    }
  },
  {
    "id": "24A",
    "name": "Witbier",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.052
      },
      "fg": {
        "min": 1.008,
        "max": 1.012
      },
      "ibu": {
        "min": 8,
        "max": 20
      },
      "srm": {
        "min": 2,
        "max": 4
      },
      "abv": {
        "min": 4.5,
        "max": 5.5
      }
    }
  },
  {
    "id": "24B",
    "name": "Belgian Pale Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.054
      },
      "fg": {
        "min": 1.01,
        "max": 1.014
      },
      "ibu": {
        "min": 20,
        "max": 30
      },
      "srm": {
        "min": 8,
        "max": 14
      },
      "abv": {
        "min": 4.8,
        "max": 5.5
      }
    }
  },
  {
    "id": "24C",
    "name": "Bière de Garde",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.06,
        "max": 1.08
      },
      "fg": {
        "min": 1.008,
        "max": 1.016
      },
      "ibu": {
        "min": 18,
        "max": 28
      },
      "srm": {
        "min": 6,
        "max": 19
      },
      "abv": {
        "min": 6,
        "max": 8.5
      }
    }
  },
  {
    "id": "25A",
    "name": "Belgian Blond Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.062,
        "max": 1.075
      },
      "fg": {
        "min": 1.008,
        "max": 1.018
      },
      "ibu": {
        "min": 15,
        "max": 30
      },
      "srm": {
        "min": 4,
        "max": 6
      },
      "abv": {
        "min": 6,
        "max": 7.5
      }
    }
  },
  {
    "id": "25B",
    "name": "Saison",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.065
      },
      "fg": {
        "min": 1.002,
        "max": 1.008
      },
      "ibu": {
        "min": 20,
        "max": 35
      },
      "srm": {
        "min": 5,
        "max": 14
      },
      "abv": {
        "min": 3.5,
        "max": 5
      }
    }
  },
  {
    "id": "25C",
    "name": "Belgian Golden Strong Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.07,
        "max": 1.095
      },
      "fg": {
        "min": 1.005,
        "max": 1.016
      },
      "ibu": {
        "min": 22,
        "max": 35
      },
      "srm": {
        "min": 3,
        "max": 6
      },
      "abv": {
        "min": 7.5,
        "max": 10.5
      }
    }
  },
  {
    "id": "26A",
    "name": "Belgian Single",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.054
      },
      "fg": {
        "min": 1.004,
        "max": 1.01
      },
      "ibu": {
        "min": 25,
        "max": 45
      },
      "srm": {
        "min": 3,
        "max": 5
      },
      "abv": {
        "min": 4.8,
        "max": 6
      }
    }
  },
  {
    "id": "26B",
    "name": "Belgian Dubbel",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.062,
        "max": 1.075
      },
      "fg": {
        "min": 1.008,
        "max": 1.018
      },
      "ibu": {
        "min": 15,
        "max": 25
      },
      "srm": {
        "min": 10,
        "max": 17
      },
      "abv": {
        "min": 6,
        "max": 7.6
      }
    }
  },
  {
    "id": "26C",
    "name": "Belgian Tripel",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.075,
        "max": 1.085
      },
      "fg": {
        "min": 1.008,
        "max": 1.014
      },
      "ibu": {
        "min": 20,
        "max": 40
      },
      "srm": {
        "min": 4.5,
        "max": 7
      },
      "abv": {
        "min": 7.5,
        "max": 9.5
      }
    }
  },
  {
    "id": "26D",
    "name": "Belgian Dark Strong Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.076,
        "max": 1.12
      },
      "fg": {
        "min": 1.016,
        "max": 1.038
      },
      "ibu": {
        "min": 0,
        "max": 15
      },
      "srm": {
        "min": 4,
        "max": 22
      },
      "abv": {
        "min": 7,
        "max": 11
      }
    }
  },
  {
    "id": "28D",
    "name": "Straight Sour Beer",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.048,
        "max": 1.065
      },
      "fg": {
        "min": 1.006,
        "max": 1.013
      },
      "ibu": {
        "min": 3,
        "max": 8
      },
      "srm": {
        "min": 2,
        "max": 3
      },
      "abv": {
        "min": 4.5,
        "max": 7
      }
    }
  },
  {
    "id": "29D",
    "name": "Grape Ale",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.059,
        "max": 1.075
      },
      "fg": {
        "min": 1.004,
        "max": 1.013
      },
      "ibu": {
        "min": 10,
        "max": 30
      },
      "srm": {
        "min": 4,
        "max": 8
      },
      "abv": {
        "min": 6,
        "max": 8.5
      }
    }
  },
  {
    "id": "34C",
    "name": "Experimental Beer",
    "category": "BJCP",
    "stats": {
      "og": {
        "min": 1.044,
        "max": 1.056
      },
      "fg": {
        "min": 1.009,
        "max": 1.014
      },
      "ibu": {
        "min": 25,
        "max": 45
      },
      "srm": {
        "min": 2,
        "max": 6
      },
      "abv": {
        "min": 4.5,
        "max": 5.8
      }
    }
  }
];

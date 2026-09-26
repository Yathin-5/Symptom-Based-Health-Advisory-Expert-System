export interface NutrientFoodSource {
  name: string;
  serving: string;
  amount: string;
  dailyValuePercentage: number; // e.g. 4120 for 4120%
  category: 'seafood' | 'meat' | 'dairy' | 'plant_based' | 'grain' | 'vegetable' | 'fruit' | 'nut_seed';
  dietaryTags: ('vegan' | 'vegetarian' | 'pescatarian' | 'omnivore' | 'gluten_free')[];
  notes?: string;
}

export interface NutrientProfile {
  id: string;
  aliases: string[];
  name: string;
  chemicalName?: string;
  type: 'vitamin' | 'mineral' | 'fatty_acid' | 'amino_acid';
  whatItDoesInBody: string[];
  rdaAdults: string;
  deficiencyRisks: string[];
  foodSourcesSorted: NutrientFoodSource[]; // sorted descending by dailyValuePercentage
  consumptionAndBioavailabilityAdvice: string[];
  interactionTips?: string[];
}

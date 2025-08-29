export interface PlantStep {
  id: string;
  title: string;
  description: string;
  duration: string; // "10 minutes", "2 days", etc.
  materials?: string[];
  tips?: string[];
  imageUrl?: string;
}

export interface CareTask {
  week: number;
  day?: number;
  task: string;
  description: string;
  frequency: string; // "daily", "weekly", "once"
}

export interface TroubleshootingItem {
  problem: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
}

export interface NutritionInfo {
  calories: number; // per 100g
  nutrients: {
    vitamin_c?: number;
    vitamin_k?: number;
    folate?: number;
    fiber?: number;
    [key: string]: number | undefined;
  };
  benefits: string[];
}

export interface EstimatedSavings {
  averagePrice: number; // per kg at supermarket
  yield: number; // kg per plant
  cycles: number; // harvests per year
  totalSavingPerYear: number;
}

export interface EducationalPlant {
  id: string;
  name: string;
  scientificName: string;
  category: 'leafy-greens' | 'fruits' | 'herbs' | 'root-vegetables' | 'legumes';
  difficulty: 'easy' | 'medium' | 'hard';
  growthTime: number; // days from seed to harvest
  spaceRequired: 'small' | 'medium' | 'large';
  imageUrl?: string; // URL de la imagen en Firebase Storage
  
  // Basic info
  basicInfo: {
    description: string;
    whyGrow: string[];
    bestFor: string[]; // ["beginners", "small spaces", "quick results"]
    spacing: string; // "10cm between plants"
    sunlight: string; // "6-8 hours direct sun"
    water: string; // "Keep soil moist but not soggy"
  };

  // Step-by-step growing guide
  growingSteps: PlantStep[];
  
  // Care calendar
  careCalendar: CareTask[];
  
  // Troubleshooting
  troubleshooting: TroubleshootingItem[];
  
  // Harvest info
  harvestingGuide: {
    whenToHarvest: string;
    howToHarvest: string;
    signs: string[];
    storage: string;
    shelfLife: string;
  };

  // Nutritional value
  nutrition: NutritionInfo;
  
  // Economic impact
  estimatedSavings: EstimatedSavings;

  // Media (soporta ambos formatos)
  images: {
    main?: string; // Formato anterior
    mainPath?: string; // Formato nuevo
    gallery?: string[];
    galleryPaths?: string[]; // Formato nuevo
    stepPhotos?: { [stepId: string]: string };
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
} 
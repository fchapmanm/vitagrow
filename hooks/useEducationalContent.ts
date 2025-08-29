import { useState, useEffect } from 'react';
import { EducationalPlantsService } from '../services/educationalPlantsService';
import { EducationalPlant } from '../types/plant-education';

interface EducationalTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  plantSource: string;
}

interface PlantGuide {
  id: string;
  title: string;
  difficulty: string;
  time: string;
  icon: string;
  plantName: string;
  steps: number;
}

interface UseEducationalContentReturn {
  dailyTips: EducationalTip[];
  plantGuides: PlantGuide[];
  loading: boolean;
  error: string | null;
}

export const useEducationalContent = (): UseEducationalContentReturn => {
  const [dailyTips, setDailyTips] = useState<EducationalTip[]>([]);
  const [plantGuides, setPlantGuides] = useState<PlantGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEducationalContent = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las plantas educativas
        const plants = await EducationalPlantsService.getAllEducationalPlants();
        
        if (plants.length === 0) {
          // Sin contenido: no es un error; dejamos fallback en la UI
          setDailyTips([]);
          setPlantGuides([]);
          setError(null);
          return;
        }

        // Extraer tips de los growing steps y troubleshooting
        const extractedTips: EducationalTip[] = [];
        const extractedGuides: PlantGuide[] = [];

        plants.forEach((plant: EducationalPlant) => {
          // Extraer tips de growing steps (defensivo)
          const steps = Array.isArray(plant.growingSteps) ? plant.growingSteps : [];
          steps.forEach((step, index) => {
            if (step.tips && step.tips.length > 0) {
              step.tips.forEach((tip, tipIndex) => {
                extractedTips.push({
                  id: `${plant.id}-step-${index}-tip-${tipIndex}`,
                  title: step.title,
                  description: tip,
                  icon: getPlantIcon(plant.category || '' as any),
                  plantSource: plant.name
                });
              });
            }
          });

          // Crear guía de planta
          extractedGuides.push({
            id: plant.id,
            title: `How to grow ${plant.name}`,
            difficulty: plant.difficulty === 'easy' ? 'Beginner' : 
                       plant.difficulty === 'medium' ? 'Intermediate' : 'Advanced',
            time: plant.growthTime && plant.growthTime > 0 ? `${Math.ceil(plant.growthTime / 7)} weeks` : '—',
            icon: getPlantIcon(plant.category || '' as any),
            plantName: plant.name,
            steps: steps.length
          });
        });

        // Limitar a los tips más útiles (máximo 5)
        const topTips = extractedTips.slice(0, 5);
        
        setDailyTips(topTips);
        setPlantGuides(extractedGuides);
        setError(null);
        
      } catch (err) {
        setError('Failed to load educational content');
      } finally {
        setLoading(false);
      }
    };

    loadEducationalContent();
  }, []);

  return {
    dailyTips,
    plantGuides,
    loading,
    error
  };
};

// Helper function to get icon based on plant category
const getPlantIcon = (category: string): string => {
  switch (category) {
    case 'leafy-greens': return '🥬';
    case 'fruits': return '🍅';
    case 'herbs': return '🌿';
    case 'root-vegetables': return '🥕';
    case 'legumes': return '🫘';
    default: return '🌱';
  }
}; 
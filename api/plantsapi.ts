import { EducationalPlantsService } from '../services/educationalPlantsService';
import { getImageURL } from '../services/storageService';

// Nuevo: Buscar en plantas educativas de Firestore
export async function fetchEducationalPlants(searchTerm: string = ''): Promise<any[]> {
  try {
    // Obtener todas las plantas educativas
    const educationalPlants = await EducationalPlantsService.getAllEducationalPlants();
    
    if (educationalPlants.length === 0) {
      return [];
    }
    
    // Si no hay término de búsqueda, devolver todas
    if (!searchTerm.trim()) {
      const formatted = await Promise.all(educationalPlants.map(async plant => {
        // Obtener URL de la imagen
        const imagePath = plant.images?.mainPath || plant.images?.main || '';
        const imageUrl = await getImageURL(imagePath);
        
        return {
          id: plant.id,
          common_name: plant.name,
          scientific_name: plant.scientificName,
          default_image: {
            thumbnail: imageUrl
          },
          category: plant.category,
          difficulty: plant.difficulty,
          growthTime: plant.growthTime,
          spaceRequired: plant.spaceRequired,
          educationalData: plant
        };
      }));
      return formatted;
    }
    
    // Filtrar por término de búsqueda
    const filteredPlants = educationalPlants.filter(plant => 
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Convertir al formato esperado
    const formatted = await Promise.all(filteredPlants.map(async plant => {
      // Obtener URL de la imagen
      const imagePath = plant.images?.mainPath || plant.images?.main || '';
      const imageUrl = await getImageURL(imagePath);
      
      return {
        id: plant.id,
        common_name: plant.name,
        scientific_name: plant.scientificName,
        default_image: {
          thumbnail: imageUrl
        },
        category: plant.category,
        difficulty: plant.difficulty,
        growthTime: plant.growthTime,
        spaceRequired: plant.spaceRequired,
        educationalData: plant
      };
    }));
    
    return formatted;
    
  } catch (error) {
    return [];
  }
}

// Función original - AHORA SOLO USA PLANTAS EDUCATIVAS
export async function fetchPlants(searchTerm: string): Promise<any[]> {
  try {
    // SOLO usar plantas educativas - sin fallback
    const educationalPlants = await fetchEducationalPlants(searchTerm);
    return educationalPlants;
  } catch (error) {
    return [];
  }
}
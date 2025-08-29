import { 
  collection, 
  doc, 
  setDoc, 
  getDocFromServer, 
  getDocsFromServer,
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import { EducationalPlant } from '../types/plant-education';

const EDUCATIONAL_PLANTS_COLLECTION = 'educational_plants';

export class EducationalPlantsService {
  
  /**
   * Sube o actualiza una planta educativa en Firestore
   */
  static async addEducationalPlant(plantData: EducationalPlant): Promise<void> {
    try {
      const plantRef = doc(firestore, EDUCATIONAL_PLANTS_COLLECTION, plantData.id);
      await setDoc(plantRef, {
        ...plantData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Planta guardada: ${plantData.name} (${plantData.id})`);
    } catch (error) {
      console.error('❌ Error al agregar planta educativa:', error);
      throw error;
    }
  }

  /**
   * Obtiene una planta educativa por ID (desde servidor, sin cache)
   */
  static async getEducationalPlant(plantId: string): Promise<EducationalPlant | null> {
    try {
      const plantRef = doc(firestore, EDUCATIONAL_PLANTS_COLLECTION, plantId);
      const plantDoc = await getDocFromServer(plantRef);
      
      if (plantDoc.exists()) {
        return { id: plantDoc.id, ...plantDoc.data() } as EducationalPlant;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener planta educativa:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las plantas educativas (fresco del servidor)
   */
  static async getAllEducationalPlants(): Promise<EducationalPlant[]> {
    try {
      const plantsRef = collection(firestore, EDUCATIONAL_PLANTS_COLLECTION);
      const plantsQuery = query(plantsRef, orderBy('name'));
      const snapshot = await getDocsFromServer(plantsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EducationalPlant));
    } catch (error) {
      console.error('❌ Error al obtener todas las plantas:', error);
      throw error;
    }
  }

  /**
   * Obtiene plantas por dificultad (fresh del servidor)
   */
  static async getPlantsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<EducationalPlant[]> {
    try {
      const plantsRef = collection(firestore, EDUCATIONAL_PLANTS_COLLECTION);
      const plantsQuery = query(
        plantsRef, 
        where('difficulty', '==', difficulty),
        orderBy('name')
      );
      const snapshot = await getDocsFromServer(plantsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EducationalPlant));
    } catch (error) {
      console.error('❌ Error al obtener plantas por dificultad:', error);
      throw error;
    }
  }

  /**
   * Obtiene plantas por categoría (fresh del servidor)
   */
  static async getPlantsByCategory(category: string): Promise<EducationalPlant[]> {
    try {
      const plantsRef = collection(firestore, EDUCATIONAL_PLANTS_COLLECTION);
      const plantsQuery = query(
        plantsRef, 
        where('category', '==', category), // 🔧 corregido
        orderBy('name')
      );
      const snapshot = await getDocsFromServer(plantsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EducationalPlant));
    } catch (error) {
      console.error('❌ Error al obtener plantas por categoría:', error);
      throw error;
    }
  }
}

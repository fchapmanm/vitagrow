import { db, storage } from './firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import * as FileSystem from 'expo-file-system';

export type Plant = {
  id?: string;
  name: string;
  imageUrl?: string;
  plantingDate?: string;
  addedAt: string;
  isFavorite?: boolean;
  status?: 'planning' | 'growing';
  difficulty?: string;
  plantIn?: string;
  lastWatering?: string;
  place?: string;
  growthStage?: string;
};

export type Task = {
  id?: string;
  title: string;
  description?: string;
  icon: string;
  completed: boolean;
  dueDate?: string;
  plantId?: string;
  plantName?: string;
  createdAt: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'general';
};

// Guardar planta
export async function savePlant(user: User | null, isGuest: boolean, plant: Plant) {
  if (isGuest || !user) {
    const stored = await AsyncStorage.getItem('guestPlants');
    const guestPlants = stored ? JSON.parse(stored) : [];

    if (guestPlants.length >= 3) {
      throw new Error('GuestLimitExceeded');
    }

    const plantWithId = {
      ...plant,
      id: Date.now().toString(),
    };

    guestPlants.push(plantWithId);
    await AsyncStorage.setItem('guestPlants', JSON.stringify(guestPlants));
    return;
  }

  const plantsRef = collection(db, 'users', user.uid, 'plants');
  await addDoc(plantsRef, plant);
}

// Función para limpiar plantas sin ID en AsyncStorage
const cleanPlantsWithoutId = async () => {
  const stored = await AsyncStorage.getItem('guestPlants');
  if (stored) {
    const plants = JSON.parse(stored);
    const validPlants = plants.filter((p: any) => p.id);
    if (validPlants.length !== plants.length) {
      await AsyncStorage.setItem('guestPlants', JSON.stringify(validPlants));
    }
  }
};

// Obtener plantas
export async function fetchUserPlants(user: User | null, isGuest: boolean): Promise<Plant[]> {
  if (isGuest || !user) {
    // Limpiar plantas sin ID antes de cargar
    await cleanPlantsWithoutId();
    
    const stored = await AsyncStorage.getItem('guestPlants');
    const plants = stored ? JSON.parse(stored) : [];
    return plants;
  }

  const plantsRef = collection(db, 'users', user.uid, 'plants');
  const snapshot = await getDocs(plantsRef);
  const plants = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Plant[];
  return plants;
}

// Eliminar planta
export const deletePlantById = async (id: string, isGuest: boolean, user?: User | null) => {
  if (isGuest || !user) {
    const stored = await AsyncStorage.getItem('guestPlants');
    const plants = stored ? JSON.parse(stored) : [];
    const filtered = plants.filter((p: any) => p.id !== id);
    await AsyncStorage.setItem('guestPlants', JSON.stringify(filtered));
    return;
  }

  await deleteDoc(doc(db, 'users', user.uid, 'plants', id));
};

// Subir imagen a Firebase Storage
export async function uploadPlantImage(user: User, imageUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const timestamp = Date.now();
    const fileName = `plants/${user.uid}/${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, bytes, {
      contentType: 'image/jpeg',
    });

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

// Obtener tareas del usuario
export async function fetchUserTasks(user: User | null, isGuest: boolean): Promise<Task[]> {
  if (isGuest || !user) {
    const stored = await AsyncStorage.getItem('guestTasks');
    const tasks = stored ? JSON.parse(stored) : [];
    return tasks;
  }

  const tasksRef = collection(db, 'users', user.uid, 'tasks');
  const snapshot = await getDocs(tasksRef);
  const tasks = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
  return tasks;
}

// Generar tareas automáticas basadas en las plantas del usuario
export async function generateTasksFromPlants(user: User | null, isGuest: boolean): Promise<Task[]> {
  const plants = await fetchUserPlants(user, isGuest);
  const tasks: Task[] = [];

  plants.forEach(plant => {
    if (plant.status === 'growing') {
      // Tarea de riego (cada 2 días)
      tasks.push({
        title: `Water your ${plant.name}`,
        description: `Time to water your ${plant.name}`,
        icon: '💧',
        completed: false,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        plantId: plant.id,
        plantName: plant.name,
        createdAt: new Date().toISOString(),
        type: 'watering'
      });

      // Tarea de fertilización (cada semana)
      tasks.push({
        title: `Fertilize your ${plant.name}`,
        description: `Your ${plant.name} needs nutrients`,
        icon: '🌱',
        completed: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        plantId: plant.id,
        plantName: plant.name,
        createdAt: new Date().toISOString(),
        type: 'fertilizing'
      });
    }
  });

  return tasks;
}

// Obtener recordatorios de hoy
export async function fetchTodayReminders(user: User | null, isGuest: boolean): Promise<Task[]> {
  const allTasks = await fetchUserTasks(user, isGuest);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return allTasks.filter(task => {
    if (task.completed) return false;
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() <= today.getTime();
    }
    
    return true; // Tareas sin fecha de vencimiento
  }).slice(0, 3); // Máximo 3 recordatorios
}

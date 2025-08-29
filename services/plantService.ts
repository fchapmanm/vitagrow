import { firestore, storage } from './firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, setDoc } from 'firebase/firestore';
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
  taskName: string;
  description?: string;
  icon?: string;
  completed: boolean;
  dueDate?: string;
  plantId?: string;
  plantName?: string;
  createdAt: string;
  userId?: string;
  type?: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'general';
  week?: string; // Para tareas del growing guide (ej: "Week 1-2")
  category?: string; // Para categorizar tareas del growing guide
  xp?: number; // Para gamificación
};

// Verificar si usuario freemium puede agregar más plantas únicas
export async function checkFreemiumPlantLimit(plantName: string, isGuest: boolean): Promise<void> {
  if (!isGuest) return; // Usuarios registrados no tienen límite

  const MAX_UNIQUE_PLANTS_FREE = 50; // Aumentado para testing
  
  // Obtener historial de plantas vistas
  const viewedPlantsStored = await AsyncStorage.getItem('viewedPlantsHistory');
  const viewedPlants: string[] = viewedPlantsStored ? JSON.parse(viewedPlantsStored) : [];
  
  const plantNameLower = plantName.toLowerCase();
  
  // Si ya vio esta planta antes, no hay problema
  if (viewedPlants.includes(plantNameLower)) {
    return;
  }
  
  // Si sería la planta única #6+, bloquear
  if (viewedPlants.length >= MAX_UNIQUE_PLANTS_FREE) {
    throw new Error('FreemiumPlantLimitExceeded');
  }
  
  // Agregar nueva planta al historial
  const updatedViewedPlants = [...viewedPlants, plantNameLower];
  await AsyncStorage.setItem('viewedPlantsHistory', JSON.stringify(updatedViewedPlants));
}

// Obtener información del límite freemium
export async function getFreemiumPlantInfo(isGuest: boolean): Promise<{viewedCount: number, maxAllowed: number, plantsViewed: string[]}> {
  if (!isGuest) {
    return { viewedCount: 0, maxAllowed: Infinity, plantsViewed: [] };
  }
  
  const MAX_UNIQUE_PLANTS_FREE = 50; // Aumentado para testing
  const viewedPlantsStored = await AsyncStorage.getItem('viewedPlantsHistory');
  const plantsViewed: string[] = viewedPlantsStored ? JSON.parse(viewedPlantsStored) : [];
  
  return {
    viewedCount: plantsViewed.length,
    maxAllowed: MAX_UNIQUE_PLANTS_FREE,
    plantsViewed
  };
}

// Guardar planta
export async function savePlant(user: User | null, isGuest: boolean, plant: Plant): Promise<Plant> {
  if (isGuest || !user) {
    // 1. Verificar límite de plantas únicas vistas
    await checkFreemiumPlantLimit(plant.name, isGuest);
    
    const stored = await AsyncStorage.getItem('guestPlants');
    const guestPlants = stored ? JSON.parse(stored) : [];

    // 2. Solo verificar límite para plantas con status 'growing'
    if (plant.status === 'growing') {
      const growingPlants = guestPlants.filter((p: any) => p.status === 'growing');
      if (growingPlants.length >= 3) {
        throw new Error('GrowingLimitExceeded');
      }
    }

    const plantWithId = {
      ...plant,
      id: Date.now().toString(),
    };

    guestPlants.push(plantWithId);
    await AsyncStorage.setItem('guestPlants', JSON.stringify(guestPlants));
    return plantWithId;
  }

  const plantsRef = collection(firestore, 'users', user.uid, 'plants');
  const docRef = await addDoc(plantsRef, plant);
  
  // Retornar la planta con el ID generado por Firestore
  return {
    ...plant,
    id: docRef.id
  };
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

  const plantsRef = collection(firestore, 'users', user.uid, 'plants');
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

  await deleteDoc(doc(firestore, 'users', user.uid, 'plants', id));
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

  try {
    // Use Firestore query to filter tasks by userId on the server side
    const tasksRef = collection(firestore, 'tasks');
    const userTasksQuery = query(tasksRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(userTasksQuery);
    
    
    
    const userTasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
    

    return userTasks;
      } catch (error) {
      return [];
    }
}





// Función eliminada: generateTasksFromPlants
// Las tareas ahora se generan únicamente a través de generateGrowingGuideTasks
// que proporciona tareas más específicas y útiles basadas en el careCalendar

// Limpiar tareas duplicadas genéricas (riego y fertilización básicas)
export async function cleanupDuplicateTasks(user: User | null, isGuest: boolean): Promise<void> {
  try {
    const tasks = await fetchUserTasks(user, isGuest);
    
    // Identificar tareas genéricas duplicadas
    const duplicateTasks = tasks.filter(task => 
      (task.taskName?.includes('Water your') && task.type === 'watering') ||
      (task.taskName?.includes('Fertilize your') && task.type === 'fertilizing')
    );
    
    if (duplicateTasks.length === 0) {
      return;
    }
    
    // Eliminar tareas duplicadas
    for (const task of duplicateTasks) {
      if (isGuest || !user) {
        // Para usuarios invitados, limpiar de AsyncStorage
        const stored = await AsyncStorage.getItem('guestTasks');
        const guestTasks = stored ? JSON.parse(stored) : [];
        const cleanedTasks = guestTasks.filter((t: any) => t.id !== task.id);
        await AsyncStorage.setItem('guestTasks', JSON.stringify(cleanedTasks));
      } else if (task.id) {
        // Para usuarios autenticados, eliminar de Firestore
        await deleteDoc(doc(firestore, 'tasks', task.id));
      }
    }
  } catch (error) {
    // Error silencioso
  }
}

// Calcular qué semana de crecimiento está una planta
function getPlantWeek(plantingDate: string): number {
  const planted = new Date(plantingDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - planted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7); // Convertir días a semanas
}

// Determinar si una tarea es relevante para la semana actual
function isTaskRelevantForCurrentWeek(task: Task, currentWeek: number): boolean {
  if (!task.week) return true; // Tareas sin semana específica siempre son relevantes
  
  // Extraer rango de semanas de la tarea (ej: "Week 1-2", "Week 3-4")
  const weekMatch = task.week.match(/Week (\d+)(?:-(\d+))?/);
  if (!weekMatch) return true;
  
  const startWeek = parseInt(weekMatch[1]);
  const endWeek = weekMatch[2] ? parseInt(weekMatch[2]) : startWeek;
  
  // Mostrar tareas si estamos en el rango o cerca (±1 semana)
  return currentWeek >= (startWeek - 1) && currentWeek <= (endWeek + 1);
}

// Función para limpiar tareas huérfanas (sin plantas correspondientes)
export async function cleanupOrphanedTasks(
  user: User | null, 
  isGuest: boolean, 
  existingTasks?: Task[], 
  existingPlants?: Plant[]
): Promise<void> {

  
  try {
    // Usar datos existentes si están disponibles, sino hacer fetch
    const [userTasks, userPlants] = existingTasks && existingPlants ? 
      [existingTasks, existingPlants] : 
      await Promise.all([
        fetchUserTasks(user, isGuest),
        fetchUserPlants(user, isGuest)
      ]);
    
    // Crear set de IDs de plantas del usuario
    const plantIds = new Set(userPlants.map(plant => plant.id).filter(Boolean));

    
    // Encontrar tareas que referencian plantas que ya no existen
    const orphanedTasks = userTasks.filter(task => 
      task.plantId && !plantIds.has(task.plantId)
    );
    

    
    if (orphanedTasks.length === 0) {

      return;
    }
    
    // Eliminar tareas huérfanas
    for (const task of orphanedTasks) {
      if (isGuest || !user) {
        // Limpiar de AsyncStorage
        const stored = await AsyncStorage.getItem('guestTasks');
        const tasks = stored ? JSON.parse(stored) : [];
        const cleanedTasks = tasks.filter((t: any) => t.id !== task.id);
        await AsyncStorage.setItem('guestTasks', JSON.stringify(cleanedTasks));
      } else if (task.id) {
        // Eliminar de Firestore
        await deleteDoc(doc(firestore, 'tasks', task.id));
      }
    }
    
    
      } catch (error) {
      // Error silencioso - no critical
    }
}

// Obtener recordatorios inteligentes y relevantes
export async function fetchTodayReminders(
  user: User | null, 
  isGuest: boolean, 
  existingTasks?: Task[], 
  existingPlants?: Plant[]
): Promise<Task[]> {

  
  try {
    // Si ya tenemos datos, úsalos. Si no, hacer fetch
    let allTasks = existingTasks;
    let userPlants = existingPlants;
    
    if (!allTasks || !userPlants) {
      const [fetchedTasks, fetchedPlants] = await Promise.all([
        allTasks ? Promise.resolve(allTasks) : fetchUserTasks(user, isGuest),
        userPlants ? Promise.resolve(userPlants) : fetchUserPlants(user, isGuest)
      ]);
      allTasks = fetchedTasks;
      userPlants = fetchedPlants;
    }
    
    // Solo limpiar si tenemos datos frescos (no pre-existentes)
    if (!existingTasks || !existingPlants) {
      await cleanupOrphanedTasks(user, isGuest, allTasks, userPlants);
      // También limpiar tareas duplicadas genéricas
      await cleanupDuplicateTasks(user, isGuest);
      // Recargar tareas después de la limpieza
      allTasks = await fetchUserTasks(user, isGuest);
    }
    

    
    // Filtrar solo tareas no completadas
    const activeTasks = allTasks.filter(task => !task.completed);

    
    // Crear mapa de plantas para obtener fechas de plantado
    const plantMap = new Map();
    userPlants.forEach(plant => {
      if (plant.id && plant.plantingDate) {
        plantMap.set(plant.id, plant);
      }
    });

    
    // Filtrar tareas que corresponden a plantas existentes
    const validTasks = activeTasks.filter(task => {
      // Si la tarea no tiene plantId, es una tarea general (válida)
      if (!task.plantId) return true;
      
      // Si tiene plantId, verificar que la planta existe
      const plantExists = userPlants.some(plant => plant.id === task.plantId);
      if (!plantExists) {

      }
      return plantExists;
    });
    
    
    
    // Filtrar tareas por ventana de recordatorio basada en dueDate (incluye vencidas y próximas 3 días)
    const today = new Date();
    const inThreeDays = new Date();
    inThreeDays.setDate(today.getDate() + 3);

    const relevantTasks = validTasks.filter(task => {
      if (!task.dueDate) return true; // si no hay dueDate, incluir por defecto
      const due = new Date(task.dueDate);
      if (isNaN(due.getTime())) return true; // fechas inválidas: incluir para no perderlas
      return due <= inThreeDays; // incluye vencidas (due < today), hoy y próximas 3 días
    });
    
    // Priorizar tareas críticas
    const priorityTasks = relevantTasks.sort((a, b) => {
      // Tareas manuales (sin week) tienen prioridad más alta
      if (!a.week && b.week) return -1;
      if (a.week && !b.week) return 1;
      
      // Priorizar por tipo de tarea
      const criticalKeywords = ['water', 'riego', 'fertiliz', 'pest'];
      const aIsCritical = criticalKeywords.some(keyword => 
        a.taskName.toLowerCase().includes(keyword)
      );
      const bIsCritical = criticalKeywords.some(keyword => 
        b.taskName.toLowerCase().includes(keyword)
      );
      
      if (aIsCritical && !bIsCritical) return -1;
      if (!aIsCritical && bIsCritical) return 1;
      
      // Por fecha de vencimiento
      return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
    });
    

    
    return priorityTasks.slice(0, 20); // Mostrar más para Reminder tab
  } catch (error) {
    return [];
  }
}

// Completar una tarea
export async function completeTask(taskId: string, user: User | null, isGuest: boolean): Promise<void> {


  if (isGuest || !user) {
    // Para usuarios invitados, actualizar en AsyncStorage
    const stored = await AsyncStorage.getItem('guestTasks');
    const tasks = stored ? JSON.parse(stored) : [];
    const updatedTasks = tasks.map((task: any) => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    await AsyncStorage.setItem('guestTasks', JSON.stringify(updatedTasks));
    
    return;
  }

  try {
    // Para usuarios autenticados, actualizar en Firestore
    const taskRef = doc(firestore, 'tasks', taskId);
    await updateDoc(taskRef, {
      completed: true,
      completedAt: new Date().toISOString()
    });
    
  } catch (error: any) {
    // Manejar el caso donde el documento no existe
    if (error?.code === 'not-found' || error?.message?.includes('No document to update')) {
      // No lanzar error para no interrumpir el flujo del usuario
      return;
    }
    throw error;
  }
}

// Generar tareas del growing guide automáticamente
export async function generateGrowingGuideTasks(plant: Plant, user: User | null, isGuest: boolean): Promise<void> {
  try {
    // Importar datos educativos de la planta
    const { EducationalPlantsService } = await import('./educationalPlantsService');
    const educationalPlants = await EducationalPlantsService.getAllEducationalPlants();
    
    // Encontrar la planta educativa correspondiente
    const educationalPlant = educationalPlants.find(p => 
      p.name.toLowerCase() === plant.name.toLowerCase()
    );
    
    const plantingDate = new Date(plant.plantingDate || new Date());
    const tasks: Task[] = [];

    if (!educationalPlant || !educationalPlant.careCalendar) {
      // NO usar fallback hardcodeado - solo datos reales de Firestore
      return; // No generar tareas sin datos reales
    }
    
    educationalPlant.careCalendar.forEach((care, index) => {
      const taskId = `growing-${plant.id || 'temp'}-week${care.week}-${index}`;
      
      // Calcular fecha de vencimiento basada en la semana
      const dueDate = new Date(plantingDate);
      dueDate.setDate(dueDate.getDate() + (care.week * 7));
      
      // Determinar icono basado en el tipo de tarea
      let icon = '🌱';
      const taskLower = care.task.toLowerCase();
      if (taskLower.includes('water') || taskLower.includes('moisture')) icon = '💧';
      else if (taskLower.includes('harvest')) icon = '✂️';
      else if (taskLower.includes('fertiliz') || taskLower.includes('feed')) icon = '🌿';
      else if (taskLower.includes('thin') || taskLower.includes('prune')) icon = '✂️';
      else if (taskLower.includes('flower')) icon = '🌸';

      const task: Task = {
        id: taskId,
        taskName: care.task,
        description: care.description || '',
        icon: icon,
        completed: false,
        dueDate: dueDate.toISOString(),
        plantId: plant.id,
        plantName: plant.name,
        createdAt: new Date().toISOString(),
        userId: user?.uid,
        type: 'general',
        week: `Week ${care.week}`,
        category: 'growing-guide',
        xp: 10 // XP por completar tareas del growing guide
      };

      tasks.push(task);
    });

    // Guardar tareas
    if (isGuest || !user) {
      // Para usuarios invitados, guardar en AsyncStorage
      const stored = await AsyncStorage.getItem('guestTasks');
      const existingTasks = stored ? JSON.parse(stored) : [];
      const allTasks = [...existingTasks, ...tasks];
      await AsyncStorage.setItem('guestTasks', JSON.stringify(allTasks));
    } else {
      // Para usuarios autenticados, guardar en Firestore con IDs personalizados
      const tasksRef = collection(firestore, 'tasks');
      const savePromises = tasks.map(task => {
        if (task.id) {
          // Usar setDoc con ID personalizado en lugar de addDoc
          return setDoc(doc(tasksRef, task.id), task);
        } else {
          // Fallback a addDoc si no hay ID personalizado
          return addDoc(tasksRef, task);
        }
      });
      await Promise.all(savePromises);
    }

    
    
  } catch (error) {
    console.error('Error generating growing guide tasks:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

// Actualizar el estado de una planta
export async function updatePlantStatus(
  id: string, 
  newStatus: 'planning' | 'growing', 
  isGuest: boolean, 
  user: User | null
): Promise<void> {
  if (isGuest || !user) {
    // Para usuarios invitados, actualizar en AsyncStorage
    const stored = await AsyncStorage.getItem('guestPlants');
    const plants = stored ? JSON.parse(stored) : [];
    
    const updatedPlants = plants.map((plant: any) => 
      plant.id === id ? { ...plant, status: newStatus } : plant
    );
    
    await AsyncStorage.setItem('guestPlants', JSON.stringify(updatedPlants));
  } else {
    // Para usuarios autenticados, actualizar en Firestore
    const plantRef = doc(firestore, `users/${user.uid}/plants/${id}`);
    await updateDoc(plantRef, { status: newStatus });
  }
}

// Toggle estado de una tarea (completar/descompletar)
export async function toggleTaskCompletion(taskId: string, currentStatus: boolean, user: User | null, isGuest: boolean): Promise<boolean> {
  const newStatus = !currentStatus;


  if (isGuest || !user) {
    // Para usuarios invitados, actualizar en AsyncStorage
    const stored = await AsyncStorage.getItem('guestTasks');
    const tasks = stored ? JSON.parse(stored) : [];
    const updatedTasks = tasks.map((task: any) => 
      task.id === taskId ? { 
        ...task, 
        completed: newStatus,
        completedAt: newStatus ? new Date().toISOString() : null
      } : task
    );
    await AsyncStorage.setItem('guestTasks', JSON.stringify(updatedTasks));
    
    return newStatus;
  }

  try {
    // Para usuarios autenticados, actualizar en Firestore
    const taskRef = doc(firestore, 'tasks', taskId);
    const updateData: any = {
      completed: newStatus
    };
    
    if (newStatus) {
      updateData.completedAt = new Date().toISOString();
    } else {
      updateData.completedAt = null;
    }
    
    await updateDoc(taskRef, updateData);
    
    return newStatus;
  } catch (error: any) {
    // Manejar el caso donde el documento no existe
    if (error?.code === 'not-found' || error?.message?.includes('No document to update')) {
      // Retornar el estado actual para no interrumpir el flujo del usuario
      return currentStatus;
    }
    throw error;
  }
}

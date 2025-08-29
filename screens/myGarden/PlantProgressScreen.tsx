import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../services/authContext';
import { completeTask, fetchUserTasks, toggleTaskCompletion } from '../../services/plantService';
import { EducationalPlantsService } from '../../services/educationalPlantsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';

type PlantTask = {
  id: string;
  week: string;
  category: string;
  task?: string;
  completed: boolean;
  xp: number;
  plantId?: string;
  taskName?: string;
  dueDate?: string;
  description?: string;
};

type Plant = {
  id?: string;
  name: string;
  imageUrl?: string;
  plantingDate?: string;
};

// Las tareas ahora se obtienen del careCalendar de Firestore

export default function PlantProgressScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { plant } = route.params;
  const { user, isGuest } = useAuth();

  const [tasks, setTasks] = useState<PlantTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [plantDescription, setPlantDescription] = useState<string | null>(null);

  const getWeekNumber = (week?: string): number => {
    if (!week) return Number.MAX_SAFE_INTEGER;
    const m = week.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
  };

  // Helper to deduplicate tasks by (week + task name)
  const dedupeTasks = (list: PlantTask[]): PlantTask[] => {
    const map = new Map<string, PlantTask>();
    for (const t of list) {
      const key = `${t.week}|${(t.taskName || t.task || '').toString().trim()}`;
      if (!map.has(key)) map.set(key, t);
    }
    return Array.from(map.values());
  };

  useEffect(() => {
    loadPlantTasks();
  }, [plant.id]);

  // Load plant description from educational data (Firestore) safely
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const allPlants = await EducationalPlantsService.getAllEducationalPlants();
        const plantData = allPlants.find(p => p.name?.toLowerCase() === plant.name?.toLowerCase());
        if (isMounted && plantData?.basicInfo?.description) {
          setPlantDescription(plantData.basicInfo.description);
        }
      } catch (_) {
        // silent fail – keep UI working even if description is unavailable
      }
    })();
    return () => { isMounted = false; };
  }, [plant?.name]);

  const loadPlantTasks = async () => {
    try {
      setLoading(true);
      
      // Buscar tareas existentes para esta planta
      let existingTasks: PlantTask[] = [];
      
      if (isGuest || !user) {
        // Para usuarios invitados, buscar en AsyncStorage
        const stored = await AsyncStorage.getItem('guestTasks');
        const allTasks = stored ? JSON.parse(stored) : [];
        existingTasks = allTasks.filter((task: any) => 
          task.plantId === plant.id && task.taskName && task.week
        );
      } else {
        // Para usuarios autenticados, buscar en Firestore
        const q = query(
          collection(firestore, 'tasks'),
          where('plantId', '==', plant.id),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        existingTasks = querySnapshot.docs
          .map(doc => ({ ...(doc.data() as any), id: doc.id } as PlantTask))
          .filter(task => task.week); // Solo tareas del guide que tienen 'week'
      }

      // Si no hay tareas del guide, crear las tareas por defecto
      if (existingTasks.length === 0) {
        await createDefaultTasks();
      } else {
        // Ordenar por semana ascendente y evitar duplicados visuales
        const sorted = dedupeTasks(existingTasks).slice().sort((a, b) => getWeekNumber(a.week) - getWeekNumber(b.week));
        setTasks(sorted);
      }
    } catch (error) {
      console.error('Error loading plant tasks:', error);
      // Si hay error, crear tareas por defecto
      await createDefaultTasks();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fuerza la recarga de tareas desde Firestore
   * Útil cuando se sospecha que hay datos en cache
   */
  const forceRefreshFromFirestore = async () => {
    try {
      console.log('🔄 Forzando recarga desde Firestore...');
      setLoading(true);
      
      // Limpiar tareas existentes
      setTasks([]);
      
      // Recrear tareas desde Firestore
      await createDefaultTasks();
      
      console.log('✅ Recarga forzada completada');
    } catch (error) {
      console.error('❌ Error en recarga forzada:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTasks = async () => {
    try {
      console.log('🔄 Creando tareas basadas en datos reales de Firestore...');
      
      // PRIMERO: Intentar obtener el careCalendar real de Firestore
      let realCareCalendar: any[] = [];
      
      try {
        // Antes de crear, validar si ya existen tareas para esta planta y usuario (evitar duplicados)
        let already: PlantTask[] = [];
        if (isGuest || !user) {
          const stored = await AsyncStorage.getItem('guestTasks');
          const all = stored ? JSON.parse(stored) : [];
          already = all.filter((t: any) => t.plantId === plant.id && t.week);
        } else {
          const q = query(
            collection(firestore, 'tasks'),
            where('plantId', '==', plant.id),
            where('userId', '==', user.uid)
          );
          const qs = await getDocs(q);
          already = qs.docs.map(d => ({ ...(d.data() as any), id: d.id } as PlantTask)).filter(t => t.week);
        }
        if (already.length > 0) {
          // Ya existen tareas: solo mostrarlas ordenadas y sin duplicados
          const sorted = dedupeTasks(already).slice().sort((a, b) => getWeekNumber(a.week) - getWeekNumber(b.week));
          setTasks(sorted);
          return;
        }

        const allPlants = await EducationalPlantsService.getAllEducationalPlants();
        const plantData = allPlants.find(p => 
          p.name.toLowerCase() === plant.name.toLowerCase()
        );
        
        if (plantData && plantData.careCalendar && plantData.careCalendar.length > 0) {
          console.log(`✅ Encontrado careCalendar real para ${plant.name}:`, plantData.careCalendar.length, 'tareas');
          realCareCalendar = plantData.careCalendar;
          setUsingRealData(true);
        } else {
          console.log(`⚠️ No se encontró careCalendar para ${plant.name}, usando tareas genéricas`);
          setUsingRealData(false);
        }
      } catch (error) {
        console.log('⚠️ Error obteniendo careCalendar, usando tareas genéricas:', error);
      }
      
      // Si no hay careCalendar real, usar tareas genéricas como fallback
      const taskTemplates = realCareCalendar.length > 0 ? realCareCalendar : [
        { week: 1, task: "Daily watering check", category: "Care", xp: 10 },
        { week: 2, task: "Monitor for pests", category: "Care", xp: 10 },
        { week: 3, task: "First feeding", category: "Care", xp: 15 },
        { week: 4, task: "Pruning and maintenance", category: "Care", xp: 15 },
        { week: 6, task: "Support and fertilizing", category: "Care", xp: 20 },
        { week: 8, task: "Growth monitoring", category: "Care", xp: 15 },
        { week: 10, task: "Harvest preparation", category: "Harvest", xp: 25 },
      ];

      const newTasks: PlantTask[] = [];
      const plantedAt = plant.plantingDate ? new Date(plant.plantingDate) : new Date();

      for (const taskTemplate of taskTemplates) {
        const due = new Date(plantedAt);
        due.setDate(due.getDate() + taskTemplate.week * 7);

        const taskData = {
          userId: user?.uid || 'guest',
          plantId: plant.id,
          plantName: plant.name,
          taskName: taskTemplate.task,
          week: `Week ${taskTemplate.week}`,
          category: taskTemplate.category || 'Care',
          task: taskTemplate.task,
          xp: taskTemplate.xp || 10,
          dueDate: due.toISOString(),
          createdAt: new Date().toISOString(),
          completed: false,
        };

        if (isGuest || !user) {
          // Guardar en AsyncStorage
          const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const newTask = { ...taskData, id };
          newTasks.push(newTask);
        } else {
          // Guardar en Firestore
          const docRef = await addDoc(collection(firestore, 'tasks'), taskData);
          newTasks.push({ ...taskData, id: docRef.id });
        }
      }

      if (isGuest || !user) {
        // Guardar todas las tareas en AsyncStorage evitando duplicados
        const stored = await AsyncStorage.getItem('guestTasks');
        const allTasks = stored ? JSON.parse(stored) : [];
        const existingKeys = new Set(
          allTasks
            .filter((t: any) => t.plantId === plant.id)
            .map((t: any) => `${t.week}|${(t.taskName || t.task || '').toString().trim()}`)
        );
        const toAppend = newTasks.filter(t => !existingKeys.has(`${t.week}|${(t.taskName || t.task || '').toString().trim()}`));
        allTasks.push(...toAppend);
        await AsyncStorage.setItem('guestTasks', JSON.stringify(allTasks));
      }

      // Ordenar por semana y mostrar sin duplicados
      const sorted = dedupeTasks(newTasks).slice().sort((a, b) => getWeekNumber(a.week) - getWeekNumber(b.week));
      setTasks(sorted);
      
      console.log(`✅ Tareas creadas: ${newTasks.length} tareas para ${plant.name}`);
    } catch (error) {
      console.error('Error creating tasks:', error);
      setTasks([]);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      // Encontrar la tarea actual para obtener su estado
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return;
      
      // Toggle el estado usando la función real del sistema
      const newCompletedStatus = await toggleTaskCompletion(
        taskId, 
        currentTask.completed, 
        user, 
        isGuest
      );
      
      // Actualizar estado local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: newCompletedStatus } : task
        )
      );
    } catch (error) {
      // Error silencioso
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Agrupar tareas por categoría
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, PlantTask[]>);

  const renderTaskItem = (task: PlantTask) => (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskItem, task.completed && styles.taskCompleted]}
      onPress={() => toggleTask(task.id)}
    >
      <View style={styles.taskContent}>
        <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
          {(() => {
            // Subtle scale+fade animation for the check icon when a task is completed
            if (!task.completed) return null;
            const anim = new Animated.Value(0);
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
            const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
            return (
              <Animated.View style={{ opacity: anim, transform: [{ scale }] }}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </Animated.View>
            );
          })()}
        </View>
        <View style={styles.taskTextContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
              {task.taskName || task.task || 'Task'}
            </Text>
            <View style={styles.weekChip}>
              <Text style={styles.weekChipText}>{task.week}</Text>
            </View>
          </View>
          {!!task.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>+{task.xp} XP</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growing Guide</Text>
        {/* Removed refresh button per request */}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a7c59" />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : (
          <>
        {/* Plant Info */}
        <View style={styles.plantInfo}>
          <View style={styles.plantImageContainer}>
            {plant.imageUrl ? (
              <Image source={{ uri: plant.imageUrl }} style={styles.plantImage} />
            ) : (
              <View style={styles.plantImagePlaceholder}>
                <Ionicons name="leaf-outline" size={32} color="#10b981" />
              </View>
            )}
          </View>
          <View style={styles.plantDetails}>
            <Text style={styles.plantName}>🌱 {plant.name}</Text>
            <Text style={styles.progressText}>
              Progress: {completedTasks}/{totalTasks} tasks
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>
            
            {/* Removed generic data banner - not useful for users */}
          </View>
        </View>

        {/* About section from educational data */}
        {plantDescription && (
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About this plant</Text>
            <Text style={styles.aboutText}>{plantDescription}</Text>
          </View>
        )}

        {/* Tasks by Category */}
        {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>📚 {category}</Text>
              <Text style={styles.categoryProgress}>
                {categoryTasks.filter(t => t.completed).length}/{categoryTasks.length}
              </Text>
            </View>
            {categoryTasks.map(renderTaskItem)}
          </View>
        ))}

        {/* Completion Message */}
        {completedTasks === totalTasks && totalTasks > 0 && (
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Congratulations!</Text>
            <Text style={styles.completionText}>
              You've completed all growing tasks for {plant.name}!
            </Text>
          </View>
        )}
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Plant info styles
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 8,
  },
  plantImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  plantImage: {
    width: 80,
    height: 80,
  },
  plantImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantDetails: {
    flex: 1,
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  plantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  
  // Category styles
  categorySection: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryProgress: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Task styles
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  taskCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  weekChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  weekChipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 2,
  },
  taskTextCompleted: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  taskWeek: {
    fontSize: 12,
    color: '#9ca3af',
  },
  xpBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
  },
  
  // Completion styles
  completionCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Data source badge styles
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  dataSourceText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 
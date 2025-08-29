import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../services/authContext';
import { deletePlantById, fetchUserTasks } from '../../services/plantService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';

type Plant = {
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

interface GrowingCardProps {
  plant: Plant;
  onDeleteSuccess: () => void;
  refreshTrigger?: number; // Para forzar actualización cuando cambian las tareas
}

export default function GrowingCard({ plant, onDeleteSuccess, refreshTrigger }: GrowingCardProps) {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  const [plantTasks, setPlantTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPlantTasks();
  }, [plant.id, refreshTrigger]); // Se actualiza cuando cambia refreshTrigger

  const loadPlantTasks = async () => {
    try {
      if (isGuest || !user) {
        // Para usuarios invitados, buscar en AsyncStorage
        const stored = await AsyncStorage.getItem('guestTasks');
        const allTasks = stored ? JSON.parse(stored) : [];
        const tasks = allTasks.filter((task: any) => 
          task.plantId === plant.id && task.week // Solo tareas del growing guide
        );
        setPlantTasks(tasks);
      } else {
        // Para usuarios autenticados, buscar en Firestore
        const q = query(
          collection(firestore, 'tasks'),
          where('plantId', '==', plant.id),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
                 const tasks = querySnapshot.docs
           .map(doc => ({ id: doc.id, ...doc.data() }))
           .filter((task: any) => task.week); // Solo tareas del growing guide
        setPlantTasks(tasks);
      }
    } catch (error) {
      console.error('Error loading plant tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!plant.id) {
                Alert.alert('Error', 'Plant ID is missing');
                return;
              }
              
              await deletePlantById(plant.id, isGuest, user);
              onDeleteSuccess();
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Failed to delete plant');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysPlanted = (plantingDate?: string) => {
    if (!plantingDate) return { days: 0, text: 'Recently planted' };
    
    const planted = new Date(plantingDate);
    const today = new Date();
    
    // Validar que la fecha sea válida
    if (isNaN(planted.getTime())) {
      return { days: 0, text: 'Recently planted' };
    }
    
    const diffTime = Math.abs(today.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Proteger contra fechas futuras
    if (diffDays < 0) {
      return { days: 0, text: 'Recently planted' };
    }
    
    return { 
      days: diffDays, 
      text: diffDays === 1 ? '1 day ago' : `${diffDays} days ago` 
    };
  };

  const getGrowthProgress = (days: number, completedTasks: number, totalTasks: number) => {
    // Progreso basado en tareas completadas + tiempo mínimo
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Determinar etapa basada en progreso de tareas Y días mínimos
    let stage = 'Germination';
    let minPercentage = 0;
    
    if (taskProgress >= 75 && days >= 21) {
      stage = 'Mature';
      minPercentage = 90;
    } else if (taskProgress >= 50 && days >= 14) {
      stage = 'Vegetative';
      minPercentage = 60;
    } else if (taskProgress >= 25 && days >= 7) {
      stage = 'Seedling';
      minPercentage = 30;
    } else {
      stage = 'Germination';
      minPercentage = 0;
    }
    
    // El progreso es el mayor entre el progreso de tareas y el mínimo para la etapa
    const finalPercentage = Math.max(taskProgress, minPercentage);
    
    return { 
      percentage: Math.min(finalPercentage, 100), 
      stage,
      taskProgress: Math.round(taskProgress)
    };
  };

  const getNextAction = (days: number, completedTasks: number, totalTasks: number) => {
    // Próxima acción basada en tareas pendientes
    const pendingTasks = totalTasks - completedTasks;
    
    if (totalTasks === 0) {
      return 'Tasks will appear soon';
    }
    
    if (pendingTasks > 0) {
      return `${pendingTasks} care task${pendingTasks !== 1 ? 's' : ''}`;
    }
    
    // Si no hay tareas pendientes, dar consejos según días
    if (days <= 7) return 'Monitor germination';
    if (days <= 21) return 'Watch for growth';
    if (days <= 60) return 'Continue care routine';
    return 'Ready to harvest';
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const handleViewProgress = () => {
    navigation.navigate('PlantProgress', { plant });
  };

  const createQuickTask = async (taskType: 'watering' | 'fertilizing') => {
    if (actionLoading) return; // Prevent multiple clicks
    
    setActionLoading(taskType);
    try {
      const taskData = {
        taskName: taskType === 'watering' ? `💧 Water ${plant.name}` : `🌱 Fertilize ${plant.name}`,
        description: taskType === 'watering' 
          ? `Time to water your ${plant.name}` 
          : `Give nutrients to your ${plant.name}`,
        icon: taskType === 'watering' ? '💧' : '🌱',
        completed: false,
        dueDate: new Date().toISOString(), // Due today
        plantId: plant.id,
        plantName: plant.name,
        createdAt: new Date().toISOString(),
        type: taskType,
        userId: user?.uid || 'guest'
      };

      if (isGuest || !user) {
        // Save to AsyncStorage for guests
        const stored = await AsyncStorage.getItem('guestTasks');
        const tasks = stored ? JSON.parse(stored) : [];
        const taskWithId = {
          ...taskData,
          id: Date.now().toString()
        };
        tasks.push(taskWithId);
        await AsyncStorage.setItem('guestTasks', JSON.stringify(tasks));
      } else {
        // Save to Firestore for authenticated users
        await addDoc(collection(firestore, 'tasks'), taskData);
      }

      // Success feefirestoreack with celebration
      const actionText = taskType === 'watering' ? 'watering' : 'fertilizing';
      const emoji = taskType === 'watering' ? '💧' : '🌱';
      Alert.alert(
        `${emoji} Task Created!`, 
        `Your ${plant.name} appreciates the ${actionText}! Task added to reminders.`,
        [{ text: 'Great!', style: 'default' }]
      );

      // Refresh plant tasks
      await loadPlantTasks();
    } catch (error) {
      console.error(`Error creating ${taskType} task:`, error);
      Alert.alert('Error', `Failed to create ${taskType} task`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickWater = () => createQuickTask('watering');
  const handleQuickFertilize = () => createQuickTask('fertilizing');

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {plant.imageUrl ? (
          <Image source={{ uri: plant.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="leaf-outline" size={32} color="#14532d" />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{plant.name}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          {loading ? (
            // Estado de loading elegante
            <View style={styles.loadingState}>
              <View style={styles.skeletonInfo}>
                <View style={styles.skeletonDay} />
                <View style={styles.skeletonStage} />
              </View>
              <View style={styles.skeletonProgress} />
              <View style={styles.skeletonButtons}>
                <View style={styles.skeletonButton} />
                <View style={styles.skeletonButton} />
              </View>
            </View>
          ) : (() => {
            const plantedInfo = getDaysPlanted(plant.plantingDate);
            const completedTasks = plantTasks.filter(task => task.completed).length;
            const totalTasks = plantTasks.length;
            const progress = getGrowthProgress(plantedInfo.days, completedTasks, totalTasks);
            const nextAction = getNextAction(plantedInfo.days, completedTasks, totalTasks);
            
            return (
              <>
                {/* Info row with days and stage */}
                <View style={styles.infoRow}>
                  <View style={styles.daysInfo}>
                    <Text style={styles.daysNumber}>Day {plantedInfo.days}</Text>
                    <Text style={styles.stageText}>{progress.stage}</Text>
                  </View>
                  <View style={styles.nextActionContainer}>
                    <Text style={styles.nextActionLabel}>Next:</Text>
                    <Text style={styles.nextActionText}>{nextAction}</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min(progress.percentage, 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {completedTasks === 0 && totalTasks > 0 
                      ? 'Complete tasks to start progress'
                      : `${Math.round(progress.percentage)}% Growth • ${totalTasks > 0 ? `${completedTasks}/${totalTasks} Tasks` : 'Setting up tasks...'}`
                    }
                  </Text>
                </View>

                {/* Quick Action buttons */}
                <View style={styles.quickActions}>
                  <TouchableOpacity 
                    style={[
                      styles.quickActionButton, 
                      actionLoading === 'watering' && styles.quickActionButtonLoading
                    ]} 
                    onPress={handleQuickWater}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'watering' ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Adding...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons name="water-outline" size={16} color="#14532d" />
                        <Text style={styles.quickActionText}>💧 Water</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.quickActionButton,
                      actionLoading === 'fertilizing' && styles.quickActionButtonLoading
                    ]} 
                    onPress={handleQuickFertilize}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'fertilizing' ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Adding...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons name="leaf-outline" size={16} color="#14532d" />
                        <Text style={styles.quickActionText}>🌱 Fertilize</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.progressButton} onPress={handleViewProgress}>
                    <Ionicons name="trending-up-outline" size={16} color="#14532d" />
                    <Text style={styles.progressButtonText}>Progress</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.addTaskButton} onPress={handleAddTask}>
                    <Ionicons name="add-circle-outline" size={16} color="#14532d" />
                    <Text style={styles.addTaskText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </>
            );
          })()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: 80,
    height: 80,
  },
  placeholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  details: {
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#14532d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressButtonText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '500',
    marginLeft: 4,
  },
  addTaskButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#14532d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTaskText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '500',
    marginLeft: 4,
  },

  // New styles for enhanced growing card
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  daysInfo: {
    flex: 1,
  },
  daysNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  stageText: {
    fontSize: 12,
    color: '#14532d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextActionContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  nextActionLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 2,
  },
  nextActionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'right',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14532d',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Loading skeleton styles
  loadingState: {
    gap: 12,
  },
  skeletonInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skeletonDay: {
    width: 60,
    height: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonStage: {
    width: 80,
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
  },
  skeletonProgress: {
    width: '100%',
    height: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },

  // New styles for quick action buttons
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#14532d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickActionButtonLoading: {
    backgroundColor: '#e0f2fe', // A lighter blue for loading
    borderColor: '#3b82f6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  quickActionText: {
    fontSize: 12,
    color: '#14532d',
    fontWeight: '500',
    marginLeft: 4,
  },
}); 
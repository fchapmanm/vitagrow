import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert, Image, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../services/authContext';
import { fetchUserPlants, savePlant, deletePlantById, fetchUserTasks, completeTask, fetchTodayReminders, generateGrowingGuideTasks, cleanupDuplicateTasks } from '../../services/plantService';
import PlantCard from '../components/PlantCard';
import FavoritesCard from '../components/FavoritesCard';
import GrowingCard from '../components/GrowingCard';
import MyGardenHeader from '../components/MyGardenHeader';
import ReminderList from '../components/ReminderList';

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

type TabType = 'favorites' | 'growing' | 'reminder';

export default function MyGarden({ route }: any) {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  
  // Tab por defecto para primera carga
  const initialTabFromParams: TabType = (route?.params?.targetTab as TabType) || 'favorites';
  
  // State management
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(initialTabFromParams);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cambiar de pestaña cuando lleguen parámetros desde Home, incluso si ya está montada
  React.useEffect(() => {
    const targetTab = route?.params?.targetTab as TabType | undefined;
    if (targetTab === 'growing' || targetTab === 'favorites' || targetTab === 'reminder') {
      setActiveTab(targetTab);
      navigation.setParams({ targetTab: undefined });
    }
  }, [route?.params?.targetTab]);

  // Load user plants when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Detectar si hay un targetTab en los parámetros de navegación
      const targetTab = route?.params?.targetTab as TabType | undefined;
      if (targetTab === 'growing' || targetTab === 'favorites' || targetTab === 'reminder') {
        setActiveTab(targetTab); // Forzar tab solicitado
        // Limpiar el parámetro para evitar persistencia
        navigation.setParams({ targetTab: undefined });
      }
      
      // Load immediately without setting loading state first
      loadPlants(false); // Call loadPlants with initialLoad = true to handle initial loading state
    }, [user, isGuest, route?.params?.targetTab, navigation]) // Add navigation to dependency array
  );

  // Search removed

  const loadPlants = async (showLoadingIndicator: boolean = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    try {
      // Limpiar tareas duplicadas primero (solo en la primera carga)
      if (initialLoad) {
        await cleanupDuplicateTasks(user, isGuest);
      }
      
      // Load plants and tasks first
      const [userPlants, userTasks] = await Promise.all([
        fetchUserPlants(user, isGuest),
        fetchUserTasks(user, isGuest)
      ]);
      
      // Use existing data for reminders to avoid redundant calls
      const todayReminders = await fetchTodayReminders(user, isGuest, userTasks, userPlants);
      
      setPlants(userPlants);
      setTasks(userTasks);
      setReminders(todayReminders);
      // Trigger refresh de las growing cards
      setRefreshTrigger(prev => prev + 1);
      setInitialLoad(false); // Set initialLoad to false after the first successful load
    } catch (error) {
      console.error('Error loading plants:', error);
      setError('Unable to load your garden. Please try again.');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const handleDeleteSuccess = () => {
    // Reload plants after successful deletion
    loadPlants();
  };

  const handleCompleteTask = async (taskId: string) => {
    // Prevenir múltiples ejecuciones simultáneas
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      await completeTask(taskId, user, isGuest);
      
      // Forzar recarga completa de todos los datos
      const [updatedPlants, updatedTasks] = await Promise.all([
        fetchUserPlants(user, isGuest),
        fetchUserTasks(user, isGuest)
      ]);
      
      // Actualizar el estado con los datos frescos
      setPlants(updatedPlants);
      setTasks(updatedTasks);
      
      // Calcular recordatorios con los datos actualizados
      const updatedReminders = await fetchTodayReminders(user, isGuest, updatedTasks, updatedPlants);
      
      setReminders(updatedReminders);
      
      // Trigger refresh de las growing cards
      setRefreshTrigger(prev => prev + 1);
      
      // Forzar re-render inmediato
      setActiveTab(activeTab);
      
      // Celebración sutil y elegante
      Alert.alert(
        '✅ Task Completed', 
        'Progress saved to your garden',
        [{ text: 'Continue', style: 'default' }],
        { cancelable: true }
      );
          } catch (error) {
        Alert.alert('Error', 'Failed to complete task');
      } finally {
      setIsCompleting(false);
    }
  };

  const handleFavoritesDelete = async (plant: Plant) => {
    try {
      if (plant.id) {
        await deletePlantById(plant.id, isGuest, user);
        loadPlants();
      }
    } catch (error) {
      // Error silencioso
    }
  };

  const handleGrowingPress = async (plant: Plant) => {
    try {
      // 1. Crear la planta en estado "growing"
      const { id, ...plantWithoutId } = plant; // Remove id from the original plant
      const growingPlant = {
        ...plantWithoutId,
        status: 'growing' as const,
        plantingDate: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      };

      const savedPlant = await savePlant(user, isGuest, growingPlant);
      
      // 2. Generar tareas del growing guide automáticamente
      if (savedPlant) {
        await generateGrowingGuideTasks(savedPlant, user, isGuest);
      }
      
      // 3. Eliminar la planta de favorites
      if (plant.id) {
        await deletePlantById(plant.id, isGuest, user);
      }
      
      Alert.alert(
        '🌱 Started Growing!',
        `${plant.name} is now in your growing garden with personalized care tasks!`,
        [
          {
            text: 'View Growing',
            onPress: () => setActiveTab('growing'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
      
      // 4. Recargar plantas para mostrar los cambios
      loadPlants();
    } catch (error) {
      if (error instanceof Error && error.message === 'GrowingLimitExceeded') {
        Alert.alert(
          'Growing Limit Reached 🌱',
          'Free users can grow up to 3 plants at once. Register for unlimited growing plants!',
          [
            { text: 'Register Now', onPress: () => navigation.navigate('RegisterScreen') },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else if (error instanceof Error && error.message.includes('permission')) {
        Alert.alert(
          'Permission Error',
          'Unable to save to your garden. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (error instanceof Error && error.message.includes('network')) {
        Alert.alert(
          'Network Error', 
          'Connection problem. Please check your internet and try again.',
          [{ text: 'OK' }]
        );
      } else {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert(
          'Error Starting Growth', 
          `Failed to start growing: ${errorMsg}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Filter plants based on active tab
  const getFilteredPlants = () => {

    
    switch (activeTab) {
      case 'favorites':
        // Show only plants with status "planning" (favorites)
        const favoritePlants = plants.filter(plant => plant.status === 'planning');
  
        return favoritePlants;
      case 'growing':
        // Show only plants with status "growing"
        const growingPlants = plants.filter(plant => plant.status === 'growing');
  
        return growingPlants;
      case 'reminder':
        // Show tasks as reminders - no filter needed since we'll show tasks directly
        return plants.filter(plant => plant.status === 'growing');
      default:
        return plants;
    }
  };

  const filteredPlants = getFilteredPlants();

  // Clear search when changing tabs
  const handleTabChange = (newTab: TabType) => {
    if (activeTab !== newTab) {
      setActiveTab(newTab);
    }
  };

  const handleScrollBeginDrag = () => {
    Keyboard.dismiss();
  };

  // Get empty state content based on active tab
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'favorites':
        return {
          icon: 'heart-outline' as const,
          title: 'No favorite plants yet',
          subtitle: 'Browse our library.\nSave plants to grow later.',
          buttonText: 'Browse Plants',
          buttonAction: () => navigation.navigate('AddPlantFromLibrary')
        };
      case 'growing':
        return {
          icon: 'leaf-outline' as const,
          title: 'No plants growing yet',
          subtitle: 'Start your first crop.\nTrack its growth here.',
          buttonText: 'Add Plant',
          buttonAction: () => navigation.navigate('AddPlantFromLibrary')
        };
      case 'reminder':
        return {
          icon: 'calendar-outline' as const,
          title: 'No reminders set',
          subtitle: 'Stay on top of your garden.\nAdd tasks to get reminders.',
          buttonText: 'Add Reminder',
          buttonAction: () => navigation.navigate('AddTask')
        };
      default:
        return {
          icon: 'leaf-outline' as const,
          title: 'No plants yet 🌱',
          subtitle: 'Start growing your garden by adding your first plant',
          buttonText: '💚 Browse Plants',
          buttonAction: () => navigation.navigate('AddPlantFromLibrary')
        };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MyGardenHeader
          growingCount={plants.filter(p => p.status === 'growing').length}
          remindersCount={reminders.length}
          showAddButton={activeTab === 'favorites' || activeTab === 'growing' || activeTab === 'reminder'}
          onAddPress={() => navigation.navigate('AddPlantFromLibrary')}
        />


        {/* Segmented Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsBackground}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'favorites' && styles.tabButtonActive
              ]}
              onPress={() => handleTabChange('favorites')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'favorites' && styles.tabTextActive
              ]}>
                Favorites
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'growing' && styles.tabButtonActive
              ]}
              onPress={() => handleTabChange('growing')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'growing' && styles.tabTextActive
              ]}>
                Growing
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'reminder' && styles.tabButtonActive
              ]}
              onPress={() => handleTabChange('reminder')}
            >
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabText,
                  activeTab === 'reminder' && styles.tabTextActive
                ]}>
                  Reminder
                </Text>
                {reminders.length > 0 && (
                  <View style={styles.notificationDot} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="cloud-offline-outline" size={64} color="#ef4444" />
              <Text style={styles.errorTitle}>Connection Problem</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setError(null);
                  loadPlants();
                }}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : initialLoad && loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#14532d" />
              <Text style={styles.loadingText}>Loading your garden...</Text>
            </View>
          ) : filteredPlants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name={emptyState.icon} size={64} color="#14532d" />
              <Text style={styles.emptyTitle}>{emptyState.title}</Text>
              <Text style={styles.emptySubtext}>{emptyState.subtitle}</Text>
              {emptyState.buttonText && emptyState.buttonAction && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={emptyState.buttonAction}
                >
                  <Text style={styles.addButtonText}>{emptyState.buttonText}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.plantsContainer}>
                                                          {activeTab === 'reminder' ? (
                 // Mostrar reminders organizados y limpios
                 reminders.length > 0 ? (
                   (() => {
                       // Agrupar por planta con info visual
                       const today = new Date();
                       
                       // Agrupar tareas por planta
                       const tasksByPlant = reminders.reduce((acc: any, task: any) => {
                         const plantName = task.plantName || 'Unknown Plant';
                         const plantId = task.plantId;
                         
                         if (!acc[plantName]) {
                           acc[plantName] = {
                             plantId,
                             plantName,
                             tasks: []
                           };
                         }
                         
                         // Calcular urgencia de cada tarea
                         const dueDate = new Date(task.dueDate);
                         const diffTime = dueDate.getTime() - today.getTime();
                         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                         
                         let urgency = 'upcoming';
                         let urgencyText = `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                         let urgencyColor = '#6b7280';
                         
                         if (diffDays < 0) {
                           urgency = 'overdue';
                           urgencyText = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
                           urgencyColor = '#ef4444';
                         } else if (diffDays === 0) {
                           urgency = 'today';
                           urgencyText = 'Due today';
                           urgencyColor = '#f59e0b';
                         }
                         
                         acc[plantName].tasks.push({
                           ...task,
                           urgency,
                           urgencyText,
                           urgencyColor,
                           sortOrder: urgency === 'overdue' ? 0 : urgency === 'today' ? 1 : 2
                         });
                         
                         return acc;
                       }, {});

                       // Obtener info de plantas para las fotos
                       const getPlantImage = (plantId: string) => {
                         const plant = plants.find(p => p.id === plantId);
                         return plant?.imageUrl;
                       };

                       return (
                         <ReminderList
                           reminders={reminders as any}
                           plants={plants as any}
                           isCompleting={isCompleting}
                           onCompleteTask={handleCompleteTask}
                         />
                       );
                   })()
                 ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-outline" size={64} color="#14532d" />
                    <Text style={styles.emptyTitle}>No reminders yet</Text>
                    <Text style={styles.emptySubtext}>Add tasks to your growing plants to see reminders here</Text>
                  </View>
                )
              ) : (
                                 filteredPlants.map((plant) => {
                   if (activeTab === 'favorites') {
                     return (
                       <FavoritesCard
                         key={plant.id || plant.addedAt}
                         plant={plant}
                         onGrowingPress={handleGrowingPress}
                         onDeletePress={handleFavoritesDelete}
                       />
                     );
                  } else if (activeTab === 'growing') {
                    return (
                      <GrowingCard
                        key={plant.id || plant.addedAt}
                        plant={plant}
                        onDeleteSuccess={handleDeleteSuccess}
                        refreshTrigger={refreshTrigger}
                      />
                    );
                  } else {
                    return (
                      <PlantCard
                        key={plant.id || plant.addedAt}
                        plant={plant}
                        isGuest={isGuest}
                        onDeleteSuccess={handleDeleteSuccess}
                      />
                    );
                  }
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header styles
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  addPlantButton: {
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14532d',
  },
  

  
  // Segmented Tabs styles
  tabsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabsBackground: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#14532d',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginLeft: 4,
  },
  
  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  addButton: {
    marginTop: 24,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Plants list styles
  plantsContainer: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  
  // Task styles for reminder tab
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  taskPlant: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  taskActions: {
    alignItems: 'flex-end',
  },
  taskDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  completeButton: {
    padding: 4,
  },
  completingButton: {
    opacity: 0.5,
  },
  
  // Plant group styles for reminders
  plantGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  plantGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  plantGroupCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // New reminder styles - clean and organized
  remindersContainer: {
    gap: 8,
  },
  reminderHeader: {
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  reminderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  overdueItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  reminderContent: {
    flex: 1,
  },
  reminderTaskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  reminderPlantName: {
    fontSize: 14,
    color: '#6b7280',
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overdueText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  dueTodayText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  upcomingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  reminderCompleteButton: {
    padding: 4,
  },
  sectionDivider: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Plant-grouped task styles  
  plantTaskGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  plantTaskGroupOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  plantTaskHeader: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  plantTaskImage: {
    width: 48,
    height: 48,
  },
  plantImagePlaceholder: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  plantTaskInfo: {
    flex: 1,
  },
  plantTaskName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  plantTaskCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  plantTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  plantTaskContent: {
    flex: 1,
  },
  plantTaskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  plantTaskUrgency: {
    fontSize: 12,
    fontWeight: '500',
  },
  plantTaskCompleteButton: {
    padding: 4,
  },
});

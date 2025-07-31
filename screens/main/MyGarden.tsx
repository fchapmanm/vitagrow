import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../services/authContext';
import { fetchUserPlants, savePlant, deletePlantById } from '../../services/plantService';
import PlantCard from '../components/PlantCard';
import PlanningCard from '../components/PlanningCard';
import GrowingCard from '../components/GrowingCard';

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

type TabType = 'planning' | 'growing' | 'reminder';

export default function MyGarden() {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  
  // State management
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('planning');

  // Load user plants when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Load immediately without setting loading state first
      const loadPlantsImmediately = async () => {
        try {
          const userPlants = await fetchUserPlants(user, isGuest);
          setPlants(userPlants);
        } catch (error) {
          console.error('Error loading plants:', error);
        }
      };
      
      loadPlantsImmediately();
    }, [user, isGuest])
  );

  // Initial load when component mounts
  useEffect(() => {
    const loadPlantsImmediately = async () => {
      setLoading(true);
      try {
        const userPlants = await fetchUserPlants(user, isGuest);
        setPlants(userPlants);
      } catch (error) {
        console.error('Error loading plants:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    loadPlantsImmediately();
  }, []);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const userPlants = await fetchUserPlants(user, isGuest);
      setPlants(userPlants);
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    // Reload plants after successful deletion
    loadPlants();
  };

  const handlePlanningDelete = async (plant: Plant) => {
    try {
      if (plant.id) {
        await deletePlantById(plant.id, isGuest, user);
        loadPlants();
      }
    } catch (error) {
      console.error('Error deleting planning plant:', error);
    }
  };

  const handleGrowingPress = async (plant: Plant) => {
    try {
      // Create a new plant with status "growing" and current date
      const growingPlant = {
        ...plant,
        id: undefined, // Let Firestore/AsyncStorage assign new ID
        status: 'growing' as const,
        plantingDate: new Date().toISOString(),
        addedAt: Date.now().toString(),
      };

      await savePlant(user, isGuest, growingPlant);
      
      Alert.alert(
        'Plant Started Growing! 🌱',
        `${plant.name} has been added to your growing garden. You can now track its progress.`,
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
      
      // Reload plants to show the new growing plant
      loadPlants();
    } catch (error) {
      console.error('Error starting plant growth:', error);
      Alert.alert('Error', 'Failed to start growing this plant');
    }
  };

  // Filter plants based on active tab
  const getFilteredPlants = () => {
    switch (activeTab) {
      case 'planning':
        // Show only plants with status "planning"
        return plants.filter(plant => plant.status === 'planning');
      case 'growing':
        // Show only plants with status "growing"
        return plants.filter(plant => plant.status === 'growing');
      case 'reminder':
        // Show reminders based on growing plants
        return [];
      default:
        return plants;
    }
  };

  const filteredPlants = getFilteredPlants();

  // Get empty state content based on active tab
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'planning':
        return {
          icon: 'calendar-outline' as const,
          title: 'No plants planned',
          subtitle: 'Add plants to your planning list to start your garden journey',
          buttonText: '+ Add plant',
          buttonAction: () => navigation.navigate('Home')
        };
      case 'growing':
        return {
          icon: 'leaf-outline' as const,
          title: 'No plants growing yet 🌱',
          subtitle: 'Start growing plants from your planning list',
          buttonText: '+ Add plant',
          buttonAction: () => navigation.navigate('Home')
        };
      case 'reminder':
        return {
          icon: 'notifications-outline' as const,
          title: 'No reminders yet',
          subtitle: 'Reminders will appear here based on your growing plants',
          buttonText: '+ Add plant',
          buttonAction: () => navigation.navigate('Home')
        };
      default:
        return {
          icon: 'leaf-outline' as const,
          title: 'No plants yet 🌱',
          subtitle: 'Start growing your garden by adding your first plant',
          buttonText: '+ Add plant',
          buttonAction: () => navigation.navigate('Home')
        };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Garden</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadPlants}
          >
            <Ionicons name="refresh" size={24} color="#4a7c59" />
          </TouchableOpacity>
        </View>

        {/* Garden Planner Section */}
        <View style={styles.gardenPlannerSection}>
          <View style={styles.gardenPlannerHeader}>
            <Text style={styles.gardenPlannerTitle}>Garden planner</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </View>
        </View>

        {/* Segmented Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsBackground}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'planning' && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab('planning')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'planning' && styles.tabTextActive
              ]}>
                Planning
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'growing' && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab('growing')}
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
              onPress={() => setActiveTab('reminder')}
            >
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabText,
                  activeTab === 'reminder' && styles.tabTextActive
                ]}>
                  Reminder
                </Text>
                <View style={styles.notificationDot} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {initialLoad && loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a7c59" />
              <Text style={styles.loadingText}>Loading your garden...</Text>
            </View>
          ) : filteredPlants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name={emptyState.icon} size={64} color="#10b981" />
              <Text style={styles.emptyTitle}>{emptyState.title}</Text>
              <Text style={styles.emptySubtext}>{emptyState.subtitle}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={emptyState.buttonAction}
              >
                <Text style={styles.addButtonText}>{emptyState.buttonText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.plantsContainer}>
              {filteredPlants.map((plant) => {
                if (activeTab === 'planning') {
                  return (
                    <PlanningCard
                      key={plant.id || plant.addedAt}
                      plant={plant}
                      onGrowingPress={handleGrowingPress}
                      onDeletePress={handlePlanningDelete}
                    />
                  );
                } else if (activeTab === 'growing') {
                  return (
                    <GrowingCard
                      key={plant.id || plant.addedAt}
                      plant={plant}
                      onDeleteSuccess={handleDeleteSuccess}
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
              })}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  
  // Garden Planner Section
  gardenPlannerSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  gardenPlannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gardenPlannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#4a7c59',
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
    fontWeight: '600',
    color: '#1f2937',
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
    backgroundColor: '#4a7c59',
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
});

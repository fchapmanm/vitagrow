import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  Text,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserPlants, Task, Plant } from '../../services/plantService';
import { useAuth } from '../../services/authContext';
import { useTodaysTasks } from '../../hooks/useTodaysTasks';
import { Ionicons } from '@expo/vector-icons'; // Corrected import for Ionicons


// Modular components
import HomeHeader from '../components/HomeHeader';
import SearchSection from '../components/SearchSection';
import StatsSection from '../components/StatsSection';
import GardenPreview from '../components/GardenPreview';
import TodaysTasks from '../components/TodaysTasks';

export default function Home() {
  const { user, isGuest } = useAuth();
  
  // Weather simulation (prepared for real API)
  const weather = {
    condition: '☀️',
    temperature: '25°C',
    description: 'Sunny',
    location: 'Melbourne'
  };
  
  // Today's tasks hook
  const { tasks: todayTasks, loading: tasksLoading, error: tasksError, refetch } = useTodaysTasks();
  
  // State management
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Calculate stats
  const growingPlantsCount = plants.filter(p => p.status === 'growing').length;
  const favoritePlantsCount = plants.filter(p => p.status === 'planning').length;
  const completedTasksToday = todayTasks.filter((t: Task) => t.completed && 
    new Date(t.createdAt).toDateString() === new Date().toDateString()
  ).length;

  // Reload data when screen comes into focus (avoid refetch in deps to prevent loops)
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      refetch();
    }, [user, isGuest])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors on new load attempt
      
      // Load plants only - tasks are handled by useTodaysTasks hook
      const userPlants = await fetchUserPlants(user, isGuest);
      setPlants(userPlants);
      
    } catch (error) {
      setError('Unable to load dashboard data. Please try again.'); // Set user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  const handleScrollBeginDrag = () => {
    Keyboard.dismiss();
  };

  const handlePlantsUpdate = () => {
    loadDashboardData();
  };

  const handleTaskCompleted = () => {
    refetch();
    loadDashboardData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        onScrollBeginDrag={handleScrollBeginDrag}
      >
        {/* Header Section */}
        <HomeHeader weather={weather} />

        {/* Search Section */}
        <SearchSection onPlantsUpdate={handlePlantsUpdate} />

        {/* Stats Section */}
        <StatsSection 
          growingPlantsCount={growingPlantsCount}
          favoritePlantsCount={favoritePlantsCount}
          completedTasksToday={completedTasksToday}
          todayTasksCount={todayTasks.length}
        />

        {/* Garden Preview */}
        <GardenPreview 
          plants={plants}
          loading={loading}
        />

        {/* Today's Tasks */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Connection Problem</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                loadDashboardData();
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TodaysTasks 
            tasks={todayTasks}
            loading={tasksLoading}
            error={tasksError}
            onTaskCompleted={handleTaskCompleted}
            hasPlants={plants.length > 0}
          />
        )}


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Error state styles (copied from MyGarden.tsx for consistency)
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
}); 
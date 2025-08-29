import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EducationalPlantsService } from '../../services/educationalPlantsService';

type CareTask = {
  week: number;
  task: string;
  frequency: string;
  note?: string;
  description?: string;
};

type GrowingGuideProps = {
  route: {
    params: {
      plant: {
        name: string;
        imageUrl?: string;
      };
    };
  };
};

export default function GrowingGuide({ route }: GrowingGuideProps) {
  const navigation = useNavigation<any>();
  const { plant } = route.params;
  
  const [careCalendar, setCareCalendar] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  useEffect(() => {
    loadPlantCareCalendar();
  }, [plant.name]);

  const loadPlantCareCalendar = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 GrowingGuide - Planta recibida:', plant.name);
      
      // Buscar planta por nombre en Firestore
      const allPlants = await EducationalPlantsService.getAllEducationalPlants();
      console.log('📋 GrowingGuide - Plantas encontradas en Firestore:', allPlants.map(p => p.name));
      
      const plantData = allPlants.find(p => 
        p.name.toLowerCase() === plant.name.toLowerCase()
      );
      
      console.log('🎯 GrowingGuide - Planta encontrada:', plantData?.name);
      
      if (plantData && plantData.careCalendar) {
        setCareCalendar(plantData.careCalendar);
        console.log('📅 GrowingGuide - Calendario cargado:', plantData.careCalendar.length, 'tareas');
      } else {
        setError('No care calendar found for this plant');
        console.log('❌ GrowingGuide - No se encontró calendario para:', plant.name);
      }
    } catch (err) {
      console.error('Error loading care calendar:', err);
      setError('Failed to load care calendar');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (week: number) => {
    setCompletedTasks(prev => 
      prev.includes(week) 
        ? prev.filter(w => w !== week)
        : [...prev, week]
    );
  };

  const getTaskIcon = (task: string, frequency: string) => {
    const taskLower = task.toLowerCase();
    if (taskLower.includes('water') || taskLower.includes('moisture')) return '💧';
    if (taskLower.includes('pest') || taskLower.includes('monitor')) return '🔍';
    if (taskLower.includes('feed') || taskLower.includes('fertiliz')) return '🌱';
    if (taskLower.includes('prune') || taskLower.includes('sucker')) return '✂️';
    if (taskLower.includes('support') || taskLower.includes('tie')) return '🏗️';
    if (taskLower.includes('harvest')) return '🍅';
    return '📋';
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '#ef4444';
      case 'weekly': return '#f59e0b';
      case 'once': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Growing Guide</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading care calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Growing Guide</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPlantCareCalendar}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growing Guide</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {plant.name} Care Calendar
          </Text>
          <Text style={styles.subtitle}>
            Follow these weekly tasks for healthy growth
          </Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {completedTasks.length}/{careCalendar.length} completed
            </Text>
          </View>
        </View>

        {/* Care Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.careHeader}>
            <View style={styles.careTitleRow}>
              <Ionicons name="book" size={20} color="#10b981" />
              <Text style={styles.careTitle}>Care</Text>
            </View>
            <View style={styles.careProgress}>
              <Text style={styles.careProgressText}>
                {completedTasks.length}/{careCalendar.length}
              </Text>
            </View>
          </View>

          {careCalendar.map((task, index) => {
            const isCompleted = completedTasks.includes(task.week);
            const isCurrentWeek = task.week === Math.min(...careCalendar.map(t => t.week));
            const taskIcon = getTaskIcon(task.task, task.frequency);
            
            return (
              <View
                key={`${task.week}-${index}`}
                style={[
                  styles.taskCard,
                  isCompleted && styles.taskCardCompleted,
                  isCurrentWeek && !isCompleted && styles.taskCardCurrent
                ]}
              >
                <View style={styles.taskLeft}>
                  <View style={styles.taskIconContainer}>
                    <Text style={styles.taskIcon}>{taskIcon}</Text>
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                      {task.task}
                    </Text>
                    <Text style={styles.taskWeek}>Week {task.week}</Text>
                    {task.note && (
                      <Text style={styles.taskNote}>{task.note}</Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    isCompleted && styles.completeButtonDone
                  ]}
                  onPress={() => toggleTaskCompletion(task.week)}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Completion Message */}
        {completedTasks.length === careCalendar.length && careCalendar.length > 0 && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionIcon}>🎉</Text>
            <Text style={styles.completionTitle}>Congratulations!</Text>
            <Text style={styles.completionText}>
              You've completed all care tasks for your {plant.name}!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d4ed8',
  },
  calendarContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  careHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  careTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  careProgress: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  careProgressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d4ed8',
  },
  taskCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  taskCardCurrent: {
    borderColor: '#10b981',
    borderWidth: 2,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconContainer: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: '#16a34a',
  },
  taskWeek: {
    fontSize: 14,
    color: '#6b7280',
  },
  taskNote: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  completeButton: {
    padding: 8,
  },
  completeButtonDone: {
    backgroundColor: '#10b981',
    borderRadius: 12,
  },
  completionContainer: {
    backgroundColor: '#fef3c7',
    margin: 24,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  completionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
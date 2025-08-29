import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Task, completeTask } from '../../services/plantService';
import { useAuth } from '../../services/authContext';

interface TodaysTasksProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onTaskCompleted?: () => void;
  hasPlants?: boolean; // Nueva prop para saber si hay plantas
}

export default function TodaysTasks({ tasks, loading, error, onTaskCompleted, hasPlants }: TodaysTasksProps) {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  const [completingTasks, setCompletingTasks] = React.useState<Set<string>>(new Set());

  const handleCompleteTask = async (taskId: string) => {
    if (!taskId) {
      Alert.alert('Error', 'Task ID is missing');
      return;
    }
    
    // Prevenir múltiples ejecuciones simultáneas
    if (completingTasks.has(taskId)) {
      return;
    }
    
    try {
      // Marcar tarea como completándose
      setCompletingTasks(prev => new Set(prev).add(taskId));
      
      await completeTask(taskId, user, isGuest);
      
      // Mostrar feedback inmediato sin alert
      onTaskCompleted?.();
      
    } catch (error) {
      Alert.alert('Error', `Failed to complete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Remover de la lista de tareas completándose
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  return (
    <View style={styles.todayTasksSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Care</Text>
        {tasks.length > 0 && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('MainTabs', { 
              screen: 'My Garden', 
              params: { targetTab: 'reminder' } 
            })}
          >
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={24} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading care tasks...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : tasks.length > 0 ? (
        <View style={styles.tasksContainer}>
          {tasks
            .filter(task => !completingTasks.has(task.id || '')) // Filtrar tareas que se están completando
            .slice(0, 3)
            .map((task: Task, index: number) => (
            <View
              key={task.id || index}
              style={styles.taskCard}
            >
              <View style={styles.taskContent}>
                <Text style={styles.taskName} numberOfLines={1}>
                  {task.taskName}
                </Text>
                {task.plantName && (
                  <Text style={styles.taskPlant}>
                    {task.plantName}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.completeTaskButton,
                  completingTasks.has(task.id || '') && styles.completingButton
                ]}
                onPress={() => task.id && handleCompleteTask(task.id)}
                disabled={!task.id || completingTasks.has(task.id || '')}
              >
                <Ionicons 
                  name={completingTasks.has(task.id || '') ? "hourglass-outline" : "checkmark"} 
                  size={18} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : hasPlants ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No care tasks yet</Text>
          <Text style={styles.emptyStateSubtitle}>Here are some common examples you could add:</Text>
          
          <View style={styles.exampleTasksContainer}>
            <View style={styles.exampleTaskItem}>
              <Text style={styles.exampleTaskText}>💧 Water your plants</Text>
            </View>
            
            <View style={styles.exampleTaskItem}>
              <Text style={styles.exampleTaskText}>🐛 Check for pests</Text>
            </View>
            
            <View style={styles.exampleTaskItem}>
              <Text style={styles.exampleTaskText}>🌱 Fertilize every 2–3 weeks</Text>
            </View>
          </View>
          
          <Text style={styles.clarificationText}>These are suggestions, not active tasks.</Text>
        </View>
      ) : (
        <View style={styles.emptyTasksCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#2e7d32" />
          <Text style={styles.emptyTasksText}>No care needed today.</Text>
          <Text style={styles.emptyTasksSubtext}>Plan your next steps.</Text>
        </View>
      )}

      {/* Add Task Button */}
      <TouchableOpacity 
        style={styles.addTaskButton}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Ionicons name="add-outline" size={20} color="#14532d" />
        <Text style={styles.addTaskText}>Add Care Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  todayTasksSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '500',
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },

  // Error state
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },

  // Tasks container
  tasksContainer: {
    // No specific styles for the container
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  taskPlant: {
    fontSize: 12,
    color: '#9ca3af',
  },
  completeTaskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  completingButton: {
    backgroundColor: '#6b7280',
    opacity: 0.7,
  },

  // Empty state
  emptyTasksCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyTasksText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    marginTop: 12,
  },
  emptyTasksSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  // Add task button
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  addTaskText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '500',
  },
  exampleTaskIndicator: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 16,
  },
  exampleText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  exampleHeader: {
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  exampleHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14532d',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  exampleTasksContainer: {
    width: '100%',
    alignItems: 'center',
  },
  exampleTaskItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    width: '90%',
    alignItems: 'center',
  },
  exampleTaskText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '600',
  },
  clarificationText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
}); 
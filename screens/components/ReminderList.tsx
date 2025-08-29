import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Reminder = {
  id?: string;
  taskName: string;
  dueDate?: string;
  plantId?: string;
  plantName?: string;
};

type Plant = {
  id?: string;
  imageUrl?: string;
};

interface ReminderListProps {
  reminders: Reminder[];
  plants: Plant[];
  isCompleting: boolean;
  onCompleteTask: (taskId: string) => void;
}

export default function ReminderList({ reminders, plants, isCompleting, onCompleteTask }: ReminderListProps) {
  const today = new Date();

  // Agrupar por planta con cálculo de urgencia
  const tasksByPlant = reminders.reduce((acc: any, task: any) => {
    const plantName = task.plantName || 'Unknown Plant';
    const plantId = task.plantId;

    if (!acc[plantName]) {
      acc[plantName] = { plantId, plantName, tasks: [] };
    }

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
      sortOrder: urgency === 'overdue' ? 0 : urgency === 'today' ? 1 : 2,
    });

    return acc;
  }, {} as Record<string, any>);

  const getPlantImage = (plantId?: string) => {
    if (!plantId) return undefined;
    const plant = plants.find(p => p.id === plantId);
    return plant?.imageUrl;
  };

  return (
    <View style={styles.remindersContainer}>
      <View style={styles.reminderHeader}>
        <Text style={styles.reminderTitle}>📋 Garden Tasks</Text>
      </View>

      {Object.values(tasksByPlant)
        .sort((a: any, b: any) => {
          const minSortOrderA = Math.min(...a.tasks.map((task: any) => task.sortOrder));
          const minSortOrderB = Math.min(...b.tasks.map((task: any) => task.sortOrder));
          return minSortOrderA - minSortOrderB;
        })
        .map((plantGroup: any) => {
          const sortedTasks = plantGroup.tasks.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
          const plantImage = getPlantImage(plantGroup.plantId);
          const hasOverdue = sortedTasks.some((task: any) => task.urgency === 'overdue');

          return (
            <View key={plantGroup.plantName} style={[styles.plantTaskGroup, hasOverdue && styles.plantTaskGroupOverdue]}>
              <View style={styles.plantTaskHeader}>
                <View style={styles.plantInfo}>
                  <View style={styles.plantImageContainer}>
                    {plantImage ? (
                      <Image source={{ uri: plantImage }} style={styles.plantTaskImage} />
                    ) : (
                      <View style={styles.plantImagePlaceholder}>
                        <Ionicons name="leaf-outline" size={20} color="#14532d" />
                      </View>
                    )}
                  </View>
                  <View style={styles.plantTaskInfo}>
                    <Text style={styles.plantTaskName}>{plantGroup.plantName}</Text>
                    <Text style={styles.plantTaskCount}>{sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              </View>

              {sortedTasks.map((task: any, index: number) => (
                <View key={task.id || index} style={styles.plantTaskItem}>
                  <View style={styles.plantTaskContent}>
                    <Text style={styles.plantTaskTitle}>{task.taskName}</Text>
                    <Text style={[styles.plantTaskUrgency, { color: task.urgencyColor }]}>{task.urgencyText}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.plantTaskCompleteButton}
                    onPress={() => task.id && onCompleteTask(task.id)}
                    disabled={isCompleting}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={isCompleting ? '#9ca3af' : '#14532d'} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  remindersContainer: { gap: 8 },
  reminderHeader: { marginBottom: 16 },
  reminderTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },

  plantTaskGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  plantTaskGroupOverdue: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  plantTaskHeader: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  plantInfo: { flexDirection: 'row', alignItems: 'center' },
  plantImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  plantTaskImage: { width: 48, height: 48 },
  plantImagePlaceholder: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  plantTaskInfo: { flex: 1 },
  plantTaskName: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  plantTaskCount: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  plantTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  plantTaskContent: { flex: 1 },
  plantTaskTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 2 },
  plantTaskUrgency: { fontSize: 12, fontWeight: '500' },
  plantTaskCompleteButton: { padding: 4 },
});


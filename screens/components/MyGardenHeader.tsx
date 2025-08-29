import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MyGardenHeaderProps {
  growingCount: number;
  remindersCount: number;
  showAddButton: boolean;
  onAddPress: () => void;
}

export default function MyGardenHeader({ growingCount, remindersCount, showAddButton, onAddPress }: MyGardenHeaderProps) {
  return (
    <View style={styles.header}> 
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>My Garden</Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="leaf" size={14} color="#14532d" />
            <Text style={styles.statText}>{growingCount} Growing</Text>
          </View>
          {remindersCount > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="notifications" size={14} color="#f59e0b" />
              <Text style={styles.statText}>{remindersCount} Due</Text>
            </View>
          )}
        </View>
      </View>
      {showAddButton && (
        <TouchableOpacity testID="add-button" style={styles.addPlantButton} onPress={onAddPress}>
          <Ionicons name="add" size={20} color="#14532d" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});


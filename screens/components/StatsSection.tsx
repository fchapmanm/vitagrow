import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../services/authContext';
import { useGuestLimits } from '../../hooks/useGuestLimits';
import GuestLimitIndicator from './GuestLimitIndicator';

interface StatsSectionProps {
  growingPlantsCount: number;
  favoritePlantsCount: number;
  completedTasksToday: number;
  todayTasksCount: number;
}

export default function StatsSection({ 
  growingPlantsCount, 
  favoritePlantsCount, 
  completedTasksToday,
  todayTasksCount 
}: StatsSectionProps) {
  const navigation = useNavigation<any>();
  const { isGuest } = useAuth();
  const guestLimits = useGuestLimits();

  return (
    <View style={styles.statsSection}>
      {/* Guest Mode Banner */}
      {isGuest && (
        <View style={styles.guestModeBanner}>
          <Text style={styles.guestModeText}>Guest Mode — progress won't be saved.</Text>
        </View>
      )}
      
      <View style={styles.statsGrid}>
        {/* Favorite Plants */}
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigation.navigate('MainTabs', { screen: 'My Garden', params: { targetTab: 'favorites' } })}
          activeOpacity={0.8}
        >
          <View style={styles.statHeader}>
            <Ionicons name="heart-outline" size={20} color="#2e7d32" />
            <Text style={styles.statsLabel}>Favorites</Text>
          </View>
          <Text style={styles.statsNumber}>{favoritePlantsCount}</Text>
          <Text style={styles.statsDescription}>Plants</Text>
          <Text style={styles.statsSecondaryText}>Saved plants for later</Text>
        </TouchableOpacity>

        {/* Growing Plants */}
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigation.navigate('MainTabs', { screen: 'My Garden', params: { targetTab: 'growing' } })}
          activeOpacity={0.8}
        >
          <View style={styles.statHeader}>
            <Ionicons name="leaf-outline" size={20} color="#059669" />
            <Text style={styles.statsLabel}>Growing</Text>
          </View>
          <Text style={styles.statsNumber}>{growingPlantsCount}</Text>
          <Text style={styles.statsDescription}>Plants</Text>
          <Text style={styles.statsSecondaryText}>Plants you're currently growing</Text>
        </TouchableOpacity>

        {/* Today's Tasks */}
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigation.navigate('MainTabs', { screen: 'My Garden', params: { targetTab: 'reminder' } })}
          activeOpacity={0.8}
        >
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#2e7d32" />
            <Text style={styles.statsLabel}>Reminder</Text>
          </View>
          <Text style={styles.statsNumber}>{todayTasksCount}</Text>
          <Text style={styles.statsDescription}>Tasks</Text>
          <Text style={styles.statsSecondaryText}>Tasks scheduled for today</Text>
        </TouchableOpacity>
      </View>

      {/* Completed Tasks Today Indicator */}
      {completedTasksToday > 0 && (
        <View style={styles.completedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.completedText}>
            {completedTasksToday} task{completedTasksToday > 1 ? 's' : ''} completed today
          </Text>
        </View>
      )}

      {/* Guest Limits Indicators */}
      {isGuest && !guestLimits.loading && (
        <View style={styles.guestLimitsContainer}>
          <GuestLimitIndicator
            current={growingPlantsCount}
            max={guestLimits.maxGrowingPlants}
            type="growing"
            showWarning={true}
          />
          <GuestLimitIndicator
            current={guestLimits.viewedCount}
            max={guestLimits.maxViewedPlants}
            type="plants"
            showWarning={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  statsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statsDescription: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statsSecondaryText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  guestLimitsContainer: {
    marginTop: 16,
  },
  guestModeBanner: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  guestModeText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
}); 
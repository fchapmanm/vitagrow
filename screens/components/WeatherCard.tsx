import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WeatherData {
  condition: string;
  temperature: string;
  description: string;
  location: string;
}

interface WeatherCardProps {
  weather: WeatherData;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <View style={styles.weatherSection}>
      <View style={styles.weatherContent}>
        <View style={styles.weatherMain}>
          <Text style={styles.temperature}>{weather.temperature}</Text>
          <Text style={styles.tempRange}>Min 6°C; max 13°C</Text>
        </View>
        <View style={styles.weatherSide}>
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={16} color="#14532d" />
            <Text style={styles.locationText}>{weather.location}</Text>
          </View>
          <View style={styles.weatherAlert}>
            <Ionicons name="warning" size={14} color="#ef4444" />
            <Text style={styles.alertText}>Weather alerts are off</Text>
          </View>
        </View>
        <View style={styles.weatherIcon}>
          <Text style={styles.weatherEmoji}>{weather.condition}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weatherSection: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherMain: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  tempRange: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  weatherSide: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '600',
    marginLeft: 4,
  },
  weatherAlert: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  weatherIcon: {
    marginLeft: 16,
  },
  weatherEmoji: {
    fontSize: 48,
  },
}); 
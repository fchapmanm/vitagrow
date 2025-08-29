import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/authContext';
import { useNavigation } from '@react-navigation/native';
import WeatherCard from './WeatherCard';

interface HomeHeaderProps {
  weather: {
    condition: string;
    temperature: string;
    description: string;
    location: string;
  };
}

export default function HomeHeader({ weather }: HomeHeaderProps) {
  const navigation = useNavigation<any>();
  const { user, isGuest, logout } = useAuth();
  
  // Current date and greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Gardener';
  const isGuestUser = isGuest || !user;

  const getGreetingMessage = () => {
    if (isGuestUser) {
      return `${greeting}`;
    }
    return `${greeting}, ${userName}`;
  };

  const getStatusMessage = () => {
    // No mostrar mensaje de estado, solo el saludo centrado
    return "";
  };

  const handleUserStatusPress = () => {
    if (isGuestUser) {
      navigation.navigate('LoginScreen');
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout', 
            style: 'destructive',
            onPress: async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'SplashScreen' }],
              });
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles.headerSection}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.profileButton} onPress={handleUserStatusPress}>
          <Ionicons 
            name={isGuestUser ? "person-outline" : "person"} 
            size={24} 
            color="#374151" 
          />
        </TouchableOpacity>
        
        <View style={styles.centerContent}>
          <Text style={styles.greetingTextCentered}>{getGreetingMessage()}</Text>
        </View>
        
        <View style={styles.profileButtonPlaceholder} />
      </View>

      {/* Weather Card */}
      <WeatherCard weather={weather} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTextCentered: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  guestBadgeCentered: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginTop: 4,
  },
  guestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonPlaceholder: {
    width: 40,
    height: 40,
  },
}); 
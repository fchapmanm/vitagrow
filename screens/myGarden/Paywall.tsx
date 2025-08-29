import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Paywall() {
  const navigation = useNavigation<any>();
  
  const handleSkip = async () => {
    // Skip button pressed - setting guest mode
    await AsyncStorage.setItem('isGuest', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Welcome to VitaGrow</Text>
        <Text style={styles.subtitle}>Your journey to food independence starts here</Text>
        
        <View style={styles.missionContainer}>
          <View style={styles.missionItem}>
            <Ionicons name="globe-outline" size={24} color="#ffffff" />
            <Text style={styles.missionText}>Combat world hunger</Text>
          </View>
          <View style={styles.missionItem}>
            <Ionicons name="nutrition-outline" size={24} color="#ffffff" />
            <Text style={styles.missionText}>Grow your own nutrition</Text>
          </View>
          <View style={styles.missionItem}>
            <Ionicons name="people-outline" size={24} color="#ffffff" />
            <Text style={styles.missionText}>Build food communities</Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.getStartedBtn} 
            onPress={() => navigation.navigate('LoginScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Begin Your Journey</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipBtn} 
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f3632',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 50,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  missionContainer: {
    width: '100%',
    marginBottom: 60,
    gap: 20,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
    fontWeight: '600',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  getStartedBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e3a34',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: '#1f3632',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.25,
  },
  skipBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '400',
  },
});

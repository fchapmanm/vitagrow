import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Paywall() {
  const navigation = useNavigation<any>();
  
  const handleSkip = async () => {
    console.log('Skip button pressed - setting guest mode'); // Log para debugging
    await AsyncStorage.setItem('isGuest', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to VitaGrow 🌱</Text>
      <Text style={styles.subtitle}>Grow your garden, grow your life.</Text>
      <TouchableOpacity style={styles.getStartedBtn} onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a7c59',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  getStartedBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 12,
  },
  getStartedText: {
    color: '#4a7c59',
    fontWeight: 'bold',
    fontSize: 18,
  },
  skipBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 
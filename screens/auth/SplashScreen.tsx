import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    const timeout = setTimeout(() => {
      navigation.replace('Paywall');
    }, 4000);
    return () => clearTimeout(timeout);
  }, [fadeAnim, slideAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>VitaGrow</Text>
        <Text style={styles.subtitle}>Learn to grow your own food, step by step</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.mission}>
          <Text style={styles.missionBold}>Save money, eat healthier, fight food waste.</Text>{'\n'}Every seed is a step towards Zero Hunger.
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f3631',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 40,
  },
  mission: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
    fontWeight: '400',
  },
  missionBold: {
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
}); 
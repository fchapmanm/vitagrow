import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Garden() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is your garden 🪴</Text>
      <Text style={styles.subtitle}>Start planting and track your veggies here!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f0fff0',
  },
  title: {
    fontSize: 26, 
    fontWeight: 'bold',
    color: '#4a7c59',
  },
  subtitle: {
    fontSize: 16,
    color: '#4a7c59',
    marginTop: 8,
  },
});

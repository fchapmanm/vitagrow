import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login 🔑</Text>
      <Text style={styles.subtitle}>Sign in to track your plants!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff8f0',
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

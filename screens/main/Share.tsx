import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Share() {
  return (
    <View style={styles.container}>
      <Ionicons name="share-social-outline" size={64} color="#4a7c59" />
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>
        Share your harvest with your community and help reduce food waste.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginTop: 16,
    fontWeight: 'bold',
    color: '#4a7c59',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#555',
  },
});

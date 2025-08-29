import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Plant } from '../../services/plantService';

interface GardenPreviewProps {
  plants: Plant[];
  loading: boolean;
}

export default function GardenPreview({ plants, loading }: GardenPreviewProps) {
  const navigation = useNavigation<any>();
  
  // Solo mostrar plantas growing, no planning/favoritos
  const growingPlants = plants.filter(p => p.status === 'growing');

  const renderGardenPreview = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={24} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading your garden...</Text>
        </View>
      );
    }

    if (growingPlants.length === 0) {
      return (
        <View style={styles.emptyGardenCard}>
          <Ionicons name="leaf-outline" size={32} color="#2e7d32" />
          <Text style={styles.emptyGardenText}>Start your first crop.</Text>
          <Text style={styles.emptyGardenSubtext}>Take the first step towards food independence.</Text>
          <TouchableOpacity 
            style={styles.startGrowingButton}
            onPress={() => navigation.navigate('MainTabs', { 
              screen: 'My Garden', 
              params: { targetTab: 'favorites' } 
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.startGrowingButtonText}>Add Plant</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={growingPlants}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id || item.name}
        contentContainerStyle={styles.gardenPreviewList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.gardenPreviewItem}
            onPress={() => navigation.navigate('PlantProgress', { plant: item })}
            activeOpacity={0.8}
          >
            <View style={styles.gardenPreviewImageContainer}>
              {item.imageUrl ? (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.gardenPreviewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.gardenPreviewPlaceholder}>
                  <Ionicons name="nutrition-outline" size={32} color="#9ca3af" />
                </View>
              )}
            </View>
            <View style={styles.gardenPreviewInfo}>
              <Text style={styles.gardenPreviewPlantName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.plantingDate && (
                <Text style={styles.gardenPreviewPlantDate}>
                  Day {Math.floor((new Date().getTime() - new Date(item.plantingDate).getTime()) / (1000 * 60 * 60 * 24))}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.gardenPreviewSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Garden</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs', { 
            screen: 'My Garden', 
            params: { targetTab: 'growing' } 
          })}
        >
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {renderGardenPreview()}
    </View>
  );
}

const styles = StyleSheet.create({
  gardenPreviewSection: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '500',
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingRight: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },

  // Empty state
  emptyGardenCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginRight: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyGardenText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    marginTop: 12,
  },
  emptyGardenSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  startGrowingButton: {
    backgroundColor: '#374151',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startGrowingButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.25,
  },

  // Garden preview list
  gardenPreviewList: {
    paddingRight: 24,
  },
  gardenPreviewItem: {
    width: 120,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  gardenPreviewImageContainer: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gardenPreviewImage: {
    width: '100%',
    height: '100%',
  },
  gardenPreviewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  gardenPreviewInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gardenPreviewPlantName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  gardenPreviewPlantDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
}); 
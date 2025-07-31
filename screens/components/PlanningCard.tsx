import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Plant = {
  id?: string;
  name: string;
  imageUrl?: string;
  plantingDate?: string;
  addedAt: string;
  isFavorite?: boolean;
  status?: 'planning' | 'growing';
  difficulty?: string;
  plantIn?: string;
  lastWatering?: string;
  place?: string;
  growthStage?: string;
};

interface PlanningCardProps {
  plant: Plant;
  onGrowingPress: (plant: Plant) => void;
  onDeletePress?: (plant: Plant) => void;
}

export default function PlanningCard({ plant, onGrowingPress, onDeletePress }: PlanningCardProps) {
  const navigation = useNavigation<any>();

  const handleGrowingGuide = () => {
    navigation.navigate('GrowingGuide', { plant });
  };

  const handleGrowingPress = () => {
    navigation.navigate('PlantDetails', { plant });
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Plant Options',
      `What would you like to do with "${plant.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeletePress) {
              onDeletePress(plant);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Options Button */}
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={handleDeletePress}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {plant.imageUrl ? (
          <Image source={{ uri: plant.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="leaf-outline" size={32} color="#10b981" />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{plant.name}</Text>
        
        <View style={styles.details}>
          {plant.difficulty && (
            <View style={styles.detailItem}>
              <Ionicons name="star-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{plant.difficulty}</Text>
            </View>
          )}
          
          {plant.plantIn && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{plant.plantIn}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.guideButton}
            onPress={handleGrowingGuide}
          >
            <Ionicons name="book-outline" size={16} color="#4a7c59" />
            <Text style={styles.guideButtonText}>Growing Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.growingButton}
            onPress={handleGrowingPress}
          >
            <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
            <Text style={styles.growingButtonText}>+ Growing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
  },
  optionsButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: 80,
    height: 80,
  },
  placeholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  guideButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a7c59',
    backgroundColor: '#ffffff',
  },
  guideButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a7c59',
    marginLeft: 4,
  },
  growingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#4a7c59',
  },
  growingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 4,
  },
}); 
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deletePlantById } from '../../services/plantService';
import { useAuth } from '../../services/authContext';

type Plant = {
  id?: string;
  name: string;
  imageUrl?: string;
  plantingDate?: string;
  addedAt: string;
  status?: 'planning' | 'growing';
  difficulty?: string;
  plantIn?: string;
  lastWatering?: string;
  place?: string;
  growthStage?: string;
};

type PlantCardProps = {
  plant: Plant;
  isGuest: boolean;
  onDeleteSuccess: () => void;
};

export default function PlantCard({ plant, isGuest, onDeleteSuccess }: PlantCardProps) {
  const { user } = useAuth();

  const handleDelete = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete "${plant.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (plant.id) {
              try {
                await deletePlantById(plant.id, isGuest, user);
                onDeleteSuccess();
              } catch (error) {
                console.error('Error deleting plant:', error);
                Alert.alert('Error', 'Failed to delete plant');
              }
            } else {
              Alert.alert('Error', 'Plant ID is missing. This plant may be corrupted.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.plantCard}>
      <View style={styles.plantImageContainer}>
        {plant.imageUrl ? (
          <Image
            source={{ uri: plant.imageUrl }}
            style={styles.plantImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.plantPlaceholder}>
            <Text style={styles.plantPlaceholderText}>🌱</Text>
          </View>
        )}
      </View>
      
      <View style={styles.plantInfo}>
        <Text style={styles.plantName} numberOfLines={1}>
          {plant.name}
        </Text>
        {plant.plantingDate && (
          <Text style={styles.plantingDate}>
            Planted: {formatDate(plant.plantingDate)}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 12,
  },
  plantImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f3f4f6',
  },
  plantImage: {
    width: 56,
    height: 56,
  },
  plantPlaceholder: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  plantPlaceholderText: {
    fontSize: 24,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  plantingDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
});
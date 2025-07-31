import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/authContext';
import { deletePlantById } from '../../services/plantService';

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

interface GrowingCardProps {
  plant: Plant;
  onDeleteSuccess: () => void;
}

export default function GrowingCard({ plant, onDeleteSuccess }: GrowingCardProps) {
  const { user, isGuest } = useAuth();

  const handleDelete = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!plant.id) {
                Alert.alert('Error', 'Plant ID is missing');
                return;
              }
              
              await deletePlantById(plant.id, isGuest, user);
              onDeleteSuccess();
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Failed to delete plant');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.card}>
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
        <View style={styles.header}>
          <Text style={styles.name}>{plant.name}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailLabel}>Planted:</Text>
            <Text style={styles.detailValue}>{formatDate(plant.plantingDate)}</Text>
          </View>
          
          {plant.lastWatering && (
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Last watered:</Text>
              <Text style={styles.detailValue}>{formatDate(plant.lastWatering)}</Text>
            </View>
          )}
          
          {plant.place && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{plant.place}</Text>
            </View>
          )}
          
          {plant.growthStage && (
            <View style={styles.detailItem}>
              <Ionicons name="trending-up-outline" size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Stage:</Text>
              <Text style={styles.detailValue}>{plant.growthStage}</Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    marginRight: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '400',
  },
}); 
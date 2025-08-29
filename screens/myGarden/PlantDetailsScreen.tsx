import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { savePlant, generateGrowingGuideTasks } from '../../services/plantService';
import { useAuth } from '../../services/authContext';

type PlantDetailsProps = {
  route: {
    params: {
      plant: {
        name: string;
        imageUrl?: string;
        scientific_name?: string;
        difficulty?: string;
        plantIn?: string;
      };
    };
  };
};

type PlaceType = 'ground' | 'raised' | 'indoor' | 'outdoor';
type GrowthStage = 'seed' | 'seedling' | 'vegetative' | 'flowering' | 'harvesting';

export default function PlantDetailsScreen({ route }: PlantDetailsProps) {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  const { plant } = route.params;

  // State for form data
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [lastWatering, setLastWatering] = useState(new Date());
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>('ground');
  const [selectedStage, setSelectedStage] = useState<GrowthStage>('seed');

  const places = [
    { id: 'ground', label: 'In the ground', icon: '🌱' },
    { id: 'raised', label: 'Raised beds', icon: '🛏️' },
    { id: 'indoor', label: 'Indoor containers', icon: '🏠' },
    { id: 'outdoor', label: 'Outdoor containers', icon: '🌿' },
  ];

  const growthStages = [
    { id: 'seed', label: 'Seed', icon: '🌱', description: 'Just planted' },
    { id: 'seedling', label: 'Seedling', icon: '🌿', description: 'Small sprout' },
    { id: 'vegetative', label: 'Growing', icon: '🌱', description: 'Leaves forming' },
    { id: 'flowering', label: 'Flowering', icon: '🌸', description: 'Flowers appear' },
    { id: 'harvesting', label: 'Harvesting', icon: '🍅', description: 'Ready to pick' },
  ];

  const handleContinue = async () => {
    try {
      const plantData = {
        name: plant.name,
        imageUrl: plant.imageUrl,
        plantingDate: plantingDate.toISOString(),
        lastWatering: lastWatering.toISOString(),
        place: selectedPlace,
        growthStage: selectedStage,
        status: 'growing' as const,
        addedAt: Date.now().toString(),
        difficulty: plant.difficulty,
        plantIn: plant.plantIn,
      };

      const savedPlant = await savePlant(user, isGuest, plantData);
      
      // Generar tareas del growing guide automáticamente
      await generateGrowingGuideTasks(savedPlant, user, isGuest);
      
      Alert.alert(
        'Success!',
        `${plant.name} has been added to your growing garden with personalized care tasks!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs', { screen: 'My Garden', params: { targetTab: 'growing' } })
          }
        ]
      );
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to save plant details. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Details</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plant Info Card */}
        <View style={styles.plantCard}>
          <View style={styles.plantImageContainer}>
            {plant.imageUrl ? (
              <Image source={{ uri: plant.imageUrl }} style={styles.plantImage} />
            ) : (
              <View style={styles.plantPlaceholder}>
                <Text style={styles.plantPlaceholderText}>🌱</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.plantInfo}>
            <Text style={styles.plantName}>{plant.name}</Text>
            {plant.scientific_name && (
              <Text style={styles.scientificName}>{plant.scientific_name}</Text>
            )}
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Planting Date */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#4a7c59" />
              <Text style={styles.sectionTitle}>Planting Date</Text>
            </View>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateText}>{formatDate(plantingDate)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Last Watering */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="water" size={20} color="#4a7c59" />
              <Text style={styles.sectionTitle}>Last Watering</Text>
            </View>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateText}>{formatDate(lastWatering)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Place Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="home" size={20} color="#4a7c59" />
              <Text style={styles.sectionTitle}>Growing Location</Text>
            </View>
            <View style={styles.optionsContainer}>
              {places.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={[
                    styles.optionButton,
                    selectedPlace === place.id && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedPlace(place.id as PlaceType)}
                >
                  <Text style={styles.optionIcon}>{place.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedPlace === place.id && styles.optionTextSelected
                  ]}>
                    {place.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Growth Stage */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf" size={20} color="#4a7c59" />
              <Text style={styles.sectionTitle}>Current Stage</Text>
            </View>
            <View style={styles.stagesContainer}>
              {growthStages.map((stage) => (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.stageButton,
                    selectedStage === stage.id && styles.stageButtonSelected
                  ]}
                  onPress={() => setSelectedStage(stage.id as GrowthStage)}
                >
                  <Text style={styles.stageIcon}>{stage.icon}</Text>
                  <Text style={[
                    styles.stageLabel,
                    selectedStage === stage.id && styles.stageLabelSelected
                  ]}>
                    {stage.label}
                  </Text>
                  <Text style={styles.stageDescription}>{stage.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              These details help us provide better care reminders and track your plant's progress.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Start Growing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  plantCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  plantPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantPlaceholderText: {
    fontSize: 32,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#4a7c59',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#4a7c59',
    borderColor: '#4a7c59',
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  stagesContainer: {
    gap: 8,
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stageButtonSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#4a7c59',
  },
  stageIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  stageLabelSelected: {
    color: '#166534',
  },
  stageDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a7c59',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 
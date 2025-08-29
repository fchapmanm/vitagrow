import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../services/authContext';
import { savePlant, getFreemiumPlantInfo } from '../../services/plantService';
import { fetchPlants } from '../../api/plantsapi';

type Plant = {
  id: number;
  common_name: string;
  scientific_name: string;
  default_image: {
    thumbnail: string;
  };
};

export default function AddPlantFromLibrary() {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [freemiumInfo, setFreemiumInfo] = useState({ viewedCount: 0, maxAllowed: 5, plantsViewed: [] as string[] });

  useEffect(() => {
    loadPlants();
    loadFreemiumInfo();
  }, []);

  const loadFreemiumInfo = async () => {
    try {
      const info = await getFreemiumPlantInfo(isGuest);
      setFreemiumInfo(info);
    } catch (error) {
      // Error silencioso
    }
  };

  const loadPlants = async () => {
    try {
      setLoading(true);
      const availablePlants = await fetchPlants(''); // Cargar todas las plantas
      setPlants(availablePlants);
    } catch (error) {
      Alert.alert('Error', 'Failed to load available plants');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter(plant =>
    plant.common_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlant = async (plant: Plant) => {
    try {
      const plantData = {
        name: plant.common_name,
        imageUrl: plant.default_image.thumbnail,
        difficulty: 'Easy', // Default difficulty
        plantIn: 'Spring', // Default season
        status: 'planning' as const,
        addedAt: new Date().toISOString(),
        isFavorite: false,
      };

      await savePlant(user, isGuest, plantData);
      
                    // Recargar info freemium después de agregar
      if (isGuest) {
        await loadFreemiumInfo();
      }
      
      // Feedback visual simple - navegar atrás implica éxito
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error && error.message === 'FreemiumPlantLimitExceeded') {
        Alert.alert(
          '🌱 Free Plan Limit Reached',
          'You\'ve explored 5 different plants! Keep your current plants and upgrade to discover unlimited varieties.',
          [
            { text: 'Register Now', onPress: () => navigation.navigate('RegisterScreen') },
            { text: 'Keep Current Plants', style: 'cancel' }
          ]
        );
      } else if (error instanceof Error && error.message === 'GrowingLimitExceeded') {
        Alert.alert(
          'Growing Limit Reached 🌱',
          'Free users can grow up to 3 plants at once. You can save unlimited favorites! Register for unlimited growing plants.',
          [
            { text: 'Register Now', onPress: () => navigation.navigate('RegisterScreen') },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add plant to your garden');
      }
    }
  };

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <View style={styles.plantCard}>
      <View style={styles.plantImageContainer}>
        <Image source={{ uri: item.default_image.thumbnail }} style={styles.plantImage} />
      </View>
      
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.common_name}</Text>
        <Text style={styles.scientificName}>{item.scientific_name}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddPlant(item)}
      >
        <Ionicons name="heart-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Plants</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Freemium Progress Indicator */}
        {isGuest && (
          <View style={styles.freemiumIndicator}>
            <Text style={styles.freemiumText}>
              Free Plan: {freemiumInfo.viewedCount}/{freemiumInfo.maxAllowed} plants explored
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(freemiumInfo.viewedCount / freemiumInfo.maxAllowed) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a7c59" />
          <Text style={styles.loadingText}>Loading available plants...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.plantsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plantsListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No plants found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search term
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  
  // Search styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  
  // Freemium indicator styles
  freemiumIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  freemiumText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Plants list styles
  plantsList: {
    flex: 1,
  },
  plantsListContent: {
    padding: 20,
  },
  
  // Plant card styles
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  plantImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  plantImage: {
    width: 60,
    height: 60,
  },
  plantImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  scientificName: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  addButton: {
    padding: 8,
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
}); 
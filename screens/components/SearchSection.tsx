import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlants } from '../../api/plantsapi';
import { savePlant } from '../../services/plantService';
import { useAuth } from '../../services/authContext';
import { useNavigation } from '@react-navigation/native';
import { useGuestLimits } from '../../hooks/useGuestLimits';

interface SearchSectionProps {
  onPlantsUpdate: () => void; // Callback para recargar plantas cuando se agrega una nueva
}

export default function SearchSection({ onPlantsUpdate }: SearchSectionProps) {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  const guestLimits = useGuestLimits();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter plants when search query changes
  useEffect(() => {
    const filterPlants = async () => {
      if (searchQuery.trim() && searchFocused) {
        try {
          const results = await fetchPlants(searchQuery);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    filterPlants();
  }, [searchQuery, searchFocused]);

  const handleScrollBeginDrag = () => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setShowDropdown(false);
  };

  const handleAddPlant = async (plant: any) => {
    try {
      const plantToSave = {
        name: plant.common_name,
        imageUrl: plant.default_image?.thumbnail,
        addedAt: new Date().toISOString(),
        isFavorite: true,
        status: 'planning' as const,
      };

      await savePlant(user, isGuest, plantToSave);

      // Feedback visual simple - limpiar búsqueda implica éxito
      setSearchQuery('');
      setShowDropdown(false);
      setSearchFocused(false);
      
      // Update parent component
      onPlantsUpdate();
      
    } catch (error) {
      Alert.alert('Error', 'Failed to add plant to garden');
    }
  };

      const isNearPlantLimit = isGuest && guestLimits.viewedCount >= 4; // Near 5 limit
    const isAtPlantLimit = isGuest && guestLimits.viewedCount >= guestLimits.maxViewedPlants;

    return (
    <View style={styles.searchSection}>
      {/* Guest Warning */}
      {isGuest && isNearPlantLimit && (
        <View style={[styles.warningCard, isAtPlantLimit && styles.warningCardDanger]}>
          <Ionicons 
            name={isAtPlantLimit ? "lock-closed-outline" : "warning-outline"} 
            size={16} 
            color={isAtPlantLimit ? "#ef4444" : "#f59e0b"} 
          />
          <Text style={[styles.warningText, isAtPlantLimit && styles.warningTextDanger]}>
            {isAtPlantLimit 
              ? "Plant exploration limit reached! Register to discover unlimited varieties."
              : `${guestLimits.maxViewedPlants - guestLimits.viewedCount} plant exploration${guestLimits.maxViewedPlants - guestLimits.viewedCount === 1 ? '' : 's'} remaining.`
            }
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for plants to grow..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => { /* keep dropdown visible until explicit action */ }}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Dropdown Results */}
      {showDropdown && searchResults.length > 0 && (
        <>
        {/* Backdrop to close dropdown when tapping outside */}
        <TouchableWithoutFeedback onPress={() => { setShowDropdown(false); setSearchFocused(false); Keyboard.dismiss(); }}>
          <View pointerEvents="auto" style={styles.dropdownBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id.toString()}
                style={styles.dropdownItem}
                onPress={() => handleAddPlant(item)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownItemLeft}>
                  {(item.default_image?.thumbnail || item.imageUrl) ? (
                    <Image 
                      source={{ uri: item.default_image?.thumbnail || item.imageUrl }} 
                      style={styles.dropdownItemImage}
                    />
                  ) : (
                    <View style={styles.dropdownItemPlaceholder}>
                      <Ionicons name="nutrition-outline" size={24} color="#9ca3af" />
                    </View>
                  )}
                  <View style={styles.dropdownItemInfo}>
                    <Text style={styles.dropdownItemName} numberOfLines={1}>
                      {item.common_name}
                    </Text>
                    {item.scientific_name && (
                      <Text style={styles.dropdownItemScientific} numberOfLines={1}>
                        {item.scientific_name}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="add-circle-outline" size={24} color="#14532d" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
    zIndex: 1000,
    position: 'relative',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -10000,
    left: -10000,
    right: -10000,
    bottom: -10000,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },

  // Dropdown styles
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 300,
    zIndex: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  dropdownItemPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownItemInfo: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  dropdownItemScientific: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Warning styles
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    gap: 8,
  },
  warningCardDanger: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
    flex: 1,
  },
  warningTextDanger: {
    color: '#dc2626',
  },
}); 
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchPlants } from '../../api/plantsapi';
import { savePlant, fetchUserTasks, fetchTodayReminders, fetchUserPlants, Task, Plant } from '../../services/plantService';
import { useAuth } from '../../services/authContext';
import DashboardCard from '../components/DashboardCard';

const { width } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useAuth();
  
  // Weather simulation (prepared for real API)
  const weather = {
    condition: '☀️',
    temperature: '25°C',
    description: 'Sunny',
    location: 'Melbourne'
  };
  
  // State management
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Current date and greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Gardener';
  const isGuestUser = isGuest || !user;
  
  // Calculate growing plants count
  const growingPlantsCount = plants.filter(p => p.status === 'growing').length;

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [user, isGuest]);

  // Filter plants when search query changes
  useEffect(() => {
    const filterPlants = async () => {
      if (searchQuery.trim() && searchFocused) {
        try {
          const results = await fetchPlants(searchQuery);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error filtering plants:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    filterPlants();
  }, [searchQuery, searchFocused]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load plants, tasks, and reminders
      const [userPlants, userTasks, todayReminders] = await Promise.all([
        fetchUserPlants(user, isGuest),
        fetchUserTasks(user, isGuest),
        fetchTodayReminders(user, isGuest)
      ]);
      
      setPlants(userPlants);
      setTasks(userTasks);
      setReminders(todayReminders);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreetingMessage = () => {
    if (isGuestUser) {
      return "Today is a great day to start gardening! 🌱";
    }
    return `${greeting}, ${userName} 👋`;
  };



  const handleCardPress = (action: string) => {
    switch (action) {
      case 'learn':
        navigation.navigate('Learn');
        break;
      case 'garden':
        navigation.navigate('My Garden');
        break;
      case 'reminders':
        // Could navigate to a dedicated reminders screen
        Alert.alert('Reminders', `You have ${reminders.length} reminders today`);
        break;
      case 'search':
        setSearchFocused(true);
        break;
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Navigate to search results or implement search functionality
      Alert.alert('Search', `Searching for: ${searchQuery}`);
      setSearchQuery('');
      setSearchFocused(false);
      Keyboard.dismiss();
    }
  };

  const handleScrollBeginDrag = () => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setShowDropdown(false);
  };

  const handleAddToGarden = async (plant: any) => {
    try {
      const plantData = {
        name: plant.common_name,
        imageUrl: plant.default_image?.thumbnail || '',
        addedAt: new Date().toISOString(),
        status: 'planning' as const,
      };

      await savePlant(user, isGuest, plantData);
      
      // Refresh dashboard data
      await loadDashboardData();
      
      // Show success message
      Alert.alert('Success', `${plant.common_name} added to your garden!`);
      
      // Clear search and hide dropdown
      setSearchQuery('');
      setShowDropdown(false);
      setSearchFocused(false);
      Keyboard.dismiss();
      
    } catch (error) {
      console.error('Error adding plant:', error);
      Alert.alert('Error', 'Failed to add plant to garden');
    }
  };

  const renderWeatherSection = () => (
    <View style={styles.weatherSection}>
      <View style={styles.weatherContent}>
        <View style={styles.weatherMain}>
          <Text style={styles.temperature}>{weather.temperature}</Text>
          <Text style={styles.tempRange}>Min 6°C; max 13°C</Text>
        </View>
        <View style={styles.weatherSide}>
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={16} color="#4a7c59" />
            <Text style={styles.locationText}>{weather.location}</Text>
          </View>
          <View style={styles.weatherAlert}>
            <Ionicons name="warning" size={14} color="#ef4444" />
            <Text style={styles.alertText}>Weather alerts are off</Text>
          </View>
        </View>
        <View style={styles.weatherIcon}>
          <Text style={styles.weatherEmoji}>{weather.condition}</Text>
        </View>
      </View>
    </View>
  );

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search VitaGrow"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchFocused(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <View style={styles.dropdownContainer}>
          <ScrollView 
            style={styles.dropdownList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={false}
          >
            {searchResults.map((plant, index) => (
              <TouchableOpacity
                key={plant.id || index}
                style={styles.dropdownItem}
                onPress={() => handleAddToGarden(plant)}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownItemContent}>
                  <View style={styles.dropdownItemImage}>
                    {plant.default_image?.thumbnail ? (
                      <Image
                        source={{ uri: plant.default_image.thumbnail }}
                        style={styles.dropdownImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.dropdownImagePlaceholder}>
                        <Text style={styles.dropdownImagePlaceholderText}>🌱</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.dropdownItemText}>
                    <Text style={styles.dropdownItemName} numberOfLines={1}>
                      {plant.common_name}
                    </Text>
                    <Text style={styles.dropdownItemScientific} numberOfLines={1}>
                      {plant.scientific_name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToGarden(plant)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderGreetingSection = () => (
    <View style={styles.greetingSection}>
      <View style={styles.greetingContent}>
        <View style={styles.profileIcon}>
          <Ionicons name="person-circle" size={48} color="#4a7c59" />
        </View>
        <View style={styles.greetingText}>
          <Text style={styles.greetingTitle}>{getGreetingMessage()}</Text>
          <Text style={styles.greetingSubtitle}>Tap here to edit personal data</Text>
        </View>
      </View>
    </View>
  );



  const renderDashboardCards = () => (
    <View style={styles.dashboardSection}>
      <Text style={styles.sectionTitle}>Care Tools</Text>
      <View style={styles.cardsGrid}>
        <View style={styles.cardRow}>
          <DashboardCard
            title="Learn"
            subtitle="Discover new plants"
            icon="📘"
            onPress={() => handleCardPress('learn')}
            variant="primary"
          />
          <DashboardCard
            title="My Garden"
            subtitle={`${growingPlantsCount} growing`}
            icon="🪴"
            onPress={() => handleCardPress('garden')}
            variant="secondary"
            badge={growingPlantsCount > 0 ? growingPlantsCount : undefined}
          />
        </View>
        <View style={styles.cardRow}>
          <DashboardCard
            title="Reminders"
            subtitle="Today's tasks"
            icon="📅"
            onPress={() => handleCardPress('reminders')}
            variant="success"
            badge={reminders.length > 0 ? reminders.length : undefined}
          />
          <DashboardCard
            title="Search Plants"
            subtitle="Find new additions"
            icon="🔍"
            onPress={() => handleCardPress('search')}
            variant="warning"
          />
        </View>
      </View>
    </View>
  );

  const renderTodaySection = () => (
    <View style={styles.todaySection}>
      <Text style={styles.sectionTitle}>Today's Overview</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={32} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading your garden...</Text>
        </View>
      ) : (
        <>
          {/* Plants Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>🪴</Text>
              <Text style={styles.summaryTitle}>Your Garden</Text>
            </View>
            {growingPlantsCount > 0 ? (
              <View style={styles.summaryContent}>
                <Text style={styles.summaryNumber}>{growingPlantsCount}</Text>
                <Text style={styles.summaryText}>
                  {growingPlantsCount === 1 ? 'plant growing' : 'plants growing'}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Tu jardín está vacío</Text>
                <Text style={styles.emptyStateSubtext}>¡Empieza a sembrar!</Text>
              </View>
            )}
          </View>

          {/* Tasks Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>📋</Text>
              <Text style={styles.summaryTitle}>Today's Tasks</Text>
            </View>
            {reminders.length > 0 ? (
              <View style={styles.summaryContent}>
                <Text style={styles.summaryNumber}>{reminders.length}</Text>
                <Text style={styles.summaryText}>
                  {reminders.length === 1 ? 'task pending' : 'tasks pending'}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>🎉 No tienes tareas hoy</Text>
                <Text style={styles.emptyStateSubtext}>¡Tu jardín está feliz!</Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={false}
        onScrollBeginDrag={handleScrollBeginDrag}
      >
        {/* Weather Section */}
        {renderWeatherSection()}
        
        {/* Search Section */}
        {renderSearchSection()}
        
        {/* Greeting Section */}
        {renderGreetingSection()}
        
        {/* Dashboard Cards */}
        {renderDashboardCards()}
        
        {/* Today's Overview */}
        {renderTodaySection()}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  
  // Weather Section
  weatherSection: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  weatherDateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Search Section
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  
  // Dropdown styles
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 300,
    marginTop: 8,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dropdownItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  dropdownImage: {
    width: 48,
    height: 48,
  },
  dropdownImagePlaceholder: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  dropdownImagePlaceholderText: {
    fontSize: 20,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  dropdownItemScientific: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  weatherMain: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  tempRange: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  weatherSide: {
    alignItems: 'flex-end',
    marginRight: 60,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#4a7c59',
    marginLeft: 4,
    fontWeight: '600',
  },
  weatherAlert: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  weatherIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  weatherEmoji: {
    fontSize: 40,
  },
  
  // Greeting Section
  greetingSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    marginRight: 16,
  },
  greetingText: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  

  
  // Dashboard Section
  dashboardSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  cardsGrid: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Today Section
  todaySection: {
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4a7c59',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  
  // Loading States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

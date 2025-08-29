import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';
import { AuthContext } from '../../services/authContext';
import { fetchUserPlants, Plant } from '../../services/plantService';

export default function AddTaskScreen() {
  const navigation = useNavigation<any>();
  const { user, isGuest } = useContext(AuthContext);
  
  const [taskName, setTaskName] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(true);

  useEffect(() => {
    loadUserPlants();
  }, []);

  const loadUserPlants = async () => {
    try {
      setLoadingPlants(true);
      const userPlants = await fetchUserPlants(user, isGuest);
      
      // Solo mostrar plantas en estado 'growing'
      const growingPlants = userPlants.filter(plant => plant.status === 'growing');
      
      setPlants(growingPlants);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your plants');
    } finally {
      setLoadingPlants(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, close the picker after selecting; on iOS keep it open to allow scrolling
    if (event?.type === 'dismissed') {
      if (Platform.OS === 'android') setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
    if (Platform.OS === 'android') setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePlantSelect = (plantId: string) => {
    setSelectedPlant(plantId);
    setShowPlantModal(false);
  };

  const handleSave = async () => {
    // Validaciones
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!selectedPlant) {
      Alert.alert('Error', 'Please select a plant');
      return;
    }

    // Comparar solo la fecha (sin hora) para permitir seleccionar hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(dueDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    if (selectedDateOnly < today) {
      Alert.alert('Error', 'Due date cannot be in the past');
      return;
    }

    try {
      setLoading(true);

      const selectedPlantData = plants.find(plant => plant.id === selectedPlant);
      if (!selectedPlantData) {
        Alert.alert('Error', 'Selected plant not found');
        return;
      }

      // Formatear dueDate como 'yyyy-MM-dd' para consistencia
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const taskData = {
        userId: user?.uid || 'guest',
        plantId: selectedPlant,
        plantName: selectedPlantData.name,
        taskName: taskName.trim(),
        dueDate: formatDate(dueDate), // Formato yyyy-MM-dd
        createdAt: new Date().toISOString(),
        completed: false,
      };



      if (isGuest) {
        // Para usuarios invitados, guardar en AsyncStorage
        
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const stored = await AsyncStorage.getItem('guestTasks');
        const existingTasks = stored ? JSON.parse(stored) : [];
        const newTask = { ...taskData, id: Date.now().toString() };
        existingTasks.push(newTask);
        await AsyncStorage.setItem('guestTasks', JSON.stringify(existingTasks));
        
        Alert.alert('Success', 'Task created successfully!');
      } else {
        // Para usuarios autenticados, guardar en Firestore
        const docRef = await addDoc(collection(firestore, 'tasks'), taskData);
        Alert.alert('Success', 'Task created successfully!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('❌ Error creating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to create task: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add Task</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      {/* Task Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Water the plant, Add fertilizer"
          value={taskName}
          onChangeText={setTaskName}
          maxLength={100}
        />
      </View>

      {/* Plant Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Plant ({plants.length} plants available)</Text>

        {loadingPlants ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4a7c59" />
            <Text style={styles.loadingText}>Loading plants...</Text>
          </View>
        ) : plants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No growing plants found</Text>
            <Text style={styles.emptySubtext}>Add plants to your garden first</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.plantSelectorButton}
              onPress={() => setShowPlantModal(true)}
            >
              <Ionicons name="leaf-outline" size={20} color="#4a7c59" />
              <Text style={styles.plantSelectorText}>
                {selectedPlant 
                  ? plants.find(p => p.id === selectedPlant)?.name 
                  : 'Select a plant...'
                }
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Due Date */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#4a7c59" />
          <Text style={styles.dateButtonText}>{formatDate(dueDate)}</Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Plant Selection Modal */}
      <Modal
        visible={showPlantModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Plant</Text>
              <TouchableOpacity
                onPress={() => setShowPlantModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.plantList}>
              {plants.map((item) => (
                <TouchableOpacity
                  key={item.id || item.name}
                  style={styles.plantItem}
                  onPress={() => handlePlantSelect(item.id || '')}
                >
                  <Text style={styles.plantItemText}>{item.name}</Text>
                  <Text style={styles.plantItemStatus}>Status: {item.status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderSaveButton = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!taskName.trim() || !selectedPlant || loading) && styles.saveButtonDisabled
        ]}
        onPress={handleSave}
        disabled={!taskName.trim() || !selectedPlant || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Create Task</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderForm()}
      </ScrollView>
      {renderSaveButton()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a7c59',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedPlantIndicator: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#4a7c59',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  selectedPlantText: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '500',
  },

  plantSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  plantSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  plantList: {
    maxHeight: 400,
  },
  plantItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  plantItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  plantItemStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
}); 
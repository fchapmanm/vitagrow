import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../services/authContext';
import { savePlant, uploadPlantImage } from '../../services/plantService';

const plantOptions = [
  'Tomato',
  'Basil',
  'Lettuce',
  'Carrot',
  'Coriander',
  'Parsley',
  'Scallions',
  'Garlic',
];

export default function AddPlantScreen() {
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [plantingDate, setPlantingDate] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const navigation = useNavigation();
  const { user, isGuest } = useContext(AuthContext);

  // Verificar si se ha seleccionado una planta válida
  const isPlantSelected = selectedPlant.trim() !== '';

  const selectImage = async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take photos.');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            
            if (!result.canceled && result.assets[0]) {
              setSelectedImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
              return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            
            if (!result.canceled && result.assets[0]) {
              setSelectedImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSave = async () => {
    // Validación adicional para asegurar que se seleccionó una planta
    if (!isPlantSelected) {
      Alert.alert('Error', 'Please select a plant from the list');
      return;
    }

    // Validar formato de fecha si se proporciona
    if (plantingDate && !/^\d{4}-\d{2}-\d{2}$/.test(plantingDate)) {
      Alert.alert('Invalid Date Format', 'Please use YYYY-MM-DD format for the planting date');
      return;
    }

    setIsSaving(true);
    setUploadStatus('');

    let imageUrl: string | undefined = undefined;

    // Subir imagen solo si el usuario está logueado y hay una imagen seleccionada
    if (user && selectedImage && !isGuest) {
      try {
        setUploadStatus('Uploading image...');
        imageUrl = await uploadPlantImage(user, selectedImage);
        setUploadStatus('Image uploaded successfully!');
      } catch (error) {
        setUploadStatus('Failed to upload image');
        Alert.alert('Upload Failed', 'Failed to upload image. Plant will be saved without image.');
      }
    }

    const plant = {
      name: selectedPlant,
      addedAt: plantingDate || new Date().toISOString(),
      imageUrl: imageUrl || undefined,
    };

    try {
      setUploadStatus('Saving plant...');
      await savePlant(user, isGuest, plant);
      navigation.goBack();
    } catch (err) {
      console.error('Error saving plant:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (errorMessage === 'GuestLimitExceeded') {
        Alert.alert(
          'Guest Limit Reached', 
          'You have reached the maximum number of plants for guest users. Please register to add more plants.'
        );
      } else {
        Alert.alert(
          'Save Failed', 
          `Failed to save plant: ${errorMessage}`
        );
      }
    } finally {
      setIsSaving(false);
      setUploadStatus('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose a plant:</Text>
      <Picker
        selectedValue={selectedPlant}
        onValueChange={(itemValue) => setSelectedPlant(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a plant..." value="" />
        {plantOptions.map((plant) => (
          <Picker.Item key={plant} label={plant} value={plant} />
        ))}
      </Picker>

      <Text style={styles.label}>Planting date (optional):</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={plantingDate}
        onChangeText={setPlantingDate}
        style={styles.input}
      />

      {/* Image Selection Section */}
      <Text style={styles.label}>Plant Image (optional):</Text>
      <View style={styles.imageContainer}>
        {selectedImage ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
              <Ionicons name="close-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageBtn} onPress={selectImage}>
            <Ionicons name="camera-outline" size={32} color="#4a7c59" />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Upload Status */}
      {uploadStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{uploadStatus}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.button, 
          (!isPlantSelected || isSaving) && styles.buttonDisabled
        ]} 
        onPress={handleSave}
        disabled={!isPlantSelected || isSaving}
      >
        <Text style={[
          styles.buttonText,
          (!isPlantSelected || isSaving) && styles.buttonTextDisabled
        ]}>
          {isSaving ? 'Saving...' : 'Save Plant'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 8 },
  picker: { height: 50, marginBottom: 16 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4a7c59',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  buttonTextDisabled: { color: '#999' },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4a7c59',
  },
  statusText: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '500',
    textAlign: 'center',
  },
});

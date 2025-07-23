import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchPlants } from '../api/plantsapi';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

<Text>Probando Git commit</Text>

type Props = {
  navigation: HomeScreenNavigationProp;
};


export default function Home({ navigation }: Props) {
  // Simulación de ciudad y clima
  const city = 'Melbourne';
  const weather = '12°C | Humid';
  const [search, setSearch] = useState('');
  const [plants, setPlants] = useState<any[]>([]); // Estado para resultados de plantas
  const [loading, setLoading] = useState(false);
  // Simulación de recordatorios
  const [tasks, setTasks] = useState([
    { id: '1', text: '💧 Water your Basil' },
    { id: '2', text: '🧤 Clean dry leaves' },
  ]);
  // Obtener mes actual
  const month = new Date().toLocaleString('default', { month: 'long' });

  // Buscar plantas al presionar el botón
  const handleSearch = async () => {
    setLoading(true);
    const results = await fetchPlants(search);
    setPlants(results);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Ciudad y clima */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={20} color="#4a7c59" style={{ marginRight: 4 }} />
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.weather}> | {weather}</Text>
      </View>
      {/* Campo de búsqueda */}
      <TextInput
        style={styles.search}
        placeholder="Search vegetables"
        placeholderTextColor="#a3bfa3"
        value={search}
        onChangeText={setSearch}
      />
      {/* Botón Add Plant */}
      <TouchableOpacity style={styles.addButton} onPress={handleSearch} disabled={loading || !search.trim()}>
        <Text style={styles.addButtonText}>{loading ? 'Searching...' : '+ Add Plant'}</Text>
      </TouchableOpacity>
      {/* Resultados de plantas */}
      {plants.length > 0 && (
        <View style={styles.plantResults}>
          <Text style={styles.resultsTitle}>Results:</Text>
          <FlatList
            data={plants}
            keyExtractor={item => item.id?.toString() || item.common_name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.plantCard}
                onPress={() => navigation.navigate('PlantDetail', { plant: item })}
                activeOpacity={0.8}
              >
                {item.default_image && item.default_image.thumbnail ? (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: item.default_image.thumbnail }}
                      style={styles.plantImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <Text style={styles.plantEmoji}>🌱</Text>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.plantNameBig}>{item.common_name || 'No name'}</Text>
                  {item.scientific_name && (
                    <Text style={styles.plantSciName}>{Array.isArray(item.scientific_name) ? item.scientific_name[0] : item.scientific_name}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      {/* Subtítulo del mes */}
      <Text style={styles.subtitle}>Checklist for {month}</Text>
      {/* Lista de tareas o mensaje vacío */}
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text style={styles.taskText}>{item.text}</Text>
            </View>
          )}
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'flex-start', paddingHorizontal: 24 }}
        />
      ) : (
        <Text style={styles.emptyMsg}>No tasks today. Your garden is thriving!</Text>
      )}
      {/* Mantengo el botón de navegación original */}
      <View style={{ marginTop: 24 }}>
        <Button title="Go to My Garden 🪴" onPress={() => navigation.navigate('Garden')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#eaf6ea',
    paddingTop: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  city: {
    fontSize: 18,
    color: '#4a7c59',
    fontWeight: 'bold',
  },
  weather: {
    fontSize: 16,
    color: '#4a7c59',
    marginLeft: 6,
  },
  search: {
    width: '85%',
    height: 40,
    backgroundColor: '#f5fff5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#4a7c59',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cbe6cb',
  },
  addButton: {
    backgroundColor: '#4a7c59',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginBottom: 18,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#4a7c59',
    fontWeight: '600',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  taskItem: {
    backgroundColor: '#f5fff5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    width: '100%',
  },
  taskText: {
    fontSize: 16,
    color: '#4a7c59',
  },
  emptyMsg: {
    fontSize: 16,
    color: '#a3bfa3',
    fontStyle: 'italic',
    marginTop: 16,
    alignSelf: 'center',
  },
  plantResults: {
    width: '90%',
    backgroundColor: '#f5fff5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    alignSelf: 'center',
  },
  resultsTitle: {
    fontWeight: 'bold',
    color: '#4a7c59',
    marginBottom: 6,
    fontSize: 16,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#eaf6ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  plantEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  plantNameBig: {
    fontSize: 17,
    color: '#4a7c59',
    fontWeight: 'bold',
  },
  plantSciName: {
    fontSize: 13,
    color: '#a3bfa3',
    marginTop: 2,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';

type PlantDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlantDetail'
>;

type Props = {
  navigation: PlantDetailScreenNavigationProp;
};

const PlantDetail = ({ navigation }: Props) => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlantDetail'>>();
  const plant = route.params?.plant;

  return (
    <View style={styles.container}>
      {plant?.default_image?.original ? (
        <Image source={{ uri: plant.default_image.original }} style={styles.image} resizeMode="contain" />
      ) : (
        <Text style={styles.icon}>🪴</Text>
      )}
      <Text style={styles.title}>{plant?.common_name || 'No name'}</Text>
      {plant?.scientific_name && (
        <Text style={styles.scientific}>{Array.isArray(plant.scientific_name) ? plant.scientific_name[0] : plant.scientific_name}</Text>
      )}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Watering:</Text>
        <Text style={styles.infoValue}>{plant?.watering || 'N/A'}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Sunlight:</Text>
        <Text style={styles.infoValue}>{Array.isArray(plant?.sunlight) ? plant.sunlight.join(', ') : plant?.sunlight || 'N/A'}</Text>
      </View>
      <Button
        title="Back to Garden"
        onPress={() => navigation.navigate('Garden')}
      />
    </View>
  );
};

export default PlantDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf6ea',
    padding: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a7c59',
  },
  description: {
    fontSize: 16,
    color: '#4a7c59',
    marginVertical: 12,
    textAlign: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  scientific: {
    fontSize: 16,
    color: '#a3bfa3',
    fontStyle: 'italic',
    marginBottom: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f5fff5',
    borderRadius: 8,
    padding: 8,
    width: '80%',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#4a7c59',
    fontSize: 15,
  },
  infoValue: {
    color: '#4a7c59',
    fontSize: 15,
  },
});

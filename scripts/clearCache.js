/**
 * Script para limpiar cache de AsyncStorage
 * Ejecutar desde la app para limpiar datos antiguos
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearPlantCache = async () => {
  try {
    console.log('🧹 Limpiando cache de plantas...');
    
    // Limpiar datos de plantas
    await AsyncStorage.removeItem('guestPlants');
    await AsyncStorage.removeItem('viewedPlantsHistory');
    
    console.log('✅ Cache de plantas limpiado');
    
    // Opcional: limpiar también tareas
    await AsyncStorage.removeItem('guestTasks');
    console.log('✅ Cache de tareas limpiado');
    
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
  }
};

export const clearAllCache = async () => {
  try {
    console.log('🧹 Limpiando todo el cache...');
    
    // Limpiar todo AsyncStorage
    await AsyncStorage.clear();
    
    console.log('✅ Todo el cache limpiado');
    
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
  }
}; 
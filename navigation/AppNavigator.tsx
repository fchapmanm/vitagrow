import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import Paywall from '../screens/garden/Paywall';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTabs from './MainTabs';
import AddPlantScreen from '../screens/garden/AddPlantScreen';
import GrowingGuide from '../screens/garden/GrowingGuide';
import PlantDetailsScreen from '../screens/garden/PlantDetailsScreen';
import { AuthContext } from '../services/authContext';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  SplashScreen: undefined;
  Paywall: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  MainTabs: undefined;
  AddPlant: undefined;
  GrowingGuide: {
    plant: {
      name: string;
      imageUrl?: string;
    };
  };
  PlantDetails: {
    plant: {
      name: string;
      imageUrl?: string;
      scientific_name?: string;
      difficulty?: string;
      plantIn?: string;
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4a7c59" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'MainTabs' : 'SplashScreen'}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Paywall" component={Paywall} options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen 
          name="AddPlant" 
          component={AddPlantScreen} 
          options={{ title: 'Add a Plant', headerShown: true }} 
        />
        <Stack.Screen 
          name="GrowingGuide" 
          component={GrowingGuide} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PlantDetails" 
          component={PlantDetailsScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

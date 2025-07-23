import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import Garden from '../screens/Garden';
import Login from '../screens/Login';
import PlantDetail from '../screens/PlantDetail';

export type RootStackParamList = {
  Home: undefined;
  Garden: undefined;
  Login: undefined;
  PlantDetail: { plant: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: 'VitaGrow 🏡' }}
        />
        <Stack.Screen 
          name="Garden" 
          component={Garden} 
          options={{ title: 'My Garden 🌱' }}
        />
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: 'Login 🔐' }}
        />
        <Stack.Screen 
          name="PlantDetail" 
          component={PlantDetail} 
          options={{ title: 'Plant Info 🪴' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

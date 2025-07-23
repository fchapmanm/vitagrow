import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './screens/Home';
import Garden from './screens/Garden';
import Login from './screens/Login';
import PlantDetail from './screens/PlantDetail';
import { Ionicons } from '@expo/vector-icons'; // Para íconos bonitos
import AppNavigator from './navigation/AppNavigator';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Garden') iconName = 'leaf';
            else if (route.name === 'Login') iconName = 'log-in';
            else if (route.name === 'PlantDetail') iconName = 'leaf-outline';

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4a7c59',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Garden" component={Garden} />
        <Tab.Screen name="Login" component={Login} />
        <Tab.Screen name="PlantDetail" component={PlantDetail} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

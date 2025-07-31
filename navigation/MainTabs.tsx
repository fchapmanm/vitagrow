import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from '../screens/main/Home';
import MyGarden from '../screens/main/MyGarden';
import Learn from '../screens/main/Learn';
import Share from '../screens/main/Share';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  console.log('MainTabs component mounted'); // Log para debugging

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'My Garden':
              iconName = 'leaf';
              break;
            case 'Learn':
              iconName = 'book';
              break;
            case 'Share':
              iconName = 'share-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a7c59',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="My Garden" component={MyGarden} />
      <Tab.Screen name="Learn" component={Learn} />
      <Tab.Screen name="Share" component={Share} />
    </Tab.Navigator>
  );
}

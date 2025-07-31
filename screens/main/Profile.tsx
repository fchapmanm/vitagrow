import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebaseConfig';

export default function Profile() {
  const navigation = useNavigation<any>();
  const isLoggedIn = !!auth.currentUser;

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your VitaGrow profile info will appear here.</Text>
      {!isLoggedIn && (
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Log In / Register</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fff5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4a7c59',
  },
  subtitle: {
    fontSize: 16,
    color: '#4a7c59',
    marginTop: 8,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#4a7c59',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 32,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
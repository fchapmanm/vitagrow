import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';

export async function loginUser(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  // Limpiar modo invitado al hacer login exitoso
  await AsyncStorage.removeItem('isGuest');
  return result;
}

export async function registerUser(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Limpiar modo invitado al registrarse exitosamente
  await AsyncStorage.removeItem('isGuest');
  return result;
}

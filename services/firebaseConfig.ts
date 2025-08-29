import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  Auth,
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase configuration for vitagrow-v3-final project
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
  // Android app: com.frank.vitagrow
  // iOS app: com.frank.vitagrow
  // Region: australia-southeast1
};

// Initialize Firebase App (prevent multiple initialization)
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase Auth with React Native persistence
let auth: Auth;
try {
  // For React Native, Firebase Auth automatically uses AsyncStorage for persistence
  auth = initializeAuth(firebaseApp);
} catch (error: any) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(firebaseApp);
  } else {
    throw error;
  }
}

// Initialize Firestore
const firestore: Firestore = getFirestore(firebaseApp);

// Initialize Storage
const storage: FirebaseStorage = getStorage(firebaseApp);

// Connect to emulators in development (uncomment if needed)
// if (__DEV__) {
//   const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
//   
//   try {
//     connectAuthEmulator(auth, `http://${localhost}:9099`);
//     connectFirestoreEmulator(firestore, localhost, 8080);
//     connectStorageEmulator(storage, localhost, 9199);
//   } catch (error) {
//     console.log('Emulator connection failed:', error);
//   }
// }

// Export initialized services
export { 
  firebaseApp, 
  auth, 
  firestore, 
  storage,
  firebaseConfig
};

// Export Firebase app as default
export default firebaseApp;

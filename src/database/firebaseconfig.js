import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import Constants from "expo-constants";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const { extra } = Constants.expoConfig;

// Log para depurar (temporal, quítalo después)
console.log('Extra config:', extra);
if (!extra || !extra.FIREBASE_API_KEY) {
  console.error('Firebase API Key no cargada en extra');
}

// Configuración Web de Firebase (ahora con 7 claves)
const firebaseconfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  measurementId: extra.FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseconfig);

// Servicios
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };
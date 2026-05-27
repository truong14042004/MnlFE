// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbO97gke1A7q9cxnkwunje1jH0O1wQ12I",
  authDomain: "mlnsu26.firebaseapp.com",
  projectId: "mlnsu26",
  storageBucket: "mlnsu26.firebasestorage.app",
  messagingSenderId: "387768055002",
  appId: "1:387768055002:web:f7ebf0a26c36c9503161e3",
  measurementId: "G-PHEK07987C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

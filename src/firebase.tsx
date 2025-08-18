// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase webapp configuration - specific to 2 bent rods project
const firebaseConfig = {
  apiKey: "AIzaSyCHxSDX8v3ghGJaRB8-lKlDSLj91Yn8Mhc",
  authDomain: "bent-rods---t313.firebaseapp.com",
  projectId: "bent-rods---t313",
  storageBucket: "bent-rods---t313.appspot.com",
  messagingSenderId: "757931117380",
  appId: "1:757931117380:web:188395f3661a65563ae511"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

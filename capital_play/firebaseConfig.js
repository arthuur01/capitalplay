// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhhB-9OG7emo9_MUyfAHN1mwydbSd6HhQ",
  authDomain: "capitalplay-fb658.firebaseapp.com",
  projectId: "capitalplay-fb658",
  storageBucket: "capitalplay-fb658.firebasestorage.app",
  messagingSenderId: "372438313190",
  appId: "1:372438313190:web:63cd7140da5055e9ea3327"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
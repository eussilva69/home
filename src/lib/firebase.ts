// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgslFwtJoQzNFlBhhQIdU55IXcP-O47u0",
  authDomain: "home-887f7.firebaseapp.com",
  projectId: "home-887f7",
  storageBucket: "home-887f7.firebasestorage.app",
  messagingSenderId: "981460411919",
  appId: "1:981460411919:web:164e8d79d9e59b1b48e57a",
  measurementId: "G-X3356YSC47"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
let analytics;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, firestore, analytics };

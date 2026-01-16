// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAkaY-oydtC_tHtqOj0O_44owzYCRUKRCM",
    authDomain: "preplate-291c8.firebaseapp.com",
    projectId: "preplate-291c8",
    storageBucket: "preplate-291c8.firebasestorage.app",
    messagingSenderId: "674334236680",
    appId: "1:674334236680:web:7dc4f95169f1177ae131bd",
    measurementId: "G-BGR8XYB8S0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
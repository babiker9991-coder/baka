// ضع بيانات مشروع Firebase الخاصة بك هنا
const firebaseConfig = {
  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWp1YvxwS_RGi9n3j_PPSnTcjM6Y8l-k0",
  authDomain: "sport-f707c.firebaseapp.com",
  projectId: "sport-f707c",
  storageBucket: "sport-f707c.firebasestorage.app",
  messagingSenderId: "339029738153",
  appId: "1:339029738153:web:c9bbedfab4f23509879fb8",
  measurementId: "G-4F1CBCH559"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

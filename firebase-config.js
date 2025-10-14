// لا تعيد تعريف firebaseConfig في أي مكان آخر
window.firebaseConfig = {
  apiKey: "AIzaSyDxoEJLaGcEy7s1P2nE2_bDniS71ldI31Q",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.firebasestorage.app",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e",
  measurementId: "G-XLQB1M9FHQ"
};

firebase.initializeApp(window.firebaseConfig);
window.auth = firebase.auth();
window.db = firebase.database();
window.storage = firebase.storage();

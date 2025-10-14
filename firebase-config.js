const firebaseConfig = {
  apiKey: "AIzaSyAWp1YvxwS_RGi9n3j_PPSnTcjM6Y8l-k0",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.appspot.com",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

const ADMIN_UID = "ضع_UID_هنا"; // ضع UID المشرف

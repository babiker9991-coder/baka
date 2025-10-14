// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDxoEJLaGcEy7s1P2nE2_bDniS71ldI31Q",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.firebasestorage.app",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e",
  measurementId: "G-XLQB1M9FHQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// المشرف
const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32";

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const openLoginBtn = document.getElementById('openLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');
const projectsGrid = document.getElementById('projectsGrid');
const adminProjectsList = document.getElementById('adminProjectsList');

// Show/hide sections
function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

// Login Modal
function openLoginModal(){ loginModal.style.display='flex'; }
function closeLoginModal(){ loginModal.style.display='none'; }

// Login
loginBtn.addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  try {
    await auth.signInWithEmailAndPassword(email,pw);
    closeLoginModal();
  } catch(e){
    document.getElementById('loginStatus').textContent=e.message;
  }
});

// Logout
function signOutUser(){ auth.signOut(); }

// Auth state
auth.onAuthStateChanged(user=>{
  if(user){
    openLoginBtn.style.display='none';
    logoutBtn.style.display='inline-block';
    if(user.uid === ADMIN_UID){
      adminBox.style.display='block';
      notAdminMsg.style.display='none';
    } else {
      adminBox.style.display='none';
      notAdminMsg.style.display='block';
    }
  } else {
    openLoginBtn.style.display='inline-block';
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
  }
});

// Add project
document.get

/* ====== Firebase Config ====== */
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

/* ====== إعداد المشرف ====== */
const ADMIN_UID = "ضع_هنا_UID_المشرف";

/* ====== عناصر DOM ====== */
const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');
const adminProjectsList = document.getElementById('adminProjectsList');

const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

/* ====== عرض/إخفاء الأقسام ====== */
function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

/* ====== تسجيل الدخول ====== */
loginBtn.addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');
  status.textContent = '';
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
  try{
    await auth.signInWithEmailAndPassword(email,pw);
    status.textContent='تم تسجيل الدخول';
    loginModal.style.display='none';
  }catch(e){
    console.error(e); status.textContent='خطأ: '+e.message;
  }
});

/* ====== تسجيل الخروج ====== */
async function signOutUser(){
  await auth.signOut();
}

/* ====== مراقبة حالة المصادقة ====== */
auth.onAuthStateChanged(user=>{
  if(user){
    logoutBtn.style.display='inline-block';
    if(user.uid === ADMIN_UID){
      adminBox.style.display='block';
      notAdminMsg.style.display='none';
      showSection('dashboard');
    } else {
      adminBox.style.display='none';
      notAdminMsg.style.display='block';
      showSection('dashboard');
    }
  } else {
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
    showSection('home');
  }
});

/* ====== إضافة مشروع ====== */
document.getElementById('addProjectBtn').addEventListener('click', async ()=>{
  const title = document.getElementById('projTitle').value.trim();
  const desc = document.getElementById('projDesc').value.trim();
  const file = document.getElementById('projImage').files[0];
  adminStatus.textContent = '';
  if(!title || !desc){ adminStatus.textContent = 'املأ العنوان والوصف'; return; }
  if(!auth.currentUser || auth.currentUser.uid !== ADMIN_UID){ adminStatus.textContent = 'أنت لست مشرفاً'; return; }

  adminStatus.textContent = '⏳ جاري رفع المشروع...';
  try{
    const newRef = db.ref('projects').push();
    const id = newRef.key;
    let imageUrl = '';
    if(file){
      const storageRef = storage.ref().child('projects/'+id+'_'+file.name);
      await storageRef.put(file);
      imageUrl = await storageRef.getDownloadURL();
    }
    await newRef.set({ title, desc, image: imageUrl, createdAt: Date.now() });
    adminStatus.textContent = '✅ تم نشر المشروع';
    document.getElementById('projTitle').value='';
    document.getElementById('projDesc').value='';
    document.getElementById('projImage').value='';
  }catch(e){
    console.error(e);
    adminStatus.textContent = '❌ خطأ: '+e.message;
  }
});

/* ====== تحميل المشاريع ====== */
function listenProjects(){
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    projectsGrid.innerHTML = '';
    Object.keys(data).sort((a,b)=>data[b].createdAt - data[a].createdAt).forEach(id=>{
      const p = data[id];
      const div = document.createElement('div'); div.className='proj-card';
      div.innerHTML = `${p.image?`<img src="${p.image}">`:''}<h4>${p.title}</h4><p>${p.desc}</p>`;
      projectsGrid.appendChild(div);
    });
  });
}

/* ====== تشغيل ====== */
listenProjects();

/* app.js - Realtime DB + Auth + Storage (compat) */

/* ====== ضع إعدادات Firebase هنا (استبدل بالقيم من مشروعك) ====== */
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
const analytics = getAnalytics(app);"
};
/* ================================================================== */

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

/* ====== إعداد المشرف (ضع UID الخاص بالمشرف هنا بعد إنشاءه في Firebase Auth) ====== */
const ADMIN_UID = "ضع_ADMIN_UID_هنا"; // ضع UID الخاص بالمشرف
/* ================================================================================================= */

/* ====== عناصر DOM ====== */
const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');
const adminProjectsList = document.getElementById('adminProjectsList');

const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const openLoginBtn = document.getElementById('openLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');

/* ====== عرض / إخفاء أقسام ====== */
function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
  // dashboard visibility handled by auth state
}

/* ====== تسجيل الدخول / التسجيل ====== */
function openLoginModal(){ loginModal.style.display='flex'; document.getElementById('loginStatus').textContent=''; }
function closeLoginModal(){ loginModal.style.display='none'; }

document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');
  status.textContent = '';
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
  try{
    await auth.signInWithEmailAndPassword(email,pw);
    status.textContent='تم تسجيل الدخول';
    closeLoginModal();
  }catch(e){
    console.error(e); status.textContent = 'خطأ: '+e.message;
  }
});

function openRegister(){
  // تسجيل سريع لمشرف جديد — يُنصح بإنشاء المستخدم من Console، هذه طريقة بديلة
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
  auth.createUserWithEmailAndPassword(email,pw)
    .then(u => { status.textContent='تم إنشاء الحساب. سجّل الدخول الآن.'; })
    .catch(e => { console.error(e); status.textContent = 'خطأ: '+e.message; });
}

async function signOutUser(){
  await auth.signOut();
  alert('تم الخروج');
}

/* ====== مراقبة حالة المصادقة ====== */
auth.onAuthStateChanged(user=>{
  const openDashboardBtn = document.getElementById('openDashboardBtn');
  if(user){
    document.getElementById('openLoginBtn').style.display='none';
    logoutBtn.style.display='inline-block';
    // تحقق هل هو المشرف
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
    document.getElementById('openLoginBtn').style.display='inline-block';
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
    // عند الخروج، إذا كنت في dashboard، ارجع للرئيسية
    const dash = document.getElementById('dashboard');
    if(dash && dash.style.display==='block') showSection('home');
  }
});

/* ====== إضافة مشروع (رفع صورة + حفظ بيانات في Realtime DB) ====== */
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
    // إفراغ الحقول
    document.getElementById('projTitle').value='';
    document.getElementById('projDesc').value='';
    document.getElementById('projImage').value='';
  }catch(e){
    console.error(e);
    adminStatus.textContent = '❌ خطأ: '+e.message;
  }
});

/* ====== تحميل وعرض المشاريع (عام) ====== */
function listenProjects(){
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    renderProjects(Object.keys(data).map(k=>({ id:k, ...data[k] })).sort((a,b)=>b.createdAt - a.createdAt));
    renderAdminProjects(Object.keys(data).map(k=>({ id:k, ...data[k] })).sort((a,b)=>b.createdAt - a.createdAt));
  });
}

function renderProjects(arr){
  projectsGrid.innerHTML = '';
  if(arr.length===0){
    projectsGrid.innerHTML = '<p class="small">لا توجد مشاريع حتى الآن.</p>';
    return;
  }
  arr.forEach(p=>{
    const div = document.createElement('div'); div.className='proj-card';
    div.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.title)}">` : ''}
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.desc)}</p>
    `;
    projectsGrid.appendChild(div);
  });
}

/* ====== قائمة المشاريع في لوحة الإدارة (عرض سريع) ====== */
function renderAdminProjects(arr){
  adminProjectsList.innerHTML = '';
  if(!adminProjectsList) return;
  if(arr.length===0){ adminProjectsList.innerHTML='<p class="small">لا مشاريع</p>'; return; }
  arr.forEach(p=>{
    const el = document.createElement('div'); el.className='card small';
    el.style.marginBottom='8px';
    el.innerHTML = `<strong>${escapeHtml(p.title)}</strong><div class="small">${new Date(p.createdAt).toLocaleString()}</div>`;
    adminProjectsList.appendChild(el);
  });
}

/* ====== مساعدة: حماية من XSS ====== */
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ====== init ====== */
showSection('home');
listenProjects();

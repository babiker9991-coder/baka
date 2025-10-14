// ===== Firebase config =====
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

// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Admin UID (ضع UID المشرف هنا بعد إنشاء الحساب)
const ADMIN_UID = "ضع_UID_هنا";

// ===== DOM Elements =====
const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');

const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const openLoginBtn = document.getElementById('openLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// ===== Functions =====
function showSection(id){
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

function openLoginModal(){ loginModal.style.display='flex'; }
function closeLoginModal(){ loginModal.style.display='none'; }

function signOutUser(){
  auth.signOut().then(()=>{ alert('تم الخروج'); });
}

// ===== Login =====
loginBtn.addEventListener('click', ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');
  status.textContent = '';
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
  auth.signInWithEmailAndPassword(email,pw)
    .then(()=>{ status.textContent='تم تسجيل الدخول'; closeLoginModal(); })
    .catch(e=>{ status.textContent='خطأ: '+e.message; });
});

// ===== Auth state =====
auth.onAuthStateChanged(user=>{
  if(user){
    openLoginBtn.style.display='none';
    logoutBtn.style.display='inline-block';
    if(user.uid===ADMIN_UID){ adminBox.style.display='block'; notAdminMsg.style.display='none'; }
    else { adminBox.style.display='none'; notAdminMsg.style.display='block'; }
  } else {
    openLoginBtn.style.display='inline-block';
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
  }
});

// ===== Add project =====
document.getElementById('addProjectBtn').addEventListener('click', async ()=>{
  const title = document.getElementById('projTitle').value.trim();
  const desc = document.getElementById('projDesc').value.trim();
  const file = document.getElementById('projImage').files[0];
  adminStatus.textContent = '';
  if(!title || !desc){ adminStatus.textContent='املأ العنوان والوصف'; return; }
  if(!auth.currentUser || auth.currentUser.uid !== ADMIN_UID){ adminStatus.textContent='أنت لست مشرفاً'; return; }

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

// ===== Listen Projects =====
db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
  const data = snapshot.val() || {};
  renderProjects(Object.keys(data).map(k=>({ id:k, ...data[k] })).sort((a,b)=>b.createdAt - a.createdAt));
});

function renderProjects(arr){
  projectsGrid.innerHTML='';
  if(arr.length===0){ projectsGrid.innerHTML='<p>لا توجد مشاريع حتى الآن.</p>'; return; }
  arr.forEach(p=>{
    const div = document.createElement('div'); div.className='proj-card';
    div.innerHTML = `${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}<h4>${p.title}</h4><p>${p.desc}</p>`;
    projectsGrid.appendChild(div);
  });
}

// ===== Initialize =====
showSection('home');

/* ====== إعداد Firebase (compat SDK) ====== */
const firebaseConfig = {
  apiKey: "AIzaSyAWp1YvxwS_RGi9n3j_PPSnTcjM6Y8l-k0",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.firebasestorage.app",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e",
  measurementId: "G-XLQB1M9FHQ"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

/* ====== UID المشرف (ضعه بعد إنشاء المستخدم في Firebase Auth) ====== */
const ADMIN_UID = "ضع_UID_المشرف_هنا";

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
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

/* ====== تسجيل الدخول ====== */
function openLoginModal(){ loginModal.style.display='flex'; document.getElementById('loginStatus').textContent=''; }
function closeLoginModal(){ loginModal.style.display='none'; }

loginBtn.addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');
  status.textContent = '';
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
  try{
    await auth.signInWithEmailAndPassword(email,pw);
    status.textContent='تم تسجيل الدخول';
    closeLoginModal();
  } catch(e){
    console.error(e); 
    status.textContent = 'خطأ: '+e.message;
  }
});

function openRegister(){
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
  if(user){
    openLoginBtn.style.display='none';
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
    openLoginBtn.style.display='inline-block';
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
    if(document.getElementById('dashboard').style.display==='block') showSection('home');
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

/* ====== تحميل وعرض المشاريع ====== */
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
    const div = document.createElement('div'); 
    div.className='proj-card';
    div.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.title)}">` : ''}
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.desc)}</p>
    `;
    projectsGrid.appendChild(div);
  });
}

/* ====== مشاريع لوحة الإدارة ====== */
function renderAdminProjects(arr){
  adminProjectsList.innerHTML = '';
  if(!adminProjectsList) return;
  if(arr.length===0){ adminProjectsList.innerHTML='<p class="small">لا مشاريع</p>'; return; }
  arr.forEach(p=>{
    const el = document.createElement('div'); 
    el.className='card small';
    el.style.marginBottom='8px';
    el.innerHTML = `<strong>${escapeHtml(p.title)}</strong><div class="small">${new Date(p.createdAt).toLocaleString()}</div>`;
    adminProjectsList.appendChild(el);
  });
}

/* ====== حماية من XSS ====== */
function escapeHtml(s){ 
  if(!s) return ''; 
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); 
}

/* ====== init ====== */
showSection('home');
listenProjects();

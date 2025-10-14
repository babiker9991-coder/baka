// ===== Firebase Config =====
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

// ===== Initialize Firebase =====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// ===== Admin UID (babiker) =====
const ADMIN_UID = "babiker";

// ===== Show Sections =====
function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

// ===== Login Modal =====
function openLoginModal(){ document.getElementById('loginModal').style.display='block'; }
function closeLoginModal(){ document.getElementById('loginModal').style.display='none'; }

// ===== Login Function =====
function login(){
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const status = document.getElementById('loginStatus');
  status.textContent = '';

  auth.signInWithEmailAndPassword(email,password)
    .then(user=>{
      status.textContent = 'تم تسجيل الدخول';
      closeLoginModal();
    })
    .catch(err=>{
      status.textContent = 'خطأ: ' + err.message;
    });
}

// ===== Logout =====
function logout(){
  auth.signOut();
}

// ===== Auth State Listener =====
auth.onAuthStateChanged(user=>{
  const adminBox = document.getElementById('adminBox');
  const notAdmin = document.getElementById('notAdmin');
  const loginBtn = document.getElementById('authButtons').children[0];
  const logoutBtn = document.getElementById('logoutBtn');

  if(user){
    loginBtn.style.display='none';
    logoutBtn.style.display='inline-block';
    // التحقق من المشرف (UID babiker)
    if(user.uid===ADMIN_UID){
      adminBox.style.display='block';
      notAdmin.style.display='none';
    } else {
      adminBox.style.display='none';
      notAdmin.style.display='block';
    }
  } else {
    loginBtn.style.display='inline-block';
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdmin.style.display='none';
  }
});

// ===== Add Project Function =====
async function addProject(){
  const title = document.getElementById('projTitle').value.trim();
  const desc = document.getElementById('projDesc').value.trim();
  const file = document.getElementById('projImage').files[0];
  const status = document.getElementById('adminStatus');
  status.textContent = '';

  if(!title || !desc){ status.textContent='املأ العنوان والوصف'; return; }
  if(!auth.currentUser || auth.currentUser.uid!==ADMIN_UID){ status.textContent='أنت لست مشرف'; return; }

  try{
    const newRef = db.ref('projects').push();
    const id = newRef.key;
    let imageUrl = '';

    if(file){
      const storageRef = storage.ref().child('projects/'+id+'_'+file.name);
      await storageRef.put(file);
      imageUrl = await storageRef.getDownloadURL();
    }

    await newRef.set({ title, desc, image:imageUrl, createdAt: Date.now() });
    status.textContent='✅ تم نشر المشروع';
    document.getElementById('projTitle').value='';
    document.getElementById('projDesc').value='';
    document.getElementById('projImage').value='';
    loadProjects();
  } catch(e){
    status.textContent='❌ خطأ: '+e.message;
    console.error(e);
  }
}

// ===== Load Projects =====
function loadProjects(){
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML='';
    Object.keys(data).sort((a,b)=>data[b].createdAt - data[a].createdAt).forEach(id=>{
      const p = data[id];
      const div = document.createElement('div');
      div.innerHTML = `
        ${p.image? `<img src="${p.image}" style="max-width:200px;">` : ''}
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      `;
      grid.appendChild(div);
    });
  });
}

// ===== Init =====
loadProjects();
showSection('home');

// ====== إعدادات Firebase ======
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

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// ====== عرض / إخفاء الأقسام ======
function showSection(id){
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

// ====== إضافة مشروع ======
async function addProject(){
  const title = document.getElementById('projTitle').value.trim();
  const desc = document.getElementById('projDesc').value.trim();
  const file = document.getElementById('projImage').files[0];
  const status = document.getElementById('adminStatus');
  status.textContent = '';

  if(!title || !desc){ status.textContent = 'املأ العنوان والوصف'; return; }

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
    status.textContent = '✅ تم نشر المشروع';
    document.getElementById('projTitle').value='';
    document.getElementById('projDesc').value='';
    document.getElementById('projImage').value='';
    loadProjects();
  }catch(e){
    console.error(e);
    status.textContent = '❌ خطأ: '+e.message;
  }
}

// ====== تحميل وعرض المشاريع ======
function loadProjects(){
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';
    Object.keys(data).sort((a,b)=>data[b].createdAt - data[a].createdAt).forEach(id=>{
      const p = data[id];
      const div = document.createElement('div');
      div.innerHTML = `
        ${p.image ? `<img src="${p.image}" style="max-width:200px;">` : ''}
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      `;
      projectsGrid.appendChild(div);
    });
  });
}

// ====== بدء التحميل ======
loadProjects();
showSection('home');

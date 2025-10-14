// Firebase Config
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

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// المشرف
const ADMIN_UID = "babiker"; // UID بعد إنشاء المشرف

// دوال عالمية
window.showSection = function(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

window.openLoginModal = function(){ document.getElementById('loginModal').style.display='block'; }
window.closeLoginModal = function(){ document.getElementById('loginModal').style.display='none'; }

window.login = function(){
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  auth.signInWithEmailAndPassword(email,password)
    .then(u=>{
      alert('تم تسجيل الدخول');
      closeLoginModal();
    })
    .catch(e=>alert('خطأ: '+e.message));
}

// مراقبة حالة المصادقة
auth.onAuthStateChanged(user=>{
  const adminBox = document.getElementById('adminBox');
  const notAdminMsg = document.getElementById('notAdminMsg');
  if(user && user.uid === ADMIN_UID){
    adminBox.style.display='block';
    notAdminMsg.style.display='none';
  } else {
    adminBox.style.display='none';
    notAdminMsg.style.display='block';
  }
});

// إضافة مشروع
window.addProject = async function(){
  const title = document.getElementById('projTitle').value;
  const desc = document.getElementById('projDesc').value;
  const file = document.getElementById('projImage').files[0];
  if(!title||!desc){ alert('املأ البيانات'); return; }

  const newRef = db.ref('projects').push();
  const id = newRef.key;
  let imageUrl = '';

  if(file){
    const storageRef = storage.ref().child('projects/'+id+'_'+file.name);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  await newRef.set({title, desc, image:imageUrl, createdAt:Date.now()});
  alert('تم نشر المشروع');
  document.getElementById('projTitle').value='';
  document.getElementById('projDesc').value='';
  document.getElementById('projImage').value='';
}

// عرض المشاريع
function listenProjects(){
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    const projects = Object.keys(data).map(k=>({...data[k], id:k})).sort((a,b)=>b.createdAt-a.createdAt);
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML='';
    projects.forEach(p=>{
      const div = document.createElement('div');
      div.className='proj-card';
      div.innerHTML=`${p.image?`<img src="${p.image}">`:''}<h4>${p.title}</h4><p>${p.desc}</p>`;
      grid.appendChild(div);
    });
  });
}

listenProjects();

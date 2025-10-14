document.addEventListener("DOMContentLoaded", function() {
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

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();
  const storage = firebase.storage();

  const ADMIN_UID = "babiker"; // UID المشرف

  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const projectsGrid = document.getElementById('projectsGrid');
  const adminBox = document.getElementById('adminBox');
  const notAdminMsg = document.getElementById('notAdminMsg');
  const adminStatus = document.getElementById('adminStatus');
  const adminProjectsList = document.getElementById('adminProjectsList');

  window.showSection = function(id){
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    const el = document.getElementById(id);
    if(el) el.style.display='block';
  }

  window.openLoginModal = function(){ document.getElementById('loginModal').style.display='block'; }
  window.closeLoginModal = function(){ document.getElementById('loginModal').style.display='none'; }

  window.login = function(){
    if(!loginEmail || !loginPassword) return;
    auth.signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
      .then(u=>{
        alert('تم تسجيل الدخول');
        closeLoginModal();
      })
      .catch(e=>alert('خطأ: '+e.message));
  }

  document.getElementById('logoutBtn').addEventListener('click', async ()=>{
    await auth.signOut();
    alert('تم الخروج');
  });

  auth.onAuthStateChanged(user=>{
    if(user && user.uid===ADMIN_UID){
      adminBox.style.display='block';
      notAdminMsg.style.display='none';
    } else if(user){
      adminBox.style.display='none';
      notAdminMsg.style.display='block';
    } else {
      adminBox.style.display='none';
      notAdminMsg.style.display='none';
    }
  });

  document.getElementById('addProjectBtn').addEventListener('click', async ()=>{
    const title = document.getElementById('projTitle').value.trim();
    const desc = document.getElementById('projDesc').value.trim();
    const file = document.getElementById('projImage').files[0];
    if(!title || !desc){ adminStatus.textContent='املأ العنوان والوصف'; return; }
    if(!auth.currentUser || auth.currentUser.uid!==ADMIN_UID){ adminStatus.textContent='أنت لست مشرفاً'; return; }

    adminStatus.textContent='⏳ جاري رفع المشروع...';
    try{
      const newRef = db.ref('projects').push();
      let imageUrl='';
      if(file){
        const storageRef = storage.ref('projects/'+file.name);
        await storageRef.put(file);
        imageUrl = await storageRef.getDownloadURL();
      }
      await newRef.set({ title, desc, image:imageUrl, createdAt:Date.now() });
      adminStatus.textContent='✅ تم نشر المشروع';
      document.getElementById('projTitle').value='';
      document.getElementById('projDesc').value='';
      document.getElementById('projImage').value='';
    } catch(e){
      adminStatus.textContent='❌ خطأ: '+e.message;
    }
  });

  // استماع المشاريع
  if(projectsGrid){
    db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
      const data = snapshot.val() || {};
      projectsGrid.innerHTML='';
      Object.keys(data).sort((a,b)=>data[b].createdAt-data[a].createdAt).forEach(k=>{
        const p = data[k];
        const div = document.createElement('div');
        div.className='proj-card';
        div.innerHTML = `${p.image?`<img src="${p.image}">`:''}<h4>${p.title}</h4><p>${p.desc}</p>`;
        projectsGrid.appendChild(div);
      });
    });
  }
});

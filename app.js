// ====== عرض / إخفاء أقسام ======
function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

// ====== تسجيل الدخول / الخروج ======
function openLoginModal(){ document.getElementById('loginModal').style.display='block'; }
function closeLoginModal(){ document.getElementById('loginModal').style.display='none'; }

function loginUser(){
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  const status = document.getElementById('loginStatus');
  status.textContent='';
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }

  auth.signInWithEmailAndPassword(email,pw)
    .then(userCredential=>{
      closeLoginModal();
      status.textContent='';
    })
    .catch(err=>{
      console.error(err);
      status.textContent='خطأ: '+err.message;
    });
}

function signOutUser(){
  auth.signOut().then(()=>location.reload());
}

// ====== مراقبة حالة المصادقة ======
auth.onAuthStateChanged(user=>{
  if(user){
    document.getElementById('loginBtn').style.display='none';
    document.getElementById('logoutBtn').style.display='inline-block';
    if(user.uid===ADMIN_UID){
      document.getElementById('adminBox').style.display='block';
      document.getElementById('notAdminMsg').style.display='none';
      showSection('dashboard');
    }
  } else {
    document.getElementById('loginBtn').style.display='inline-block';
    document.getElementById('logoutBtn').style.display='none';
    document.getElementById('adminBox').style.display='none';
    document.getElementById('notAdminMsg').style.display='none';
  }
});

// ====== إضافة مشروع ======
function addProject(){
  const title = document.getElementById('projTitle').value;
  const desc = document.getElementById('projDesc').value;
  const file = document.getElementById('projImage').files[0];
  const status = document.getElementById('adminStatus');
  status.textContent='';

  if(!title||!desc){ status.textContent='املأ العنوان والوصف'; return; }
  if(!auth.currentUser||auth.currentUser.uid!==ADMIN_UID){ status.textContent='أنت لست مشرفاً'; return; }

  const newRef = db.ref('projects').push();
  const id = newRef.key;

  if(file){
    const storageRef = storage.ref('projects/'+id+'_'+file.name);
    storageRef.put(file)
      .then(()=>storageRef.getDownloadURL())
      .then(url=>newRef.set({title,desc,image:url,createdAt:Date.now()}))
      .then(()=>{ status.textContent='✅ تم نشر المشروع'; })
      .catch(err=>{ console.error(err); status.textContent='❌ '+err.message; });
  } else {
    newRef.set({title,desc,image:'',createdAt:Date.now()})
      .then(()=>{ status.textContent='✅ تم نشر المشروع'; })
      .catch(err=>{ console.error(err); status.textContent='❌ '+err.message; });
  }
}

// ====== عرض المشاريع ======
function renderProjects(data){
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML='';
  data.forEach(p=>{
    const div = document.createElement('div');
    div.className='proj-card';
    div.innerHTML=`
      ${p.image?`<img src="${p

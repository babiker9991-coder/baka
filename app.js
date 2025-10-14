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
    .then(()=>closeLoginModal())
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
  const loginBtnEl = document.getElementById('loginBtn');
  const logoutBtnEl = document.getElementById('logoutBtn');
  const adminBox = document.getElementById('adminBox');
  const notAdminMsg = document.getElementById('notAdminMsg');

  if(user){
    loginBtnEl.style.display='none';
    logoutBtnEl.style.display='inline-block';
    if(user.uid===ADMIN_UID){
      adminBox.style.display='block';
      notAdminMsg.style.display='none';
      showSection('dashboard');
    } else {
      adminBox.style.display='none';
      notAdminMsg.style.display='block';
    }
  } else {
    loginBtnEl.style.display='inline-block';
    logoutBtnEl.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
  }
});

// ====== إضافة مشروع ======
function addProject(){
  const title = document.getElementById('projTitle').value;
  const desc = document.getElementById('projDesc').value;
  const file = document.getElementById('projImage').files[0];
  const status = document.getElementById('adminStatus');
  status.textContent='';

  if(!title || !desc){ status.textContent='املأ العنوان والوصف'; return; }
  if(!auth.currentUser || auth.currentUser.uid !== ADMIN_UID){ status.textContent='أنت لست مشرفاً'; return; }

  const newRef = db.ref('projects').push();
  const id = newRef.key;

  if(file){
    const storageRef = storage.ref('projects/'+id+'_'+file.name);
    storageRef.put(file)
      .then(()=>storageRef.getDownloadURL())
      .then(url=>newRef.set({title,desc,image:url,createdAt:Date.now()}))
      .then(()=>{ status.textContent='✅ تم نشر المشروع'; document.getElementById('projTitle').value=''; document.getElementById('projDesc').value=''; document.getElementById('projImage').value=''; })
      .catch(err=>{ console.error(err); status.textContent='❌ '+err.message; });
  } else {
    newRef.set({title,desc,image:'',createdAt:Date.now()})
      .then(()=>{ status.textContent='✅ تم نشر المشروع'; document.getElementById('projTitle').value=''; document.getElementById('projDesc').value=''; })
      .catch(err=>{ console.error(err); status.textContent='❌ '+err.message; });
  }
}

// ====== عرض المشاريع ======
function listenProjects(){
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    const arr = Object.keys(data).map(k=>({id:k,...data[k]})).sort((a,b)=>b.createdAt - a.createdAt);
    renderProjects(arr);
  });
}

function renderProjects(arr){
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML='';
  if(arr.length===0){ grid.innerHTML='<p>لا توجد مشاريع حتى الآن</p>'; return; }
  arr.forEach(p=>{
    const div = document.createElement('div');
    div.className='proj-card';
    div.innerHTML=`
      ${p.image?`<img src="${p.image}" alt="${p.title}">`:""}
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
    `;
    grid.appendChild(div);
  });
}

// ====== بدء الاستماع ======
listenProjects();
showSection('home');

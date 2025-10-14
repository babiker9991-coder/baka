const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32";

// DOM
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const openLoginBtn = document.getElementById('openLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');
const projectsGrid = document.getElementById('projectsGrid');
const adminProjectsList = document.getElementById('adminProjectsList');
const addProjectBtn = document.getElementById('addProjectBtn');
const projTitle = document.getElementById('projTitle');
const projDesc = document.getElementById('projDesc');
const projImage = document.getElementById('projImage');

function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

function openLoginModal(){ loginModal.style.display='flex'; }
function closeLoginModal(){ loginModal.style.display='none'; }

loginBtn.addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  try { await auth.signInWithEmailAndPassword(email,pw); closeLoginModal(); }
  catch(e){ document.getElementById('loginStatus').textContent=e.message; }
});

function signOutUser(){ auth.signOut(); }

auth.onAuthStateChanged(user=>{
  if(user){
    openLoginBtn.style.display='none';
    logoutBtn.style.display='inline-block';
    if(user.uid===ADMIN_UID){ adminBox.style.display='block'; notAdminMsg.style.display='none'; }
    else{ adminBox.style.display='none'; notAdminMsg.style.display='block'; }
  } else {
    openLoginBtn.style.display='inline-block';
    logoutBtn.style.display='none';
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
  }
});

addProjectBtn.addEventListener('click', async ()=>{
  const title = projTitle.value.trim();
  const desc = projDesc.value.trim();
  const file = projImage.files[0];
  if(!title||!desc){ adminStatus.textContent="املأ العنوان والوصف"; return; }
  if(!auth.currentUser||auth.currentUser.uid!==ADMIN_UID){ adminStatus.textContent="أنت لست مشرفاً"; return; }
  adminStatus.textContent="⏳ جاري رفع المشروع...";
  try{
    const newRef = db.ref('projects').push();
    let imageUrl = '';
    if(file){
      const storageRef = storage.ref().child('projects/'+newRef.key+'_'+file.name);
      await storageRef.put(file);
      imageUrl = await storageRef.getDownloadURL();
    }
    await newRef.set({title,desc,image:imageUrl,createdAt:Date.now()});
    adminStatus.textContent="✅ تم نشر المشروع";
    projTitle.value=''; projDesc.value=''; projImage.value='';
  }catch(e){ adminStatus.textContent="❌ خطأ: "+e.message; }
});

db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
  const data = snapshot.val()||{};
  renderProjects(Object.keys(data).map(k=>({id:k,...data[k]})).sort((a,b)=>b.createdAt-a.createdAt));
  renderAdminProjects(Object.keys(data).map(k=>({id:k,...data[k]})).sort((a,b)=>b.createdAt-a.createdAt));
});

function renderProjects(arr){
  projectsGrid.innerHTML='';
  if(arr.length===0){ projectsGrid.innerHTML="<p>لا توجد مشاريع بعد.</p>"; return; }
  arr.forEach(p=>{
    const div=document.createElement('div'); div.className='project-card';
    div.innerHTML=`${p.image?`<img src="${p.image}" width="100%">`:''}<h4>${p.title}</h4><p>${p.desc}</p>`;
    projectsGrid.appendChild(div);
  });
}

function renderAdminProjects(arr){
  adminProjectsList.innerHTML='';
  if(arr.length===0){ adminProjectsList.innerHTML="<p>لا مشاريع بعد.</p>"; return; }
  arr.forEach(p=>{
    const div=document.createElement('div');
    div.innerHTML=`<strong>${p.title}</strong> <small>${new Date(p.createdAt).toLocaleString()}</small>`;
    adminProjectsList.appendChild(div);
  });
}

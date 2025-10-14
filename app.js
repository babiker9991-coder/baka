document.addEventListener('DOMContentLoaded', () => {

  const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32"; // UID babiker

  const projectsGrid = document.getElementById('projectsGrid');
  const adminBox = document.getElementById('adminBox');
  const notAdminMsg = document.getElementById('notAdminMsg');
  const adminStatus = document.getElementById('adminStatus');
  const adminProjectsList = document.getElementById('adminProjectsList');

  const loginModal = document.getElementById('loginModal');
  const loginBtn = document.getElementById('loginBtn');
  const openLoginBtn = document.getElementById('openLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // دوال عرض الأقسام
  window.showSection = function(id){
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    const el = document.getElementById(id);
    if(el) el.style.display='block';
  };

  window.openLoginModal = function(){ loginModal.style.display='flex'; document.getElementById('loginStatus').textContent=''; };
  window.closeLoginModal = function(){ loginModal.style.display='none'; };

  window.signOutUser = async function(){
    await auth.signOut();
    alert('تم الخروج');
  };

  // تسجيل الدخول
  loginBtn.addEventListener('click', async ()=>{
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value.trim();
    const status = document.getElementById('loginStatus');
    if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
    try{
      await auth.signInWithEmailAndPassword(email, pw);
      status.textContent='تم تسجيل الدخول بنجاح';
      closeLoginModal();
    }catch(e){
      status.textContent='خطأ: '+e.message;
      console.error(e);
    }
  });

  // مراقبة المصادقة
  auth.onAuthStateChanged(user=>{
    if(user){
      openLoginBtn.style.display='none';
      logoutBtn.style.display='inline-block';
      if(user.uid === ADMIN_UID){
        adminBox.style.display='block';
        notAdminMsg.style.display='none';
      } else {
        adminBox.style.display='none';
        notAdminMsg.style.display='block';
      }
    } else {
      openLoginBtn.style.display='inline-block';
      logoutBtn.style.display='none';
      adminBox.style.display='none';
      notAdminMsg.style.display='none';
      const dash = document.getElementById('dashboard');
      if(dash && dash.style.display==='block') showSection('home');
    }
  });

  // إضافة مشروع
  document.getElementById('addProjectBtn').addEventListener('click', async ()=>{
    const title = document.getElementById('projTitle').value.trim();
    const desc = document.getElementById('projDesc').value.trim();
    const file = document.getElementById('projImage').files[0];
    adminStatus.textContent = '';
    if(!title || !desc){ adminStatus.textContent='املأ العنوان والوصف'; return; }

    if(!auth.currentUser || auth.currentUser.uid !== ADMIN_UID){
      adminStatus.textContent='أنت لست مشرفاً';
      return;
    }

    adminStatus.textContent='⏳ جاري رفع المشروع...';

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
      adminStatus.textContent='✅ تم نشر المشروع';
      document.getElementById('projTitle').value='';
      document.getElementById('projDesc').value='';
      document.getElementById('projImage').value='';

    }catch(e){
      adminStatus.textContent='❌ خطأ: '+e.message;
      console.error(e);
    }
  });

  // تحميل المشاريع
  db.ref('projects').orderByChild('createdAt').on('value', snapshot=>{
    const data = snapshot.val() || {};
    const arr = Object.keys(data).map(k=>({ id:k, ...data[k] })).sort((a,b)=>b.createdAt - a.createdAt);

    projectsGrid.innerHTML='';
    if(arr.length===0) projectsGrid.innerHTML='<p class="small">لا توجد مشاريع حتى الآن.</p>';
    else arr.forEach(p=>{
      const div = document.createElement('div');
      div.className='proj-card';
      div.innerHTML=`
        ${p.image? `<img src="${p.image}" alt="${p.title}">`:''}
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      `;
      projectsGrid.appendChild(div);
    });

    // لوحة الإدارة
    adminProjectsList.innerHTML='';
    arr.forEach(p=>{
      const el = document.createElement('div');
      el.className='card small';
      el.style.marginBottom='8px';
      el.innerHTML = `<strong>${p.title}</strong><div class="small">${new Date(p.createdAt).toLocaleString()}</div>`;
      adminProjectsList.appendChild(el);
    });
  });

});

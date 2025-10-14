document.addEventListener('DOMContentLoaded', () => {

  const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32"; // UID المشرف babiker

  const projectsGrid = document.getElementById('projectsGrid');
  const adminBox = document.getElementById('adminBox');
  const notAdminMsg = document.getElementById('notAdminMsg');
  const adminStatus = document.getElementById('adminStatus');
  const adminProjectsList = document.getElementById('adminProjectsList');

  const loginModal = document.getElementById('loginModal');
  const loginBtn = document.getElementById('loginBtn');
  const openLoginBtn = document.getElementById('openLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // عرض/إخفاء الأقسام
  window.showSection = function(id){
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    const el = document.getElementById(id);
    if(el) el.style.display='block';
  };

  // تسجيل الدخول
  window.openLoginModal = function(){ loginModal.style.display='flex'; document.getElementById('loginStatus').textContent=''; };
  window.closeLoginModal = function(){ loginModal.style.display='none'; };

  loginBtn.addEventListener('click', async ()=>{
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value.trim();
    const status = document.getElementById('loginStatus');
    if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
    try{
      const userCredential = await auth.signInWithEmailAndPassword(email, pw);
      status.textContent='تم تسجيل الدخول بنجاح';
      closeLoginModal();
    }catch(e){
      console.error(e);
      status.textContent='خطأ: '+e.message;
    }
  });

  window.signOutUser = async function(){
    await auth.signOut();
    alert('تم الخروج');
  };

  // مراقبة حالة المصادقة
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
   

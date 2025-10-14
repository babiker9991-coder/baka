const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');
const adminProjectsList = document.getElementById('adminProjectsList');

const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const ADMIN_UID = "ضع_UID_المشرف_هنا";

function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

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
  }catch(e){ status.textContent='خطأ: '+e.message;

// Firebase config
const firebaseConfig = {
 
= {
  apiKey: "AIzaSyAWp1YvxwS_RGi9n3j_PPSnTcjM6Y8l-k0",
  authDomain: "sport-f707c.firebaseapp.com",
 معرف المشروع: "Sport-F707C",
 تخزين الجرافة: "sport-f707c.firebasestorage.app",
 رسائل الإرسال: "339029738153",
 معرف التطبيق: "1:339029738153:web:c9bbedfab4f23509879fb8
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

const ADMIN_babiker = "ضع_UID_المشرف";

// DOM
const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');

function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

// Login Modal
function openLoginModal(){ document.getElementById('loginModal').style.display='flex'; document.getElementById('loginStatus').textContent=''; }
function closeLoginModal(){ document.getElementById('loginModal').style.display='none'; }

function loginUser(){
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');
  status.textContent='';
  if(!email || !pw){ status.textContent='املأ البريد وكلمة المرور'; return; }
  auth.signInWithEmailAndPassword(email,pw)
  .then(u=>{ closeLoginModal(); })
  .catch(e=>{ status.textContent=e.message; });
}

function signOutUser(){
  auth.signOut();
}

// Auth state
auth.onAuthStateChanged(user=>{
  document.getElementById('loginBtnHeader').style.display = user ? 'none':'inline-block';
  document.getElementById('logoutBtn').style.display = user ? 'inline-block':'none';

  if(user && user.uid===ADMIN_UID){
    adminBox.style.display='block';
    notAdminMsg.style.display='none';
    showSection('dashboard');
  } else if(user){
    adminBox.style.display='none';
    notAdminMsg.style.display='block';
  } else {
    adminBox.style.display='none';
    notAdminMsg.style.display='none';
  }
});

// Add project
function addProject(){
  const title = document.getElementById('projTitle').value.trim();
  const desc = document.getElementById('projDesc').value.trim();
  const file = document.getElementById('projImage').files[0];
  adminStatus.textContent='';

  if(!title || !desc){ adminStatus.textContent='املأ العنوان والوصف'; return; }
  if(!auth.currentUser || auth.currentUser.uid!==ADMIN_UID){ adminStatus.textContent='أنت لست مشرفا'; return; }

  const newRef = db.ref('projects').push();
  const id = newRef.key;
  adminStatus.textContent='⏳ جاري رفع المشروع...';

  if(file){
    const storageRef = storage.ref().child('projects/'+id+'_'+file.name);
    storageRef.put(file).then(()=>storageRef.getDownloadURL()).then(url=>{
      newRef.set({title,desc,image:url,createdAt:Date.now()});
      adminStatus.textContent='✅ تم النشر';
    }).catch(e=>adminStatus.textContent='❌ '+e.message);
  } else {
    newRef.set({title,desc,image:'',createdAt:Date.now()});
    admin


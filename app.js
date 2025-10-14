// إعداد Firebase
const firebaseConfig = {
  apiKey: "ضع_هنا_apiKey",
  authDomain: "ضع_هنا_authDomain",
  databaseURL: "ضع_هنا_databaseName.firebaseio.com",
  projectId: "ضع_هنا_projectId",
  storageBucket: "ضع_هنا_storageBucket",
  messagingSenderId: "ضع_هنا_senderId",
  appId: "ضع_هنا_appId"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// UID المشرف
const ADMIN_UID = "ضع_هنا_UID_المشرف";

// DOM
const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const loginBox = document.getElementById('loginBox');
const status = document.getElementById('status');
const loginStatus = document.getElementById('loginStatus');

function showSection(id){
  document.querySelectorAll('section').forEach(s=>s.style.display='none');
  document.getElementById(id).style.display='block';
}

// تسجيل دخول
function login(){
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  loginStatus.textContent='';
  auth.signInWithEmailAndPassword(email,pw)
    .then(userCredential=>{
      const user = userCredential.user;
      if(user.uid===ADMIN_UID) adminBox.style.display='block';
      loginBox.style.display='none';
      loginStatus.textContent='تم تسجيل الدخول';
    }).catch(e=>{loginStatus.textContent=e.message;});
}

// إضافة مشروع
function addProject(){
  const title = document.getElementById('projTitle').value;
  const desc = document.getElementById('projDesc').value;
  const file = document.getElementById('projImage').files[0];
  if(!title || !desc){ status.textContent='املأ جميع الحقول'; return; }
  if(!auth.currentUser || auth.currentUser.uid!==ADMIN_UID){ status.textContent='أنت لست مشرفاً'; return; }

  const newRef = db.ref('projects').push();
  const id = newRef.key;
  status.textContent='⏳ جاري رفع المشروع...';

  if(file){
    const storageRef = storage.ref('projects/'+id+'_'+file.name);
    storageRef.put(file).then(()=>storageRef.getDownloadURL().then(url=>{
      newRef.set({title,desc,image:url,createdAt:Date.now()});
      status.textContent='✅ تم النشر';
      loadProjects();
      document.getElementById('projTitle').value='';
      document

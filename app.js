import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { ref as dbRef, set, push, onValue, orderByChild } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32"; // المشرف

// دوال global للـ HTML
window.showSection = function(id){
  document.querySelectorAll(".page").forEach(p => p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
};

window.openLoginModal = function(){ document.getElementById("loginModal").style.display='flex'; };
window.closeLoginModal = function(){ document.getElementById("loginModal").style.display='none'; };
window.signOutUser = async function(){
  await signOut(auth);
  alert("تم الخروج");
  window.showSection('home');
};

// تحميل المشاريع وعرضها
function listenProjects(){
  const projRef = dbRef(db, 'projects');
  onValue(projRef, snapshot=>{
    const data = snapshot.val() || {};
    renderProjects(Object.keys(data).map(k=>({ id:k, ...data[k] })).sort((a,b)=>b.createdAt - a.createdAt));
  });
}

function renderProjects(arr){
  const grid = document.getElementById("projectsGrid");
  grid.innerHTML = '';
  arr.forEach(p=>{
    const div = document.createElement("div");
    div.innerHTML = `<h4>${p.title}</h4><p>${p.desc}</p>${p.image?`<img src="${p.image}" width="200">`:''}`;
    grid.appendChild(div);
  });
}

// لوحة التحكم
function updateAdminPanel(user){
  const adminBox = document.getElementById("adminBox");
  const notAdminMsg = document.getElementById("notAdminMsg");
  if(user && user.uid === ADMIN_UID){
    adminBox.style.display='block';
    notAdminMsg.style.display='none';
  }else{
    adminBox.style.display='none';
    notAdminMsg.style.display='block';
  }
}

// تسجيل الدخول
document.getElementById("loginBtn").addEventListener('click', async ()=>{
  const email = document.getElementById("loginEmail").value;
  const pw = document.getElementById("loginPassword").value;
  if(!email||!pw) return alert("املأ البريد وكلمة المرور");
  try{
    const cred = await signInWithEmailAndPassword(auth,email,pw);
    alert("تم تسجيل الدخول");
    window.closeLoginModal();
    updateAdminPanel(cred.user);
  }catch(e){
    alert("خطأ: "+e.message);
  }
});

// إضافة مشروع
document.getElementById("addProjectBtn").addEventListener('click', async ()=>{
  const title = document.getElementById("projTitle").value;
  const desc = document.getElementById("projDesc").value;
  const file = document.getElementById("projImage").files[0];
  if(!title

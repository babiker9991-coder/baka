// app.js
import { auth, db, storage } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, set, push, onValue } from "firebase/database";

// UID المشرف
const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32";

// عناصر DOM
const projectsGrid = document.getElementById("projectsGrid");
const adminBox = document.getElementById("adminBox");
const notAdminMsg = document.getElementById("notAdminMsg");
const adminStatus = document.getElementById("adminStatus");
const adminProjectsList = document.getElementById("adminProjectsList");
const loginModal = document.getElementById("loginModal");

// فتح/إغلاق النوافذ
window.showSection = function(id){
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const el = document.getElementById(id);
  if(el) el.style.display = "block";
};

window.openLoginModal = function(){ loginModal.style.display = "flex"; };
window.closeLoginModal = function(){ loginModal.style.display = "none"; };

// تسجيل الدخول
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if(!email || !password) return alert("املأ البريد وكلمة المرور");

  try{
    await signInWithEmailAndPassword(auth, email, password);
    alert("تم تسجيل الدخول بنجاح");
    closeLoginModal();
  } catch(e){
    alert("خطأ: " + e.message);
  }
});

// تسجيل الخروج
window.signOutUser = async function(){
  await signOut(auth);
  alert("تم الخروج");
};

// مراقبة حالة المصادقة
onAuthStateChanged(auth, user => {
  if(user){
    document.getElementById("openLoginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    if(user.uid === ADMIN_UID){
      adminBox.style.display = "block";
      notAdminMsg.style.display = "none";
    } else {
      adminBox.style.display = "none";
      notAdminMsg.style.display = "block";
    }
  } else {
    document.getElementById("openLoginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
    adminBox.style.display = "none";
    notAdminMsg.style.display = "none";
    showSection("home");
  }
});

// إضافة مشروع
document.getElementById("addProjectBtn").addEventListener("click", async () => {
  const title = document.getElementById("projTitle").value.trim();
  const desc = document.getElementById("projDesc").value.trim();
  const file = document.getElementById("projImage").files[0];

  if(!title || !desc) return alert("املأ العنوان والوصف");
  if(!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) return alert("أنت لست مشرفاً");

  try{
    const newRef = push(ref(db, "projects"));
    let imageUrl = "";

    if(file){
      const storageRef = ref(storage, 'projects/' + newRef.key + '_' + file.name);
      await storageRef.put(file);
      imageUrl = await storageRef.getDownloadURL();
    }

    await set(newRef, { title, desc, image: imageUrl, createdAt: Date.now() });
    alert("✅ تم نشر المشروع");
  } catch(e){
    alert("❌ خطأ: " + e.message);
  }
});

// تحميل المشاريع
function listenProjects(){
  onValue(ref(db, "projects"), snapshot => {
    const data = snapshot.val() || {};
    renderProjects(Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a,b)=>b.createdAt - a.createdAt));
  });
}

function renderProjects(arr){
  projectsGrid.innerHTML = "";
  if(arr.length === 0) projectsGrid.innerHTML = "<p class='small'>لا توجد مشاريع بعد</p>";
  arr.forEach(p => {
    const div = document.createElement("div");
    div.className = "proj-card";
    div.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ""}
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
    `;
    projectsGrid.appendChild(div);
  });
}

listenProjects();
showSection("home");

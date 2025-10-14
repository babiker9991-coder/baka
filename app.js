// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxoEJLaGcEy7s1P2nE2_bDniS71ldI31Q",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.firebasestorage.app",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e",
  measurementId: "G-XLQB1M9FHQ"
};

// ربط المكتبات
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// بريد المشرف الوحيد المسموح له بالدخول
const adminEmail = "babiker@example.com";

// عناصر HTML
const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMessage = document.getElementById("loginMessage");

// تسجيل الدخول
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user.email === adminEmail) {
      loginSection.style.display = "none";
      adminPanel.style.display = "block";
      loadProjects();
    } else {
      loginMessage.textContent = "فقط المشرف يمكنه الدخول إلى لوحة التحكم.";
      auth.signOut();
    }
  } catch (error) {
    loginMessage.textContent = "خطأ في تسجيل الدخول: " + error.message;
  }
});

// تسجيل الخروج
logoutBtn.addEventListener("click", () => {
  auth.signOut();
  adminPanel.style.display = "none";
  loginSection.style.display = "block";
});

// إضافة مشروع جديد
document.getElementById("addProjectBtn").addEventListener("click", () => {
  const name = document.getElementById("projectName").value.trim();
  const desc = document.getElementById("projectDesc").value.trim();

  if (!name || !desc) {
    alert("الرجاء إدخال جميع البيانات");
    return;
  }

  const newRef = db.ref("projects").push();
  newRef.set({
    name: name,
    description: desc,
    date: new Date().toLocaleString()
  });

  document.getElementById("projectName").value = "";
  document.getElementById("projectDesc").value = "";
  alert("تمت إضافة المشروع بنجاح");
  loadProjects();
});

// تحميل المشاريع من القاعدة
function loadProjects() {
  const projectList = document.getElementById("projectList");
  projectList.innerHTML = "";

  db.ref("projects").on("value", (snapshot) => {
    projectList.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const li = document.createElement("li");
      li.textContent = `${data.name} - ${data.description} (${data.date})`;
      projectList.appendChild(li);
    });
  });
}

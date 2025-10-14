// إعداد Firebase
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

// تهيئة الاتصال
firebase.initializeApp(firebaseConfig);

// المتغيرات العامة
const auth = firebase.auth();
const db = firebase.database();
const adminEmail = "babiker@gmail.com"; // المشرف الوحيد

// تسجيل الدخول
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      if (user.email === adminEmail) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadProjects();
      } else {
        document.getElementById("loginMessage").innerText = "فقط المشرف يمكنه الدخول!";
        auth.signOut();
      }
    })
    .catch(error => {
      document.getElementById("loginMessage").innerText = error.message;
    });
});

// تسجيل الخروج
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut();
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
});

// إضافة مشروع
document.getElementById("addProjectBtn").addEventListener("click", () => {
  const name = document.getElementById("projectName").value.trim();
  const desc = document.getElementById("projectDesc").value.trim();

  if (name && desc) {
    const newRef = db.ref("projects").push();
    newRef.set({
      name,
      description: desc,
      date: new Date().toLocaleString()
    });
    document.getElementById("projectName").value = "";
    document.getElementById("projectDesc").value = "";
    loadProjects();
  } else {
    alert("أدخل جميع البيانات");
  }
});

// تحميل المشاريع
function loadProjects() {
  const list = document.getElementById("projectList");
  list.innerHTML = "";
  db.ref("projects").on("value", snapshot => {
    list.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const li = document.createElement("li");
      li.textContent = `${data.name} - ${data.description} (${data.date})`;
      list.appendChild(li);
    });
  });
}

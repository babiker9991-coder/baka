// ✅ إعداد Firebase (الربط مع مشروعك)
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ✅ التنقل بين الأقسام
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ✅ تسجيل الدخول
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("loginStatus");

  try {
    const userCred = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCred.user.uid;

    // تحقق من أنه المشرف
    if (uid === "k20NLjvISFhaUL7roFU9diedfi32") {
      status.textContent = "تم تسجيل الدخول كمشرف ✅";
      showSection("dashboardSection");
      loadProjects();
    } else {
      status.textContent = "ليس لديك صلاحيات المشرف ❌";
    }

  } catch (error) {
    status.textContent = "خطأ في تسجيل الدخول: " + error.message;
  }
});

// ✅ إضافة مشروع جديد
document.getElementById("addProjectBtn").addEventListener("click", async () => {
  const name = document.getElementById("projectName").value.trim();
  const desc = document.getElementById("projectDesc").value.trim();

  if (!name || !desc) {
    alert("يرجى إدخال اسم ووصف المشروع");
    return;
  }

  try {
    const newRef = db.ref("projects").push();
    await newRef.set({
      name: name,
      description: desc,
      date: new Date().toLocaleString()
    });
    alert("تمت إضافة المشروع بنجاح ✅");
    loadProjects();
  } catch (err) {
    alert("حدث خطأ أثناء الإضافة ❌ " + err.message);
  }
});

// ✅ تحميل المشاريع
function loadProjects() {
  const list = document.getElementById("projectList");
  list.innerHTML = "";

  db.ref("projects").on("value", snapshot => {
    list.innerHTML = "";
    snapshot.forEach(child => {
      const li = document.createElement("li");
      li.textContent = `${child.val().name} - ${child.val().description}`;
      list.appendChild(li);
    });
  });
}

// ====== Firebase config ======
const firebaseConfig = {
  apiKey: "AIzaSyDxoEJLaGcEy7s1P2nE2_bDniS71ldI31Q",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.appspot.com",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e",
  measurementId: "G-XLQB1M9FHQ"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// ====== UID المشرف ======
const ADMIN_UID = "k20NLjvISFhaUL7roFU9diedfi32";

// ====== DOM ======
const projectsGrid = document.getElementById('projectsGrid');
const adminBox = document.getElementById('adminBox');
const notAdminMsg = document.getElementById('notAdminMsg');
const adminStatus = document.getElementById('adminStatus');
const adminProjectsList = document.getElementById('adminProjectsList');
const loginModal = document.getElementById('loginModal');
const logoutBtn = document.getElementById('logoutBtn');

// ====== Show section ======
function showSection(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

// ====== Login Modal ======
function openLoginModal() { loginModal.style.display = 'flex'; }
function closeLoginModal() { loginModal.style.display = 'none'; }

// ====== Auth ======
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail').value.trim();
      const pw = document.getElementById('loginPassword').value.trim();
      const status = document.getElementById('loginStatus');
      status.textContent = '';
      if (!email || !pw) { status.textContent = 'املأ البريد وكلمة المرور'; return; }
      try {
        await auth.signInWithEmailAndPassword(email, pw);
        status.textContent = 'تم تسجيل الدخول بنجاح';
        closeLoginModal();
      } catch (e) {
        console.error(e);
        status.textContent = 'خطأ: ' + e.message;
      }
    });
  }

  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', async () => {
      const title = document.getElementById('projTitle').value.trim();
      const desc = document.getElementById('projDesc').value.trim();
      const file = document.getElementById('projImage').files[0];
      adminStatus.textContent = '';
      if (!title || !desc) { adminStatus.textContent = 'املأ العنوان والوصف'; return; }
      if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) { adminStatus.textContent = 'أنت لست مشرفاً'; return; }

      adminStatus.textContent = '⏳ جاري رفع المشروع...';
      try {
        const newRef = db.ref('projects').push();
        const id = newRef.key;
        let imageUrl = '';
        if (file) {
          const storageRef = storage.ref().child('projects/' + id + '_' + file.name);
          await storageRef.put(file);
          imageUrl = await storageRef.getDownloadURL();
        }
        await newRef.set({ title, desc, image: imageUrl, createdAt: Date.now() });
        adminStatus.textContent = '✅ تم نشر المشروع بنجاح';
        document.getElementById('projTitle').value = '';
        document.getElementById('projDesc').value = '';
        document.getElementById('projImage').value = '';
      } catch (e) {
        console.error(e);
        adminStatus.textContent = '❌ خطأ: ' + e.message;
      }
    });
  }

  showSection('home');
  listenProjects();
});

// ====== Sign Out ======
function signOutUser() {
  auth.signOut();
  alert('تم تسجيل الخروج بنجاح');
  showSection('home');
}

// ====== Auth state ======
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('openLoginBtn').style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (user.uid === ADMIN_UID) {
      adminBox.style.display = 'block';
      notAdminMsg.style.display = 'none';
    } else {
      adminBox.style.display = 'none';
      notAdminMsg.style.display = 'block';
    }
  } else {
    document.getElementById('openLoginBtn').style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    adminBox.style.display = 'none';
    notAdminMsg.style.display = 'none';
  }
});

// ====== Projects listener ======
function listenProjects() {
  db.ref('projects').orderByChild('createdAt').on('value', snapshot => {
    const data = snapshot.val() || {};
    const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }))
      .sort((a, b) => b.createdAt - a.createdAt);
    renderProjects(arr);
    renderAdminProjects(arr);
  });
}

// ====== Render projects ======
function renderProjects(arr) {
  projectsGrid.innerHTML = '';
  if (arr.length === 0) {
    projectsGrid.innerHTML = '<p class="small">لا توجد مشاريع حالياً.</p>';
    return;
  }
  arr.forEach(p => {
    const div = document.createElement('div');
    div.className = 'proj-card';
    div.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
    `;
    projectsGrid.appendChild(div);
  });
}

// ====== Render admin projects ======
function renderAdminProjects(arr) {
  adminProjectsList.innerHTML = '';
  if (arr.length === 0) {
    adminProjectsList.innerHTML = '<p class="small">لا توجد مشاريع بعد.</p>';
    return;
  }
  arr.forEach(p => {
    const div = document.createElement('div');
    div.className = 'proj-card';
    div.innerHTML = `
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
      <button class="btn" onclick="deleteProject('${p.id}')">🗑️ حذف</button>
    `;
    adminProjectsList.appendChild(div);
  });
}

// ====== Delete project ======
async function deleteProject(id) {
  if (!confirm('هل أنت متأكد من حذف المشروع؟')) return;
  try {
    await db.ref('projects/' + id).remove();
    alert('تم حذف المشروع بنجاح ✅');
  } catch (e) {
    console.error(e);
    alert('خطأ في الحذف: ' + e.message);
  }
}

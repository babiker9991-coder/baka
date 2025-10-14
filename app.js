<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>الحضري نت - اتصال قاعدة البيانات</title>
<style>
body {
  font-family: "Cairo", sans-serif;
  background: #f3f5f7;
  margin: 0;
  padding: 20px;
  direction: rtl;
}
.container {
  max-width: 600px;
  margin: auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}
input, textarea, button {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}
button {
  background: #6a1b9a;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
button:hover { background: #4a148c; }
#status { color: green; font-weight: bold; margin-top: 8px; }
</style>
</head>
<body>

<div class="container">
  <h2>📡 اختبار اتصال قاعدة بيانات Firebase</h2>
  <input type="text" id="title" placeholder="عنوان المشاركة">
  <textarea id="content" placeholder="محتوى المشاركة"></textarea>
  <button onclick="savePost()">💾 حفظ المشاركة</button>
  <p id="status"></p>
</div>

<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-database-compat.js"></script>

<script>
// 🔧 إعداد Firebase — غيّر القيم لتناسب مشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDxoEJLaGcEy7s1P2nE2_bDniS71ldI31Q",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com/",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.appspot.com",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e"
};

// ✅ تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🟢 حفظ المشاركة في قاعدة البيانات
function savePost() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const status = document.getElementById("status");

  if (!title || !content) {
    status.style.color = "red";
    status.textContent = "⚠️ الرجاء تعبئة جميع الحقول";
    return;
  }

  // 🔹 حفظ البيانات داخل مجلد "posts"
  db.ref("posts").push({
    title: title,
    content: content,
    createdAt: new Date().toISOString()
  })
  .then(() => {
    status.style.color = "green";
    status.textContent = "✅ تم الحفظ بنجاح في Firebase!";
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
  })
  .catch(error => {
    status.style.color = "red";
    status.textContent = "❌ خطأ في الحفظ: " + error.message;
    console.error(error);
  });
}
</script>

</body>
</html>

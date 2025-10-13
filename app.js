/*************************
 * app.js — AlHadariNet
 *************************/

/* 1) ضع هنا إعدادات Firebase الخاصة بمشروعك */
const firebaseConfig = {
  apiKey: "ضع_apiKey_هنا",
  authDomain: "ضع_authDomain_هنا",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com", // غيّرها إن كان اسم مشروعك مختلف
  projectId: "ضع_projectId_هنا",
  storageBucket: "ضع_projectId_هنا.appspot.com",
  messagingSenderId: "ضع_messagingSenderId_هنا",
  appId: "ضع_appId_هنا"
};
/* ======================================= */

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

/* إعدادات بسيطة */
const ADMIN_PW = "221133"; // كلمة مرور المشرف السريعة — غيّرها
let CURRENT_OPEN_POST = null;

/* عناصر DOM */
const liveTicker = document.getElementById('liveTicker');
const newsGrid = document.getElementById('newsGrid');
const heroTitle = document.getElementById('heroTitle');
const heroExcerpt = document.getElementById('heroExcerpt');
const heroImage = document.getElementById('heroImage');
const newsListAll = document.getElementById('newsListAll');
const hotList = document.getElementById('hotList');

/* show/hide sections */
function showSection(id){
  const sections = ['home','news','matches','standings','teams','forum'];
  // home mapping
  document.getElementById('homeSection').style.display = id==='home' ? 'block': 'none';
  document.getElementById('newsSection').style.display = id==='news' ? 'block' : 'none';
  document.getElementById('matchesSection').style.display = id==='matches' ? 'block' : 'none';
  document.getElementById('standingsSection').style.display = id==='standings' ? 'block' : 'none';
  document.getElementById('teamsSection').style.display = id==='teams' ? 'block' : 'none';
  document.getElementById('forumSection').style.display = id==='forum' ? 'block' : 'none';
}

/* refresh main hero (latest post) */
function refreshHero(){
  db.ref('news').orderByChild('createdAt').limitToLast(1).once('value').then(snap=>{
    const val = snap.val();
    if(!val) return;
    const key = Object.keys(val)[0];
    const post = val[key];
    heroTitle.textContent = post.title || 'عنوان';
    heroExcerpt.textContent = (post.excerpt || (post.content||'').slice(0,180)) + '...';
    heroImage.src = post.image || 'https://via.placeholder.com/420x260?text=Sport';
  });
}

/* load live ticker */
function loadTicker(){
  db.ref('liveScores').limitToLast(10).on('value', snap=>{
    liveTicker.querySelectorAll('.item')?.forEach(n=>n.remove());
    const data = snap.val();
    if(!data) return;
    Object.keys(data).forEach(k=>{
      const it = data[k];
      const el = document.createElement('div'); el.className='item';
      el.textContent = `${it.home} ${it.homeScore||0} - ${it.awayScore||0} ${it.away}`;
      liveTicker.appendChild(el);
    });
  });
}

/* load main news grid & lists */
function loadNews(){
  db.ref('news').orderByChild('createdAt').on('value', snap=>{
    newsGrid.innerHTML = '';
    newsListAll.innerHTML = '';
    hotList.innerHTML = '';
    const data = snap.val();
    if(!data){ newsGrid.innerHTML = '<div class="card">لا توجد أخبار</div>'; return;}
    // convert to array sorted desc
    const arr = Object.keys(data).map(k=>({id:k,v:data[k]})).sort((a,b)=>b.v.createdAt - a.v.createdAt);
    // hero/ grid
    arr.slice(0,4).forEach(e=>{
      const p = e.v;
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<h3>${escapeHtml(p.title)}</h3>
        <p class="meta">${new Date(p.createdAt).toLocaleString()}</p>
        <p>${escapeHtml((p.excerpt||p.content||'').slice(0,140))}...</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn" onclick="openPost('${e.id}','news')">اقرأ</button>
          <button class="btn ghost" onclick="likePost('news','${e.id}')">❤️ ${p.likes||0}</button>
        </div>`;
      newsGrid.appendChild(card);
    });
    // full list + hot list
    arr.forEach(e=>{
      const p = e.v;
      const item = document.createElement('div'); item.className='card';
      item.innerHTML = `<h4>${p.title}</h4><p class="meta">${new Date(p.createdAt).toLocaleString()}</p>
        <p>${escapeHtml((p.excerpt||p.content||'').slice(0,220))}...</p>
        <div style="display:flex;gap:6px"><button class="btn" onclick="openPost('${e.id}','news')">قراءة</button>
        <button class="btn ghost" onclick="likePost('news','${e.id}')">❤️ ${p.likes||0}</button></div>`;
      newsListAll.appendChild(item);
      const li = document.createElement('li'); li.innerHTML = `<a href="#" onclick="openPost('${e.id}','news')">${p.title}</a>`;
      hotList.appendChild(li);
    });
  });
}

/* open post modal */
function openPost(id, section){
  CURRENT_OPEN_POST = {id, section};
  db.ref(`${section}/${id}`).once('value').then(snap=>{
    const data = snap.val();
    if(!data) return alert('المشاركة غير موجودة');
    const container = document.getElementById('postFull');
    container.innerHTML = `<h2>${escapeHtml(data.title)}</h2>
      <p class="meta">${new Date(data.createdAt).toLocaleString()}</p>
      ${data.image?'<img src="'+data.image+'" style="max-width:100%;border-radius:8px;margin:8px 0">':''}
      <div>${data.content}</div>
      <div style="margin-top:8px"><button class="btn" onclick="likePost('${section}','${id}')">❤️ ${data.likes||0}</button></div>`;
    loadComments(section,id);
    document.getElementById('postModal').style.display='flex';
  }).catch(err=>{console.error(err); alert('خطأ عند تحميل المشاركة')});
}
function closePostModal(){ document.getElementById('postModal').style.display='none'; CURRENT_OPEN_POST = null; }

/* comments */
function loadComments(section,id){
  const commentsEl = document.getElementById('postComments');
  commentsEl.innerHTML = '';
  db.ref(`${section}/${id}/comments`).on('value', snap=>{
    commentsEl.innerHTML = '';
    const data = snap.val();
    if(!data) { commentsEl.innerHTML = '<p class="small">لا تعليقات بعد</p>'; return; }
    Object.keys(data).forEach(k=>{
      const c = data[k];
      const d = document.createElement('div'); d.className='comment';
      d.innerHTML = `<strong>${escapeHtml(c.user||'زائر')}</strong><div>${escapeHtml(c.text)}</div><div class="small">${new Date(c.createdAt).toLocaleString()}</div>`;
      commentsEl.appendChild(d);
    });
  });
}
function submitComment(){
  if(!CURRENT_OPEN_POST) return alert('افتح مشاركة أولاً');
  const name = document.getElementById('commentName').value.trim() || 'زائر';
  const text = document.getElementById('commentText').value.trim();
  if(!text) return alert('اكتب تعليقاً');
  const {id, section} = CURRENT_OPEN_POST;
  db.ref(`${section}/${id}/comments`).push({user:name, text, createdAt:Date.now()})
    .then(()=>{ document.getElementById('commentText').value=''; })
    .catch(err=>{ console.error(err); alert('خطأ عند إرسال التعليق')});
}

/* like */
function likePost(section,id){
  const ref = db.ref(`${section}/${id}/likes`);
  ref.transaction(c => (c||0)+1 );
}

/* admin quick login (local prompt + panel) */
function openAdminPanel(){ document.getElementById('adminBox').style.display='block'; }
function adminLogin(){
  const pw = document.getElementById('adminPass').value.trim();
  if(pw === ADMIN_PW){
    document.getElementById('adminBox').style.display='none';
    document.getElementById('newPostModal').style.display='flex';
    alert('تم الدخول كمشرف (سريع)');
  } else {
    alert('كلمة مرور خاطئة');
  }
}
function adminLogout(){
  document.getElementById('adminBox').style.display='none';
  alert('تم تسجيل الخروج');
}

/* new post modal actions */
function openNewPostModal(){ document.getElementById('newPostModal').style.display='flex'; }
function closeNewPostModal(){ document.getElementById('newPostModal').style.display='none'; }
function publishPost(){
  const title = document.getElementById('npTitle').value.trim();
  const excerpt = document.getElementById('npExcerpt').value.trim();
  const content = document.getElementById('npContent').value.trim();
  const file = document.getElementById('npImage').files[0];
  const category = document.getElementById('npCat').value;
  const status = document.getElementById('npStatus'); status.textContent = '';
  if(!title || !content){ status.textContent = 'املأ العنوان والمحتوى'; return; }
  // upload image if any
  if(file){
    const ref = storage.ref('posts/'+Date.now()+'_'+file.name);
    ref.put(file).then(snap=> snap.ref.getDownloadURL()).then(url=>{
      return db.ref(category).push({title,excerpt,content,image:url,createdAt:Date.now(),likes:0});
    }).then(()=>{ status.textContent='✅ تم النشر'; closeNewPostModal(); })
    .catch(err=>{ console.error(err); status.textContent='❌ خطأ'; });
  } else {
    db.ref(category).push({title,excerpt,content,createdAt:Date.now(),likes:0})
      .then(()=>{ status.textContent='✅ تم النشر'; closeNewPostModal(); })
      .catch(err=>{ console.error(err); status.textContent='❌ خطأ'; });
  }
}

/* helper: search */
function doSearch(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if(!q) return alert('اكتب كلمة للبحث');
  Promise.all([db.ref('news').once('value'), db.ref('articles').once('value')]).then(([n,a])=>{
    const results = [];
    const nv = n.val()||{}, av = a.val()||{};
    Object.keys(nv).forEach(k=>{ if((nv[k].title||'').toLowerCase().includes(q)) results.push({id:k,section:'news',title:nv[k].title}); });
    Object.keys(av).forEach(k=>{ if((av[k].title||'').toLowerCase().includes(q)) results.push({id:k,section:'articles',title:av[k].title}); });
    if(!results.length) return alert('لا توجد نتائج');
    // عرض سريع بالـ alert (يمكن تعديل لعرض داخل صفحة)
    alert('نتائج البحث:\n' + results.map(r=>r.title).join('\n'));
  });
}

/* utility */
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* initial loads */
refreshHero();
loadTicker();
loadNews();

/* optional: load other modules (matches/standings/teams/forum) if exist */
db.ref('matches').once('value').then(snap=>{
  const v = snap.val();
  if(v){
    const keys = Object.keys(v);
    const container = document.getElementById('matchesList'); container.innerHTML = '';
    keys.sort((a,b)=>v[a].time - v[b].time).forEach(k=>{
      const m = v[k];
      const d = document.createElement('div'); d.className='card';
      d.innerHTML = `<strong>${m.home} vs ${m.away}</strong><p class="meta">${new Date(m.time).toLocaleString()}</p>`;
      container.appendChild(d);
    });
  }
}).catch(()=>{ /* ignore */ });

/* END of app.js */

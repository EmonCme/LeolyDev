/**
 * LEOLY DEV CORE PLATFORM ENGINE
 * Architecture: Serverless Engine / Local Storage Sync Manifest
 */

// STATE MANAGEMENT GLOBALS
let db = null;
let currentActiveSection = 'home';
let analyticsChartInstance = null;
let projectEditingId = null;
let shopEditingId = null;

// ADMINISTRATIVE SESSION KEYS
const SESSION_AUTH_KEY = 'leoly_auth_session';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeDatabase();
  setupNavigationRouter();
  setupUIInteractions();
  setupAdminEngine();
  hideLoadingScreen();
});

/**
 * INITIALIZE DATABASE ENGINE
 * Fetches default seed definition from database.json or binds state cache
 */
async function initializeDatabase() {
  const cachedData = localStorage.getItem('leoly_db_manifest');
  if (cachedData) {
    db = JSON.parse(cachedData);
  } else {
    try {
      const response = await fetch('database.json');
      if (!response.ok) throw new Error("Fallback fetch failed descriptor.");
      db = await response.json();
      saveDatabaseToCache();
    } catch (err) {
      showToast("Gagal memuat arsitektur database.json. Menginisialisasi skema kosong.", "error");
      db = { website: { title: "Leoly Dev" }, home: {}, about: { skills: [] }, projects: [], shop: [], donate: {}, contact: {}, statistics: {}, settings: {} };
    }
  }
  
  // Track synthetic structural visitor stats
  if (!sessionStorage.getItem('leoly_visitor_counted')) {
    db.statistics.visitors = (db.statistics.visitors || 0) + 1;
    sessionStorage.setItem('leoly_visitor_counted', 'true');
    saveDatabaseToCache();
  }

  applyDatabaseToDOM();
}

function saveDatabaseToCache() {
  localStorage.setItem('leoly_db_manifest', JSON.stringify(db));
}

/**
 * DOM SYNC ENGINE
 * Binds JSON nodes variables to structural tags template interface
 */
function applyDatabaseToDOM() {
  if (!db) return;

  // MAINTENANCE WALL CHECK
  if (db.settings?.maintenance === true && !localStorage.getItem(SESSION_AUTH_KEY)) {
    document.getElementById('maintenance-screen').classList.remove('hidden-panel');
    document.getElementById('app-container').classList.add('hidden-panel');
    return;
  } else {
    document.getElementById('maintenance-screen').classList.add('hidden-panel');
    document.getElementById('app-container').classList.remove('hidden-panel');
  }

  // GLOBAL METADATA & CORE UI
  document.title = db.website.title || "Leoly Dev";
  document.getElementById('web-logo-txt').innerText = `${db.website.logo || '⚡'} ${db.website.title || 'Leoly Dev'}`;
  document.getElementById('sidebar-brand').innerText = db.website.title || "Leoly Dev";

  // HERO RENDER
  document.getElementById('hero-title-node').innerText = db.home.title || "";
  document.getElementById('hero-subtitle-node').innerText = db.home.subtitle || "";
  document.getElementById('hero-desc-node').innerText = db.home.description || "";
  document.getElementById('hero-btn1').innerText = db.home.button1 || "Explore";
  document.getElementById('hero-btn2').innerText = db.home.button2 || "Contact";

  // PROFILE RENDER (ABOUT)
  const aboutImg = document.getElementById('about-img-node');
  aboutImg.src = db.about.photo || "";
  lazyLoadImageElement(aboutImg);
  document.getElementById('about-desc-node').innerText = db.about.description || "";
  
  const skillsWrap = document.getElementById('about-skills-node');
  skillsWrap.innerHTML = "";
  if (db.about.skills) {
    db.about.skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerText = skill;
      skillsWrap.appendChild(tag);
    });
  }

  // GATEWAY & CONNECTORS RENDER
  const qrisImg = document.getElementById('donate-qris-node');
  qrisImg.src = db.donate.qris || "";
  lazyLoadImageElement(qrisImg);
  document.getElementById('donate-dana-node').innerText = db.donate.dana || "-";
  document.getElementById('donate-ovo-node').innerText = db.donate.ovo || "-";
  document.getElementById('donate-gopay-node').innerText = db.donate.gopay || "-";
  document.getElementById('donate-saweria-node').href = db.donate.saweria || "#";

  document.getElementById('ctx-wa').href = db.contact.whatsapp || "#";
  document.getElementById('ctx-tg').href = db.contact.telegram || "#";
  document.getElementById('ctx-mail').href = db.contact.email || "#";
  document.getElementById('ctx-ig').href = db.contact.instagram || "#";
  document.getElementById('ctx-git').href = db.contact.github || "#";

  // POPULATE CASE STUDIES AND PRODUCTS CATALOGS
  renderProjectsGrid();
  renderShopGrid();
  populateFilterDropdowns();
}

/**
 * PROJECT RE-RENDER ENGINE (WITH FILTERS AND SEARCH CAPABILITIES)
 */
function renderProjectsGrid() {
  const container = document.getElementById('project-grid-node');
  container.innerHTML = "";
  
  const searchVal = document.getElementById('project-search').value.toLowerCase();
  const filterVal = document.getElementById('project-filter').value;

  const filtered = db.projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
    const matchCat = (filterVal === 'all') || (p.category === filterVal);
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-card text-center text-secondary" style="grid-column: 1/-1; padding: 3rem;">No project data found architecture configuration.</div>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card premium-card';
    card.innerHTML = `
      <div class="card-thumb-area">
        <span class="card-badge">${p.category}</span>
        <img src="${p.thumbnail}" alt="${p.title}" class="lazy-image">
      </div>
      <div class="card-body">
        <h4 class="card-title">${p.title}</h4>
        <p class="card-description text-secondary">${p.description}</p>
        <div class="card-footer-actions">
          <a href="${p.demoUrl}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>
          <a href="${p.sourceUrl}" target="_blank" class="btn btn-secondary"><i class="fa-brands fa-github"></i> Code</a>
        </div>
      </div>
    `;
    container.appendChild(card);
    lazyLoadImageElement(card.querySelector('.lazy-image'));
  });
}

/**
 * ECOMMERCE SHOP CATALOG RENDER
 */
function renderShopGrid() {
  const container = document.getElementById('shop-grid-node');
  container.innerHTML = "";
  const searchVal = document.getElementById('shop-search').value.toLowerCase();

  const filtered = db.shop.filter(s => s.title.toLowerCase().includes(searchVal) || s.description.toLowerCase().includes(searchVal));

  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-card text-center text-secondary" style="grid-column: 1/-1; padding: 3rem;">No products available matching criteria.</div>`;
    return;
  }

  filtered.forEach(s => {
    const card = document.createElement('div');
    card.className = 'glass-card premium-card';
    card.innerHTML = `
      <div class="card-thumb-area">
        <span class="card-badge" style="background:rgba(16,185,129,0.85);">${s.price}</span>
        <img src="${s.thumbnail}" alt="${s.title}" class="lazy-image">
      </div>
      <div class="card-body">
        <h4 class="card-title">${s.title}</h4>
        <p class="card-description text-secondary">${s.description}</p>
        <div class="card-footer-actions">
          <a href="${s.buyUrl}" target="_blank" class="btn btn-primary" style="width:100%;"><i class="fa-solid fa-cart-shopping"></i> Aquisition Link</a>
        </div>
      </div>
    `;
    container.appendChild(card);
    lazyLoadImageElement(card.querySelector('.lazy-image'));
  });
}

function populateFilterDropdowns() {
  const filterSelect = document.getElementById('project-filter');
  const currentVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="all">All Architecture</option>';
  
  const categories = [...new Set(db.projects.map(p => p.category))];
  categories.forEach(cat => {
    if (cat) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.innerText = cat;
      filterSelect.appendChild(opt);
    }
  });
  filterSelect.value = currentVal;
}

/**
 * CLIENT NAVIGATION ENGINE ROUTER
 * High Performance SPA Router mapping window scroll positions to active highlights
 */
function setupNavigationRouter() {
  const sections = document.querySelectorAll('.content-section');
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item:not(.admin-trigger-btn)');

  function setActiveViewTab(id) {
    sections.forEach(s => s.classList.remove('active-view'));
    navItems.forEach(n => n.classList.remove('active'));

    const targetSec = document.getElementById(id);
    if (targetSec) {
      targetSec.classList.add('active-view');
      currentActiveSection = id;
    }
    
    const targetNav = document.querySelector(`.sidebar-nav .nav-item[data-section="${id}"]`);
    if (targetNav) targetNav.classList.add('active');
  }

  // Intercept navigation item link hooks
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSectionId = item.getAttribute('data-section');
      window.location.hash = targetSectionId;
      setActiveViewTab(targetSectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Close mobile drawer structural configuration automatically
      document.getElementById('right-sidebar').classList.remove('mobile-open');
    });
  });

  // Read URL active hashes on load sequence triggers
  if (window.location.hash) {
    const rawHash = window.location.hash.substring(1);
    if (document.getElementById(rawHash)) setActiveViewTab(rawHash);
  }

  // BACK TO TOP UTILITY TRIGGERS
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btt.classList.add('show-btn');
    else btt.classList.remove('show-btn');
  });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/**
 * COMPONENT INTERACTION UI LOGIC BUILDERS
 * Handles Gemini sidebars collapse transformations, image previews & upload behaviors
 */
function setupUIInteractions() {
  const sidebar = document.getElementById('right-sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');

  collapseBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  toggleBtn.addEventListener('click', () => sidebar.classList.add('mobile-open'));
  closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('mobile-open'));

  // Live input image fields upload resource links preview builders
  document.querySelectorAll('.img-preview-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const previewImg = input.nextElementSibling;
      if (previewImg && previewImg.classList.contains('input-preview-box')) {
        previewImg.src = e.target.value;
      }
    });
  });

  // Bind live grid searching configurations UI event loops
  document.getElementById('project-search').addEventListener('input', renderProjectsGrid);
  document.getElementById('project-filter').addEventListener('change', renderProjectsGrid);
  document.getElementById('shop-search').addEventListener('input', renderShopGrid);
}

/**
 * ADMINISTRATIVE ENGINE HUB
 * Full CRUD controllers, serialization schemes and state sync parameters
 */
function setupAdminEngine() {
  const adminNavLink = document.getElementById('admin-nav-link');
  const modalOverlay = document.getElementById('admin-modal');
  const authCard = document.getElementById('admin-auth-card');
  const dashboardCard = document.getElementById('admin-dashboard-card');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');

  adminNavLink.addEventListener('click', (e) => {
    e.preventDefault();
    modalOverlay.classList.remove('hidden-panel');
    if (localStorage.getItem(SESSION_AUTH_KEY) === 'authorized') {
      showAdminDashboard();
    } else {
      authCard.classList.remove('hidden-panel');
      dashboardCard.classList.add('hidden-panel');
    }
  });

  // Modal Closures Handler Interceptions
  document.querySelectorAll('.close-modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => modalOverlay.classList.add('hidden-panel'));
  });

  // AUTH LOGICS CONTROL
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('auth-user').value;
    const p = document.getElementById('auth-pass').value;
    const remember = document.getElementById('auth-remember').checked;

    if (u === 'admin' && p === 'admin123') {
      if (remember) localStorage.setItem(SESSION_AUTH_KEY, 'authorized');
      else sessionStorage.setItem(SESSION_AUTH_KEY, 'authorized');
      
      showToast("Token Otorisasi Berhasil Disinkronkan.", "success");
      showAdminDashboard();
    } else {
      showToast("Token Kredensial Tidak Valid.", "error");
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(SESSION_AUTH_KEY);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    showToast("Sesi Administrasi Berakhir.", "info");
    authCard.classList.remove('hidden-panel');
    dashboardCard.classList.add('hidden-panel');
    applyDatabaseToDOM(); 
  });

  setupAdminTabs();
  setupAdminFormSubmits();
  setupCRUDControls();
  setupJSONManagerActions();
}

function showAdminDashboard() {
  document.getElementById('admin-auth-card').classList.add('hidden-panel');
  document.getElementById('admin-dashboard-card').classList.remove('hidden-panel');
  loadDataToAdminForms();
  renderAdminCRUDTables();
  initAnalyticsChart();
}

function setupAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
  });
}

/**
 * ADMIN FORM BINDINGS LOAD OPERATION
 */
function loadDataToAdminForms() {
  // Update quantitative matrix stats labels counters
  document.getElementById('m-visitors').innerText = db.statistics.visitors || 0;
  document.getElementById('m-projects').innerText = db.projects.length;
  document.getElementById('m-products').innerText = db.shop.length;
  document.getElementById('m-donations').innerText = `Rp ${(db.statistics.donations || 0).toLocaleString('id-ID')}`;

  // Tab 2: Core configuration settings bindings
  document.getElementById('adm-web-title').value = db.website.title || "";
  document.getElementById('adm-web-desc').value = db.website.description || "";
  document.getElementById('adm-web-logo').value = db.website.logo || "";
  const bannerInp = document.getElementById('adm-web-banner');
  bannerInp.value = db.website.banner || "";
  bannerInp.nextElementSibling.src = db.website.banner || "";
  document.getElementById('adm-sys-maintenance').checked = db.settings?.maintenance || false;

  // Tab 3: Hero values parameters bindings
  document.getElementById('adm-home-title').value = db.home.title || "";
  document.getElementById('adm-home-subtitle').value = db.home.subtitle || "";
  document.getElementById('adm-home-desc').value = db.home.description || "";
  document.getElementById('adm-home-btn1').value = db.home.button1 || "";
  document.getElementById('adm-home-btn2').value = db.home.button2 || "";

  // Tab 4: About system configurations arrays fields
  const aboutPhotoInp = document.getElementById('adm-about-photo');
  aboutPhotoInp.value = db.about.photo || "";
  aboutPhotoInp.nextElementSibling.src = db.about.photo || "";
  document.getElementById('adm-about-desc').value = db.about.description || "";
  document.getElementById('adm-about-skills').value = db.about.skills ? db.about.skills.join(', ') : "";

  // Tab 7: Channels parameters configurations inputs fields mapping hooks bindings
  const donQris = document.getElementById('adm-don-qris');
  donQris.value = db.donate.qris || "";
  donQris.nextElementSibling.src = db.donate.qris || "";
  document.getElementById('adm-don-saweria').value = db.donate.saweria || "";
  document.getElementById('adm-don-dana').value = db.donate.dana || "";
  document.getElementById('adm-don-ovo').value = db.donate.ovo || "";
  document.getElementById('adm-don-gopay').value = db.donate.gopay || "";

  document.getElementById('adm-ctx-wa').value = db.contact.whatsapp || "";
  document.getElementById('adm-ctx-tg').value = db.contact.telegram || "";
  document.getElementById('adm-ctx-mail').value = db.contact.email || "";
  document.getElementById('adm-ctx-ig').value = db.contact.instagram || "";
  document.getElementById('adm-ctx-git').value = db.contact.github || "";
}

function setupAdminFormSubmits() {
  // Global metadata config submission
  document.getElementById('form-core-web').addEventListener('submit', (e) => {
    e.preventDefault();
    db.website.title = document.getElementById('adm-web-title').value;
    db.website.description = document.getElementById('adm-web-desc').value;
    db.website.logo = document.getElementById('adm-web-logo').value;
    db.website.banner = document.getElementById('adm-web-banner').value;
    db.settings.maintenance = document.getElementById('adm-sys-maintenance').checked;
    commitSystemCoreSave("Metadata Inti Website Diperbarui.");
  });

  // Hero form setup submission
  document.getElementById('form-hero-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    db.home.title = document.getElementById('adm-home-title').value;
    db.home.subtitle = document.getElementById('adm-home-subtitle').value;
    db.home.description = document.getElementById('adm-home-desc').value;
    db.home.button1 = document.getElementById('adm-home-btn1').value;
    db.home.button2 = document.getElementById('adm-home-btn2').value;
    commitSystemCoreSave("Hero Matrix Configurations Saved.");
  });

  // About panel context updates submissions
  document.getElementById('form-about-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    db.about.photo = document.getElementById('adm-about-photo').value;
    db.about.description = document.getElementById('adm-about-desc').value;
    db.about.skills = document.getElementById('adm-about-skills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    commitSystemCoreSave("Profile Array Manifest Synced.");
  });

  // Financial system endpoints updates submissions
  document.getElementById('form-gateways').addEventListener('submit', (e) => {
    e.preventDefault();
    db.donate.qris = document.getElementById('adm-don-qris').value;
    db.donate.saweria = document.getElementById('adm-don-saweria').value;
    db.donate.dana = document.getElementById('adm-don-dana').value;
    db.donate.ovo = document.getElementById('adm-don-ovo').value;
    db.donate.gopay = document.getElementById('adm-don-gopay').value;

    db.contact.whatsapp = document.getElementById('adm-ctx-wa').value;
    db.contact.telegram = document.getElementById('adm-ctx-tg').value;
    db.contact.email = document.getElementById('adm-ctx-mail').value;
    db.contact.instagram = document.getElementById('adm-ctx-ig').value;
    db.contact.github = document.getElementById('adm-ctx-git').value;
    commitSystemCoreSave("Routing Network Channels Matrix Re-aligned.");
  });
}

function commitSystemCoreSave(msg) {
  saveDatabaseToCache();
  applyDatabaseToDOM();
  loadDataToAdminForms();
  showToast(msg || "State Synchronized Successfully.", "success");
}

/**
 * INDUSTRIAL INLINE CRUD OPERATIONS ARRAYS MANAGEMENT
 */
function setupCRUDControls() {
  // PROJECTS ARRAY MANAGEMENTS
  const pForm = document.getElementById('form-project-crud');
  document.getElementById('open-add-project-btn').addEventListener('click', () => {
    projectEditingId = null;
    pForm.reset();
    document.getElementById('crud-project-title-label').innerText = "New Project Struct Node";
    pForm.querySelector('.input-preview-box').src = "";
    pForm.classList.remove('hidden-panel');
  });
  document.getElementById('cancel-project-btn').addEventListener('click', () => pForm.classList.add('hidden-panel'));

  pForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      id: projectEditingId || 'proj_' + Date.now(),
      title: document.getElementById('crud-p-title').value,
      category: document.getElementById('crud-p-cat').value,
      description: document.getElementById('crud-p-desc').value,
      thumbnail: document.getElementById('crud-p-thumb').value,
      demoUrl: document.getElementById('crud-p-demo').value,
      sourceUrl: document.getElementById('crud-p-source').value
    };

    if (projectEditingId) {
      const idx = db.projects.findIndex(p => p.id === projectEditingId);
      if (idx !== -1) db.projects[idx] = payload;
    } else {
      db.projects.push(payload);
    }
    pForm.classList.add('hidden-panel');
    commitSystemCoreSave("Project item configuration matrix storage updated.");
    renderAdminCRUDTables();
  });

  // PRODUCTS CATALOG ARR MANAGEMENT
  const sForm = document.getElementById('form-shop-crud');
  document.getElementById('open-add-shop-btn').addEventListener('click', () => {
    shopEditingId = null;
    sForm.reset();
    document.getElementById('crud-shop-title-label').innerText = "New Digital Commercial Asset Node";
    sForm.querySelector('.input-preview-box').src = "";
    sForm.classList.remove('hidden-panel');
  });
  document.getElementById('cancel-shop-btn').addEventListener('click', () => sForm.classList.add('hidden-panel'));

  sForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      id: shopEditingId || 'shop_' + Date.now(),
      title: document.getElementById('crud-s-title').value,
      price: document.getElementById('crud-s-price').value,
      description: document.getElementById('crud-s-desc').value,
      thumbnail: document.getElementById('crud-s-thumb').value,
      buyUrl: document.getElementById('crud-s-buyurl').value
    };

    if (shopEditingId) {
      const idx = db.shop.findIndex(s => s.id === shopEditingId);
      if (idx !== -1) db.shop[idx] = payload;
    } else {
      db.shop.push(payload);
    }
    sForm.classList.add('hidden-panel');
    commitSystemCoreSave("Commercial asset structural deployment completed.");
    renderAdminCRUDTables();
  });
}

function renderAdminCRUDTables() {
  // Render Projects Grid management rows
  const pTbody = document.getElementById('admin-projects-tbody');
  pTbody.innerHTML = "";
  db.projects.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.title}</strong></td>
      <td><span class="skill-tag" style="font-size:0.75rem;">${p.category}</span></td>
      <td>
        <button class="action-link-btn action-edit" onclick="initiateProjectEdit('${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="action-link-btn action-delete" onclick="initiateProjectDelete('${p.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    pTbody.appendChild(tr);
  });

  // Render Shop Grid rows
  const sTbody = document.getElementById('admin-shop-tbody');
  sTbody.innerHTML = "";
  db.shop.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.title}</strong></td>
      <td><span style="color:#10b981; font-weight:600;">${s.price}</span></td>
      <td>
        <button class="action-link-btn action-edit" onclick="initiateShopEdit('${s.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="action-link-btn action-delete" onclick="initiateShopDelete('${s.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    sTbody.appendChild(tr);
  });
}

// BIND CRITICAL CRUD WINDOW WINDOW SCOPES OPERATIONS
window.initiateProjectEdit = function(id) {
  const p = db.projects.find(item => item.id === id);
  if (!p) return;
  projectEditingId = id;
  
  const form = document.getElementById('form-project-crud');
  document.getElementById('crud-project-title-label').innerText = `Modify Node Target: ${p.title}`;
  document.getElementById('crud-p-title').value = p.title;
  document.getElementById('crud-p-cat').value = p.category;
  document.getElementById('crud-p-desc').value = p.description;
  
  const thumbInput = document.getElementById('crud-p-thumb');
  thumbInput.value = p.thumbnail;
  thumbInput.nextElementSibling.src = p.thumbnail;

  document.getElementById('crud-p-demo').value = p.demoUrl;
  document.getElementById('crud-p-source').value = p.sourceUrl;
  
  form.classList.remove('hidden-panel');
  form.scrollIntoView({ behavior: 'smooth' });
};

window.initiateProjectDelete = function(id) {
  showSystemConfirm("Hapus Node Project?", "Apakah Anda yakin ingin menghapus entri arsitektur project ini secara permanen dari basis data?", () => {
    db.projects = db.projects.filter(p => p.id !== id);
    commitSystemCoreSave("Project data instance dropped configuration matrix.");
    renderAdminCRUDTables();
  });
};

window.initiateShopEdit = function(id) {
  const s = db.shop.find(item => item.id === id);
  if (!s) return;
  shopEditingId = id;

  const form = document.getElementById('form-shop-crud');
  document.getElementById('crud-shop-title-label').innerText = `Edit Asset Properties: ${s.title}`;
  document.getElementById('crud-s-title').value = s.title;
  document.getElementById('crud-s-price').value = s.price;
  document.getElementById('crud-s-desc').value = s.description;
  
  const thumbInput = document.getElementById('crud-s-thumb');
  thumbInput.value = s.thumbnail;
  thumbInput.nextElementSibling.src = s.thumbnail;

  document.getElementById('crud-s-buyurl').value = s.buyUrl;

  form.classList.remove('hidden-panel');
  form.scrollIntoView({ behavior: 'smooth' });
};

window.initiateShopDelete = function(id) {
  showSystemConfirm("Hapus Item Katalog?", "Tindakan ini akan memusnahkan produk komersial premium yang dipilih dari manifest digital runtime storage.", () => {
    db.shop = db.shop.filter(s => s.id !== id);
    commitSystemCoreSave("Digital asset removed from catalog systems indices.");
    renderAdminCRUDTables();
  });
};

/**
 * SUB-SYSTEM: FILE MANAGER STRUCTS (EXPORT, DOWNLOAD, RESTORE MANIFESTS)
 */
function setupJSONManagerActions() {
  document.getElementById('btn-json-export').addEventListener('click', () => {
    const out = JSON.stringify(db, null, 2);
    const win = window.open();
    win.document.write('<pre style="background:#0a0a0a;color:#fff;padding:2rem;font-family:monospace;">' + out + '</pre>');
    showToast("Live system JSON matrix compiled inside alternative thread layout context.", "info");
  });

  document.getElementById('btn-json-download').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "database.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Berkas database.json berhasil diunduh.", "success");
  });

  document.getElementById('json-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const parseObj = JSON.parse(evt.target.result);
        if (typeof parseObj !== 'object') throw new Error("Format objek masukan data korup.");
        db = parseObj;
        commitSystemCoreSave("External schema matrix data forced layout compiled successfully.");
        renderAdminCRUDTables();
      } catch (err) {
        showToast("Kesalahan parsing objek unggahan arsitektur JSON.", "error");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-json-backup').addEventListener('click', () => {
    localStorage.setItem('leoly_db_backup_state', JSON.stringify(db));
    showToast("System configurations current state cached snapshot committed.", "success");
  });

  document.getElementById('btn-json-restore').addEventListener('click', () => {
    const data = localStorage.getItem('leoly_db_backup_state');
    if (!data) return showToast("No active physical recovery block structural parameters cache located.", "error");
    db = JSON.parse(data);
    commitSystemCoreSave("System states successfully recovered to previous checkpoint timestamps.");
    renderAdminCRUDTables();
  });

  document.getElementById('btn-json-reset').addEventListener('click', () => {
    showSystemConfirm("Wipe Database Manifest Core?", "Semua perubahan data lokal akan dihapus. Aplikasi akan memuat ulang setelan bawaan pabrik dari berkas database.json asli.", () => {
      localStorage.removeItem('leoly_db_manifest');
      localStorage.removeItem('leoly_db_backup_state');
      window.location.reload();
    });
  });
}

/**
 * HIGH-END TOAST NOTIFICATION CONTAINER SYSTEM FUSES
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  
  let glyph = '<i class="fa-solid fa-circle-info text-accent"></i>';
  if (type === 'success') glyph = '<i class="fa-solid fa-circle-check" style="color:#10b981;"></i>';
  if (type === 'error') glyph = '<i class="fa-solid fa-circle-exclamation" style="color:#ef4444;"></i>';

  el.innerHTML = `${glyph} <span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 4000);
}

/**
 * CUSTOM INTERCEPT DIALOG MODAL CONFIRMATOR INTERACTOR
 */
function showSystemConfirm(title, message, callbackOnYes) {
  const overlay = document.getElementById('confirm-modal');
  document.getElementById('confirm-title').innerText = title;
  document.getElementById('confirm-msg').innerText = message;
  overlay.classList.remove('hidden-panel');

  const yBtn = document.getElementById('confirm-yes-btn');
  const nBtn = document.getElementById('confirm-no-btn');

  const clearEventListeners = () => {
    const newY = yBtn.cloneNode(true); yBtn.parentNode.replaceChild(newY, yBtn);
    const newN = nBtn.cloneNode(true); nBtn.parentNode.replaceChild(newN, nBtn);
    overlay.classList.add('hidden-panel');
  };

  document.getElementById('confirm-yes-btn').addEventListener('click', () => {
    if (callbackOnYes) callbackOnYes();
    clearEventListeners();
  });
  document.getElementById('confirm-no-btn').addEventListener('click', () => {
    clearEventListeners();
  });
}

/**
 * HIGH PERFORMANCE LAZY LOAD IMAGES DETECTOR API INFRASTRUCTURE
 */
function lazyLoadImageElement(imgEl) {
  if (!imgEl) return;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    observer.observe(imgEl);
  } else {
    imgEl.classList.add('loaded');
  }
}

function hideLoadingScreen() {
  const s = document.getElementById('loading-screen');
  s.style.opacity = '0';
  setTimeout(() => s.style.display = 'none', 500);
}

/**
 * VISUAL METRIC INSIGHT CHARTS ENGINE (CHART.JS IMPLEMENTATION)
 */
function initAnalyticsChart() {
  const ctx = document.getElementById('analyticsChart').getContext('2d');
  if (analyticsChartInstance) analyticsChartInstance.destroy();

  analyticsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Traffic Analytical Vectors Rate',
        data: [db.statistics.visitors * 0.4 || 120, db.statistics.visitors * 0.5 || 190, db.statistics.visitors * 0.7 || 340, db.statistics.visitors * 0.6 || 220, db.statistics.visitors * 0.8 || 450, db.statistics.visitors * 0.95 || 680, db.statistics.visitors || 1420],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.03)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { family: 'Plus Jakarta Sans', size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#a1a1aa', font: { family: 'Plus Jakarta Sans', size: 10 } } }
      }
    }
  });
}

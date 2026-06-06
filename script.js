/**
 * LEOLY DEV CORE PLATFORM ENGINE
 * Architecture: Static JSON Driven (No LocalStorage Cache)
 * FIXED VERSION - All bugs resolved
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
  setupGlobalImagePreviewListeners();
  hideLoadingScreen();
});

/**
 * INITIALIZE DATABASE ENGINE
 */
async function initializeDatabase() {
  try {
    const response = await fetch('database.json?v=' + Date.now());
    if (!response.ok) throw new Error("Fetch database.json failed.");
    db = await response.json();
  } catch (err) {
    console.error(err);
    showToast("Gagal memuat database.json. Menggunakan data default.", "error");
    db = { 
      website: { title: "Leoly Dev", description: "", logo: "⚡", banner: "" }, 
      home: { title: "Leoly Dev", subtitle: "Developer", description: "", button1: "Explore", button2: "Contact" }, 
      about: { photo: "", description: "", skills: [] }, 
      projects: [], 
      shop: [], 
      donate: { qris: "", dana: "", ovo: "", gopay: "", saweria: "" }, 
      contact: { whatsapp: "", telegram: "", email: "", instagram: "", github: "" }, 
      statistics: { visitors: 1420, projects: 0, products: 0, donations: 0 }, 
      settings: { maintenance: false, theme: "dark" } 
    };
  }
  
  applyDatabaseToDOM();
}

/**
 * DOM SYNC ENGINE
 */
function applyDatabaseToDOM() {
  if (!db) return;

  // MAINTENANCE WALL CHECK
  if (db.settings?.maintenance === true && !sessionStorage.getItem(SESSION_AUTH_KEY)) {
    document.getElementById('maintenance-screen')?.classList.remove('hidden-panel');
    document.getElementById('app-container')?.classList.add('hidden-panel');
    return;
  } else {
    document.getElementById('maintenance-screen')?.classList.add('hidden-panel');
    document.getElementById('app-container')?.classList.remove('hidden-panel');
  }

  // GLOBAL METADATA & CORE UI
  document.title = db.website.title || "Leoly Dev";
  const logoElem = document.getElementById('web-logo-txt');
  if (logoElem) logoElem.innerText = `${db.website.logo || '⚡'} ${db.website.title || 'Leoly Dev'}`;
  const sidebarBrand = document.getElementById('sidebar-brand');
  if (sidebarBrand) sidebarBrand.innerText = db.website.title || "Leoly Dev";

  // Set banner background if exists
  if (db.website.banner) {
    document.body.style.backgroundImage = `url(${db.website.banner})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }

  // HERO RENDER
  const heroTitle = document.getElementById('hero-title-node');
  if (heroTitle) heroTitle.innerText = db.home.title || "";
  const heroSubtitle = document.getElementById('hero-subtitle-node');
  if (heroSubtitle) heroSubtitle.innerText = db.home.subtitle || "";
  const heroDesc = document.getElementById('hero-desc-node');
  if (heroDesc) heroDesc.innerText = db.home.description || "";
  const heroBtn1 = document.getElementById('hero-btn1');
  if (heroBtn1) heroBtn1.innerText = db.home.button1 || "Explore";
  const heroBtn2 = document.getElementById('hero-btn2');
  if (heroBtn2) heroBtn2.innerText = db.home.button2 || "Contact";

  // PROFILE RENDER (ABOUT)
  const aboutImg = document.getElementById('about-img-node');
  if (aboutImg && db.about.photo) {
    aboutImg.src = db.about.photo;
    aboutImg.setAttribute('data-src', db.about.photo);
    lazyLoadImageElement(aboutImg);
  }
  const aboutDesc = document.getElementById('about-desc-node');
  if (aboutDesc) aboutDesc.innerText = db.about.description || "";
  
  const skillsWrap = document.getElementById('about-skills-node');
  if (skillsWrap) {
    skillsWrap.innerHTML = "";
    if (db.about.skills && Array.isArray(db.about.skills)) {
      db.about.skills.forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerText = skill;
        skillsWrap.appendChild(tag);
      });
    }
  }

  // GATEWAY & CONNECTORS RENDER
  const qrisImg = document.getElementById('donate-qris-node');
  if (qrisImg && db.donate.qris) {
    qrisImg.src = db.donate.qris;
    lazyLoadImageElement(qrisImg);
  }
  const danaNode = document.getElementById('donate-dana-node');
  if (danaNode) danaNode.innerText = db.donate.dana || "-";
  const ovoNode = document.getElementById('donate-ovo-node');
  if (ovoNode) ovoNode.innerText = db.donate.ovo || "-";
  const gopayNode = document.getElementById('donate-gopay-node');
  if (gopayNode) gopayNode.innerText = db.donate.gopay || "-";
  const saweriaLink = document.getElementById('donate-saweria-node');
  if (saweriaLink) saweriaLink.href = db.donate.saweria || "#";

  const waLink = document.getElementById('ctx-wa');
  if (waLink) waLink.href = db.contact.whatsapp || "#";
  const tgLink = document.getElementById('ctx-tg');
  if (tgLink) tgLink.href = db.contact.telegram || "#";
  const mailLink = document.getElementById('ctx-mail');
  if (mailLink) mailLink.href = db.contact.email || "#";
  const igLink = document.getElementById('ctx-ig');
  if (igLink) igLink.href = db.contact.instagram || "#";
  const gitLink = document.getElementById('ctx-git');
  if (gitLink) gitLink.href = db.contact.github || "#";

  renderProjectsGrid();
  renderShopGrid();
  populateFilterDropdowns();
}

function renderProjectsGrid() {
  const container = document.getElementById('project-grid-node');
  if (!container) return;
  container.innerHTML = "";
  const searchVal = document.getElementById('project-search')?.value.toLowerCase() || "";
  const filterVal = document.getElementById('project-filter')?.value || "all";

  const filtered = (db.projects || []).filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
    const matchCat = (filterVal === 'all') || (p.category === filterVal);
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-card text-center text-secondary" style="grid-column: 1/-1; padding: 3rem;">No project data found.</div>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card premium-card';
    card.innerHTML = `
      <div class="card-thumb-area">
        <span class="card-badge">${escapeHtml(p.category)}</span>
        <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" class="lazy-image" loading="lazy">
      </div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(p.title)}</h4>
        <p class="card-description text-secondary">${escapeHtml(p.description)}</p>
        <div class="card-footer-actions">
          <a href="${p.demoUrl}" target="_blank" class="btn btn-primary" rel="noopener noreferrer">Demo</a>
          <a href="${p.sourceUrl}" target="_blank" class="btn btn-secondary" rel="noopener noreferrer">Code</a>
        </div>
      </div>
    `;
    container.appendChild(card);
    const img = card.querySelector('.lazy-image');
    if (img) lazyLoadImageElement(img);
  });
}

function renderShopGrid() {
  const container = document.getElementById('shop-grid-node');
  if (!container) return;
  container.innerHTML = "";
  const searchVal = document.getElementById('shop-search')?.value.toLowerCase() || "";

  const filtered = (db.shop || []).filter(s => s.title.toLowerCase().includes(searchVal) || s.description.toLowerCase().includes(searchVal));

  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-card text-center text-secondary" style="grid-column: 1/-1; padding: 3rem;">No products available.</div>`;
    return;
  }

  filtered.forEach(s => {
    const card = document.createElement('div');
    card.className = 'glass-card premium-card';
    card.innerHTML = `
      <div class="card-thumb-area">
        <span class="card-badge" style="background:rgba(16,185,129,0.85);">${escapeHtml(s.price)}</span>
        <img src="${s.thumbnail}" alt="${escapeHtml(s.title)}" class="lazy-image" loading="lazy">
      </div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(s.title)}</h4>
        <p class="card-description text-secondary">${escapeHtml(s.description)}</p>
        <div class="card-footer-actions">
          <a href="${s.buyUrl}" target="_blank" class="btn btn-primary" style="width:100%;" rel="noopener noreferrer">Buy Now</a>
        </div>
      </div>
    `;
    container.appendChild(card);
    const img = card.querySelector('.lazy-image');
    if (img) lazyLoadImageElement(img);
  });
}

function populateFilterDropdowns() {
  const filterSelect = document.getElementById('project-filter');
  if (!filterSelect) return;
  const currentVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="all">All Architecture</option>';
  
  const categories = [...new Set((db.projects || []).map(p => p.category).filter(c => c))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.innerText = cat;
    filterSelect.appendChild(opt);
  });
  filterSelect.value = currentVal;
}

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

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSectionId = item.getAttribute('data-section');
      if (targetSectionId) {
        window.location.hash = targetSectionId;
        setActiveViewTab(targetSectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const sidebar = document.getElementById('right-sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
      }
    });
  });

  // Handle initial hash
  if (window.location.hash && window.location.hash.length > 1) {
    const rawHash = window.location.hash.substring(1);
    if (document.getElementById(rawHash)) {
      setActiveViewTab(rawHash);
    } else {
      setActiveViewTab('home');
    }
  } else {
    setActiveViewTab('home');
  }

  // Back to top button
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) btt.classList.add('show-btn');
      else btt.classList.remove('show-btn');
    });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

function setupUIInteractions() {
  const sidebar = document.getElementById('right-sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');

  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => sidebar?.classList.add('mobile-open'));
  }
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => sidebar?.classList.remove('mobile-open'));
  }

  // Search inputs
  const projectSearch = document.getElementById('project-search');
  if (projectSearch) projectSearch.addEventListener('input', renderProjectsGrid);
  const projectFilter = document.getElementById('project-filter');
  if (projectFilter) projectFilter.addEventListener('change', renderProjectsGrid);
  const shopSearch = document.getElementById('shop-search');
  if (shopSearch) shopSearch.addEventListener('input', renderShopGrid);
}

function setupGlobalImagePreviewListeners() {
  // Setup all image preview inputs dynamically
  const setupPreview = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', (e) => {
        const preview = input.nextElementSibling;
        if (preview && preview.classList && preview.classList.contains('input-preview-box')) {
          preview.src = e.target.value;
        }
      });
    }
  };

  setupPreview('adm-web-banner');
  setupPreview('adm-about-photo');
  setupPreview('adm-don-qris');
  setupPreview('crud-p-thumb');
  setupPreview('crud-s-thumb');
}

/**
 * ADMINISTRATIVE ENGINE HUB
 */
function setupAdminEngine() {
  const adminNavLink = document.getElementById('admin-nav-link');
  const modalOverlay = document.getElementById('admin-modal');
  const authCard = document.getElementById('admin-auth-card');
  const dashboardCard = document.getElementById('admin-dashboard-card');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');

  if (adminNavLink) {
    adminNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalOverlay) modalOverlay.classList.remove('hidden-panel');
      if (sessionStorage.getItem(SESSION_AUTH_KEY) === 'authorized') {
        showAdminDashboard();
      } else {
        if (authCard) authCard.classList.remove('hidden-panel');
        if (dashboardCard) dashboardCard.classList.add('hidden-panel');
      }
    });
  }

  document.querySelectorAll('.close-modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.add('hidden-panel');
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('auth-user')?.value || '';
      const p = document.getElementById('auth-pass')?.value || '';

      if (u === 'admin' && p === 'admin123') {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'authorized');
        showToast("Akses Administrasi Disetujui.", "success");
        showAdminDashboard();
      } else {
        showToast("Kredensial salah. Gunakan admin / admin123", "error");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      showToast("Sesi Administrasi Berakhir.", "info");
      if (authCard) authCard.classList.remove('hidden-panel');
      if (dashboardCard) dashboardCard.classList.add('hidden-panel');
      if (modalOverlay) modalOverlay.classList.add('hidden-panel');
      applyDatabaseToDOM();
    });
  }

  setupAdminTabs();
  setupAdminFormSubmits();
  setupCRUDControls();
  setupJSONManagerActions();
}

function showAdminDashboard() {
  const authCard = document.getElementById('admin-auth-card');
  const dashboardCard = document.getElementById('admin-dashboard-card');
  if (authCard) authCard.classList.add('hidden-panel');
  if (dashboardCard) dashboardCard.classList.remove('hidden-panel');
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
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

function loadDataToAdminForms() {
  // Statistics
  const visitorsEl = document.getElementById('m-visitors');
  if (visitorsEl) visitorsEl.innerText = db.statistics?.visitors || 0;
  const projectsEl = document.getElementById('m-projects');
  if (projectsEl) projectsEl.innerText = db.projects?.length || 0;
  const productsEl = document.getElementById('m-products');
  if (productsEl) productsEl.innerText = db.shop?.length || 0;
  const donationsEl = document.getElementById('m-donations');
  if (donationsEl) donationsEl.innerText = `Rp ${(db.statistics?.donations || 0).toLocaleString('id-ID')}`;

  // Website settings
  setInputValue('adm-web-title', db.website?.title);
  setInputValue('adm-web-desc', db.website?.description);
  setInputValue('adm-web-logo', db.website?.logo);
  setInputValue('adm-web-banner', db.website?.banner);
  if (document.getElementById('adm-web-banner')?.nextElementSibling) {
    document.getElementById('adm-web-banner').nextElementSibling.src = db.website?.banner || '';
  }
  const maintenanceCheck = document.getElementById('adm-sys-maintenance');
  if (maintenanceCheck) maintenanceCheck.checked = db.settings?.maintenance || false;

  // Home editor
  setInputValue('adm-home-title', db.home?.title);
  setInputValue('adm-home-subtitle', db.home?.subtitle);
  setInputValue('adm-home-desc', db.home?.description);
  setInputValue('adm-home-btn1', db.home?.button1);
  setInputValue('adm-home-btn2', db.home?.button2);

  // About editor
  setInputValue('adm-about-photo', db.about?.photo);
  if (document.getElementById('adm-about-photo')?.nextElementSibling) {
    document.getElementById('adm-about-photo').nextElementSibling.src = db.about?.photo || '';
  }
  setInputValue('adm-about-desc', db.about?.description);
  setInputValue('adm-about-skills', db.about?.skills ? db.about.skills.join(', ') : '');

  // Gateways
  setInputValue('adm-don-qris', db.donate?.qris);
  if (document.getElementById('adm-don-qris')?.nextElementSibling) {
    document.getElementById('adm-don-qris').nextElementSibling.src = db.donate?.qris || '';
  }
  setInputValue('adm-don-saweria', db.donate?.saweria);
  setInputValue('adm-don-dana', db.donate?.dana);
  setInputValue('adm-don-ovo', db.donate?.ovo);
  setInputValue('adm-don-gopay', db.donate?.gopay);

  // Contact
  setInputValue('adm-ctx-wa', db.contact?.whatsapp);
  setInputValue('adm-ctx-tg', db.contact?.telegram);
  setInputValue('adm-ctx-mail', db.contact?.email);
  setInputValue('adm-ctx-ig', db.contact?.instagram);
  setInputValue('adm-ctx-git', db.contact?.github);
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function setupAdminFormSubmits() {
  const coreForm = document.getElementById('form-core-web');
  if (coreForm) {
    coreForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!db.website) db.website = {};
      db.website.title = document.getElementById('adm-web-title')?.value || '';
      db.website.description = document.getElementById('adm-web-desc')?.value || '';
      db.website.logo = document.getElementById('adm-web-logo')?.value || '';
      db.website.banner = document.getElementById('adm-web-banner')?.value || '';
      if (!db.settings) db.settings = {};
      db.settings.maintenance = document.getElementById('adm-sys-maintenance')?.checked || false;
      commitSystemCoreSave();
    });
  }

  const heroForm = document.getElementById('form-hero-editor');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!db.home) db.home = {};
      db.home.title = document.getElementById('adm-home-title')?.value || '';
      db.home.subtitle = document.getElementById('adm-home-subtitle')?.value || '';
      db.home.description = document.getElementById('adm-home-desc')?.value || '';
      db.home.button1 = document.getElementById('adm-home-btn1')?.value || '';
      db.home.button2 = document.getElementById('adm-home-btn2')?.value || '';
      commitSystemCoreSave();
    });
  }

  const aboutForm = document.getElementById('form-about-editor');
  if (aboutForm) {
    aboutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!db.about) db.about = {};
      db.about.photo = document.getElementById('adm-about-photo')?.value || '';
      db.about.description = document.getElementById('adm-about-desc')?.value || '';
      const skillsInput = document.getElementById('adm-about-skills')?.value || '';
      db.about.skills = skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      commitSystemCoreSave();
    });
  }

  const gatewaysForm = document.getElementById('form-gateways');
  if (gatewaysForm) {
    gatewaysForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!db.donate) db.donate = {};
      if (!db.contact) db.contact = {};
      
      db.donate.qris = document.getElementById('adm-don-qris')?.value || '';
      db.donate.saweria = document.getElementById('adm-don-saweria')?.value || '';
      db.donate.dana = document.getElementById('adm-don-dana')?.value || '';
      db.donate.ovo = document.getElementById('adm-don-ovo')?.value || '';
      db.donate.gopay = document.getElementById('adm-don-gopay')?.value || '';

      db.contact.whatsapp = document.getElementById('adm-ctx-wa')?.value || '';
      db.contact.telegram = document.getElementById('adm-ctx-tg')?.value || '';
      db.contact.email = document.getElementById('adm-ctx-mail')?.value || '';
      db.contact.instagram = document.getElementById('adm-ctx-ig')?.value || '';
      db.contact.github = document.getElementById('adm-ctx-git')?.value || '';
      
      commitSystemCoreSave();
    });
  }
}

function commitSystemCoreSave() {
  applyDatabaseToDOM();
  loadDataToAdminForms();
  renderAdminCRUDTables();
  
  showSystemConfirm(
    "✓ Perubahan Runtime Berhasil!", 
    "Perubahan diterapkan di browser. Untuk menyimpan secara permanen, klik Download database.json dan ganti file lama Anda.",
    () => {
      const jsonTabBtn = document.querySelector('.admin-tab-btn[data-tab="tab-json-manager"]');
      if(jsonTabBtn) jsonTabBtn.click();
    }
  );
}

function setupCRUDControls() {
  // Projects CRUD
  const pForm = document.getElementById('form-project-crud');
  const openProjectBtn = document.getElementById('open-add-project-btn');
  const cancelProjectBtn = document.getElementById('cancel-project-btn');
  
  if (openProjectBtn) {
    openProjectBtn.addEventListener('click', () => {
      projectEditingId = null;
      if (pForm) {
        pForm.reset();
        const titleLabel = document.getElementById('crud-project-title-label');
        if (titleLabel) titleLabel.innerText = "New Project Struct Node";
        const previewBox = pForm.querySelector('.input-preview-box');
        if (previewBox) previewBox.src = "";
        pForm.classList.remove('hidden-panel');
      }
    });
  }
  
  if (cancelProjectBtn) {
    cancelProjectBtn.addEventListener('click', () => pForm?.classList.add('hidden-panel'));
  }

  if (pForm) {
    pForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        id: projectEditingId || 'proj_' + Date.now(),
        title: document.getElementById('crud-p-title')?.value || '',
        category: document.getElementById('crud-p-cat')?.value || '',
        description: document.getElementById('crud-p-desc')?.value || '',
        thumbnail: document.getElementById('crud-p-thumb')?.value || '',
        demoUrl: document.getElementById('crud-p-demo')?.value || '#',
        sourceUrl: document.getElementById('crud-p-source')?.value || '#'
      };

      if (!db.projects) db.projects = [];
      
      if (projectEditingId) {
        const idx = db.projects.findIndex(p => p.id === projectEditingId);
        if (idx !== -1) db.projects[idx] = payload;
      } else {
        db.projects.push(payload);
      }
      pForm.classList.add('hidden-panel');
      commitSystemCoreSave();
      renderAdminCRUDTables();
    });
  }

  // Shop CRUD
  const sForm = document.getElementById('form-shop-crud');
  const openShopBtn = document.getElementById('open-add-shop-btn');
  const cancelShopBtn = document.getElementById('cancel-shop-btn');
  
  if (openShopBtn) {
    openShopBtn.addEventListener('click', () => {
      shopEditingId = null;
      if (sForm) {
        sForm.reset();
        const titleLabel = document.getElementById('crud-shop-title-label');
        if (titleLabel) titleLabel.innerText = "New Digital Commercial Asset Node";
        const previewBox = sForm.querySelector('.input-preview-box');
        if (previewBox) previewBox.src = "";
        sForm.classList.remove('hidden-panel');
      }
    });
  }
  
  if (cancelShopBtn) {
    cancelShopBtn.addEventListener('click', () => sForm?.classList.add('hidden-panel'));
  }

  if (sForm) {
    sForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        id: shopEditingId || 'shop_' + Date.now(),
        title: document.getElementById('crud-s-title')?.value || '',
        price: document.getElementById('crud-s-price')?.value || '',
        description: document.getElementById('crud-s-desc')?.value || '',
        thumbnail: document.getElementById('crud-s-thumb')?.value || '',
        buyUrl: document.getElementById('crud-s-buyurl')?.value || '#'
      };

      if (!db.shop) db.shop = [];
      
      if (shopEditingId) {
        const idx = db.shop.findIndex(s => s.id === shopEditingId);
        if (idx !== -1) db.shop[idx] = payload;
      } else {
        db.shop.push(payload);
      }
      sForm.classList.add('hidden-panel');
      commitSystemCoreSave();
      renderAdminCRUDTables();
    });
  }
}

function renderAdminCRUDTables() {
  const pTbody = document.getElementById('admin-projects-tbody');
  if (pTbody) {
    pTbody.innerHTML = "";
    (db.projects || []).forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td><span class="skill-tag" style="font-size:0.75rem;">${escapeHtml(p.category)}</span></td>
        <td>
          <button class="action-link-btn action-edit" onclick="window.initiateProjectEdit('${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="action-link-btn action-delete" onclick="window.initiateProjectDelete('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      pTbody.appendChild(tr);
    });
  }

  const sTbody = document.getElementById('admin-shop-tbody');
  if (sTbody) {
    sTbody.innerHTML = "";
    (db.shop || []).forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(s.title)}</strong></td>
        <td><span style="color:#10b981; font-weight:600;">${escapeHtml(s.price)}</span></td>
        <td>
          <button class="action-link-btn action-edit" onclick="window.initiateShopEdit('${s.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="action-link-btn action-delete" onclick="window.initiateShopDelete('${s.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      sTbody.appendChild(tr);
    });
  }
}

window.initiateProjectEdit = function(id) {
  const p = db.projects?.find(item => item.id === id);
  if (!p) return;
  projectEditingId = id;
  
  const form = document.getElementById('form-project-crud');
  if (!form) return;
  
  const titleLabel = document.getElementById('crud-project-title-label');
  if (titleLabel) titleLabel.innerText = `Modify Node Target: ${p.title}`;
  
  setInputValue('crud-p-title', p.title);
  setInputValue('crud-p-cat', p.category);
  setInputValue('crud-p-desc', p.description);
  setInputValue('crud-p-thumb', p.thumbnail);
  setInputValue('crud-p-demo', p.demoUrl);
  setInputValue('crud-p-source', p.sourceUrl);
  
  const previewBox = form.querySelector('.input-preview-box');
  if (previewBox && p.thumbnail) previewBox.src = p.thumbnail;
  
  form.classList.remove('hidden-panel');
  form.scrollIntoView({ behavior: 'smooth' });
};

window.initiateProjectDelete = function(id) {
  showSystemConfirm("Hapus Node Project?", "Apakah Anda yakin ingin menghapus entri arsitektur project ini?", () => {
    if (db.projects) db.projects = db.projects.filter(p => p.id !== id);
    commitSystemCoreSave();
    renderAdminCRUDTables();
  });
};

window.initiateShopEdit = function(id) {
  const s = db.shop?.find(item => item.id === id);
  if (!s) return;
  shopEditingId = id;

  const form = document.getElementById('form-shop-crud');
  if (!form) return;
  
  const titleLabel = document.getElementById('crud-shop-title-label');
  if (titleLabel) titleLabel.innerText = `Edit Asset Properties: ${s.title}`;
  
  setInputValue('crud-s-title', s.title);
  setInputValue('crud-s-price', s.price);
  setInputValue('crud-s-desc', s.description);
  setInputValue('crud-s-thumb', s.thumbnail);
  setInputValue('crud-s-buyurl', s.buyUrl);
  
  const previewBox = form.querySelector('.input-preview-box');
  if (previewBox && s.thumbnail) previewBox.src = s.thumbnail;

  form.classList.remove('hidden-panel');
  form.scrollIntoView({ behavior: 'smooth' });
};

window.initiateShopDelete = function(id) {
  showSystemConfirm("Hapus Item Katalog?", "Tindakan ini akan memusnahkan produk komersial premium yang dipilih.", () => {
    if (db.shop) db.shop = db.shop.filter(s => s.id !== id);
    commitSystemCoreSave();
    renderAdminCRUDTables();
  });
};

function setupJSONManagerActions() {
  const exportBtn = document.getElementById('btn-json-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const out = JSON.stringify(db, null, 2);
      const win = window.open();
      if (win) {
        win.document.write('<pre style="background:#0a0a0a;color:#fff;padding:2rem;font-family:monospace;white-space:pre-wrap;word-wrap:break-word;">' + escapeHtml(out) + '</pre>');
      }
      showToast("Live system JSON matrix compiled.", "info");
    });
  }

  const downloadBtn = document.getElementById('btn-json-download');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "database.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Berkas database.json berhasil diunduh.", "success");
    });
  }

  const fileInput = document.getElementById('json-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const parseObj = JSON.parse(evt.target.result);
          if (typeof parseObj !== 'object') throw new Error("Format objek masukan tidak valid.");
          db = parseObj;
          commitSystemCoreSave();
          renderAdminCRUDTables();
          showToast("Database berhasil diimpor!", "success");
        } catch (err) {
          showToast("Kesalahan parsing objek JSON: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    });
  }

  const resetBtn = document.getElementById('btn-json-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      showSystemConfirm("Reset Ulang?", "Aplikasi akan memuat ulang data asli yang tersimpan di server. Perubahan yang belum disimpan akan hilang.", () => {
        window.location.reload();
      });
    });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  
  let glyph = '<i class="fa-solid fa-circle-info text-accent"></i>';
  if (type === 'success') glyph = '<i class="fa-solid fa-circle-check" style="color:#10b981;"></i>';
  if (type === 'error') glyph = '<i class="fa-solid fa-circle-exclamation" style="color:#ef4444;"></i>';
  if (type === 'info') glyph = '<i class="fa-solid fa-circle-info" style="color:#3B82F6;"></i>';

  el.innerHTML = `${glyph} <span>${escapeHtml(message)}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-100%)';
    setTimeout(() => el.remove(), 400);
  }, 4000);
}

function showSystemConfirm(title, message, callbackOnYes) {
  const overlay = document.getElementById('confirm-modal');
  if (!overlay) return;
  
  const titleEl = document.getElementById('confirm-title');
  const msgEl = document.getElementById('confirm-msg');
  if (titleEl) titleEl.innerText = title;
  if (msgEl) msgEl.innerText = message;
  
  overlay.classList.remove('hidden-panel');

  const yBtn = document.getElementById('confirm-yes-btn');
  const nBtn = document.getElementById('confirm-no-btn');

  function cleanup() {
    overlay.classList.add('hidden-panel');
    if (yBtn) {
      const newY = yBtn.cloneNode(true);
      yBtn.parentNode?.replaceChild(newY, yBtn);
    }
    if (nBtn) {
      const newN = nBtn.cloneNode(true);
      nBtn.parentNode?.replaceChild(newN, nBtn);
    }
  }

  const handleYes = () => {
    if (callbackOnYes) callbackOnYes();
    cleanup();
  };
  
  const handleNo = () => {
    cleanup();
  };

  if (yBtn) {
    const newY = yBtn.cloneNode(true);
    yBtn.parentNode?.replaceChild(newY, yBtn);
    newY.addEventListener('click', handleYes);
  }
  
  if (nBtn) {
    const newN = nBtn.cloneNode(true);
    nBtn.parentNode?.replaceChild(newN, nBtn);
    newN.addEventListener('click', handleNo);
  }
}

function lazyLoadImageElement(imgEl) {
  if (!imgEl) return;
  
  if (imgEl.complete && imgEl.naturalHeight !== 0) {
    imgEl.classList.add('loaded');
    return;
  }
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc && !img.src) img.src = dataSrc;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(imgEl);
  } else {
    imgEl.classList.add('loaded');
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

function initAnalyticsChart() {
  const canvas = document.getElementById('analyticsChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  if (analyticsChartInstance) {
    analyticsChartInstance.destroy();
  }

  // Generate dynamic data based on visitors
  const visitors = db.statistics?.visitors || 1420;
  const baseData = [120, 190, 340, 220, 450, 680, Math.min(visitors, 2000)];
  
  analyticsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Traffic Analytics',
        data: baseData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { 
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#a1a1aa'
        }
      },
      scales: {
        x: { 
          grid: { display: false, drawBorder: false }, 
          ticks: { color: '#a1a1aa', font: { family: 'Plus Jakarta Sans', size: 10 } } 
        },
        y: { 
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, 
          ticks: { color: '#a1a1aa', font: { family: 'Plus Jakarta Sans', size: 10 } } 
        }
      },
      elements: {
        line: {
          borderJoin: 'round'
        }
      }
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Expose functions to global scope
window.initiateProjectEdit = window.initiateProjectEdit;
window.initiateProjectDelete = window.initiateProjectDelete;
window.initiateShopEdit = window.initiateShopEdit;
window.initiateShopDelete = window.initiateShopDelete;
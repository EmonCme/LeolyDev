// ============================================================
// LEOLY DEV - FULLY FUNCTIONAL WITH SUPABASE
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============ SUPABASE CONFIGURATION ============
const SUPABASE_URL = 'https://qndqvujqfuplmwpzrbgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHF2dWpxZnVwbG13cHpyYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODg1NTMsImV4cCI6MjA5NTg2NDU1M30.xjYhc6RdShq4uq-nRDKQ5uEvE02pzwixpfhfsCcLrrk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ STATE MANAGEMENT ============
let db = null;
let analyticsChartInstance = null;
const SESSION_AUTH_KEY = 'leoly_auth_session';

// ============ DATABASE OPERATIONS ============
const dbOps = {
  async getWebsite() {
    const { data, error } = await supabase.from('website_settings').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') console.error(error);
    return data || {};
  },
  async updateWebsite(data) {
    const { error } = await supabase.from('website_settings').upsert({ id: 1, ...data, updated_at: new Date() });
    if (error) throw error;
  },
  async getHome() {
    const { data, error } = await supabase.from('home_content').select('*').eq('id', 1).single();
    return data || {};
  },
  async updateHome(data) {
    const { error } = await supabase.from('home_content').upsert({ id: 1, ...data, updated_at: new Date() });
    if (error) throw error;
  },
  async getAbout() {
    const { data, error } = await supabase.from('about_content').select('*').eq('id', 1).single();
    return data || {};
  },
  async updateAbout(data) {
    const { error } = await supabase.from('about_content').upsert({ id: 1, ...data, updated_at: new Date() });
    if (error) throw error;
  },
  async getProjects() {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async addProject(project) {
    const { data, error } = await supabase.from('projects').insert([project]).select();
    if (error) throw error;
    return data[0];
  },
  async updateProject(id, project) {
    const { error } = await supabase.from('projects').update(project).eq('id', id);
    if (error) throw error;
  },
  async deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
  async getShop() {
    const { data, error } = await supabase.from('shop_products').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async addShop(product) {
    const { data, error } = await supabase.from('shop_products').insert([product]).select();
    if (error) throw error;
    return data[0];
  },
  async updateShop(id, product) {
    const { error } = await supabase.from('shop_products').update(product).eq('id', id);
    if (error) throw error;
  },
  async deleteShop(id) {
    const { error } = await supabase.from('shop_products').delete().eq('id', id);
    if (error) throw error;
  },
  async getDonate() {
    const { data, error } = await supabase.from('donation_gateways').select('*').eq('id', 1).single();
    return data || {};
  },
  async updateDonate(data) {
    const { error } = await supabase.from('donation_gateways').upsert({ id: 1, ...data, updated_at: new Date() });
    if (error) throw error;
  },
  async getContact() {
    const { data, error } = await supabase.from('contact_info').select('*').eq('id', 1).single();
    return data || {};
  },
  async updateContact(data) {
    const { error } = await supabase.from('contact_info').upsert({ id: 1, ...data, updated_at: new Date() });
    if (error) throw error;
  },
  async getStats() {
    const { data, error } = await supabase.from('statistics').select('*').eq('id', 1).single();
    return data || { visitors: 0 };
  },
  async updateStats(data) {
    const { error } = await supabase.from('statistics').upsert({ id: 1, ...data, updated_at: new Date() });
    if (error) throw error;
  },
  async incrementVisitors() {
    const current = await this.getStats();
    const newCount = (current.visitors || 0) + 1;
    await this.updateStats({ visitors: newCount });
    return newCount;
  }
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 DOM Ready - Initializing...");
  await loadAllData();
  setupNavigation();
  setupUI();
  setupAdminPanel();
  setupRealtime();
  setupFormHandlers();
  hideLoading();
  await trackVisitor();
});

async function loadAllData() {
  try {
    showToast("Menghubungkan ke Supabase...", "info");
    const [website, home, about, projects, shop, donate, contact, stats] = await Promise.all([
      dbOps.getWebsite(), dbOps.getHome(), dbOps.getAbout(), dbOps.getProjects(),
      dbOps.getShop(), dbOps.getDonate(), dbOps.getContact(), dbOps.getStats()
    ]);
    
    db = {
      website: { title: website.title || "Leoly Dev", description: website.description || "", logo: website.logo || "⚡", banner: website.banner || "" },
      home: { title: home.title || "Leoly Dev", subtitle: home.subtitle || "Systems & UI/UX Engineer", description: home.description || "", button1: home.button1 || "Explore", button2: home.button2 || "Contact" },
      about: { photo: about.photo || "", description: about.description || "", skills: about.skills || [] },
      projects: projects,
      shop: shop,
      donate: { qris: donate.qris || "", dana: donate.dana || "081234567890", ovo: donate.ovo || "081234567890", gopay: donate.gopay || "081234567890", saweria: donate.saweria || "#" },
      contact: { whatsapp: contact.whatsapp || "#", telegram: contact.telegram || "#", email: contact.email || "#", instagram: contact.instagram || "#", github: contact.github || "#" },
      statistics: { visitors: stats.visitors || 0 },
      settings: { maintenance: website.maintenance || false, theme: website.theme || "dark" }
    };
    
    renderAll();
    showToast("Terhubung ke Supabase!", "success");
  } catch (err) {
    console.error(err);
    showToast("Gagal terhubung ke Supabase", "error");
    db = getDefaultData();
    renderAll();
  }
}

function getDefaultData() {
  return {
    website: { title: "Leoly Dev", description: "Premium Portfolio", logo: "⚡", banner: "" },
    home: { title: "Leoly Dev", subtitle: "Developer", description: "Welcome", button1: "Explore", button2: "Contact" },
    about: { photo: "", description: "", skills: [] },
    projects: [], shop: [], donate: {}, contact: {},
    statistics: { visitors: 0 }, settings: { maintenance: false }
  };
}

async function trackVisitor() {
  try { 
    const newCount = await dbOps.incrementVisitors();
    if (db.statistics) db.statistics.visitors = newCount;
  } catch(e) { console.error(e); }
}

function setupRealtime() {
  supabase.channel('projects-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, async () => { await refreshProjects(); })
    .subscribe();
  supabase.channel('shop-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_products' }, async () => { await refreshShop(); })
    .subscribe();
}

async function refreshProjects() {
  db.projects = await dbOps.getProjects();
  renderProjects();
  if (document.getElementById('admin-projects-tbody')) renderAdminTables();
  updateStatsDisplay();
}

async function refreshShop() {
  db.shop = await dbOps.getShop();
  renderShop();
  if (document.getElementById('admin-shop-tbody')) renderAdminTables();
  updateStatsDisplay();
}

function updateStatsDisplay() {
  const visitorsEl = document.getElementById('m-visitors');
  const projectsEl = document.getElementById('m-projects');
  const productsEl = document.getElementById('m-products');
  if (visitorsEl) visitorsEl.innerText = db.statistics.visitors || 0;
  if (projectsEl) projectsEl.innerText = db.projects.length;
  if (productsEl) productsEl.innerText = db.shop.length;
}

function renderAll() {
  if (db.settings?.maintenance && !sessionStorage.getItem(SESSION_AUTH_KEY)) {
    document.getElementById('maintenance-screen')?.classList.remove('hidden-panel');
    document.getElementById('app-container')?.classList.add('hidden-panel');
    return;
  }
  document.getElementById('maintenance-screen')?.classList.add('hidden-panel');
  document.getElementById('app-container')?.classList.remove('hidden-panel');
  
  document.title = db.website.title;
  const logoElem = document.getElementById('web-logo-txt');
  if (logoElem) logoElem.innerText = `${db.website.logo} ${db.website.title}`;
  const sidebarBrand = document.getElementById('sidebar-brand');
  if (sidebarBrand) sidebarBrand.innerText = db.website.title;
  
  const heroTitle = document.getElementById('hero-title-node');
  if (heroTitle) heroTitle.innerText = db.home.title;
  const heroSubtitle = document.getElementById('hero-subtitle-node');
  if (heroSubtitle) heroSubtitle.innerText = db.home.subtitle;
  const heroDesc = document.getElementById('hero-desc-node');
  if (heroDesc) heroDesc.innerText = db.home.description;
  const heroBtn1 = document.getElementById('hero-btn1');
  if (heroBtn1) heroBtn1.innerText = db.home.button1;
  const heroBtn2 = document.getElementById('hero-btn2');
  if (heroBtn2) heroBtn2.innerText = db.home.button2;
  
  const aboutImg = document.getElementById('about-img-node');
  if (aboutImg && db.about.photo) aboutImg.src = db.about.photo;
  const aboutDesc = document.getElementById('about-desc-node');
  if (aboutDesc) aboutDesc.innerText = db.about.description;
  
  const skillsWrap = document.getElementById('about-skills-node');
  if (skillsWrap) {
    skillsWrap.innerHTML = '';
    if (db.about.skills && Array.isArray(db.about.skills)) {
      db.about.skills.forEach(skill => {
        skillsWrap.innerHTML += `<span class="skill-tag">${escapeHtml(skill)}</span>`;
      });
    }
  }
  
  const qrisImg = document.getElementById('donate-qris-node');
  if (qrisImg) qrisImg.src = db.donate.qris || '';
  const danaEl = document.getElementById('donate-dana-node');
  if (danaEl) danaEl.innerText = db.donate.dana || '-';
  const ovoEl = document.getElementById('donate-ovo-node');
  if (ovoEl) ovoEl.innerText = db.donate.ovo || '-';
  const gopayEl = document.getElementById('donate-gopay-node');
  if (gopayEl) gopayEl.innerText = db.donate.gopay || '-';
  const saweriaLink = document.getElementById('donate-saweria-node');
  if (saweriaLink) saweriaLink.href = db.donate.saweria || '#';
  
  const waLink = document.getElementById('ctx-wa');
  if (waLink) waLink.href = db.contact.whatsapp || '#';
  const tgLink = document.getElementById('ctx-tg');
  if (tgLink) tgLink.href = db.contact.telegram || '#';
  const mailLink = document.getElementById('ctx-mail');
  if (mailLink) mailLink.href = db.contact.email || '#';
  const igLink = document.getElementById('ctx-ig');
  if (igLink) igLink.href = db.contact.instagram || '#';
  const gitLink = document.getElementById('ctx-git');
  if (gitLink) gitLink.href = db.contact.github || '#';
  
  renderProjects();
  renderShop();
  populateFilters();
}

function renderProjects() {
  const container = document.getElementById('project-grid-node');
  if (!container) return;
  const search = document.getElementById('project-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('project-filter')?.value || 'all';
  const filtered = (db.projects || []).filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
    const matchFilter = filter === 'all' || p.category === filter;
    return matchSearch && matchFilter;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="glass-card text-center" style="padding: 3rem; grid-column: 1/-1;"><p class="text-secondary">No projects found</p></div>';
    return;
  }
  
  container.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card premium-card';
    card.innerHTML = `
      <div class="card-thumb-area">
        <span class="card-badge">${escapeHtml(p.category || 'Project')}</span>
        <img src="${escapeHtml(p.thumbnail)}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.src='https://placehold.co/400x250/1a1a1a/3B82F6?text=No+Image'">
      </div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(p.title)}</h4>
        <p class="card-description text-secondary">${escapeHtml(p.description)}</p>
        <div class="card-footer-actions">
          <a href="${escapeHtml(p.demo_url || p.demoUrl || '#')}" target="_blank" class="btn btn-primary" rel="noopener">Demo</a>
          <a href="${escapeHtml(p.source_url || p.sourceUrl || '#')}" target="_blank" class="btn btn-secondary" rel="noopener">Code</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderShop() {
  const container = document.getElementById('shop-grid-node');
  if (!container) return;
  const search = document.getElementById('shop-search')?.value.toLowerCase() || '';
  const filtered = (db.shop || []).filter(s => s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search));
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="glass-card text-center" style="padding: 3rem; grid-column: 1/-1;"><p class="text-secondary">No products available</p></div>';
    return;
  }
  
  container.innerHTML = '';
  filtered.forEach(s => {
    const card = document.createElement('div');
    card.className = 'glass-card premium-card';
    card.innerHTML = `
      <div class="card-thumb-area">
        <span class="card-badge" style="background: #10B981;">${escapeHtml(s.price)}</span>
        <img src="${escapeHtml(s.thumbnail)}" alt="${escapeHtml(s.title)}" loading="lazy" onerror="this.src='https://placehold.co/400x250/1a1a1a/10B981?text=No+Image'">
      </div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(s.title)}</h4>
        <p class="card-description text-secondary">${escapeHtml(s.description)}</p>
        <div class="card-footer-actions">
          <a href="${escapeHtml(s.buy_url || s.buyUrl || '#')}" target="_blank" class="btn btn-primary" style="width: 100%;" rel="noopener">Buy Now</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateFilters() {
  const select = document.getElementById('project-filter');
  if (!select) return;
  const categories = [...new Set((db.projects || []).map(p => p.category).filter(Boolean))];
  select.innerHTML = '<option value="all">All Architecture</option>';
  categories.forEach(cat => {
    select.innerHTML += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
  });
}

function setupNavigation() {
  const sections = document.querySelectorAll('.content-section');
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item:not(.admin-trigger-btn)');
  
  function setActiveSection(id) {
    sections.forEach(s => s.classList.remove('active-view'));
    navItems.forEach(n => n.classList.remove('active'));
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active-view');
    const targetNav = document.querySelector(`.sidebar-nav .nav-item[data-section="${id}"]`);
    if (targetNav) targetNav.classList.add('active');
  }
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.getAttribute('data-section');
      if (sectionId) {
        window.location.hash = sectionId;
        setActiveSection(sectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('right-sidebar')?.classList.remove('mobile-open');
      }
    });
  });
  
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash)) {
    setActiveSection(hash);
  } else {
    setActiveSection('home');
  }
  
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => { btt.classList.toggle('show-btn', window.scrollY > 400); });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

function setupUI() {
  const sidebar = document.getElementById('right-sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeBtn = document.getElementById('close-sidebar-btn');
  
  if (collapseBtn) collapseBtn.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
  if (toggleBtn) toggleBtn.addEventListener('click', () => sidebar?.classList.add('mobile-open'));
  if (closeBtn) closeBtn.addEventListener('click', () => sidebar?.classList.remove('mobile-open'));
  
  const projectSearch = document.getElementById('project-search');
  if (projectSearch) projectSearch.addEventListener('input', () => renderProjects());
  const projectFilter = document.getElementById('project-filter');
  if (projectFilter) projectFilter.addEventListener('change', () => renderProjects());
  const shopSearch = document.getElementById('shop-search');
  if (shopSearch) shopSearch.addEventListener('input', () => renderShop());
}

// ============ ADMIN PANEL - FIXED ============
function setupAdminPanel() {
  console.log("🔧 Setting up Admin Panel...");
  
  let adminLink = document.getElementById('admin-nav-link');
  if (!adminLink) adminLink = document.querySelector('.admin-trigger-btn');
  if (!adminLink) adminLink = document.querySelector('.sidebar-nav a[href="#admin"]');
  
  const modal = document.getElementById('admin-modal');
  const authCard = document.getElementById('admin-auth-card');
  const dashboard = document.getElementById('admin-dashboard-card');
  
  console.log("Admin link found:", !!adminLink);
  console.log("Modal found:", !!modal);
  
  if (!adminLink) {
    console.error("Admin link not found!");
    return;
  }
  
  // Replace with clone to remove old listeners
  const newLink = adminLink.cloneNode(true);
  adminLink.parentNode.replaceChild(newLink, adminLink);
  adminLink = newLink;
  
  adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Admin link clicked!");
    if (modal) modal.classList.remove('hidden-panel');
    if (sessionStorage.getItem(SESSION_AUTH_KEY) === 'authorized') {
      showDashboard(modal, authCard, dashboard);
    } else {
      if (authCard) authCard.classList.remove('hidden-panel');
      if (dashboard) dashboard.classList.add('hidden-panel');
    }
  });
  
  // Close modal buttons
  document.querySelectorAll('.close-modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => { if (modal) modal.classList.add('hidden-panel'); });
  });
  
  // Login form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('auth-user')?.value || '';
      const password = document.getElementById('auth-pass')?.value || '';
      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'authorized');
        showToast("Login Berhasil!", "success");
        showDashboard(modal, authCard, dashboard);
      } else {
        showToast("Username atau password salah! (admin / admin123)", "error");
      }
    });
  }
  
  // Logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      if (modal) modal.classList.add('hidden-panel');
      showToast("Logout berhasil", "info");
    });
  }
  
  // Tab switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const tabPanel = document.getElementById(tabId);
      if (tabPanel) tabPanel.classList.add('active');
    });
  });
}

function showDashboard(modal, authCard, dashboard) {
  if (authCard) authCard.classList.add('hidden-panel');
  if (dashboard) dashboard.classList.remove('hidden-panel');
  if (modal) modal.classList.remove('hidden-panel');
  loadAdminForms();
  renderAdminTables();
  initChart();
}

function loadAdminForms() {
  updateStatsDisplay();
  setValue('adm-web-title', db.website.title);
  setValue('adm-web-desc', db.website.description);
  setValue('adm-web-logo', db.website.logo);
  setValue('adm-web-banner', db.website.banner);
  const maintenanceCheck = document.getElementById('adm-sys-maintenance');
  if (maintenanceCheck) maintenanceCheck.checked = db.settings.maintenance;
  
  setValue('adm-home-title', db.home.title);
  setValue('adm-home-subtitle', db.home.subtitle);
  setValue('adm-home-desc', db.home.description);
  setValue('adm-home-btn1', db.home.button1);
  setValue('adm-home-btn2', db.home.button2);
  
  setValue('adm-about-photo', db.about.photo);
  setValue('adm-about-desc', db.about.description);
  setValue('adm-about-skills', db.about.skills?.join(', ') || '');
  
  setValue('adm-don-qris', db.donate.qris || '');
  setValue('adm-don-saweria', db.donate.saweria || '');
  setValue('adm-don-dana', db.donate.dana || '');
  setValue('adm-don-ovo', db.donate.ovo || '');
  setValue('adm-don-gopay', db.donate.gopay || '');
  setValue('adm-ctx-wa', db.contact.whatsapp || '');
  setValue('adm-ctx-tg', db.contact.telegram || '');
  setValue('adm-ctx-mail', db.contact.email || '');
  setValue('adm-ctx-ig', db.contact.instagram || '');
  setValue('adm-ctx-git', db.contact.github || '');
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setupFormHandlers() {
  const coreForm = document.getElementById('form-core-web');
  if (coreForm) {
    coreForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      db.website.title = getValue('adm-web-title');
      db.website.description = getValue('adm-web-desc');
      db.website.logo = getValue('adm-web-logo');
      db.website.banner = getValue('adm-web-banner');
      db.settings.maintenance = document.getElementById('adm-sys-maintenance')?.checked || false;
      await dbOps.updateWebsite({ title: db.website.title, description: db.website.description, logo: db.website.logo, banner: db.website.banner, maintenance: db.settings.maintenance, theme: db.settings.theme });
      renderAll();
      showToast("Website settings saved!", "success");
    });
  }
  
  const heroForm = document.getElementById('form-hero-editor');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      db.home.title = getValue('adm-home-title');
      db.home.subtitle = getValue('adm-home-subtitle');
      db.home.description = getValue('adm-home-desc');
      db.home.button1 = getValue('adm-home-btn1');
      db.home.button2 = getValue('adm-home-btn2');
      await dbOps.updateHome(db.home);
      renderAll();
      showToast("Hero section saved!", "success");
    });
  }
  
  const aboutForm = document.getElementById('form-about-editor');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      db.about.photo = getValue('adm-about-photo');
      db.about.description = getValue('adm-about-desc');
      const skillsStr = getValue('adm-about-skills');
      db.about.skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
      await dbOps.updateAbout(db.about);
      renderAll();
      showToast("About section saved!", "success");
    });
  }
  
  const gatewaysForm = document.getElementById('form-gateways');
  if (gatewaysForm) {
    gatewaysForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      db.donate.qris = getValue('adm-don-qris');
      db.donate.saweria = getValue('adm-don-saweria');
      db.donate.dana = getValue('adm-don-dana');
      db.donate.ovo = getValue('adm-don-ovo');
      db.donate.gopay = getValue('adm-don-gopay');
      db.contact.whatsapp = getValue('adm-ctx-wa');
      db.contact.telegram = getValue('adm-ctx-tg');
      db.contact.email = getValue('adm-ctx-mail');
      db.contact.instagram = getValue('adm-ctx-ig');
      db.contact.github = getValue('adm-ctx-git');
      await Promise.all([dbOps.updateDonate(db.donate), dbOps.updateContact(db.contact)]);
      renderAll();
      showToast("Gateways saved!", "success");
    });
  }
  
  const addProjectBtn = document.getElementById('open-add-project-btn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => openProjectModal());
  }
  
  const addShopBtn = document.getElementById('open-add-shop-btn');
  if (addShopBtn) {
    addShopBtn.addEventListener('click', () => openShopModal());
  }
}

function openProjectModal() {
  const title = prompt("Project Title:");
  if (!title) return;
  const category = prompt("Category:", "Web App");
  const description = prompt("Description:");
  const thumbnail = prompt("Thumbnail URL:", "https://placehold.co/600x400/1a1a1a/3B82F6?text=Project");
  const demoUrl = prompt("Demo URL:", "#");
  const sourceUrl = prompt("Source URL:", "#");
  
  const newProject = { id: Date.now().toString(), title, category, description, thumbnail, demo_url: demoUrl, source_url: sourceUrl, created_at: new Date() };
  dbOps.addProject(newProject).then(async () => { await refreshProjects(); renderAdminTables(); showToast("Project added!", "success"); }).catch(err => showToast("Error: " + err.message, "error"));
}

function openShopModal() {
  const title = prompt("Product Title:");
  if (!title) return;
  const price = prompt("Price:", "Rp 99.000");
  const description = prompt("Description:");
  const thumbnail = prompt("Thumbnail URL:", "https://placehold.co/600x400/1a1a1a/10B981?text=Product");
  const buyUrl = prompt("Buy URL:", "#");
  
  const newProduct = { id: Date.now().toString(), title, price, description, thumbnail, buy_url: buyUrl, created_at: new Date() };
  dbOps.addShop(newProduct).then(async () => { await refreshShop(); renderAdminTables(); showToast("Product added!", "success"); }).catch(err => showToast("Error: " + err.message, "error"));
}

function renderAdminTables() {
  const pBody = document.getElementById('admin-projects-tbody');
  if (pBody) {
    pBody.innerHTML = '';
    (db.projects || []).forEach(p => {
      pBody.innerHTML += `<tr><td><strong>${escapeHtml(p.title)}</strong></td><td><span class="skill-tag" style="font-size:0.7rem;">${escapeHtml(p.category)}</span></td><td><button class="action-link-btn action-edit" onclick="window.editProject('${p.id}')"><i class="fa fa-edit"></i></button> <button class="action-link-btn action-delete" onclick="window.deleteProject('${p.id}')"><i class="fa fa-trash"></i></button></td></tr>`;
    });
  }
  const sBody = document.getElementById('admin-shop-tbody');
  if (sBody) {
    sBody.innerHTML = '';
    (db.shop || []).forEach(s => {
      sBody.innerHTML += `<tr><td><strong>${escapeHtml(s.title)}</strong></td><td style="color:#10B981; font-weight:600;">${escapeHtml(s.price)}</td><td><button class="action-link-btn action-edit" onclick="window.editShop('${s.id}')"><i class="fa fa-edit"></i></button> <button class="action-link-btn action-delete" onclick="window.deleteShop('${s.id}')"><i class="fa fa-trash"></i></button></td></tr>`;
    });
  }
}

window.editProject = async (id) => {
  const project = db.projects.find(p => p.id === id);
  if (!project) return;
  const newTitle = prompt("Edit title:", project.title);
  if (newTitle) {
    project.title = newTitle;
    const newCategory = prompt("Edit category:", project.category);
    if (newCategory) project.category = newCategory;
    const newDesc = prompt("Edit description:", project.description);
    if (newDesc) project.description = newDesc;
    await dbOps.updateProject(id, project);
    await refreshProjects();
    renderAdminTables();
    showToast("Project updated!", "success");
  }
};

window.deleteProject = async (id) => {
  if (confirm("Are you sure you want to delete this project?")) {
    await dbOps.deleteProject(id);
    await refreshProjects();
    renderAdminTables();
    showToast("Project deleted!", "success");
  }
};

window.editShop = async (id) => {
  const product = db.shop.find(s => s.id === id);
  if (!product) return;
  const newTitle = prompt("Edit title:", product.title);
  if (newTitle) {
    product.title = newTitle;
    const newPrice = prompt("Edit price:", product.price);
    if (newPrice) product.price = newPrice;
    await dbOps.updateShop(id, product);
    await refreshShop();
    renderAdminTables();
    showToast("Product updated!", "success");
  }
};

window.deleteShop = async (id) => {
  if (confirm("Are you sure you want to delete this product?")) {
    await dbOps.deleteShop(id);
    await refreshShop();
    renderAdminTables();
    showToast("Product deleted!", "success");
  }
};

function initChart() {
  const canvas = document.getElementById('analyticsChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (analyticsChartInstance) analyticsChartInstance.destroy();
  const visitors = db.statistics.visitors || 0;
  const baseData = [Math.floor(visitors * 0.3), Math.floor(visitors * 0.5), Math.floor(visitors * 0.7), Math.floor(visitors * 0.8), Math.floor(visitors * 0.9), Math.floor(visitors * 0.95), visitors];
  analyticsChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Visitors', data: baseData, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#3B82F6', pointBorderColor: '#fff', pointBorderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#fff', bodyColor: '#a1a1aa' } }, scales: { x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a1a1aa', font: { size: 10 } } } } }
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function hideLoading() {
  const loader = document.getElementById('loading-screen');
  if (loader) { loader.style.opacity = '0'; setTimeout(() => { loader.style.display = 'none'; }, 500); }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
// ============================================================
// LEOLY DEV - SUPABASE INTEGRATION
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============ SUPABASE CONFIGURATION (UPDATED) ============
const SUPABASE_URL = 'https://qndqvujqfuplmwpzrbgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHF2dWpxZnVwbG13cHpyYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODg1NTMsImV4cCI6MjA5NTg2NDU1M30.xjYhc6RdShq4uq-nRDKQ5uEvE02pzwixpfhfsCcLrrk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ STATE MANAGEMENT ============
let db = null;
let analyticsChartInstance = null;
let projectEditingId = null;
let shopEditingId = null;
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
  async incrementVisitors() {
    const current = await this.getStats();
    const { error } = await supabase.from('statistics').upsert({ id: 1, visitors: (current.visitors || 0) + 1 });
    if (error) throw error;
  }
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  setupNavigation();
  setupUI();
  setupAdmin();
  setupRealtime();
  hideLoading();
  trackVisitor();
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
      home: { title: home.title || "Leoly Dev", subtitle: home.subtitle || "", description: home.description || "", button1: home.button1 || "Explore", button2: home.button2 || "Contact" },
      about: { photo: about.photo || "", description: about.description || "", skills: about.skills || [] },
      projects: projects,
      shop: shop,
      donate: { qris: donate.qris || "", dana: donate.dana || "", ovo: donate.ovo || "", gopay: donate.gopay || "", saweria: donate.saweria || "" },
      contact: { whatsapp: contact.whatsapp || "", telegram: contact.telegram || "", email: contact.email || "", instagram: contact.instagram || "", github: contact.github || "" },
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
  try { await dbOps.incrementVisitors(); } catch(e) { console.error(e); }
}

function setupRealtime() {
  supabase.channel('public').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => refreshProjects()).subscribe();
  supabase.channel('public2').on('postgres_changes', { event: '*', schema: 'public', table: 'shop_products' }, () => refreshShop()).subscribe();
}

async function refreshProjects() {
  db.projects = await dbOps.getProjects();
  renderProjects();
  if (document.getElementById('admin-projects-tbody')) renderAdminTables();
}

async function refreshShop() {
  db.shop = await dbOps.getShop();
  renderShop();
  if (document.getElementById('admin-shop-tbody')) renderAdminTables();
}

// ============ RENDER FUNCTIONS ============
function renderAll() {
  if (db.settings?.maintenance && !sessionStorage.getItem(SESSION_AUTH_KEY)) {
    document.getElementById('maintenance-screen')?.classList.remove('hidden-panel');
    document.getElementById('app-container')?.classList.add('hidden-panel');
    return;
  }
  document.getElementById('maintenance-screen')?.classList.add('hidden-panel');
  document.getElementById('app-container')?.classList.remove('hidden-panel');
  
  document.title = db.website.title;
  document.getElementById('web-logo-txt').innerText = `${db.website.logo} ${db.website.title}`;
  document.getElementById('sidebar-brand').innerText = db.website.title;
  
  document.getElementById('hero-title-node').innerText = db.home.title;
  document.getElementById('hero-subtitle-node').innerText = db.home.subtitle;
  document.getElementById('hero-desc-node').innerText = db.home.description;
  document.getElementById('hero-btn1').innerText = db.home.button1;
  document.getElementById('hero-btn2').innerText = db.home.button2;
  
  const aboutImg = document.getElementById('about-img-node');
  if (aboutImg && db.about.photo) aboutImg.src = db.about.photo;
  document.getElementById('about-desc-node').innerText = db.about.description;
  
  const skillsWrap = document.getElementById('about-skills-node');
  if (skillsWrap) {
    skillsWrap.innerHTML = '';
    db.about.skills?.forEach(s => skillsWrap.innerHTML += `<span class="skill-tag">${escapeHtml(s)}</span>`);
  }
  
  document.getElementById('donate-qris-node').src = db.donate.qris || '';
  document.getElementById('donate-dana-node').innerText = db.donate.dana || '-';
  document.getElementById('donate-ovo-node').innerText = db.donate.ovo || '-';
  document.getElementById('donate-gopay-node').innerText = db.donate.gopay || '-';
  document.getElementById('donate-saweria-node').href = db.donate.saweria || '#';
  
  document.getElementById('ctx-wa').href = db.contact.whatsapp || '#';
  document.getElementById('ctx-tg').href = db.contact.telegram || '#';
  document.getElementById('ctx-mail').href = db.contact.email || '#';
  document.getElementById('ctx-ig').href = db.contact.instagram || '#';
  document.getElementById('ctx-git').href = db.contact.github || '#';
  
  renderProjects();
  renderShop();
  populateFilters();
}

function renderProjects() {
  const container = document.getElementById('project-grid-node');
  if (!container) return;
  const search = document.getElementById('project-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('project-filter')?.value || 'all';
  const filtered = (db.projects || []).filter(p => 
    (p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)) &&
    (filter === 'all' || p.category === filter)
  );
  
  container.innerHTML = filtered.length ? '' : '<div class="glass-card text-center" style="padding:3rem">No projects</div>';
  filtered.forEach(p => {
    container.innerHTML += `
      <div class="glass-card premium-card">
        <div class="card-thumb-area"><span class="card-badge">${escapeHtml(p.category)}</span><img src="${p.thumbnail}" loading="lazy"></div>
        <div class="card-body">
          <h4 class="card-title">${escapeHtml(p.title)}</h4>
          <p class="card-description text-secondary">${escapeHtml(p.description)}</p>
          <div class="card-footer-actions">
            <a href="${p.demo_url || p.demoUrl}" target="_blank" class="btn btn-primary">Demo</a>
            <a href="${p.source_url || p.sourceUrl}" target="_blank" class="btn btn-secondary">Code</a>
          </div>
        </div>
      </div>
    `;
  });
}

function renderShop() {
  const container = document.getElementById('shop-grid-node');
  if (!container) return;
  const search = document.getElementById('shop-search')?.value.toLowerCase() || '';
  const filtered = (db.shop || []).filter(s => s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search));
  
  container.innerHTML = filtered.length ? '' : '<div class="glass-card text-center" style="padding:3rem">No products</div>';
  filtered.forEach(s => {
    container.innerHTML += `
      <div class="glass-card premium-card">
        <div class="card-thumb-area"><span class="card-badge" style="background:#10b981">${escapeHtml(s.price)}</span><img src="${s.thumbnail}" loading="lazy"></div>
        <div class="card-body">
          <h4 class="card-title">${escapeHtml(s.title)}</h4>
          <p class="card-description text-secondary">${escapeHtml(s.description)}</p>
          <div class="card-footer-actions"><a href="${s.buy_url || s.buyUrl}" target="_blank" class="btn btn-primary">Buy Now</a></div>
        </div>
      </div>
    `;
  });
}

function populateFilters() {
  const select = document.getElementById('project-filter');
  if (!select) return;
  const cats = [...new Set((db.projects || []).map(p => p.category).filter(Boolean))];
  select.innerHTML = '<option value="all">All</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

// ============ NAVIGATION ============
function setupNavigation() {
  const sections = document.querySelectorAll('.content-section');
  const navs = document.querySelectorAll('.sidebar-nav .nav-item:not(.admin-trigger-btn)');
  
  function setActive(id) {
    sections.forEach(s => s.classList.remove('active-view'));
    navs.forEach(n => n.classList.remove('active'));
    document.getElementById(id)?.classList.add('active-view');
    document.querySelector(`.sidebar-nav .nav-item[data-section="${id}"]`)?.classList.add('active');
  }
  
  navs.forEach(n => n.addEventListener('click', (e) => {
    e.preventDefault();
    const id = n.getAttribute('data-section');
    window.location.hash = id;
    setActive(id);
    window.scrollTo({ top: 0 });
    document.getElementById('right-sidebar')?.classList.remove('mobile-open');
  }));
  
  const hash = window.location.hash.slice(1);
  setActive(document.getElementById(hash) ? hash : 'home');
  
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btt?.classList.toggle('show-btn', window.scrollY > 400));
  btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setupUI() {
  const sidebar = document.getElementById('right-sidebar');
  document.getElementById('sidebar-collapse-btn')?.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => sidebar?.classList.add('mobile-open'));
  document.getElementById('close-sidebar-btn')?.addEventListener('click', () => sidebar?.classList.remove('mobile-open'));
  document.getElementById('project-search')?.addEventListener('input', () => renderProjects());
  document.getElementById('project-filter')?.addEventListener('change', () => renderProjects());
  document.getElementById('shop-search')?.addEventListener('input', () => renderShop());
}

// ============ ADMIN PANEL ============
function setupAdmin() {
  const modal = document.getElementById('admin-modal');
  const authCard = document.getElementById('admin-auth-card');
  const dashboard = document.getElementById('admin-dashboard-card');
  
  document.getElementById('admin-nav-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    modal?.classList.remove('hidden-panel');
    if (sessionStorage.getItem(SESSION_AUTH_KEY) === 'authorized') showDashboard();
    else { authCard?.classList.remove('hidden-panel'); dashboard?.classList.add('hidden-panel'); }
  });
  
  document.querySelectorAll('.close-modal-trigger').forEach(btn => btn.addEventListener('click', () => modal?.classList.add('hidden-panel')));
  
  document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('auth-user')?.value;
    const pass = document.getElementById('auth-pass')?.value;
    if (user === 'admin' && pass === 'admin123') {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'authorized');
      showToast("Login Berhasil!", "success");
      showDashboard();
    } else showToast("Username atau password salah", "error");
  });
  
  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    modal?.classList.add('hidden-panel');
    showToast("Logout berhasil", "info");
  });
  
  // Tab switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
  
  // Form submissions
  document.getElementById('form-core-web')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    db.website.title = document.getElementById('adm-web-title').value;
    db.website.description = document.getElementById('adm-web-desc').value;
    db.website.logo = document.getElementById('adm-web-logo').value;
    db.website.banner = document.getElementById('adm-web-banner').value;
    db.settings.maintenance = document.getElementById('adm-sys-maintenance').checked;
    await dbOps.updateWebsite({ title: db.website.title, description: db.website.description, logo: db.website.logo, banner: db.website.banner, maintenance: db.settings.maintenance });
    renderAll();
    showToast("Tersimpan!", "success");
  });
  
  document.getElementById('form-hero-editor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    db.home.title = document.getElementById('adm-home-title').value;
    db.home.subtitle = document.getElementById('adm-home-subtitle').value;
    db.home.description = document.getElementById('adm-home-desc').value;
    db.home.button1 = document.getElementById('adm-home-btn1').value;
    db.home.button2 = document.getElementById('adm-home-btn2').value;
    await dbOps.updateHome(db.home);
    renderAll();
    showToast("Tersimpan!", "success");
  });
  
  document.getElementById('form-about-editor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    db.about.photo = document.getElementById('adm-about-photo').value;
    db.about.description = document.getElementById('adm-about-desc').value;
    db.about.skills = document.getElementById('adm-about-skills').value.split(',').map(s => s.trim());
    await dbOps.updateAbout(db.about);
    renderAll();
    showToast("Tersimpan!", "success");
  });
  
  document.getElementById('form-gateways')?.addEventListener('submit', async (e) => {
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
    await Promise.all([dbOps.updateDonate(db.donate), dbOps.updateContact(db.contact)]);
    renderAll();
    showToast("Tersimpan!", "success");
  });
  
  // CRUD buttons
  document.getElementById('open-add-project-btn')?.addEventListener('click', () => openProjectForm());
  document.getElementById('open-add-shop-btn')?.addEventListener('click', () => openShopForm());
}

function showDashboard() {
  document.getElementById('admin-auth-card')?.classList.add('hidden-panel');
  document.getElementById('admin-dashboard-card')?.classList.remove('hidden-panel');
  loadAdminForms();
  renderAdminTables();
  initChart();
}

function loadAdminForms() {
  document.getElementById('m-visitors').innerText = db.statistics.visitors;
  document.getElementById('m-projects').innerText = db.projects.length;
  document.getElementById('m-products').innerText = db.shop.length;
  
  document.getElementById('adm-web-title').value = db.website.title;
  document.getElementById('adm-web-desc').value = db.website.description;
  document.getElementById('adm-web-logo').value = db.website.logo;
  document.getElementById('adm-web-banner').value = db.website.banner;
  document.getElementById('adm-sys-maintenance').checked = db.settings.maintenance;
  
  document.getElementById('adm-home-title').value = db.home.title;
  document.getElementById('adm-home-subtitle').value = db.home.subtitle;
  document.getElementById('adm-home-desc').value = db.home.description;
  document.getElementById('adm-home-btn1').value = db.home.button1;
  document.getElementById('adm-home-btn2').value = db.home.button2;
  
  document.getElementById('adm-about-photo').value = db.about.photo;
  document.getElementById('adm-about-desc').value = db.about.description;
  document.getElementById('adm-about-skills').value = db.about.skills?.join(', ') || '';
  
  document.getElementById('adm-don-qris').value = db.donate.qris || '';
  document.getElementById('adm-don-saweria').value = db.donate.saweria || '';
  document.getElementById('adm-don-dana').value = db.donate.dana || '';
  document.getElementById('adm-don-ovo').value = db.donate.ovo || '';
  document.getElementById('adm-don-gopay').value = db.donate.gopay || '';
  document.getElementById('adm-ctx-wa').value = db.contact.whatsapp || '';
  document.getElementById('adm-ctx-tg').value = db.contact.telegram || '';
  document.getElementById('adm-ctx-mail').value = db.contact.email || '';
  document.getElementById('adm-ctx-ig').value = db.contact.instagram || '';
  document.getElementById('adm-ctx-git').value = db.contact.github || '';
}

function renderAdminTables() {
  const pBody = document.getElementById('admin-projects-tbody');
  if (pBody) {
    pBody.innerHTML = '';
    db.projects.forEach(p => {
      pBody.innerHTML += `<tr><td><strong>${escapeHtml(p.title)}</strong></td><td>${escapeHtml(p.category)}</td><td>
        <button class="action-link-btn action-edit" onclick="window.editProject('${p.id}')"><i class="fa fa-edit"></i></button>
        <button class="action-link-btn action-delete" onclick="window.deleteProject('${p.id}')"><i class="fa fa-trash"></i></button>
      </td></tr>`;
    });
  }
  
  const sBody = document.getElementById('admin-shop-tbody');
  if (sBody) {
    sBody.innerHTML = '';
    db.shop.forEach(s => {
      sBody.innerHTML += `<tr><td><strong>${escapeHtml(s.title)}</strong></td><td style="color:#10b981">${escapeHtml(s.price)}</td><td>
        <button class="action-link-btn action-edit" onclick="window.editShop('${s.id}')"><i class="fa fa-edit"></i></button>
        <button class="action-link-btn action-delete" onclick="window.deleteShop('${s.id}')"><i class="fa fa-trash"></i></button>
      </td></tr>`;
    });
  }
}

window.editProject = async (id) => {
  const p = db.projects.find(x => x.id === id);
  if (!p) return;
  const newTitle = prompt("Edit title:", p.title);
  if (newTitle) {
    p.title = newTitle;
    await dbOps.updateProject(id, p);
    await refreshProjects();
    renderAdminTables();
    showToast("Updated!", "success");
  }
};

window.deleteProject = async (id) => {
  if (confirm("Delete this project?")) {
    await dbOps.deleteProject(id);
    await refreshProjects();
    renderAdminTables();
    showToast("Deleted!", "success");
  }
};

window.editShop = async (id) => {
  const s = db.shop.find(x => x.id === id);
  if (!s) return;
  const newTitle = prompt("Edit product:", s.title);
  if (newTitle) {
    s.title = newTitle;
    await dbOps.updateShop(id, s);
    await refreshShop();
    renderAdminTables();
    showToast("Updated!", "success");
  }
};

window.deleteShop = async (id) => {
  if (confirm("Delete this product?")) {
    await dbOps.deleteShop(id);
    await refreshShop();
    renderAdminTables();
    showToast("Deleted!", "success");
  }
};

function openProjectForm() {
  const title = prompt("Project title:");
  if (!title) return;
  const category = prompt("Category:");
  const desc = prompt("Description:");
  const thumb = prompt("Thumbnail URL:");
  const demo = prompt("Demo URL:");
  const source = prompt("Source URL:");
  
  const newProject = {
    id: Date.now().toString(),
    title, category, description: desc, thumbnail: thumb, demo_url: demo, source_url: source,
    created_at: new Date()
  };
  dbOps.addProject(newProject).then(() => refreshProjects());
}

function openShopForm() {
  const title = prompt("Product title:");
  if (!title) return;
  const price = prompt("Price:");
  const desc = prompt("Description:");
  const thumb = prompt("Thumbnail URL:");
  const buyUrl = prompt("Buy URL:");
  
  const newProduct = {
    id: Date.now().toString(),
    title, price, description: desc, thumbnail: thumb, buy_url: buyUrl,
    created_at: new Date()
  };
  dbOps.addShop(newProduct).then(() => refreshShop());
}

function initChart() {
  const ctx = document.getElementById('analyticsChart')?.getContext('2d');
  if (!ctx) return;
  if (analyticsChartInstance) analyticsChartInstance.destroy();
  analyticsChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Visitors', data: [65, 120, 180, 220, 350, 480, db.statistics.visitors], borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// ============ UTILITIES ============
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function hideLoading() {
  const loader = document.getElementById('loading-screen');
  if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 500); }
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
/**
 * LEOLY DEV - SUPABASE EDITION
 * Full cloud integration with Supabase
 * Version 3.0.0
 */

// ========================
// UTILITIES
// ========================

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
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

function showToast(msg, icon = "fa-check-circle", duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:var(--primary)"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function isMobileDevice() {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ========================
// DEFAULT DATA (Fallback)
// ========================

const DEFAULT_PROJECTS = [
    { id: "p1", name: "Leoly Info Server Core", category: "Server Info", desc: "Arsitektur monitoring data server info internal berkinerja tinggi berbasis real-time data flow.", link: "https://emosoft.xyz", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format" },
    { id: "p2", name: "Premium SaaS Analytics UI", category: "Web App", desc: "Desain sistem dashboard modular dengan implementasi advanced glassmorphism modern.", link: "https://emosoft.xyz", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format" }
];

const DEFAULT_PRODUCTS = [
    { id: "s1", name: "Next-Gen Aurora CSS Pack", category: "Source Code", price: 150000, desc: "Modul konfigurasi animasi aurora gradient 60 FPS optimal untuk landing page premium.", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format" },
    { id: "s2", name: "Roblox Terrain Config", category: "Config", price: 85000, desc: "Script kustomisasi rendering terrain map untuk performa game mobile.", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format" }
];

const DEFAULT_SETTINGS = {
    id: "main",
    site_name: "Leoly Dev",
    hero_title: "Leoly Dev",
    hero_subtitle: "Membangun ekosistem teknologi modern, arsitektur server berkinerja tinggi, dan solusi digital premium berbasis UI/UX futuristik.",
    typing_strings: "Server Info Engine, Full-Stack Optimization, Luxury Front-End",
    wa: "081234567890", 
    tg: "@leolydev", 
    gh: "github.com/leolydev", 
    em: "admin@emosoft.xyz",
    dana: "081234567890", 
    ovo: "081234567890", 
    saweria: "https://saweria.co/leoly",
    qris_url: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LeolyDev"
};

// ========================
// STATE MANAGEMENT
// ========================

let appState = {
    projects: [],
    products: [],
    settings: DEFAULT_SETTINGS,
    cart: [],
    activeProjectFilter: "all",
    activeShopFilter: "all",
    projectSearch: "",
    shopSearch: "",
    isAdmin: false,
    currentUser: null
};

// ========================
// SUPABASE CLIENT INIT
// ========================

let supabaseClient = null;

// Wait for Supabase client to be ready
function initSupabaseClient() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (window.supabaseClient) {
                supabaseClient = window.supabaseClient;
                clearInterval(checkInterval);
                console.log('✅ Supabase client ready');
                resolve(true);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('⚠️ Supabase client timeout, using local storage');
            resolve(false);
        }, 5000);
    });
}

// ========================
// SUPABASE OPERATIONS
// ========================

async function loadProjectsFromSupabase() {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized');
            loadProjectsFromLocal();
            return false;
        }
        
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase projects error:', error);
            throw error;
        }
        
        if (data && data.length > 0) {
            appState.projects = data.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                desc: p.description,
                link: p.link,
                img: p.image_url
            }));
            console.log(`✅ Loaded ${appState.projects.length} projects from Supabase`);
        } else {
            console.log('No projects in Supabase, using defaults');
            appState.projects = [...DEFAULT_PROJECTS];
            // Seed data ke Supabase
            for (const project of DEFAULT_PROJECTS) {
                await supabaseClient.from('projects').upsert([{
                    id: project.id,
                    name: project.name,
                    category: project.category,
                    description: project.desc,
                    link: project.link,
                    image_url: project.img
                }]);
            }
        }
        
        renderProjectsEngine();
        updateCounters();
        return true;
    } catch (error) {
        console.error('Error loading projects:', error.message);
        showToast('Cannot connect to cloud, using local data', 'fa-cloud-arrow-down', 4000);
        loadProjectsFromLocal();
        return false;
    }
}

async function loadProductsFromSupabase() {
    try {
        if (!supabaseClient) {
            loadProductsFromLocal();
            return false;
        }
        
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            appState.products = data.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price,
                desc: p.description,
                img: p.image_url
            }));
            console.log(`✅ Loaded ${appState.products.length} products from Supabase`);
        } else {
            console.log('No products in Supabase, using defaults');
            appState.products = [...DEFAULT_PRODUCTS];
            // Seed data ke Supabase
            for (const product of DEFAULT_PRODUCTS) {
                await supabaseClient.from('products').upsert([{
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    description: product.desc,
                    image_url: product.img
                }]);
            }
        }
        
        renderShopEngine();
        updateCounters();
        return true;
    } catch (error) {
        console.error('Error loading products:', error.message);
        loadProductsFromLocal();
        return false;
    }
}

async function loadSettingsFromSupabase() {
    try {
        if (!supabaseClient) return false;
        
        const { data, error } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            appState.settings = {
                ...appState.settings,
                siteName: data.site_name || appState.settings.siteName,
                heroTitle: data.hero_title || appState.settings.heroTitle,
                heroSubtitle: data.hero_subtitle || appState.settings.heroSubtitle,
                typingStrings: data.typing_strings || appState.settings.typingStrings,
                wa: data.wa || appState.settings.wa,
                tg: data.tg || appState.settings.tg,
                gh: data.gh || appState.settings.gh,
                em: data.em || appState.settings.em,
                dana: data.dana || appState.settings.dana,
                ovo: data.ovo || appState.settings.ovo,
                saweria: data.saweria || appState.settings.saweria,
                qrisUrl: data.qris_url || appState.settings.qrisUrl
            };
            console.log('✅ Loaded settings from Supabase');
        } else {
            // Insert default settings
            await supabaseClient.from('settings').insert([{
                id: "main",
                site_name: DEFAULT_SETTINGS.site_name,
                hero_title: DEFAULT_SETTINGS.hero_title,
                hero_subtitle: DEFAULT_SETTINGS.hero_subtitle,
                typing_strings: DEFAULT_SETTINGS.typing_strings,
                wa: DEFAULT_SETTINGS.wa,
                tg: DEFAULT_SETTINGS.tg,
                gh: DEFAULT_SETTINGS.gh,
                em: DEFAULT_SETTINGS.em,
                dana: DEFAULT_SETTINGS.dana,
                ovo: DEFAULT_SETTINGS.ovo,
                saweria: DEFAULT_SETTINGS.saweria,
                qris_url: DEFAULT_SETTINGS.qris_url
            }]);
        }
        
        applyIdentitySettings();
        initTypingEffect();
        return true;
    } catch (error) {
        console.error('Error loading settings:', error);
        return false;
    }
}

async function saveProjectToSupabase(project) {
    try {
        const { error } = await supabaseClient
            .from('projects')
            .upsert([{
                id: project.id,
                name: project.name,
                category: project.category,
                description: project.desc,
                link: project.link,
                image_url: project.img,
                updated_at: new Date()
            }]);
        
        if (error) throw error;
        console.log('✅ Project saved to Supabase:', project.id);
        return true;
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Failed to save to cloud', 'fa-cloud-arrow-up');
        return false;
    }
}

async function saveProductToSupabase(product) {
    try {
        const { error } = await supabaseClient
            .from('products')
            .upsert([{
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                description: product.desc,
                image_url: product.img,
                updated_at: new Date()
            }]);
        
        if (error) throw error;
        console.log('✅ Product saved to Supabase:', product.id);
        return true;
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Failed to save to cloud', 'fa-cloud-arrow-up');
        return false;
    }
}

async function saveSettingsToSupabase() {
    try {
        const { error } = await supabaseClient
            .from('settings')
            .upsert([{
                id: "main",
                site_name: appState.settings.siteName,
                hero_title: appState.settings.heroTitle,
                hero_subtitle: appState.settings.heroSubtitle,
                typing_strings: appState.settings.typingStrings,
                wa: appState.settings.wa,
                tg: appState.settings.tg,
                gh: appState.settings.gh,
                em: appState.settings.em,
                dana: appState.settings.dana,
                ovo: appState.settings.ovo,
                saweria: appState.settings.saweria,
                qris_url: appState.settings.qrisUrl,
                updated_at: new Date()
            }]);
        
        if (error) throw error;
        showToast('Settings saved to cloud!', 'fa-cloud-arrow-up');
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Failed to save settings to cloud', 'fa-cloud-arrow-up');
        return false;
    }
}

async function deleteProjectFromSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('projects')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        return false;
    }
}

async function deleteProductFromSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}

async function incrementVisitorCount() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await supabaseClient
            .from('visitors')
            .select('*')
            .eq('date', today)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            await supabaseClient
                .from('visitors')
                .update({ visitor_count: data.visitor_count + 1 })
                .eq('date', today);
        } else {
            await supabaseClient
                .from('visitors')
                .insert([{ date: today, visitor_count: 1 }]);
        }
        
        // Get total visitors
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: totalData } = await supabaseClient
            .from('visitors')
            .select('visitor_count')
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
        
        const total = totalData?.reduce((sum, v) => sum + v.visitor_count, 0) || 1240;
        const visitorEl = document.getElementById("stat-visitor-count");
        if (visitorEl) visitorEl.innerText = total.toLocaleString();
        
        return total;
    } catch (error) {
        console.error('Error tracking visitor:', error);
        return 1240;
    }
}

// ========================
// LOCAL STORAGE FALLBACK
// ========================

function loadProjectsFromLocal() {
    const local = localStorage.getItem("leoly_projects");
    if (local) {
        appState.projects = JSON.parse(local);
    } else {
        appState.projects = DEFAULT_PROJECTS;
        localStorage.setItem("leoly_projects", JSON.stringify(DEFAULT_PROJECTS));
    }
    renderProjectsEngine();
}

function loadProductsFromLocal() {
    const local = localStorage.getItem("leoly_products");
    if (local) {
        appState.products = JSON.parse(local);
    } else {
        appState.products = DEFAULT_PRODUCTS;
        localStorage.setItem("leoly_products", JSON.stringify(DEFAULT_PRODUCTS));
    }
    renderShopEngine();
}

function saveStateToLocal() {
    localStorage.setItem("leoly_projects", JSON.stringify(appState.projects));
    localStorage.setItem("leoly_products", JSON.stringify(appState.products));
    localStorage.setItem("leoly_settings", JSON.stringify(appState.settings));
    localStorage.setItem("leoly_cart", JSON.stringify(appState.cart));
    updateCounters();
}

// ========================
// RENDER FUNCTIONS
// ========================

function buildParticles() {
    const container = document.getElementById("particles-container");
    if(!container) return;
    const particleCount = isMobileDevice() ? 8 : 20;
    for (let i = 0; i < particleCount; i++) {
        const el = document.createElement("div");
        el.className = "particle";
        el.style.left = Math.random() * 100 + "vw";
        el.style.top = Math.random() * 100 + "vh";
        const size = Math.random() * 3 + 2;
        el.style.width = size + "px";
        el.style.height = size + "px";
        el.style.setProperty("--d", (Math.random() * 12 + 8) + "s");
        container.appendChild(el);
    }
}

function applyIdentitySettings() {
    const s = appState.settings;
    document.title = `${s.siteName} | Developer Hub`;
    const logoEl = document.getElementById("site-logo");
    const footerEl = document.getElementById("footer-site-name");
    if (logoEl) logoEl.innerText = s.siteName;
    if (footerEl) footerEl.innerText = s.siteName;
    
    const heroTitle = document.getElementById("hero-display-title");
    const heroSubtitle = document.getElementById("hero-display-subtitle");
    if (heroTitle) heroTitle.innerText = s.heroTitle;
    if (heroSubtitle) heroSubtitle.innerText = s.heroSubtitle;
    
    const contacts = { 
        "ctx-wa": s.wa, "ctx-tg": s.tg, "ctx-gh": s.gh, "ctx-em": s.em,
        "ctx-dana": s.dana, "ctx-ovo": s.ovo, "ctx-saweria": s.saweria
    };
    Object.entries(contacts).forEach(([id, val]) => { 
        const el = document.getElementById(id); 
        if(el) el.innerText = val; 
    });
    
    const qrisImg = document.getElementById("donate-qris-img");
    if (qrisImg) qrisImg.src = s.qrisUrl;
}

function initTypingEffect() {
    const target = document.getElementById("typing-element");
    if(!target) return;
    const phrases = (appState.settings.typingStrings || "Server Info Engine, Full-Stack Optimization, Luxury Front-End").split(",").map(s => s.trim());
    let idx = 0, charIdx = 0, isDeleting = false;
    
    function type() {
        if (!phrases[idx]) return;
        const current = phrases[idx];
        if (isDeleting) {
            target.innerText = current.substring(0, charIdx - 1);
            charIdx--;
        } else {
            target.innerText = current.substring(0, charIdx + 1);
            charIdx++;
        }
        let speed = isDeleting ? 40 : 80;
        if (!isDeleting && charIdx === current.length) { 
            speed = 2000; 
            isDeleting = true; 
        } else if (isDeleting && charIdx === 0) { 
            isDeleting = false; 
            idx = (idx + 1) % phrases.length; 
            speed = 400; 
        }
        setTimeout(type, speed);
    }
    type();
}

function updateCounters() {
    const pCount = document.getElementById("stat-projects-count");
    const sCount = document.getElementById("stat-products-count");
    const cartCount = document.getElementById("cart-count");
    const admPCount = document.getElementById("adm-p-count");
    const admSCount = document.getElementById("adm-s-count");
    
    if (pCount) pCount.innerText = appState.projects.length;
    if (sCount) sCount.innerText = appState.products.length;
    if (cartCount) cartCount.innerText = appState.cart.reduce((s, i) => s + i.qty, 0);
    if (admPCount) admPCount.innerText = appState.projects.length;
    if (admSCount) admSCount.innerText = appState.products.length;
}

function renderProjectsEngine() {
    const grid = document.getElementById("projects-grid");
    if(!grid) return;
    grid.innerHTML = "";
    
    const filtered = appState.projects.filter(p => {
        const matchCat = appState.activeProjectFilter === "all" || p.category === appState.activeProjectFilter;
        const matchSearch = p.name.toLowerCase().includes(appState.projectSearch.toLowerCase()) || 
                           (p.desc && p.desc.toLowerCase().includes(appState.projectSearch.toLowerCase()));
        return matchCat && matchSearch;
    });
    
    if(filtered.length === 0) { 
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem;">No projects found</div>`; 
        return; 
    }
    
    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "item-card glass-card";
        card.innerHTML = `
            <div class="item-thumb-container">
                <img src="${p.img || 'https://placehold.co/400x200/1e293b/ffffff?text=Project'}" class="item-thumb" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x200/1e293b/ffffff?text=No+Image'">
                <span class="item-cat-badge">${escapeHtml(p.category)}</span>
            </div>
            <div class="item-body">
                <h3 class="item-title">${escapeHtml(p.name)}</h3>
                <p class="item-desc">${escapeHtml((p.desc || '').substring(0, 100))}...</p>
                <div class="item-footer">
                    <button class="btn btn-secondary ripple" onclick="viewItemDetail('project','${p.id}')">Details</button>
                    <a href="${p.link || '#'}" target="_blank" style="color:var(--primary);">Demo →</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderShopEngine() {
    const grid = document.getElementById("shop-grid");
    if(!grid) return;
    grid.innerHTML = "";
    
    const filtered = appState.products.filter(p => {
        const matchCat = appState.activeShopFilter === "all" || p.category === appState.activeShopFilter;
        const matchSearch = p.name.toLowerCase().includes(appState.shopSearch.toLowerCase()) || 
                           (p.desc && p.desc.toLowerCase().includes(appState.shopSearch.toLowerCase()));
        return matchCat && matchSearch;
    });
    
    if(filtered.length === 0) { 
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem;">No products found</div>`; 
        return; 
    }
    
    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "item-card glass-card";
        card.innerHTML = `
            <div class="item-thumb-container">
                <img src="${p.img || 'https://placehold.co/400x200/1e293b/ffffff?text=Product'}" class="item-thumb" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x200/1e293b/ffffff?text=No+Image'">
                <span class="item-cat-badge">${escapeHtml(p.category)}</span>
            </div>
            <div class="item-body">
                <h3 class="item-title">${escapeHtml(p.name)}</h3>
                <p class="item-desc">${escapeHtml((p.desc || '').substring(0, 100))}...</p>
                <div class="item-footer">
                    <span class="item-price">${formatRupiah(p.price || 0)}</span>
                    <button class="btn btn-primary ripple" onclick="addToCartEngine('${p.id}')">Buy</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ========================
// CART FUNCTIONS
// ========================

function addToCartEngine(id) {
    const product = appState.products.find(p => p.id === id);
    if (!product) { 
        showToast("Product not found!", "fa-triangle-exclamation"); 
        return; 
    }
    const cartItem = appState.cart.find(c => c.id === id);
    if(cartItem) { 
        cartItem.qty++; 
    } else { 
        appState.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 }); 
    }
    saveStateToLocal();
    showToast(`${product.name} added to cart!`, "fa-cart-plus");
}

function openCartModal() {
    const listNode = document.getElementById("cart-items-list");
    if(!listNode) return;
    listNode.innerHTML = "";
    let grandTotal = 0;
    
    if(appState.cart.length === 0) {
        listNode.innerHTML = `<p style="text-align:center; padding:1rem;">Cart is empty</p>`;
    } else {
        appState.cart.forEach(c => {
            grandTotal += c.price * c.qty;
            const row = document.createElement("div");
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem; padding:0.6rem; background:rgba(0,0,0,0.2); border-radius:8px;";
            row.innerHTML = `
                <div><strong>${escapeHtml(c.name)}</strong><br><small>${c.qty} x ${formatRupiah(c.price)}</small></div>
                <button class="btn btn-danger" style="padding:0.3rem 0.6rem;" onclick="removeFromCartEngine('${c.id}')">×</button>
            `;
            listNode.appendChild(row);
        });
    }
    const totalEl = document.getElementById("cart-total-price");
    if (totalEl) totalEl.innerText = formatRupiah(grandTotal);
    document.getElementById("cart-modal").classList.add("active");
}

function removeFromCartEngine(id) {
    appState.cart = appState.cart.filter(c => c.id !== id);
    saveStateToLocal();
    openCartModal();
}

function viewItemDetail(type, id) {
    const modal = document.getElementById("detail-modal");
    const titleEl = document.getElementById("detail-title");
    const imgEl = document.getElementById("detail-img");
    const descEl = document.getElementById("detail-desc");
    const actionEl = document.getElementById("detail-footer-action");
    
    if(type === 'project') {
        const item = appState.projects.find(p => p.id === id);
        if(!item) return;
        titleEl.innerText = item.name;
        imgEl.src = item.img || 'https://placehold.co/400x200/1e293b/ffffff?text=Project';
        descEl.innerText = item.desc;
        actionEl.innerHTML = `<a href="${item.link || '#'}" target="_blank" class="btn btn-primary w-100">View Demo →</a>`;
    } else {
        const item = appState.products.find(p => p.id === id);
        if(!item) return;
        titleEl.innerText = item.name;
        imgEl.src = item.img || 'https://placehold.co/400x200/1e293b/ffffff?text=Product';
        descEl.innerText = item.desc;
        actionEl.innerHTML = `<button class="btn btn-primary w-100" onclick="addToCartEngine('${item.id}'); closeModalSystem();">Buy ${formatRupiah(item.price)}</button>`;
    }
    modal.classList.add("active");
}

function copyContact(type, value) {
    navigator.clipboard.writeText(value).then(() => {
        showToast(`${type} copied!`, "fa-copy");
    }).catch(() => {
        showToast(`Failed to copy ${type}`, "fa-triangle-exclamation");
    });
}

// ========================
// MODAL SYSTEM
// ========================

function closeModalSystem() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
}

// ========================
// AUTHENTICATION
// ========================

async function loginWithSupabase(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        appState.isAdmin = true;
        appState.currentUser = data.user;
        sessionStorage.setItem("admin_session", "active");
        sessionStorage.setItem("admin_email", email);
        
        showToast(`Welcome ${email}!`, "fa-user-shield");
        closeModalSystem();
        toggleAdminPanelMode(true);
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || "Login failed!", "fa-circle-xmark");
        return false;
    }
}

async function logoutFromSupabase() {
    try {
        await supabaseClient.auth.signOut();
        appState.isAdmin = false;
        appState.currentUser = null;
        sessionStorage.removeItem("admin_session");
        sessionStorage.removeItem("admin_email");
        toggleAdminPanelMode(false);
        showToast("Logged out successfully", "fa-power-off");
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

async function checkAuthStatus() {
    const session = sessionStorage.getItem("admin_session");
    if (session === "active") {
        const { data } = await supabaseClient.auth.getSession();
        if (data.session) {
            appState.isAdmin = true;
            appState.currentUser = data.session.user;
            return true;
        } else {
            sessionStorage.removeItem("admin_session");
            appState.isAdmin = false;
            return false;
        }
    }
    return false;
}

// ========================
// ADMIN PANEL FUNCTIONS
// ========================

let adminInactivityTimer;

function resetAdminTimer() {
    if (adminInactivityTimer) clearTimeout(adminInactivityTimer);
    adminInactivityTimer = setTimeout(() => {
        if (appState.isAdmin) {
            logoutFromSupabase();
            showToast("Session expired due to inactivity", "fa-clock");
        }
    }, 30 * 60 * 1000);
}

function toggleAdminPanelMode(show) {
    const panel = document.getElementById("admin-panel");
    if(!panel) return;
    if(show) {
        panel.style.display = "block";
        populateAdminDashboardTables();
        resetAdminTimer();
        document.addEventListener('click', resetAdminTimer);
        document.addEventListener('keydown', resetAdminTimer);
        
        const userInfo = document.getElementById("admin-user-info");
        if (userInfo && appState.currentUser) {
            userInfo.innerHTML = `<i class="fa-solid fa-user"></i> ${appState.currentUser.email}`;
        }
    } else {
        panel.style.display = "none";
        document.removeEventListener('click', resetAdminTimer);
        document.removeEventListener('keydown', resetAdminTimer);
    }
}

function populateAdminDashboardTables() {
    const pTable = document.getElementById("adm-projects-table");
    if(pTable) {
        pTable.innerHTML = "";
        appState.projects.forEach(p => {
            pTable.innerHTML += `
                <tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td>${escapeHtml(p.category)}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="openEditorEngine('project','${p.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteDataEngine('project','${p.id}')">Del</button>
                    </td>
                </tr>
            `;
        });
    }
    
    const sTable = document.getElementById("adm-products-table");
    if(sTable) {
        sTable.innerHTML = "";
        appState.products.forEach(p => {
            sTable.innerHTML += `
                <tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td>${escapeHtml(p.category)}</td>
                    <td>${formatRupiah(p.price || 0)}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="openEditorEngine('product','${p.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteDataEngine('product','${p.id}')">Del</button>
                    </td>
                </tr>
            `;
        });
    }
    
    const s = appState.settings;
    const settingsFields = {
        "adm-site-name": s.siteName,
        "adm-hero-title": s.heroTitle,
        "adm-hero-subtitle": s.heroSubtitle,
        "adm-typing-strings": s.typingStrings,
        "adm-wa": s.wa,
        "adm-tg": s.tg,
        "adm-gh": s.gh,
        "adm-em": s.em,
        "adm-dana": s.dana,
        "adm-ovo": s.ovo,
        "adm-saweria": s.saweria,
        "adm-qris-url": s.qrisUrl
    };
    
    Object.entries(settingsFields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    });
}

function openEditorEngine(type, id = null) {
    const modal = document.getElementById("editor-modal");
    const catSelect = document.getElementById("edit-category");
    if(!modal || !catSelect) return;
    
    document.getElementById("editor-target-type").value = type;
    document.getElementById("editor-target-id").value = id || "";
    catSelect.innerHTML = "";
    
    if(type === 'project') {
        document.getElementById("editor-modal-title").innerText = id ? "Edit Project" : "New Project";
        document.getElementById("group-edit-price").style.display = "none";
        document.getElementById("group-edit-link").style.display = "block";
        ["Web App", "Server Info", "Game Template"].forEach(c => catSelect.innerHTML += `<option value="${c}">${c}</option>`);
        
        if(id) {
            const data = appState.projects.find(p => p.id === id);
            if(data) {
                document.getElementById("edit-name").value = data.name;
                catSelect.value = data.category;
                document.getElementById("edit-link").value = data.link || "";
                document.getElementById("edit-img").value = data.img || "";
                document.getElementById("edit-desc").value = data.desc || "";
            }
        } else { 
            document.getElementById("editor-form").reset();
            document.getElementById("edit-link").value = "https://";
        }
    } else {
        document.getElementById("editor-modal-title").innerText = id ? "Edit Product" : "New Product";
        document.getElementById("group-edit-price").style.display = "block";
        document.getElementById("group-edit-link").style.display = "none";
        ["Source Code", "Config", "Design"].forEach(c => catSelect.innerHTML += `<option value="${c}">${c}</option>`);
        
        if(id) {
            const data = appState.products.find(p => p.id === id);
            if(data) {
                document.getElementById("edit-name").value = data.name;
                catSelect.value = data.category;
                document.getElementById("edit-price").value = data.price || 0;
                document.getElementById("edit-img").value = data.img || "";
                document.getElementById("edit-desc").value = data.desc || "";
            }
        } else { 
            document.getElementById("editor-form").reset();
            document.getElementById("edit-price").value = 0;
        }
    }
    modal.classList.add("active");
}

async function deleteDataEngine(type, id) {
    if(!confirm("Delete this item? This action syncs to cloud.")) return;
    
    let success = false;
    if(type === 'project') {
        success = await deleteProjectFromSupabase(id);
        if (success) {
            appState.projects = appState.projects.filter(p => p.id !== id);
        }
    } else {
        success = await deleteProductFromSupabase(id);
        if (success) {
            appState.products = appState.products.filter(p => p.id !== id);
        }
    }
    
    if (success) {
        saveStateToLocal();
        populateAdminDashboardTables();
        renderProjectsEngine();
        renderShopEngine();
        showToast("Item deleted from cloud", "fa-trash");
    } else {
        showToast("Failed to delete from cloud", "fa-triangle-exclamation");
    }
}

// ========================
// EVENT LISTENERS
// ========================

function initEventListeners() {
    window.addEventListener("scroll", () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const progress = document.getElementById("scroll-progress");
        if(progress) progress.style.width = scrollPercent + "%";
        const fab = document.getElementById("back-to-top");
        if(fab) { if(window.scrollY > 300) fab.classList.add("show"); else fab.classList.remove("show"); }
        const navbar = document.querySelector(".navbar");
        if(navbar) { if(window.scrollY > 50) navbar.classList.add("scrolled"); else navbar.classList.remove("scrolled"); }
    });
    
    document.getElementById("back-to-top")?.addEventListener("click", () => window.scrollTo({top:0, behavior:'smooth'}));
    
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    if(hamburger && navMenu) {
        hamburger.addEventListener("click", () => navMenu.classList.toggle("active"));
        document.querySelectorAll(".nav-link").forEach(l => l.addEventListener("click", () => navMenu.classList.remove("active")));
    }
    
    const debouncedProject = debounce(() => renderProjectsEngine(), 300);
    const debouncedShop = debounce(() => renderShopEngine(), 300);
    document.getElementById("project-search")?.addEventListener("input", (e) => { appState.projectSearch = e.target.value; debouncedProject(); });
    document.getElementById("shop-search")?.addEventListener("input", (e) => { appState.shopSearch = e.target.value; debouncedShop(); });
    
    document.querySelectorAll("#project-filters .filter-btn").forEach(btn => btn.addEventListener("click", function() {
        document.querySelectorAll("#project-filters .filter-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        appState.activeProjectFilter = this.dataset.filter;
        renderProjectsEngine();
    }));
    document.querySelectorAll("#shop-filters .filter-btn").forEach(btn => btn.addEventListener("click", function() {
        document.querySelectorAll("#shop-filters .filter-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        appState.activeShopFilter = this.dataset.filter;
        renderShopEngine();
    }));
    
    document.getElementById("cart-toggle-btn")?.addEventListener("click", openCartModal);
    document.getElementById("checkout-btn")?.addEventListener("click", () => {
        if(appState.cart.length === 0) return showToast("Cart is empty", "fa-triangle-exclamation");
        let text = "I want to buy:\n";
        appState.cart.forEach(c => text += `- ${c.name} (x${c.qty}) = ${formatRupiah(c.price * c.qty)}\n`);
        text += `\nTotal: ${document.getElementById("cart-total-price")?.innerText}`;
        window.open(`https://wa.me/${appState.settings.wa}?text=${encodeURIComponent(text)}`, "_blank");
    });
    
    document.getElementById("open-login-btn")?.addEventListener("click", () => {
        if(appState.isAdmin) {
            toggleAdminPanelMode(true);
        } else {
            document.getElementById("login-modal").classList.add("active");
        }
    });
    
    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("admin-email").value;
        const password = document.getElementById("admin-pass").value;
        await loginWithSupabase(email, password);
    });
    
    document.getElementById("admin-logout-btn")?.addEventListener("click", async () => {
        await logoutFromSupabase();
    });
    
    document.querySelectorAll(".admin-nav-item").forEach(btn => btn.addEventListener("click", function() {
        document.querySelectorAll(".admin-nav-item").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        document.getElementById(this.dataset.tab).classList.add("active");
    }));
    
    document.getElementById("adm-hero-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        appState.settings.siteName = document.getElementById("adm-site-name").value;
        appState.settings.heroTitle = document.getElementById("adm-hero-title").value;
        appState.settings.heroSubtitle = document.getElementById("adm-hero-subtitle").value;
        appState.settings.typingStrings = document.getElementById("adm-typing-strings").value;
        
        await saveSettingsToSupabase();
        saveStateToLocal();
        applyIdentitySettings();
        initTypingEffect();
        showToast("Hero settings saved to cloud!");
    });
    
    document.getElementById("adm-contact-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        appState.settings.wa = document.getElementById("adm-wa").value;
        appState.settings.tg = document.getElementById("adm-tg").value;
        appState.settings.gh = document.getElementById("adm-gh").value;
        appState.settings.em = document.getElementById("adm-em").value;
        appState.settings.dana = document.getElementById("adm-dana").value;
        appState.settings.ovo = document.getElementById("adm-ovo").value;
        appState.settings.saweria = document.getElementById("adm-saweria").value;
        appState.settings.qrisUrl = document.getElementById("adm-qris-url").value;
        
        await saveSettingsToSupabase();
        saveStateToLocal();
        applyIdentitySettings();
        showToast("Contact settings saved to cloud!");
    });
    
    document.getElementById("adm-add-project-btn")?.addEventListener("click", () => openEditorEngine('project'));
    document.getElementById("adm-add-product-btn")?.addEventListener("click", () => openEditorEngine('product'));
    
    document.getElementById("editor-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const type = document.getElementById("editor-target-type").value;
        const id = document.getElementById("editor-target-id").value;
        
        const newItem = {
            id: id || "item_" + Date.now(),
            name: document.getElementById("edit-name").value,
            category: document.getElementById("edit-category").value,
            img: document.getElementById("edit-img").value || "https://placehold.co/400x200/1e293b/ffffff?text=Image",
            desc: document.getElementById("edit-desc").value
        };
        
        let success = false;
        if(type === 'project') {
            newItem.link = document.getElementById("edit-link").value || "https://";
            success = await saveProjectToSupabase(newItem);
            if (success) {
                if(id) {
                    const idx = appState.projects.findIndex(p => p.id === id);
                    if(idx !== -1) appState.projects[idx] = newItem;
                } else {
                    appState.projects.push(newItem);
                }
            }
        } else {
            newItem.price = parseInt(document.getElementById("edit-price").value) || 0;
            success = await saveProductToSupabase(newItem);
            if (success) {
                if(id) {
                    const idx = appState.products.findIndex(p => p.id === id);
                    if(idx !== -1) appState.products[idx] = newItem;
                } else {
                    appState.products.push(newItem);
                }
            }
        }
        
        if (success) {
            saveStateToLocal();
            closeModalSystem();
            populateAdminDashboardTables();
            renderProjectsEngine();
            renderShopEngine();
            showToast("Saved to cloud successfully!", "fa-check");
        } else {
            showToast("Failed to save to cloud", "fa-triangle-exclamation");
        }
    });
    
    document.getElementById("db-sync-btn")?.addEventListener("click", async () => {
        showToast("Syncing from cloud...", "fa-arrows-rotate");
        await loadProjectsFromSupabase();
        await loadProductsFromSupabase();
        await loadSettingsFromSupabase();
        showToast("Sync complete!", "fa-check");
    });
    
    document.getElementById("db-export-btn")?.addEventListener("click", () => {
        const data = JSON.stringify({ 
            projects: appState.projects, 
            products: appState.products, 
            settings: appState.settings 
        }, null, 2);
        const blob = new Blob([data], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leoly_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Exported to JSON!");
    });
    
    document.getElementById("db-reset-btn")?.addEventListener("click", () => {
        if(confirm("⚠️ WARNING: This will clear local cache only. Cloud data remains. Continue?")) {
            localStorage.clear();
            showToast("Local cache cleared. Refresh page to sync from cloud.", "fa-refresh");
            setTimeout(() => window.location.reload(), 1500);
        }
    });
    
    document.querySelectorAll(".close-modal").forEach(b => b.addEventListener("click", closeModalSystem));
    window.addEventListener("click", (e) => { if(e.target.classList.contains("modal-overlay")) closeModalSystem(); });
    
    window.addEventListener("keydown", (e) => {
        if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            if(appState.isAdmin) toggleAdminPanelMode(true);
            else document.getElementById("login-modal").classList.add("active");
        }
        if(e.key === "Escape") closeModalSystem();
    });
    
    document.querySelectorAll(".ripple").forEach(btn => {
        btn.addEventListener("click", function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement("span");
            ripple.className = "ripple-effect";
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ========================
// CHART INIT
// ========================

function initChartEngine() {
    const ctx = document.getElementById('analyticsChart');
    if(!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            datasets: [{
                label: 'Traffic',
                data: [420, 590, 880, 810, 990, 1240],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.05)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// ========================
// DOM READY
// ========================

document.addEventListener("DOMContentLoaded", async () => {
    setTimeout(() => {
        const loader = document.getElementById("loading-screen");
        if(loader) { loader.style.opacity = "0"; setTimeout(() => loader.remove(), 500); }
    }, 1500);
    
    await checkAuthStatus();
    
    showToast("Connecting to Supabase cloud...", "fa-cloud", 2000);
    
    await Promise.all([
        loadProjectsFromSupabase(),
        loadProductsFromSupabase(),
        loadSettingsFromSupabase()
    ]);
    
    await incrementVisitorCount();
    
    buildParticles();
    updateCounters();
    initChartEngine();
    initEventListeners();
    
    if (window.checkSupabaseConnection) {
        await window.checkSupabaseConnection();
    }
    
    AOS.init({ duration: 800, once: true });
    
    console.log("Leoly Dev Supabase Edition v3.0.0 Ready! 🚀");
});
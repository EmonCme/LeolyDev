/* --- ECOSYSTEM CONFIGURATION & SUPABASE INITIATION --- */

// Supabase Configuration
const SUPABASE_URL = "https://umpykccadfpnukoxbmep.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcHlrY2NhZGZwbnVrb3hibWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzE1NTEsImV4cCI6MjA5NTg0NzU1MX0.oi0Hi1fXyQDYeB4QOeWSGyoxpaErnld5czV5Ym_8FV0";

let supabase;

// Default data untuk inisialisasi pertama kali
const DEFAULT_PROJECTS = [
    { id: "p1", title: "E-Commerce Platform Modern", category: "Web", desc: "Platform belanja online dengan fitur keranjang, pembayaran, dan dashboard admin real-time.", likes: 45, image: null },
    { id: "p2", title: "Portfolio Glassmorphism", category: "UI/UX", desc: "Desain portfolio premium dengan efek glassmorphism dan animasi halus.", likes: 38, image: null },
    { id: "p3", title: "RESTful API Service", category: "Server", desc: "Backend service dengan autentikasi JWT dan dokumentasi API lengkap.", likes: 29, image: null },
    { id: "p4", title: "Task Management App", category: "Web", desc: "Aplikasi manajemen tugas kolaboratif dengan real-time update.", likes: 52, image: null }
];

const DEFAULT_PRODUCTS = [
    { id: "pr1", name: "Premium Portfolio Template", category: "Template", price: 199000, desc: "Template portfolio modern dengan desain glassmorphism dan animasi menarik.", image: null },
    { id: "pr2", name: "React Component Library", category: "Module", price: 349000, desc: "Koleksi komponen React siap pakai untuk mempercepat development.", image: null },
    { id: "pr3", name: "Icon Pack - Minimalist", category: "Asset", price: 99000, desc: "Paket 200+ ikon minimalist untuk berbagai kebutuhan desain.", image: null },
    { id: "pr4", name: "Dashboard Admin Template", category: "Template", price: 299000, desc: "Template dashboard admin dengan fitur lengkap dan responsif.", image: null }
];

const DEFAULT_FAQS = [
    { id: "f1", question: "Berapa lama waktu pengerjaan project?", answer: "Durasi pengerjaan tergantung kompleksitas project. Rata-rata 2-4 minggu untuk website company profile, dan 1-3 bulan untuk aplikasi kompleks." },
    { id: "f2", question: "Apakah menerima kerjasama jangka panjang?", answer: "Ya, saya terbuka untuk kerjasama retainer atau kontrak jangka panjang untuk maintenance dan pengembangan berkelanjutan." },
    { id: "f3", question: "Teknologi apa yang biasa digunakan?", answer: "Saya menggunakan React/Next.js untuk frontend, Node.js/Python untuk backend, dan berbagai database sesuai kebutuhan project." }
];

const DEFAULT_TESTIMONIALS = [
    { id: "t1", name: "Budi Santoso", company: "TechCorp ID", text: "Leoly sangat profesional dan cepat dalam mengerjakan project. Hasilnya melebihi ekspektasi!", stars: 5 },
    { id: "t2", name: "Sarah Wijaya", company: "Creative Studio", text: "Desain yang dihasilkan sangat modern dan user-friendly. Sangat merekomendasikan!", stars: 5 }
];

const DEFAULT_HOME_CONTENT = {
    id: 1,
    tagline: "Hi, I'm Leoly 👋",
    title_prefix: "Fullstack Developer &",
    description: "Saya seorang Fullstack Developer yang berdedikasi menciptakan pengalaman digital yang bermakna. Menggabungkan kode yang elegan dengan desain yang indah.",
    typing_words: ["Creative Technologist", "Fullstack Developer", "UI/UX Enthusiast"]
};

// Global State
let projects = [];
let products = [];
let faqs = [];
let testimonials = [];
let cart = [];
let homeContent = {};
let typingTimeout = null;
let cartPanel = null;

const WHATSAPP_NUMBER = "6285198224557";

/* --- INITIALIZER --- */
document.addEventListener("DOMContentLoaded", async () => {
    // Tampilkan loading screen
    setTimeout(() => {
        const loader = document.getElementById("loading-screen");
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 1500);

    AOS.init({ duration: 800, once: true });
    initParticles();
    
    // Inisialisasi Supabase
    await initSupabase();
    
    // Load semua data dari server
    await loadAllData();
    
    renderHomeContent();
    renderAppProjects();
    renderAppProducts();
    renderAppFAQs();
    renderAppTestimonials();
    
    // Load cart dari localStorage (tetap lokal untuk keranjang)
    cart = getStorage('leoly_cart', []);
    updateCartCount();
    renderCartPanelItems();

    setupGlobalEventListeners();
});

async function initSupabase() {
    // Cek apakah Supabase sudah tersedia
    if (typeof supabaseJs !== 'undefined') {
        supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase initialized successfully");
        
        // Test koneksi
        const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
        if (error) {
            console.warn("Supabase connection test failed:", error);
            console.warn("Using localStorage fallback");
            supabase = null;
        } else {
            console.log("Supabase connection successful");
        }
    } else {
        console.warn("Supabase library not loaded, using localStorage fallback");
        supabase = null;
    }
    
    // Fallback ke localStorage jika Supabase tidak tersedia
    if (!supabase) {
        projects = getStorage('leoly_projects', DEFAULT_PROJECTS);
        products = getStorage('leoly_products', DEFAULT_PRODUCTS);
        faqs = getStorage('leoly_faqs', DEFAULT_FAQS);
        testimonials = getStorage('leoly_testimonials', DEFAULT_TESTIMONIALS);
        homeContent = getStorage('leoly_home_content', DEFAULT_HOME_CONTENT);
    }
}

async function loadAllData() {
    if (supabase) {
        await Promise.all([
            loadProjects(),
            loadProducts(),
            loadFAQs(),
            loadTestimonials(),
            loadHomeContent()
        ]);
    }
}

// --- CREATE TABLES IF NOT EXISTS ---
async function createTablesIfNotExists() {
    if (!supabase) return;
    
    // Tabel Projects
    const { error: createProjectsError } = await supabase.rpc('create_projects_table');
    if (createProjectsError) {
        console.log("Projects table might already exist or need to be created manually");
    }
    
    // Tabel Products
    const { error: createProductsError } = await supabase.rpc('create_products_table');
    if (createProductsError) {
        console.log("Products table might already exist or need to be created manually");
    }
}

// --- CRUD OPERATIONS WITH SUPABASE ---
async function loadProjects() {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            projects = data;
        } else {
            // Seed default data
            for (const project of DEFAULT_PROJECTS) {
                await supabase.from('projects').insert([{ ...project, created_at: new Date().toISOString() }]);
            }
            projects = DEFAULT_PROJECTS;
        }
    } catch (error) {
        console.error("Error loading projects:", error);
        projects = getStorage('leoly_projects', DEFAULT_PROJECTS);
    }
}

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            products = data;
        } else {
            for (const product of DEFAULT_PRODUCTS) {
                await supabase.from('products').insert([{ ...product, created_at: new Date().toISOString() }]);
            }
            products = DEFAULT_PRODUCTS;
        }
    } catch (error) {
        console.error("Error loading products:", error);
        products = getStorage('leoly_products', DEFAULT_PRODUCTS);
    }
}

async function loadFAQs() {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            faqs = data;
        } else {
            for (const faq of DEFAULT_FAQS) {
                await supabase.from('faqs').insert([{ ...faq, created_at: new Date().toISOString() }]);
            }
            faqs = DEFAULT_FAQS;
        }
    } catch (error) {
        console.error("Error loading FAQs:", error);
        faqs = getStorage('leoly_faqs', DEFAULT_FAQS);
    }
}

async function loadTestimonials() {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            testimonials = data;
        } else {
            for (const testimonial of DEFAULT_TESTIMONIALS) {
                await supabase.from('testimonials').insert([{ ...testimonial, created_at: new Date().toISOString() }]);
            }
            testimonials = DEFAULT_TESTIMONIALS;
        }
    } catch (error) {
        console.error("Error loading testimonials:", error);
        testimonials = getStorage('leoly_testimonials', DEFAULT_TESTIMONIALS);
    }
}

async function loadHomeContent() {
    try {
        const { data, error } = await supabase
            .from('home_content')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            homeContent = data[0];
        } else {
            await supabase.from('home_content').insert([DEFAULT_HOME_CONTENT]);
            homeContent = DEFAULT_HOME_CONTENT;
        }
    } catch (error) {
        console.error("Error loading home content:", error);
        homeContent = getStorage('leoly_home_content', DEFAULT_HOME_CONTENT);
    }
}

// --- SAVE FUNCTIONS (Called from Admin Panel) ---
async function saveProjectToDB(project) {
    if (!supabase) return false;
    try {
        if (project.id && !project.id.startsWith('p_')) {
            // Update existing
            const { error } = await supabase
                .from('projects')
                .update(project)
                .eq('id', project.id);
            if (error) throw error;
        } else {
            // Insert new
            const newId = project.id || 'p_' + Date.now();
            const { error } = await supabase
                .from('projects')
                .insert([{ ...project, id: newId, created_at: new Date().toISOString() }]);
            if (error) throw error;
        }
        await loadProjects();
        renderAppProjects();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error saving project:", error);
        return false;
    }
}

async function saveProductToDB(product) {
    if (!supabase) return false;
    try {
        if (product.id && !product.id.startsWith('pr_')) {
            const { error } = await supabase
                .from('products')
                .update(product)
                .eq('id', product.id);
            if (error) throw error;
        } else {
            const newId = product.id || 'pr_' + Date.now();
            const { error } = await supabase
                .from('products')
                .insert([{ ...product, id: newId, created_at: new Date().toISOString() }]);
            if (error) throw error;
        }
        await loadProducts();
        renderAppProducts();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error saving product:", error);
        return false;
    }
}

async function saveFAQToDB(faq) {
    if (!supabase) return false;
    try {
        if (faq.id && !faq.id.startsWith('f_')) {
            const { error } = await supabase
                .from('faqs')
                .update(faq)
                .eq('id', faq.id);
            if (error) throw error;
        } else {
            const newId = faq.id || 'f_' + Date.now();
            const { error } = await supabase
                .from('faqs')
                .insert([{ ...faq, id: newId, created_at: new Date().toISOString() }]);
            if (error) throw error;
        }
        await loadFAQs();
        renderAppFAQs();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error saving FAQ:", error);
        return false;
    }
}

async function saveTestimonialToDB(testimonial) {
    if (!supabase) return false;
    try {
        if (testimonial.id && !testimonial.id.startsWith('t_')) {
            const { error } = await supabase
                .from('testimonials')
                .update(testimonial)
                .eq('id', testimonial.id);
            if (error) throw error;
        } else {
            const newId = testimonial.id || 't_' + Date.now();
            const { error } = await supabase
                .from('testimonials')
                .insert([{ ...testimonial, id: newId, created_at: new Date().toISOString() }]);
            if (error) throw error;
        }
        await loadTestimonials();
        renderAppTestimonials();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error saving testimonial:", error);
        return false;
    }
}

async function saveHomeContentToDB(content) {
    if (!supabase) return false;
    try {
        const { error } = await supabase
            .from('home_content')
            .upsert([{ ...content, id: 1, updated_at: new Date().toISOString() }], { onConflict: 'id' });
        if (error) throw error;
        
        await loadHomeContent();
        renderHomeContent();
        return true;
    } catch (error) {
        console.error("Error saving home content:", error);
        return false;
    }
}

async function deleteProjectFromDB(id) {
    if (!supabase) return false;
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await loadProjects();
        renderAppProjects();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error deleting project:", error);
        return false;
    }
}

async function deleteProductFromDB(id) {
    if (!supabase) return false;
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await loadProducts();
        renderAppProducts();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error deleting product:", error);
        return false;
    }
}

async function deleteFAQFromDB(id) {
    if (!supabase) return false;
    try {
        const { error } = await supabase
            .from('faqs')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await loadFAQs();
        renderAppFAQs();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return false;
    }
}

async function deleteTestimonialFromDB(id) {
    if (!supabase) return false;
    try {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await loadTestimonials();
        renderAppTestimonials();
        if (typeof renderAdminTables === 'function') renderAdminTables();
        return true;
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return false;
    }
}

// Simpan cart tetap di localStorage (bersifat per pengguna)
function saveCart() {
    setStorage('leoly_cart', cart);
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    renderCartPanelItems();
}

function closeCartPanel() {
    if(cartPanel) {
        cartPanel.classList.remove("panel-open");
    }
}

function getStorage(key, fallback) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function initParticles() {
    if(document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.08, "random": false },
                "size": { "value": 2, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.03, "width": 1 },
                "move": { "enable": true, "speed": 1, "direction": "none", "random": true }
            },
            "interactivity": { "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } },
            "retina_detect": true
        });
    }
}

function renderHomeContent() {
    const taglineElement = document.querySelector("#home .tagline");
    if(taglineElement && homeContent) taglineElement.textContent = homeContent.tagline || "Hi, I'm Leoly 👋";
    
    const titleElement = document.querySelector("#home h1");
    if(titleElement && homeContent) {
        const existingTypingSpan = titleElement.querySelector(".typing-text");
        if(existingTypingSpan) {
            titleElement.innerHTML = `${escapeHtml(homeContent.title_prefix || "Fullstack Developer &")} <br><span class="typing-text"></span>`;
        }
    }
    
    const descElement = document.querySelector("#home .hero-text > p");
    if(descElement && homeContent) descElement.textContent = homeContent.description || "Saya seorang Fullstack Developer yang berdedikasi menciptakan pengalaman digital yang bermakna.";
    
    if(typingTimeout) clearTimeout(typingTimeout);
    initTypingEffect();
}

function initTypingEffect() {
    const node = document.querySelector(".typing-text");
    if(!node) return;
    
    let words = (homeContent && homeContent.typing_words && homeContent.typing_words.length > 0) ? 
        homeContent.typing_words : ["Creative Technologist", "Fullstack Developer", "UI/UX Enthusiast"];
    
    if (typeof words === 'string') {
        try {
            words = JSON.parse(words);
        } catch(e) {
            words = ["Creative Technologist", "Fullstack Developer", "UI/UX Enthusiast"];
        }
    }
    
    let wordIdx = 0, charIdx = 0, isDeleting = false;
    
    function type() {
        const current = words[wordIdx];
        if(!current) return;
        
        node.textContent = isDeleting ? current.substring(0, charIdx - 1) : current.substring(0, charIdx + 1);
        charIdx = isDeleting ? charIdx - 1 : charIdx + 1;
        
        let typeSpeed = isDeleting ? 50 : 120;
        if (!isDeleting && charIdx === current.length) {
            typeSpeed = 2000; 
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false; 
            wordIdx = (wordIdx + 1) % words.length; 
            typeSpeed = 500;
        }
        typingTimeout = setTimeout(type, typeSpeed);
    }
    type();
}

function escapeHtml(str) {
    if(!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

function renderAppProjects(filter = "all", query = "") {
    const container = document.getElementById("project-display-grid");
    if(!container) return;
    container.innerHTML = "";
    
    const filtered = projects.filter(p => {
        const matchCat = filter === "all" || (p.category && p.category.toLowerCase() === filter.toLowerCase());
        const matchSrc = (p.title && p.title.toLowerCase().includes(query.toLowerCase())) || (p.desc && p.desc.toLowerCase().includes(query.toLowerCase()));
        return matchCat && matchSrc;
    });

    if(filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px 0; color: var(--text-muted);">Tidak ada project yang cocok.</p>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "glass-card render-card";
        
        const imageHtml = p.image ? 
            `<img src="${p.image}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;">` : 
            `<i class="fa-solid fa-laptop-code"></i>`;
        
        card.innerHTML = `
            <div class="card-img-container" style="overflow:hidden;">
                ${imageHtml}
            </div>
            <h3>${escapeHtml(p.title)}</h3>
            <p class="desc">${escapeHtml(p.desc)}</p>
            <div class="card-meta-bottom">
                <span class="tag">${escapeHtml(p.category)}</span>
                <div class="card-actions-row">
                    <button class="icon-btn btn-like" onclick="actionLikeProject('${p.id}')"><i class="fa-solid fa-heart"></i> ${p.likes || 0}</button>
                    <button class="icon-btn" onclick="actionShareProject('${p.title}')"><i class="fa-solid fa-share-nodes"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderAppProducts(filter = "all", query = "") {
    const container = document.getElementById("shop-display-grid");
    if(!container) return;
    container.innerHTML = "";

    const filtered = products.filter(p => {
        const matchCat = filter === "all" || (p.category && p.category.toLowerCase() === filter.toLowerCase());
        const matchSrc = (p.name && p.name.toLowerCase().includes(query.toLowerCase())) || (p.desc && p.desc.toLowerCase().includes(query.toLowerCase()));
        return matchCat && matchSrc;
    });

    if(filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px 0; color: var(--text-muted);">Produk tidak ditemukan.</p>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "glass-card render-card";
        
        const imageHtml = p.image ? 
            `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%; height:100%; object-fit:cover;">` : 
            `<i class="fa-solid fa-cube"></i>`;
        
        card.innerHTML = `
            <div class="card-img-container" style="overflow:hidden;">
                ${imageHtml}
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <p class="desc">${escapeHtml(p.desc)}</p>
            <div class="card-meta-bottom">
                <span class="card-price">Rp ${(p.price || 0).toLocaleString('id-ID')}</span>
                <button class="btn btn-primary btn-sm" onclick="actionAddProductToCart('${p.id}')"><i class="fa-solid fa-cart-plus"></i> Beli</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderAppFAQs() {
    const container = document.getElementById("faq-accordion-container");
    if(!container) return;
    container.innerHTML = "";
    faqs.forEach((f) => {
        const item = document.createElement("div");
        item.className = "accordion-item";
        item.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordionNode(this)">
                <h4>${escapeHtml(f.question)}</h4>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="accordion-body"><p>${escapeHtml(f.answer)}</p></div>
        `;
        container.appendChild(item);
    });
}

function renderAppTestimonials() {
    const container = document.getElementById("testimonial-render-box");
    if(!container) return;
    container.innerHTML = "";
    
    if(testimonials.length === 0) return;
    
    testimonials.forEach(t => {
        const div = document.createElement("div");
        div.className = "testimonial-item-card";
        div.style.marginBottom = "20px";
        div.innerHTML = `
            <p>"${escapeHtml(t.text)}"</p>
            <div class="testi-profile">
                <div class="testi-info">
                    <h5>${escapeHtml(t.name)}</h5>
                    <span>${escapeHtml(t.company)}</span>
                    <div class="stars-row">${'<i class="fa-solid fa-star"></i>'.repeat(t.stars || 5)}</div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleAccordionNode(header) {
    const item = header.parentElement;
    item.classList.toggle("active");
}

async function actionLikeProject(id) {
    const project = projects.find(p => p.id === id);
    if(project) {
        const newLikes = (project.likes || 0) + 1;
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('projects')
                    .update({ likes: newLikes })
                    .eq('id', id);
                if (error) throw error;
            } catch (error) {
                console.error("Error updating likes:", error);
            }
        }
        await loadProjects();
        renderAppProjects();
    }
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Project disukai!', showConfirmButton: false, timer: 1500 });
}

function actionShareProject(title) {
    navigator.clipboard.writeText(`${window.location.href} - Project: ${title}`);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Tautan project disalin!', confirmButtonColor: '#000' });
}

function actionAddProductToCart(id) {
    const prod = products.find(p => p.id === id);
    if(!prod) return;
    cart.push(prod);
    saveCart();
    updateCartCount();
    renderCartPanelItems();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${prod.name} masuk keranjang`, showConfirmButton: false, timer: 2000 });
}

function updateCartCount() {
    const node = document.getElementById("cart-count");
    if(node) node.textContent = cart.length;
}

function renderCartPanelItems() {
    const container = document.getElementById("cart-items-container");
    const totalNode = document.getElementById("cart-total-price");
    if(!container) return;
    container.innerHTML = "";

    let total = 0;
    if(cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:30px 0; color: var(--text-muted);">Keranjang kosong</p>`;
        if(totalNode) totalNode.textContent = "Rp 0";
        return;
    }

    cart.forEach((item, idx) => {
        total += item.price || 0;
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.marginBottom = "12px";
        row.style.paddingBottom = "8px";
        row.style.borderBottom = "1px solid var(--border-color)";
        row.innerHTML = `
            <div style="flex:1;">
                <h5 style="font-size:13px;">${escapeHtml(item.name)}</h5>
                <span style="font-size:12px; color:var(--text-muted);">Rp ${(item.price || 0).toLocaleString('id-ID')}</span>
            </div>
            <button class="icon-btn" style="width:28px; height:28px; font-size:11px;" onclick="actionRemoveCartItem(${idx})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    });
    if(totalNode) totalNode.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function actionRemoveCartItem(idx) {
    cart.splice(idx, 1);
    saveCart();
    updateCartCount();
    renderCartPanelItems();
}

function checkoutToWhatsApp() {
    if(cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Keranjang Kosong!', text: 'Silakan tambahkan produk terlebih dahulu ke keranjang.', confirmButtonColor: '#000' });
        return;
    }
    
    let total = 0;
    let productList = "";
    
    cart.forEach((item, index) => {
        total += item.price || 0;
        productList += `${index + 1}. ${item.name} - Rp ${(item.price || 0).toLocaleString('id-ID')}\n`;
    });
    
    const message = `Halo Leoly! Saya ingin memesan produk berikut:%0A%0A${encodeURIComponent(productList)}%0A────────────────%0A*Total: Rp ${total.toLocaleString('id-ID')}*%0A%0ASaya tertarik dengan produk di atas. Mohon informasi lebih lanjut untuk proses pemesanan. Terima kasih!`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    closeCartPanel();
    
    Swal.fire({
        icon: 'question',
        title: 'Konfirmasi Checkout',
        text: `Anda akan diarahkan ke WhatsApp untuk melanjutkan pemesanan dengan total Rp ${total.toLocaleString('id-ID')}. Keranjang akan dikosongkan setelah checkout. Lanjutkan?`,
        showCancelButton: true,
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#000',
        cancelButtonColor: '#666'
    }).then((result) => {
        if (result.isConfirmed) {
            window.open(waUrl, '_blank');
            clearCart();
            Swal.fire({ icon: 'success', title: 'Checkout Berhasil!', text: 'Pesanan Anda telah dikirim. Keranjang sudah dikosongkan.', confirmButtonColor: '#000', timer: 2000 });
        }
    });
}

/* --- EVENT LISTENERS --- */
function setupGlobalEventListeners() {
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("mobile-active");
            const icon = menuToggle.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-xmark");
            }
        });
        
        document.addEventListener("click", function(event) {
            if (navMenu.classList.contains("mobile-active") && 
                !navMenu.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                navMenu.classList.remove("mobile-active");
                const icon = menuToggle.querySelector("i");
                if (icon) {
                    icon.classList.add("fa-bars");
                    icon.classList.remove("fa-xmark");
                }
            }
        });
    }

    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".app-section");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href").substring(1);
            if(!document.getElementById(targetId)) return;
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active-section"));

            link.classList.add("active");
            document.getElementById(targetId).classList.add("active-section");
            window.scrollTo({ top: 0, behavior: "smooth" });

            if (navMenu && navMenu.classList.contains("mobile-active")) {
                navMenu.classList.remove("mobile-active");
                const icon = menuToggle.querySelector("i");
                if (icon) {
                    icon.classList.add("fa-bars");
                    icon.classList.remove("fa-xmark");
                }
            }
        });
    });

    const themeBtn = document.getElementById("theme-toggle");
    if(themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-theme");
            const isLight = document.body.classList.contains("light-theme");
            themeBtn.innerHTML = isLight ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
        });
    }

    cartPanel = document.getElementById("shopping-cart-panel");
    const cartBtn = document.getElementById("cart-toggle-btn");
    const cartClose = document.getElementById("cart-close-btn");

    if(cartBtn && cartPanel) cartBtn.addEventListener("click", () => cartPanel.classList.add("panel-open"));
    if(cartClose && cartPanel) cartClose.addEventListener("click", () => cartPanel.classList.remove("panel-open"));

    const checkoutBtn = document.getElementById("checkout-action-btn");
    if(checkoutBtn) {
        checkoutBtn.addEventListener("click", () => checkoutToWhatsApp());
    }

    const projSearch = document.getElementById("project-search");
    if(projSearch) {
        projSearch.addEventListener("input", (e) => {
            const activeTag = document.querySelector("#project-filters .tag.active");
            renderAppProjects(activeTag ? activeTag.dataset.filter : "all", e.target.value);
        });
    }

    const projFilters = document.querySelectorAll("#project-filters .tag");
    projFilters.forEach(tag => {
        tag.addEventListener("click", () => {
            projFilters.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            renderAppProjects(tag.dataset.filter, projSearch ? projSearch.value : "");
        });
    });

    const shopSearch = document.getElementById("shop-search");
    if(shopSearch) {
        shopSearch.addEventListener("input", (e) => {
            const activeTag = document.querySelector("#shop-filters .tag.active");
            renderAppProducts(activeTag ? activeTag.dataset.filter : "all", e.target.value);
        });
    }

    const shopFilters = document.querySelectorAll("#shop-filters .tag");
    shopFilters.forEach(tag => {
        tag.addEventListener("click", () => {
            shopFilters.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            renderAppProducts(tag.dataset.filter, shopSearch ? shopSearch.value : "");
        });
    });

    const contactForm = document.getElementById("main-contact-form");
    if(contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("contact-name").value;
            const email = document.getElementById("contact-email").value;
            const message = document.getElementById("contact-message").value;
            
            const waMessage = `Halo Leoly!%0A%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APesan: ${encodeURIComponent(message)}%0A%0AMohon direspons. Terima kasih!`;
            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;
            
            Swal.fire({ icon: 'success', title: 'Pesan Terkirim!', text: 'Terima kasih, Anda akan diarahkan ke WhatsApp untuk melanjutkan.', confirmButtonColor: '#000' }).then(() => {
                window.open(waUrl, '_blank');
            });
            contactForm.reset();
        });
    }

    const btt = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
        if(window.scrollY > 400 && btt) btt.style.display = "inline-flex";
        else if(btt) btt.style.display = "none";
    });
    if(btt) btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const glassNav = document.querySelector(".glass-nav");
    window.addEventListener("scroll", () => {
        if(window.scrollY > 50 && glassNav) glassNav.classList.add("scrolled");
        else if(glassNav) glassNav.classList.remove("scrolled");
    });

    setupAdminSubsystem();
}

/* --- ADMIN SUBSYSTEM --- */
function setupAdminSubsystem() {
    const loginForm = document.getElementById("admin-login-form");
    const loginBox = document.getElementById("admin-login-box");
    const workspace = document.getElementById("admin-workspace");
    const logoutBtn = document.getElementById("admin-logout-btn");

    if(loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.getElementById("admin-username").value;
            const pass = document.getElementById("admin-password").value;

            if(user === "admin" && pass === "leoly2026") {
                loginBox.classList.add("d-none");
                workspace.classList.remove("d-none");
                renderAdminTables();
                Swal.fire({ icon: 'success', title: 'Welcome Back!', text: 'Selamat datang di dashboard admin.', timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Username atau password salah!', confirmButtonColor: '#000' });
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            workspace.classList.add("d-none");
            loginBox.classList.remove("d-none");
            loginForm.reset();
        });
    }

    const tabBtns = document.querySelectorAll(".admin-tab-btn");
    const tabPanes = document.querySelectorAll(".admin-tab-pane");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active-pane"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.target).classList.add("active-pane");
        });
    });

    setupAdminModalTriggers();
}

function renderAdminTables() {
    const tbodyProj = document.getElementById("admin-project-table-body");
    if(tbodyProj) {
        tbodyProj.innerHTML = "";
        projects.forEach(p => {
            const tr = document.createElement("tr");
            const hasImage = p.image ? '<i class="fa-solid fa-image" style="color:green"></i>' : '<i class="fa-solid fa-image-slash" style="color:gray"></i>';
            tr.innerHTML = `<td>${hasImage} ${escapeHtml(p.title)}</td><td>${escapeHtml(p.category)}</td><td>${p.likes || 0}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="editProjectNode('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProjectNode('${p.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyProj.appendChild(tr);
        });
    }

    const tbodyProd = document.getElementById("admin-product-table-body");
    if(tbodyProd) {
        tbodyProd.innerHTML = "";
        products.forEach(p => {
            const tr = document.createElement("tr");
            const hasImage = p.image ? '<i class="fa-solid fa-image" style="color:green"></i>' : '<i class="fa-solid fa-image-slash" style="color:gray"></i>';
            tr.innerHTML = `<td>${hasImage} ${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>Rp ${(p.price || 0).toLocaleString('id-ID')}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="editProductNode('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProductNode('${p.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyProd.appendChild(tr);
        });
    }

    const tbodyFaq = document.getElementById("admin-faq-table-body");
    if(tbodyFaq) {
        tbodyFaq.innerHTML = "";
        faqs.forEach(f => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(f.question)}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="deleteFaqNode('${f.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyFaq.appendChild(tr);
        });
    }

    const tbodyTesti = document.getElementById("admin-testimonial-table-body");
    if(tbodyTesti) {
        tbodyTesti.innerHTML = "";
        testimonials.forEach(t => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(t.name)}</td><td>${escapeHtml(t.company)}</td><td>${t.stars || 5} ★</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="deleteTestimonialNode('${t.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyTesti.appendChild(tr);
        });
    }
}

function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Fungsi Edit Home Content
async function editHomeContent() {
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    const typingWordsStr = Array.isArray(homeContent.typing_words) ? homeContent.typing_words.join(', ') : "";
    
    titleNode.textContent = "Edit Home Page Content";
    bodyNode.innerHTML = `
        <form id="form-edit-home">
            <div class="form-group"><label>Tagline</label><input type="text" id="eh-tagline" value="${escapeHtml(homeContent.tagline || '')}" required></div>
            <div class="form-group"><label>Title Prefix</label><input type="text" id="eh-title-prefix" value="${escapeHtml(homeContent.title_prefix || '')}" required></div>
            <div class="form-group"><label>Kata-kata Typing Effect (pisahkan dengan koma)</label><input type="text" id="eh-typing-words" value="${escapeHtml(typingWordsStr)}" required><small style="color: var(--text-muted); font-size: 12px;">Contoh: Creative Technologist, Fullstack Developer, UI/UX Enthusiast</small></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="eh-description" rows="4" required>${escapeHtml(homeContent.description || '')}</textarea></div>
            <button type="submit" class="btn btn-primary btn-block">Simpan Perubahan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("form-edit-home").addEventListener("submit", async (e) => {
        e.preventDefault();
        const tagline = document.getElementById("eh-tagline").value;
        const titlePrefix = document.getElementById("eh-title-prefix").value;
        const typingWordsStr = document.getElementById("eh-typing-words").value;
        const description = document.getElementById("eh-description").value;
        
        const typingWords = typingWordsStr.split(',').map(word => word.trim()).filter(word => word.length > 0);
        
        const newContent = {
            id: 1,
            tagline: tagline,
            title_prefix: titlePrefix,
            description: description,
            typing_words: typingWords
        };
        
        if (supabase) {
            await saveHomeContentToDB(newContent);
        } else {
            homeContent = newContent;
            setStorage('leoly_home_content', homeContent);
            renderHomeContent();
        }
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Home page berhasil diupdate.', timer: 1500, showConfirmButton: false });
    });
}

// Delete Functions dengan Supabase
async function deleteProjectNode(id) {
    if (supabase) {
        await deleteProjectFromDB(id);
    } else {
        projects = projects.filter(p => p.id !== id);
        setStorage('leoly_projects', projects);
        renderAppProjects();
        renderAdminTables();
    }
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Project berhasil dihapus.', timer: 1500, showConfirmButton: false });
}

async function deleteProductNode(id) {
    if (supabase) {
        await deleteProductFromDB(id);
    } else {
        products = products.filter(p => p.id !== id);
        setStorage('leoly_products', products);
        renderAppProducts();
        renderAdminTables();
    }
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil dihapus.', timer: 1500, showConfirmButton: false });
}

async function deleteFaqNode(id) {
    if (supabase) {
        await deleteFAQFromDB(id);
    } else {
        faqs = faqs.filter(f => f.id !== id);
        setStorage('leoly_faqs', faqs);
        renderAppFAQs();
        renderAdminTables();
    }
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'FAQ berhasil dihapus.', timer: 1500, showConfirmButton: false });
}

async function deleteTestimonialNode(id) {
    if (supabase) {
        await deleteTestimonialFromDB(id);
    } else {
        testimonials = testimonials.filter(t => t.id !== id);
        setStorage('leoly_testimonials', testimonials);
        renderAppTestimonials();
        renderAdminTables();
    }
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Testimoni berhasil dihapus.', timer: 1500, showConfirmButton: false });
}

// Edit functions untuk project
async function editProjectNode(id) {
    const project = projects.find(p => p.id === id);
    if(!project) return;
    
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Project";
    bodyNode.innerHTML = `
        <form id="form-edit-project">
            <div class="form-group"><label>Judul Project</label><input type="text" id="ep-title" value="${escapeHtml(project.title)}" required></div>
            <div class="form-group"><label>Kategori</label><select id="ep-category" class="form-control"><option ${project.category === 'Web' ? 'selected' : ''}>Web</option><option ${project.category === 'Server' ? 'selected' : ''}>Server</option><option ${project.category === 'UI/UX' ? 'selected' : ''}>UI/UX</option></select></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="ep-desc" rows="3" required>${escapeHtml(project.desc)}</textarea></div>
            <div class="form-group"><label>Gambar Thumbnail</label><input type="file" id="ep-image" accept="image/*"></div>
            ${project.image ? `<div class="form-group"><img src="${project.image}" style="max-width:100%; border-radius:8px; margin-top:10px;"><p style="font-size:12px;">Gambar saat ini</p></div>` : ''}
            <button type="submit" class="btn btn-primary btn-block">Simpan Perubahan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("form-edit-project").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("ep-title").value;
        const category = document.getElementById("ep-category").value;
        const desc = document.getElementById("ep-desc").value;
        const imageFile = document.getElementById("ep-image").files[0];
        
        let imageBase64 = project.image;
        if(imageFile) {
            imageBase64 = await imageToBase64(imageFile);
        }
        
        const updatedProject = { ...project, title, category, desc, image: imageBase64 };
        
        if (supabase) {
            await saveProjectToDB(updatedProject);
        } else {
            const index = projects.findIndex(p => p.id === id);
            projects[index] = updatedProject;
            setStorage('leoly_projects', projects);
            renderAppProjects();
            renderAdminTables();
        }
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Project berhasil diupdate.', timer: 1500, showConfirmButton: false });
    });
}

// Edit functions untuk product
async function editProductNode(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;
    
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Produk";
    bodyNode.innerHTML = `
        <form id="form-edit-product">
            <div class="form-group"><label>Nama Produk</label><input type="text" id="epr-name" value="${escapeHtml(product.name)}" required></div>
            <div class="form-group"><label>Kategori</label><select id="epr-category" class="form-control"><option ${product.category === 'Template' ? 'selected' : ''}>Template</option><option ${product.category === 'Module' ? 'selected' : ''}>Module</option><option ${product.category === 'Asset' ? 'selected' : ''}>Asset</option></select></div>
            <div class="form-group"><label>Harga (Rp)</label><input type="number" id="epr-price" value="${product.price}" required></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="epr-desc" rows="3" required>${escapeHtml(product.desc)}</textarea></div>
            <div class="form-group"><label>Gambar Thumbnail</label><input type="file" id="epr-image" accept="image/*"></div>
            ${product.image ? `<div class="form-group"><img src="${product.image}" style="max-width:100%; border-radius:8px; margin-top:10px;"><p style="font-size:12px;">Gambar saat ini</p></div>` : ''}
            <button type="submit" class="btn btn-primary btn-block">Simpan Perubahan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("form-edit-product").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("epr-name").value;
        const category = document.getElementById("epr-category").value;
        const price = Number(document.getElementById("epr-price").value);
        const desc = document.getElementById("epr-desc").value;
        const imageFile = document.getElementById("epr-image").files[0];
        
        let imageBase64 = product.image;
        if(imageFile) {
            imageBase64 = await imageToBase64(imageFile);
        }
        
        const updatedProduct = { ...product, name, category, price, desc, image: imageBase64 };
        
        if (supabase) {
            await saveProductToDB(updatedProduct);
        } else {
            const index = products.findIndex(p => p.id === id);
            products[index] = updatedProduct;
            setStorage('leoly_products', products);
            renderAppProducts();
            renderAdminTables();
        }
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil diupdate.', timer: 1500, showConfirmButton: false });
    });
}

/* --- MODAL SETUP --- */
function setupAdminModalTriggers() {
    const overlay = document.getElementById("global-data-modal");
    const closeBtn = document.getElementById("modal-close-trigger");

    if(!overlay || !closeBtn) return;
    closeBtn.addEventListener("click", () => overlay.classList.remove("modal-active"));

    const editHomeBtn = document.getElementById("btn-edit-home");
    if(editHomeBtn) editHomeBtn.addEventListener("click", () => editHomeContent());

    const addProjBtn = document.getElementById("btn-add-project-modal");
    if(addProjBtn) {
        addProjBtn.addEventListener("click", () => {
            document.getElementById("modal-title-node").textContent = "Tambah Project Baru";
            document.getElementById("modal-body-node").innerHTML = `
                <form id="form-crud-project">
                    <div class="form-group"><label>Judul Project</label><input type="text" id="cp-title" required></div>
                    <div class="form-group"><label>Kategori</label><select id="cp-category" class="form-control"><option>Web</option><option>Server</option><option>UI/UX</option></select></div>
                    <div class="form-group"><label>Deskripsi</label><textarea id="cp-desc" rows="3" required></textarea></div>
                    <div class="form-group"><label>Gambar (Opsional)</label><input type="file" id="cp-image" accept="image/*"></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            document.getElementById("form-crud-project").addEventListener("submit", async (e) => {
                e.preventDefault();
                let imageBase64 = null;
                const imgFile = document.getElementById("cp-image").files[0];
                if(imgFile) imageBase64 = await imageToBase64(imgFile);
                
                const newProject = {
                    id: 'p_' + Date.now(),
                    title: document.getElementById("cp-title").value,
                    category: document.getElementById("cp-category").value,
                    desc: document.getElementById("cp-desc").value,
                    likes: 0,
                    image: imageBase64,
                    created_at: new Date().toISOString()
                };
                
                if (supabase) {
                    await saveProjectToDB(newProject);
                } else {
                    projects.push(newProject);
                    setStorage('leoly_projects', projects);
                    renderAppProjects();
                    renderAdminTables();
                }
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Project berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }

    const addProdBtn = document.getElementById("btn-add-product-modal");
    if(addProdBtn) {
        addProdBtn.addEventListener("click", () => {
            document.getElementById("modal-title-node").textContent = "Tambah Produk";
            document.getElementById("modal-body-node").innerHTML = `
                <form id="form-crud-product">
                    <div class="form-group"><label>Nama Produk</label><input type="text" id="cpr-name" required></div>
                    <div class="form-group"><label>Kategori</label><select id="cpr-category" class="form-control"><option>Template</option><option>Module</option><option>Asset</option></select></div>
                    <div class="form-group"><label>Harga (Rp)</label><input type="number" id="cpr-price" required></div>
                    <div class="form-group"><label>Deskripsi</label><textarea id="cpr-desc" rows="3" required></textarea></div>
                    <div class="form-group"><label>Gambar (Opsional)</label><input type="file" id="cpr-image" accept="image/*"></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            document.getElementById("form-crud-product").addEventListener("submit", async (e) => {
                e.preventDefault();
                let imageBase64 = null;
                const imgFile = document.getElementById("cpr-image").files[0];
                if(imgFile) imageBase64 = await imageToBase64(imgFile);
                
                const newProduct = {
                    id: 'pr_' + Date.now(),
                    name: document.getElementById("cpr-name").value,
                    category: document.getElementById("cpr-category").value,
                    price: Number(document.getElementById("cpr-price").value),
                    desc: document.getElementById("cpr-desc").value,
                    image: imageBase64,
                    created_at: new Date().toISOString()
                };
                
                if (supabase) {
                    await saveProductToDB(newProduct);
                } else {
                    products.push(newProduct);
                    setStorage('leoly_products', products);
                    renderAppProducts();
                    renderAdminTables();
                }
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }

    const addFaqBtn = document.getElementById("btn-add-faq-modal");
    if(addFaqBtn) {
        addFaqBtn.addEventListener("click", () => {
            document.getElementById("modal-title-node").textContent = "Tambah FAQ";
            document.getElementById("modal-body-node").innerHTML = `
                <form id="form-crud-faq">
                    <div class="form-group"><label>Pertanyaan</label><input type="text" id="cf-q" required></div>
                    <div class="form-group"><label>Jawaban</label><textarea id="cf-a" rows="3" required></textarea></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            document.getElementById("form-crud-faq").addEventListener("submit", async (e) => {
                e.preventDefault();
                const newFaq = {
                    id: 'f_' + Date.now(),
                    question: document.getElementById("cf-q").value,
                    answer: document.getElementById("cf-a").value,
                    created_at: new Date().toISOString()
                };
                
                if (supabase) {
                    await saveFAQToDB(newFaq);
                } else {
                    faqs.push(newFaq);
                    setStorage('leoly_faqs', faqs);
                    renderAppFAQs();
                    renderAdminTables();
                }
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'FAQ berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }

    const addTestiBtn = document.getElementById("btn-add-testimonial-modal");
    if(addTestiBtn) {
        addTestiBtn.addEventListener("click", () => {
            document.getElementById("modal-title-node").textContent = "Tambah Testimoni";
            document.getElementById("modal-body-node").innerHTML = `
                <form id="form-crud-testi">
                    <div class="form-group"><label>Nama</label><input type="text" id="ct-name" required></div>
                    <div class="form-group"><label>Perusahaan</label><input type="text" id="ct-comp" required></div>
                    <div class="form-group"><label>Rating (1-5)</label><input type="number" id="ct-star" min="1" max="5" value="5" required></div>
                    <div class="form-group"><label>Testimoni</label><textarea id="ct-text" rows="3" required></textarea></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            document.getElementById("form-crud-testi").addEventListener("submit", async (e) => {
                e.preventDefault();
                const newTestimonial = {
                    id: 't_' + Date.now(),
                    name: document.getElementById("ct-name").value,
                    company: document.getElementById("ct-comp").value,
                    stars: Number(document.getElementById("ct-star").value),
                    text: document.getElementById("ct-text").value,
                    created_at: new Date().toISOString()
                };
                
                if (supabase) {
                    await saveTestimonialToDB(newTestimonial);
                } else {
                    testimonials.push(newTestimonial);
                    setStorage('leoly_testimonials', testimonials);
                    renderAppTestimonials();
                    renderAdminTables();
                }
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Testimoni berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }
}
/* --- MONGODB API CONFIGURATION --- */
// API endpoint (Netlify Functions)
const API_URL = '/.netlify/functions/api';

let useAPI = true;

// Default data (fallback jika API gagal)
const DEFAULT_PROJECTS = [
    { title: "E-Commerce Platform Modern", category: "Web", description: "Platform belanja online dengan fitur keranjang, pembayaran, dan dashboard admin real-time.", likes: 45, image: null },
    { title: "Portfolio Glassmorphism", category: "UI/UX", description: "Desain portfolio premium dengan efek glassmorphism dan animasi halus.", likes: 38, image: null },
    { title: "RESTful API Service", category: "Server", description: "Backend service dengan autentikasi JWT dan dokumentasi API lengkap.", likes: 29, image: null },
    { title: "Task Management App", category: "Web", description: "Aplikasi manajemen tugas kolaboratif dengan real-time update.", likes: 52, image: null }
];

const DEFAULT_PRODUCTS = [
    { name: "Premium Portfolio Template", category: "Template", price: 199000, description: "Template portfolio modern dengan desain glassmorphism dan animasi menarik.", image: null },
    { name: "React Component Library", category: "Module", price: 349000, description: "Koleksi komponen React siap pakai untuk mempercepat development.", image: null },
    { name: "Icon Pack - Minimalist", category: "Asset", price: 99000, description: "Paket 200+ ikon minimalist untuk berbagai kebutuhan desain.", image: null },
    { name: "Dashboard Admin Template", category: "Template", price: 299000, description: "Template dashboard admin dengan fitur lengkap dan responsif.", image: null }
];

const DEFAULT_FAQS = [
    { question: "Berapa lama waktu pengerjaan project?", answer: "Durasi pengerjaan tergantung kompleksitas project. Rata-rata 2-4 minggu untuk website company profile, dan 1-3 bulan untuk aplikasi kompleks." },
    { question: "Apakah menerima kerjasama jangka panjang?", answer: "Ya, saya terbuka untuk kerjasama retainer atau kontrak jangka panjang untuk maintenance dan pengembangan berkelanjutan." },
    { question: "Teknologi apa yang biasa digunakan?", answer: "Saya menggunakan React/Next.js untuk frontend, Node.js/Python untuk backend, dan berbagai database sesuai kebutuhan project." }
];

const DEFAULT_TESTIMONIALS = [
    { name: "Budi Santoso", company: "TechCorp ID", text: "Leoly sangat profesional dan cepat dalam mengerjakan project. Hasilnya melebihi ekspektasi!", stars: 5 },
    { name: "Sarah Wijaya", company: "Creative Studio", text: "Desain yang dihasilkan sangat modern dan user-friendly. Sangat merekomendasikan!", stars: 5 }
];

const DEFAULT_HOME_CONTENT = {
    tagline: "Hi, I'm Leoly 👋",
    titlePrefix: "Fullstack Developer &",
    description: "Saya seorang Fullstack Developer yang berdedikasi menciptakan pengalaman digital yang bermakna.",
    typingWords: ["Creative Technologist", "Fullstack Developer", "UI/UX Enthusiast"]
};

const WHATSAPP_NUMBER = "6285198224557";

// Global State
let projects = [];
let products = [];
let faqs = [];
let testimonials = [];
let cart = [];
let homeContent = {...DEFAULT_HOME_CONTENT};
let typingTimeout = null;
let cartPanel = null;

// Helper functions
function getStorage(key, fallback) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function updateLoadingStatus(message) {
    const statusEl = document.getElementById("loading-status");
    if (statusEl) statusEl.textContent = message;
}

/* --- API FUNCTIONS --- */
async function apiFetch(collection, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);
        
        const response = await fetch(`${API_URL}/${collection}`, options);
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.error(`API error (${collection}):`, error);
        return null;
    }
}

async function loadProjectsFromAPI() {
    const data = await apiFetch('projects');
    if (data && data.length > 0) {
        projects = data;
        setStorage('leoly_projects', projects);
        return true;
    }
    return false;
}

async function loadProductsFromAPI() {
    const data = await apiFetch('products');
    if (data && data.length > 0) {
        products = data;
        setStorage('leoly_products', products);
        return true;
    }
    return false;
}

async function loadFAQsFromAPI() {
    const data = await apiFetch('faqs');
    if (data && data.length > 0) {
        faqs = data;
        setStorage('leoly_faqs', faqs);
        return true;
    }
    return false;
}

async function loadTestimonialsFromAPI() {
    const data = await apiFetch('testimonials');
    if (data && data.length > 0) {
        testimonials = data;
        setStorage('leoly_testimonials', testimonials);
        return true;
    }
    return false;
}

async function loadHomeContentFromAPI() {
    const data = await apiFetch('home_content');
    if (data && data.length > 0) {
        const content = data[0];
        let typingWords = DEFAULT_HOME_CONTENT.typingWords;
        if (content.typing_words) {
            try {
                typingWords = JSON.parse(content.typing_words);
            } catch(e) {
                typingWords = content.typing_words.split(',').map(w => w.trim());
            }
        }
        homeContent = {
            tagline: content.tagline || DEFAULT_HOME_CONTENT.tagline,
            titlePrefix: content.title_prefix || DEFAULT_HOME_CONTENT.titlePrefix,
            description: content.description || DEFAULT_HOME_CONTENT.description,
            typingWords: typingWords
        };
        setStorage('leoly_home_content', homeContent);
        return true;
    }
    return false;
}

async function saveProjectToAPI(project) {
    return await apiFetch('projects', 'POST', project);
}

async function updateProjectToAPI(id, project) {
    return await apiFetch('projects', 'PUT', { id, ...project });
}

async function deleteProjectFromAPI(id) {
    return await apiFetch('projects', 'DELETE', { id });
}

async function saveProductToAPI(product) {
    return await apiFetch('products', 'POST', product);
}

async function updateProductToAPI(id, product) {
    return await apiFetch('products', 'PUT', { id, ...product });
}

async function deleteProductFromAPI(id) {
    return await apiFetch('products', 'DELETE', { id });
}

async function saveFAQToAPI(faq) {
    return await apiFetch('faqs', 'POST', faq);
}

async function deleteFAQFromAPI(id) {
    return await apiFetch('faqs', 'DELETE', { id });
}

async function saveTestimonialToAPI(testimonial) {
    return await apiFetch('testimonials', 'POST', testimonial);
}

async function deleteTestimonialFromAPI(id) {
    return await apiFetch('testimonials', 'DELETE', { id });
}

async function saveHomeContentToAPI(content) {
    return await apiFetch('home_content', 'POST', content);
}

/* --- INITIALIZER --- */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM Loaded, initializing...");
    updateLoadingStatus("Menghubungkan ke database MongoDB...");
    
    AOS.init({ duration: 800, once: true });
    initParticles();
    
    // Coba load dari API (MongoDB)
    try {
        const [projectsLoaded, productsLoaded, faqsLoaded, testimonialsLoaded, homeLoaded] = await Promise.all([
            loadProjectsFromAPI(),
            loadProductsFromAPI(),
            loadFAQsFromAPI(),
            loadTestimonialsFromAPI(),
            loadHomeContentFromAPI()
        ]);
        
        if (projectsLoaded || productsLoaded || faqsLoaded || testimonialsLoaded || homeLoaded) {
            useAPI = true;
            updateLoadingStatus("Terhubung ke MongoDB Atlas!");
            console.log("Data loaded from MongoDB API");
        } else {
            throw new Error("No data from API");
        }
    } catch (error) {
        console.warn("API failed, using localStorage:", error);
        useAPI = false;
        loadFromLocalStorage();
        updateLoadingStatus("Menggunakan data lokal...");
    }
    
    // Render semua konten
    renderHomeContent();
    renderAppProjects();
    renderAppProducts();
    renderAppFAQs();
    renderAppTestimonials();
    
    // Load cart dari localStorage
    cart = getStorage('leoly_cart', []);
    updateCartCount();
    renderCartPanelItems();
    
    setupGlobalEventListeners();
    
    // Sembunyikan loading screen setelah 1.5 detik
    setTimeout(() => {
        const loader = document.getElementById("loading-screen");
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 1500);
    
    console.log("Initialization complete, useAPI:", useAPI);
});

function loadFromLocalStorage() {
    projects = getStorage('leoly_projects', DEFAULT_PROJECTS);
    products = getStorage('leoly_products', DEFAULT_PRODUCTS);
    faqs = getStorage('leoly_faqs', DEFAULT_FAQS);
    testimonials = getStorage('leoly_testimonials', DEFAULT_TESTIMONIALS);
    homeContent = getStorage('leoly_home_content', DEFAULT_HOME_CONTENT);
    console.log("Loaded from localStorage");
}

function initParticles() {
    if(document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.08, random: false },
                size: { value: 2, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.03 },
                move: { enable: true, speed: 1, direction: "none", random: true }
            }
        });
    }
}

function renderHomeContent() {
    const taglineElement = document.querySelector("#home .tagline");
    if(taglineElement) taglineElement.textContent = homeContent.tagline;
    
    const titleElement = document.querySelector("#home h1");
    if(titleElement) {
        titleElement.innerHTML = `${escapeHtml(homeContent.titlePrefix)} <br><span class="typing-text"></span>`;
    }
    
    const descElement = document.querySelector("#home .hero-text > p");
    if(descElement) descElement.textContent = homeContent.description;
    
    if(typingTimeout) clearTimeout(typingTimeout);
    initTypingEffect();
}

function initTypingEffect() {
    const node = document.querySelector(".typing-text");
    if(!node) return;
    
    const words = homeContent.typingWords;
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
        const matchSrc = (p.title && p.title.toLowerCase().includes(query.toLowerCase())) || 
                        (p.description && p.description.toLowerCase().includes(query.toLowerCase()));
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
        
        const itemId = p._id || p.id;
        
        card.innerHTML = `
            <div class="card-img-container" style="overflow:hidden;">
                ${imageHtml}
            </div>
            <h3>${escapeHtml(p.title)}</h3>
            <p class="desc">${escapeHtml(p.description)}</p>
            <div class="card-meta-bottom">
                <span class="tag">${escapeHtml(p.category)}</span>
                <div class="card-actions-row">
                    <button class="icon-btn" onclick="actionLikeProject('${itemId}')"><i class="fa-solid fa-heart"></i> ${p.likes || 0}</button>
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
        const matchSrc = (p.name && p.name.toLowerCase().includes(query.toLowerCase())) || 
                        (p.description && p.description.toLowerCase().includes(query.toLowerCase()));
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
        
        const itemId = p._id || p.id;
        
        card.innerHTML = `
            <div class="card-img-container" style="overflow:hidden;">
                ${imageHtml}
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <p class="desc">${escapeHtml(p.description)}</p>
            <div class="card-meta-bottom">
                <span class="card-price">Rp ${(p.price || 0).toLocaleString('id-ID')}</span>
                <button class="btn btn-primary btn-sm" onclick="actionAddProductToCart('${itemId}')"><i class="fa-solid fa-cart-plus"></i> Beli</button>
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
    const project = projects.find(p => (p._id === id || p.id === id));
    if(project) {
        project.likes = (project.likes || 0) + 1;
        setStorage('leoly_projects', projects);
        if (useAPI) {
            await updateProjectToAPI(id, { likes: project.likes });
        }
        renderAppProjects();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Project disukai!', showConfirmButton: false, timer: 1500 });
    }
}

function actionShareProject(title) {
    navigator.clipboard.writeText(`${window.location.href} - Project: ${title}`);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Tautan project disalin!', confirmButtonColor: '#000' });
}

function actionAddProductToCart(id) {
    const prod = products.find(p => (p._id === id || p.id === id));
    if(!prod) return;
    cart.push(prod);
    setStorage('leoly_cart', cart);
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
        total += item.price;
        const row = document.createElement("div");
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border-color)";
        row.innerHTML = `
            <div style="flex:1;"><h5 style="font-size:13px;">${escapeHtml(item.name)}</h5><span style="font-size:12px; color:var(--text-muted);">Rp ${(item.price || 0).toLocaleString('id-ID')}</span></div>
            <button class="icon-btn" style="width:28px; height:28px; font-size:11px;" onclick="actionRemoveCartItem(${idx})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    });
    if(totalNode) totalNode.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function actionRemoveCartItem(idx) {
    cart.splice(idx, 1);
    setStorage('leoly_cart', cart);
    updateCartCount();
    renderCartPanelItems();
}

function checkoutToWhatsApp() {
    if(cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Keranjang Kosong!', text: 'Silakan tambahkan produk terlebih dahulu.', confirmButtonColor: '#000' });
        return;
    }
    
    let total = 0;
    let productList = "";
    
    cart.forEach((item, index) => {
        total += item.price;
        productList += `${index + 1}. ${item.name} - Rp ${(item.price || 0).toLocaleString('id-ID')}\n`;
    });
    
    const message = `Halo Leoly! Saya ingin memesan produk berikut:%0A%0A${encodeURIComponent(productList)}%0A────────────────%0A*Total: Rp ${total.toLocaleString('id-ID')}*%0A%0ASaya tertarik dengan produk di atas. Mohon informasi lebih lanjut. Terima kasih!`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    closeCartPanel();
    
    Swal.fire({
        icon: 'question',
        title: 'Konfirmasi Checkout',
        text: `Total Rp ${total.toLocaleString('id-ID')}. Lanjut ke WhatsApp?`,
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#000'
    }).then((result) => {
        if (result.isConfirmed) {
            window.open(waUrl, '_blank');
            cart = [];
            setStorage('leoly_cart', cart);
            updateCartCount();
            renderCartPanelItems();
            Swal.fire({ icon: 'success', title: 'Checkout Berhasil!', showConfirmButton: false, timer: 2000 });
        }
    });
}

function closeCartPanel() {
    if(cartPanel) cartPanel.classList.remove("panel-open");
}

/* --- EVENT LISTENERS --- */
function setupGlobalEventListeners() {
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("mobile-active");
            const icon = menuToggle.querySelector("i");
            if (icon) icon.classList.toggle("fa-bars") || icon.classList.toggle("fa-xmark");
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
                if (icon) icon.classList.add("fa-bars") || icon.classList.remove("fa-xmark");
            }
        });
    });

    const themeBtn = document.getElementById("theme-toggle");
    if(themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-theme");
            const isLight = document.body.classList.contains("light-theme");
            themeBtn.innerHTML = isLight ? "<i class='fa-solid fa-sun'></i>" : "<i class='fa-solid fa-moon'></i>";
        });
    }

    cartPanel = document.getElementById("shopping-cart-panel");
    const cartBtn = document.getElementById("cart-toggle-btn");
    const cartClose = document.getElementById("cart-close-btn");
    if(cartBtn && cartPanel) cartBtn.addEventListener("click", () => cartPanel.classList.add("panel-open"));
    if(cartClose && cartPanel) cartClose.addEventListener("click", () => cartPanel.classList.remove("panel-open"));

    const checkoutBtn = document.getElementById("checkout-action-btn");
    if(checkoutBtn) checkoutBtn.addEventListener("click", () => checkoutToWhatsApp());

    // Search filters
    const projSearch = document.getElementById("project-search");
    if(projSearch) {
        projSearch.addEventListener("input", (e) => {
            const activeTag = document.querySelector("#project-filters .tag.active");
            renderAppProjects(activeTag ? activeTag.dataset.filter : "all", e.target.value);
        });
    }
    document.querySelectorAll("#project-filters .tag").forEach(tag => {
        tag.addEventListener("click", () => {
            document.querySelectorAll("#project-filters .tag").forEach(t => t.classList.remove("active"));
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
    document.querySelectorAll("#shop-filters .tag").forEach(tag => {
        tag.addEventListener("click", () => {
            document.querySelectorAll("#shop-filters .tag").forEach(t => t.classList.remove("active"));
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
            const waMsg = `Halo Leoly!%0A%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APesan: ${encodeURIComponent(message)}`;
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`, "_blank");
            contactForm.reset();
            Swal.fire({ icon: 'success', title: 'Terkirim!', showConfirmButton: false, timer: 1500 });
        });
    }

    const btt = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => btt.style.display = window.scrollY > 400 ? "inline-flex" : "none");
    if(btt) btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const glassNav = document.querySelector(".glass-nav");
    window.addEventListener("scroll", () => {
        if(window.scrollY > 50) glassNav.classList.add("scrolled");
        else glassNav.classList.remove("scrolled");
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
                Swal.fire({ icon: 'success', title: 'Welcome!', showConfirmButton: false, timer: 1500 });
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Username atau password salah!', confirmButtonColor: '#000' });
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

    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".admin-tab-pane").forEach(p => p.classList.remove("active-pane"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.target).classList.add("active-pane");
        });
    });

    setupAdminModalTriggers();
}

function renderAdminTables() {
    // Projects table
    const tbodyProj = document.getElementById("admin-project-table-body");
    if(tbodyProj) {
        tbodyProj.innerHTML = "";
        projects.forEach(p => {
            const itemId = p._id || p.id;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.category)}</td><td>${p.likes || 0}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="editProjectNode('${itemId}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProjectNode('${itemId}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyProj.appendChild(tr);
        });
    }

    // Products table
    const tbodyProd = document.getElementById("admin-product-table-body");
    if(tbodyProd) {
        tbodyProd.innerHTML = "";
        products.forEach(p => {
            const itemId = p._id || p.id;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>Rp ${(p.price || 0).toLocaleString('id-ID')}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="editProductNode('${itemId}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProductNode('${itemId}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyProd.appendChild(tr);
        });
    }

    // FAQs table
    const tbodyFaq = document.getElementById("admin-faq-table-body");
    if(tbodyFaq) {
        tbodyFaq.innerHTML = "";
        faqs.forEach(f => {
            const itemId = f._id || f.id;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(f.question)}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="deleteFaqNode('${itemId}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyFaq.appendChild(tr);
        });
    }

    // Testimonials table
    const tbodyTesti = document.getElementById("admin-testimonial-table-body");
    if(tbodyTesti) {
        tbodyTesti.innerHTML = "";
        testimonials.forEach(t => {
            const itemId = t._id || t.id;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(t.name)}</td><td>${escapeHtml(t.company)}</td><td>${t.stars || 5} ★</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="deleteTestimonialNode('${itemId}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyTesti.appendChild(tr);
        });
    }
}

function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// Edit Home Content
async function editHomeContent() {
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Home Page";
    bodyNode.innerHTML = `
        <form id="edit-home-form">
            <div class="form-group"><label>Tagline</label><input type="text" id="eh-tagline" value="${escapeHtml(homeContent.tagline)}"></div>
            <div class="form-group"><label>Title Prefix</label><input type="text" id="eh-title" value="${escapeHtml(homeContent.titlePrefix)}"></div>
            <div class="form-group"><label>Typing Words (pisah koma)</label><input type="text" id="eh-words" value="${escapeHtml(homeContent.typingWords.join(', '))}"></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="eh-desc" rows="4">${escapeHtml(homeContent.description)}</textarea></div>
            <button type="submit" class="btn btn-primary btn-block">Simpan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("edit-home-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const newContent = {
            tagline: document.getElementById("eh-tagline").value,
            title_prefix: document.getElementById("eh-title").value,
            typing_words: JSON.stringify(document.getElementById("eh-words").value.split(',').map(w => w.trim())),
            description: document.getElementById("eh-desc").value
        };
        
        if (useAPI) {
            await saveHomeContentToAPI(newContent);
            await loadHomeContentFromAPI();
        } else {
            homeContent = {
                tagline: newContent.tagline,
                titlePrefix: newContent.title_prefix,
                typingWords: JSON.parse(newContent.typing_words),
                description: newContent.description
            };
            setStorage('leoly_home_content', homeContent);
        }
        renderHomeContent();
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
    });
}

// Delete functions
async function deleteProjectNode(id) {
    const result = await Swal.fire({ title: 'Yakin hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Hapus' });
    if(result.isConfirmed) {
        if (useAPI) {
            await deleteProjectFromAPI(id);
            await loadProjectsFromAPI();
        } else {
            projects = projects.filter(p => (p._id !== id && p.id !== id));
            setStorage('leoly_projects', projects);
        }
        renderAppProjects();
        renderAdminTables();
        Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 });
    }
}

async function deleteProductNode(id) {
    const result = await Swal.fire({ title: 'Yakin hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Hapus' });
    if(result.isConfirmed) {
        if (useAPI) {
            await deleteProductFromAPI(id);
            await loadProductsFromAPI();
        } else {
            products = products.filter(p => (p._id !== id && p.id !== id));
            setStorage('leoly_products', products);
        }
        renderAppProducts();
        renderAdminTables();
        Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 });
    }
}

async function deleteFaqNode(id) {
    const result = await Swal.fire({ title: 'Yakin hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Hapus' });
    if(result.isConfirmed) {
        if (useAPI) {
            await deleteFAQFromAPI(id);
            await loadFAQsFromAPI();
        } else {
            faqs = faqs.filter(f => (f._id !== id && f.id !== id));
            setStorage('leoly_faqs', faqs);
        }
        renderAppFAQs();
        renderAdminTables();
        Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 });
    }
}

async function deleteTestimonialNode(id) {
    const result = await Swal.fire({ title: 'Yakin hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Hapus' });
    if(result.isConfirmed) {
        if (useAPI) {
            await deleteTestimonialFromAPI(id);
            await loadTestimonialsFromAPI();
        } else {
            testimonials = testimonials.filter(t => (t._id !== id && t.id !== id));
            setStorage('leoly_testimonials', testimonials);
        }
        renderAppTestimonials();
        renderAdminTables();
        Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 });
    }
}

// Edit functions
async function editProjectNode(id) {
    const project = projects.find(p => (p._id === id || p.id === id));
    if(!project) return;
    
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Project";
    bodyNode.innerHTML = `
        <form id="edit-project-form">
            <div class="form-group"><label>Judul</label><input type="text" id="ep-title" value="${escapeHtml(project.title)}"></div>
            <div class="form-group"><label>Kategori</label><select id="ep-cat"><option ${project.category === 'Web' ? 'selected' : ''}>Web</option><option ${project.category === 'Server' ? 'selected' : ''}>Server</option><option ${project.category === 'UI/UX' ? 'selected' : ''}>UI/UX</option></select></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="ep-desc" rows="3">${escapeHtml(project.description)}</textarea></div>
            <div class="form-group"><label>Gambar</label><input type="file" id="ep-image" accept="image/*"></div>
            ${project.image ? `<img src="${project.image}" style="max-width:100px; margin-top:10px;">` : ''}
            <button type="submit" class="btn btn-primary btn-block">Simpan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("edit-project-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        let image = project.image;
        const file = document.getElementById("ep-image").files[0];
        if(file) image = await imageToBase64(file);
        
        const updatedProject = {
            title: document.getElementById("ep-title").value,
            category: document.getElementById("ep-cat").value,
            description: document.getElementById("ep-desc").value,
            image: image,
            likes: project.likes
        };
        
        if (useAPI) {
            await updateProjectToAPI(id, updatedProject);
            await loadProjectsFromAPI();
        } else {
            const index = projects.findIndex(p => (p._id === id || p.id === id));
            projects[index] = { ...projects[index], ...updatedProject };
            setStorage('leoly_projects', projects);
        }
        renderAppProjects();
        renderAdminTables();
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
    });
}

async function editProductNode(id) {
    const product = products.find(p => (p._id === id || p.id === id));
    if(!product) return;
    
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Product";
    bodyNode.innerHTML = `
        <form id="edit-product-form">
            <div class="form-group"><label>Nama</label><input type="text" id="ep-name" value="${escapeHtml(product.name)}"></div>
            <div class="form-group"><label>Kategori</label><select id="ep-cat"><option ${product.category === 'Template' ? 'selected' : ''}>Template</option><option ${product.category === 'Module' ? 'selected' : ''}>Module</option><option ${product.category === 'Asset' ? 'selected' : ''}>Asset</option></select></div>
            <div class="form-group"><label>Harga</label><input type="number" id="ep-price" value="${product.price}"></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="ep-desc" rows="3">${escapeHtml(product.description)}</textarea></div>
            <div class="form-group"><label>Gambar</label><input type="file" id="ep-image" accept="image/*"></div>
            ${product.image ? `<img src="${product.image}" style="max-width:100px; margin-top:10px;">` : ''}
            <button type="submit" class="btn btn-primary btn-block">Simpan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("edit-product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        let image = product.image;
        const file = document.getElementById("ep-image").files[0];
        if(file) image = await imageToBase64(file);
        
        const updatedProduct = {
            name: document.getElementById("ep-name").value,
            category: document.getElementById("ep-cat").value,
            price: Number(document.getElementById("ep-price").value),
            description: document.getElementById("ep-desc").value,
            image: image
        };
        
        if (useAPI) {
            await updateProductToAPI(id, updatedProduct);
            await loadProductsFromAPI();
        } else {
            const index = products.findIndex(p => (p._id === id || p.id === id));
            products[index] = { ...products[index], ...updatedProduct };
            setStorage('leoly_products', products);
        }
        renderAppProducts();
        renderAdminTables();
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
    });
}

// Add functions modal triggers
function setupAdminModalTriggers() {
    const overlay = document.getElementById("global-data-modal");
    const closeBtn = document.getElementById("modal-close-trigger");
    if(!overlay || !closeBtn) return;
    closeBtn.addEventListener("click", () => overlay.classList.remove("modal-active"));

    document.getElementById("btn-edit-home")?.addEventListener("click", () => editHomeContent());
    
    // Add Project Modal
    document.getElementById("btn-add-project-modal")?.addEventListener("click", () => {
        document.getElementById("modal-title-node").textContent = "Tambah Project";
        document.getElementById("modal-body-node").innerHTML = `
            <form id="add-project-form">
                <div class="form-group"><label>Judul</label><input type="text" id="p-title" required></div>
                <div class="form-group"><label>Kategori</label><select id="p-cat"><option>Web</option><option>Server</option><option>UI/UX</option></select></div>
                <div class="form-group"><label>Deskripsi</label><textarea id="p-desc" rows="3" required></textarea></div>
                <div class="form-group"><label>Gambar</label><input type="file" id="p-image" accept="image/*"></div>
                <button type="submit" class="btn btn-primary btn-block">Simpan</button>
            </form>
        `;
        overlay.classList.add("modal-active");
        
        document.getElementById("add-project-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            let image = null;
            const file = document.getElementById("p-image").files[0];
            if(file) image = await imageToBase64(file);
            
            const newProject = {
                title: document.getElementById("p-title").value,
                category: document.getElementById("p-cat").value,
                description: document.getElementById("p-desc").value,
                likes: 0,
                image: image
            };
            
            if (useAPI) {
                await saveProjectToAPI(newProject);
                await loadProjectsFromAPI();
            } else {
                projects.unshift({ ...newProject, id: 'p_' + Date.now() });
                setStorage('leoly_projects', projects);
            }
            renderAppProjects();
            renderAdminTables();
            overlay.classList.remove("modal-active");
            Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
        });
    });
    
    // Add Product Modal
    document.getElementById("btn-add-product-modal")?.addEventListener("click", () => {
        document.getElementById("modal-title-node").textContent = "Tambah Produk";
        document.getElementById("modal-body-node").innerHTML = `
            <form id="add-product-form">
                <div class="form-group"><label>Nama</label><input type="text" id="pr-name" required></div>
                <div class="form-group"><label>Kategori</label><select id="pr-cat"><option>Template</option><option>Module</option><option>Asset</option></select></div>
                <div class="form-group"><label>Harga</label><input type="number" id="pr-price" required></div>
                <div class="form-group"><label>Deskripsi</label><textarea id="pr-desc" rows="3" required></textarea></div>
                <div class="form-group"><label>Gambar</label><input type="file" id="pr-image" accept="image/*"></div>
                <button type="submit" class="btn btn-primary btn-block">Simpan</button>
            </form>
        `;
        overlay.classList.add("modal-active");
        
        document.getElementById("add-product-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            let image = null;
            const file = document.getElementById("pr-image").files[0];
            if(file) image = await imageToBase64(file);
            
            const newProduct = {
                name: document.getElementById("pr-name").value,
                category: document.getElementById("pr-cat").value,
                price: Number(document.getElementById("pr-price").value),
                description: document.getElementById("pr-desc").value,
                image: image
            };
            
            if (useAPI) {
                await saveProductToAPI(newProduct);
                await loadProductsFromAPI();
            } else {
                products.unshift({ ...newProduct, id: 'pr_' + Date.now() });
                setStorage('leoly_products', products);
            }
            renderAppProducts();
            renderAdminTables();
            overlay.classList.remove("modal-active");
            Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
        });
    });
    
    // Add FAQ Modal
    document.getElementById("btn-add-faq-modal")?.addEventListener("click", () => {
        document.getElementById("modal-title-node").textContent = "Tambah FAQ";
        document.getElementById("modal-body-node").innerHTML = `
            <form id="add-faq-form">
                <div class="form-group"><label>Pertanyaan</label><input type="text" id="f-q" required></div>
                <div class="form-group"><label>Jawaban</label><textarea id="f-a" rows="3" required></textarea></div>
                <button type="submit" class="btn btn-primary btn-block">Simpan</button>
            </form>
        `;
        overlay.classList.add("modal-active");
        
        document.getElementById("add-faq-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const newFaq = {
                question: document.getElementById("f-q").value,
                answer: document.getElementById("f-a").value
            };
            
            if (useAPI) {
                await saveFAQToAPI(newFaq);
                await loadFAQsFromAPI();
            } else {
                faqs.push({ ...newFaq, id: 'f_' + Date.now() });
                setStorage('leoly_faqs', faqs);
            }
            renderAppFAQs();
            renderAdminTables();
            overlay.classList.remove("modal-active");
            Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
        });
    });
    
    // Add Testimonial Modal
    document.getElementById("btn-add-testimonial-modal")?.addEventListener("click", () => {
        document.getElementById("modal-title-node").textContent = "Tambah Testimoni";
        document.getElementById("modal-body-node").innerHTML = `
            <form id="add-testi-form">
                <div class="form-group"><label>Nama</label><input type="text" id="t-name" required></div>
                <div class="form-group"><label>Perusahaan</label><input type="text" id="t-company" required></div>
                <div class="form-group"><label>Rating</label><input type="number" id="t-stars" min="1" max="5" value="5" required></div>
                <div class="form-group"><label>Testimoni</label><textarea id="t-text" rows="3" required></textarea></div>
                <button type="submit" class="btn btn-primary btn-block">Simpan</button>
            </form>
        `;
        overlay.classList.add("modal-active");
        
        document.getElementById("add-testi-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const newTesti = {
                name: document.getElementById("t-name").value,
                company: document.getElementById("t-company").value,
                stars: Number(document.getElementById("t-stars").value),
                text: document.getElementById("t-text").value
            };
            
            if (useAPI) {
                await saveTestimonialToAPI(newTesti);
                await loadTestimonialsFromAPI();
            } else {
                testimonials.unshift({ ...newTesti, id: 't_' + Date.now() });
                setStorage('leoly_testimonials', testimonials);
            }
            renderAppTestimonials();
            renderAdminTables();
            overlay.classList.remove("modal-active");
            Swal.fire({ icon: 'success', title: 'Berhasil!', showConfirmButton: false, timer: 1500 });
        });
    });
}
/* --- ECOSYSTEM CONFIGURATION & LOCALSTORAGE INITIATION --- */
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

// Default Home Content
const DEFAULT_HOME_CONTENT = {
    tagline: "Hi, I'm Leoly 👋",
    titlePrefix: "Fullstack Developer &",
    description: "Saya seorang Fullstack Developer yang berdedikasi menciptakan pengalaman digital yang bermakna. Menggabungkan kode yang elegan dengan desain yang indah.",
    typingWords: ["Creative Technologist", "Fullstack Developer", "UI/UX Enthusiast"]
};

// Helper functions
function getStorage(key, fallback) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}
function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Global State
let projects = getStorage('leoly_projects', DEFAULT_PROJECTS);
let products = getStorage('leoly_products', DEFAULT_PRODUCTS);
let faqs = getStorage('leoly_faqs', DEFAULT_FAQS);
let testimonials = getStorage('leoly_testimonials', DEFAULT_TESTIMONIALS);
let donations = getStorage('leoly_donations', []);
let cart = [];
let homeContent = getStorage('leoly_home_content', DEFAULT_HOME_CONTENT);
let typingTimeout = null;

/* --- INITIALIZER --- */
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const loader = document.getElementById("loading-screen");
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 800);

    AOS.init({ duration: 800, once: true });
    initParticles();
    
    // Render semua konten
    renderHomeContent();
    renderAppProjects();
    renderAppProducts();
    renderAppFAQs();
    renderAppTestimonials();
    updateCartCount();

    setupGlobalEventListeners();
});

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

// Render Home Content ke halaman
function renderHomeContent() {
    // Update tagline
    const taglineElement = document.querySelector("#home .tagline");
    if(taglineElement) taglineElement.textContent = homeContent.tagline;
    
    // Update title - pertahankan span typing-text
    const titleElement = document.querySelector("#home h1");
    if(titleElement) {
        // Simpan konten yang sudah ada
        const existingTypingSpan = titleElement.querySelector(".typing-text");
        if(existingTypingSpan) {
            // Hanya update teks sebelum typing span
            const prefixText = homeContent.titlePrefix;
            titleElement.innerHTML = `${escapeHtml(prefixText)} <br><span class="typing-text"></span>`;
        }
    }
    
    // Update description
    const descElement = document.querySelector("#home .hero-text > p");
    if(descElement) descElement.textContent = homeContent.description;
    
    // Restart typing effect
    if(typingTimeout) clearTimeout(typingTimeout);
    initTypingEffect();
}

function initTypingEffect() {
    const node = document.querySelector(".typing-text");
    if(!node) return;
    
    // Gunakan kata-kata dari homeContent
    const words = homeContent.typingWords && homeContent.typingWords.length > 0 ? 
        homeContent.typingWords : ["Creative Technologist", "Fullstack Developer", "UI/UX Enthusiast"];
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

/* --- RENDER FUNCTIONS --- */
function renderAppProjects(filter = "all", query = "") {
    const container = document.getElementById("project-display-grid");
    if(!container) return;
    container.innerHTML = "";
    
    const filtered = projects.filter(p => {
        const matchCat = filter === "all" || p.category.toLowerCase() === filter.toLowerCase();
        const matchSrc = p.title.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase());
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
                    <button class="icon-btn btn-like" onclick="actionLikeProject('${p.id}')"><i class="fa-solid fa-heart"></i> ${p.likes}</button>
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
        const matchCat = filter === "all" || p.category.toLowerCase() === filter.toLowerCase();
        const matchSrc = p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase());
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
                <span class="card-price">Rp ${p.price.toLocaleString('id-ID')}</span>
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
                    <div class="stars-row">${'<i class="fa-solid fa-star"></i>'.repeat(t.stars)}</div>
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

/* --- ACTIONS --- */
function actionLikeProject(id) {
    projects = projects.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    setStorage('leoly_projects', projects);
    renderAppProjects();
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
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.marginBottom = "12px";
        row.style.paddingBottom = "8px";
        row.style.borderBottom = "1px solid var(--border-color)";
        row.innerHTML = `
            <div style="flex:1;">
                <h5 style="font-size:13px;">${escapeHtml(item.name)}</h5>
                <span style="font-size:12px; color:var(--text-muted);">Rp ${item.price.toLocaleString('id-ID')}</span>
            </div>
            <button class="icon-btn" style="width:28px; height:28px; font-size:11px;" onclick="actionRemoveCartItem(${idx})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    });
    if(totalNode) totalNode.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function actionRemoveCartItem(idx) {
    cart.splice(idx, 1);
    updateCartCount();
    renderCartPanelItems();
}

/* --- EVENT LISTENERS --- */
function setupGlobalEventListeners() {
    // Mobile menu toggle
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

    // Navigation
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

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    if(themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-theme");
            const isLight = document.body.classList.contains("light-theme");
            themeBtn.innerHTML = isLight ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
        });
    }

    // Cart panel
    const cartBtn = document.getElementById("cart-toggle-btn");
    const cartClose = document.getElementById("cart-close-btn");
    const cartPanel = document.getElementById("shopping-cart-panel");

    if(cartBtn && cartPanel) cartBtn.addEventListener("click", () => cartPanel.classList.add("panel-open"));
    if(cartClose && cartPanel) cartClose.addEventListener("click", () => cartPanel.classList.remove("panel-open"));

    // Checkout
    const checkoutBtn = document.getElementById("checkout-action-btn");
    if(checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if(cart.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Keranjang masih kosong!', confirmButtonColor: '#000' });
                return;
            }
            Swal.fire({ icon: 'success', title: 'Checkout Berhasil!', text: 'Terima kasih telah membeli produk saya. Link download akan dikirim ke email Anda.', confirmButtonColor: '#000' });
            cart = [];
            updateCartCount();
            renderCartPanelItems();
            cartPanel.classList.remove("panel-open");
        });
    }

    // Search & Filter Projects
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

    // Search & Filter Products
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

    // Contact Form
    const contactForm = document.getElementById("main-contact-form");
    if(contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            Swal.fire({ icon: 'success', title: 'Pesan Terkirim!', text: 'Terima kasih, saya akan segera merespons pesan Anda.', confirmButtonColor: '#000' });
            contactForm.reset();
        });
    }

    // Back to Top
    const btt = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
        if(window.scrollY > 400 && btt) btt.style.display = "inline-flex";
        else if(btt) btt.style.display = "none";
    });
    if(btt) btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Navbar scroll
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
    // Projects table
    const tbodyProj = document.getElementById("admin-project-table-body");
    if(tbodyProj) {
        tbodyProj.innerHTML = "";
        projects.forEach(p => {
            const tr = document.createElement("tr");
            const hasImage = p.image ? '<i class="fa-solid fa-image" style="color:green"></i>' : '<i class="fa-solid fa-image-slash" style="color:gray"></i>';
            tr.innerHTML = `<td>${hasImage} ${escapeHtml(p.title)}</td><td>${escapeHtml(p.category)}</td><td>${p.likes}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="editProjectNode('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProjectNode('${p.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyProj.appendChild(tr);
        });
    }

    // Products table
    const tbodyProd = document.getElementById("admin-product-table-body");
    if(tbodyProd) {
        tbodyProd.innerHTML = "";
        products.forEach(p => {
            const tr = document.createElement("tr");
            const hasImage = p.image ? '<i class="fa-solid fa-image" style="color:green"></i>' : '<i class="fa-solid fa-image-slash" style="color:gray"></i>';
            tr.innerHTML = `<td>${hasImage} ${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>Rp ${p.price.toLocaleString('id-ID')}</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="editProductNode('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProductNode('${p.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyProd.appendChild(tr);
        });
    }

    // FAQ table
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

    // Testimonials table
    const tbodyTesti = document.getElementById("admin-testimonial-table-body");
    if(tbodyTesti) {
        tbodyTesti.innerHTML = "";
        testimonials.forEach(t => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${escapeHtml(t.name)}</td><td>${escapeHtml(t.company)}</td><td>${t.stars} ★</td>
                <td class="table-actions"><button class="btn btn-secondary btn-sm" onclick="deleteTestimonialNode('${t.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
            tbodyTesti.appendChild(tr);
        });
    }
}

// Fungsi untuk konversi file image ke base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Fungsi Edit Home Content
function editHomeContent() {
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    // Menyiapkan string untuk typing words
    const typingWordsStr = homeContent.typingWords.join(', ');
    
    titleNode.textContent = "Edit Home Page Content";
    bodyNode.innerHTML = `
        <form id="form-edit-home">
            <div class="form-group">
                <label>Tagline (contoh: Hi, I'm Leoly 👋)</label>
                <input type="text" id="eh-tagline" value="${escapeHtml(homeContent.tagline)}" required>
            </div>
            <div class="form-group">
                <label>Title Prefix (teks sebelum typing effect)</label>
                <input type="text" id="eh-title-prefix" value="${escapeHtml(homeContent.titlePrefix)}" required>
            </div>
            <div class="form-group">
                <label>Kata-kata Typing Effect (pisahkan dengan koma)</label>
                <input type="text" id="eh-typing-words" value="${escapeHtml(typingWordsStr)}" required>
                <small style="color: var(--text-muted); font-size: 12px; display: block; margin-top: 5px;">Contoh: Creative Technologist, Fullstack Developer, UI/UX Enthusiast</small>
            </div>
            <div class="form-group">
                <label>Deskripsi / Bio</label>
                <textarea id="eh-description" rows="4" required>${escapeHtml(homeContent.description)}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Simpan Perubahan</button>
        </form>
    `;
    overlay.classList.add("modal-active");
    
    document.getElementById("form-edit-home").addEventListener("submit", (e) => {
        e.preventDefault();
        const tagline = document.getElementById("eh-tagline").value;
        const titlePrefix = document.getElementById("eh-title-prefix").value;
        const typingWordsStr = document.getElementById("eh-typing-words").value;
        const description = document.getElementById("eh-description").value;
        
        // Parse typing words dari string yang dipisah koma
        const typingWords = typingWordsStr.split(',').map(word => word.trim()).filter(word => word.length > 0);
        
        homeContent = {
            tagline: tagline,
            titlePrefix: titlePrefix,
            description: description,
            typingWords: typingWords
        };
        
        setStorage('leoly_home_content', homeContent);
        renderHomeContent();
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Home page berhasil diupdate.', timer: 1500, showConfirmButton: false });
    });
}

/* --- CRUD ACTIONS --- */
function deleteProjectNode(id) {
    projects = projects.filter(p => p.id !== id);
    setStorage('leoly_projects', projects);
    renderAdminTables();
    renderAppProjects();
}

function deleteProductNode(id) {
    products = products.filter(p => p.id !== id);
    setStorage('leoly_products', products);
    renderAdminTables();
    renderAppProducts();
}

function deleteFaqNode(id) {
    faqs = faqs.filter(f => f.id !== id);
    setStorage('leoly_faqs', faqs);
    renderAdminTables();
    renderAppFAQs();
}

function deleteTestimonialNode(id) {
    testimonials = testimonials.filter(t => t.id !== id);
    setStorage('leoly_testimonials', testimonials);
    renderAdminTables();
    renderAppTestimonials();
}

// Edit functions untuk project
function editProjectNode(id) {
    const project = projects.find(p => p.id === id);
    if(!project) return;
    
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Project";
    bodyNode.innerHTML = `
        <form id="form-edit-project">
            <div class="form-group"><label>Judul Project</label><input type="text" id="ep-title" value="${escapeHtml(project.title)}" required></div>
            <div class="form-group"><label>Kategori</label><select id="ep-category" style="width:100%; padding:12px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary);">
                <option ${project.category === 'Web' ? 'selected' : ''}>Web</option>
                <option ${project.category === 'Server' ? 'selected' : ''}>Server</option>
                <option ${project.category === 'UI/UX' ? 'selected' : ''}>UI/UX</option>
            </select></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="ep-desc" rows="3" required>${escapeHtml(project.desc)}</textarea></div>
            <div class="form-group"><label>Gambar Thumbnail</label><input type="file" id="ep-image" accept="image/*"></div>
            ${project.image ? `<div class="form-group"><img src="${project.image}" style="max-width:100%; border-radius:8px; margin-top:10px;"><p style="font-size:12px; margin-top:5px;">Gambar saat ini</p></div>` : ''}
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
        
        const index = projects.findIndex(p => p.id === id);
        projects[index] = { ...project, title, category, desc, image: imageBase64 };
        setStorage('leoly_projects', projects);
        renderAdminTables();
        renderAppProjects();
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Project berhasil diupdate.', timer: 1500, showConfirmButton: false });
    });
}

// Edit functions untuk product
function editProductNode(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;
    
    const overlay = document.getElementById("global-data-modal");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");
    
    titleNode.textContent = "Edit Produk";
    bodyNode.innerHTML = `
        <form id="form-edit-product">
            <div class="form-group"><label>Nama Produk</label><input type="text" id="epr-name" value="${escapeHtml(product.name)}" required></div>
            <div class="form-group"><label>Kategori</label><select id="epr-category" style="width:100%; padding:12px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px;">
                <option ${product.category === 'Template' ? 'selected' : ''}>Template</option>
                <option ${product.category === 'Module' ? 'selected' : ''}>Module</option>
                <option ${product.category === 'Asset' ? 'selected' : ''}>Asset</option>
            </select></div>
            <div class="form-group"><label>Harga (Rp)</label><input type="number" id="epr-price" value="${product.price}" required></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="epr-desc" rows="3" required>${escapeHtml(product.desc)}</textarea></div>
            <div class="form-group"><label>Gambar Thumbnail</label><input type="file" id="epr-image" accept="image/*"></div>
            ${product.image ? `<div class="form-group"><img src="${product.image}" style="max-width:100%; border-radius:8px; margin-top:10px;"><p style="font-size:12px; margin-top:5px;">Gambar saat ini</p></div>` : ''}
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
        
        const index = products.findIndex(p => p.id === id);
        products[index] = { ...product, name, category, price, desc, image: imageBase64 };
        setStorage('leoly_products', products);
        renderAdminTables();
        renderAppProducts();
        overlay.classList.remove("modal-active");
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil diupdate.', timer: 1500, showConfirmButton: false });
    });
}

/* --- MODAL SETUP --- */
function setupAdminModalTriggers() {
    const overlay = document.getElementById("global-data-modal");
    const closeBtn = document.getElementById("modal-close-trigger");
    const titleNode = document.getElementById("modal-title-node");
    const bodyNode = document.getElementById("modal-body-node");

    if(!overlay || !closeBtn) return;

    closeBtn.addEventListener("click", () => overlay.classList.remove("modal-active"));

    // Tombol Edit Home
    const editHomeBtn = document.getElementById("btn-edit-home");
    if(editHomeBtn) {
        editHomeBtn.addEventListener("click", () => {
            editHomeContent();
        });
    }

    // Add Project Modal
    const addProjBtn = document.getElementById("btn-add-project-modal");
    if(addProjBtn) {
        addProjBtn.addEventListener("click", () => {
            titleNode.textContent = "Tambah Project Baru";
            bodyNode.innerHTML = `
                <form id="form-crud-project">
                    <div class="form-group"><label>Judul Project</label><input type="text" id="cp-title" required></div>
                    <div class="form-group"><label>Kategori</label><select id="cp-category" style="width:100%; padding:12px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary);">
                        <option>Web</option><option>Server</option><option>UI/UX</option>
                    </select></div>
                    <div class="form-group"><label>Deskripsi</label><textarea id="cp-desc" rows="3" required></textarea></div>
                    <div class="form-group"><label>Gambar Thumbnail (Opsional)</label><input type="file" id="cp-image" accept="image/*"></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan Project</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            
            document.getElementById("form-crud-project").addEventListener("submit", async (e) => {
                e.preventDefault();
                const title = document.getElementById("cp-title").value;
                const category = document.getElementById("cp-category").value;
                const desc = document.getElementById("cp-desc").value;
                const imageFile = document.getElementById("cp-image").files[0];
                
                let imageBase64 = null;
                if(imageFile) {
                    imageBase64 = await imageToBase64(imageFile);
                }
                
                projects.push({ id: 'p_' + Date.now(), title, category, desc, likes: 0, image: imageBase64 });
                setStorage('leoly_projects', projects);
                renderAdminTables();
                renderAppProjects();
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Project berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }

    // Add Product Modal
    const addProdBtn = document.getElementById("btn-add-product-modal");
    if(addProdBtn) {
        addProdBtn.addEventListener("click", () => {
            titleNode.textContent = "Tambah Produk Digital";
            bodyNode.innerHTML = `
                <form id="form-crud-product">
                    <div class="form-group"><label>Nama Produk</label><input type="text" id="cpr-name" required></div>
                    <div class="form-group"><label>Kategori</label><select id="cpr-category" style="width:100%; padding:12px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px;">
                        <option>Template</option><option>Module</option><option>Asset</option>
                    </select></div>
                    <div class="form-group"><label>Harga (Rp)</label><input type="number" id="cpr-price" required></div>
                    <div class="form-group"><label>Deskripsi</label><textarea id="cpr-desc" rows="3" required></textarea></div>
                    <div class="form-group"><label>Gambar Thumbnail (Opsional)</label><input type="file" id="cpr-image" accept="image/*"></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan Produk</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            
            document.getElementById("form-crud-product").addEventListener("submit", async (e) => {
                e.preventDefault();
                const name = document.getElementById("cpr-name").value;
                const category = document.getElementById("cpr-category").value;
                const price = Number(document.getElementById("cpr-price").value);
                const desc = document.getElementById("cpr-desc").value;
                const imageFile = document.getElementById("cpr-image").files[0];
                
                let imageBase64 = null;
                if(imageFile) {
                    imageBase64 = await imageToBase64(imageFile);
                }
                
                products.push({ id: 'pr_' + Date.now(), name, category, price, desc, image: imageBase64 });
                setStorage('leoly_products', products);
                renderAdminTables();
                renderAppProducts();
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }

    // Add FAQ Modal
    const addFaqBtn = document.getElementById("btn-add-faq-modal");
    if(addFaqBtn) {
        addFaqBtn.addEventListener("click", () => {
            titleNode.textContent = "Tambah FAQ";
            bodyNode.innerHTML = `
                <form id="form-crud-faq">
                    <div class="form-group"><label>Pertanyaan</label><input type="text" id="cf-q" required></div>
                    <div class="form-group"><label>Jawaban</label><textarea id="cf-a" rows="3" required></textarea></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan FAQ</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            document.getElementById("form-crud-faq").addEventListener("submit", (e) => {
                e.preventDefault();
                faqs.push({ id: 'f_' + Date.now(), question: document.getElementById("cf-q").value, answer: document.getElementById("cf-a").value });
                setStorage('leoly_faqs', faqs);
                renderAdminTables();
                renderAppFAQs();
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'FAQ berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }

    // Add Testimonial Modal
    const addTestiBtn = document.getElementById("btn-add-testimonial-modal");
    if(addTestiBtn) {
        addTestiBtn.addEventListener("click", () => {
            titleNode.textContent = "Tambah Testimoni";
            bodyNode.innerHTML = `
                <form id="form-crud-testi">
                    <div class="form-group"><label>Nama</label><input type="text" id="ct-name" required></div>
                    <div class="form-group"><label>Perusahaan</label><input type="text" id="ct-comp" required></div>
                    <div class="form-group"><label>Rating (1-5)</label><input type="number" id="ct-star" min="1" max="5" value="5" required></div>
                    <div class="form-group"><label>Testimoni</label><textarea id="ct-text" rows="3" required></textarea></div>
                    <button type="submit" class="btn btn-primary btn-block">Simpan Testimoni</button>
                </form>
            `;
            overlay.classList.add("modal-active");
            document.getElementById("form-crud-testi").addEventListener("submit", (e) => {
                e.preventDefault();
                testimonials.push({ id: 't_' + Date.now(), name: document.getElementById("ct-name").value, company: document.getElementById("ct-comp").value, stars: Number(document.getElementById("ct-star").value), text: document.getElementById("ct-text").value });
                setStorage('leoly_testimonials', testimonials);
                renderAdminTables();
                renderAppTestimonials();
                overlay.classList.remove("modal-active");
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Testimoni berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
            });
        });
    }
}
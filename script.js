// --- CONFIG DATA LOG IN ---
const DEV_USER = "leoly";
const DEV_PASS = "dev123";

// --- STATE MANAGEMENT & LOCALSTORAGE PERSISTENCE ---
let currentUserRole = localStorage.getItem('userRole') || "guest"; 

const DEFAULT_PROJECT_IMG = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600";
const DEFAULT_SHOP_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";

let projectsData = JSON.parse(localStorage.getItem('leoly_projects')) || [
    { 
        title: "Personal Website V1", 
        desc: "Desain portofolio minimalis black & white dengan sistem smooth glass blur effect.",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600"
    },
    { 
        title: "Dashboard Layout", 
        desc: "Template UI dashboard interaktif premium berbasis penataan web mobile responsive.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600"
    }
];

let shopData = JSON.parse(localStorage.getItem('leoly_shop')) || [
    { 
        title: "Premium UI Slicing Kit", 
        desc: "Kumpulan komponen CSS modern modular siap pakai.", 
        price: "Rp 35.000",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600"
    },
    { 
        title: "Custom Sidebar Code", 
        desc: "Source code efek right-floating sidebar blur transparan.", 
        price: "Free",
        image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600"
    }
];

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = "success") {
    const oldToast = document.querySelector('.toast-notif');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notif ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => { toast.classList.add('show'); }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- DOM ELEMENTS SELECTION ---
const openMenuBtn = document.getElementById('openMenu');
const closeMenuBtn = document.getElementById('closeMenu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');

const menuAdmin = document.getElementById('menu-admin');
const roleIndicator = document.getElementById('role-indicator');
const btnAuthAction = document.getElementById('btn-auth-action');
const authBoxDesc = document.getElementById('auth-box-desc');

const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const projectContainer = document.getElementById('project-container');
const shopContainer = document.getElementById('shop-container');
const contentForm = document.getElementById('content-form');
const formTarget = document.getElementById('form-target');
const priceGroup = document.getElementById('price-group');

// --- SIDEBAR CONTROL SYSTEM ---
function toggleSidebar(open) {
    if (open) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    } else {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

openMenuBtn.addEventListener('click', () => toggleSidebar(true));
closeMenuBtn.addEventListener('click', () => toggleSidebar(false));
overlay.addEventListener('click', () => toggleSidebar(false));

// --- SINKRONISASI STATUS AUTH DEVELOPER ---
function updateAuthUI() {
    if (currentUserRole === "developer") {
        roleIndicator.textContent = "Dev Mode";
        roleIndicator.className = "role-badge developer";
        btnAuthAction.textContent = "Sign Out / Log Out";
        authBoxDesc.textContent = "Kamu masuk sebagai Owner.";
        menuAdmin.classList.remove('locked');
        
        const lockIcon = menuAdmin.querySelector('.lock-icon');
        if (lockIcon) lockIcon.textContent = "↗";
    } else {
        roleIndicator.textContent = "Guest Mode";
        roleIndicator.className = "role-badge guest";
        btnAuthAction.textContent = "Sign In Developer";
        authBoxDesc.textContent = "Ingin mengelola konten web?";
        menuAdmin.classList.add('locked');
        
        const lockIcon = menuAdmin.querySelector('.lock-icon');
        if (lockIcon) lockIcon.textContent = "🔒";
    }
}

// --- AKSI SWITCH / SIGN-IN LOG OUT ---
btnAuthAction.addEventListener('click', () => {
    if (currentUserRole === "guest") {
        toggleSidebar(false);
        loginModal.classList.add('show');
    } else {
        currentUserRole = "guest";
        localStorage.setItem('userRole', 'guest');
        updateAuthUI();
        renderHubContent();
        showToast("Keluar dari Mode Developer", "info");
        document.querySelector('[data-target="beranda-view"]').click();
        toggleSidebar(false);
    }
});

closeLogin.addEventListener('click', () => {
    loginModal.classList.remove('show');
    loginError.style.display = 'none';
    loginForm.reset();
});

// --- VERIFIKASI LOGIN SYSTEM ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;

    if (username === DEV_USER && password === DEV_PASS) {
        currentUserRole = "developer";
        localStorage.setItem('userRole', 'developer');
        updateAuthUI();
        renderHubContent();
        loginModal.classList.remove('show');
        loginError.style.display = 'none';
        loginForm.reset();
        showToast("Selamat Datang Kembali, Leoly!");
        document.querySelector('[data-target="admin-view"]').click();
    } else {
        loginError.style.display = 'block';
        showToast("Kredensial login salah!", "error");
    }
});

// --- ROUTING SINGLE PAGE APPLICATION (SPA) ---
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-target');

        if (targetView === "admin-view" && currentUserRole !== "developer") {
            showToast("Akses ditolak! Menu terkunci.", "error");
            toggleSidebar(false);
            return;
        }

        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        viewSections.forEach(section => {
            if (section.id === targetView) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        toggleSidebar(false);
    });
});

// --- TOGGLE KOLOM HARGA FORM DI ADMIN PANEL ---
formTarget.addEventListener('change', () => {
    if (formTarget.value === 'shop') {
        priceGroup.style.display = 'block';
    } else {
        priceGroup.style.display = 'none';
    }
});

// --- FUNGSI HAPUS ITEM (CRUD - DELETE) ---
function deleteProject(index) {
    if(confirm("Hapus project ini dari showcase?")) {
        projectsData.splice(index, 1);
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        renderHubContent();
        showToast("Project berhasil dihapus", "info");
    }
}

function deleteShopItem(index) {
    if(confirm("Hapus produk ini dari toko?")) {
        shopData.splice(index, 1);
        localStorage.setItem('leoly_shop', JSON.stringify(shopData));
        renderHubContent();
        showToast("Produk berhasil dihapus", "info");
    }
}

// --- RENDERING KONTEN DINAMIS ---
function renderHubContent() {
    if (document.getElementById('count-projects')) {
        document.getElementById('count-projects').textContent = projectsData.length;
        document.getElementById('count-shop').textContent = shopData.length;
    }

    const isDev = (currentUserRole === "developer");

    // Render Grid Tab Project
    projectContainer.innerHTML = '';
    projectsData.forEach((proj, idx) => {
        const item = document.createElement('div');
        item.className = 'card';
        const imgUrl = (proj.image && proj.image.trim() !== "") ? proj.image : DEFAULT_PROJECT_IMG;

        item.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imgUrl}" class="card-preview-img" alt="${proj.title}" onerror="this.src='${DEFAULT_PROJECT_IMG}'">
                ${isDev ? `<button class="btn-delete-item" onclick="deleteProject(${idx})">✕ Hapus</button>` : ''}
            </div>
            <div class="card-header">
                <span>${proj.title}</span>
            </div>
            <p style="color: var(--text-muted); font-size:0.9rem; line-height:1.5;">${proj.desc}</p>
        `;
        projectContainer.appendChild(item);
    });

    // Render Grid Tab Shop
    shopContainer.innerHTML = '';
    shopData.forEach((prod, idx) => {
        const item = document.createElement('div');
        item.className = 'card';
        const imgUrl = (prod.image && prod.image.trim() !== "") ? prod.image : DEFAULT_SHOP_IMG;

        item.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imgUrl}" class="card-preview-img" alt="${prod.title}" onerror="this.src='${DEFAULT_SHOP_IMG}'">
                ${isDev ? `<button class="btn-delete-item" onclick="deleteShopItem(${idx})">✕ Hapus</button>` : ''}
            </div>
            <div class="card-header">
                <span>${prod.title}</span>
                <span style="font-size:0.8rem; font-weight:700; color:var(--text-main); background:rgba(255,255,255,0.06); padding: 4px 10px; border-radius:30px; border: 1px solid var(--border);">${prod.price}</span>
            </div>
            <p style="color: var(--text-muted); font-size:0.9rem; line-height:1.5; margin-bottom:0.25rem;">${prod.desc}</p>
            <button class="btn btn-primary" style="padding:0.6rem; font-size:0.85rem; margin-top:auto;" onclick="showToast('Fitur checkout simulasi berhasil!')">Beli Item</button>
        `;
        shopContainer.appendChild(item);
    });
}

// --- SUBMIT KONTEN BARU & SIMPAN DI BROWSER ---
contentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('content-title');
    const descInput = document.getElementById('content-desc');
    const imgInput = document.getElementById('content-image');
    const priceInput = document.getElementById('content-price');

    if (formTarget.value === 'project') {
        projectsData.push({
            title: titleInput.value,
            desc: descInput.value,
            image: imgInput.value
        });
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        showToast("Showcase project berhasil ditambahkan!");
        document.querySelector('[data-target="project-view"]').click();
    } else {
        shopData.push({
            title: titleInput.value,
            desc: descInput.value,
            price: priceInput.value || "Free",
            image: imgInput.value
        });
        localStorage.setItem('leoly_shop', JSON.stringify(shopData));
        showToast("Item produk baru berhasil dipajang!");
        document.querySelector('[data-target="shop-view"]').click();
    }

    renderHubContent();
    contentForm.reset();
    priceGroup.style.display = 'none';
});

// Inisialisasi Booting Awal System Hub
window.deleteProject = deleteProject;
window.deleteShopItem = deleteShopItem;
updateAuthUI();
renderHubContent();

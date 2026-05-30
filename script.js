// ==========================================================================
// 1. KREDENSIAL LOGIN & KONSTANTA DEFAULT (BLACK & WHITE THEME)
// ==========================================================================
const DEV_USER = "leoly";
const DEV_PASS = "dev123";

const DEFAULT_PROJECT_IMG = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600";
const DEFAULT_SHOP_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";

const DEFAULT_AVATAR_IMG = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
const DEFAULT_BANNER_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";

// ==========================================================================
// 2. MANAGEMENT STATE & PERSISTENCE LOCALSTORAGE
// ==========================================================================
let currentUserRole = localStorage.getItem('userRole') || "guest"; 

let profileData = JSON.parse(localStorage.getItem('leoly_profile')) || {
    name: "Leoly.dev",
    tag: "Mobile-Based Developer",
    bio: "Fokus membangun antarmuka web interaktif yang bersih, minimalis, dan nyaman dipandang dengan optimasi kode modern.",
    avatar: "", 
    banner: ""  
};

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

let messagesData = JSON.parse(localStorage.getItem('leoly_messages')) || [
    {
        contact: "HDFv_Member#001",
        subject: "Akses Server Terkunci",
        message: "Halo admin Leoly, saya tidak bisa mengakses dashboard info server utama HDFv sejak tadi pagi. Mohon bantuannya."
    }
];

// ==========================================================================
// 3. TOAST NOTIFICATION SYSTEM
// ==========================================================================
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

// ==========================================================================
// 4. SELEKSI ELEMEN DOM
// ==========================================================================
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

const helpForm = document.getElementById('help-form');
const adminMessagesList = document.getElementById('admin-messages-list');
const btnClearMessages = document.getElementById('btn-clear-messages');

// Profile DOM Elements
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name');
const profileTagInput = document.getElementById('profile-tag');
const profileBioInput = document.getElementById('profile-bio');
const profileAvatarInput = document.getElementById('profile-avatar-url');
const profileBannerInput = document.getElementById('profile-banner-url');

const displayName = document.getElementById('display-name');
const displayTag = document.getElementById('display-tag');
const displayBio = document.getElementById('display-bio');
const displayAvatar = document.getElementById('display-avatar');
const displayBanner = document.getElementById('display-banner');

// ==========================================================================
// 5. SISTEM KENDALI SIDEBAR & NAVIGASI
// ==========================================================================
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

// ROUTING SPA (Single Page Application)
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

// ==========================================================================
// 6. SISTEM AUTHENTIKASI DEVELOPER (SIGN IN / OUT)
// ==========================================================================
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

// ==========================================================================
// 7. OPERASI CRUD (CREATE, READ, DELETE) & CLEAR FITUR
// ==========================================================================

// Menghapus data Project
function deleteProject(index) {
    if(confirm("Hapus project ini dari showcase?")) {
        projectsData.splice(index, 1);
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        renderHubContent();
        showToast("Project berhasil dihapus", "info");
    }
}

// Menghapus data Produk Shop
function deleteShopItem(index) {
    if(confirm("Hapus produk ini dari toko?")) {
        shopData.splice(index, 1);
        localStorage.setItem('leoly_shop', JSON.stringify(shopData));
        renderHubContent();
        showToast("Produk berhasil dihapus", "info");
    }
}

// Menghapus satu tiket satuan (Selesai)
function deleteMessage(index) {
    if(confirm("Tandai tiket ini sebagai SELESAI?")) {
        messagesData.splice(index, 1);
        localStorage.setItem('leoly_messages', JSON.stringify(messagesData));
        renderHubContent();
        showToast("Tiket aduan berhasil dihapus.", "success");
    }
}

// Bersihkan Semua Tiket Sekaligus (Fitur Baru)
function clearAllMessages() {
    if (messagesData.length === 0) {
        showToast("Kotak masuk sudah bersih!", "info");
        return;
    }
    
    if (confirm("⚠️ PERINGATAN: Apakah kamu yakin ingin membersihkan dan menghapus SEMUA tiket masuk secara permanen?")) {
        messagesData = []; 
        localStorage.setItem('leoly_messages', JSON.stringify(messagesData)); 
        renderHubContent(); 
        showToast("🧹 Seluruh tiket bantuan berhasil dibersihkan!", "success");
    }
}

// Form kirim tiket bantuan (Public)
helpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const contactInput = document.getElementById('help-email');
    const subjectInput = document.getElementById('help-subject');
    const messageInput = document.getElementById('help-message');

    messagesData.push({
        contact: contactInput.value.trim(),
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim()
    });

    localStorage.setItem('leoly_messages', JSON.stringify(messagesData));
    showToast("Tiket bantuan terkirim! Developer akan segera memproses.");
    
    helpForm.reset();
    renderHubContent();
    document.querySelector('[data-target="beranda-view"]').click();
});

// Form tambah konten baru (Project / Shop)
formTarget.addEventListener('change', () => {
    if (formTarget.value === 'shop') {
        priceGroup.style.display = 'block';
    } else {
        priceGroup.style.display = 'none';
    }
});

contentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('content-title');
    const descInput = document.getElementById('content-desc');
    const imgInput = document.getElementById('content-image');
    const priceInput = document.getElementById('content-price');

    if (formTarget.value === 'project') {
        projectsData.push({
            title: titleInput.value.trim(),
            desc: descInput.value.trim(),
            image: imgInput.value.trim()
        });
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        showToast("Showcase project berhasil ditambahkan!");
        document.querySelector('[data-target="project-view"]').click();
    } else {
        shopData.push({
            title: titleInput.value.trim(),
            desc: descInput.value.trim(),
            price: priceInput.value.trim() || "Free",
            image: imgInput.value.trim()
        });
        localStorage.setItem('leoly_shop', JSON.stringify(shopData));
        showToast("Item produk baru berhasil dipajang!");
        document.querySelector('[data-target="shop-view"]').click();
    }

    renderHubContent();
    contentForm.reset();
    priceGroup.style.display = 'none';
});

// ==========================================================================
// 8. UPDATE DATA PROFIL & REAL-TIME MANIPULASI DOM (FIXED URL)
// ==========================================================================
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Tarik nilai langsung saat event submit dipicu
    const inputNama = profileNameInput.value.trim();
    const inputTag = profileTagInput.value.trim();
    const inputBio = profileBioInput.value.trim();
    const inputAvatar = profileAvatarInput.value.trim(); 
    const inputBanner = profileBannerInput.value.trim(); 
    
    // Tulis ke dalam database object state
    profileData.name = inputNama;
    profileData.tag = inputTag;
    profileData.bio = inputBio;
    profileData.avatar = inputAvatar; 
    profileData.banner = inputBanner; 
    
    // Kunci langsung ke dalam LocalStorage
    localStorage.setItem('leoly_profile', JSON.stringify(profileData));
    
    // Force Direct Inject DOM untuk menghindari delay/cache browser mobile
    displayName.textContent = inputNama;
    displayTag.textContent = inputTag;
    displayBio.textContent = inputBio;
    
    if (inputAvatar !== "") {
        displayAvatar.src = inputAvatar;
    } else {
        displayAvatar.src = DEFAULT_AVATAR_IMG;
    }
    
    if (inputBanner !== "") {
        displayBanner.style.backgroundImage = `url('${inputBanner}')`;
    } else {
        displayBanner.style.backgroundImage = `url('${DEFAULT_BANNER_IMG}')`;
    }
    
    renderHubContent();
    showToast("Profil dan aset visual berhasil diperbarui!");
    document.querySelector('[data-target="beranda-view"]').click();
});

// ==========================================================================
// 9. FUNGSIONAL RENDER SEKALIGUS REFRESH ANTARMUKA
// ==========================================================================
function renderHubContent() {
    // Render Profil Utama
    displayName.textContent = profileData.name;
    displayTag.textContent = profileData.tag;
    displayBio.textContent = profileData.bio;
    
    if (profileData.avatar && profileData.avatar.trim() !== "") {
        displayAvatar.src = profileData.avatar;
    } else {
        displayAvatar.src = DEFAULT_AVATAR_IMG;
    }
    displayAvatar.onerror = function() { this.src = DEFAULT_AVATAR_IMG; };
    
    if (profileData.banner && profileData.banner.trim() !== "") {
        displayBanner.style.backgroundImage = `url('${profileData.banner}')`;
    } else {
        displayBanner.style.backgroundImage = `url('${DEFAULT_BANNER_IMG}')`;
    }

    // Kembalikan isi data objek ke input control di panel admin agar tidak kosong
    profileNameInput.value = profileData.name;
    profileTagInput.value = profileData.tag;
    profileBioInput.value = profileData.bio;
    profileAvatarInput.value = profileData.avatar;
    profileBannerInput.value = profileData.banner;

    // Sinkronisasi Data Statistik Angka Dashboard
    if (document.getElementById('count-projects')) {
        document.getElementById('count-projects').textContent = projectsData.length;
        document.getElementById('count-shop').textContent = shopData.length;
        document.getElementById('count-messages').textContent = messagesData.length;
    }

    // Sinkronisasi Visual Keaktifan Tombol Clear Tiket
    if (btnClearMessages) {
        if (messagesData.length === 0) {
            btnClearMessages.style.opacity = "0.5";
            btnClearMessages.style.cursor = "not-allowed";
        } else {
            btnClearMessages.style.opacity = "1";
            btnClearMessages.style.cursor = "pointer";
        }
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

    // Render Data Baris Tabel Inbox Help Center
    adminMessagesList.innerHTML = '';
    if (messagesData.length === 0) {
        adminMessagesList.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">Kotak masuk kosong. Tidak ada tiket bantuan aktif.</td></tr>`;
    } else {
        messagesData.forEach((msg, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="msg-contact">${msg.cont
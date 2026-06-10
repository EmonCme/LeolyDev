// ==========================================================================
// LEOLY HUB - MAIN SCRIPT (DENGAN HALAMAN ADMIN TERPISAH)
// ==========================================================================
const WHATSAPP_NUMBER = "6285198224557";
const DEV_USER = "leoly";
const DEV_PASS = "dev123";
const DEFAULT_QRIS_PLACEHOLDER = "https://placehold.co/400x400/1a1a1e/ffffff?text=QRIS+Code";

// ==================== KONFIGURASI GOOGLE OAUTH ====================
const GOOGLE_CLIENT_ID = "1038063988056-i4dt7uua594mqigkhiejuld3aqb12gl9.apps.googleusercontent.com";
const ALLOWED_GOOGLE_EMAILS = [
    "emonleoly@gmail.com",
    // Tambahkan email admin lain di sini
];

let isAdminMode = false;
let currentUser = null;
let profileData = {};
let projectsData = [];
let shopData = [];
let donationsData = [];
let messagesData = [];
let qrisImageUrl = "";
let uploadedFiles = [];

const profileLoginBtn = document.getElementById('profileLoginBtn');
const roleIndicator = document.getElementById('role-indicator');

const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
const loginMenuItem = document.querySelector('.login-menu-item');
const logoutMenuItem = document.querySelector('.logout-menu-item');

// ==================== LOGIN MANAGEMENT ====================
function loadSavedLogin() {
    const savedUser = sessionStorage.getItem('leoly_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isAdminMode = currentUser.isAdmin === true;
            sessionStorage.setItem('leoly_isAdmin', isAdminMode ? 'true' : 'false');
        } catch(e) { console.error(e); }
    } else {
        isAdminMode = false;
        currentUser = null;
        sessionStorage.setItem('leoly_isAdmin', 'false');
    }
}

function saveUserLogin(name, email, isAdmin) {
    currentUser = { name, email, isAdmin };
    sessionStorage.setItem('leoly_user', JSON.stringify(currentUser));
    sessionStorage.setItem('leoly_isAdmin', isAdmin ? 'true' : 'false');
    isAdminMode = isAdmin;
}

function clearUserLogin() {
    currentUser = null;
    isAdminMode = false;
    sessionStorage.removeItem('leoly_user');
    sessionStorage.setItem('leoly_isAdmin', 'false');
}

// ==================== DOMContentLoaded ====================
document.addEventListener("DOMContentLoaded", async () => {
    loadSavedLogin();
    initNavigationSystem();
    initModalVerification();
    initGoogleLogin();
    initSidebarButtons();
    
    // Load data dari API
    await loadAllData();
    
    initFormHandlers();
    initQrisDownload();
    initFileManager();
    initQuickActions();
    updateLoginButtonStyle();
    updateRoleDisplay();
    renderUserProfile();
    toggleNavElements();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('fade-out');
    }, 800);
    initFloatingBottomNav();
    
    setTimeout(() => {
        updateFloatingNavVisibility();
    }, 100);
});

// ==================== GOOGLE LOGIN ====================
function initGoogleLogin() {
    if (typeof google === 'undefined' || !google.accounts) {
        console.warn("Google Identity Services belum dimuat, mencoba lagi dalam 500ms...");
        setTimeout(initGoogleLogin, 500);
        return;
    }
    
    console.log("Initializing Google Login with client ID:", GOOGLE_CLIENT_ID);
    
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
            try {
                const credential = response.credential;
                const payload = JSON.parse(atob(credential.split('.')[1]));
                const email = payload.email;
                const userName = payload.name || email.split('@')[0];
                const isAdmin = ALLOWED_GOOGLE_EMAILS.includes(email);
                
                console.log("Google login success:", { email, userName, isAdmin });
                
                saveUserLogin(userName, email, isAdmin);
                syncInterfaceRender();
                
                const modal = document.getElementById('loginModal');
                if (modal) modal.classList.remove('active');
                
                if (isAdmin) {
                    showNotification('Admin Access', `Selamat datang, ${userName}! Anda login sebagai ADMIN.`, 'success');
                } else {
                    showNotification('Login Berhasil', `Halo ${userName}! Anda login sebagai Guest.`, 'success');
                    setTimeout(() => {
                        showNotification('Info', 'Anda tidak memiliki akses ke Admin Panel.', 'info');
                    }, 1500);
                }
            } catch (err) {
                console.error("Google login error:", err);
                showNotification('Error', 'Gagal login dengan Google', 'error');
            }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
    });
    
    // Tombol Google Login
    const googleBtn = document.querySelector('.btn.google');
    if (googleBtn) {
        // Hapus event listener lama
        const newGoogleBtn = googleBtn.cloneNode(true);
        googleBtn.parentNode.replaceChild(newGoogleBtn, googleBtn);
        
        newGoogleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Google button clicked, showing prompt...");
            google.accounts.id.prompt();
        });
    }
    
    // Cek apakah user sudah login sebelumnya (One Tap)
    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
        }
        if (notification.isSkippedMoment()) {
            console.log("One Tap skipped:", notification.getSkippedReason());
        }
    });
}

// ==================== UI UPDATE FUNCTIONS ====================
function updateRoleDisplay() {
    if (roleIndicator) {
        if (currentUser) {
            if (isAdminMode) {
                roleIndicator.textContent = `Admin: ${currentUser.name}`;
                roleIndicator.className = "role-badge admin";
            } else {
                roleIndicator.textContent = `Guest: ${currentUser.name}`;
                roleIndicator.className = "role-badge guest";
            }
        } else {
            roleIndicator.textContent = "Guest";
            roleIndicator.className = "role-badge guest";
        }
    }
}

function updateLoginButtonStyle() {
    if (profileLoginBtn) {
        if (currentUser) {
            if (isAdminMode) {
                profileLoginBtn.classList.add('logged-in');
                profileLoginBtn.innerHTML = '<i data-lucide="shield-check" style="width: 20px; height: 20px;"></i>';
                profileLoginBtn.title = `Admin: ${currentUser.name}`;
            } else {
                profileLoginBtn.classList.add('logged-in');
                profileLoginBtn.innerHTML = '<i data-lucide="user-check" style="width: 20px; height: 20px;"></i>';
                profileLoginBtn.title = `Guest: ${currentUser.name}`;
            }
        } else {
            profileLoginBtn.classList.remove('logged-in');
            profileLoginBtn.innerHTML = '<i data-lucide="user-circle" style="width: 20px; height: 20px;"></i>';
            profileLoginBtn.title = "Login";
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function logoutUser() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        clearUserLogin();
        syncInterfaceRender();
        switchSection('home');
        showNotification('Logged Out', 'Anda telah logout.', 'success');
    }
}

function initSidebarButtons() {
    if (sidebarLoginBtn) {
        sidebarLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('loginModal');
            if (modal) modal.classList.add('active');
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    }
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
}

function renderUserProfile() {
    const profileNameEl = document.getElementById('profile-name');
    const profileEmailEl = document.getElementById('profile-email');
    const profileBadge = document.getElementById('profile-badge');
    const profileTagsContainer = document.getElementById('profile-tags');
    const profileAvatar = document.getElementById('profile-avatar');
    const logoutBtnProfile = document.getElementById('logout-from-profile');

    if (!profileNameEl) return;

    if (currentUser) {
        profileNameEl.textContent = currentUser.name;
        profileEmailEl.innerHTML = `<i data-lucide="mail" style="width: 14px; height: 14px; display: inline; margin-right: 6px;"></i> ${escapeHtml(currentUser.email)}`;
        if (isAdminMode) {
            profileBadge.innerHTML = '<i data-lucide="shield-check"></i>';
            profileBadge.title = 'Administrator';
        } else {
            profileBadge.innerHTML = '<i data-lucide="user"></i>';
            profileBadge.title = 'Guest User';
        }
        profileTagsContainer.innerHTML = '';
        const roleTag = document.createElement('span');
        roleTag.className = 'tag';
        roleTag.textContent = isAdminMode ? 'Administrator' : 'Guest Member';
        profileTagsContainer.appendChild(roleTag);
        if (currentUser.email && (currentUser.email.includes('gmail') || currentUser.email.includes('google'))) {
            const providerTag = document.createElement('span');
            providerTag.className = 'tag';
            providerTag.textContent = 'Google Login';
            profileTagsContainer.appendChild(providerTag);
        } else if (currentUser.email === 'manual@local.dev') {
            const providerTag = document.createElement('span');
            providerTag.className = 'tag';
            providerTag.textContent = 'Manual Login';
            profileTagsContainer.appendChild(providerTag);
        }
        if (isAdminMode) {
            profileAvatar.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150';
        } else {
            profileAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';
        }
    } else {
        profileNameEl.textContent = 'Tidak login';
        profileEmailEl.textContent = 'Silakan login terlebih dahulu';
        profileAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';
    }

    if (logoutBtnProfile) {
        logoutBtnProfile.addEventListener('click', logoutUser);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleNavElements() {
    const adminNavItem = document.querySelector('.admin-only');
    
    if (currentUser) {
        if (loginMenuItem) loginMenuItem.style.display = 'none';
        if (logoutMenuItem) logoutMenuItem.style.display = 'block';
        if (adminNavItem && isAdminMode) adminNavItem.style.display = 'block';
        else if (adminNavItem) adminNavItem.style.display = 'none';
    } else {
        if (loginMenuItem) loginMenuItem.style.display = 'block';
        if (logoutMenuItem) logoutMenuItem.style.display = 'none';
        if (adminNavItem) adminNavItem.style.display = 'none';
    }
}

// ==================== DATA LOADING ====================
async function loadAllData() {
    try {
        const [profile, projects, shop, donations, messages, qris] = await Promise.all([
            fetch('api.php?action=getProfile').then(r => r.json()),
            fetch('api.php?action=getProjects').then(r => r.json()),
            fetch('api.php?action=getShop').then(r => r.json()),
            fetch('api.php?action=getDonations').then(r => r.json()),
            fetch('api.php?action=getMessages').then(r => r.json()),
            fetch('api.php?action=getQris').then(r => r.json())
        ]);
        profileData = profile;
        projectsData = projects;
        shopData = shop;
        donationsData = donations;
        messagesData = messages;
        qrisImageUrl = qris.qris_image || '';
        const qrisImg = document.getElementById('qris-image');
        if (qrisImg) qrisImg.src = qrisImageUrl || DEFAULT_QRIS_PLACEHOLDER;
        const qrisPreview = document.getElementById('qris-preview-img');
        if (qrisPreview) qrisPreview.src = qrisImageUrl || DEFAULT_QRIS_PLACEHOLDER;
        syncInterfaceRender();
    } catch (err) {
        console.error("Error loading data:", err);
        showNotification('Error', 'Gagal memuat data dari server', 'error');
        setupFallbackData();
        syncInterfaceRender();
    }
}

function setupFallbackData() {
    profileData = { name: "Leoly Hub", bio: "Front-end web engineer & Roblox Studio builder.", tags: "Roblox, HTML/CSS, JavaScript", avatar: "", banner: "" };
    projectsData = [];
    shopData = [];
    donationsData = [];
    messagesData = [];
    qrisImageUrl = "";
}

// ==================== SYNC INTERFACE RENDER ====================
function syncInterfaceRender() {
    const nameEl = document.getElementById('display-name');
    const bioEl = document.getElementById('display-bio');
    const avatarEl = document.getElementById('display-avatar');
    const bannerEl = document.getElementById('display-banner');
    if (nameEl) nameEl.textContent = profileData?.name || "Leoly Hub";
    if (bioEl) bioEl.textContent = profileData?.bio || "";
    if (avatarEl) avatarEl.src = profileData?.avatar && profileData.avatar !== '' ? profileData.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
    if (bannerEl) bannerEl.src = profileData?.banner && profileData.banner !== '' ? profileData.banner : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";
    const tagsWrapper = document.getElementById('display-tags');
    if (tagsWrapper && profileData?.tags) {
        tagsWrapper.innerHTML = '';
        let tagsArray = profileData.tags;
        if (typeof tagsArray === 'string') tagsArray = tagsArray.split(',').map(t => t.trim());
        if (Array.isArray(tagsArray)) {
            tagsArray.forEach(t => {
                if (t && t.trim()) {
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = t.trim();
                    tagsWrapper.appendChild(span);
                }
            });
        }
    }
    const projectsCount = document.getElementById('stat-projects-count');
    const shopCount = document.getElementById('stat-shop-count');
    const donationsCount = document.getElementById('stat-donations-count');
    if (projectsCount) projectsCount.textContent = projectsData?.length || 0;
    if (shopCount) shopCount.textContent = shopData?.length || 0;
    if (donationsCount) donationsCount.textContent = donationsData?.length || 0;
    renderProjects();
    renderShop();
    renderDonationFeed();
    renderMessagesTable();
    renderAdminLists();
    updateLoginButtonStyle();
    updateRoleDisplay();
    renderUserProfile();
    toggleNavElements();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    updateFloatingNavVisibility();
}

// ==================== UPDATE FLOATING NAV VISIBILITY ====================
function updateFloatingNavVisibility() {
    const bottomNav = document.getElementById('floatingBottomNav');
    if (!bottomNav) return;
    
    if (!isAdminMode || !currentUser) {
        bottomNav.classList.remove('show');
        return;
    }
    
    const activeSections = document.querySelectorAll('.content-section.active-section');
    let isOnAdminPage = false;
    
    activeSections.forEach(section => {
        const sectionId = section.id;
        if (sectionId === 'admin-dashboard-section' ||
            sectionId === 'admin-profile-section' ||
            sectionId === 'admin-projects-section' ||
            sectionId === 'admin-shop-section' ||
            sectionId === 'admin-files-section' ||
            sectionId === 'admin-messages-section') {
            isOnAdminPage = true;
        }
    });
    
    if (isOnAdminPage) {
        bottomNav.classList.add('show');
        bottomNav.classList.remove('hide');
    } else {
        bottomNav.classList.remove('show');
    }
}

// ==================== RENDER FUNCTIONS ====================
function renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    container.innerHTML = '';
    if (!projectsData || projectsData.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">Belum ada project. Login sebagai admin untuk menambahkan.</div>';
        return;
    }
    projectsData.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'dev-card';
        const imgSrc = proj.img && proj.img !== '' ? proj.img : 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600';
        card.innerHTML = `
            <div class="card-media"><img src="${imgSrc}" alt="Project" onerror="this.src='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600'"></div>
            <div class="card-body">
                <h3>${escapeHtml(proj.title)}</h3>
                <p>${escapeHtml(proj.desc || proj.description)}</p>
                <div class="card-footer">
                    <a href="${proj.link || '#'}" class="btn btn-secondary" target="_blank"><i data-lucide="external-link"></i> View Source</a>
                    ${isAdminMode ? `<button class="btn-danger-action" data-action="delete-project" data-id="${proj.id}">Hapus</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    attachDeleteEvents();
}

function renderShop() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = '';
    if (!shopData || shopData.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">Belum ada produk. Login sebagai admin untuk menambahkan.</div>';
        return;
    }
    shopData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'dev-card';
        const imgSrc = item.img && item.img !== '' ? item.img : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600';
        card.innerHTML = `
            <div class="card-media"><img src="${imgSrc}" alt="Product" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'"></div>
            <div class="card-body">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.desc || item.description)}</p>
                <div class="card-footer">
                    <span class="card-price">Rp ${Number(item.price).toLocaleString('id-ID')}</span>
                    <button class="btn btn-primary" data-action="buy-item" data-title="${escapeHtml(item.title)}" data-price="${item.price}"><i data-lucide="shopping-cart"></i> Buy</button>
                    ${isAdminMode ? `<button class="btn-danger-action" data-action="delete-shop" data-id="${item.id}">Hapus</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    attachBuyEvents();
    attachDeleteEvents();
}

function renderDonationFeed() {
    const container = document.getElementById('donation-feed-list');
    if (!container) return;
    container.innerHTML = '';
    if (!donationsData || donationsData.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-muted)">Belum ada donasi. Jadilah yang pertama!</div>';
        return;
    }
    [...donationsData].reverse().forEach(don => {
        const feedItem = document.createElement('div');
        feedItem.className = 'feed-card';
        feedItem.innerHTML = `
            <div class="feed-top">
                <span class="feed-user"><i data-lucide="user" style="width:14px;height:14px;display:inline;margin-right:4px;vertical-align:middle;"></i>${escapeHtml(don.name)}</span>
                <span class="feed-amount">Rp ${Number(don.amount).toLocaleString('id-ID')}</span>
            </div>
            <div style="background:rgba(255,255,255,0.02);border-left:2px solid var(--accent);padding:0.5rem 0.75rem;margin-top:0.5rem;border-radius:0 6px 6px 0;">
                <p style="color:#d4d4d4;font-size:0.88rem;margin:0;">"${escapeHtml(don.msg || don.message)}"</p>
            </div>
        `;
        container.appendChild(feedItem);
    });
}

function renderMessagesTable() {
    const container = document.getElementById('admin-messages-list');
    if (!container) return;
    container.innerHTML = '';
    if (!messagesData || messagesData.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2.5rem;">Kotak masuk kosong.<tr></tr>`;
        return;
    }
    messagesData.forEach(msg => {
        const row = document.createElement('tr');
        const date = msg.created_at ? new Date(msg.created_at).toLocaleDateString('id-ID') : '-';
        row.innerHTML = `
            <td style="max-width:150px;word-break:break-word;">${escapeHtml(msg.contact)}</td>
            <td style="max-width:150px;word-break:break-word;">${escapeHtml(msg.subject)}</td>
            <td style="max-width:300px;white-space:pre-wrap;">${escapeHtml(msg.message)}</td>
            <td style="min-width:80px;">${date}</td>
            <td><button class="btn-table-action" data-action="delete-message" data-id="${msg.id}">Selesai</button></td>
        `;
        container.appendChild(row);
    });
    attachDeleteEvents();
}

// ==================== ADMIN LISTS RENDER ====================
function renderAdminLists() {
    const projectsList = document.getElementById('admin-projects-list');
    const shopList = document.getElementById('admin-shop-list');
    
    if (projectsList) {
        projectsList.innerHTML = '';
        if (projectsData && projectsData.length > 0) {
            projectsData.forEach(proj => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <div class="list-item-info">
                        <img class="list-item-image" src="${proj.img || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=100'}" onerror="this.src='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=100'">
                        <div class="list-item-details">
                            <div class="list-item-title">${escapeHtml(proj.title)}</div>
                            <div class="list-item-desc">${escapeHtml(proj.desc || proj.description)}</div>
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-danger-action" data-action="delete-project" data-id="${proj.id}">Hapus</button>
                    </div>
                `;
                projectsList.appendChild(item);
            });
        } else {
            projectsList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">Belum ada project. Klik "Add Project" untuk menambahkan.</div>';
        }
    }
    
    if (shopList) {
        shopList.innerHTML = '';
        if (shopData && shopData.length > 0) {
            shopData.forEach(item => {
                const listItem = document.createElement('div');
                listItem.className = 'list-item';
                listItem.innerHTML = `
                    <div class="list-item-info">
                        <img class="list-item-image" src="${item.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100'}" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100'">
                        <div class="list-item-details">
                            <div class="list-item-title">${escapeHtml(item.title)}</div>
                            <div class="list-item-desc">${escapeHtml(item.desc || item.description)}</div>
                        </div>
                        <div class="list-item-price">Rp ${Number(item.price).toLocaleString('id-ID')}</div>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-danger-action" data-action="delete-shop" data-id="${item.id}">Hapus</button>
                    </div>
                `;
                shopList.appendChild(listItem);
            });
        } else {
            shopList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">Belum ada produk. Klik "Add Product" untuk menambahkan.</div>';
        }
    }
    
    // Update admin dashboard stats
    const adminStatProjects = document.getElementById('admin-stat-projects');
    const adminStatShop = document.getElementById('admin-stat-shop');
    const adminStatDonations = document.getElementById('admin-stat-donations');
    const adminStatMessages = document.getElementById('admin-stat-messages');
    const adminNameDisplay = document.getElementById('admin-name-display');
    const adminStorageUsed = document.getElementById('admin-storage-used');
    
    if (adminStatProjects) adminStatProjects.textContent = projectsData?.length || 0;
    if (adminStatShop) adminStatShop.textContent = shopData?.length || 0;
    if (adminStatDonations) adminStatDonations.textContent = donationsData?.length || 0;
    if (adminStatMessages) adminStatMessages.textContent = messagesData?.length || 0;
    if (adminNameDisplay && currentUser) adminNameDisplay.textContent = currentUser.name;
    
    const totalBytes = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    const usedMB = totalBytes / (1024 * 1024);
    if (adminStorageUsed) adminStorageUsed.textContent = usedMB.toFixed(2) + ' MB';
    
    attachDeleteEvents();
}

// ==================== ACTION HANDLERS ====================
function attachDeleteEvents() {
    document.querySelectorAll('[data-action="delete-project"]').forEach(btn => {
        btn.onclick = () => deleteProject(parseInt(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="delete-shop"]').forEach(btn => {
        btn.onclick = () => deleteShopItem(parseInt(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="delete-message"]').forEach(btn => {
        btn.onclick = () => deleteMessage(parseInt(btn.dataset.id));
    });
}

function attachBuyEvents() {
    document.querySelectorAll('[data-action="buy-item"]').forEach(btn => {
        btn.onclick = () => {
            const title = btn.dataset.title;
            const price = parseInt(btn.dataset.price);
            const waText = `Halo Leoly Management, saya tertarik untuk membeli:\n\n• Aset: ${title}\n• Harga: Rp ${price.toLocaleString('id-ID')}`;
            window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`, '_blank');
            showNotification('Order Redirect', 'Menghubungkan ke WhatsApp...', 'success');
        };
    });
}

async function deleteProject(id) {
    if (!confirm('Hapus proyek ini secara permanen?')) return;
    const res = await fetch(`api.php?action=deleteProject&id=${id}`);
    if (res.ok) { showNotification('Deleted', 'Proyek berhasil dihapus', 'success'); await loadAllData(); }
    else showNotification('Error', 'Gagal menghapus', 'error');
}

async function deleteShopItem(id) {
    if (!confirm('Hapus produk ini secara permanen?')) return;
    const res = await fetch(`api.php?action=deleteShop&id=${id}`);
    if (res.ok) { showNotification('Deleted', 'Produk berhasil dihapus', 'success'); await loadAllData(); }
    else showNotification('Error', 'Gagal menghapus', 'error');
}

async function deleteMessage(id) {
    if (!confirm('Hapus pesan ini?')) return;
    const res = await fetch(`api.php?action=deleteMessage&id=${id}`);
    if (res.ok) { showNotification('Selesai', 'Pesan telah dihapus', 'success'); await loadAllData(); }
    else showNotification('Error', 'Gagal menghapus', 'error');
}

// ==================== QUICK ACTIONS ====================
function initQuickActions() {
    const quickBtns = document.querySelectorAll('.quick-action-btn');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.quick;
            switch(action) {
                case 'profile':
                    switchToAdminSection('admin-profile');
                    break;
                case 'projects':
                    switchToAdminSection('admin-projects');
                    break;
                case 'shop':
                    switchToAdminSection('admin-shop');
                    break;
                case 'qris':
                    switchToAdminSection('admin-profile');
                    setTimeout(() => {
                        document.getElementById('admin-qris-form')?.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                    break;
                case 'files':
                    switchToAdminSection('admin-files');
                    break;
            }
        });
    });
}

// ==================== SWITCH TO ADMIN SECTION ====================
function switchToAdminSection(sectionId) {
    if (!isAdminMode) {
        showNotification('Akses Ditolak', 'Anda tidak memiliki akses ke Admin Panel', 'error');
        return;
    }
    
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active-section'));
    
    const sectionMap = {
        'admin-dashboard': 'admin-dashboard-section',
        'admin-profile': 'admin-profile-section',
        'admin-projects': 'admin-projects-section',
        'admin-shop': 'admin-shop-section',
        'admin-files': 'admin-files-section',
        'admin-messages': 'admin-messages-section'
    };
    
    const targetId = sectionMap[sectionId];
    if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active-section');
            window.location.hash = sectionId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            const navItems = document.querySelectorAll('.bottom-nav-item');
            navItems.forEach(item => {
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.dataset.section === 'admin') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            updateFloatingNavVisibility();
            
            if (sectionId === 'admin-projects' || sectionId === 'admin-shop') {
                renderAdminLists();
            }
            if (sectionId === 'admin-messages') {
                renderMessagesTable();
            }
            if (sectionId === 'admin-files') {
                loadUploadedFiles();
            }
        }
    }
}

// ==================== SWITCH SECTION (UMUM) ====================
function switchSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active-section'));
    
    if (sectionId === 'admin') {
        if (isAdminMode && currentUser) {
            const adminDashboard = document.getElementById('admin-dashboard-section');
            if (adminDashboard) {
                adminDashboard.classList.add('active-section');
                window.location.hash = 'admin-dashboard';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                const navItems = document.querySelectorAll('.bottom-nav-item');
                navItems.forEach(item => {
                    if (item.dataset.section === 'admin-dashboard') {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                updateFloatingNavVisibility();
            }
        } else {
            showNotification('Akses Ditolak', 'Anda harus login sebagai Admin terlebih dahulu', 'error');
            const modal = document.getElementById('loginModal');
            if (modal) modal.classList.add('active');
            const homeSection = document.getElementById('home-section');
            if (homeSection) homeSection.classList.add('active-section');
        }
    } else {
        const activeSec = document.getElementById(`${sectionId}-section`);
        if (activeSec) { 
            activeSec.classList.add('active-section'); 
            window.location.hash = sectionId; 
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateFloatingNavVisibility();
        }
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ==================== FORM HANDLERS ====================
function initFormHandlers() {
    const profileForm = document.getElementById('admin-profile-form');
    if (profileForm) {
        const inputName = document.getElementById('input-name');
        const inputBio = document.getElementById('input-bio');
        const inputTags = document.getElementById('input-tags');
        const inputAvatarFile = document.getElementById('input-avatar-file');
        const inputBannerFile = document.getElementById('input-banner-file');
        const avatarPreview = document.getElementById('avatar-preview-img');
        const bannerPreview = document.getElementById('banner-preview-img');
        const clearAvatarBtn = document.getElementById('clear-avatar-btn');
        const clearBannerBtn = document.getElementById('clear-banner-btn');
        const avatarClear = document.getElementById('avatar-clear');
        const bannerClear = document.getElementById('banner-clear');
        const inputAvatar = document.getElementById('input-avatar');
        const inputBanner = document.getElementById('input-banner');
        
        if (inputName) inputName.value = profileData?.name || '';
        if (inputBio) inputBio.value = profileData?.bio || '';
        if (inputTags) inputTags.value = typeof profileData?.tags === 'string' ? profileData.tags : (profileData?.tags || '');
        if (profileData?.avatar && profileData.avatar !== '') {
            if (avatarPreview) avatarPreview.src = profileData.avatar;
            if (inputAvatar) inputAvatar.value = profileData.avatar;
        }
        if (profileData?.banner && profileData.banner !== '') {
            if (bannerPreview) bannerPreview.src = profileData.banner;
            if (inputBanner) inputBanner.value = profileData.banner;
        }
        
        if (inputAvatarFile) {
            inputAvatarFile.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (avatarPreview) avatarPreview.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        if (inputBannerFile) {
            inputBannerFile.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (bannerPreview) bannerPreview.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        if (clearAvatarBtn) {
            clearAvatarBtn.addEventListener('click', function() {
                if (avatarPreview) avatarPreview.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';
                if (inputAvatarFile) inputAvatarFile.value = '';
                if (avatarClear) avatarClear.value = '1';
                if (inputAvatar) inputAvatar.value = '';
                showNotification('Avatar Cleared', 'Avatar akan dihapus saat menyimpan', 'success');
            });
        }
        if (clearBannerBtn) {
            clearBannerBtn.addEventListener('click', function() {
                if (bannerPreview) bannerPreview.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200';
                if (inputBannerFile) inputBannerFile.value = '';
                if (bannerClear) bannerClear.value = '1';
                if (inputBanner) inputBanner.value = '';
                showNotification('Banner Cleared', 'Banner akan dihapus saat menyimpan', 'success');
            });
        }
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('name', inputName?.value || '');
            formData.append('bio', inputBio?.value || '');
            formData.append('tags', inputTags?.value || '');
            formData.append('avatar', inputAvatar?.value || '');
            formData.append('banner', inputBanner?.value || '');
            formData.append('avatar_clear', avatarClear?.value || '0');
            formData.append('banner_clear', bannerClear?.value || '0');
            if (inputAvatarFile?.files[0]) formData.append('avatar_file', inputAvatarFile.files[0]);
            if (inputBannerFile?.files[0]) formData.append('banner_file', inputBannerFile.files[0]);
            const res = await fetch('api.php?action=updateProfile', { method: 'POST', body: formData });
            const result = await res.json();
            if (res.ok && result.success) {
                showNotification('Success', 'Profil berhasil diperbarui', 'success');
                if (avatarClear) avatarClear.value = '0';
                if (bannerClear) bannerClear.value = '0';
                await loadAllData();
            } else {
                showNotification('Error', 'Gagal menyimpan profil', 'error');
            }
        });
    }

    const projectForm = document.getElementById('admin-project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('title', document.getElementById('proj-title')?.value || '');
            formData.append('desc', document.getElementById('proj-desc')?.value || '');
            formData.append('link', document.getElementById('proj-link')?.value || '#');
            const imgFile = document.getElementById('proj-img-file')?.files[0];
            if (imgFile) formData.append('img_file', imgFile);
            const res = await fetch('api.php?action=addProject', { method: 'POST', body: formData });
            if (res.ok) {
                showNotification('Success', 'Project berhasil ditambahkan', 'success');
                projectForm.reset();
                await loadAllData();
            } else {
                showNotification('Error', 'Gagal menambahkan project', 'error');
            }
        });
    }

    const shopForm = document.getElementById('admin-shop-form');
    if (shopForm) {
        shopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('title', document.getElementById('shop-title')?.value || '');
            formData.append('price', document.getElementById('shop-price')?.value || 0);
            formData.append('desc', document.getElementById('shop-desc')?.value || '');
            const imgFile = document.getElementById('shop-img-file')?.files[0];
            if (imgFile) formData.append('img_file', imgFile);
            const res = await fetch('api.php?action=addShop', { method: 'POST', body: formData });
            if (res.ok) {
                showNotification('Success', 'Produk berhasil ditambahkan', 'success');
                shopForm.reset();
                await loadAllData();
            } else {
                showNotification('Error', 'Gagal menambahkan produk', 'error');
            }
        });
    }

    const qrisForm = document.getElementById('admin-qris-form');
    if (qrisForm) {
        const qrisPreview = document.getElementById('qris-preview-img');
        const qrisFileInput = document.getElementById('qris-file');
        if (qrisFileInput) {
            qrisFileInput.addEventListener('change', function(e) {
                if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        if (qrisPreview) qrisPreview.src = ev.target.result;
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
        qrisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('qris-file');
            if (!fileInput?.files[0]) {
                showNotification('Error', 'Pilih file QRIS terlebih dahulu', 'error');
                return;
            }
            const formData = new FormData();
            formData.append('qris_file', fileInput.files[0]);
            const res = await fetch('api.php?action=updateQris', { method: 'POST', body: formData });
            const result = await res.json();
            if (result.success) {
                showNotification('Success', 'QRIS berhasil diperbarui', 'success');
                const qrisImg = document.getElementById('qris-image');
                if (qrisImg) qrisImg.src = result.qris_image + '?t=' + Date.now();
                if (qrisPreview) qrisPreview.src = result.qris_image;
                fileInput.value = '';
                await loadAllData();
            } else {
                showNotification('Error', result.error || 'Gagal upload QRIS', 'error');
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('contact', document.getElementById('contact-identity')?.value || '');
            formData.append('subject', document.getElementById('contact-subject')?.value || '');
            formData.append('message', document.getElementById('contact-message')?.value || '');
            const res = await fetch('api.php?action=addMessage', { method: 'POST', body: formData });
            if (res.ok) { showNotification('Ticket Created', 'Pengaduan terkirim', 'success'); contactForm.reset(); await loadAllData(); }
            else showNotification('Error', 'Gagal mengirim pengaduan', 'error');
        });
    }
}

function initQrisDownload() {
    const downloadBtn = document.getElementById('download-qris-btn');
    const qrisImg = document.getElementById('qris-image');
    if (!downloadBtn || !qrisImg) return;
    const downloadImage = () => {
        let imageUrl = qrisImg.src;
        if (!imageUrl || imageUrl.includes('placehold.co') || imageUrl === DEFAULT_QRIS_PLACEHOLDER) {
            showNotification('Info', 'QRIS belum diupload oleh admin', 'error');
            return;
        }
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                const objectUrl = URL.createObjectURL(blob);
                link.href = objectUrl;
                link.download = 'qris_leolyhub.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(objectUrl);
                showNotification('Download', 'QRIS berhasil diunduh', 'success');
            })
            .catch(() => {
                window.open(imageUrl, '_blank');
                showNotification('Download', 'Klik kanan pada gambar → Simpan gambar', 'success');
            });
    };
    downloadBtn.addEventListener('click', downloadImage);
    qrisImg.addEventListener('click', downloadImage);
}

// ==================== NAVIGATION & MODAL ====================
function initNavigationSystem() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    if (openMenu) {
        openMenu.addEventListener('click', () => { 
            if(sidebar) sidebar.classList.add('active'); 
            if(overlay) overlay.classList.add('active'); 
        });
    }
    if (closeMenu) {
        closeMenu.addEventListener('click', () => { 
            if(sidebar) sidebar.classList.remove('active'); 
            if(overlay) overlay.classList.remove('active'); 
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => { 
            if(sidebar) sidebar.classList.remove('active'); 
            overlay.classList.remove('active'); 
        });
    }
    
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const section = link.dataset.section;
            
            if (section === 'admin') {
                if (isAdminMode && currentUser) {
                    switchToAdminSection('admin-dashboard');
                } else {
                    showNotification('Akses Ditolak', 'Anda harus login sebagai Admin terlebih dahulu', 'error');
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.classList.add('active');
                }
            } else if (section) {
                switchSection(section);
            }
            
            if(sidebar) sidebar.classList.remove('active');
            if(overlay) overlay.classList.remove('active');
        });
    });
    
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('admin-')) {
            if (isAdminMode && currentUser) {
                switchToAdminSection(hash);
            } else {
                switchSection('home');
            }
        } else {
            const target = document.querySelector(`.nav-item[data-section="${hash}"]`);
            if (target) target.click();
        }
    }
}

function initModalVerification() {
    const modal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    if (closeLogin) closeLogin.addEventListener('click', () => { if(modal) modal.classList.remove('active'); });
    if (profileLoginBtn) {
        profileLoginBtn.addEventListener('click', () => {
            if (currentUser) {
                if (isAdminMode) {
                    switchToAdminSection('admin-dashboard');
                } else {
                    switchSection('home');
                }
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                if (sidebar) sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            } else {
                if(modal) modal.classList.add('active');
            }
        });
    }
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username')?.value || '';
            const password = document.getElementById('login-password')?.value || '';
            if (username === DEV_USER && password === DEV_PASS) {
                saveUserLogin(DEV_USER, 'manual@local.dev', true);
                syncInterfaceRender();
                if(modal) modal.classList.remove('active');
                showNotification('Authorized', 'Selamat datang di Control Room!', 'success');
            } else showNotification('Failed', 'Kredensial salah!', 'error');
        });
    }
}

// ==================== UTILITIES ====================
function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }

function showNotification(title, desc, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-wrapper ${type}`;
    toast.innerHTML = `<div class="toast-alert"><div class="toast-content-area"><div class="toast-icon-box">${type === 'error' ? '✕' : '✓'}</div><div><p class="toast-text-title">${escapeHtml(title)}</p><p class="toast-text-desc">${escapeHtml(desc)}</p></div></div><button class="toast-close-btn">✕</button></div>`;
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4500);
}

// ==================== FILE ASSETS MANAGER ====================
async function loadUploadedFiles() {
    try {
        const res = await fetch('api.php?action=getUploadedFiles');
        const files = await res.json();
        uploadedFiles = files;
        renderUploadedFiles();
        updateStorageMetric();
        renderAdminLists();
    } catch (err) {
        console.error('Failed to load files', err);
    }
}

function renderUploadedFiles() {
    const grid = document.getElementById('uploadedFilesGrid');
    if (!grid) return;
    if (!uploadedFiles.length) {
        grid.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-muted)">Belum ada file yang diupload.</div>';
        return;
    }
    grid.innerHTML = '';
    uploadedFiles.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        const ext = file.original_name.split('.').pop().toLowerCase();
        let icon = 'file-text';
        if (['jpg','jpeg','png','gif','webp'].includes(ext)) icon = 'image';
        else if (ext === 'pdf') icon = 'file-text';
        else if (ext === 'zip') icon = 'archive';
        card.innerHTML = `
            <div class="file-details">
                <div class="file-icon"><i data-lucide="${icon}" style="width:18px;height:18px;"></i></div>
                <div class="file-meta">
                    <div class="file-original-name">${escapeHtml(file.original_name)}</div>
                    <div class="file-size">${formatBytes(file.size)}</div>
                </div>
            </div>
            <button class="btn-delete-file" data-id="${file.id}">Hapus</button>
        `;
        grid.appendChild(card);
    });
    document.querySelectorAll('.btn-delete-file').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.dataset.id;
            if (confirm('Hapus file ini secara permanen?')) {
                const res = await fetch(`api.php?action=deleteUploadedFile&id=${id}`);
                if (res.ok) {
                    showNotification('Deleted', 'File berhasil dihapus', 'success');
                    loadUploadedFiles();
                } else {
                    showNotification('Error', 'Gagal menghapus file', 'error');
                }
            }
        });
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateStorageMetric() {
    const totalBytes = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    const limitMB = 100;
    const usedMB = totalBytes / (1024 * 1024);
    const percent = Math.min(100, (usedMB / limitMB) * 100);
    const metricDiv = document.getElementById('storageMetric');
    if (metricDiv) {
        metricDiv.innerHTML = `
            <span>Storage terpakai: ${usedMB.toFixed(2)} MB / ${limitMB} MB</span>
            <div class="progress-bar-container" style="width:120px;"><div class="progress-bar-fill" style="width:${percent}%;"></div></div>
        `;
    }
}

function uploadFiles(fileList) {
    const queueContainer = document.getElementById('uploadQueue');
    Array.from(fileList).forEach(file => {
        const queueItem = document.createElement('div');
        queueItem.className = 'upload-queue-item';
        queueItem.innerHTML = `
            <div class="file-info">
                <span class="file-name">${escapeHtml(file.name)}</span>
                <span class="file-size">${formatBytes(file.size)}</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill" style="width:0%"></div></div>
            <div class="upload-status">Mengupload...</div>
        `;
        queueContainer.appendChild(queueItem);
        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'api.php?action=uploadFile', true);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                const fill = queueItem.querySelector('.progress-bar-fill');
                if (fill) fill.style.width = percent + '%';
            }
        };
        xhr.onload = () => {
            try {
                const resp = JSON.parse(xhr.responseText);
                if (resp.success) {
                    queueItem.querySelector('.upload-status').innerHTML = '✅ Selesai';
                    setTimeout(() => queueItem.remove(), 1500);
                    loadUploadedFiles();
                } else {
                    queueItem.querySelector('.upload-status').innerHTML = '❌ Gagal: ' + resp.error;
                }
            } catch(e) {
                queueItem.querySelector('.upload-status').innerHTML = '❌ Error upload';
            }
        };
        xhr.onerror = () => {
            queueItem.querySelector('.upload-status').innerHTML = '❌ Network error';
        };
        xhr.send(formData);
    });
}

function initFileManager() {
    const dropzone = document.getElementById('globalDropzone');
    const fileInput = document.getElementById('globalFileInput');
    if (!dropzone || !fileInput) return;
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length) uploadFiles(files);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) uploadFiles(e.target.files);
        fileInput.value = '';
    });
    loadUploadedFiles();
}

// ==================== FLOATING BOTTOM NAVIGATION ====================
let lastScrollY = 0;
let scrollTimeout;

function initFloatingBottomNav() {
    const bottomNav = document.getElementById('floatingBottomNav');
    if (!bottomNav) return;
    
    const handleScroll = () => {
        if (!bottomNav.classList.contains('show')) return;
        
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            bottomNav.classList.add('hide');
        } else {
            bottomNav.classList.remove('hide');
        }
        lastScrollY = currentScrollY;
        
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (bottomNav.classList.contains('show')) {
                bottomNav.classList.remove('hide');
            }
        }, 2000);
    };
    
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        item.removeEventListener('click', item._listener);
        const listener = () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            const section = item.dataset.section;
            switchToAdminSection(section);
        };
        item._listener = listener;
        item.addEventListener('click', listener);
    });
    
    window.addEventListener('scroll', handleScroll);
    updateFloatingNavVisibility();
}
// ==========================================================================
// 1. KREDENSIAL DEVELOPER ACCOUNT & KONSTANTA GAMBAR ASSET
// ==========================================================================
const DEV_USER = "leoly";
const DEV_PASS = "dev123";
const WHATSAPP_NUMBER = "6285198224557"; 

// Menggunakan endpoint Cloudflare Worker resmi milik kamu
const API_URL = "https://leoly.leoly.workers.dev"; 

const DEFAULT_PROJECT_IMG = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600";
const DEFAULT_SHOP_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";
const DEFAULT_AVATAR_IMG = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
const DEFAULT_BANNER_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";

// State Data Global
let profileData = {};
let projectsData = [];
let shopData = [];
let donationsData = [
    { name: "Sponsor Utama", amount: 50000, msg: "Terus kembangkan sistem info dashboard Leoly!" }
];
let messagesData = [];
let isAdminMode = sessionStorage.getItem('leoly_isAdmin') === 'true';

// ==========================================================================
// 2. INITIALIZER ENGINE (KONEKSI CLOUDFLARE D1 NETWORK)
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    initNavigationSystem();
    initModalVerification();
    
    // Tarik data langsung dari Cloudflare D1 Database secara parallel
    await loadAllDataFromCloudflare();
    
    initFormHandlers();
    lucide.createIcons();
});

async function loadAllDataFromCloudflare() {
    try {
        const [profileRes, projectsRes, shopRes, messagesRes] = await Promise.all([
            fetch(`${API_URL}/api/profile`).then(res => res.ok ? res.json() : {}),
            fetch(`${API_URL}/api/projects`).then(res => res.ok ? res.json() : []),
            fetch(`${API_URL}/api/shop`).then(res => res.ok ? res.json() : []),
            fetch(`${API_URL}/api/messages`).then(res => res.ok ? res.json() : [])
        ]);

        profileData = (profileRes && profileRes.name) ? profileRes : {
            name: "Leoly Dev Platform",
            bio: "Front-end web engineer & Roblox Studio builder.",
            tags: "Roblox, HTML/CSS, Acode Mobile, MT Manager",
            avatar: DEFAULT_AVATAR_IMG,
            banner: DEFAULT_BANNER_IMG
        };

        if (typeof profileData.tags === 'string') {
            profileData.tags = profileData.tags.split(',').map(t => t.trim());
        }

        projectsData = Array.isArray(projectsRes) ? projectsRes : [];
        shopData = Array.isArray(shopRes) ? shopRes : [];
        messagesData = Array.isArray(messagesRes) ? messagesRes : [];

        syncInterfaceRender();
    } catch (err) {
        console.error("Gagal memuat data dari Cloudflare D1:", err);
        showNotification('Database Offline', 'Gagal memuat data cloud. Pastikan CORS dan DB terikat.', 'error');
    }
}

// ==========================================================================
// 3. RENDERER ENGINE & DYNAMIC COMPONENT SYNC
// ==========================================================================
function syncInterfaceRender() {
    document.getElementById('display-name').textContent = profileData.name || "Leoly Hub";
    document.getElementById('display-bio').textContent = profileData.bio || "";
    document.getElementById('display-avatar').src = profileData.avatar || DEFAULT_AVATAR_IMG;
    document.getElementById('display-banner').src = profileData.banner || DEFAULT_BANNER_IMG;
    
    const tagsWrapper = document.getElementById('display-tags');
    if (tagsWrapper && profileData.tags) {
        tagsWrapper.innerHTML = '';
        profileData.tags.forEach(t => {
            if(t.trim()) {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = t.trim();
                tagsWrapper.appendChild(span);
            }
        });
    }

    document.getElementById('stat-projects-count').textContent = projectsData.length;
    document.getElementById('stat-shop-count').textContent = shopData.length;
    document.getElementById('stat-donations-count').textContent = donationsData.length;

    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projectsContainer.innerHTML = '';
        projectsData.forEach((proj) => {
            const card = document.createElement('div');
            card.className = 'dev-card';
            card.innerHTML = `
                <div class="card-media">
                    <img src="${proj.img || DEFAULT_PROJECT_IMG}" alt="Project">
                </div>
                <div class="card-body">
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                    <div class="card-footer" style="position: relative; width: 100%;">
                        <a href="${proj.link || '#'}" class="btn btn-secondary" target="_blank"><i data-lucide=\"external-link\"></i> View Source</a>
                        ${isAdminMode ? `<button class="btn-danger-action" onclick="deleteProject(${proj.id})">Hapus</button>` : ''}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    const shopContainer = document.getElementById('shop-container');
    if (shopContainer) {
        shopContainer.innerHTML = '';
        shopData.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'dev-card';
            card.innerHTML = `
                <div class="card-media">
                    <img src="${item.img || DEFAULT_SHOP_IMG}" alt="Product">
                </div>
                <div class="card-body">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <div class="card-footer" style="position: relative; width: 100%;">
                        <span class="card-price">Rp ${Number(item.price).toLocaleString('id-ID')}</span>
                        <button class="btn btn-primary" onclick="triggerPurchase('${item.title}', ${item.price})"><i data-lucide=\"shopping-cart\"></i> Buy</button>
                        ${isAdminMode ? `<button class="btn-danger-action" onclick="deleteShopItem(${item.id})" style="bottom: -2px; right: 75px;">Hapus</button>` : ''}
                    </div>
                </div>
            `;
            shopContainer.appendChild(card);
        });
    }

    const donationFeedList = document.getElementById('donation-feed-list');
    if (donationFeedList) {
        donationFeedList.innerHTML = '';
        donationsData.forEach((don) => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-card';
            feedItem.innerHTML = `
                <div class="feed-top">
                    <span class="feed-user"><i data-lucide=\"user\" style=\"width:14px; height:14px; display:inline; margin-right:4px; vertical-align:middle;\"></i>${don.name}</span>
                    <span class="feed-amount">Rp ${Number(don.amount).toLocaleString('id-ID')}</span>
                </div>
                <div style="background: rgba(255,255,255,0.02); border-left: 2px solid var(--accent); padding: 0.5rem 0.75rem; margin-top: 0.5rem; border-radius: 0 6px 6px 0;">
                    <p style="color: #d4d4d4; font-size: 0.88rem; margin: 0;">"${don.msg}"</p>
                </div>
            `;
            donationFeedList.appendChild(feedItem);
        });
    }

    const adminMessagesList = document.getElementById('admin-messages-list');
    if (adminMessagesList) {
        adminMessagesList.innerHTML = '';
        if (messagesData.length === 0) {
            adminMessagesList.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2.5rem;">Kotak masuk kosong.</td></tr>`;
        } else {
            messagesData.forEach((msg) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${msg.contact}</td><td>${msg.subject}</td><td style="max-width: 300px; white-space: pre-wrap;">${msg.message}</td><td><button class="btn-table-action" onclick="deleteMessage(${msg.id})">Selesai</button></td>`;
                adminMessagesList.appendChild(row);
            });
        }
    }
    
    toggleAdminElementsVisibility();
    lucide.createIcons();
}

function toggleAdminElementsVisibility() {
    const roleIndicator = document.getElementById('role-indicator');
    const adminTabLink = document.querySelector('.admin-only');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isAdminMode) {
        if (roleIndicator) { roleIndicator.textContent = "Owner Authorized"; roleIndicator.className = "role-badge admin"; }
        if (adminTabLink) adminTabLink.style.display = "block";
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "flex";
    } else {
        if (roleIndicator) { roleIndicator.textContent = "Guest Mode"; roleIndicator.className = "role-badge guest"; }
        if (adminTabLink) adminTabLink.style.display = "none";
        if (loginBtn) loginBtn.style.display = "flex";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (window.location.hash === '#admin') switchSection('home');
    }
}

// ==========================================================================
// 4. FORM HANDLERS (PUSH DATA BARU KE SERVER CLOUDFLARE)
// ==========================================================================
function initFormHandlers() {
    const profileForm = document.getElementById('admin-profile-form');
    if (profileForm) {
        document.getElementById('input-name').value = profileData.name || '';
        document.getElementById('input-bio').value = profileData.bio || '';
        document.getElementById('input-tags').value = profileData.tags ? profileData.tags.join(', ') : '';
        document.getElementById('input-avatar').value = profileData.avatar === DEFAULT_AVATAR_IMG ? '' : profileData.avatar;
        document.getElementById('input-banner').value = profileData.banner === DEFAULT_BANNER_IMG ? '' : profileData.banner;

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedProfile = {
                name: document.getElementById('input-name').value.trim(),
                bio: document.getElementById('input-bio').value.trim(),
                tags: document.getElementById('input-tags').value.trim(),
                avatar: document.getElementById('input-avatar').value.trim() || DEFAULT_AVATAR_IMG,
                banner: document.getElementById('input-banner').value.trim() || DEFAULT_BANNER_IMG
            };

            const res = await fetch(`${API_URL}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProfile)
            });

            if(res.ok) {
                showNotification('Success Save', 'Profil database Cloudflare berhasil diperbarui.', 'success');
                await loadAllDataFromCloudflare();
            }
        });
    }

    const projectForm = document.getElementById('admin-project-form');
    if(projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProject = {
                title: document.getElementById('proj-title').value.trim(),
                desc: document.getElementById('proj-desc').value.trim(),
                img: document.getElementById('proj-img').value.trim() || DEFAULT_PROJECT_IMG,
                link: document.getElementById('proj-link').value.trim() || "#"
            };

            const res = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });

            if(res.ok) {
                showNotification('Project Published', 'Proyek baru berhasil disimpan di D1 Cloud.', 'success');
                projectForm.reset();
                await loadAllDataFromCloudflare();
            }
        });
    }

    const shopForm = document.getElementById('admin-shop-form');
    if(shopForm) {
        shopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newItem = {
                title: document.getElementById('shop-title').value.trim(),
                price: parseInt(document.getElementById('shop-price').value),
                desc: document.getElementById('shop-desc').value.trim(),
                img: document.getElementById('shop-img').value.trim() || DEFAULT_SHOP_IMG
            };

            const res = await fetch(`${API_URL}/api/shop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            if(res.ok) {
                showNotification('Item Uploaded', 'Katalog baru berhasil diunggah ke D1 Cloud.', 'success');
                shopForm.reset();
                await loadAllDataFromCloudflare();
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newMsg = {
                contact: document.getElementById('contact-identity').value.trim(),
                subject: document.getElementById('contact-subject').value.trim(),
                message: document.getElementById('contact-message').value.trim()
            };

            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMsg)
            });

            if(res.ok) {
                contactForm.reset();
                showNotification('Ticket Created', 'Aduan masuk ke Cloud database.', 'success');
                await loadAllDataFromCloudflare();
            }
        });
    }
}

// ==========================================================================
// 5. OPERASI DELETE DATA DARI DATABASE CLOUDFLARE D1
// ==========================================================================
async function deleteProject(id) {
    if(confirm('Hapus proyek ini secara permanen dari Cloudflare D1?')) {
        const res = await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
        if(res.ok) {
            showNotification('Deleted', 'Proyek berhasil dihapus.', 'success');
            await loadAllDataFromCloudflare();
        }
    }
}

async function deleteShopItem(id) {
    if(confirm('Hapus produk ini secara permanen dari Cloudflare D1?')) {
        const res = await fetch(`${API_URL}/api/shop/${id}`, { method: 'DELETE' });
        if(res.ok) {
            showNotification('Deleted', 'Produk berhasil dihapus.', 'success');
            await loadAllDataFromCloudflare();
        }
    }
}

async function deleteMessage(id) {
    const res = await fetch(`${API_URL}/api/messages/${id}`, { method: 'DELETE' });
    if(res.ok) {
        showNotification('Selesai', 'Tiket aduan telah dihapus.', 'success');
        await loadAllDataFromCloudflare();
    }
}

// ==========================================================================
// 6. UTILITY ENGINE SYSTEM (NAVIGASI, INTERFACE TOAST MODAL)
// ==========================================================================
function triggerPurchase(title, price) {
    const waText = `Halo Leoly Management, saya tertarik untuk membeli:\n\n• *Aset:* ${title}\n• *Harga:* Rp ${price.toLocaleString('id-ID')}`;
    showNotification('Order Redirect', 'Menghubungkan ke WhatsApp...', 'success');
    setTimeout(() => { window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`, '_blank'); }, 800);
}

function initNavigationSystem() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    const navLinks = document.querySelectorAll('.nav-item');

    if (openMenu) openMenu.addEventListener('click', () => { sidebar.classList.add('active'); overlay.classList.add('active'); });
    if (closeMenu) closeMenu.addEventListener('click', () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); });
    if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(ln => ln.classList.remove('active'));
            link.classList.add('active');
            switchSection(link.getAttribute('data-section'));
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active-section'));
    const activeSec = document.getElementById(`${sectionId}-section`);
    if(activeSec) { activeSec.classList.add('active-section'); window.location.hash = sectionId; }
}

function initModalVerification() {
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');
    const cancelLogin = document.getElementById('cancelLogin');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    if (closeLogin) closeLogin.addEventListener('click', () => { loginModal.classList.remove('active'); loginForm.reset(); });
    if (cancelLogin) cancelLogin.addEventListener('click', () => { loginModal.classList.remove('active'); loginForm.reset(); });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('login-username').value.trim() === DEV_USER && document.getElementById('login-password').value.trim() === DEV_PASS) {
                isAdminMode = true;
                sessionStorage.setItem('leoly_isAdmin', 'true');
                syncInterfaceRender();
                loginModal.classList.remove('active');
                showNotification('Authorized', 'Selamat datang di Control Room!', 'success');
            } else {
                showNotification('Failed', 'Kredensial salah!', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('Keluar dari mode kontrol admin?')) {
                isAdminMode = false;
                sessionStorage.setItem('leoly_isAdmin', 'false');
                syncInterfaceRender();
                switchSection('home');
                showNotification('Logged Out', 'Kembali ke Guest Mode.', 'success');
            }
        });
    }
}

function showNotification(title, description, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-wrapper ${type}`;
    const iconSvg = type === 'error' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;

    toast.innerHTML = `<div class="toast-alert"><div class="toast-content-area"><div class="toast-icon-box">${iconSvg}</div><div><p class="toast-text-title">${title}</p><p class="toast-text-desc">${description}</p></div></div><button class="toast-close-btn">✕</button></div>`;
    toast.querySelector('.toast-close-btn').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

window.addEventListener('load', () => {
    setTimeout(() => { const gl = document.getElementById('global-loader'); if (gl) gl.classList.add('fade-out'); }, 750);
});

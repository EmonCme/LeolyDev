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
    { id: Date.now(), name: "Sponsor Utama", amount: 50000, msg: "Terus kembangkan sistem info dashboard Leoly!" }
];
let messagesData = [];
let isAdminMode = sessionStorage.getItem('leoly_isAdmin') === 'true';

// Counter untuk ID
let nextProjectId = 100;
let nextShopId = 100;
let nextMessageId = 100;

// ==========================================================================
// 2. INITIALIZER ENGINE (KONEKSI CLOUDFLARE D1 NETWORK)
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    initNavigationSystem();
    initModalVerification();

    await loadAllDataFromCloudflare();

    initFormHandlers();
    initDonationForm();
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
        } else if (!profileData.tags) {
            profileData.tags = [];
        }

        projectsData = Array.isArray(projectsRes) && projectsRes.length > 0 ? projectsRes : getDefaultProjects();
        shopData = Array.isArray(shopRes) && shopRes.length > 0 ? shopRes : getDefaultShop();
        messagesData = Array.isArray(messagesRes) ? messagesRes : [];

        if (projectsData.length > 0) {
            nextProjectId = Math.max(...projectsData.map(p => p.id || 0), 0) + 1;
        }
        if (shopData.length > 0) {
            nextShopId = Math.max(...shopData.map(s => s.id || 0), 0) + 1;
        }
        if (messagesData.length > 0) {
            nextMessageId = Math.max(...messagesData.map(m => m.id || 0), 0) + 1;
        }

        syncInterfaceRender();
    } catch (err) {
        console.error("Gagal memuat data dari Cloudflare D1:", err);
        showNotification('Database Offline', 'Menggunakan mode offline/demo.', 'error');
        setupDemoData();
        syncInterfaceRender();
    }
}

function getDefaultProjects() {
    return [
        { id: 1, title: "Leoly Ecosystem", desc: "Sistem informasi terintegrasi untuk developer.", img: DEFAULT_PROJECT_IMG, link: "#" },
        { id: 2, title: "Roblox Studio Toolkit", desc: "Koleksi plugin dan asset untuk builder.", img: DEFAULT_PROJECT_IMG, link: "#" }
    ];
}

function getDefaultShop() {
    return [
        { id: 1, title: "Premium UI Kit", price: 150000, desc: "Paket lengkap komponen UI modern.", img: DEFAULT_SHOP_IMG },
        { id: 2, title: "Sistem Lisensi", price: 250000, desc: "Perlindungan hak akses full.", img: DEFAULT_SHOP_IMG }
    ];
}

function setupDemoData() {
    if (Object.keys(profileData).length === 0) {
        profileData = {
            name: "Leoly Dev Platform",
            bio: "Front-end web engineer & Roblox Studio builder.",
            tags: ["Roblox", "HTML/CSS", "Acode Mobile", "MT Manager"],
            avatar: DEFAULT_AVATAR_IMG,
            banner: DEFAULT_BANNER_IMG
        };
    }
    if (projectsData.length === 0) {
        projectsData = getDefaultProjects();
        nextProjectId = 3;
    }
    if (shopData.length === 0) {
        shopData = getDefaultShop();
        nextShopId = 3;
    }
}

// ==========================================================================
// 3. RENDERER ENGINE & DYNAMIC COMPONENT SYNC
// ==========================================================================
function syncInterfaceRender() {
    // Profile
    document.getElementById('display-name').textContent = profileData.name || "Leoly Hub";
    document.getElementById('display-bio').textContent = profileData.bio || "";
    document.getElementById('display-avatar').src = profileData.avatar || DEFAULT_AVATAR_IMG;
    document.getElementById('display-banner').src = profileData.banner || DEFAULT_BANNER_IMG;

    const tagsWrapper = document.getElementById('display-tags');
    if (tagsWrapper && profileData.tags) {
        tagsWrapper.innerHTML = '';
        const tagsArray = Array.isArray(profileData.tags) ? profileData.tags : 
                          (typeof profileData.tags === 'string' ? profileData.tags.split(',').map(t => t.trim()) : []);
        tagsArray.forEach(t => {
            if (t && t.trim()) {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = t.trim();
                tagsWrapper.appendChild(span);
            }
        });
    }

    // Stats
    document.getElementById('stat-projects-count').textContent = projectsData.length;
    document.getElementById('stat-shop-count').textContent = shopData.length;
    document.getElementById('stat-donations-count').textContent = donationsData.length;

    // Projects Grid
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projectsContainer.innerHTML = '';
        projectsData.forEach((proj) => {
            const card = document.createElement('div');
            card.className = 'dev-card';
            card.innerHTML = `
                <div class="card-media">
                    <img src="${proj.img || DEFAULT_PROJECT_IMG}" alt="Project" onerror="this.src='${DEFAULT_PROJECT_IMG}'">
                </div>
                <div class="card-body">
                    <h3>${escapeHtml(proj.title)}</h3>
                    <p>${escapeHtml(proj.desc)}</p>
                    <div class="card-footer">
                        <a href="${proj.link || '#'}" class="btn btn-secondary" target="_blank"><i data-lucide="external-link"></i> View Source</a>
                        ${isAdminMode ? `<button class="btn-danger-action" data-action="delete-project" data-id="${proj.id}">Hapus</button>` : ''}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    // Shop Grid
    const shopContainer = document.getElementById('shop-container');
    if (shopContainer) {
        shopContainer.innerHTML = '';
        shopData.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'dev-card';
            card.innerHTML = `
                <div class="card-media">
                    <img src="${item.img || DEFAULT_SHOP_IMG}" alt="Product" onerror="this.src='${DEFAULT_SHOP_IMG}'">
                </div>
                <div class="card-body">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.desc)}</p>
                    <div class="card-footer">
                        <span class="card-price">Rp ${Number(item.price).toLocaleString('id-ID')}</span>
                        <button class="btn btn-primary" data-action="buy-item" data-title="${escapeHtml(item.title)}" data-price="${item.price}"><i data-lucide="shopping-cart"></i> Buy</button>
                        ${isAdminMode ? `<button class="btn-danger-action" data-action="delete-shop" data-id="${item.id}">Hapus</button>` : ''}
                    </div>
                </div>
            `;
            shopContainer.appendChild(card);
        });
    }

    // Donation Feed
    const donationFeedList = document.getElementById('donation-feed-list');
    if (donationFeedList) {
        donationFeedList.innerHTML = '';
        [...donationsData].reverse().forEach((don) => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-card';
            feedItem.innerHTML = `
                <div class="feed-top">
                    <span class="feed-user"><i data-lucide="user" style="width:14px; height:14px; display:inline; margin-right:4px; vertical-align:middle;"></i>${escapeHtml(don.name)}</span>
                    <span class="feed-amount">Rp ${Number(don.amount).toLocaleString('id-ID')}</span>
                </div>
                <div style="background: rgba(255,255,255,0.02); border-left: 2px solid var(--accent); padding: 0.5rem 0.75rem; margin-top: 0.5rem; border-radius: 0 6px 6px 0;">
                    <p style="color: #d4d4d4; font-size: 0.88rem; margin: 0;">"${escapeHtml(don.msg)}"</p>
                </div>
            `;
            donationFeedList.appendChild(feedItem);
        });
    }

    // Admin Messages Table
    const adminMessagesList = document.getElementById('admin-messages-list');
    if (adminMessagesList) {
        adminMessagesList.innerHTML = '';
        if (messagesData.length === 0) {
            adminMessagesList.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2.5rem;">Kotak masuk kosong.</td></tr>`;
        } else {
            messagesData.forEach((msg) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(msg.contact)}</td>
                    <td>${escapeHtml(msg.subject)}</td>
                    <td style="max-width: 300px; white-space: pre-wrap;">${escapeHtml(msg.message)}</td>
                    <td><button class="btn-table-action" data-action="delete-message" data-id="${msg.id}">Selesai</button></td>
                `;
                adminMessagesList.appendChild(row);
            });
        }
    }

    // Attach event listeners for dynamic buttons
    attachDynamicEventListeners();

    toggleAdminElementsVisibility();
    lucide.createIcons();
}

function attachDynamicEventListeners() {
    // Delete project buttons
    document.querySelectorAll('[data-action="delete-project"]').forEach(btn => {
        btn.removeEventListener('click', handleDeleteProject);
        btn.addEventListener('click', handleDeleteProject);
    });

    // Delete shop buttons
    document.querySelectorAll('[data-action="delete-shop"]').forEach(btn => {
        btn.removeEventListener('click', handleDeleteShop);
        btn.addEventListener('click', handleDeleteShop);
    });

    // Delete message buttons
    document.querySelectorAll('[data-action="delete-message"]').forEach(btn => {
        btn.removeEventListener('click', handleDeleteMessage);
        btn.addEventListener('click', handleDeleteMessage);
    });

    // Buy item buttons
    document.querySelectorAll('[data-action="buy-item"]').forEach(btn => {
        btn.removeEventListener('click', handleBuyItem);
        btn.addEventListener('click', handleBuyItem);
    });
}

function handleDeleteProject(e) {
    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    deleteProject(id);
}

function handleDeleteShop(e) {
    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    deleteShopItem(id);
}

function handleDeleteMessage(e) {
    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    deleteMessage(id);
}

function handleBuyItem(e) {
    const title = e.currentTarget.getAttribute('data-title');
    const price = parseInt(e.currentTarget.getAttribute('data-price'));
    triggerPurchase(title, price);
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
        const hash = window.location.hash.substring(1);
        if (hash === 'admin') switchSection('home');
    }
}

// ==========================================================================
// 4. FORM HANDLERS
// ==========================================================================
function initFormHandlers() {
    const profileForm = document.getElementById('admin-profile-form');
    if (profileForm) {
        document.getElementById('input-name').value = profileData.name || '';
        document.getElementById('input-bio').value = profileData.bio || '';
        const tagsValue = Array.isArray(profileData.tags) ? profileData.tags.join(', ') : (profileData.tags || '');
        document.getElementById('input-tags').value = tagsValue;
        document.getElementById('input-avatar').value = (profileData.avatar === DEFAULT_AVATAR_IMG || !profileData.avatar) ? '' : profileData.avatar;
        document.getElementById('input-banner').value = (profileData.banner === DEFAULT_BANNER_IMG || !profileData.banner) ? '' : profileData.banner;

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedProfile = {
                name: document.getElementById('input-name').value.trim(),
                bio: document.getElementById('input-bio').value.trim(),
                tags: document.getElementById('input-tags').value.trim(),
                avatar: document.getElementById('input-avatar').value.trim() || DEFAULT_AVATAR_IMG,
                banner: document.getElementById('input-banner').value.trim() || DEFAULT_BANNER_IMG
            };

            try {
                const res = await fetch(`${API_URL}/api/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProfile)
                });

                if (res.ok) {
                    showNotification('Success Save', 'Profil database berhasil diperbarui.', 'success');
                    await loadAllDataFromCloudflare();
                } else {
                    profileData = {
                        ...updatedProfile,
                        tags: updatedProfile.tags.split(',').map(t => t.trim()).filter(t => t)
                    };
                    syncInterfaceRender();
                    showNotification('Saved Locally', 'Profil tersimpan secara lokal.', 'success');
                }
            } catch (err) {
                profileData = {
                    ...updatedProfile,
                    tags: updatedProfile.tags.split(',').map(t => t.trim()).filter(t => t)
                };
                syncInterfaceRender();
                showNotification('Saved Locally', 'Profil tersimpan secara lokal.', 'success');
            }
        });
    }

    const projectForm = document.getElementById('admin-project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProject = {
                title: document.getElementById('proj-title').value.trim(),
                desc: document.getElementById('proj-desc').value.trim(),
                img: document.getElementById('proj-img').value.trim() || DEFAULT_PROJECT_IMG,
                link: document.getElementById('proj-link').value.trim() || "#"
            };

            try {
                const res = await fetch(`${API_URL}/api/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProject)
                });

                if (res.ok) {
                    showNotification('Project Published', 'Proyek baru berhasil disimpan.', 'success');
                    projectForm.reset();
                    await loadAllDataFromCloudflare();
                } else {
                    newProject.id = nextProjectId++;
                    projectsData.push(newProject);
                    syncInterfaceRender();
                    showNotification('Added Locally', 'Proyek ditambahkan secara lokal.', 'success');
                    projectForm.reset();
                }
            } catch (err) {
                newProject.id = nextProjectId++;
                projectsData.push(newProject);
                syncInterfaceRender();
                showNotification('Added Locally', 'Proyek ditambahkan secara lokal.', 'success');
                projectForm.reset();
            }
        });
    }

    const shopForm = document.getElementById('admin-shop-form');
    if (shopForm) {
        shopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newItem = {
                title: document.getElementById('shop-title').value.trim(),
                price: parseInt(document.getElementById('shop-price').value),
                desc: document.getElementById('shop-desc').value.trim(),
                img: document.getElementById('shop-img').value.trim() || DEFAULT_SHOP_IMG
            };

            try {
                const res = await fetch(`${API_URL}/api/shop`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem)
                });

                if (res.ok) {
                    showNotification('Item Uploaded', 'Katalog baru berhasil diunggah.', 'success');
                    shopForm.reset();
                    await loadAllDataFromCloudflare();
                } else {
                    newItem.id = nextShopId++;
                    shopData.push(newItem);
                    syncInterfaceRender();
                    showNotification('Added Locally', 'Produk ditambahkan secara lokal.', 'success');
                    shopForm.reset();
                }
            } catch (err) {
                newItem.id = nextShopId++;
                shopData.push(newItem);
                syncInterfaceRender();
                showNotification('Added Locally', 'Produk ditambahkan secara lokal.', 'success');
                shopForm.reset();
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newMsg = {
                contact: document.getElementById('contact-identity').value.trim(),
                subject: document.getElementById('contact-subject').value.trim(),
                message: document.getElementById('contact-message').value.trim()
            };

            try {
                const res = await fetch(`${API_URL}/api/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newMsg)
                });

                if (res.ok) {
                    contactForm.reset();
                    showNotification('Ticket Created', 'Aduan masuk ke Cloud database.', 'success');
                    await loadAllDataFromCloudflare();
                } else {
                    newMsg.id = nextMessageId++;
                    messagesData.push(newMsg);
                    syncInterfaceRender();
                    showNotification('Ticket Sent', 'Pesan terkirim ke admin.', 'success');
                    contactForm.reset();
                }
            } catch (err) {
                newMsg.id = nextMessageId++;
                messagesData.push(newMsg);
                syncInterfaceRender();
                showNotification('Ticket Sent', 'Pesan terkirim (mode offline).', 'success');
                contactForm.reset();
            }
        });
    }
}

function initDonationForm() {
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('donator-name').value.trim() || "Anonim";
            const amount = parseInt(document.getElementById('donation-amount').value);
            const msg = document.getElementById('donation-msg').value.trim() || "Terima kasih telah mendukung!";

            if (!amount || amount <= 0) {
                showNotification('Invalid', 'Masukkan nominal yang valid.', 'error');
                return;
            }

            const newDonation = {
                id: Date.now(),
                name: name,
                amount: amount,
                msg: msg
            };
            donationsData.push(newDonation);
            syncInterfaceRender();

            const waText = `*Donasi Masuk!*\n\nNama: ${name}\nNominal: Rp ${amount.toLocaleString('id-ID')}\nPesan: ${msg}`;
            window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`, '_blank');

            showNotification('Donation Sent', 'Terima kasih atas dukungan Anda!', 'success');
            donationForm.reset();
        });
    }
}

// ==========================================================================
// 5. OPERASI DELETE DATA
// ==========================================================================
async function deleteProject(id) {
    if (confirm('Hapus proyek ini secara permanen?')) {
        try {
            const res = await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('Deleted', 'Proyek berhasil dihapus.', 'success');
                await loadAllDataFromCloudflare();
            } else {
                projectsData = projectsData.filter(p => p.id !== id);
                syncInterfaceRender();
                showNotification('Deleted', 'Proyek dihapus secara lokal.', 'success');
            }
        } catch (err) {
            projectsData = projectsData.filter(p => p.id !== id);
            syncInterfaceRender();
            showNotification('Deleted', 'Proyek dihapus secara lokal.', 'success');
        }
    }
}

async function deleteShopItem(id) {
    if (confirm('Hapus produk ini secara permanen?')) {
        try {
            const res = await fetch(`${API_URL}/api/shop/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('Deleted', 'Produk berhasil dihapus.', 'success');
                await loadAllDataFromCloudflare();
            } else {
                shopData = shopData.filter(s => s.id !== id);
                syncInterfaceRender();
                showNotification('Deleted', 'Produk dihapus secara lokal.', 'success');
            }
        } catch (err) {
            shopData = shopData.filter(s => s.id !== id);
            syncInterfaceRender();
            showNotification('Deleted', 'Produk dihapus secara lokal.', 'success');
        }
    }
}

async function deleteMessage(id) {
    try {
        const res = await fetch(`${API_URL}/api/messages/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showNotification('Selesai', 'Tiket aduan telah dihapus.', 'success');
            await loadAllDataFromCloudflare();
        } else {
            messagesData = messagesData.filter(m => m.id !== id);
            syncInterfaceRender();
            showNotification('Selesai', 'Tiket dihapus secara lokal.', 'success');
        }
    } catch (err) {
        messagesData = messagesData.filter(m => m.id !== id);
        syncInterfaceRender();
        showNotification('Selesai', 'Tiket dihapus secara lokal.', 'success');
    }
}

// ==========================================================================
// 6. UTILITY FUNCTIONS
// ==========================================================================
function triggerPurchase(title, price) {
    const waText = `Halo Leoly Management, saya tertarik untuk membeli:\n\n• Aset: ${title}\n• Harga: Rp ${price.toLocaleString('id-ID')}`;
    showNotification('Order Redirect', 'Menghubungkan ke WhatsApp...', 'success');
    setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`, '_blank');
    }, 800);
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
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(ln => ln.classList.remove('active'));
            link.classList.add('active');
            const section = link.getAttribute('data-section');
            if (section) switchSection(section);
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.nav-item[data-section="${hash}"]`);
        if (targetLink) {
            navLinks.forEach(ln => ln.classList.remove('active'));
            targetLink.classList.add('active');
            switchSection(hash);
        }
    }
}

function switchSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active-section'));
    const activeSec = document.getElementById(`${sectionId}-section`);
    if (activeSec) {
        activeSec.classList.add('active-section');
        window.location.hash = sectionId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function initModalVerification() {
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');
    const cancelLogin = document.getElementById('cancelLogin');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    if (closeLogin) closeLogin.addEventListener('click', () => { loginModal.classList.remove('active'); loginForm?.reset(); });
    if (cancelLogin) cancelLogin.addEventListener('click', () => { loginModal.classList.remove('active'); loginForm?.reset(); });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            if (username === DEV_USER && password === DEV_PASS) {
                isAdminMode = true;
                sessionStorage.setItem('leoly_isAdmin', 'true');
                syncInterfaceRender();
                loginModal.classList.remove('active');
                showNotification('Authorized', 'Selamat datang di Control Room!', 'success');
                loginForm.reset();
            } else {
                showNotification('Failed', 'Kredensial salah!', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Keluar dari mode kontrol admin?')) {
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
        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;

    toast.innerHTML = `<div class="toast-alert"><div class="toast-content-area"><div class="toast-icon-box">${iconSvg}</div><div><p class="toast-text-title">${escapeHtml(title)}</p><p class="toast-text-desc">${escapeHtml(description)}</p></div></div><button class="toast-close-btn">✕</button></div>`;
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4500);
}

// Make functions available globally
window.deleteProject = deleteProject;
window.deleteShopItem = deleteShopItem;
window.deleteMessage = deleteMessage;
window.triggerPurchase = triggerPurchase;

window.addEventListener('load', () => {
    setTimeout(() => {
        const gl = document.getElementById('global-loader');
        if (gl) gl.classList.add('fade-out');
    }, 800);
});
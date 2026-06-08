// ==========================================================================
// 1. KREDENSIAL DEVELOPER ACCOUNT & KONSTANTA GAMBAR ASSET
// ==========================================================================
const DEV_USER = "leoly";
const DEV_PASS = "dev123";

const WHATSAPP_NUMBER = "6285198224557"; 

const DEFAULT_PROJECT_IMG = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600";
const DEFAULT_SHOP_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";

const DEFAULT_AVATAR_IMG = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
const DEFAULT_BANNER_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";

// ==========================================================================
// 2. STATE STORAGE MANAGEMENT (LOCAL STORAGE PERSISTENCE)
// ==========================================================================
let profileData = JSON.parse(localStorage.getItem('leoly_profile')) || {
    name: "Leoly Dev Platform",
    bio: "Front-end web engineer & Roblox Studio builder. Menolak menyerah pada keterbatasan.",
    tags: ["Roblox", "HTML/CSS", "Acode Mobile", "MT Manager"],
    avatar: DEFAULT_AVATAR_IMG,
    banner: DEFAULT_BANNER_IMG
};

let projectsData = JSON.parse(localStorage.getItem('leoly_projects')) || [
    { title: "HDFv Hub Site", desc: "Landing page dan pangkalan data modular untuk ekosistem Highest Definition Family village.", img: DEFAULT_PROJECT_IMG, link: "#" },
    { title: "Train System Core", desc: "Skrip otomasi rangkaian kereta api sinkronisasi mobile-client dalam Roblox Studio.", img: DEFAULT_PROJECT_IMG, link: "#" }
];

let shopData = JSON.parse(localStorage.getItem('leoly_shop')) || [
    { title: "Premium Glass UI Template", price: 25000, desc: "Aset antarmuka transparan high-contrast modern untuk web dashboard.", img: DEFAULT_SHOP_IMG },
    { title: "Roblox Custom Terrain Asset", price: 45000, desc: "Paket peta lingkungan modular dioptimasikan untuk perangkat smartphone.", img: DEFAULT_SHOP_IMG }
];

let donationsData = JSON.parse(localStorage.getItem('leoly_donations')) || [
    { name: "Sponsor Utama", amount: 50000, msg: "Terus kembangkan sistem info dashboard Leoly!" }
];

let messagesData = JSON.parse(localStorage.getItem('leoly_messages')) || [];
let isAdminMode = sessionStorage.getItem('leoly_isAdmin') === 'true';

// ==========================================================================
// 3. SELEKTOR ELEMEN DOM & INTERFACES
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    syncInterfaceRender();
    initNavigationSystem();
    initFormHandlers();
    initModalVerification();
    
    lucide.createIcons();
});

// ==========================================================================
// 4. RENDERER ENGINE & DYNAMIC COMPONENT SYNC
// ==========================================================================
function syncInterfaceRender() {
    document.getElementById('display-name').textContent = profileData.name;
    document.getElementById('display-bio').textContent = profileData.bio;
    document.getElementById('display-avatar').src = profileData.avatar || DEFAULT_AVATAR_IMG;
    document.getElementById('display-banner').src = profileData.banner || DEFAULT_BANNER_IMG;
    
    const tagsWrapper = document.getElementById('display-tags');
    if (tagsWrapper) {
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
        projectsData.forEach((proj, idx) => {
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
                        <a href="${proj.link || '#'}" class="btn btn-secondary" target="_blank"><i data-lucide="external-link"></i> View Source</a>
                        ${isAdminMode ? `<button class="btn-danger-action" onclick="deleteProject(${idx})">Hapus</button>` : ''}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    const shopContainer = document.getElementById('shop-container');
    if (shopContainer) {
        shopContainer.innerHTML = '';
        shopData.forEach((item, idx) => {
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
                        <button class="btn btn-primary" onclick="triggerPurchase('${item.title}', ${item.price})"><i data-lucide="shopping-cart"></i> Buy</button>
                        ${isAdminMode ? `<button class="btn-danger-action" onclick="deleteShopItem(${idx})" style="bottom: -2px; right: 75px;">Hapus</button>` : ''}
                    </div>
                </div>
            `;
            shopContainer.appendChild(card);
        });
    }

    const donationFeedList = document.getElementById('donation-feed-list');
    if (donationFeedList) {
        donationFeedList.innerHTML = '';
        if (donationsData.length === 0) {
            donationFeedList.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Belum ada riwayat dukungan saat ini.</p>`;
        } else {
            donationsData.forEach((don, idx) => {
                const feedItem = document.createElement('div');
                feedItem.className = 'feed-card';
                const deleteButtonHtml = isAdminMode ? `<button class="btn-danger-action" onclick="deleteDonationFeed(${idx})" style="top: 10px; bottom: auto;">Hapus</button>` : '';
                feedItem.innerHTML = `
                    <div class="feed-top">
                        <span class="feed-user"><i data-lucide="user" style="width:14px; height:14px; display:inline; margin-right:4px; vertical-align:middle;"></i>${don.name}</span>
                        <span class="feed-amount">Rp ${Number(don.amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border-left: 2px solid var(--accent); padding: 0.5rem 0.75rem; margin-top: 0.5rem; border-radius: 0 6px 6px 0; padding-right: ${isAdminMode ? '65px' : '0.75rem'};">
                        <p style="color: #d4d4d4; font-size: 0.88rem; font-style: normal; font-weight: 400; line-height: 1.5; margin: 0; letter-spacing: 0.2px;">"${don.msg}"</p>
                    </div>
                    ${deleteButtonHtml}
                `;
                donationFeedList.appendChild(feedItem);
            });
        }
    }

    const adminMessagesList = document.getElementById('admin-messages-list');
    if (adminMessagesList) {
        adminMessagesList.innerHTML = '';
        if (messagesData.length === 0) {
            adminMessagesList.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2.5rem;">Kotak masuk kosong.</td></tr>`;
        } else {
            messagesData.forEach((msg, idx) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${msg.contact}</td><td>${msg.subject}</td><td style="max-width: 300px; white-space: pre-wrap;">${msg.message}</td><td><button class="btn-table-action" onclick="deleteMessage(${idx})">Selesai</button></td>`;
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
        
        if(window.location.hash === '#admin') {
            switchSection('home');
        }
    }
}

// ==========================================================================
// 5. SISTEM NAVIGASI & ROUTING SIDEBAR COMPONENT
// ==========================================================================
function initNavigationSystem() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    const navLinks = document.querySelectorAll('.nav-item');

    function openSidebar() { sidebar.classList.add('active'); overlay.classList.add('active'); }
    function closeSidebar() { sidebar.classList.remove('active'); overlay.classList.remove('active'); }

    if (openMenu) openMenu.addEventListener('click', openSidebar);
    if (closeMenu) closeMenu.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetSection = link.getAttribute('data-section');
            navLinks.forEach(ln => ln.classList.remove('active'));
            link.classList.add('active');
            switchSection(targetSection);
            closeSidebar();
        });
    });

    if(window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        const targetLink = document.querySelector(`.nav-item[data-section="${hash}"]`);
        if (targetLink && (hash !== 'admin' || isAdminMode)) {
            targetLink.click();
        }
    }
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active-section'));
    const activeSec = document.getElementById(`${sectionId}-section`);
    if(activeSec) {
        activeSec.classList.add('active-section');
        window.location.hash = sectionId;
    }
}

// ==========================================================================
// 6. FORM SUBMISSION HANDLERS (ADMIN DATA & GATEWAYS)
// ==========================================================================
function initFormHandlers() {
    const profileForm = document.getElementById('admin-profile-form');
    if (profileForm) {
        document.getElementById('input-name').value = profileData.name;
        document.getElementById('input-bio').value = profileData.bio;
        document.getElementById('input-tags').value = profileData.tags.join(', ');
        document.getElementById('input-avatar').value = profileData.avatar === DEFAULT_AVATAR_IMG ? '' : profileData.avatar;
        document.getElementById('input-banner').value = profileData.banner === DEFAULT_BANNER_IMG ? '' : profileData.banner;

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            profileData.name = document.getElementById('input-name').value.trim();
            profileData.bio = document.getElementById('input-bio').value.trim();
            profileData.tags = document.getElementById('input-tags').value.split(',').map(t => t.trim());
            profileData.avatar = document.getElementById('input-avatar').value.trim() || DEFAULT_AVATAR_IMG;
            profileData.banner = document.getElementById('input-banner').value.trim() || DEFAULT_BANNER_IMG;

            localStorage.setItem('leoly_profile', JSON.stringify(profileData));
            syncInterfaceRender();
            showNotification('Success Save', 'Konfigurasi profil owner berhasil diperbarui.', 'success');
        });
    }

    const projectForm = document.getElementById('admin-project-form');
    if(projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('proj-title').value.trim();
            const desc = document.getElementById('proj-desc').value.trim();
            const img = document.getElementById('proj-img').value.trim() || DEFAULT_PROJECT_IMG;
            const link = document.getElementById('proj-link').value.trim() || "#";

            projectsData.push({ title, desc, img, link });
            localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
            syncInterfaceRender();
            projectForm.reset();
            showNotification('Project Published', 'Kartu infrastruktur baru berhasil diterbitkan.', 'success');
        });
    }

    const shopForm = document.getElementById('admin-shop-form');
    if(shopForm) {
        shopForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('shop-title').value.trim();
            const price = parseInt(document.getElementById('shop-price').value);
            const desc = document.getElementById('shop-desc').value.trim();
            const img = document.getElementById('shop-img').value.trim() || DEFAULT_SHOP_IMG;

            shopData.push({ title, price, desc, img });
            localStorage.setItem('leoly_shop', JSON.stringify(shopData));
            syncInterfaceRender();
            shopForm.reset();
            showNotification('Item Uploaded', 'Katalog aset modular baru berhasil ditambahkan.', 'success');
        });
    }

    const donationForm = document.getElementById('donation-form');
    if(donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('donator-name').value.trim();
            const amount = parseInt(document.getElementById('donation-amount').value);
            const msg = document.getElementById('donation-msg').value.trim();

            donationsData.unshift({ name, amount, msg });
            localStorage.setItem('leoly_donations', JSON.stringify(donationsData));
            
            const waText = `Halo Leoly Owner, saya ingin konfirmasi dukungan donasi.\n\n` + 
                           `• *Nama Donatur:* ${name}\n` +
                           `• *Nominal:* Rp ${amount.toLocaleString('id-ID')}\n` +
                           `• *Pesan:* "${msg}"\n\n` +
                           `Mohon kirimkan instruksi/kode transfer QRIS pembayaran sistem.`;
            
            syncInterfaceRender();
            donationForm.reset();
            showNotification('Gateway Triggered', 'Membuka gerbang WhatsApp konfirmasi...', 'success');
            setTimeout(() => {
                window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`, '_blank');
            }, 800);
        });
    }

    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const contact = document.getElementById('contact-identity').value.trim();
            const subject = document.getElementById('contact-subject').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            messagesData.push({ contact, subject, message });
            localStorage.setItem('leoly_messages', JSON.stringify(messagesData));
            
            contactForm.reset();
            showNotification('Ticket Created', 'Tiket pengaduan berhasil dikirim ke Control Room.', 'success');
            syncInterfaceRender();
        });
    }
}

// ==========================================================================
// 7. ACTION TRIGGERS & DELETE OPERATIONS
// ==========================================================================
function triggerPurchase(title, price) {
    const waText = `Halo Leoly Management, saya tertarik untuk melakukan lisensi pembelian aset berikut:\n\n` +
                   `• *Nama Produk:* ${title}\n` +
                   `• *Harga Katalog:* Rp ${price.toLocaleString('id-ID')}\n\n` +
                   `Mohon informasi metode aktivasi rincian transaksi lebih lanjut.`;
    showNotification('Order Redirect', 'Menghubungkan ke WhatsApp management...', 'success');
    setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`, '_blank');
    }, 800);
}

function deleteProject(index) {
    if(confirm('Hapus kartu infrastruktur proyek ini secara permanen?')) {
        projectsData.splice(index, 1);
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        syncInterfaceRender();
        showNotification('Deleted', 'Kartu proyek berhasil dihapus.', 'success');
    }
}

// ==========================================================================
// 8. SECURITY MODAL VERIFICATION AUTHENTICATION SYSTEM
// ==========================================================================
function initModalVerification() {
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');
    const cancelLogin = document.getElementById('cancelLogin');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logoutBtn');

    function hideModal() {
        loginModal.classList.remove('active');
        if (loginForm) loginForm.reset();
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }

    if (closeLogin) closeLogin.addEventListener('click', hideModal);
    if (cancelLogin) cancelLogin.addEventListener('click', hideModal);

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-password').value.trim();

            if (user === DEV_USER && pass === DEV_PASS) {
                isAdminMode = true;
                sessionStorage.setItem('leoly_isAdmin', 'true');
                syncInterfaceRender();
                hideModal();
                showNotification('Authorized', 'Selamat datang kembali di Control Room!', 'success');
            } else {
                showNotification('Verification Failed', 'Kredensial Owner Salah! Silakan coba lagi.', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('Keluar dari mode kontrol admin Leoly Hub?')) {
                isAdminMode = false;
                sessionStorage.setItem('leoly_isAdmin', 'false');
                syncInterfaceRender();
                switchSection('home');
                const targetLink = document.querySelector('.nav-item[data-section="home"]');
                if (targetLink) {
                    document.querySelectorAll('.nav-item').forEach(ln => ln.classList.remove('active'));
                    targetLink.classList.add('active');
                }
                showNotification('Logged Out', 'Mode kontrol terputus. Mengalihkan ke Guest Mode.', 'success');
            }
        });
    }
}

// ==========================================================================
// 9. AUTOMATIC FADE-OUT LOADING SCREEN ENGINE
// ==========================================================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const globalLoader = document.getElementById('global-loader');
        if (globalLoader) {
            globalLoader.classList.add('fade-out');
        }
    }, 750);
});

// ==========================================================================
// 10. DINAMIS TOAST NOTIFICATION ENGINE (FROM UIVERSE BY seyed-mohsen-mousavi)
// ==========================================================================
function showNotification(title, description, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Membuat wrapper utama notifikasi
    const toast = document.createElement('div');
    toast.className = `toast-wrapper ${type}`;

    // Path SVG Icon Kondisional (Success / Error)
    const iconSvg = type === 'error' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;

    toast.innerHTML = `
        <div class="toast-alert">
            <div class="toast-content-area">
                <div class="toast-icon-box">
                    ${iconSvg}
                </div>
                <div>
                    <p class="toast-text-title">${title}</p>
                    <p class="toast-text-desc">${description}</p>
                </div>
            </div>
            <button class="toast-close-btn" aria-label="Close Notification">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `;

    // Handler Tombol Tutup Silang Manual
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
        dismissToast(toast);
    });

    // Masukkan ke pembungkus utama di layar
    container.appendChild(toast);

    // Otomatis hilang setelah 4 detik
    setTimeout(() => {
        dismissToast(toast);
    }, 4000);
}

function dismissToast(toastElement) {
    if (toastElement.classList.contains('fade-out')) return;
    toastElement.classList.add('fade-out');
    
    // Tunggu animasi transisi keluar selesai sebelum menghapus element dari HTML
    toastElement.addEventListener('animationend', (e) => {
        if (e.animationName === 'toastOut') {
            toastElement.remove();
        }
    });
}

// ==========================================================================
// 1. KREDENSIAL DEVELOPER ACCOUNT & KONSTANTA GAMBAR ASSET
// ==========================================================================
const DEV_USER = "leoly";
const DEV_PASS = "dev123";

// Silakan ganti dengan nomor WhatsApp kamu (Gunakan format kode negara tanpa tanda + atau spasi)
// Contoh: 6281234567890 (62 adalah kode Indonesia)
const WHATSAPP_NUMBER = "6281234567890"; 

const DEFAULT_PROJECT_IMG = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600";
const DEFAULT_SHOP_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";

const DEFAULT_AVATAR_IMG = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
const DEFAULT_BANNER_IMG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";

// ==========================================================================
// 2. STATE STORAGE MANAGEMENT (LOCAL STORAGE PERSISTENCE)
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
        image: ""
    },
    { 
        title: "Dashboard Layout", 
        desc: "Template UI dashboard interaktif premium berbasis penataan web mobile responsive.",
        image: ""
    }
];

let shopData = JSON.parse(localStorage.getItem('leoly_shop')) || [
    { 
        title: "Premium UI Slicing Kit", 
        desc: "Kumpulan komponen CSS modern modular siap pakai.", 
        price: "Rp 35.000",
        image: ""
    },
    { 
        title: "Custom Sidebar Code", 
        desc: "Source code efek right-floating sidebar blur transparan.", 
        price: "Free",
        image: ""
    }
];

let messagesData = JSON.parse(localStorage.getItem('leoly_messages')) || [
    {
        contact: "HDFv_Member#001",
        subject: "Akses Server Terkunci",
        message: "Halo admin Leoly, saya tidak bisa mengakses dashboard info server utama HDFv sejak tadi pagi. Mohon bantuannya."
    }
];

let donationData = JSON.parse(localStorage.getItem('leoly_donations')) || [
    { name: "HDFv_Duda", amount: 50000, method: "DANA", msg: "Semangat urus server info HDFv banh!" },
    { name: "Anonymous", amount: 25000, method: "Bank BCA", msg: "Slicing web UI-nya clean bgt, mantap bro." }
];

// OPTIMASI HP: VALIDASI UKURAN FILE SEBELUM CONVERT BASE64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }
        
        const maxSizeBytes = 1024 * 1024; 
        if (file.size > maxSizeBytes) {
            showToast("Ukuran gambar terlalu besar! Maksimal ukuran file adalah 1MB.", "error");
            resolve(""); 
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ==========================================================================
// 3. SYSTEM NOTIFICATION TOAST & WHATSAPP REDIRECT ENGINE
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
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function copyToClipboard(textToCopy, providerName) {
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Nomor ${providerName} berhasil disalin!`);
    }).catch(() => {
        showToast("Gagal menyalin nomor otomatis.", "error");
    });
}
window.copyToClipboard = copyToClipboard;

// Fungsi Utama untuk Mengarahkan Transaksi ke WhatsApp
function redirectToWhatsApp(itemTitle, itemPrice) {
    // Menyusun teks template pesan otomatis yang rapi
    const baseText = `Halo Leoly, saya ingin membeli/memesan item berikut:\n\n` +
                     `📦 *Nama Item:* ${itemTitle}\n` +
                     `💰 *Harga:* ${itemPrice}\n\n` +
                     `Mohon info detail untuk langkah selanjutnya. Terima kasih!`;
    
    // Melakukan encode karakter teks agar aman di dalam URL string
    const encodedText = encodeURIComponent(baseText);
    
    // Membuat tautan lengkap API WhatsApp
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    
    // Membuka tab/aplikasi WhatsApp baru di HP pengguna
    window.open(waUrl, '_blank');
}
window.redirectToWhatsApp = redirectToWhatsApp;

// ==========================================================================
// 4. DOM ELEMENT SELECTION BINDING
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
const contentImageFile = document.getElementById('content-image-file');

const helpForm = document.getElementById('help-form');
const adminMessagesList = document.getElementById('admin-messages-list');
const btnClearMessages = document.getElementById('btn-clear-messages');

const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name');
const profileTagInput = document.getElementById('profile-tag');
const profileBioInput = document.getElementById('profile-bio');
const profileAvatarFile = document.getElementById('profile-avatar-file'); 
const profileBannerFile = document.getElementById('profile-banner-file'); 

const displayName = document.getElementById('display-name');
const displayTag = document.getElementById('display-tag');
const displayBio = document.getElementById('display-bio');
const displayAvatar = document.getElementById('display-avatar');
const displayBanner = document.getElementById('display-banner');

const donationFeedList = document.getElementById('donation-feed-list');
const adminDonatorForm = document.getElementById('admin-donator-form');

// ==========================================================================
// 5. FLOATING GLASS SIDEBAR CONTROLLER SYNC (RIGHT ALIGNED POJOK KANAN)
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

if (openMenuBtn) openMenuBtn.addEventListener('click', () => toggleSidebar(true));
if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => toggleSidebar(false));
if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));

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
// 6. MODAL SECURITY & ROLE CONTROLLER
// ==========================================================================
function updateAuthUI() {
    const lockIconContainer = document.getElementById('admin-lock-icon');
    
    if (currentUserRole === "developer") {
        roleIndicator.textContent = "Dev Mode";
        roleIndicator.className = "role-badge developer";
        btnAuthAction.textContent = "Sign Out Device";
        authBoxDesc.textContent = "Kamu masuk sebagai Owner.";
        menuAdmin.classList.remove('locked');
        if (lockIconContainer) lockIconContainer.innerHTML = `<i data-lucide="external-link" style="width: 14px; height: 14px;"></i>`;
    } else {
        roleIndicator.textContent = "Guest Mode";
        roleIndicator.className = "role-badge guest";
        btnAuthAction.textContent = "Sign In Developer";
        authBoxDesc.textContent = "Ingin mengelola konten web?";
        menuAdmin.classList.add('locked');
        if (lockIconContainer) lockIconContainer.innerHTML = `<i data-lucide="lock" style="width: 14px; height: 14px;"></i>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
        const berandaNav = document.querySelector('[data-target="beranda-view"]');
        if (berandaNav) berandaNav.click();
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
        const adminNav = document.querySelector('[data-target="admin-view"]');
        if (adminNav) adminNav.click();
    } else {
        loginError.style.display = 'block';
        showToast("Kredensial login salah!", "error");
    }
});

// ==========================================================================
// 7. OPERASI MANIPULASI DATA (LIVE CRUD ENGINE)
// ==========================================================================
function deleteProject(index) {
    if(confirm("Hapus project ini dari showcase?")) {
        projectsData.splice(index, 1);
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        renderHubContent();
        showToast("Project berhasil dihapus", "info");
    }
}
window.deleteProject = deleteProject;

function deleteShopItem(index) {
    if(confirm("Hapus produk ini dari toko?")) {
        shopData.splice(index, 1);
        localStorage.setItem('leoly_shop', JSON.stringify(shopData));
        renderHubContent();
        showToast("Produk berhasil dihapus", "info");
    }
}
window.deleteShopItem = deleteShopItem;

function deleteMessage(index) {
    if(confirm("Tandai tiket ini sebagai SELESAI?")) {
        messagesData.splice(index, 1);
        localStorage.setItem('leoly_messages', JSON.stringify(messagesData));
        renderHubContent();
        showToast("Tiket aduan berhasil dihapus.", "success");
    }
}
window.deleteMessage = deleteMessage;

function clearAllMessages() {
    if (messagesData.length === 0) {
        showToast("Kotak masuk sudah bersih!", "info");
        return;
    }
    if (confirm("⚠️ PERINGATAN: Apakah kamu yakin ingin membersihkan seluruh tiket masuk secara permanen?")) {
        messagesData = []; 
        localStorage.setItem('leoly_messages', JSON.stringify(messagesData)); 
        renderHubContent(); 
        showToast("🧹 Seluruh tiket bantuan berhasil dibersihkan!", "success");
    }
}
window.clearAllMessages = clearAllMessages;

if (btnClearMessages) {
    btnClearMessages.onclick = () => clearAllMessages();
}

function deleteDonator(index) {
    if(confirm("Hapus riwayat donatur ini dari papan apresiasi?")) {
        donationData.splice(index, 1);
        localStorage.setItem('leoly_donations', JSON.stringify(donationData));
        renderHubContent();
        showToast("Riwayat donatur berhasil dihapus.", "info");
    }
}
window.deleteDonator = deleteDonator;

if (adminDonatorForm) {
    adminDonatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dName = document.getElementById('adm-don-name').value.trim();
        const dAmount = parseInt(document.getElementById('adm-don-amount').value) || 0;
        const dMethod = document.getElementById('adm-don-method').value;
        const dMsg = document.getElementById('adm-don-msg').value.trim() || "Terima kasih atas dukungannya!";

        donationData.unshift({ name: dName, amount: dAmount, method: dMethod, msg: dMsg });
        localStorage.setItem('leoly_donations', JSON.stringify(donationData));
        showToast(`Berhasil menambahkan ${dName} ke Papan Apresiasi!`);
        
        adminDonatorForm.reset();
        renderHubContent();
        const donateNav = document.querySelector('[data-target="donate-view"]');
        if (donateNav) donateNav.click();
    });
}

if (helpForm) {
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
        const berandaNav = document.querySelector('[data-target="beranda-view"]');
        if (berandaNav) berandaNav.click();
    });
}

if (formTarget) {
    formTarget.addEventListener('change', () => {
        if (formTarget.value === 'shop') {
            priceGroup.style.display = 'block';
        } else {
            priceGroup.style.display = 'none';
        }
    });
}

if (contentForm) {
    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('content-title');
        const descInput = document.getElementById('content-desc');
        const priceInput = document.getElementById('content-price');
        const imageFile = contentImageFile.files[0];
        
        const imageBase64 = await fileToBase64(imageFile);

        if (formTarget.value === 'project') {
            projectsData.push({ title: titleInput.value.trim(), desc: descInput.value.trim(), image: imageBase64 });
            localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
            showToast("Showcase project berhasil ditambahkan!");
            const projNav = document.querySelector('[data-target="project-view"]');
            if (projNav) projNav.click();
        } else {
            shopData.push({ title: titleInput.value.trim(), desc: descInput.value.trim(), price: priceInput.value.trim() || "Free", image: imageBase64 });
            localStorage.setItem('leoly_shop', JSON.stringify(shopData));
            showToast("Item produk baru berhasil dipajang!");
            const shopNav = document.querySelector('[data-target="shop-view"]');
            if (shopNav) shopNav.click();
        }
        renderHubContent();
        contentForm.reset();
        priceGroup.style.display = 'none';
    });
}

// ==========================================================================
// 8. DATA PROFILE UPDATE CONTROLLER
// ==========================================================================
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const inputNama = profileNameInput.value.trim();
        const inputTag = profileTagInput.value.trim();
        const inputBio = profileBioInput.value.trim();
        const avatarFile = profileAvatarFile.files[0];
        const bannerFile = profileBannerFile.files[0];
        
        profileData.name = inputNama;
        profileData.tag = inputTag;
        profileData.bio = inputBio;
        
        if (avatarFile) {
            const avBase64 = await fileToBase64(avatarFile);
            if (avBase64) profileData.avatar = avBase64;
        }
        if (bannerFile) {
            const bnBase64 = await fileToBase64(bannerFile);
            if (bnBase64) profileData.banner = bnBase64;
        }

        localStorage.setItem('leoly_profile', JSON.stringify(profileData));
        renderHubContent();
        profileAvatarFile.value = ""; 
        profileBannerFile.value = "";
        showToast("Profil berhasil diperbarui!");
        const berandaNav = document.querySelector('[data-target="beranda-view"]');
        if (berandaNav) berandaNav.click();
    });
}

// ==========================================================================
// 9. REFRESH ENGINE INTERFACE UI RENDER
// ==========================================================================
function renderHubContent() {
    if(displayName) displayName.textContent = profileData.name;
    if(displayTag) displayTag.textContent = profileData.tag;
    if(displayBio) displayBio.textContent = profileData.bio;
    
    if (displayAvatar) {
        if (profileData.avatar && profileData.avatar.trim() !== "") {
            displayAvatar.src = profileData.avatar;
        } else {
            displayAvatar.src = DEFAULT_AVATAR_IMG;
        }
        displayAvatar.onerror = function() { this.src = DEFAULT_AVATAR_IMG; };
    }
    
    if (displayBanner) {
        if (profileData.banner && profileData.banner.trim() !== "") {
            displayBanner.style.backgroundImage = `url('${profileData.banner}')`;
        } else {
            displayBanner.style.backgroundImage = `url('${DEFAULT_BANNER_IMG}')`;
        }
    }

    if(profileNameInput) profileNameInput.value = profileData.name;
    if(profileTagInput) profileTagInput.value = profileData.tag;
    if(profileBioInput) profileBioInput.value = profileData.bio;

    if (document.getElementById('count-projects')) {
        document.getElementById('count-projects').textContent = projectsData.length;
        document.getElementById('count-shop').textContent = shopData.length;
        document.getElementById('count-messages').textContent = messagesData.length;
    }

    if (btnClearMessages) {
        btnClearMessages.style.opacity = (messagesData.length === 0) ? "0.5" : "1";
        btnClearMessages.style.cursor = (messagesData.length === 0) ? "not-allowed" : "pointer";
    }

    const isDev = (currentUserRole === "developer");

    // Render Project
    if (projectContainer) {
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
                <div class="card-header"><span>${proj.title}</span></div>
                <p style="color: var(--text-muted); font-size:0.9rem; line-height:1.6;">${proj.desc}</p>
            `;
            projectContainer.appendChild(item);
        });
    }

    // Render Shop (KINI TERINTEGRASI DENGAN REDIRECT WHATSAPP)
    if (shopContainer) {
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
                    <span style="font-size:0.8rem; font-weight:700; color:#ffffff; background:rgba(255,255,255,0.04); padding: 4px 10px; border-radius:100px; border: 1px solid var(--border);">${prod.price}</span>
                </div>
                <p style="color: var(--text-muted); font-size:0.9rem; line-height:1.6; margin-bottom:0.25rem;">${prod.desc}</p>
                <button class="btn btn-primary" style="padding:0.75rem; font-size:0.85rem; margin-top:auto;" onclick="redirectToWhatsApp('${prod.title}', '${prod.price}')">Beli Item</button>
            `;
            shopContainer.appendChild(item);
        });
    }

    // Render Papan Donasi
    if (donationFeedList) {
        donationFeedList.innerHTML = '';
        if (donationData.length === 0) {
            donationFeedList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 2.5rem; letter-spacing: 0.5px;">Belum ada riwayat dukungan apresiasi.</p>`;
        } else {
            donationData.forEach((don, idx) => {
                const feedItem = document.createElement('div');
                feedItem.className = 'donation-premium-card';
                
                feedItem.style.background = 'rgba(255, 255, 255, 0.02)';
                feedItem.style.backdropFilter = 'blur(12px)';
                feedItem.style.webkitBackdropFilter = 'blur(12px)';
                feedItem.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                feedItem.style.borderRadius = '12px';
                feedItem.style.padding = '1.25rem';
                feedItem.style.marginBottom = '1rem';
                feedItem.style.position = 'relative';
                feedItem.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.2)';
                feedItem.style.transition = 'all 0.3s ease';
                
                const formattedAmount = "Rp " + don.amount.toLocaleString('id-ID');
                const deleteButtonHtml = isDev ? `<button onclick="deleteDonator(${idx})" style="position: absolute; right: 12px; bottom: 12px; background: rgba(255,69,58,0.12); border: 1px solid rgba(255,69,58,0.25); color: #ff453a; font-size: 0.75rem; font-weight: 500; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;">Hapus</button>` : '';

                feedItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; gap: 1rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                <strong style="color: #ffffff; font-size: 1rem; font-weight: 600; letter-spacing: 0.3px;">${don.name}</strong>
                                <span style="font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.05); letter-spacing: 0.5px;">${don.method}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: #ffffff; font-weight: 700; font-size: 1.1rem; letter-spacing: -0.3px; background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${formattedAmount}</span>
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.01); border-left: 2px solid rgba(255,255,255,0.4); padding: 0.5rem 0.75rem; margin-top: 0.5rem; border-radius: 0 6px 6px 0; padding-right: ${isDev ? '65px' : '0.75rem'};">
                        <p style="color: #d4d4d4; font-size: 0.88rem; font-style: normal; font-weight: 400; line-height: 1.5; margin: 0; letter-spacing: 0.2px;">"${don.msg}"</p>
                    </div>
                    ${deleteButtonHtml}
                `;
                donationFeedList.appendChild(feedItem);
            });
        }
    }

    // Render Inbox Tiket
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
}

// ==========================================================================
// 10. BOOT EXECUTION INITIALIZER
// ==========================================================================
updateAuthUI();
renderHubContent();
if (typeof lucide !== 'undefined') lucide.createIcons();

// ==========================================================================
// 1. KREDENSIAL DEVELOPER ACCOUNT & KONSTANTA GAMBAR ASSET
// ==========================================================================
const DEV_USER = "leoly";
const DEV_PASS = "dev123";

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

// HELPER: MENGUBAH FILE INPUT MENJADI DATA BASE64 TEXT STRING
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve("");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ==========================================================================
// 3. SYSTEM NOTIFICATION TOAST
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

// FUNGSIONALITAS ACTION SALIN REKENING/E-WALLET CEPAT KANAN VIA HP
function copyToClipboard(textToCopy, providerName) {
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Nomor ${providerName} berhasil disalin!`);
    }).catch(() => {
        showToast("Gagal menyalin nomor otomatis.", "error");
    });
}
window.copyToClipboard = copyToClipboard;

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
// 5. FLOATING GLASS SIDEBAR CONTROLLER SYNC
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

// BARU: Fungsi menghapus data donatur manual dari feed apresiasi
function deleteDonator(index) {
    if(confirm("Hapus riwayat donatur ini dari papan apresiasi?")) {
        donationData.splice(index, 1);
        localStorage.setItem('leoly_donations', JSON.stringify(donationData));
        renderHubContent();
        showToast("Riwayat donatur berhasil dihapus.", "info");
    }
}
window.deleteDonator = deleteDonator;

// BARU: Handler kirim donatur manual dari admin panel
if (adminDonatorForm) {
    adminDonatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dName = document.getElementById('adm-don-name').value.trim();
        const dAmount = parseInt(document.getElementById('adm-don-amount').value) || 0;
        const dMethod = document.getElementById('adm-don-method').value;
        const dMsg = document.getElementById('adm-don-msg').value.trim() || "Terima kasih atas dukungannya!";

        donationData.unshift({
            name: dName,
            amount: dAmount,
            method: dMethod,
            msg: dMsg
        });

        localStorage.setItem('leoly_donations', JSON.stringify(donationData));
        showToast(`Berhasil menambahkan ${dName} ke Papan Apresiasi!`);
        
        adminDonatorForm.reset();
        renderHubContent();
        document.querySelector('[data-target="donate-view"]').click();
    });
}

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

formTarget.addEventListener('change', () => {
    if (formTarget.value === 'shop') {
        priceGroup.style.display = 'block';
    } else {
        priceGroup.style.display = 'none';
    }
});

contentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('content-title');
    const descInput = document.getElementById('content-desc');
    const priceInput = document.getElementById('content-price');
    const imageFile = contentImageFile.files[0];
    const imageBase64 = imageFile ? await fileToBase64(imageFile) : "";

    if (formTarget.value === 'project') {
        projectsData.push({ title: titleInput.value.trim(), desc: descInput.value.trim(), image: imageBase64 });
        localStorage.setItem('leoly_projects', JSON.stringify(projectsData));
        showToast("Showcase project berhasil ditambahkan!");
        document.querySelector('[data-target="project-view"]').click();
    } else {
        shopData.push({ title: titleInput.value.trim(), desc: descInput.value.trim(), price: priceInput.value.trim() || "Free", image: imageBase64 });
        localStorage.setItem('leoly_shop', JSON.stringify(shopData));
        showToast("Item produk baru berhasil dipajang!");
        document.querySelector('[data-target="shop-view"]').click();
    }
    renderHubContent();
    contentForm.reset();
    priceGroup.style.display = 'none';
});

// ==========================================================================
// 8. DATA PROFILE UPDATE CONTROLLER
// ==========================================================================
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
    
    if (avatarFile) profileData.avatar = await fileToBase64(avatarFile);
    if (bannerFile) profileData.banner = await fileToBase64(bannerFile);

    localStorage.setItem('leoly_profile', JSON.stringify(profileData));
    renderHubContent();
    profileAvatarFile.value = ""; 
    profileBannerFile.value = "";
    showToast("Profil berhasil diperbarui!");
    document.querySelector('[data-target="beranda-view"]').click();
});

// ==========================================================================
// 9. REFRESH ENGINE INTERFACE UI RENDER
// ==========================================================================
function renderHubContent() {
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

    profileNameInput.value = profileData.name;
    profileTagInput.value = profileData.tag;
    profileBioInput.value = profileData.bio;

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

    // Render Shop
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
            <button class="btn btn-primary" style="padding:0.75rem; font-size:0.85rem; margin-top:auto;" onclick="showToast('Fitur checkout simulasi berhasil!')">Beli Item</button>
        `;
        shopContainer.appendChild(item);
    });

    // Render Papan Donasi
    if (donationFeedList) {
        donationFeedList.innerHTML = '';
        if (donationData.length === 0) {
            donationFeedList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 2rem;">Belum ada riwayat donasi.</p>`;
        } else {
            donationData.forEach((don, idx) => {
                const feedItem = document.createElement('div');
                feedItem.className = 'card';
                feedItem.style.minHeight = 'auto';
                feedItem.style.padding = '1rem';
                feedItem.style.gap = '0.35rem';
                feedItem.style.position = 'relative';
                const formattedAmount = "Rp " + don.amount.toLocaleString('id-ID');
                
                // Tambahkan tombol hapus kecil di sudut kanan jika berada di Mode Developer
                const deleteButtonHtml = isDev ? `<button onclick="deleteDonator(${idx})" style="position: absolute; right: 10px; bottom: 10px; background: rgba(255,69,58,0.15); border: 1px solid rgba(255,69,58,0.3); color: #ff453a; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; cursor: pointer;">Hapus</button>` : '';

                feedItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-right: ${isDev ? '45px' : '0px'};">
                        <strong style="color: var(--text-main); font-size: 0.95rem;">${don.name}</strong>
                        <span style="color: #ffffff; font-weight: 700; font-size: 0.9rem;">${formattedAmount}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted);"><span>Metode: ${don.method}</span></div>
                    <p style="color: var(--accent-sub); font-size: 0.85rem; font-style: italic; margin-top: 0.25rem; line-height: 1.4;">"${don.msg}"</p>
                    ${deleteButtonHtml}
                `;
                donationFeedList.appendChild(feedItem);
            });
        }
    }

    // Render Inbox Tiket
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

// ==========================================================================
// 10. BOOT EXECUTION INITIALIZER
// ==========================================================================
updateAuthUI();
renderHubContent();
if (typeof lucide !== 'undefined') lucide.createIcons();

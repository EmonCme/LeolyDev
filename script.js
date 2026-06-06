/**
 * LEOLY DEV CORE APPLICATION MOTOR ENGINE
 * Built cleanly for rapid data binding, session validation, and premium presentation.
 */

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    setupNavigation();
    await fetchHeroData();
    await fetchProjectData();
    await logVisitor();
    setupAuthListeners();
    
    // De-hydrate Skeleton Screen
    const skeleton = document.getElementById("skeleton-screen");
    if(skeleton) {
        skeleton.style.opacity = "0";
        setTimeout(() => skeleton.remove(), 400);
    }
}

/* ==========================================================================
   NAVIGATION ENGINE & EFFECT HANDLERS
   ========================================================================== */
function setupNavigation() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggle-sidebar");
    const navItems = document.querySelectorAll(".nav-item");

    // Expand/Collapse Command Matrix
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    // Content Router Tabs Core
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const targetSection = item.getAttribute("data-target");
            document.querySelectorAll(".app-section").forEach(sec => {
                sec.classList.remove("active");
            });
            document.getElementById(targetSection).classList.add("active");
            
            // Mobile Drawer Safety Net Close Action
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("open");
            }
        });
    });
}

/* ==========================================================================
   DATA ENGINE HYDRATION (SUPABASE CONNECTIVITY)
   ========================================================================== */
async function fetchHeroData() {
    try {
        const { data, error } = await window.supabaseClient
            .from('home_content')
            .select('*')
            .single();

        if (error) throw error;
        if (data) {
            document.getElementById("hero-title").innerText = data.title || 'Leoly Dev';
            document.getElementById("hero-subtitle").innerText = data.subtitle || '';
            document.getElementById("hero-desc").innerText = data.description || '';
            document.getElementById("hero-btn-p").innerText = data.button_primary || 'View Work';
            document.getElementById("hero-btn-s").innerText = data.button_secondary || 'Contact';
        }
    } catch (err) {
        showToast("Engine warning: structural layout fetched via fallback local profiles.");
    }
}

async function fetchProjectData() {
    const grid = document.getElementById("projects-grid");
    if(!grid) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if(error) throw error;
        grid.innerHTML = "";

        if(data.length === 0) {
            grid.innerHTML = `<p class="text-muted">No repository entities deployed yet.</p>`;
            return;
        }

        data.forEach(proj => {
            const card = document.createElement("div");
            card.className = "item-card glass-card";
            card.innerHTML = `
                <img src="${proj.thumbnail || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'60\'><rect width=\'100%\' height=\'100%\' fill=\'%23222\'/></svg>'}" class="card-thumb" alt="Asset System Graphic" loading="lazy">
                <div class="card-body">
                    <h3>${proj.title}</h3>
                    <p>${proj.description || ''}</p>
                    <div class="card-actions">
                        ${proj.demo_url ? `<a href="${proj.demo_url}" target="_blank" class="btn btn-primary">Live Scope</a>` : ''}
                        ${proj.source_url ? `<a href="${proj.source_url}" target="_blank" class="btn btn-secondary">Source</a>` : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch(err) {
        grid.innerHTML = `<p class="text-muted">Failed to interface with Supabase architecture layers.</p>`;
    }
}

/* ==========================================================================
   METRICS MONITOR & VISITOR LOG ROUTINE
   ========================================================================== */
async function logVisitor() {
    try {
        await window.supabaseClient.from('visitors').insert([{ ip: "client-node-hit" }]);
    } catch (e) {
        // Silent logs to protect continuous deployment flows
    }
}

/* ==========================================================================
   ADMIN AUTHENTICATION & SECURE GATEWAYS
   ========================================================================== */
function setupAuthListeners() {
    const loginForm = document.getElementById("login-form");
    if(loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("auth-email").value;
            const password = document.getElementById("auth-password").value;

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if(error) {
                showToast("Access Denied: Invalid Security Key.");
            } else {
                showToast("System Secured. Session Open.");
                hydrateAdminDashboard();
            }
        });
    }

    const logoutBtn = document.getElementById("auth-logout-btn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await window.supabaseClient.auth.signOut();
            showToast("Session Terminated Safely.");
            location.reload();
        });
    }
}

async function hydrateAdminDashboard() {
    document.getElementById("admin-auth-gate").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");

    // Fetch Analytics Summaries
    const { count: countV } = await window.supabaseClient.from('visitors').select('*', { count: 'exact', head: true });
    const { count: countP } = await window.supabaseClient.from('projects').select('*', { count: 'exact', head: true });
    const { count: countPr } = await window.supabaseClient.from('products').select('*', { count: 'exact', head: true });

    document.getElementById("stat-visitors").innerText = countV || 0;
    document.getElementById("stat-projects").innerText = countP || 0;
    document.getElementById("stat-products").innerText = countPr || 0;

    initAnalyticsChart();
    setupAdminFormSubmissions();
}

/* ==========================================================================
   ANALYTICS CHART SYSTEM ENGINE
   ========================================================================== */
function initAnalyticsChart() {
    const ctx = document.getElementById('visitorChart');
    if(!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Node Alpha', 'Node Beta', 'Node Gamma', 'Node Delta', 'Node Zeta'],
            datasets: [{
                label: 'Telemetry Traffic Feed',
                data: [12, 19, 3, 5, 2],
                borderColor: '#ffffff',
                borderWidth: 2,
                backgroundColor: 'rgba(255,255,255,0.02)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aaa' } },
                x: { grid: { display: false }, ticks: { color: '#aaa' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

/* ==========================================================================
   ADMIN ACTIONS (CRUD & UPLOADER ROUTINE)
   ========================================================================== */
function setupAdminFormSubmissions() {
    const homeForm = document.getElementById("admin-home-form");
    homeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("adm-h-title").value;
        const subtitle = document.getElementById("adm-h-subtitle").value;
        const description = document.getElementById("adm-h-desc").value;

        const { error } = await window.supabaseClient
            .from('home_content')
            .update({ title, subtitle, description })
            .eq('id', 1);

        if(!error) {
            showToast("System State Synchronized to Cloud.");
            fetchHeroData();
        } else {
            showToast("Error updating remote structural nodes.");
        }
    });
}

/* ==========================================================================
   TOAST PIPELINE UTILITY
   ========================================================================== */
function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

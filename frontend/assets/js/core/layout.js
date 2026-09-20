/**
 * layout.js
 * ---------------------------------------------------------
 * Renders the sidebar + topbar shared by every authenticated page,
 * so nav markup lives in exactly one place instead of ten HTML files.
 * Each page only needs:
 *   <div id="app-sidebar"></div>
 *   <header id="app-topbar"></header>
 *   <script>EduResultLayout.mount({ activePage: 'admin-dashboard.html', roles: ['admin','teacher'] });</script>
 * ---------------------------------------------------------
 */
(function (global) {
  const NAV = {
    admin: [
      { page: 'admin-dashboard.html', label: 'Tổng quan', icon: 'home' },
      { page: 'grade-entry.html', label: 'Nhập điểm', icon: 'upload' },
      { page: 'student-list.html', label: 'Danh sách SV', icon: 'users' },
      { page: 'reports.html', label: 'Báo cáo', icon: 'bar-chart' },
      { page: 'search.html', label: 'Tra cứu', icon: 'search' },
    ],
    student: [
      { page: 'student-dashboard.html', label: 'Tổng quan', icon: 'home' },
      { page: 'transcript.html', label: 'Kết quả học tập', icon: 'graduation-cap' },
      { page: 'search.html', label: 'Tra cứu', icon: 'search' },
    ],
  };
  NAV.teacher = NAV.admin;

  const ROLE_LABEL = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Sinh viên' };
  const THEME_KEY = 'eduresult_theme';

  function initials(name) {
    return (name || '?').trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();
  }

  function avatarColor(seed) {
    const palette = ['#6C5DD3', '#4F7CFF', '#22C55E', '#F5B400', '#EF4444', '#38BDF8'];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % palette.length;
    return palette[h];
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('.theme-toggle__label').forEach((el) => { el.textContent = theme === 'dark' ? 'Dark' : 'Light'; });
  }

  function currentTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function renderSidebar(role, activePage) {
    const items = NAV[role] || NAV.student;
    const links = items.map((item) => `
      <a class="sidebar__link ${item.page === activePage ? 'is-active' : ''}" href="${item.page}">
        ${Icons.icon(item.icon)}
        <span>${item.label}</span>
      </a>`).join('');

    return `
      <div class="sidebar__backdrop" id="sidebarBackdrop"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__brand-mark">ER</div>
          <div>
            <div class="sidebar__brand-name">EduResult</div>
            <div class="sidebar__brand-tag">Tra cứu kết quả thi tuyển</div>
          </div>
        </div>
        <nav class="sidebar__nav">${links}</nav>
        <div class="sidebar__footer">
          <div class="sidebar__mascot">
            <strong>Học tốt, thi tốt!</strong>
            Tương lai rộng mở đang chờ bạn.
          </div>
        </div>
      </aside>`;
  }

  function renderTopbar(session) {
    const role = EduResultAuth.effectiveRole();
    const user = session && session.user ? session.user : {};
    const userName = user.fullName || user.name || 'Người dùng';
    const canSwitch = EduResultAuth.canSwitchRole();
    const roleTabs = ['admin', 'teacher', 'student'].map((r) => `
      <button class="role-switch__opt ${role === r ? 'is-active' : ''}" data-role="${r}">${ROLE_LABEL[r]}</button>
    `).join('');

    return `
      <button class="topbar__menu-btn" id="menuToggle" aria-label="Mở menu">${Icons.icon('menu')}</button>

      <div class="topbar__search">
        ${Icons.icon('search')}
        <input type="search" id="globalSearch" placeholder="Tra cứu nhanh theo Tên hoặc Mã số sinh viên...">
      </div>

      ${canSwitch ? `
      <div class="role-switch" id="roleSwitch">
        <span class="role-switch__label">Chuyển đổi vai trò</span>
        ${roleTabs}
      </div>` : ''}

      <div class="topbar__spacer"></div>

      <button class="theme-toggle" id="themeToggle">
        <span>${Icons.icon('sun')}</span>
        <span class="theme-toggle__track"><span class="theme-toggle__thumb"></span></span>
        <span class="theme-toggle__label">Light</span>
      </button>

      <div class="dropdown" id="notifDropdown">
        <button class="icon-btn" id="notifBtn" aria-label="Thông báo">
          ${Icons.icon('bell')}
          <span class="icon-btn__dot hidden" id="notifDot">0</span>
        </button>
        <div class="dropdown__panel" id="notifPanel">
          <div class="text-xs font-bold text-muted" style="padding:8px 10px;">Thông báo</div>
          <div id="notifList"></div>
        </div>
      </div>

      <div class="dropdown" id="userDropdown">
        <button class="user-chip" id="userBtn" style="border:none;background:none;">
          <div class="user-chip__avatar" style="background:${avatarColor(userName)}">${initials(userName)}</div>
          <div>
            <div class="user-chip__name">${userName}</div>
            <div class="user-chip__role">${ROLE_LABEL[role]}</div>
          </div>
          ${Icons.icon('chevron-down', 'text-muted')}
        </button>
        <div class="dropdown__panel" style="width:200px;">
          <button class="dropdown__item flex items-center gap-8 w-full" id="logoutBtn" style="border:none;background:none;text-align:left;color:var(--danger);">
            ${Icons.icon('log-out')} Đăng xuất
          </button>
        </div>
      </div>`;
  }

  function wireDropdown(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const btn = el.querySelector('button');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = el.classList.contains('is-open');
      document.querySelectorAll('.dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
      if (!wasOpen) el.classList.add('is-open');
    });
  }

  function renderNotifications() {
    EduResultAPI.notifications.list().then((rows) => {
      const list = document.getElementById('notifList');
      const dot = document.getElementById('notifDot');
      if (!list) return;

      const unread = rows.filter((r) => !r.read).length;
      if (dot) {
        if (unread > 0) {
          dot.textContent = unread;
          dot.classList.remove('hidden');
        } else {
          dot.textContent = '0';
          dot.classList.add('hidden');
        }
      }

      list.innerHTML = rows.map((r) => `
        <div class="dropdown__item ${r.read ? 'is-read' : ''}" data-notif-id="${r.id}" style="cursor:pointer;">
          <div class="dropdown__item-title">${r.title}</div>
          <div class="dropdown__item-desc">${r.desc}</div>
        </div>`).join('') || `<div class="dropdown__item text-muted">Không có thông báo mới</div>`;

      list.querySelectorAll('[data-notif-id]').forEach((item) => {
        item.addEventListener('click', async (event) => {
          const id = Number(item.dataset.notifId);
          if (!id || event.currentTarget.classList.contains('is-read')) return;
          try {
            await EduResultAPI.notifications.markRead(id);
            renderNotifications();
          } catch (err) {
            console.error('Mark notification read failed:', err);
          }
        });
      });
    }).catch((err) => {
      console.error('Load notifications failed:', err);
      const list = document.getElementById('notifList');
      if (list) {
        list.innerHTML = '<div class="dropdown__item text-muted">Không thể tải thông báo</div>';
      }
    });
  }

  function mount({ activePage, roles }) {
    const session = EduResultAuth.requireRole(roles);
    if (!session) return null;

    applyTheme(currentTheme());

    const role = EduResultAuth.effectiveRole();
    const sidebarRoot = document.getElementById('app-sidebar');
    const topbarRoot = document.getElementById('app-topbar');
    if (sidebarRoot) sidebarRoot.innerHTML = renderSidebar(role, activePage);
    if (topbarRoot) topbarRoot.innerHTML = renderTopbar(session);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
    }

    // Mobile sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
        backdrop.classList.toggle('is-open');
      });
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('is-open');
      });
    }

    // Dropdowns
    wireDropdown('notifDropdown');
    wireDropdown('userDropdown');
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
    });
    renderNotifications();

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', EduResultAuth.logout);

    // Role preview switch (admin only)
    const roleSwitch = document.getElementById('roleSwitch');
    if (roleSwitch) {
      roleSwitch.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-role]');
        if (!btn) return;
        EduResultAuth.setViewRole(btn.dataset.role);
        window.location.href = EduResultAuth.homeForRole(btn.dataset.role);
      });
    }

    // Global search -> jump to search.html with the query
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          window.location.href = 'search.html?q=' + encodeURIComponent(searchInput.value.trim());
        }
      });
    }

    return session;
  }

  global.EduResultLayout = { mount, initials, avatarColor, ROLE_LABEL };
})(window);

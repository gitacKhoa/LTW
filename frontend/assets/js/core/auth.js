/**
 * auth.js
 * ---------------------------------------------------------
 * Session handling for the demo. Swap `SESSION_KEY` storage calls
 * for real cookie/JWT handling once /api/auth/* is backed by Node.js.
 *
 * Session shape: { token, role, viewRole, user }
 *  - role     = the account's real role (admin | teacher | student)
 *  - viewRole = the role currently being PREVIEWED in the UI.
 *               Only an admin account may preview other dashboards
 *               (mirrors the "Chuyển đổi vai trò" switch in the design).
 * ---------------------------------------------------------
 */
(function (global) {
  const SESSION_KEY = 'eduresult_session';

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    const s = getSession();
    return !!(s && s.token);
  }

  // The role actually shown on screen right now.
  function effectiveRole() {
    const s = getSession();
    if (!s) return null;
    return s.viewRole || s.role;
  }

  // Only admins get to preview the Teacher / Student dashboards.
  function canSwitchRole() {
    const s = getSession();
    return !!(s && s.role === 'admin');
  }

  function setViewRole(role) {
    const s = getSession();
    if (!s) return;
    s.viewRole = role;
    setSession(s);
  }

  const DEFAULT_PAGE = {
    admin: 'admin-dashboard.html',
    teacher: 'admin-dashboard.html',
    student: 'student-dashboard.html',
  };

  function homeForRole(role) {
    return DEFAULT_PAGE[role] || 'login.html';
  }

  // Call at the top of every protected page.
  // allowedRoles: array of roles (checked against the EFFECTIVE role)
  function requireRole(allowedRoles) {
    const s = getSession();
    if (!s || !s.token) {
      window.location.href = 'login.html';
      return null;
    }
    const role = effectiveRole();
    if (!allowedRoles.includes(role)) {
      window.location.href = homeForRole(role);
      return null;
    }
    return s;
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  global.EduResultAuth = {
    getSession, setSession, clearSession, isLoggedIn,
    effectiveRole, canSwitchRole, setViewRole,
    homeForRole, requireRole, logout,
  };
})(window);

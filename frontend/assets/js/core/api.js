/**
 * api.js
 * ---------------------------------------------------------
 * Single access point the pages use to talk to "the backend".
 *
 * Today every function reads/writes the mock DB in localStorage.
 * Each function is commented with the exact REST endpoint from the
 * Integration & API Brief it stands in for. When the Node.js API
 * is ready, only the *inside* of these functions needs to change
 * to real `fetch(BASE_URL + path, ...)` calls — every page.js file
 * that calls `EduResultAPI.xxx()` can stay untouched.
 * ---------------------------------------------------------
 */
(function (global) {
  const BASE_URL = 'http://localhost:5000/api';
  const LATENCY = 260;

  const db = () => global.EduResultMockDB.loadDatabase();
  const save = (d) => global.EduResultMockDB.saveDatabase(d);
  const { classification, academicRank, round1 } = global.EduResultMockDB;

  function delay(value, fail) {
    return new Promise((resolve, reject) => {
      setTimeout(() => (fail ? reject(value) : resolve(value)), LATENCY);
    });
  }

  function authHeaders(extra = {}) {
    const session = global.EduResultAuth && global.EduResultAuth.getSession ? global.EduResultAuth.getSession() : null;
    const token = session && session.token ? session.token : null;
    return {
      ...extra,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function requestJson(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const method = options.method || 'GET';
    const headers = { ...(options.headers || {}) };
    const isFormData = options.body instanceof FormData;

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      method,
      headers: {
        ...authHeaders(),
        ...headers,
      },
    });

    const responseText = await response.text();
    let payload = null;
    if (responseText) {
      try { payload = JSON.parse(responseText); } catch (e) { payload = responseText; }
    }

    if (!response.ok) {
      const message = payload && payload.message ? payload.message : 'Request failed';
      throw new Error(message);
    }

    return payload;
  }

  function makeToken(user) {
    return btoa(JSON.stringify({ uid: user.id, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 8 }));
  }

  function readToken(token) {
    try { return JSON.parse(atob(token)); } catch (e) { return null; }
  }

  function publicUser(u) {
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  }

  function studentSummary(studentId) {
    const state = db();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return null;
    const grades = state.grades.filter((g) => g.studentId === studentId);
    return {
      studentId,
      totalSubjects: grades.length,
      gpa: student.gpa,
      classification: student.rank,
      status: student.status,
    };
  }

  const EduResultAPI = {

    // =====================================================
    // AUTH  ->  /api/auth/*
    // =====================================================
    auth: {
      async login({ email, password }) {
        const payload = await requestJson('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: email, password }),
        });
        return {
          token: payload.token,
          role: payload.user?.role || 'student',
          user: payload.user || null,
        };
      },

      async register({ name, email, password }) {
        const payload = await requestJson('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            fullName: name,
            username: email,
            password,
            userCode: `ST-${Date.now()}`,
          }),
        });
        return {
          token: payload.token,
          role: payload.user?.role || 'student',
          user: payload.user || null,
        };
      },

      async me(token) {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const payload = await requestJson('/auth/me', { headers });
        return {
          user: payload.user || null,
          role: payload.user?.role || null,
        };
      },
    },

    // =====================================================
    // USERS  ->  /api/users/*  (admin only)
    // =====================================================
    users: {
      async list({ role } = {}) {
        const payload = await requestJson(`/students?limit=200`);
        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        const filtered = role ? rows.filter((u) => (u.user && u.user.role) === role) : rows;
        return filtered.map((u) => ({
          id: u.id,
          name: u.fullName || u.name,
          role: u.user?.role || 'student',
          email: u.email,
          studentCode: u.studentCode,
          class: u.className || u.class,
        }));
      },

      async updateRole(id, role) {
        return requestJson(`/students/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ role }),
        });
      },
    },

    subjects: {
      async list() {
        const payload = await requestJson('/subjects');
        return Array.isArray(payload) ? payload.map((subject) => ({
          id: subject.id,
          name: subject.name,
          credits: subject.credits,
          isActive: subject.isActive,
        })) : [];
      },
    },

    // =====================================================
    // STUDENTS  ->  /api/students/*
    // =====================================================
    students: {
      async list({ search = '', page = 1, limit = 10, klass = '' } = {}) {
        const payload = await requestJson(`/students?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}&klass=${encodeURIComponent(klass)}`);
        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        return {
          rows: rows.map((s) => ({
            ...s,
            id: s.id,
            name: s.fullName || s.name,
            class: s.className || s.class,
            rank: s.academicRank || s.rank || '—',
            gpa: Number(s.gpa) || null,
            studentCode: s.studentCode,
          })),
          total: payload.total || rows.length,
          page: payload.page || page,
          limit: payload.limit || limit,
        };
      },

      async grades(studentId) {
        const payload = await requestJson(`/grades/student/${encodeURIComponent(studentId)}`);
        const rows = Array.isArray(payload.courses) ? payload.courses : [];
        return rows.map((g) => ({
          id: g.id,
          studentId,
          subjectId: g.subjectId,
          subjectName: g.subjectName,
          processScore: Number(g.processScore || 0),
          examScore: Number(g.examScore || 0),
          totalScore: Number(g.totalScore || 0),
          evaluation: g.evaluation || 'Chưa có KQ',
        }));
      },

      async summary(studentId) {
        const payload = await requestJson(`/grades/student/${encodeURIComponent(studentId)}`);
        const rows = Array.isArray(payload.courses) ? payload.courses : [];
        return {
          studentId: payload.student?.id || studentId,
          totalSubjects: rows.length,
          gpa: Number(payload.gpa) || null,
          classification: payload.academicRank || payload.student?.academicRank || 'Chưa xếp loại',
          status: payload.student?.status || 'none',
        };
      },
    },

    // =====================================================
    // GRADES  ->  /api/grades/*
    // =====================================================
    grades: {
      async search({ query = '', type = 'all', page = 1, limit = 8 } = {}) {
        const payload = await requestJson(`/grades/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}&page=${page}&limit=${limit}`);
        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        return {
          rows: rows.map((s) => ({
            ...s,
            id: s.id,
            name: s.name || s.fullName,
            class: s.class || s.className,
            mssv: s.studentCode || s.mssv,
          })),
          total: payload.total || rows.length,
          page: payload.page || page,
          limit: payload.limit || limit,
        };
      },

      async create({ studentId, subjectId, processScore, examScore }) {
        return requestJson('/grades', {
          method: 'POST',
          body: JSON.stringify({ studentId, subjectId, processScore, examScore }),
        });
      },

      async update(id, { processScore, examScore }) {
        return requestJson(`/grades/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify({ processScore, examScore }),
        });
      },

      async upload(file, rowCountGuess) {
        if (!file) {
          throw new Error('Vui lòng chọn file Excel để nhập điểm.');
        }

        const formData = new FormData();
        formData.append('file', file);

        const payload = await requestJson('/grades/upload', {
          method: 'POST',
          body: formData,
        });

        return {
          fileName: file.name,
          successCount: payload.successCount || 0,
          errorRows: payload.errorRows || [],
          totalRows: payload.totalRows || 0,
          message: payload.message || 'Import Excel hoàn tất',
        };
      },
    },

    // =====================================================
    // STATS  ->  /api/dashboard/*
    // =====================================================
    stats: {
      async passFail({ klass = '' } = {}) {
        const payload = await requestJson(`/dashboard/stats${klass ? `?klass=${encodeURIComponent(klass)}` : ''}`);
        return {
          pass: payload.passCount || 0,
          fail: payload.failCount || 0,
          none: 0,
          total: payload.totalStudents || 0,
        };
      },

      async overview() {
        const payload = await requestJson('/dashboard/stats');
        return {
          totalStudents: payload.totalStudents || 0,
          highestAvgScore: Number(payload.highestStudent?.gpa) || 0,
          avgScore: Number(payload.averageGpa) || 0,
        };
      },

      async exportExcel() {
        const response = await fetch(`${BASE_URL}/dashboard/export/excel`, {
          headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Xuất Excel thất bại');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'bao-cao-sinh-vien.xlsx';
        anchor.click();
        URL.revokeObjectURL(url);
        return true;
      },

      async exportPdf() {
        const response = await fetch(`${BASE_URL}/dashboard/export/pdf`, {
          headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Xuất PDF thất bại');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'bao-cao-sinh-vien.pdf';
        anchor.click();
        URL.revokeObjectURL(url);
        return true;
      },

      async passFailByClass() {
        const { rows = [] } = await EduResultAPI.students.list({ limit: 500 });
        const grouped = rows.reduce((acc, student) => {
          const key = student.class || 'Chưa có lớp';
          if (!acc[key]) acc[key] = { class: key, total: 0, pass: 0, fail: 0, none: 0 };
          acc[key].total += 1;
          if (student.status === 'pass') acc[key].pass += 1;
          else if (student.status === 'fail') acc[key].fail += 1;
          else acc[key].none += 1;
          return acc;
        }, {});
        return Object.values(grouped).sort((a, b) => a.class.localeCompare(b.class));
      },
    },

    // =====================================================
    // LEADERBOARD  ->  /api/dashboard/leaderboard
    // =====================================================
    leaderboard: {
      async top(limit = 10) {
        const payload = await requestJson(`/dashboard/leaderboard?limit=${limit}`);
        return Array.isArray(payload) ? payload.map((student) => ({
          id: student.id,
          name: student.fullName,
          class: student.className,
          gpa: Number(student.gpa || 0),
          rank: student.academicRank || 'Chưa xếp loại',
          studentCode: student.studentCode,
          status: student.status,
        })) : [];
      },
    },

    // =====================================================
    // NOTIFICATIONS (supporting data shown in the topbar bell)
    // =====================================================
    notifications: {
      async list() {
        const payload = await requestJson('/notifications');
        return Array.isArray(payload) ? payload.map((item) => ({
          id: item.id,
          title: item.title,
          desc: item.description || item.desc || '',
          read: item.isRead ?? item.read ?? false,
        })) : [];
      },

      async markRead(id) {
        return await requestJson(`/notifications/${id}/read`, { method: 'PATCH' });
      },
    },
  };

  global.EduResultAPI = EduResultAPI;
})(window);

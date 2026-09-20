(function () {
  const session = EduResultLayout.mount({ activePage: 'student-list.html', roles: ['admin', 'teacher'] });
  if (!session) return;

  document.getElementById('searchIconWrap').innerHTML = Icons.icon('search');

  const state = { search: '', klass: '', status: '', page: 1, limit: 8 };

  function populateClassOptions() {
    EduResultAPI.students.list({ limit: 500 }).then((res) => {
      const classes = [...new Set(res.rows.map((s) => s.class || s.className).filter(Boolean))].sort();
      document.getElementById('classFilter').innerHTML += classes.map((c) => `<option value="${c}">${c}</option>`).join('');
    }).catch(() => {
      document.getElementById('classFilter').innerHTML += '<option value="">Không tải được lớp</option>';
    });
  }

  populateClassOptions();

  function statusRowsFilter(rows) {
    if (!state.status) return rows;
    return rows.filter((s) => s.status === state.status);
  }

  function load() {
    const body = document.getElementById('studentListBody');
    body.innerHTML = UI.skeletonRows(7, 5);

    EduResultAPI.students.list({ search: state.search, klass: state.klass, page: state.page, limit: 200 }).then((res) => {
      const filtered = statusRowsFilter(res.rows);
      const total = filtered.length;
      const start = (state.page - 1) * state.limit;
      const pageRows = filtered.slice(start, start + state.limit);

      document.getElementById('totalCountLabel').textContent = `${res.total} sinh viên trong hệ thống`;

      if (!pageRows.length) {
        body.innerHTML = `<tr><td colspan="7" class="text-muted text-sm" style="text-align:center;padding:30px;">Không tìm thấy sinh viên phù hợp.</td></tr>`;
      } else {
        body.innerHTML = pageRows.map((s) => {
          const gpa = Number(s.gpa);
          const gpaText = Number.isFinite(gpa) ? gpa.toFixed(1) : '—';
          const rankText = s.rank || '—';

          return `
            <tr>
              <td class="table-sub font-bold">${s.studentCode || s.id}</td>
              <td>
                <div class="table-person">
                  ${UI.avatarChip(s.name)}
                  <div>
                    <div class="table-name">${UI.escapeHtml(s.name)}</div>
                    <div class="table-sub">${s.email || '—'}</div>
                  </div>
                </div>
              </td>
              <td>${s.class || '—'}</td>
              <td class="font-bold">${gpaText}</td>
              <td>${rankText}</td>
              <td>${UI.statusBadge(s.status)}</td>
              <td><a class="btn btn-secondary btn-sm" href="transcript.html?studentId=${s.id}">Xem chi tiết</a></td>
            </tr>`;
        }).join('');
      }

      UI.renderPagination(document.getElementById('listPagination'), {
        page: state.page, limit: state.limit, total,
        onChange: (p) => { state.page = p; load(); },
      });
    });
  }

  document.getElementById('listSearch').addEventListener('input', UI.debounce((e) => {
    state.search = e.target.value; state.page = 1; load();
  }, 300));
  document.getElementById('classFilter').addEventListener('change', (e) => {
    state.klass = e.target.value; state.page = 1; load();
  });
  document.getElementById('statusTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;
    document.querySelectorAll('#statusTabs .tabs__btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.status = btn.dataset.status; state.page = 1; load();
  });

  load();
})();

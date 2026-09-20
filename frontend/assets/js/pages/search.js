(function () {
  const session = EduResultLayout.mount({ activePage: 'search.html', roles: ['admin', 'teacher', 'student'] });
  if (!session) return;

  document.getElementById('searchIconWrap2').innerHTML = Icons.icon('search');

  const params = new URLSearchParams(window.location.search);
  const state = { query: params.get('q') || '', type: 'all', page: 1, limit: 8 };
  document.getElementById('mainSearch').value = state.query;

  function load() {
    const body = document.getElementById('searchBody');
    body.innerHTML = UI.skeletonRows(6, 4);

    EduResultAPI.grades.search({ query: state.query, type: state.type, page: state.page, limit: state.limit }).then((res) => {
      document.getElementById('resultCountLabel').textContent = state.query
        ? `Tìm thấy ${res.total} kết quả cho "${state.query}"`
        : `Hiển thị toàn bộ ${res.total} sinh viên`;

      if (!res.rows.length) {
        body.innerHTML = `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:30px;">Không tìm thấy kết quả phù hợp.</td></tr>`;
      } else {
        body.innerHTML = res.rows.map((s) => `
          <tr>
            <td class="table-sub font-bold">${UI.escapeHtml(s.studentCode || s.mssv || s.id)}</td>
            <td>
              <div class="table-person">
                ${UI.avatarChip(s.name)}
                <div class="table-name">${UI.escapeHtml(s.name)}</div>
              </div>
            </td>
            <td>${UI.escapeHtml(s.class || '—')}</td>
            <td class="font-bold">${s.gpa !== null && s.gpa !== undefined ? Number(s.gpa).toFixed(1) : '—'}</td>
            <td>${UI.statusBadge(s.status || 'none')} <span class="text-xs text-muted">${UI.escapeHtml(s.rank || 'Chưa xếp loại')}</span></td>
            <td><a class="btn btn-secondary btn-sm" href="transcript.html?studentId=${encodeURIComponent(s.id)}">Xem bảng điểm</a></td>
          </tr>`).join('');
      }

      UI.renderPagination(document.getElementById('searchPagination'), {
        page: state.page, limit: state.limit, total: res.total,
        onChange: (p) => { state.page = p; load(); },
      });
    }).catch((err) => {
      body.innerHTML = `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:30px;">${UI.escapeHtml(err.message || 'Không thể tải dữ liệu tìm kiếm.')}</td></tr>`;
    });
  }

  document.getElementById('mainSearch').addEventListener('input', UI.debounce((e) => {
    state.query = e.target.value; state.page = 1; load();
  }, 300));
  document.getElementById('typeTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    document.querySelectorAll('#typeTabs .tabs__btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.type = btn.dataset.type; state.page = 1; load();
  });

  load();
})();

(function () {
  const session = EduResultLayout.mount({ activePage: 'reports.html', roles: ['admin', 'teacher'] });
  if (!session) return;

  document.getElementById('miIconStudents').innerHTML = Icons.icon('users');
  document.getElementById('miIconPass').innerHTML = Icons.icon('check-circle');
  document.getElementById('miIconAvg').innerHTML = Icons.icon('bar-chart');

  EduResultAPI.stats.overview().then((res) => {
    const totalStudents = Number(res.totalStudents || 0);
    const avgScore = Number(res.avgScore || 0);
    document.getElementById('miTotal').textContent = totalStudents.toLocaleString('vi-VN');
    document.getElementById('miAvg').textContent = Number.isFinite(avgScore) && avgScore > 0 ? avgScore.toFixed(1) : '—';
  });

  EduResultAPI.stats.passFail().then((res) => {
    UI.renderDonut(document.getElementById('reportDonut'), res);
    const total = res.total || 1;
    const pct = (n) => Math.round((n / total) * 100);
    document.getElementById('reportDonutPct').textContent = pct(res.pass) + '%';
    document.getElementById('miPassRate').textContent = pct(res.pass) + '%';
    document.getElementById('reportLegend').innerHTML = `
      <div class="legend__row"><span class="legend__dot" style="background:var(--success)"></span>Đậu <span class="legend__count">${pct(res.pass)}% (${res.pass})</span></div>
      <div class="legend__row"><span class="legend__dot" style="background:var(--fail)"></span>Rớt <span class="legend__count">${pct(res.fail)}% (${res.fail})</span></div>
      <div class="legend__row"><span class="legend__dot" style="background:var(--border-strong)"></span>Chưa có kết quả <span class="legend__count">${pct(res.none)}% (${res.none})</span></div>
    `;
  });

  EduResultAPI.stats.passFailByClass().then((rows) => {
    document.getElementById('classBreakdown').innerHTML = rows.map((r) => {
      const rate = r.total ? Math.round((r.pass / r.total) * 100) : 0;
      return `
        <div>
          <div class="flex items-center justify-between text-sm" style="margin-bottom:6px;">
            <span class="font-bold">${r.class}</span>
            <span class="text-muted">${r.pass}/${r.total} đậu (${rate}%)</span>
          </div>
          <div style="height:10px;border-radius:var(--r-pill);background:var(--border);overflow:hidden;">
            <div style="height:100%;width:${rate}%;background:linear-gradient(90deg, var(--success), #16A34A);border-radius:var(--r-pill);"></div>
          </div>
        </div>`;
    }).join('');
  });

  const exportButtons = document.querySelectorAll('[data-export]');
  exportButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const type = button.dataset.export;
      try {
        button.disabled = true;
        button.textContent = type === 'excel' ? 'Đang xuất Excel...' : 'Đang xuất PDF...';
        if (type === 'excel') await EduResultAPI.stats.exportExcel();
        if (type === 'pdf') await EduResultAPI.stats.exportPdf();
        UI.toast(type === 'excel' ? 'Xuất Excel thành công.' : 'Xuất PDF thành công.', 'success');
      } catch (error) {
        UI.toast(error.message || 'Xuất báo cáo thất bại.', 'error');
      } finally {
        button.disabled = false;
        button.textContent = type === 'excel' ? 'Xuất Excel' : 'Xuất PDF';
      }
    });
  });
})();

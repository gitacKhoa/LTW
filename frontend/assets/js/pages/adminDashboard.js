(function () {
  const session = EduResultLayout.mount({ activePage: 'admin-dashboard.html', roles: ['admin', 'teacher'] });
  if (!session) return;

  document.getElementById('trophyIconWrap').innerHTML = Icons.icon('trophy');
  document.getElementById('iconUsers').innerHTML = Icons.icon('users');
  document.getElementById('iconStar').innerHTML = Icons.icon('star');
  document.getElementById('dropzoneIcon').innerHTML = Icons.icon('upload-cloud');

  // ---- Pass/fail donut ----
  EduResultAPI.stats.passFail().then((res) => {
    UI.renderDonut(document.getElementById('passFailDonut'), res);
    const total = res.total || 1;
    const pct = (n) => Math.round((n / total) * 100);
    document.getElementById('donutPct').textContent = pct(res.pass) + '%';
    document.getElementById('passFailLegend').innerHTML = `
      <div class="legend__row"><span class="legend__dot" style="background:var(--success)"></span>Đậu <span class="legend__count">${pct(res.pass)}% (${res.pass})</span></div>
      <div class="legend__row"><span class="legend__dot" style="background:var(--fail)"></span>Rớt <span class="legend__count">${pct(res.fail)}% (${res.fail})</span></div>
      <div class="legend__row"><span class="legend__dot" style="background:var(--border-strong)"></span>Chưa có kết quả <span class="legend__count">${pct(res.none)}% (${res.none})</span></div>
    `;
  });

  // ---- Overview stat cards ----
  EduResultAPI.stats.overview().then((res) => {
    const totalStudents = Number(res.totalStudents || 0);
    const highestAvg = Number(res.highestAvgScore || 0);
    document.getElementById('statTotalStudents').textContent = totalStudents.toLocaleString('vi-VN');
    document.getElementById('statTotalDelta').textContent = 'Toàn hệ thống';
    document.getElementById('statHighest').textContent = Number.isFinite(highestAvg) && highestAvg > 0 ? highestAvg.toFixed(1) : '—';
    document.getElementById('statHighestSub').textContent = Number.isFinite(highestAvg) && highestAvg > 0 ? 'Điểm GPA cao nhất hiện tại' : 'Chưa có dữ liệu GPA';
  });

  // ---- Leaderboard preview (top 3) ----
  EduResultAPI.leaderboard.top(3).then((rows) => {
    const medalColors = ['#F5B400', '#9AA0B8', '#C57A3F'];
    document.getElementById('leaderboardPreview').innerHTML = rows.map((s, i) => `
      <div class="flex items-center gap-12">
        <div class="rank-pill" style="background:${medalColors[i]}22;color:${medalColors[i]};border-color:${medalColors[i]}55;">${i + 1}</div>
        <div class="table-avatar" style="background:${EduResultLayout.avatarColor(s.name)}">${EduResultLayout.initials(s.name)}</div>
        <div style="flex:1;min-width:0;">
          <div class="table-name" style="font-size:var(--fs-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${UI.escapeHtml(s.name)}</div>
          <div class="table-sub">${s.class}</div>
        </div>
        <div class="font-bold" style="color:var(--warn);">${s.gpa.toFixed(1)}</div>
      </div>`).join('') || `<div class="text-muted text-sm">Chưa có dữ liệu.</div>`;
  });

  // ---- Dropzone (dashboard quick-upload) ----
  const dropzone = document.getElementById('dashDropzone');
  const fileInput = document.getElementById('dashFileInput');
  document.getElementById('dashChooseFile').addEventListener('click', () => fileInput.click());

  function handleFile(file) {
    if (!file) return;
    UI.toast('Đang tải lên ' + file.name + '...');
    EduResultAPI.grades.upload(file).then((res) => {
      if (res.errorRows.length) {
        UI.toast(`Đã nhập ${res.successCount} dòng, ${res.errorRows.length} dòng lỗi. Xem chi tiết ở trang Nhập điểm.`, 'error');
      } else {
        UI.toast(`Nhập thành công ${res.successCount} dòng điểm từ ${file.name}.`, 'success');
      }
    }).catch((err) => {
      UI.toast(err.message || 'Import Excel thất bại.', 'error');
    });
  }
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
  ['dragenter', 'dragover'].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragover'); }));
  dropzone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
})();

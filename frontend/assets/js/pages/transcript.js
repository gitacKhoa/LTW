(function () {
  const session = EduResultLayout.mount({ activePage: 'transcript.html', roles: ['admin', 'teacher', 'student'] });
  if (!session) return;

  document.getElementById('iconSubj').innerHTML = Icons.icon('graduation-cap');
  document.getElementById('iconGpa2').innerHTML = Icons.icon('star');
  document.getElementById('iconRank2').innerHTML = Icons.icon('trophy');
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  const role = EduResultAuth.effectiveRole();
  const params = new URLSearchParams(window.location.search);

  function resolveStudentIdForUser(user) {
    const directId = user.studentId || user.student?.id || null;
    if (directId) return Promise.resolve(directId);

    const searchTerm = user.fullName || user.name || user.username || '';
    if (!searchTerm) return Promise.resolve(null);

    return EduResultAPI.students.list({ search: searchTerm, limit: 20 }).then((res) => {
      const match = res.rows.find((student) => {
        const fullName = (student.fullName || student.name || '').toLowerCase();
        return fullName === searchTerm.toLowerCase() || fullName.includes(searchTerm.toLowerCase());
      });
      return match ? match.id : null;
    });
  }

  const studentIdPromise = role === 'student'
    ? resolveStudentIdForUser(session.user || {})
    : Promise.resolve(params.get('studentId') || session.user.studentId || null);

  studentIdPromise.then((resolvedStudentId) => {
    const studentId = resolvedStudentId;
    if (!studentId) {
      document.getElementById('pageSubtitle').textContent = 'Không có mã sinh viên để hiển thị.';
      document.getElementById('transcriptBody').innerHTML = `<tr><td colspan="7" class="text-muted text-sm" style="text-align:center;padding:26px;">Chưa có dữ liệu.</td></tr>`;
      return;
    }

    let student = null;
    EduResultAPI.students.list({ limit: 500 }).then((res) => {
      student = res.rows.find((s) => String(s.id) === String(studentId)) || null;

      document.getElementById('pageSubtitle').textContent = role === 'student'
        ? 'Xem toàn bộ kết quả học tập của bạn theo từng môn.'
        : `Đang xem bảng điểm của sinh viên ${studentId}.`;

      if (!student) {
        document.getElementById('studentNameText').textContent = 'Không tìm thấy sinh viên';
        document.getElementById('transcriptBody').innerHTML = `<tr><td colspan="7" class="text-muted text-sm" style="text-align:center;padding:26px;">Không có dữ liệu.</td></tr>`;
        return;
      }

      const studentName = student.name || student.fullName || 'Sinh viên';
      const studentClass = student.class || student.className || '—';
      document.getElementById('studentAvatarWrap').innerHTML =
        `<div class="table-avatar" style="width:56px;height:56px;font-size:1.1rem;background:${EduResultLayout.avatarColor(studentName)}">${EduResultLayout.initials(studentName)}</div>`;
      document.getElementById('studentNameText').textContent = studentName;
      document.getElementById('studentMetaText').textContent = `${student.id} · Lớp ${studentClass} · ${student.email || '—'}`;

      EduResultAPI.students.grades(studentId).then((rows) => {
        const body = document.getElementById('transcriptBody');
        if (!rows.length) {
          body.innerHTML = `<tr><td colspan="7" class="text-muted text-sm" style="text-align:center;padding:26px;">Sinh viên chưa có điểm được nhập.</td></tr>`;
          return;
        }
        body.innerHTML = rows.map((g, i) => `
          <tr>
            <td class="text-muted">${i + 1}</td>
            <td class="table-name">${UI.escapeHtml(g.subjectName)}</td>
            <td class="text-muted">${g.credits || '—'}</td>
            <td>${g.processScore.toFixed(1)}</td>
            <td>${g.examScore.toFixed(1)}</td>
            <td class="font-bold">${g.totalScore.toFixed(1)}</td>
            <td>${UI.evaluationBadge(g.evaluation)}</td>
          </tr>`).join('');
      });

      EduResultAPI.students.summary(studentId).then((res) => {
        document.getElementById('mtSubjects').textContent = res.totalSubjects;
        document.getElementById('mtGpa').textContent = res.gpa !== null ? res.gpa.toFixed(1) : '—';
        document.getElementById('mtRank').textContent = res.classification;
      });
    }).catch((err) => {
      document.getElementById('studentNameText').textContent = 'Không thể tải dữ liệu';
      document.getElementById('transcriptBody').innerHTML = `<tr><td colspan="7" class="text-muted text-sm" style="text-align:center;padding:26px;">${UI.escapeHtml(err.message || 'Không có dữ liệu.')}</td></tr>`;
    });
  }).catch((err) => {
    document.getElementById('pageSubtitle').textContent = 'Không thể xác định sinh viên.';
    document.getElementById('transcriptBody').innerHTML = `<tr><td colspan="7" class="text-muted text-sm" style="text-align:center;padding:26px;">${UI.escapeHtml(err.message || 'Không có dữ liệu.')}</td></tr>`;
  });
})();

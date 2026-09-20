(function () {
  const session = EduResultLayout.mount({ activePage: 'student-dashboard.html', roles: ['student'] });
  if (!session) return;

  document.getElementById('iconSubjects').innerHTML = Icons.icon('graduation-cap');
  document.getElementById('iconGpa').innerHTML = Icons.icon('star');
  document.getElementById('iconRank').innerHTML = Icons.icon('trophy');

  const user = session.user || {};
  const userName = user.fullName || user.name || 'Người dùng';
  document.getElementById('greetingText').textContent = `Xin chào, ${userName}! 👋`;

  function resolveStudentId() {
    const directId = user.studentId || user.student?.id || null;
    if (directId) return Promise.resolve(directId);

    const searchTerm = user.fullName || user.username || user.name || '';
    if (!searchTerm) return Promise.resolve(null);

    return EduResultAPI.students.list({ search: searchTerm, limit: 20 }).then((res) => {
      const match = res.rows.find((student) => {
        const fullName = (student.fullName || student.name || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        return fullName === searchTerm.toLowerCase() || fullName.includes(searchTerm.toLowerCase()) || username.includes(fullName);
      });
      return match ? match.id : null;
    });
  }

  resolveStudentId().then((studentId) => {
    if (!studentId) {
      document.getElementById('studentIdText').textContent = 'Tài khoản của bạn chưa được liên kết với mã sinh viên nào.';
      document.getElementById('myGradesBody').innerHTML = `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:26px;">Chưa có dữ liệu điểm.</td></tr>`;
      return;
    }

    document.getElementById('studentIdText').textContent = `Mã sinh viên: ${studentId}`;

    EduResultAPI.students.summary(studentId).then((res) => {
      document.getElementById('mTotalSubjects').textContent = res.totalSubjects;
      document.getElementById('mGpa').textContent = res.gpa !== null ? res.gpa.toFixed(1) : '—';
      document.getElementById('mRank').textContent = res.classification;
    });

    EduResultAPI.students.grades(studentId).then((rows) => {
      const body = document.getElementById('myGradesBody');
      if (!rows.length) {
        body.innerHTML = `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:26px;">Chưa có dữ liệu điểm.</td></tr>`;
        return;
      }
      body.innerHTML = rows.map((g, i) => `
        <tr>
          <td class="text-muted">${i + 1}</td>
          <td class="table-name">${UI.escapeHtml(g.subjectName)}</td>
          <td>${g.processScore.toFixed(1)}</td>
          <td>${g.examScore.toFixed(1)}</td>
          <td class="font-bold">${g.totalScore.toFixed(1)}</td>
          <td>${UI.evaluationBadge(g.evaluation)}</td>
        </tr>`).join('');
    });
  }).catch((err) => {
    document.getElementById('studentIdText').textContent = 'Không thể tải dữ liệu sinh viên.';
    document.getElementById('myGradesBody').innerHTML = `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:26px;">${UI.escapeHtml(err.message || 'Không có dữ liệu điểm.')}</td></tr>`;
  });
})();

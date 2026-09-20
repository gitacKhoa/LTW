(function () {
  const session = EduResultLayout.mount({ activePage: 'grade-entry.html', roles: ['admin', 'teacher'] });
  if (!session) return;

  document.getElementById('entryDropzoneIcon').innerHTML = Icons.icon('upload-cloud');
  document.getElementById('robotIcon').innerHTML = Icons.icon('robot');
  document.getElementById('closeManualModal').innerHTML = Icons.icon('x');

  const recentList = [];
  function renderRecent() {
    const body = document.getElementById('recentGradesBody');
    if (!recentList.length) {
      body.innerHTML = `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:26px;">Chưa có hoạt động nào trong phiên làm việc này.</td></tr>`;
      return;
    }
    body.innerHTML = recentList.slice(0, 8).map((item) => {
      if (item.type === 'upload') {
        const badge = item.errorRows.length
          ? `<span class="badge badge--fail">${Icons.icon('x-circle')}${item.errorRows.length} dòng lỗi</span>`
          : `<span class="badge badge--success">${Icons.icon('check-circle')}Hoàn tất</span>`;
        return `<tr>
          <td colspan="5"><span class="table-name">${Icons.icon('file-spreadsheet')} ${UI.escapeHtml(item.fileName)}</span>
            <span class="table-sub"> — đã nhập ${item.successCount} dòng</span></td>
          <td>${badge}</td>
        </tr>`;
      }
      return `<tr>
        <td class="table-name">${UI.escapeHtml(item.studentName)} <span class="table-sub">(${item.studentId})</span></td>
        <td>${UI.escapeHtml(item.subjectName)}</td>
        <td>${item.process.toFixed(1)}</td>
        <td>${item.exam.toFixed(1)}</td>
        <td class="font-bold">${item.total.toFixed(1)}</td>
        <td>${UI.evaluationBadge(item.evaluation)}</td>
      </tr>`;
    }).join('');
  }
  renderRecent();

  // ---------- Excel upload ----------
  const dropzone = document.getElementById('entryDropzone');
  const fileInput = document.getElementById('entryFileInput');
  document.getElementById('entryChooseFile').addEventListener('click', () => fileInput.click());

  function handleFile(file) {
    if (!file) return;
    const resultBox = document.getElementById('uploadResult');
    resultBox.innerHTML = `<div class="text-sm text-muted mt-16">Đang xử lý ${UI.escapeHtml(file.name)}...</div>`;
    EduResultAPI.grades.upload(file).then((res) => {
      recentList.unshift({ type: 'upload', ...res });
      renderRecent();
      if (res.errorRows.length) {
        resultBox.innerHTML = `<div class="mt-16" style="background:var(--fail-100);border-radius:var(--r-sm);padding:12px 14px;font-size:var(--fs-sm);color:var(--fail);">
          Đã nhập ${res.successCount} dòng thành công. Dòng ${res.errorRows.join(', ')} bị lỗi định dạng — vui lòng kiểm tra lại mã sinh viên hoặc điểm số.
        </div>`;
        UI.toast(`Có ${res.errorRows.length} dòng lỗi trong file.`, 'error');
      } else {
        resultBox.innerHTML = `<div class="mt-16" style="background:var(--success-100);border-radius:var(--r-sm);padding:12px 14px;font-size:var(--fs-sm);color:var(--success);">
          Đã nhập thành công ${res.successCount} dòng điểm từ ${UI.escapeHtml(file.name)}.
        </div>`;
        UI.toast('Nhập điểm từ Excel thành công.', 'success');
      }
    }).catch((err) => {
      resultBox.innerHTML = `<div class="mt-16" style="background:var(--fail-100);border-radius:var(--r-sm);padding:12px 14px;font-size:var(--fs-sm);color:var(--fail);">
        ${UI.escapeHtml(err.message || 'Import Excel thất bại.')}
      </div>`;
      UI.toast(err.message || 'Import Excel thất bại.', 'error');
    });
  }
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
  ['dragenter', 'dragover'].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragover'); }));
  dropzone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

  // ---------- Manual entry modal ----------
  const studentSelect = document.getElementById('manualStudent');
  const subjectSelect = document.getElementById('manualSubject');
  const studentSearch = document.getElementById('manualStudentSearch');

  function loadStudentOptions(query) {
    EduResultAPI.students.list({ search: query || '', limit: 20 }).then((res) => {
      studentSelect.innerHTML = res.rows.map((s) => `<option value="${s.id}" data-name="${UI.escapeHtml(s.name)}">${s.id} — ${UI.escapeHtml(s.name)} (${s.class})</option>`).join('');
    });
  }

  function loadSubjectOptions() {
    EduResultAPI.subjects.list().then((subjects) => {
      subjectSelect.innerHTML = subjects.map((s) => `<option value="${s.id}" data-name="${UI.escapeHtml(s.name)}">${UI.escapeHtml(s.name)}</option>`).join('');
    }).catch((err) => {
      subjectSelect.innerHTML = '<option value="">Không thể tải môn học</option>';
      UI.toast(err.message || 'Không thể tải danh sách môn học.', 'error');
    });
  }

  document.getElementById('openManualEntry').addEventListener('click', () => {
    loadStudentOptions('');
    loadSubjectOptions();
    document.getElementById('manualForm').reset();
    UI.openModal('manualModal');
  });
  document.getElementById('closeManualModal').addEventListener('click', () => UI.closeModal('manualModal'));
  document.getElementById('manualModal').addEventListener('click', (e) => { if (e.target.id === 'manualModal') UI.closeModal('manualModal'); });
  studentSearch.addEventListener('input', UI.debounce((e) => loadStudentOptions(e.target.value), 250));

  document.getElementById('manualForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = studentSelect.value;
    const subjectId = subjectSelect.value;
    const processScore = parseFloat(document.getElementById('manualProcess').value);
    const examScore = parseFloat(document.getElementById('manualExam').value);

    if (!studentId) return UI.toast('Vui lòng chọn sinh viên.', 'error');
    if (!subjectId) return UI.toast('Vui lòng chọn môn học.', 'error');
    if (isNaN(processScore) || processScore < 0 || processScore > 10 || isNaN(examScore) || examScore < 0 || examScore > 10) {
      return UI.toast('Điểm phải nằm trong khoảng 0 - 10.', 'error');
    }

    const btn = document.getElementById('manualSubmit');
    btn.disabled = true; btn.textContent = 'Đang lưu...';

    EduResultAPI.grades.create({ studentId, subjectId, processScore, examScore }).then((record) => {
      const studentName = studentSelect.selectedOptions[0]?.dataset.name || 'Sinh viên';
      const subjectName = subjectSelect.selectedOptions[0]?.dataset.name || record.subjectName || 'Môn học';
      recentList.unshift({
        type: 'manual', studentId, studentName,
        subjectName, process: Number(record.processScore ?? processScore), exam: Number(record.examScore ?? examScore),
        total: Number(record.totalScore ?? (processScore + examScore) / 2), evaluation: record.evaluation || 'Chưa có KQ',
      });
      renderRecent();
      UI.toast('Đã lưu điểm thành công.', 'success');
      UI.closeModal('manualModal');
    }).catch((err) => {
      UI.toast(err.message || 'Có lỗi xảy ra.', 'error');
    }).finally(() => {
      btn.disabled = false; btn.textContent = 'Lưu điểm';
    });
  });
})();

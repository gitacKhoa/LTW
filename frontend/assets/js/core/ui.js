/**
 * ui.js — small render/format helpers reused across page scripts.
 */
(function (global) {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function debounce(fn, wait = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  function toast(message, type = 'default') {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = `toast ${type === 'success' ? 'toast--success' : type === 'error' ? 'toast--error' : ''}`;
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  const TONE_CLASS = { success: 'badge--success', fail: 'badge--fail', warn: 'badge--warn', info: 'badge--info', muted: 'badge--muted' };
  const TONE_ICON = { success: 'check-circle', fail: 'x-circle', warn: 'alert-circle', info: 'check-circle', muted: 'alert-circle' };

  function evaluationBadge(evaluation) {
    const tone = evaluation && evaluation.tone ? evaluation.tone : 'muted';
    const label = evaluation && evaluation.label ? evaluation.label : 'Chưa có KQ';
    return `<span class="badge ${TONE_CLASS[tone]}">${Icons.icon(TONE_ICON[tone])}${label}</span>`;
  }

  function statusBadge(status) {
    if (status === 'pass') return `<span class="badge badge--success">${Icons.icon('check-circle')}Đậu</span>`;
    if (status === 'fail') return `<span class="badge badge--fail">${Icons.icon('x-circle')}Rớt</span>`;
    return `<span class="badge badge--muted">${Icons.icon('alert-circle')}Chưa có KQ</span>`;
  }

  function renderDonut(el, { pass, fail, none, total }) {
    total = total || (pass + fail + none) || 1;
    const p1 = Math.round((pass / total) * 100);
    const p2 = Math.round((fail / total) * 100);
    el.style.setProperty('--p1', p1);
    el.style.setProperty('--p2', p2);
    const holeText = el.querySelector('.donut__pct');
    if (holeText) holeText.textContent = p1 + '%';
  }

  function renderPagination(container, { page, limit, total, onChange }) {
    const pages = Math.max(1, Math.ceil(total / limit));
    if (pages <= 1) { container.innerHTML = ''; return; }
    let html = `<button class="pagination__btn" data-p="${page - 1}" ${page === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && i !== 1 && i !== pages && Math.abs(i - page) > 1) {
        if (i === 2 || i === pages - 1) html += `<span class="text-muted text-xs">…</span>`;
        continue;
      }
      html += `<button class="pagination__btn ${i === page ? 'is-active' : ''}" data-p="${i}">${i}</button>`;
    }
    html += `<button class="pagination__btn" data-p="${page + 1}" ${page === pages ? 'disabled' : ''}>›</button>`;
    container.innerHTML = html;
    container.querySelectorAll('[data-p]').forEach((btn) => {
      btn.addEventListener('click', () => onChange(Number(btn.dataset.p)));
    });
  }

  function avatarChip(name, size = 32) {
    const color = EduResultLayout.avatarColor(name);
    return `<div class="table-avatar" style="width:${size}px;height:${size}px;background:${color}">${EduResultLayout.initials(name)}</div>`;
  }

  function openModal(id) { document.getElementById(id).classList.add('is-open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('is-open'); }

  function skeletonRows(cols, rows = 4) {
    return Array.from({ length: rows }).map(() =>
      `<tr>${Array.from({ length: cols }).map(() => `<td><div class="skeleton" style="height:14px;width:${60 + Math.random() * 30}%"></div></td>`).join('')}</tr>`
    ).join('');
  }

  global.UI = {
    escapeHtml, debounce, toast, evaluationBadge, statusBadge,
    renderDonut, renderPagination, avatarChip, openModal, closeModal, skeletonRows,
  };
})(window);

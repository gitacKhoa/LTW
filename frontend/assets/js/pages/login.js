(function () {
  // Already logged in? go straight to the right dashboard.
  if (EduResultAuth.isLoggedIn()) {
    window.location.href = EduResultAuth.homeForRole(EduResultAuth.effectiveRole());
    return;
  }

  const tabs = document.querySelectorAll('.auth-tabs button');
  const panels = { login: document.getElementById('panel-login'), register: document.getElementById('panel-register') };
  tabs.forEach((btn) => btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    Object.entries(panels).forEach(([key, el]) => el.classList.toggle('hidden', key !== btn.dataset.tab));
  }));

  function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const err = field.querySelector('.field-error');
    if (message) { field.classList.add('has-error'); err.textContent = message; err.classList.remove('hidden'); }
    else { field.classList.remove('has-error'); err.classList.add('hidden'); }
  }

  // ---------- LOGIN ----------
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    let valid = true;
    if (!username || username.length < 3) { setError('loginEmailField', 'Tên đăng nhập không hợp lệ.'); valid = false; }
    else setError('loginEmailField', '');
    if (!password) { setError('loginPasswordField', 'Vui lòng nhập mật khẩu.'); valid = false; }
    else setError('loginPasswordField', '');
    if (!valid) return;

    const btn = document.getElementById('loginSubmit');
    btn.disabled = true; btn.textContent = 'Đang đăng nhập...';

    EduResultAPI.auth.login({ email: username, password }).then((res) => {
      EduResultAuth.setSession({ token: res.token, role: res.role, viewRole: null, user: res.user });
      window.location.href = EduResultAuth.homeForRole(res.role);
    }).catch((err) => {
      setError('loginPasswordField', err.message || 'Đăng nhập thất bại.');
      btn.disabled = false; btn.textContent = 'Đăng nhập';
    });
  });

  // ---------- REGISTER ----------
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    let valid = true;

    if (name.length < 2) { setError('regNameField', 'Vui lòng nhập họ tên.'); valid = false; } else setError('regNameField', '');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('regEmailField', 'Email không hợp lệ.'); valid = false; } else setError('regEmailField', '');
    if (password.length < 6) { setError('regPasswordField', 'Mật khẩu tối thiểu 6 ký tự.'); valid = false; } else setError('regPasswordField', '');
    if (confirm !== password) { setError('regConfirmField', 'Mật khẩu nhập lại không khớp.'); valid = false; } else setError('regConfirmField', '');
    if (!valid) return;

    const btn = document.getElementById('registerSubmit');
    btn.disabled = true; btn.textContent = 'Đang tạo tài khoản...';

    EduResultAPI.auth.register({ name, email, password }).then((res) => {
      EduResultAuth.setSession({ token: res.token, role: res.role, viewRole: null, user: res.user });
      window.location.href = EduResultAuth.homeForRole(res.role);
    }).catch((err) => {
      setError('regEmailField', err.message || 'Đăng ký thất bại.');
      btn.disabled = false; btn.textContent = 'Tạo tài khoản';
    });
  });
})();

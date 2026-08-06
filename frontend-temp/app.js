/* -----------------------------------------------
   Zentra Auth Test Frontend – API Client
   Talks to backend at http://localhost:5000
   ----------------------------------------------- */

const BASE_URL = 'http://localhost:5000/api/v1/auth';
const output = document.getElementById('output');

/* ---------- Utility helpers ---------- */
const show = (data, isError = false) => {
  output.className = 'output ' + (isError ? 'error' : 'success');
  output.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
};

const request = async (method, path, body, token) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(BASE_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

/* ---------- Register ---------- */
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const result = await request('POST', '/register', {
      fullName: fd.get('fullName'),
      email: fd.get('email'),
      password: fd.get('password'),
    });
    show(result);
    if (result.data) {
      if (result.data.accessToken) localStorage.setItem('accessToken', result.data.accessToken);
      if (result.data.refreshToken) localStorage.setItem('refreshToken', result.data.refreshToken);
    }
  } catch (err) {
    show(err, true);
  }
});

/* ---------- Login ---------- */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const result = await request('POST', '/login', {
      email: fd.get('email'),
      password: fd.get('password'),
    });
    show(result);
    if (result.data) {
      if (result.data.accessToken) localStorage.setItem('accessToken', result.data.accessToken);
      if (result.data.refreshToken) localStorage.setItem('refreshToken', result.data.refreshToken);
    }
  } catch (err) {
    show(err, true);
  }
});

/* ---------- Refresh ---------- */
document.getElementById('refreshForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const token = fd.get('refreshToken') || localStorage.getItem('refreshToken');
  try {
    const result = await request('POST', '/refresh', { refreshToken: token });
    show(result);
    if (result.data) {
      if (result.data.accessToken) localStorage.setItem('accessToken', result.data.accessToken);
      if (result.data.refreshToken) localStorage.setItem('refreshToken', result.data.refreshToken);
    }
  } catch (err) {
    show(err, true);
  }
});

/* ---------- Me ---------- */
document.getElementById('meBtn').addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) throw { message: 'No access token stored. Register or login first.' };
    const result = await request('GET', '/me', null, token);
    show(result);
  } catch (err) {
    show(err, true);
  }
});

/* ---------- Logout ---------- */
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) throw { message: 'No access token stored. Register or login first.' };
    const result = await request('POST', '/logout', null, token);
    show(result);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (err) {
    show(err, true);
  }
});

/* ---------- Tab navigation ---------- */
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === btn));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === target));
    output.textContent = '';
    output.className = 'output';
  });
});

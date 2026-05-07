const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (res.ok) {
    if (isJson) return res.json();
    return null;
  }

  if (isJson) {
    const err = await res.json().catch(() => null);
    const message = err?.message || err?.error || JSON.stringify(err) || res.statusText;
    throw new Error(message);
  }

  throw new Error(res.statusText || 'Request failed');
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  return handleResponse(res);
}

export async function register(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return handleResponse(res);
}

export async function logout(token) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) }
  });

  return handleResponse(res);
}

export async function me(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) }
  });

  return handleResponse(res);
}

export default { login, register, logout, me };

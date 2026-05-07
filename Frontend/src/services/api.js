const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const extractMessage = async () => {
    const rawText = await res.text().catch(() => '');

    if (!rawText) {
      return res.statusText || 'Request failed';
    }

    try {
      const parsed = JSON.parse(rawText);
      return parsed?.message || parsed?.error || parsed?.detail || rawText;
    } catch {
      return rawText;
    }
  };

  if (res.ok) {
    if (isJson) return res.json();

    const rawText = await res.text().catch(() => '');
    if (!rawText) return null;

    try {
      return JSON.parse(rawText);
    } catch {
      return rawText;
    }
  }

  if (isJson) {
    const err = await res.json().catch(() => null);
    const message = err?.message || err?.error || err?.detail || res.statusText || 'Request failed';
    throw new Error(message);
  }

  throw new Error(await extractMessage());
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during login');
  }
}

export async function register(data) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during registration');
  }
}

export async function logout(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during logout');
  }
}

export async function me(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    const data = await handleResponse(res);
    return data?.user ?? data;
  } catch (error) {
    throw new Error(error?.message || 'Network error during profile lookup');
  }
}

export default { login, register, logout, me };

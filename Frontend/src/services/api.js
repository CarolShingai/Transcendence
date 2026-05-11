const API_BASE = (() => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined' && window.location?.port === '3000') {
    return 'https://localhost:8082';
  }

  return '/api';
})();

let httpErrorHandler = null;

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (res.ok) {
    if (isJson) return res.json();
    const text = await res.text().catch(() => '');
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }

  let message = '';
  if (isJson) {
    const err = await res.json().catch(() => null);
    message = err?.message || err?.error || err?.detail || res.statusText || 'Request failed';
  } else {
    message = await res.text().catch(() => res.statusText || 'Request failed');
  }

  if (typeof httpErrorHandler === 'function') {
    try { httpErrorHandler(res.status, message); } catch (e) {}
  }

  throw new Error(message);
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
}

async function request(path, opts = {}) {
  const {
    method = 'GET',
    token = null,
    body = undefined,
    authenticated = true,
    headers = {},
    timeout = 15000
  } = opts;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authenticated ? authHeader(token) : {}),
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    return await handleResponse(res);
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error(`Request timed out calling ${path}`);
    throw new Error(err?.message || `Network error calling ${path}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function login(email, password) {
  try {
    return request('/auth/login', {
      method: 'POST',
      authenticated: false,
      body: { email, password },
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error during login');
  }
}

export async function verifyTwoFactor(twoFactorToken, code) {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ twoFactorToken, code })
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during 2FA verification');
  }
}

export async function register(data) {
  try {
    return request('/auth/register', {
      method: 'POST',
      authenticated: false,
      body: data,
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error during registration');
  }
}

export async function logout(token) {
  try {
    return request('/auth/logout', { method: 'POST', token });
  } catch (error) {
    throw new Error(error?.message || 'Network error during logout');
  }
}

export async function me(token) {
  try {
    const data = await request('/auth/me', { method: 'GET', token });
    return data?.user ?? data;
  } catch (error) {
    throw new Error(error?.message || 'Network error during profile lookup');
  }
}

export function setHttpErrorHandler(fn) {
  httpErrorHandler = typeof fn === 'function' ? fn : null;
}

export function getGoogleOAuthUrl() {
  return `${API_BASE}/auth/oauth2/authorize/google`;
}

export async function updateProfile(token, data) {
  try {
    return request('/profile/me', {
      method: 'PATCH',
      token,
      body: data,
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error during profile update');
  }
}

export async function setupTwoFactor(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during 2FA setup');
  }
}

export async function enableTwoFactor(token, code) {
  try {
    const res = await fetch(`${API_BASE}/auth/2fa/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ code })
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during 2FA activation');
  }
}

export async function listFriends(token) {
  try {
    const res = await fetch(`${API_BASE}/friends`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    const data = await handleResponse(res);
    return unwrapList(data, 'friends');
  } catch (error) {
    throw new Error(error?.message || 'Network error during friends lookup');
  }
}

export async function listPendingRequests(token) {
  try {
    const res = await fetch(`${API_BASE}/friends/requests`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    const data = await handleResponse(res);
    return unwrapList(data, 'requests');
  } catch (error) {
    throw new Error(error?.message || 'Network error during pending requests lookup');
  }
}

export async function searchUsers(token, query) {
  try {
    const res = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    const data = await handleResponse(res);
    return unwrapList(data, 'users');
  } catch (error) {
    throw new Error(error?.message || 'Network error during users search');
  }
}

export async function listAllUsers(token) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    const data = await handleResponse(res);
    return unwrapList(data, 'users');
  } catch (error) {
    throw new Error(error?.message || 'Network error during users list');
  }
}

export async function sendFriendRequest(token, receiverId) {
  try {
    const res = await fetch(`${API_BASE}/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ receiverId })
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during friend request');
  }
}

export async function acceptFriendRequest(token, requestId) {
  try {
    const res = await fetch(`${API_BASE}/friends/${requestId}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during friend acceptance');
  }
}

export async function rejectFriendRequest(token, requestId) {
  try {
    const res = await fetch(`${API_BASE}/friends/${requestId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    return handleResponse(res);
  } catch (error) {
    throw new Error(error?.message || 'Network error during friend rejection');
  }
}

export async function createMatch(token, data) {
  try {
    return request('/matches', {
      method: 'POST',
      token,
      body: data,
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error while registering match');
  }
}

export async function listMyMatches(token) {
  try {
    const res = await fetch(`${API_BASE}/matches`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) }
    });

    const data = await handleResponse(res);
    return unwrapList(data, 'matches');
  } catch (error) {
    throw new Error(error?.message || 'Network error while loading match history');
  }
}

const api = {
  login,
  verifyTwoFactor,
  register,
  logout,
  me,
  setHttpErrorHandler,
  updateProfile,
  setupTwoFactor,
  enableTwoFactor,
  listFriends,
  listPendingRequests,
  listAllUsers,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  createMatch,
  listMyMatches,
  getGoogleOAuthUrl
};

export default api;

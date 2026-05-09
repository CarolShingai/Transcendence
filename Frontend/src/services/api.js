const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 5000;

let httpErrorHandler = null;

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

  let message = '';

  if (isJson) {
    const err = await res.json().catch(() => null);
    message = err?.message || err?.error || err?.detail || res.statusText || 'Request failed';
  } else {
    message = await extractMessage();
  }

  if (typeof httpErrorHandler === 'function') {
    try {
      httpErrorHandler(res.status, message);
    } catch (e) {}
  }

  throw new Error(message);
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { token, method = 'GET', body, authenticated = true, headers = {} } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authenticated ? authHeader(token) : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    return handleResponse(res);
  } finally {
    clearTimeout(timeoutId);
  }
}

function unwrapList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
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

export async function getFriends(token) {
  try {
    const data = await request('/friends', { method: 'GET', token });
    return unwrapList(data, 'friends');
  } catch (error) {
    return [];
  }
}

export async function getInvites(token) {
  try {
    const data = await request('/friends/requests', { method: 'GET', token });
    return unwrapList(data, 'requests');
  } catch (error) {
    return [];
  }
}

export async function getPeople(token) {
  try {
    const data = await request('/presence/online-users', {
      method: 'GET',
      authenticated: false,
      token,
    });
    return unwrapList(data, 'onlineUsers');
  } catch (error) {
    return [];
  }
}

export async function sendFriendRequest(token, receiverId) {
  try {
    return request('/friends/request', {
      method: 'POST',
      token,
      body: { receiverId },
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error during friend request');
  }
}

export async function acceptFriendRequest(token, requestId) {
  try {
    return request(`/friends/${requestId}/accept`, {
      method: 'PATCH',
      token,
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error during friend acceptance');
  }
}

export async function rejectFriendRequest(token, requestId) {
  try {
    return request(`/friends/${requestId}/reject`, {
      method: 'PATCH',
      token,
    });
  } catch (error) {
    throw new Error(error?.message || 'Network error during friend rejection');
  }
}

// Backward-compatible aliases.
export async function listFriends(token) {
  return getFriends(token);
}

export async function listPendingRequests(token) {
  return getInvites(token);
}

export async function searchUsers(token, query) {
  // Search-by-name endpoint is not required for the friends area anymore.
  // Keep this alias to avoid breaking older call sites.
  try {
    const people = await getPeople(token);
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return people;

    return people.filter((person) => {
      const haystack = [person.name, person.nickname, person.email]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');

      return haystack.includes(normalizedQuery);
    });
  } catch {
    return [];
  }
}

const api = {
  login,
  register,
  logout,
  me,
  setHttpErrorHandler,
  updateProfile,
  getFriends,
  getInvites,
  getPeople,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  listFriends,
  listPendingRequests,
  searchUsers,
};

export default api;

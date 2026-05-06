// Centraliza chamadas HTTP para autenticação
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getToken = () => localStorage.getItem('auth_token');

const api = {
  async register({ nickname, name, email, password, twoFactorEnabled = false }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, name, email, password, twoFactorEnabled })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async login({ email, password, twoFactorCode }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, twoFactorCode })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.token) localStorage.setItem('auth_token', data.token);
    return data;
  },

  async logout() {
    const token = getToken();
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    localStorage.removeItem('auth_token');
  },

  async me() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      return null;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch user');
    return data.user;
  }
};

export default api;

// Centraliza chamadas HTTP para autenticação
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
// ...existing code...
const getToken = () => localStorage.getItem('auth_token');

const api = {
    // Inicia o login com Google, abrindo a janela de autenticação
    googleLogin() {
      const redirectUri = window.location.origin + '/google-callback';
      const url = `${API_BASE_URL}/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(url, 'googleLogin', `width=${width},height=${height},left=${left},top=${top}`);
      return popup;
    },

    // Recebe o token JWT do backend após login Google
    async handleGoogleCallback(token) {
      if (token) {
        localStorage.setItem('auth_token', token);
        return await api.me();
      }
      throw new Error('Token Google inválido');
    },
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

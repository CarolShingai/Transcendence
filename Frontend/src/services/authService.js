// API Service for authentication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:8080';

class AuthService {
  // Login
  async login(email, password, twoFactorCode = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          ...(twoFactorCode && { twoFactorCode })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store JWT token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Store temporary 2FA token if needed
      if (data.twoFactorToken) {
        sessionStorage.setItem('2fa_token', data.twoFactorToken);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register
  async register(nickname, name, email, password, twoFactorEnabled = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nickname,
          name,
          email,
          password,
          twoFactorEnabled
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        // If 401, token is invalid
        if (response.status === 401) {
          this.logout();
          return null;
        }
        throw new Error('Failed to get current user');
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateTwoFactorPreference(enabled) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/auth/2fa/preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ enabled })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update 2FA preference');
      }

      return data;
    } catch (error) {
      console.error('Update 2FA preference error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('2fa_token');
  }

  // Get token
  getToken() {
    return localStorage.getItem('auth_token');
  }

  // Get 2FA token
  getTwoFactorToken() {
    return sessionStorage.getItem('2fa_token');
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Setup 2FA
  async setupTwoFactor() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Setup 2FA error:', error);
      throw error;
    }
  }

  // Enable 2FA
  async enableTwoFactor(code) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to enable 2FA');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  }

  // Verify 2FA
  async verifyTwoFactor(code) {
    try {
      const twoFactorToken = this.getTwoFactorToken();
      if (!twoFactorToken) {
        throw new Error('No 2FA token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          twoFactorToken,
          code
        })
      });

      if (!response.ok) {
        throw new Error('Invalid 2FA code');
      }

      const data = await response.json();

      // Store JWT token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        sessionStorage.removeItem('2fa_token');
      }

      return data;
    } catch (error) {
      console.error('Verify 2FA error:', error);
      throw error;
    }
  }
}

export default new AuthService();

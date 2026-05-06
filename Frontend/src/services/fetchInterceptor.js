// API interceptor for adding Bearer token to requests
// authService removido, token obtido diretamente do localStorage

const originalFetch = window.fetch;

window.fetch = function (...args) {
  const [resource, config = {}] = args;

  // Add Bearer token to all requests except login/register
  const token = localStorage.getItem('auth_token');

  if (token && !resource.includes('/auth/login') && !resource.includes('/auth/register')) {
    const headers = config.headers || {};
    headers['Authorization'] = `Bearer ${token}`;
    config.headers = headers;
  }

  return originalFetch.apply(this, args);
};

export default window.fetch;

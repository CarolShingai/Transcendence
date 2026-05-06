import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      api.me().then(() => navigate('/home'));
    } else {
      navigate('/login?error=google');
    }
  }, [navigate]);

  return <div>Autenticando com Google...</div>;
}

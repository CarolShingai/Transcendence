import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import LoginHeader from './components/layout/LoginHeader';
import HomeHeader from './components/layout/HomeHeader';
import EditHeader from './components/layout/EditHeader';
import RegisterHeader from './components/layout/RegisterHeader';
import AppFooter from './components/layout/AppFooter';
import LoginCard from './components/auth/LoginCard';
import RegisterCard from './components/auth/RegisterCard';
import ProfileCard from './components/profile/ProfileCard';
import HomeCard from './components/home/HomeCard';
import GameCard from './components/game/GameCard';
import api from './services/api';

const avatarContext = require.context('./assets/profile', false, /\.(png|jpe?g|webp)$/);
const avatarOptions = avatarContext
  .keys()
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((key) => {
    const moduleValue = avatarContext(key);
    return moduleValue?.default || moduleValue;
  });

function App() {
  const resolveAvatarUrl = (avatarValue) => {
    if (typeof avatarValue === 'string') return avatarValue;
    if (avatarValue && typeof avatarValue === 'object' && typeof avatarValue.default === 'string') {
      return avatarValue.default;
    }

    return '';
  };

  const resolveAvatarFromProfilePic = (profilePic) => {
    const numericPic = Number(profilePic);
    if (!Number.isInteger(numericPic) || numericPic < 1 || numericPic > avatarOptions.length) {
      return '';
    }

    return avatarOptions[numericPic - 1] || '';
  };

  const normalizeBackendUser = (payload, fallbackProfile = null) => {
    const user = payload?.user ?? payload ?? null;
    if (!user) return null;

    const avatarUrl = resolveAvatarUrl(user.avatarUrl) || resolveAvatarFromProfilePic(user.profilePic) || fallbackProfile?.avatarUrl || '';

    return {
      ...fallbackProfile,
      ...user,
      avatarUrl
    };
  };

  const profileFromUser = (user, fallbackProfile = null) => ({
    name: user?.name || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    bio: user?.bio || fallbackProfile?.bio || 'Player ready to start the journey.',
    avatarUrl:
      resolveAvatarUrl(user?.avatarUrl) ||
      resolveAvatarFromProfilePic(user?.profilePic) ||
      fallbackProfile?.avatarUrl ||
      ''
  });

  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emptyProfileForm = {
    name: '',
    nickname: '',
    email: '',
    bio: 'Player ready to start the journey.',
    avatarUrl: ''
  };
  const emptyRegisterForm = {
    name: '',
    nickname: '',
    email: '',
    password: '',
    profilePic: 0,
    bio: 'Player ready to start the journey.',
    avatarUrl: ''
  };
  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState(emptyProfileForm);

  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);

  const isAuthenticated = Boolean(profile);

  const initials = useMemo(() => {
    const sourceName = profile?.name?.trim() || profile?.nickname?.trim() || '';
    if (!sourceName) return 'TP';

    return sourceName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((token) => token[0].toUpperCase())
      .join('');
  }, [profile]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const syncProfileFromToken = async (targetView = 'home') => {
    const token = localStorage.getItem('transcendence_token');
    if (!token) {
      setProfile(null);
      setProfileForm(emptyProfileForm);
      setView('login');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const user = await api.me(token);
      const resolved = normalizeBackendUser(user, null);

      if (!resolved) {
        throw new Error('User not found');
      }

      setProfile(resolved);
      setProfileForm(profileFromUser(resolved, null));
      setView(targetView);

      try {
        localStorage.setItem('transcendence_profile', JSON.stringify(resolved));
      } catch {}

      return resolved;
    } catch (err) {
      setError(err?.message || 'Failed to restore session');
      localStorage.removeItem('transcendence_token');
      try {
        localStorage.removeItem('transcendence_profile');
      } catch {}
      setProfile(null);
      setProfileForm(emptyProfileForm);
      setView('login');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncProfileFromToken('home');
  }, []);

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterAvatarSelect = (avatarPayload) => {
    const { avatarUrl = '', profilePic = 0 } = avatarPayload || {};
    setRegisterForm((previous) => ({
      ...previous,
      avatarUrl,
      profilePic
    }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setError('');
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in email and password.');
      return;
    }

    setLoading(true);
    api
      .login(loginForm.email, loginForm.password)
      .then((resp) => {
        const token = resp?.token || resp?.accessToken || resp?.jwt || resp;
        if (!token) throw new Error('No token returned from server');
        localStorage.setItem('transcendence_token', token);
        return syncProfileFromToken('home');
      })
      .then((resolved) => {
        if (!resolved) return;
        setLoginForm({ email: '', password: '' });
      })
      .catch((err) => setError(err?.message || 'Login failed'))
      .finally(() => setLoading(false));
  };

  const handleGoogleLogin = () => {
    setError('');
    // Google login flow not implemented: keep simulated fallback
    const nextProfile = {
      name: 'google player',
      nickname: 'google player',
      email: 'google.player@gmail.com',
      bio: 'Player ready to start the journey.',
      avatarUrl: ''
    };

    setProfile(nextProfile);
    setProfileForm(nextProfile);
    localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    setView('home');
    setLoginForm({ email: '', password: '' });
  };

  const handleGoToRegister = () => {
    setError('');
    setRegisterForm((previous) => ({
      ...previous,
      email: loginForm.email || previous.email
    }));
    setView('register');
  };

  const handleRegisterSave = (event) => {
    event.preventDefault();

    if (!registerForm.name || !registerForm.nickname || !registerForm.email || !registerForm.password) {
      setError('Name, nickname, email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    api
      .register({
        name: registerForm.name,
        nickname: registerForm.nickname,
        email: registerForm.email,
        password: registerForm.password,
        profilePic: Number(registerForm.profilePic) || 0
      })
      .then(() => {
        // on success redirect to login and prefill email
        setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
        setRegisterForm(emptyRegisterForm);
        setView('login');
      })
      .catch((err) => setError(err?.message || 'Registration failed'))
      .finally(() => setLoading(false));
  };

  const handleRegisterExit = () => {
    setError('');
    setRegisterForm(emptyRegisterForm);
    setView('login');
  };

  const handleGoToGame = () => {
    if (!isAuthenticated) return;
    setView('game');
  };
  const [gameOrigin, setGameOrigin] = useState(null);

  const handleGoToGameWithOrigin = (origin) => {
    if (!isAuthenticated) return;
    setGameOrigin(origin || null);
    setView('game');
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    if (!profileForm.name || !profileForm.nickname || !profileForm.email) {
      setError('Name, nickname and email are required.');
      return;
    }

    setError('');
    const nextProfile = {
      ...profileForm,
      avatarUrl: resolveAvatarUrl(profileForm.avatarUrl)
    };
    setProfile(nextProfile);
    try {
      localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    } catch {}
    setView('home');
  };

  const handleLogout = async () => {
    setError('');
    setLoading(true);

    const token = localStorage.getItem('transcendence_token');

    try {
      if (token) {
        await api.logout(token);
      }
    } catch (err) {
      setError(err?.message || 'Logout failed');
    } finally {
      localStorage.removeItem('transcendence_token');
      try {
        localStorage.removeItem('transcendence_profile');
      } catch {}
      setProfile(null);
      setProfileForm(emptyProfileForm);
      setLoginForm({ email: '', password: '' });
      setView('login');
      setLoading(false);
    }
  };

  const goToProfile = () => {
    if (!isAuthenticated) return;
    syncProfileFromToken('profile');
  };

  const goToHome = () => {
    if (!isAuthenticated) return;
    setView('home');
  };

  const handleExitGame = () => {
    if (!isAuthenticated) return;
    setView('home');
  };

  const goToLogin = () => setView('login');
  const isLoginView = !isAuthenticated && view === 'login';
  const isRegisterView = !isAuthenticated && view === 'register';
  const isHomeView = isAuthenticated && view === 'home';
  const isGameView = isAuthenticated && view === 'game';
  const gameEndpoint = process.env.REACT_APP_GAME_ENDPOINT || '/game';

  return (
    <div className="App">
      <div className="game-shell">
        <section className="game-stage" aria-label="Area principal do jogo">
          {isLoginView ? (
            <LoginHeader />
          ) : isRegisterView ? (
            <RegisterHeader onGoToLogin={handleRegisterExit} />
          ) : isHomeView ? (
            <HomeHeader
              initials={initials}
              profileImage={profile?.avatarUrl}
              welcomeName={profile?.nickname || profile?.name || 'Viajante'}
              onGoToProfile={goToProfile}
              onLogout={handleLogout}
            />
          ) : isGameView ? null : (
            <EditHeader onGoToHome={goToHome} onLogout={handleLogout} />
          )}

          <main className={`App-main ${isGameView ? 'App-main-game' : ''}`}>
            {isLoginView ? (
              <LoginCard
                loginForm={loginForm}
                error={error}
                onLoginChange={handleLoginChange}
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
                onCreateAccount={handleGoToRegister}
                loading={loading}
              />
            ) : isRegisterView ? (
              <RegisterCard
                initials={initials}
                registerForm={registerForm}
                error={error}
                onRegisterChange={handleRegisterChange}
                onRegisterAvatarSelect={handleRegisterAvatarSelect}
                onRegisterSave={handleRegisterSave}
                loading={loading}
              />
            ) : isHomeView ? (
              <HomeCard onPlayGame={handleGoToGameWithOrigin} />
            ) : isGameView ? (
              <GameCard gameEndpoint={gameEndpoint} onExitGame={handleExitGame} gameOrigin={gameOrigin} />
            ) : (
              <ProfileCard
                initials={initials}
                profileForm={profileForm}
                error={error}
                onProfileChange={handleProfileChange}
                onProfileSave={handleProfileSave}
              />
            )}
          </main>

          {!isGameView && <AppFooter />}
        </section>
      </div>
    </div>
  );
}

export default App;

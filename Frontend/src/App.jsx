import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import LoginHeader from './components/layout/LoginHeader';
import HomeHeader from './components/layout/HomeHeader';
import RegisterHeader from './components/layout/RegisterHeader';
import AppFooter from './components/layout/AppFooter';
import PublicProfileHeader from './components/layout/PublicProfileHeader';
import Error4xx from './components/layout/Error4xx';
import Error5xx from './components/layout/Error5xx';
import StatusBanner from './components/elements/StatusBanner';
import LoadingOverlay from './components/elements/LoadingOverlay';
import LoginCard from './components/auth/LoginCard';
import RegisterCard from './components/auth/RegisterCard';
import PublicProfileCard from './components/profile/PublicProfileCard';
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
  const pathToErrorView = (pathname) => {
    const normalized = `/${String(pathname || '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\/+/g, '/')}`;

    if (normalized === '/4xx') return 'error4xx';
    if (normalized === '/5xx') return 'error5xx';
    return null;
  };

  const navigateToPath = (path, nextView) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setView(nextView);
  };

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
      '',
    profilePic: Number(user?.profilePic) || fallbackProfile?.profilePic || 0
  });

  const resolvePublicRecordValue = (source, fallback = 0) => {
    if (source === null || source === undefined || source === '') {
      return fallback;
    }

    if (typeof source === 'number' && Number.isFinite(source)) {
      return source;
    }

    return source;
  };

  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emptyProfileForm = {
    name: '',
    nickname: '',
    email: '',
    bio: 'Player ready to start the journey.',
    avatarUrl: '',
    profilePic: 0
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
    const routeView = pathToErrorView(window.location.pathname);
    if (routeView) {
      setView(routeView);
      return;
    }

    syncProfileFromToken('home');
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const routeView = pathToErrorView(window.location.pathname);
      if (routeView) {
        setView(routeView);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
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

  const handleProfileAvatarSelect = (payload) => {
    const { avatarUrl = '', profilePic = 0 } = payload || {};
    setProfileForm((previous) => ({ ...previous, avatarUrl, profilePic }));
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
    setLoading(true);

    const token = localStorage.getItem('transcendence_token');
    const payload = {
      name: profileForm.name,
      nickname: profileForm.nickname,
      profilePic: Number(profileForm.profilePic) || 0
    };

    api
      .updateProfile(token, payload)
      .then((resp) => {
        const user = resp?.user ?? resp;
        const resolved = normalizeBackendUser(user, profileForm);
        setProfile(resolved);
        setProfileForm(profileFromUser(resolved, profileForm));
        try {
          localStorage.setItem('transcendence_profile', JSON.stringify(resolved));
        } catch {}
        setView('home');
      })
      .catch((err) => setError(err?.message || 'Failed to save profile'))
      .finally(() => setLoading(false));
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

  const showHttpError = (status, message = '') => {
    if (status >= 500) {
      setError(message || 'Erro interno do servidor');
      navigateToPath('/5xx', 'error5xx');
    } else if (status === 404) {
      setError(message || 'Recurso não encontrado');
      navigateToPath('/4xx', 'error4xx');
    } else if (status >= 400) {
      setError(message || 'Falha na requisição');
    }
  };

  useEffect(() => {
    // register API-level HTTP error handler so api can auto-trigger our error views
    if (api && typeof api.setHttpErrorHandler === 'function') {
      api.setHttpErrorHandler(showHttpError);
      return () => api.setHttpErrorHandler(null);
    }
    return undefined;
  }, [showHttpError]);

  const goToProfile = () => {
    if (!isAuthenticated) return;
    setError('');
    setView('profile');
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
  const isProfileView = isAuthenticated && view === 'profile';
  const isError4xxView = view === 'error4xx';
  const isError5xxView = view === 'error5xx';
  const isErrorView = isError4xxView || isError5xxView;
  const bannerMessage = isLoginView || isRegisterView || isProfileView ? '' : error;
  const gameEndpoint = process.env.REACT_APP_GAME_ENDPOINT || '/game';
  const publicSingleRecord = resolvePublicRecordValue(
    profile?.records?.single ?? profile?.singleRecord ?? profile?.singleScore ?? profile?.singleWins ?? 0,
    0
  );
  const publicRankedRecord = resolvePublicRecordValue(
    profile?.records?.ranked ?? profile?.rankedRecord ?? profile?.rankedScore ?? profile?.rankedWins ?? 0,
    0
  );

  return (
    <div className="App">
      <div className="game-shell">
        <StatusBanner message={bannerMessage} onClose={() => setError('')} />
        <LoadingOverlay show={loading} />
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
          ) : isProfileView ? (
            <PublicProfileHeader
              initials={initials}
              profileImage={profile?.avatarUrl}
              name={profile?.name}
              nickname={profile?.nickname}
              onClose={goToHome}
            />
          ) : null}

          <main className={`App-main ${isGameView ? 'App-main-game' : ''} ${isProfileView ? 'App-main-profile' : ''}`}>
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
            ) : isError4xxView ? (
              <Error4xx code={404} />
            ) : isError5xxView ? (
              <Error5xx code={500} />
            ) : isProfileView ? (
              <PublicProfileCard profile={profile} />
            ) : null}
          </main>

          {!isGameView && !isErrorView && !isProfileView && <AppFooter />}
        </section>
      </div>
    </div>
  );
}

export default App;

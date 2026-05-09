import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './App.css';
import LoginHeader from './components/layout/LoginHeader';
import HomeHeader from './components/layout/HomeHeader';
import EditHeader from './components/layout/EditHeader';
import RegisterHeader from './components/layout/RegisterHeader';
import AppFooter from './components/layout/AppFooter';
import Error4xx from './components/layout/Error4xx';
import Error5xx from './components/layout/Error5xx';
import StatusBanner from './components/elements/StatusBanner';
import LoadingOverlay from './components/elements/LoadingOverlay';
import LoginCard from './components/auth/LoginCard';
import TwoFactorLoginCard from './components/auth/TwoFactorLoginCard';
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
  const pathToErrorView = (pathname) => {
    const normalized = `/${String(pathname || '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\/+/g, '/')}`;

    if (normalized === '/4xx') return 'error4xx';
    if (normalized === '/5xx') return 'error5xx';
    return null;
  };

  const navigateToPath = useCallback((path, nextView) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setView(nextView);
  }, []);

  const resolveAvatarUrl = useCallback((avatarValue) => {
    if (typeof avatarValue === 'string') return avatarValue;
    if (avatarValue && typeof avatarValue === 'object' && typeof avatarValue.default === 'string') {
      return avatarValue.default;
    }

    return '';
  }, []);

  const resolveAvatarFromProfilePic = useCallback((profilePic) => {
    const numericPic = Number(profilePic);
    if (!Number.isInteger(numericPic) || numericPic < 1 || numericPic > avatarOptions.length) {
      return '';
    }

    return avatarOptions[numericPic - 1] || '';
  }, []);

  const normalizeBackendUser = useCallback((payload, fallbackProfile = null) => {
    const user = payload?.user ?? payload ?? null;
    if (!user) return null;

    const avatarUrl = resolveAvatarUrl(user.avatarUrl) || resolveAvatarFromProfilePic(user.profilePic) || fallbackProfile?.avatarUrl || '';

    return {
      ...fallbackProfile,
      ...user,
      avatarUrl
    };
  }, [resolveAvatarFromProfilePic, resolveAvatarUrl]);

  const profileFromUser = useCallback((user, fallbackProfile = null) => ({
    name: user?.name || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    bio: user?.bio || fallbackProfile?.bio || 'Player ready to start the journey.',
    avatarUrl:
      resolveAvatarUrl(user?.avatarUrl) ||
      resolveAvatarFromProfilePic(user?.profilePic) ||
      fallbackProfile?.avatarUrl ||
      '',
    profilePic: Number(user?.profilePic) || fallbackProfile?.profilePic || 0,
    twoFactorEnabled: Boolean(user?.twoFactorEnabled)
  }), [resolveAvatarFromProfilePic, resolveAvatarUrl]);

  const normalizeFriendshipRequest = (request) => ({
    id: request?.id,
    requestId: request?.id,
    requesterId: request?.requesterId,
    receiverId: request?.receiverId,
    name: request?.requesterName || 'Convite pendente',
    nickname: request?.requesterName || '',
    status: request?.status || 'PENDING',
    createdAt: request?.createdAt
  });

  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emptyProfileForm = useMemo(() => ({
    name: '',
    nickname: '',
    email: '',
    bio: 'Player ready to start the journey.',
    avatarUrl: '',
    profilePic: 0,
    twoFactorEnabled: false
  }), []);

  const emptyRegisterForm = useMemo(() => ({
    name: '',
    nickname: '',
    email: '',
    password: '',
    profilePic: 0,
    bio: 'Player ready to start the journey.',
    avatarUrl: ''
  }), []);
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);

  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [twoFactorPendingToken, setTwoFactorPendingToken] = useState('');
  const [twoFactorLoginCode, setTwoFactorLoginCode] = useState('');

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

  const refreshFriendshipData = useCallback(async (token = localStorage.getItem('transcendence_token')) => {
    if (!token) {
      setFriends([]);
      setInvites([]);
      return { friends: [], invites: [] };
    }

    const [friendsResult, invitesResult] = await Promise.allSettled([
      api.listFriends(token),
      api.listPendingRequests(token)
    ]);

    const nextFriends = friendsResult.status === 'fulfilled' && Array.isArray(friendsResult.value)
      ? friendsResult.value
      : [];

    const nextInvites = invitesResult.status === 'fulfilled' && Array.isArray(invitesResult.value)
      ? invitesResult.value.map(normalizeFriendshipRequest)
      : [];

    setFriends(nextFriends);
    setInvites(nextInvites);

    return { friends: nextFriends, invites: nextInvites };
  }, []);

  const syncProfileFromToken = useCallback(async (targetView = 'home') => {
    const token = localStorage.getItem('transcendence_token');
    if (!token) {
      setProfile(null);
      setProfileForm(emptyProfileForm);
      setFriends([]);
      setInvites([]);
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
      await refreshFriendshipData(token);

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
      setFriends([]);
      setInvites([]);
      setView('login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshFriendshipData, emptyProfileForm, normalizeBackendUser, profileFromUser]);

  useEffect(() => {
    const routeView = pathToErrorView(window.location.pathname);
    if (routeView) {
      setView(routeView);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthError = urlParams.get('oauthError');

    if (oauthToken) {
      localStorage.setItem('transcendence_token', oauthToken);
      window.history.replaceState({}, '', window.location.pathname);
      syncProfileFromToken('home');
      return;
    }

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      window.history.replaceState({}, '', window.location.pathname);
      setView('login');
      return;
    }

    syncProfileFromToken('home');
  }, [syncProfileFromToken]);

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

  const handleTwoFactorCodeChange = (event) => {
    setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6));
  };

  const handleTwoFactorSetup = async () => {
    const token = localStorage.getItem('transcendence_token');
    if (!token) {
      setTwoFactorMessage('Sessao expirada. Faca login novamente.');
      return;
    }

    setError('');
    setTwoFactorMessage('');
    setLoading(true);

    try {
      const setup = await api.setupTwoFactor(token);
      setTwoFactorSetup(setup);
      setTwoFactorCode('');
      setTwoFactorMessage('Escaneie o QR Code e confirme com o codigo do app.');
    } catch (err) {
      setTwoFactorMessage(err?.message || 'Nao foi possivel iniciar o 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorEnable = async () => {
    const token = localStorage.getItem('transcendence_token');
    const normalizedCode = twoFactorCode.trim();

    if (!token) {
      setTwoFactorMessage('Sessao expirada. Faca login novamente.');
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setTwoFactorMessage('Digite exatamente os 6 digitos do app autenticador.');
      return;
    }

    setError('');
    setTwoFactorMessage('');
    setLoading(true);

    try {
      const response = await api.enableTwoFactor(token, normalizedCode);
      if (!response?.success) {
        throw new Error(response?.message || 'Codigo invalido.');
      }

      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setTwoFactorMessage('2FA ativado com sucesso.');
      setProfile((previous) => previous ? { ...previous, twoFactorEnabled: true } : previous);
      setProfileForm((previous) => ({ ...previous, twoFactorEnabled: true }));
      await syncProfileFromToken('profile');
    } catch (err) {
      setTwoFactorMessage(err?.message || 'Codigo invalido.');
    } finally {
      setLoading(false);
    }
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
        if (resp?.requiresTwoFactor && resp?.twoFactorToken) {
          setTwoFactorPendingToken(resp.twoFactorToken);
          setTwoFactorLoginCode('');
          setView('twoFactorLogin');
          return null;
        }

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

  const handleTwoFactorLoginCodeChange = (event) => {
    setTwoFactorLoginCode(event.target.value.replace(/\D/g, '').slice(0, 6));
  };

  const handleTwoFactorLoginVerify = (event) => {
    event.preventDefault();

    const normalizedCode = twoFactorLoginCode.trim();
    if (!twoFactorPendingToken) {
      setError('Sessao de 2FA expirada. Faca login novamente.');
      setView('login');
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError('Digite exatamente os 6 digitos do app autenticador.');
      return;
    }

    setError('');
    setLoading(true);
    api
      .verifyTwoFactor(twoFactorPendingToken, normalizedCode)
      .then((resp) => {
        const token = resp?.token || resp?.accessToken || resp?.jwt;
        if (!token) throw new Error('Codigo invalido.');
        localStorage.setItem('transcendence_token', token);
        setTwoFactorPendingToken('');
        setTwoFactorLoginCode('');
        return syncProfileFromToken('home');
      })
      .then((resolved) => {
        if (!resolved) return;
        setLoginForm({ email: '', password: '' });
      })
      .catch((err) => setError(err?.message || 'Codigo invalido.'))
      .finally(() => setLoading(false));
  };

  const handleBackToLoginFromTwoFactor = () => {
    setError('');
    setTwoFactorPendingToken('');
    setTwoFactorLoginCode('');
    setView('login');
  };

  const handleGoogleLogin = () => {
    setError('');
    window.location.href = api.getGoogleOAuthUrl();
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
      setFriends([]);
      setInvites([]);
      setLoginForm({ email: '', password: '' });
      setView('login');
      setLoading(false);
    }
  };

  const showHttpError = useCallback((status, message = '') => {
    if (status >= 500) {
      setError(message || 'Erro interno do servidor');
      navigateToPath('/5xx', 'error5xx');
    } else if (status === 404) {
      setError(message || 'Recurso não encontrado');
      navigateToPath('/4xx', 'error4xx');
    } else if (status >= 400) {
      setError(message || 'Falha na requisição');
    }
  }, [navigateToPath]);

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
    syncProfileFromToken('profile');
  };

  const goToHome = () => {
    if (!isAuthenticated) return;
    setView('home');
  };

  const handleSendFriendRequest = async (user) => {
    const token = localStorage.getItem('transcendence_token');
    const receiverId = Number(user?.id);

    if (!token) {
      throw new Error('Session expired');
    }

    if (!Number.isFinite(receiverId)) {
      throw new Error('Invalid friend selection');
    }

    const response = await api.sendFriendRequest(token, receiverId);
    await refreshFriendshipData(token);
    return response;
  };

  const handleAcceptFriendRequest = async (requestId) => {
    const token = localStorage.getItem('transcendence_token');

    if (!token) {
      throw new Error('Session expired');
    }

    const response = await api.acceptFriendRequest(token, requestId);
    await refreshFriendshipData(token);
    return response;
  };

  const handleRejectFriendRequest = async (requestId) => {
    const token = localStorage.getItem('transcendence_token');

    if (!token) {
      throw new Error('Session expired');
    }

    const response = await api.rejectFriendRequest(token, requestId);
    await refreshFriendshipData(token);
    return response;
  };

  const handleSearchUsers = async (query) => {
    const token = localStorage.getItem('transcendence_token');

    if (!token) {
      return [];
    }

    const users = await api.searchUsers(token, query);
    return Array.isArray(users) ? users : [];
  };

  const handleExitGame = () => {
    if (!isAuthenticated) return;
    setView('home');
  };

  
  const isLoginView = !isAuthenticated && view === 'login';
  const isTwoFactorLoginView = !isAuthenticated && view === 'twoFactorLogin';
  const isRegisterView = !isAuthenticated && view === 'register';
  const isHomeView = isAuthenticated && view === 'home';
  const isGameView = isAuthenticated && view === 'game';
  const isError4xxView = view === 'error4xx';
  const isError5xxView = view === 'error5xx';
  const isErrorView = isError4xxView || isError5xxView;
  const isProfileView = isAuthenticated && !isHomeView && !isGameView && !isErrorView;
  const bannerMessage = isLoginView || isRegisterView || isProfileView ? '' : error;
  const gameEndpoint = process.env.REACT_APP_GAME_ENDPOINT || '/game';

  return (
    <div className="App">
      <div className="game-shell">
        <StatusBanner message={bannerMessage} onClose={() => setError('')} />
        <LoadingOverlay show={loading} />
        <section className="game-stage" aria-label="Area principal do jogo">
          {isLoginView ? (
            <LoginHeader />
          ) : isTwoFactorLoginView ? (
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
          ) : isGameView || isErrorView ? null : (
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
            ) : isTwoFactorLoginView ? (
              <TwoFactorLoginCard
                code={twoFactorLoginCode}
                error={error}
                onCodeChange={handleTwoFactorLoginCodeChange}
                onVerify={handleTwoFactorLoginVerify}
                onBackToLogin={handleBackToLoginFromTwoFactor}
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
              <HomeCard
                onPlayGame={handleGoToGameWithOrigin}
                friends={friends}
                invites={invites}
                onSendInvite={handleSendFriendRequest}
                onAcceptInvite={handleAcceptFriendRequest}
                onRejectInvite={handleRejectFriendRequest}
                onSearchUsers={handleSearchUsers}
              />
            ) : isGameView ? (
              <GameCard gameEndpoint={gameEndpoint} onExitGame={handleExitGame} gameOrigin={gameOrigin} />
            ) : isError4xxView ? (
              <Error4xx code={404} />
            ) : isError5xxView ? (
              <Error5xx code={500} />
            ) : (
              <ProfileCard
                  initials={initials}
                  profileForm={profileForm}
                  error={error}
                  onProfileChange={handleProfileChange}
                  onProfileSave={handleProfileSave}
                  onProfileAvatarSelect={handleProfileAvatarSelect}
                  twoFactorSetup={twoFactorSetup}
                  twoFactorCode={twoFactorCode}
                  twoFactorMessage={twoFactorMessage}
                  onTwoFactorCodeChange={handleTwoFactorCodeChange}
                  onTwoFactorSetup={handleTwoFactorSetup}
                  onTwoFactorEnable={handleTwoFactorEnable}
                  loading={loading}
                />
            )}
          </main>

          {!isGameView && !isErrorView && <AppFooter />}
        </section>
      </div>
    </div>
  );
}

export default App;

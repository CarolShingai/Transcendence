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
import authService from './services/authService';
import './services/fetchInterceptor'; // Load fetch interceptor

function App() {
  const normalizeAvatarUrl = (avatarValue) => {
    if (!avatarValue) return '';

    const rawUrl =
      typeof avatarValue === 'string'
        ? avatarValue
        : typeof avatarValue === 'object' && typeof avatarValue.default === 'string'
          ? avatarValue.default
          : '';

    if (!rawUrl) return '';
    if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) return rawUrl;

    try {
      const parsedUrl = new URL(rawUrl, window.location.origin);

      if (parsedUrl.origin === window.location.origin) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      if (['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      return rawUrl;
    } catch {
      return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl.replace(/^\.?\//, '')}`;
    }
  };

  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const emptyProfileForm = {
    name: '',
    nickname: '',
    email: '',
    bio: 'Player ready to start the journey.',
    avatarUrl: '',
    twoFactorEnabled: false
  };
  const [profile, setProfile] = useState(() => {
    const storedProfile = localStorage.getItem('transcendence_profile');
    if (!storedProfile) return null;

    try {
      const parsedProfile = JSON.parse(storedProfile);
      return {
        ...parsedProfile,
        avatarUrl: normalizeAvatarUrl(parsedProfile?.avatarUrl)
      };
    } catch {
      return null;
    }
  });

  const [profileForm, setProfileForm] = useState(() => {
    if (!profile) return emptyProfileForm;

    return {
      name: profile.name,
      nickname: profile.nickname,
      email: profile.email,
      bio: profile.bio,
      avatarUrl: normalizeAvatarUrl(profile.avatarUrl)
    };
  });

  const [registerForm, setRegisterForm] = useState(emptyProfileForm);

  const isAuthenticated = Boolean(profile);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated() && !profile) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            const nextProfile = {
              name: user.name,
              nickname: user.nickname,
              email: user.email,
              bio: user.bio || 'Player ready to start the journey.',
              avatarUrl: normalizeAvatarUrl(user.profilePic)
            };
            setProfile(nextProfile);
            setProfileForm(nextProfile);
            localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
          }
        } catch (err) {
          console.error('Failed to initialize auth:', err);
          authService.logout();
        }
      }
    };

    initializeAuth();
  }, []);

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

  const handleRegisterChange = (event) => {
    const { name, type, value, checked } = event.target;
    setRegisterForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileChange = (event) => {
    const { name, type, value, checked } = event.target;
    setProfileForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(loginForm.email, loginForm.password);

      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setError('');
        return;
      }

      // Login successful
      if (response.user) {
        const nextProfile = {
          name: response.user.name,
          nickname: response.user.nickname,
          email: response.user.email,
          bio: response.user.bio || 'Player ready to start the journey.',
          avatarUrl: normalizeAvatarUrl(response.user.profilePic)
        };

        setProfile(nextProfile);
        setProfileForm(nextProfile);
        localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
        setView('home');
        setLoginForm({ email: '', password: '' });
        setRequiresTwoFactor(false);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');

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

  const handleRegisterSave = async (event) => {
    event.preventDefault();

    if (!registerForm.name || !registerForm.nickname || !registerForm.email) {
      setError('Name, nickname and email are required.');
      return;
    }

    if (!registerForm.password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(
        registerForm.nickname,
        registerForm.name,
        registerForm.email,
        registerForm.password
      );

      setError('');
      // After successful registration, login automatically
      const loginResponse = await authService.login(registerForm.email, registerForm.password);

      if (loginResponse.user) {
        const nextProfile = {
          name: loginResponse.user.name,
          nickname: loginResponse.user.nickname,
          email: loginResponse.user.email,
          bio: loginResponse.user.bio || 'Player ready to start the journey.',
          avatarUrl: loginResponse.user.profilePic || ''
        };

        setProfile(nextProfile);
        setProfileForm(nextProfile);
        localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
        setView('home');
        setLoginForm({ email: '', password: '' });
        setRegisterForm(emptyProfileForm);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterExit = () => {
    setError('');
    setRegisterForm(emptyProfileForm);
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
      avatarUrl: normalizeAvatarUrl(profileForm.avatarUrl)
    };
    setProfile(nextProfile);
    localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    setView('home');
  };

  const handleLogout = () => {
    authService.logout();
    setProfile(null);
    setProfileForm(emptyProfileForm);
    localStorage.removeItem('transcendence_profile');
    setView('login');
  };

  const goToProfile = () => {
    if (!isAuthenticated) return;
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
              />
            ) : isRegisterView ? (
              <RegisterCard
                initials={initials}
                registerForm={registerForm}
                error={error}
                onRegisterChange={handleRegisterChange}
                onRegisterSave={handleRegisterSave}
                isLoading={isLoading}
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
                isLoading={isLoading}
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

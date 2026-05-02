import React, { useMemo, useState } from 'react';
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

function App() {
  const resolveAvatarUrl = (avatarValue) => {
    if (typeof avatarValue === 'string') return avatarValue;
    if (avatarValue && typeof avatarValue === 'object' && typeof avatarValue.default === 'string') {
      return avatarValue.default;
    }

    return '';
  };

  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const emptyProfileForm = {
    name: '',
    nickname: '',
    email: '',
    bio: 'Player ready to start the journey.',
    avatarUrl: ''
  };
  const [profile, setProfile] = useState(() => {
    const storedProfile = localStorage.getItem('transcendence_profile');
    if (!storedProfile) return null;

    try {
      const parsedProfile = JSON.parse(storedProfile);
      return {
        ...parsedProfile,
        avatarUrl: resolveAvatarUrl(parsedProfile?.avatarUrl)
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
      avatarUrl: resolveAvatarUrl(profile.avatarUrl)
    };
  });

  const [registerForm, setRegisterForm] = useState(emptyProfileForm);

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

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
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

    const generatedName = loginForm.email.split('@')[0] || 'player';
    const nextProfile = {
      name: generatedName,
      nickname: generatedName,
      email: loginForm.email,
      bio: 'Player ready to start the journey.',
      avatarUrl: ''
    };

    setProfile(nextProfile);
    setProfileForm(nextProfile);
    localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    setView('home');
    setLoginForm({ email: '', password: '' });
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

  const handleRegisterSave = (event) => {
    event.preventDefault();

    if (!registerForm.name || !registerForm.nickname || !registerForm.email) {
      setError('Name, nickname and email are required.');
      return;
    }

    setError('');
    const nextProfile = {
      ...registerForm,
      avatarUrl: resolveAvatarUrl(registerForm.avatarUrl)
    };

    setProfile(nextProfile);
    setProfileForm(nextProfile);
    localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    setView('home');
    setLoginForm({ email: '', password: '' });
    setRegisterForm(emptyProfileForm);
  };

  const handleRegisterExit = () => {
    setError('');
    setRegisterForm(emptyProfileForm);
    setView('login');
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
    localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    setView('home');
  };

  const handleLogout = () => {
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

  const goToLogin = () => setView('login');
  const isLoginView = !isAuthenticated && view === 'login';
  const isRegisterView = !isAuthenticated && view === 'register';
  const isHomeView = isAuthenticated && view === 'home';

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
          ) : (
            <EditHeader onGoToHome={goToHome} onLogout={handleLogout} />
          )}

          <main className="App-main">
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
              />
            ) : isHomeView ? (
              <HomeCard />
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

          <AppFooter />
        </section>
      </div>
    </div>
  );
}

export default App;

import React, { useMemo, useState } from 'react';
import './App.css';
import LoginHeader from './components/layout/LoginHeader';
import EditHeader from './components/layout/EditHeader';
import AppFooter from './components/layout/AppFooter';
import LoginCard from './components/auth/LoginCard';
import ProfileCard from './components/profile/ProfileCard';

function App() {
  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(() => {
    const storedProfile = localStorage.getItem('transcendence_profile');
    if (!storedProfile) return null;

    try {
      return JSON.parse(storedProfile);
    } catch {
      return null;
    }
  });

  const [profileForm, setProfileForm] = useState(() => {
    if (!profile) {
      return {
        name: '',
        nickname: '',
        email: '',
        bio: 'Player ready to start the journey.'
      };
    }

    return {
      name: profile.name,
      nickname: profile.nickname,
      email: profile.email,
      bio: profile.bio
    };
  });

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
      bio: 'Player ready to start the journey.'
    };

    setProfile(nextProfile);
    setProfileForm(nextProfile);
    localStorage.setItem('transcendence_profile', JSON.stringify(nextProfile));
    setView('profile');
    setLoginForm({ email: '', password: '' });
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    if (!profileForm.name || !profileForm.nickname || !profileForm.email) {
      setError('Name, nickname and email are required.');
      return;
    }

    setError('');
    setProfile(profileForm);
    localStorage.setItem('transcendence_profile', JSON.stringify(profileForm));
  };

  const handleLogout = () => {
    setProfile(null);
    setProfileForm({
      name: '',
      nickname: '',
      email: '',
      bio: 'Player ready to start the journey.'
    });
    localStorage.removeItem('transcendence_profile');
    setView('login');
  };

  const goToProfile = () => {
    if (!isAuthenticated) return;
    setView('profile');
  };

  const goToLogin = () => setView('login');
  const isLoginView = !isAuthenticated || view === 'login';

  return (
    <div className="App">
      <div className="game-shell">
        <section className="game-stage" aria-label="Area principal do jogo">
          {isLoginView ? (
            <LoginHeader />
          ) : (
            <EditHeader onGoToLogin={goToLogin} onGoToProfile={goToProfile} />
          )}

          <main className="App-main">
            {isLoginView ? (
              <LoginCard
                loginForm={loginForm}
                error={error}
                onLoginChange={handleLoginChange}
                onLogin={handleLogin}
              />
            ) : (
              <ProfileCard
                initials={initials}
                profileForm={profileForm}
                error={error}
                onProfileChange={handleProfileChange}
                onProfileSave={handleProfileSave}
                onLogout={handleLogout}
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

import React, { useMemo, useState } from 'react';
import './App.css';

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

  return (
    <div className="App">
      <header className="App-header">
        <div className="hero-copy">
          <p className="birds" aria-hidden="true">🐦‍⬛ 🐦 🐦‍⬛ 🐦 🐦‍⬛</p>
          <h1>ROTA MIGRATORIA</h1>
          <p className="hero-subtitle">Guie seu bando pelos ceus</p>
        </div>
        <nav className="top-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-button ${view === 'login' ? 'active' : ''}`}
            onClick={goToLogin}
          >
            Observador
          </button>
          {isAuthenticated && (
            <button
              type="button"
              className={`nav-button ${view === 'profile' ? 'active' : ''}`}
              onClick={goToProfile}
            >
              Ninho
            </button>
          )}
        </nav>
      </header>

      <main className="App-main">
        {!isAuthenticated || view === 'login' ? (
          <section className="card" aria-label="Login screen">
            <p className="divider" aria-hidden="true">── ✦ ──</p>
            <h2>Alinhar bando</h2>
            <p className="support-text">
              Entre com suas credenciais para iniciar a migracao.
            </p>

            <form className="form-grid" onSubmit={handleLogin}>
              <label htmlFor="email">Observador</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu-nome@ninho.com"
                value={loginForm.email}
                onChange={handleLoginChange}
                autoComplete="email"
              />

              <label htmlFor="password">Senha do Ninho</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                value={loginForm.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
              />

              {error && <p className="error">{error}</p>}

              <button type="submit" className="primary-button">
                ALCAR VOO
              </button>
            </form>

            <button type="button" className="text-link" onClick={() => {}}>
              Primeiro voo? Criar ninho
            </button>
          </section>
        ) : (
          <section className="card" aria-label="Profile screen">
            <div className="profile-headline">
              <div className="avatar" aria-hidden="true">
                {initials}
              </div>
              <div>
                <p className="divider" aria-hidden="true">~ ~ 🕊️ ~ ~</p>
                <h2>Ninho do Viajante</h2>
                <p className="support-text">Atualize as informacoes publicas do seu perfil.</p>
              </div>
            </div>

            <form className="form-grid" onSubmit={handleProfileSave}>
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
              />

              <label htmlFor="nickname">Codinome</label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={profileForm.nickname}
                onChange={handleProfileChange}
              />

              <label htmlFor="profile-email">E-mail</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={profileForm.email}
                disabled
                className="input-disabled"
              />

              <label htmlFor="bio">Rota pessoal</label>
              <textarea
                id="bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                rows="4"
              />

              {error && <p className="error">{error}</p>}

              <div className="actions-row">
                <button type="submit" className="primary-button">
                  Guardar trilha
                </button>
                <button type="button" className="ghost-button" onClick={handleLogout}>
                  Sair do ninho
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <footer className="App-footer">
        <p>Jornada SPA: Observador -&gt; Ninho</p>
      </footer>
    </div>
  );
}

export default App;

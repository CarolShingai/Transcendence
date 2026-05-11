import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import LoginHeader from './components/layout/LoginHeader';
import HomeHeader from './components/layout/HomeHeader';
import EditHeader from './components/layout/EditHeader';
import RegisterHeader from './components/layout/RegisterHeader';
import AppFooter from './components/layout/AppFooter';
import PublicProfileHeader from './components/layout/PublicProfileHeader';
import Error4xx from './components/layout/Error4xx';
import Error5xx from './components/layout/Error5xx';
import StatusBanner from './components/elements/StatusBanner';
import LoadingOverlay from './components/elements/LoadingOverlay';
import LoginCard from './components/auth/LoginCard';
import TwoFactorLoginCard from './components/auth/TwoFactorLoginCard';
import RegisterCard from './components/auth/RegisterCard';
import ProfileCard from './components/profile/ProfileCard';
import PublicProfileCard from './components/profile/PublicProfileCard';
import HomeCard from './components/home/HomeCard';
import GameCard from './components/game/GameCard';
import api from './services/api';
import createWebSocketClient from './services/ws';
import PrivacyPolicyCard from './components/layout/PrivacyPolicyCard';
import TermsOfUseCard from './components/layout/TermsOfUseCard';
import usePresenceWebSocket from './hooks/usePresenceWebSocket';

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
    requesterName: request?.requesterName || '',
    requesterNickname: request?.requesterNickname || '',
    requesterProfilePic: Number(request?.requesterProfilePic) || 0,
    requesterAvatarUrl: resolveAvatarFromProfilePic(request?.requesterProfilePic) || request?.requesterAvatarUrl || '',
    receiverId: request?.receiverId,
    receiverName: request?.receiverName || '',
    receiverNickname: request?.receiverNickname || '',
    receiverProfilePic: Number(request?.receiverProfilePic) || 0,
    receiverAvatarUrl: resolveAvatarFromProfilePic(request?.receiverProfilePic) || request?.receiverAvatarUrl || '',
    name: request?.requesterName || 'Convite pendente',
    nickname: request?.requesterName || '',
    status: request?.status || 'PENDING',
    direction: request?.direction || null,
    createdAt: request?.createdAt
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

  const normalizeFriend = (friend) => ({
    id: friend?.id,
    name: friend?.name || '',
    nickname: friend?.nickname || '',
    status: friend?.status || 'Offline',
    profilePic: Number(friend?.profilePic) || 0,
    avatarUrl: resolveAvatarFromProfilePic(friend?.profilePic) || friend?.avatarUrl || ''
  });

  const normalizeInvite = (invite) => ({
    id: invite?.id,
    requesterId: invite?.requesterId ?? invite?.requester?.id ?? invite?.senderId ?? invite?.sender?.id ?? null,
    requesterName: invite?.requesterName ?? invite?.requester?.name ?? invite?.senderName ?? invite?.sender?.name ?? '',
    requesterNickname: invite?.requesterNickname ?? invite?.requester?.nickname ?? invite?.senderNickname ?? invite?.sender?.nickname ?? '',
    requesterProfilePic: Number(invite?.requesterProfilePic ?? invite?.requester?.profilePic ?? invite?.senderProfilePic ?? invite?.sender?.profilePic) || 0,
    requesterAvatarUrl: resolveAvatarFromProfilePic(invite?.requesterProfilePic ?? invite?.requester?.profilePic ?? invite?.senderProfilePic ?? invite?.sender?.profilePic) || invite?.requester?.avatarUrl || invite?.sender?.avatarUrl || '',
    receiverId: invite?.receiverId ?? invite?.receiver?.id ?? null,
    receiverName: invite?.receiverName ?? invite?.receiver?.name ?? '',
    receiverNickname: invite?.receiverNickname ?? invite?.receiver?.nickname ?? '',
    receiverProfilePic: Number(invite?.receiverProfilePic ?? invite?.receiver?.profilePic) || 0,
    receiverAvatarUrl: resolveAvatarFromProfilePic(invite?.receiverProfilePic ?? invite?.receiver?.profilePic) || invite?.receiver?.avatarUrl || '',
    status: invite?.status || 'PENDING',
    direction: invite?.direction || null,
    createdAt: invite?.createdAt || null
  });

  const normalizePerson = (person) => ({
    id: person?.id,
    name: person?.name || '',
    nickname: person?.nickname || '',
    profilePic: Number(person?.profilePic) || 0,
    avatarUrl: resolveAvatarFromProfilePic(person?.profilePic) || person?.avatarUrl || '',
    status: person?.status || 'online'
  });

  const extractParticipantIds = (invite) => {
    const ids = [invite?.requesterId, invite?.receiverId]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value));
    return ids;
  };

  const filterAvailablePeople = (peopleList, friendsList, invitesList, currentUserId = null) => {
    const blockedIds = new Set([
      ...(currentUserId !== null && currentUserId !== undefined ? [String(currentUserId)] : []),
      ...(friendsList || []).map((friend) => String(friend?.id)),
      ...(invitesList || []).flatMap((invite) => extractParticipantIds(invite))
    ]);

    return (peopleList || []).filter((person) => !blockedIds.has(String(person?.id)));
  };

  const [view, setView] = useState('login');
  const [homeCarouselIndex, setHomeCarouselIndex] = useState(0);
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
  const [viewedProfile, setViewedProfile] = useState(null);
  const [viewedProfileOverlay, setViewedProfileOverlay] = useState(null);
  const [overlayDialogSize, setOverlayDialogSize] = useState(null);
  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);
  const [optimisticInvites, setOptimisticInvites] = useState([]);

  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [twoFactorPendingToken, setTwoFactorPendingToken] = useState('');
  const [twoFactorLoginCode, setTwoFactorLoginCode] = useState('');

  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);

  const isAuthenticated = Boolean(profile);

  const wsToken = isAuthenticated ? localStorage.getItem('transcendence_token') : null;
  const { onlineUsers, isConnected } = usePresenceWebSocket(wsToken);

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
    if (!isAuthenticated || view !== 'home') {
      return undefined;
    }

    void refreshFriendshipData();
    return undefined;
  }, [isAuthenticated, view, refreshFriendshipData]);

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
  const [gameOverlayOpen, setGameOverlayOpen] = useState(false);

  const handleGoToGameWithOrigin = (origin) => {
    if (!isAuthenticated) return;
    setGameOrigin(origin || null);
    setGameOverlayOpen(true);
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
    const optimisticInvite = normalizeInvite({
      ...response,
      id: response?.id ?? Date.now(),
      receiverId,
      receiverName: user?.name || response?.receiverName || '',
      status: response?.status || 'PENDING',
      direction: 'sent'
    });
    const nextOptimisticInvites = [
      ...optimisticInvites.filter((item) => String(item.id) !== String(optimisticInvite.id)),
      optimisticInvite,
    ];
    setOptimisticInvites(nextOptimisticInvites);
    await refreshFriendshipData(token, nextOptimisticInvites);
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
    setError('');
    setViewedProfile(null);
    setView('profile');
  };

  const goToEditProfile = () => {
    if (!isAuthenticated) return;
    setError('');
    setViewedProfile(null);
    setView('profileEdit');
  };

  const computeOverlaySize = useCallback(() => {
    try {
      const homeEl = document.querySelector('.home-card');
      if (!homeEl) {
        setOverlayDialogSize(null);
        return;
      }
      const rect = homeEl.getBoundingClientRect();
      // take 100% (increased 30% from 98%)
      const width = Math.max(0, rect.width * 1.0);
      const height = Math.max(0, rect.height * 1.0);
      setOverlayDialogSize({ width, height });
    } catch (err) {
      setOverlayDialogSize(null);
    }
  }, []);

  useEffect(() => {
    if (!viewedProfileOverlay) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setViewedProfileOverlay(null);
    };
    // compute size when overlay opens
    computeOverlaySize();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', computeOverlaySize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', computeOverlaySize);
    };
  }, [viewedProfileOverlay, computeOverlaySize]);

  const openPublicProfile = (publicProfile) => {
    // If user is on the home view, open profile as an overlay and keep home view
    if (view === 'home') {
      setViewedProfileOverlay(publicProfile || null);
      setError('');
      return;
    }

    setViewedProfile(publicProfile || null);
    setError('');
    setView('profile');
  };


  

  const goToHome = () => {
    if (!isAuthenticated) return;
    setView('home');
  };

  const handleSearchUsers = async (query) => {
    const token = localStorage.getItem('transcendence_token');
    console.log('[App.handleSearchUsers] Query:', query, 'Token exists:', !!token);

    if (!token) {
      console.warn('[App.handleSearchUsers] No token in localStorage');
      return [];
    }

    try {
      const users = await api.searchUsers(token, query);
      console.log('[App.handleSearchUsers] Users returned:', users);
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('[App.handleSearchUsers] Error:', error);
      return [];
    }
  };

  const handleLoadAllUsers = async () => {
    const token = localStorage.getItem('transcendence_token');
    console.log('[App.handleLoadAllUsers] Loading all users, Token exists:', !!token);

    if (!token) {
      console.warn('[App.handleLoadAllUsers] No token in localStorage');
      return [];
    }

    try {
      const users = await api.listAllUsers(token);
      console.log('[App.handleLoadAllUsers] All users loaded:', users);
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('[App.handleLoadAllUsers] Error:', error);
      return [];
    }
  };

  const handleExitGame = () => {
    if (!isAuthenticated) return;
    setGameOverlayOpen(false);
  };

  
  const isLoginView = !isAuthenticated && view === 'login';
  const isTwoFactorLoginView = !isAuthenticated && view === 'twoFactorLogin';
  const isRegisterView = !isAuthenticated && view === 'register';
  const isHomeView = isAuthenticated && view === 'home';
  const isEditProfileView = isAuthenticated && view === 'editProfile';
  const isGameView = isAuthenticated && view === 'game';
  const isProfileView = isAuthenticated && view === 'profile';
  const isProfileEditView = isAuthenticated && view === 'profileEdit';
  const isError4xxView = view === 'error4xx';
  const isError5xxView = view === 'error5xx';
  const isErrorView = isError4xxView || isError5xxView;
  const bannerMessage = isLoginView || isRegisterView || isProfileView || isEditProfileView ? '' : error;
  const gameEndpoint = process.env.REACT_APP_GAME_ENDPOINT || '/game/index.html';
  const publicSingleRecord = resolvePublicRecordValue(
    profile?.records?.single ?? profile?.singleRecord ?? profile?.singleScore ?? profile?.singleWins ?? 0,
    0
  );
  const publicRankedRecord = resolvePublicRecordValue(
    profile?.records?.ranked ?? profile?.rankedRecord ?? profile?.rankedScore ?? profile?.rankedWins ?? 0,
    0
  );

  const goToPrivacyPolicy = () => setView('privacyPolicy');
  const goToTermsOfUse = () => setView('termsOfUse');

  const isPrivacyPolicyView = view === 'privacyPolicy';
  const isTermsOfUseView = view === 'termsOfUse';

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
          ) : isHomeView || isProfileEditView ? (
            <HomeHeader
              initials={initials}
              profileImage={profile?.avatarUrl}
              welcomeName={profile?.nickname || profile?.name || 'Viajante'}
              onGoToProfile={goToProfile}
              onGoToEditProfile={goToEditProfile}
              onLogout={handleLogout}
            />
          ) : isEditProfileView ? (
            <EditHeader onGoToHome={goToHome} onLogout={handleLogout} />
          ) : isProfileView ? (
            <PublicProfileHeader
              initials={initials}
              profileImage={(viewedProfile || profile)?.avatarUrl}
              name={(viewedProfile || profile)?.name}
              nickname={(viewedProfile || profile)?.nickname}
              onClose={() => {
                setViewedProfile(null);
                goToHome();
              }}
            />
          ) : isPrivacyPolicyView ? (
            <>
              <HomeHeader
                initials={initials}
                profileImage={profile?.avatarUrl}
                welcomeName={profile?.nickname || profile?.name || 'Viajante'}
                onGoToProfile={goToProfile}
                onGoToEditProfile={goToEditProfile}
                onLogout={handleLogout}
              />
              <PrivacyPolicyCard onBack={() => setView('home')} />
            </>
          ) : isTermsOfUseView ? (
            <>
              <HomeHeader
                initials={initials}
                profileImage={profile?.avatarUrl}
                welcomeName={profile?.nickname || profile?.name || 'Viajante'}
                onGoToProfile={goToProfile}
                onGoToEditProfile={goToEditProfile}
                onLogout={handleLogout}
              />
              <TermsOfUseCard onBack={() => setView('home')} />
            </>
          ) : null}

          <main className={`App-main ${isGameView ? 'App-main-game' : ''} ${isProfileView ? 'App-main-profile' : ''} ${isEditProfileView ? 'App-main-profile' : ''}`}>
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
                onOpenProfile={openPublicProfile}
                onlineUsers={onlineUsers}
                isWsConnected={isConnected}
                onSendInvite={handleSendFriendRequest}
                onAcceptInvite={handleAcceptFriendRequest}
                onRejectInvite={handleRejectFriendRequest}
                onSearchUsers={handleSearchUsers}
                onLoadAllUsers={handleLoadAllUsers}
              />
            ) : isGameView ? (
              <GameCard gameEndpoint={gameEndpoint} onExitGame={handleExitGame} gameOrigin={gameOrigin} />
            ) : isError4xxView ? (
              <Error4xx code={404} />
            ) : isError5xxView ? (
              <Error5xx code={500} />
            ) : isProfileEditView ? (
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
            ) : isProfileView ? (
              <PublicProfileCard profile={viewedProfile || profile} />
            ) : null}
          </main>

          {!isGameView && !isErrorView && !isProfileView && !isEditProfileView && <AppFooter onGoToPrivacyPolicy={goToPrivacyPolicy} onGoToTermsOfUse={goToTermsOfUse} isAuthenticated={isAuthenticated}/>}
        </section>
      </div>
      {view === 'home' && viewedProfileOverlay && ReactDOM.createPortal(
        <div
          className="profile-overlay-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
          }}
          onClick={() => setViewedProfileOverlay(null)}
        >
          <div
            role="dialog"
            aria-label="Perfil público"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '80vw',
              height: '80vh',
              overflow: 'hidden',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="game-card overlay-profile-container" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, height: '100%' }}>
              <PublicProfileHeader
                initials={profileFromUser(viewedProfileOverlay)?.nickname?.slice(0,2).toUpperCase() || profileFromUser(viewedProfileOverlay)?.name?.split(' ').map(Boolean).slice(0,2).map(t=>t[0].toUpperCase()).join('') || 'U'}
                profileImage={profileFromUser(viewedProfileOverlay)?.avatarUrl}
                name={profileFromUser(viewedProfileOverlay)?.name}
                nickname={profileFromUser(viewedProfileOverlay)?.nickname}
                onClose={() => setViewedProfileOverlay(null)}
              />
              <div style={{ marginTop: '0.5rem', flex: 1, minHeight: 0, height: '100%' }}>
                <PublicProfileCard profile={profileFromUser(viewedProfileOverlay)} />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {isAuthenticated && gameOverlayOpen && ReactDOM.createPortal(
        <div
          className="game-overlay-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
          }}
          onClick={() => setGameOverlayOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Jogo"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90vw',
              height: '90vh',
              overflow: 'hidden',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <GameCard gameEndpoint={gameEndpoint} onExitGame={handleExitGame} gameOrigin={gameOrigin} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';

// Load avatar options from assets/profile (optional)
let avatarOptions = [];
try {
  const avatarContext = require.context('../../assets/profile', false, /\.(png|jpe?g|webp)$/);
  avatarOptions = avatarContext
    .keys()
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((key) => {
      const moduleValue = avatarContext(key);
      return moduleValue?.default || moduleValue;
    });
} catch (e) {
  avatarOptions = [];
}

function resolveAvatarUrlFrom(profilePic, avatarUrl) {
  if (typeof avatarUrl === 'string' && avatarUrl) return avatarUrl;
  const numericPic = Number(profilePic);
  if (!Number.isInteger(numericPic) || numericPic < 1 || numericPic > avatarOptions.length) return '';
  return avatarOptions[numericPic - 1] || '';
}

function FriendsSearch({ onSendInvite, onSearchUsers, onLoadAllUsers, onOpenProfile, sentInviteIds = [], friendIds = [], currentUserId = null, debounceMs = 1000 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingInviteIds, setPendingInviteIds] = useState([]);

  const getInitials = (name, nickname, email) => {
    const base = (name && String(name).trim()) || (nickname && String(nickname).trim()) || (email && String(email).split('@')[0].trim()) || '';
    const initials = base
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((t) => t[0]?.toUpperCase())
      .join('');
    return initials || (base[0]?.toUpperCase() || 'U');
  };

  // Load all users on component mount
  useEffect(() => {
    const loadAll = async () => {
      if (typeof onLoadAllUsers === 'function') {
        setLoading(true);
        try {
          const users = await onLoadAllUsers();
          console.log('[FriendsSearch] Initial users loaded:', users);
          setResults(Array.isArray(users) ? users : []);
        } catch (error) {
          console.error('[FriendsSearch] Error loading all users:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadAll();
  }, [onLoadAllUsers]);

  const friendIdSet = useMemo(() => new Set((friendIds || []).map((id) => String(id))), [friendIds]);
  const sentIdSet = useMemo(() => new Set((sentInviteIds || []).map((id) => String(id))), [sentInviteIds]);
  const currentUserIdStr = currentUserId == null ? null : String(currentUserId);

  // Handle search/filter with debounce
  useEffect(() => {
    if (!onSearchUsers) {
      console.warn('[FriendsSearch] onSearchUsers not provided');
      return undefined;
    }

    const trimmed = query.trim();
    
    // If query is empty, we already have all users loaded, so just return
    if (trimmed.length === 0) {
      console.log('[FriendsSearch] Query cleared, showing all users');
      return undefined;
    }

    let cancelled = false;
    
    // If query is empty, no need to set loading or search
    if (trimmed.length === 0) {
      console.log('[FriendsSearch] Query cleared, showing all users');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    console.log('[FriendsSearch] Searching for:', trimmed);
    
    const t = setTimeout(async () => {
      try {
        const data = await onSearchUsers(trimmed);
        if (cancelled) return;
        console.log('[FriendsSearch] Search results:', data);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        if (cancelled) return;
        console.error('[FriendsSearch] Error searching users:', error);
        setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, debounceMs, onSearchUsers]);

  const handleSend = async (user) => {
    if (typeof onSendInvite !== 'function') return null;
    setPendingInviteIds((prev) => [...prev, String(user.id)]);
    try {
      const result = await onSendInvite(user);

      // If send succeeded, refresh loaded users (so the invitee is removed)
      if (result != null) {
        if (typeof onLoadAllUsers === 'function') {
          setLoading(true);
          try {
            const users = await onLoadAllUsers();
            setResults(Array.isArray(users) ? users : []);
          } catch (e) {
            console.error('[FriendsSearch] Error reloading users after invite:', e);
          } finally {
            setLoading(false);
          }
        } else if (typeof onSearchUsers === 'function' && query.trim().length > 0) {
          try {
            const data = await onSearchUsers(query.trim());
            setResults(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error('[FriendsSearch] Error re-searching users after invite:', e);
          }
        }

        // Notify other components that friends data changed
        try {
          window.dispatchEvent(new CustomEvent('friends:changed', { detail: { type: 'invite-sent', userId: user.id } }));
        } catch (e) {
          /* ignore in non-browser environments */
        }
      }

      return result;
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('already exists') || message.includes('already friend') || message.includes('duplicate')) {
        return null;
      }

      throw error;
    } finally {
      setPendingInviteIds((prev) => prev.filter((id) => id !== String(user.id)));
    }
  };

  const visibleResults = useMemo(() => {
    const filtered = (results || []).filter((user) => {
      const idStr = String(user?.id);
      if (currentUserIdStr && idStr === currentUserIdStr) {
        return false;
      }
      if (friendIdSet.has(idStr)) {
        console.log(`[FriendsSearch] Filtering out ${user.name} (id: ${user.id}) - already friend`);
        return false;
      }
      if (sentIdSet.has(idStr)) {
        console.log(`[FriendsSearch] Filtering out ${user.name} (id: ${user.id}) - invite already sent`);
        return false;
      }
      if (pendingInviteIds.includes(idStr)) {
        console.log(`[FriendsSearch] Filtering out ${user.name} (id: ${user.id}) - invite pending`);
        return false;
      }
      return true;
    });
    console.log(`[FriendsSearch] Visible results: ${filtered.length} / ${results.length}`);
    return filtered;
  }, [results, friendIdSet, sentIdSet, pendingInviteIds, currentUserIdStr]);

  // Listen for global events indicating friends data changed (accept/reject elsewhere)
  useEffect(() => {
    let cancelled = false;
    const handler = async (ev) => {
      if (cancelled) return;
      if (typeof onLoadAllUsers === 'function') {
        setLoading(true);
        try {
          const users = await onLoadAllUsers();
          if (!cancelled) setResults(Array.isArray(users) ? users : []);
        } catch (e) {
          console.error('[FriendsSearch] Error reloading users on friends:changed:', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    };

    try {
      window.addEventListener('friends:changed', handler);
    } catch (e) {
      // ignore in non-browser envs
    }

    return () => {
      cancelled = true;
      try { window.removeEventListener('friends:changed', handler); } catch (e) {}
    };
  }, [onLoadAllUsers]);

  return (
    <>
      <input
        type="search"
        className="friends-search-input"
        placeholder="🔍 Pesquisar por nome ou nickname"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Pesquisar amigos"
      />

      <div className="friends-search-results">
        {loading && <div className="friends-search-loading">Carregando...</div>}

        {/* Caso apenas o próprio usuário exista no sistema: mostra empty-state igual à aba 'Amigos' */}
        {!loading && visibleResults.length === 0 && results.length === 1 && currentUserIdStr && String(results[0]?.id) === currentUserIdStr && (
          <div className="friends-empty-state">
            <p>Ninguém disponível para adicionar!</p>
          </div>
        )}

        {/* Caso inicial: há usuários no sistema, mas após filtrar amigos/convites nada resta */}
        {!loading && visibleResults.length === 0 && results.length > 0 && query.trim().length === 0 && !(results.length === 1 && currentUserIdStr && String(results[0]?.id) === currentUserIdStr) && (
          <div className="friends-empty-state">
            <p>Ninguém disponível para adicionar!</p>
          </div>
        )}

        {!loading && visibleResults.length === 0 && results.length === 0 && query.trim().length === 0 && (
          <div className="friends-search-no-results" style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '8px' }}>
            nenhum usuário disponível
          </div>
        )}

        {!loading && visibleResults.length === 0 && results.length > 0 && query.trim().length > 0 && (
          <div className="friends-search-no-results" style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '8px' }}>
            nenhum usuário encontrado para "{query}"
          </div>
        )}

        {!loading && visibleResults.map((user) => {
          const idStr = String(user.id);
          const alreadySent = sentIdSet.has(idStr) || pendingInviteIds.includes(idStr);
          const handleKeyDown = (e) => {
            if (!onOpenProfile) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenProfile(user);
            }
          };

          return (
              <article
                key={user.id}
                className="friend-item friend-search-item"
                role={onOpenProfile ? 'button' : undefined}
                tabIndex={onOpenProfile ? 0 : undefined}
                onClick={() => onOpenProfile ? onOpenProfile(user) : null}
                onKeyDown={handleKeyDown}
              >
                <div className="friend-avatar" aria-hidden="true">
                  {
                    (() => {
                      const avatarUrl = resolveAvatarUrlFrom(user.profilePic, user.avatarUrl);
                      if (avatarUrl) {
                        return (
                          <img src={avatarUrl} alt={user.name || user.nickname || 'Avatar'} className="friend-avatar-image" />
                        );
                      }
                      return getInitials(user.name, user.nickname, user.email);
                    })()
                  }
                </div>
              <div className="friend-info">
                <div className="friend-name">{user.name}</div>
                <div className="friend-nickname">@{user.nickname || user.email}</div>
              </div>
              <button
                type="button"
                className="friend-action-button friend-send-button"
                onClick={(e) => { e.stopPropagation(); handleSend(user); }}
                disabled={alreadySent}
              >
                {alreadySent ? 'Convite enviado' : 'Enviar convite'}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default FriendsSearch;

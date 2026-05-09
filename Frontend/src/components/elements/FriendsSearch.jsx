import React, { useState, useEffect, useMemo } from 'react';

function FriendsSearch({ onSendInvite, onSearchUsers, sentInviteIds = [], friendIds = [], minLength = 3, debounceMs = 1000 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [pendingInviteIds, setPendingInviteIds] = useState([]);
  const friendIdSet = useMemo(() => new Set((friendIds || []).map((id) => String(id))), [friendIds]);

  useEffect(() => {
    setLocalSentIds(new Set((sentInviteIds || []).map((id) => String(id))));
  }, [sentInviteIds]);

  const friendIdSet = useMemo(() => new Set((friendIds || []).map((id) => String(id))), [friendIds]);
  const inviteIdSet = useMemo(() => new Set((inviteIds || []).map((id) => String(id))), [inviteIds]);
  const currentUserIdStr = currentUserId === null || currentUserId === undefined ? null : String(currentUserId);

  const visiblePeople = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = Array.isArray(people) ? people : [];
    const shouldFilterByText = q.length > 0; // always filter locally as user types

    return source.filter((person) => {
      const idStr = String(person?.id);
      if (currentUserIdStr && idStr === currentUserIdStr) return false;
      if (friendIdSet.has(idStr)) return false;
      if (inviteIdSet.has(idStr)) return false;
      if (localSentIds.has(idStr)) return false;
      if (!shouldFilterByText) return true;

      const haystack = [person?.name, person?.nickname, person?.email]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');

      return haystack.includes(q);
    });
  }, [people, query, minLength, friendIdSet, inviteIdSet, localSentIds]);

  // Debounce remote search: call parent-provided `onRemoteSearch` after user stops typing
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      if (typeof onRemoteSearch === 'function') {
        if (trimmed.length >= minLength) {
          onRemoteSearch(trimmed);
        } else {
          // signal empty query (optional)
          onRemoteSearch('');
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, minLength, onRemoteSearch]);

  const handleSendInvite = async (user) => {
    if (typeof onSendInvite !== 'function') {
      return null;
    }

    setLoading(true);
    setShowNoResults(false);

    let cancelled = false;
    const t = setTimeout(() => {
      const executeSearch = async () => {
        if (typeof onSearchUsers !== 'function') {
          if (!cancelled) {
            setResults([]);
            setShowNoResults(false);
            setLoading(false);
          }
          return;
        }

        try {
          const data = await onSearchUsers(trimmed);
          const list = Array.isArray(data) ? data : [];
          if (cancelled) return;
          setResults(list);
          setShowNoResults(list.length === 0);
        } catch {
          if (cancelled) return;
          setResults([]);
          setShowNoResults(true);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      void executeSearch();
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, minLength, debounceMs, onSearchUsers]);

  const handleSendInvite = async (user) => {
    if (typeof onSendInvite !== 'function') {
      return null;
    }

    setPendingInviteIds((previous) => [...previous, user.id]);

    try {
      return await onSendInvite(user);
    } finally {
      setPendingInviteIds((previous) => previous.filter((id) => id !== user.id));
    }
  };

  return (
    <>
      <input
        type="search"
        className="friends-search-input"
        placeholder="🔍 Pesquisar por nome ou nickname"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Pesquisar amigos"
      />

      {query.trim() !== '' && visiblePeople.length === 0 && (
        <div
          className="friends-search-no-results"
          style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '8px' }}
        >
          nenhum usuário encontrado
        </div>
      )}

      <div className="friends-search-results">
        {loading && <div className="friends-search-loading">Carregando...</div>}

        {!loading && results.length > 0 && results.map((user) => {
          const userIdStr = String(user.id);
          const alreadySent = sentInviteIds.includes(user.id) || pendingInviteIds.includes(user.id);
          const isFriend = friendIdSet.has(userIdStr);

          return (
            <article key={user.id} className="friend-item friend-search-item">
              <div className="friend-avatar" aria-hidden="true">{(user.name || '').split(' ').map(Boolean).slice(0,2).map(t => t[0]?.toUpperCase()).join('')}</div>
              <div className="friend-info">
                <div className="friend-name">{user.name}</div>
                <div className="friend-nickname">@{user.nickname || user.email}</div>
              </div>
              <button
                type="button"
                className="friend-action-button friend-send-button"
                onClick={() => handleSendInvite(user)}
                disabled={alreadySent || isFriend}
              >
                {isFriend ? 'Amigo' : alreadySent ? 'Convite enviado' : 'Enviar convite'}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default FriendsSearch;

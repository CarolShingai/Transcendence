import React, { useState, useEffect, useMemo } from 'react';

function FriendsSearch({ onSendInvite, onSearchUsers, sentInviteIds = [], friendIds = [], minLength = 3, debounceMs = 600 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingInviteIds, setPendingInviteIds] = useState([]);

  const friendIdSet = useMemo(() => new Set((friendIds || []).map((id) => String(id))), [friendIds]);
  const sentIdSet = useMemo(() => new Set((sentInviteIds || []).map((id) => String(id))), [sentInviteIds]);

  useEffect(() => {
    if (!onSearchUsers) return undefined;
    const trimmed = query.trim();
    if (trimmed.length < minLength) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await onSearchUsers(trimmed);
        if (cancelled) return;
        setResults(Array.isArray(data) ? data : []);
      } catch {
        if (cancelled) return;
        setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, debounceMs, minLength, onSearchUsers]);

  const handleSend = async (user) => {
    if (typeof onSendInvite !== 'function') return null;
    setPendingInviteIds((prev) => [...prev, String(user.id)]);
    try {
      return await onSendInvite(user);
    } finally {
      setPendingInviteIds((prev) => prev.filter((id) => id !== String(user.id)));
    }
  };

  const visibleResults = useMemo(() => {
    return (results || []).filter((user) => {
      const idStr = String(user?.id);
      if (friendIdSet.has(idStr)) return false;
      if (sentIdSet.has(idStr)) return false;
      if (pendingInviteIds.includes(idStr)) return false;
      return true;
    });
  }, [results, friendIdSet, sentIdSet, pendingInviteIds]);

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

        {!loading && visibleResults.length === 0 && query.trim().length >= minLength && (
          <div className="friends-search-no-results" style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '8px' }}>
            nenhum usuário encontrado
          </div>
        )}

        {!loading && visibleResults.map((user) => {
          const idStr = String(user.id);
          const alreadySent = sentIdSet.has(idStr) || pendingInviteIds.includes(idStr);
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
                onClick={() => handleSend(user)}
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

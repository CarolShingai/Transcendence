import React, { useState, useEffect } from 'react';

function FriendsSearch({ onSendInvite, onSearchUsers, sentInviteIds = [], minLength = 3, debounceMs = 1000 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [pendingInviteIds, setPendingInviteIds] = useState([]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < minLength) {
      setResults([]);
      setShowNoResults(false);
      setLoading(false);
      return undefined;
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

      {query.trim() !== '' && showNoResults && (
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
          const alreadySent = sentInviteIds.includes(user.id) || pendingInviteIds.includes(user.id);

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

import React, { useState, useEffect } from 'react';

function FriendsSearch({ onSendInvite, sentInviteIds = [], minLength = 3, debounceMs = 1000 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);

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

    const t = setTimeout(() => {
      // TODO: Colocar o endpoint aqui!
      const url = `/api/users/search?q=${encodeURIComponent(trimmed)}`;

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setResults(list);
          setShowNoResults(list.length === 0);
        })
        .catch(() => {
          setResults([]);
          setShowNoResults(true);
        })
        .finally(() => setLoading(false));
    }, debounceMs);

    return () => clearTimeout(t);
  }, [query, minLength, debounceMs]);

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
          const alreadySent = sentInviteIds.includes(user.id);

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
                onClick={() => onSendInvite && onSendInvite(user)}
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

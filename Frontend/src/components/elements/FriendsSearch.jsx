import React, { useEffect, useState } from 'react';
import { searchUsers as mockSearchUsers, sendFriendRequest as mockSendFriendRequest } from '../../services/friendsService';

function FriendsSearch({ onSendInvite, onSearchUsers, sentInviteIds = [], friendIds = [], minLength = 3, debounceMs = 1000 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const friendIdSet = new Set((friendIds || []).map((id) => String(id)));

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
      const executeSearch = async () => {
        const searchFn = typeof onSearchUsers === 'function' ? onSearchUsers : mockSearchUsers;

        try {
          const data = await searchFn(trimmed);
          const list = Array.isArray(data) ? data : [];
          setResults(list);
          setShowNoResults(list.length === 0);
        } catch {
          setResults([]);
          setShowNoResults(true);
        } finally {
          setLoading(false);
        }
      };

      void executeSearch();
    }, debounceMs);

    return () => clearTimeout(t);
  }, [query, minLength, debounceMs, onSearchUsers]);

  const handleSendInvite = async (user) => {
    if (typeof onSendInvite === 'function') {
      return onSendInvite(user);
    }

    return mockSendFriendRequest(user);
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
          const userIdStr = String(user.id);
          const alreadySent = sentInviteIds.includes(user.id) || sentInviteIds.includes(userIdStr);
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

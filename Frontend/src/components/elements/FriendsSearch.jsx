import React, { useEffect, useMemo, useState } from 'react';
import { sendFriendRequest as mockSendFriendRequest } from '../../services/friendsService';
import { MOCK_SEARCH_USERS } from '../../services/friendsMockData';

function FriendsSearch({ onSendInvite, onSearchUsers, sentInviteIds = [], friendIds = [], minLength = 3, debounceMs = 1000 }) {
  const [query, setQuery] = useState('');
  const friendIdSet = new Set((friendIds || []).map((id) => String(id)));
  const [localSentIds, setLocalSentIds] = useState(() => new Set((sentInviteIds || []).map((id) => String(id))));

  useEffect(() => {
    setLocalSentIds(new Set((sentInviteIds || []).map((id) => String(id))));
  }, [sentInviteIds]);
  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const master = Array.isArray(MOCK_SEARCH_USERS) ? MOCK_SEARCH_USERS : [];

    return master.filter((user) => {
      const idStr = String(user.id);
      if (friendIdSet.has(idStr)) return false;
      if (localSentIds.has(idStr)) return false;

      if (!q) return true;

      const haystack = [user.name, user.nickname, user.email]
        .map((v) => String(v || '').toLowerCase())
        .join(' ');

      return haystack.includes(q);
    });
  }, [query, friendIdSet, localSentIds]);

  const handleSendInvite = async (user) => {
    if (typeof onSendInvite === 'function') {
      const resp = await onSendInvite(user);
      setLocalSentIds((prev) => new Set([...Array.from(prev), String(user.id)]));
      return resp;
    }

    const resp = await mockSendFriendRequest(user);
    setLocalSentIds((prev) => new Set([...Array.from(prev), String(user.id)]));
    return resp;
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

      {query.trim() !== '' && visibleUsers.length === 0 && (
        <div
          className="friends-search-no-results"
          style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '8px' }}
        >
          nenhum usuário encontrado
        </div>
      )}

      <div className="friends-search-scroll-area">
        <div className="friends-section">
          <div className="friends-suggestions-title">
            {query.trim() === '' ? 'Pessoas que você pode adicionar' : 'Resultados da pesquisa'}
          </div>
          <div className="friends-search-results">
            {visibleUsers.map((user) => {
              const userIdStr = String(user.id);
              const alreadySent = localSentIds.has(userIdStr);

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
        </div>
      </div>
    </>
  );
}

export default FriendsSearch;

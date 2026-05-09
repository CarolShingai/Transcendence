import React, { useEffect, useMemo, useState } from 'react';

function FriendsSearch({
  people = [],
  onSendInvite,
  onOpenProfile,
  sentInviteIds = [],
  friendIds = [],
  inviteIds = [],
  currentUserId = null,
  minLength = 1,
  debounceMs = 1000,
  onRemoteSearch = null,
}) {
  const [query, setQuery] = useState('');
  const [localSentIds, setLocalSentIds] = useState(() => new Set((sentInviteIds || []).map((id) => String(id))));

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

    const response = await onSendInvite(user);
    setLocalSentIds((previous) => new Set([...Array.from(previous), String(user.id)]));
    return response;
  };

  const handleOpenProfile = (user) => {
    if (typeof onOpenProfile === 'function') {
      onOpenProfile(user);
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

      <div className="friends-search-scroll-area">
        <div className="friends-section">
          <div className="friends-search-results">
            {visiblePeople.map((person) => {
              const personIdStr = String(person.id);
              const alreadySent = localSentIds.has(personIdStr);

              return (
                <article
                  key={person.id}
                  className="friend-item friend-search-item"
                  role={onOpenProfile ? 'button' : undefined}
                  tabIndex={onOpenProfile ? 0 : undefined}
                  onClick={() => handleOpenProfile(person)}
                  onKeyDown={(event) => {
                    if (!onOpenProfile) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenProfile(person);
                    }
                  }}
                >
                  <div className="friend-avatar" aria-hidden="true">
                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt={person.name || person.nickname || 'Avatar'}
                        className="friend-avatar-image"
                      />
                    ) : (
                      (person.name || '')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((token) => token[0]?.toUpperCase())
                        .join('')
                    )}
                  </div>
                  <div className="friend-info">
                    <div className="friend-name">{person.name}</div>
                    <div className="friend-nickname">@{person.nickname || person.email}</div>
                  </div>
                  <button
                    type="button"
                    className="friend-action-button friend-send-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleSendInvite(person);
                    }}
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

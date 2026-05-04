import React, { useMemo, useState } from 'react';
import amigosTrans from '../../assets/logo/trans_amigos1.png';

const FRIENDS_TABS = [
  { id: 'friends', label: 'Amigos' },
  { id: 'invites', label: 'Convites' },
  { id: 'search', label: 'Pesquisar amigos' },
];

const MOCK_FRIENDS = [
  { id: 1, name: 'Thiago Santos', nickname: 't_santos', status: 'Online' },
  { id: 2, name: 'Ana Clara', nickname: 'anac', status: 'Offline' },
  { id: 3, name: 'Bruno Lima', nickname: 'brlima', status: 'Online' },
  { id: 4, name: 'Marina Costa', nickname: 'maric', status: 'Offline' },
];

const MOCK_INVITES = [
  { id: 101, name: 'João Pedro', nickname: 'jpedro' },
  { id: 102, name: 'Lívia Rocha', nickname: 'livrocha' },
];

const MOCK_DISCOVER_USERS = [
  { id: 201, name: 'Carlos Eduardo', nickname: 'c_eduardo' },
  { id: 202, name: 'Paula Mendes', nickname: 'paulam' },
  { id: 203, name: 'Rafael Souza', nickname: 'rafaels' },
  { id: 204, name: 'Camila Nunes', nickname: 'camilan' },
];

function HomeFriendsCard({ friends = [], invites = [] }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState(friends.length > 0 ? friends : MOCK_FRIENDS);
  const [inviteList, setInviteList] = useState(invites.length > 0 ? invites : MOCK_INVITES);
  const [discoverUsers, setDiscoverUsers] = useState(MOCK_DISCOVER_USERS);
  const [sentInviteIds, setSentInviteIds] = useState([]);

  const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0].toUpperCase())
    .join('');

  const renderFriendItem = (friend) => {
    const friendStatus = (friend.status || 'offline').toLowerCase();

    return (
      <article key={friend.id} className="friend-item">
        <div className="friend-avatar" aria-hidden="true">{getInitials(friend.name)}</div>
        <div className="friend-info">
          <div className="friend-name">{friend.name}</div>
          <div className="friend-nickname">@{friend.nickname}</div>
        </div>
        <div className={`friend-status friend-status-${friendStatus}`}>
          {friend.status || 'Offline'}
        </div>
      </article>
    );
  };

  const filteredFriends = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return friendsList;
    }

    return friendsList.filter((friend) => [friend.name, friend.nickname]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [friendsList, searchQuery]);

  const filteredDiscoverUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return discoverUsers;
    }

    return discoverUsers.filter((user) => [user.name, user.nickname]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [discoverUsers, searchQuery]);

  const handleAcceptInvite = (invite) => {
    setInviteList((previous) => previous.filter((item) => item.id !== invite.id));
    setFriendsList((previous) => ([
      ...previous,
      {
        id: invite.id,
        name: invite.name,
        nickname: invite.nickname,
        status: 'Online',
      },
    ]));
  };

  const handleSendInvite = (user) => {
    setSentInviteIds((previous) => [...previous, user.id]);
    setDiscoverUsers((previous) => previous.filter((item) => item.id !== user.id));
  };

  const renderPanel = () => {
    if (activeTab === 'invites') {
      return inviteList.length === 0 ? (
        <div className="friends-empty-state">
          <p>Nenhum convite pendente!</p>
        </div>
      ) : (
        <div className="friends-invites-list">
          {inviteList.map((invite) => (
            <article key={invite.id} className="friend-item friend-invite-item">
              <div className="friend-avatar" aria-hidden="true">{getInitials(invite.name)}</div>
              <div className="friend-info">
                <div className="friend-name">{invite.name}</div>
                <div className="friend-nickname">@{invite.nickname}</div>
              </div>
              <button
                type="button"
                className="friend-action-button friend-accept-button"
                onClick={() => handleAcceptInvite(invite)}
              >
                Aceitar
              </button>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === 'search') {
      return (
        <>
          <input
            type="search"
            className="friends-search-input"
            placeholder="Pesquisar por nome ou nickname"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Pesquisar amigos"
          />

          <div className="friends-search-results">
            {filteredDiscoverUsers.length === 0 ? (
              <div className="friends-empty-state">
                <p>Nenhum usuário encontrado!</p>
              </div>
            ) : (
              filteredDiscoverUsers.map((user) => {
                const alreadySent = sentInviteIds.includes(user.id);

                return (
                  <article key={user.id} className="friend-item friend-search-item">
                    <div className="friend-avatar" aria-hidden="true">{getInitials(user.name)}</div>
                    <div className="friend-info">
                      <div className="friend-name">{user.name}</div>
                      <div className="friend-nickname">@{user.nickname}</div>
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
              })
            )}
          </div>
        </>
      );
    }

    return filteredFriends.length === 0 ? (
      <div className="friends-empty-state">
        <p>Nenhum amigo registrado!</p>
      </div>
    ) : (
      <div className="friends-list">
        {filteredFriends.map(renderFriendItem)}
      </div>
    );
  };

  return (
    <div className="card home-carousel-item-card has-footer-layout home-carousel-item-card-folder" aria-hidden="true">
      <header className="home-card-header" aria-hidden="true">
        <img
          src={amigosTrans}
          alt="Amigos"
          className="home-card-header-img home-card-header-img-center"
        />
      </header>

      <div className="home-card-body home-card-body-friends home-card-body-folder">
        <div className="friends-folder-tabs friends-folder-tabs-body" role="tablist" aria-label="Seções de amigos">
          {FRIENDS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`friends-folder-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="friends-panel friends-panel-folder" aria-label="Gerenciamento de amigos">
          {renderPanel()}
        </div>
      </div>

      <footer className="home-card-footer" aria-hidden="true">
        <div className="home-card-footer-note">
          {activeTab === 'friends' && `${friendsList.length} amigo(s)`}
          {activeTab === 'invites' && `${inviteList.length} convite(s) pendente(s)`}
          {activeTab === 'search' && 'Digite um nome ou nickname para encontrar alguém'}
        </div>
      </footer>
    </div>
  );
}

export default HomeFriendsCard;
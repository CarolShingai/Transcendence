import React, { useState } from 'react';
import amigosTrans from '../../assets/logo/trans_amigos1.png';
import FriendsSearch from '../elements/FriendsSearch';

const FRIENDS_TABS = [
  { id: 'friends', label: 'Amigos' },
  { id: 'invites', label: 'Convites' },
  { id: 'search', label: 'Pesquisar amigos' },
];

function HomeFriendsCard({
  friends = [],
  invites = [],
  onOpenProfile,
  onSendInvite,
  onAcceptInvite,
  onRejectInvite,
  onSearchUsers,
}) {
  const [activeTab, setActiveTab] = useState('friends');
  const [sentInviteIds, setSentInviteIds] = useState([]);
  const [processingInviteIds, setProcessingInviteIds] = useState([]);


  const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0].toUpperCase())
    .join('');

  const renderFriendItem = (friend) => {
    const friendStatus = (friend.status || 'offline').toLowerCase();

    const handleKeyDown = (e) => {
      if (!onOpenProfile) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenProfile(friend);
      }
    };

    return (
      <article
        key={friend.id}
        className="friend-item"
        role={onOpenProfile ? 'button' : undefined}
        tabIndex={onOpenProfile ? 0 : undefined}
        onClick={() => onOpenProfile && onOpenProfile(friend)}
        onKeyDown={handleKeyDown}
      >
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

  const handleSendInvite = async (user) => {
    if (typeof onSendInvite !== 'function') {
      return null;
    }

    const response = await onSendInvite(user);
    setSentInviteIds((previous) => (previous.includes(user.id) ? previous : [...previous, user.id]));
    return response;
  };

  const handleInviteAction = async (invite, action) => {
    const requestId = invite.requestId || invite.id;
    if (!requestId || typeof action !== 'function') {
      return null;
    }

    setProcessingInviteIds((previous) => [...previous, requestId]);

    try {
      return await action(requestId);
    } finally {
      setProcessingInviteIds((previous) => previous.filter((item) => item !== requestId));
    }
  };

  const isInviteProcessing = (invite) => processingInviteIds.includes(invite.requestId || invite.id);

  const renderPanel = () => {
    if (activeTab === 'invites') {
      return invites.length === 0 ? (
        <div className="friends-empty-state">
          <p>Nenhum convite pendente!</p>
        </div>
      ) : (
        <div className="friends-invites-list">
           {invites.map((invite) => (
              <article
                key={invite.requestId || invite.id}
                className="friend-item friend-invite-item"
                role={onOpenProfile ? 'button' : undefined}
                tabIndex={onOpenProfile ? 0 : undefined}
                onClick={() => onOpenProfile && onOpenProfile(invite)}
                onKeyDown={(e) => {
                  if (!onOpenProfile) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenProfile(invite);
                  }
                }}
              >
                <div className="friend-avatar" aria-hidden="true">{getInitials(invite.name || invite.requesterName)}</div>
              <div className="friend-info">
                <div className="friend-name">{invite.name || invite.requesterName || 'Convite pendente'}</div>
                <div className="friend-nickname">{invite.nickname ? `@${invite.nickname}` : 'Solicitação pendente'}</div>
              </div>
              <div className="friend-action-group">
                <button
                  type="button"
                  className="friend-action-button friend-accept-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInviteAction(invite, onAcceptInvite);
                  }}
                  disabled={isInviteProcessing(invite)}
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  className="friend-action-button friend-reject-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInviteAction(invite, onRejectInvite);
                  }}
                  disabled={isInviteProcessing(invite)}
                >
                  Recusar
                </button>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === 'search') {
      return (
        <FriendsSearch
          onSendInvite={handleSendInvite}
          sentInviteIds={sentInviteIds}
          onSearchUsers={onSearchUsers}
          friendIds={friends.map((f) => f.id)}
        />
      );
    }

    return friends.length === 0 ? (
      <div className="friends-empty-state">
        <p>Nenhum amigo registrado!</p>
      </div>
    ) : (
      <div className="friends-list">
        {friends.map(renderFriendItem)}
      </div>
    );
  };

  return (
    <div className="card home-carousel-item-card has-footer-layout home-carousel-item-card-folder">
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
          {activeTab === 'friends' && `${friends.length} amigo(s)`}
          {activeTab === 'invites' && `${invites.length} convite(s) pendente(s)`}
          {activeTab === 'search' && 'Digite um nome ou nickname para encontrar alguém'}
        </div>
      </footer>
    </div>
  );
}

export default HomeFriendsCard;

import React, { useEffect, useMemo, useState } from 'react';
import amigosTrans from '../../assets/logo/trans_amigos1.png';
import FriendsSearch from '../elements/FriendsSearch';
import {
  acceptFriendRequest as mockAcceptFriendRequest,
  rejectFriendRequest as mockRejectFriendRequest,
  searchUsers as mockSearchUsers,
  sendFriendRequest as mockSendFriendRequest
} from '../../services/friendsService';
import { MOCK_FRIENDS, MOCK_PENDING_INVITES } from '../../services/friendsMockData';

const FRIENDS_TABS = [
  { id: 'friends', label: 'Amigos' },
  { id: 'invites', label: 'Convites' },
  { id: 'search', label: 'Pesquisar amigos' },
];

function HomeFriendsCard({
  friends,
  invites,
  onOpenProfile,
  onSendInvite,
  onAcceptInvite,
  onRejectInvite,
  onSearchUsers
}) {
  const [activeTab, setActiveTab] = useState('friends');
  const [friendsList, setFriendsList] = useState(() => (Array.isArray(friends) ? friends : MOCK_FRIENDS));
  const [inviteList, setInviteList] = useState(() => (Array.isArray(invites) ? invites : MOCK_PENDING_INVITES));
  const [sentInviteIds, setSentInviteIds] = useState(() => (
    Array.isArray(invites)
      ? invites.map((invite) => invite.receiverId ?? invite.id)
      : MOCK_PENDING_INVITES.map((invite) => invite.receiverId ?? invite.id)
  ));

  useEffect(() => {
    if (Array.isArray(friends)) {
      setFriendsList(friends);
    }
  }, [friends]);

  useEffect(() => {
    if (Array.isArray(invites)) {
      setInviteList(invites);
      setSentInviteIds(invites.map((invite) => invite.receiverId ?? invite.id));
    }
  }, [invites]);


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

  const filteredFriends = useMemo(() => {
    return friendsList;
  }, [friendsList]);

  const removeSentInvite = (invite) => {
    const pendingId = invite.receiverId ?? invite.id;
    setSentInviteIds((previous) => previous.filter((item) => item !== pendingId && String(item) !== String(pendingId)));
  };

  const handleAcceptInvite = async (invite) => {
    if (typeof onAcceptInvite === 'function') {
      return onAcceptInvite(invite.requestId ?? invite.id);
    }

    const requestId = invite.requestId ?? invite.id;
    const acceptedFriend = await mockAcceptFriendRequest(requestId);

    setInviteList((previous) => previous.filter((item) => (item.requestId ?? item.id) !== requestId));
    removeSentInvite(invite);
    setFriendsList((previous) => ([
      ...previous,
      acceptedFriend,
    ]));

    return acceptedFriend;
  };

  const handleRejectInvite = async (invite) => {
    if (typeof onRejectInvite === 'function') {
      return onRejectInvite(invite.requestId ?? invite.id);
    }

    const requestId = invite.requestId ?? invite.id;
    const rejectedInvite = await mockRejectFriendRequest(requestId);

    setInviteList((previous) => previous.filter((item) => (item.requestId ?? item.id) !== requestId));
    removeSentInvite(rejectedInvite);
    return rejectedInvite;
  };

  const handleSendInvite = async (user) => {
    if (typeof onSendInvite === 'function') {
      return onSendInvite(user);
    }

    const pendingInvite = await mockSendFriendRequest(user);

    setSentInviteIds((previous) => (previous.includes(user.id) ? previous : [...previous, user.id]));
    setInviteList((previous) => {
      const requestId = pendingInvite?.requestId ?? Date.now();
      const normalizedInvite = {
        id: requestId,
        requestId,
        receiverId: Number(user.id),
        name: user.name,
        nickname: user.nickname || user.email,
        status: 'Pendente'
      };

      return previous.some((item) => (item.requestId ?? item.id) === requestId)
        ? previous
        : [...previous, normalizedInvite];
    });

    return pendingInvite;
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
            <article
              key={invite.requestId ?? invite.id}
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
              <div className="friend-avatar" aria-hidden="true">{getInitials(invite.name)}</div>
              <div className="friend-info">
                <div className="friend-name">{invite.name}</div>
                <div className="friend-nickname">@{invite.nickname}</div>
              </div>
              <div className="friend-invite-actions" aria-hidden="false">
                <button
                  type="button"
                  className="friend-action-circle friend-accept-circle"
                  onClick={(e) => { e.stopPropagation(); handleAcceptInvite(invite); }}
                  aria-label={`Aceitar convite de ${invite.name}`}
                  title="Aceitar"
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="friend-action-circle friend-reject-circle"
                  onClick={(e) => { e.stopPropagation(); handleRejectInvite(invite); }}
                  aria-label={`Rejeitar convite de ${invite.name}`}
                  title="Rejeitar"
                >
                  ✕
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
          friendIds={friendsList.map((friend) => friend.id)}
          onSearchUsers={typeof onSearchUsers === 'function' ? onSearchUsers : mockSearchUsers}
        />
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
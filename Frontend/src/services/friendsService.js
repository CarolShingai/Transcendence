import { cloneFriendshipData, MOCK_FRIENDS, MOCK_PENDING_INVITES, MOCK_SEARCH_USERS } from './friendsMockData';

const DEFAULT_DELAY_MS = 250;

let mockState = {
  friends: cloneFriendshipData(MOCK_FRIENDS),
  pendingInvites: cloneFriendshipData(MOCK_PENDING_INVITES)
};

let nextRequestId = 9002;

const delay = (ms = DEFAULT_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const clone = (value) => cloneFriendshipData(value);

const getFriendIds = () => new Set(mockState.friends.map((friend) => String(friend.id)));
const getPendingReceiverIds = () => new Set(mockState.pendingInvites.map((invite) => String(invite.receiverId)));

export function resetMockFriendshipState() {
  mockState = {
    friends: clone(MOCK_FRIENDS),
    pendingInvites: clone(MOCK_PENDING_INVITES)
  };
  nextRequestId = 9002;
}

export function getMockFriendshipSnapshot() {
  return clone(mockState);
}

export async function listFriends() {
  await delay();
  return clone(mockState.friends);
}

export async function listPendingRequests() {
  await delay();
  return clone(mockState.pendingInvites);
}

export async function searchUsers(query) {
  await delay();

  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length === 0) {
    return [];
  }

  const friendIds = getFriendIds();
  const pendingIds = getPendingReceiverIds();

  return MOCK_SEARCH_USERS.filter((user) => {
    const userId = String(user.id);
    if (friendIds.has(userId) || pendingIds.has(userId)) {
      return false;
    }

    const haystack = [user.name, user.nickname, user.email]
      .map(normalizeText)
      .join(' ');

    return haystack.includes(normalizedQuery);
  }).map((user) => clone(user));
}

export async function sendFriendRequest(user) {
  await delay();

  const receiverId = Number(user?.id);
  if (!Number.isFinite(receiverId)) {
    throw new Error('Invalid user selected');
  }

  const existingFriend = mockState.friends.find((friend) => friend.id === receiverId);
  if (existingFriend) {
    return clone(existingFriend);
  }

  const existingInvite = mockState.pendingInvites.find((invite) => invite.receiverId === receiverId);
  if (existingInvite) {
    return clone(existingInvite);
  }

  const pendingInvite = {
    requestId: nextRequestId++,
    receiverId,
    name: user?.name || 'Usuário sem nome',
    nickname: user?.nickname || user?.email || '',
    status: 'Pendente'
  };

  mockState.pendingInvites = [...mockState.pendingInvites, pendingInvite];
  return clone(pendingInvite);
}

export async function acceptFriendRequest(requestId) {
  await delay();

  const normalizedRequestId = Number(requestId);
  const inviteIndex = mockState.pendingInvites.findIndex((invite) => invite.requestId === normalizedRequestId);

  if (inviteIndex === -1) {
    throw new Error('Friend request not found');
  }

  const [invite] = mockState.pendingInvites.splice(inviteIndex, 1);
  const newFriend = {
    id: invite.receiverId,
    name: invite.name,
    nickname: invite.nickname,
    status: 'Online'
  };

  mockState.friends = [...mockState.friends, newFriend];
  return clone(newFriend);
}

export async function rejectFriendRequest(requestId) {
  await delay();

  const normalizedRequestId = Number(requestId);
  const inviteIndex = mockState.pendingInvites.findIndex((invite) => invite.requestId === normalizedRequestId);

  if (inviteIndex === -1) {
    throw new Error('Friend request not found');
  }

  const [removed] = mockState.pendingInvites.splice(inviteIndex, 1);
  return clone(removed);
}

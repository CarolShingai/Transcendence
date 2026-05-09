export const MOCK_FRIENDS = [
  {
    id: 101,
    name: 'Ana Costa',
    nickname: 'anacosta',
    status: 'Online'
  },
  {
    id: 102,
    name: 'Bruno Lima',
    nickname: 'brunolima',
    status: 'Jogando'
  },
  {
    id: 103,
    name: 'Carla Souza',
    nickname: 'carlas',
    status: 'Offline'
  }
];

export const MOCK_PENDING_INVITES = [
  {
    requestId: 9001,
    receiverId: 201,
    name: 'Diego Martins',
    nickname: 'diegom',
    status: 'Pendente'
  }
];

export const MOCK_SEARCH_USERS = [
  {
    id: 201,
    name: 'Diego Martins',
    nickname: 'diegom',
    email: 'diego.martins@example.com'
  },
  {
    id: 202,
    name: 'Elisa Pereira',
    nickname: 'elip',
    email: 'elisa.pereira@example.com'
  },
  {
    id: 203,
    name: 'Felipe Rocha',
    nickname: 'feliperocha',
    email: 'felipe.rocha@example.com'
  },
  {
    id: 204,
    name: 'Gabriela Nunes',
    nickname: 'gabin',
    email: 'gabriela.nunes@example.com'
  },
  {
    id: 205,
    name: 'Hugo Almeida',
    nickname: 'hugoa',
    email: 'hugo.almeida@example.com'
  }
];

export function cloneFriendshipData(data) {
  return JSON.parse(JSON.stringify(data));
}

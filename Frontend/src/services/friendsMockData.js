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
    status: 'Online'
  },
  {
    id: 103,
    name: 'Carla Souza',
    nickname: 'carlas',
    status: 'Offline'
  },
  {
    id: 104,
    name: 'Daniel Alves',
    nickname: 'danialv',
    status: 'Online'
  },
  {
    id: 105,
    name: 'Eduarda Lima',
    nickname: 'eduardal',
    status: 'Offline'
  },
  {
    id: 106,
    name: 'Fabio Gomes',
    nickname: 'fabg',
    status: 'Online'
  },
  {
    id: 107,
    name: 'Gabriel Santos',
    nickname: 'gabs',
    status: 'Online'
  },
  {
    id: 108,
    name: 'Helena Rocha',
    nickname: 'helenar',
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
  },
  {
    requestId: 9002,
    receiverId: 202,
    name: 'Elisa Pereira',
    nickname: 'elip',
    status: 'Pendente'
  },
  {
    requestId: 9003,
    receiverId: 203,
    name: 'Felipe Rocha',
    nickname: 'feliperocha',
    status: 'Pendente'
  },
  {
    requestId: 9004,
    receiverId: 204,
    name: 'Gabriela Nunes',
    nickname: 'gabin',
    status: 'Pendente'
  },
  {
    requestId: 9005,
    receiverId: 205,
    name: 'Hugo Almeida',
    nickname: 'hugoa',
    status: 'Pendente'
  },
  {
    requestId: 9006,
    receiverId: 206,
    name: 'Isabela Cruz',
    nickname: 'isac',
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
  },
  {
    id: 207,
    name: 'Joana Fernandes',
    nickname: 'joanaf',
    email: 'joana.fernandes@example.com'
  },
  {
    id: 208,
    name: 'Kaique Oliveira',
    nickname: 'kaiqueo',
    email: 'kaique.oliveira@example.com'
  },
  {
    id: 209,
    name: 'Larissa Mendes',
    nickname: 'larim',
    email: 'larissa.mendes@example.com'
  },
  {
    id: 210,
    name: 'Mateus Ribeiro',
    nickname: 'mateusr',
    email: 'mateus.ribeiro@example.com'
  },
  {
    id: 211,
    name: 'Nina Carvalho',
    nickname: 'ninac',
    email: 'nina.carvalho@example.com'
  },
  {
    id: 212,
    name: 'Otavio Souza',
    nickname: 'otavios',
    email: 'otavio.souza@example.com'
  }
];

export function cloneFriendshipData(data) {
  return JSON.parse(JSON.stringify(data));
}

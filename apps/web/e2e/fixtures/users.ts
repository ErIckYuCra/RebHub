export const TEST_USERS = {
  writer: {
    email: 'writer1@readhub.com',
    password: 'Test1234!',
    username: 'writer1',
  },
  admin: {
    email: 'admin@readhub.com',
    password: 'Test1234!',
    username: 'admin',
  },
} as const

export type TestUser = (typeof TEST_USERS)[keyof typeof TEST_USERS]

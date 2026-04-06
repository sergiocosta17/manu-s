const { getUser } = require('../../src/utils/auth');
const jwt = require('jsonwebtoken');
const config = require('../../src/config/env');

describe('Auth Utils', () => {
  it('should return user object for valid token', () => {
    const token = jwt.sign({ id: '123', email: 'test@test.com' }, config.jwtSecret);
    const user = getUser(`Bearer ${token}`);
    expect(user.id).toBe('123');
    expect(user.email).toBe('test@test.com');
  });

  it('should return null for invalid token', () => {
    const user = getUser('Bearer invalidtoken');
    expect(user).toBeNull();
  });

  it('should return null for missing token', () => {
    const user = getUser(null);
    expect(user).toBeNull();
  });
});
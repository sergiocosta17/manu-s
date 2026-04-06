const AuthService = require('../../src/services/AuthService');
const User = require('../../src/models/User');
const { connectDB, disconnectDB, clearDB } = require('../setup/db');
const bcrypt = require('bcryptjs');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe('AuthService', () => {
  describe('signup', () => {
    it('should create a new user and return token', async () => {
      const { token, user } = await AuthService.signup('Manu', 'manu@test.com', '123456');
      expect(token).toBeDefined();
      expect(user.name).toBe('Manu');
      expect(user.email).toBe('manu@test.com');
      
      const savedUser = await User.findOne({ email: 'manu@test.com' });
      expect(savedUser).not.toBeNull();
      const isMatch = await bcrypt.compare('123456', savedUser.password);
      expect(isMatch).toBe(true);
    });

    it('should throw error if email exists', async () => {
      await AuthService.signup('Manu', 'manu@test.com', '123456');
      await expect(AuthService.signup('Manu 2', 'manu@test.com', '654321'))
        .rejects.toThrow('Usuário já existe');
    });
  });

  describe('login', () => {
    it('should login and return token for valid credentials', async () => {
      await AuthService.signup('Manu', 'manu@test.com', '123456');
      const { token, user } = await AuthService.login('manu@test.com', '123456');
      expect(token).toBeDefined();
      expect(user.email).toBe('manu@test.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(AuthService.login('wrong@test.com', '123456'))
        .rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error for invalid password', async () => {
      await AuthService.signup('Manu', 'manu@test.com', '123456');
      await expect(AuthService.login('manu@test.com', 'wrongpass'))
        .rejects.toThrow('Credenciais inválidas');
    });
  });
});
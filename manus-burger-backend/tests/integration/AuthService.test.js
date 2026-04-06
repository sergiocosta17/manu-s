const AuthService = require('../../src/services/AuthService');
const User = require('../../src/models/User');
const { connectDB, disconnectDB, clearDB } = require('../setup/db');
const bcrypt = require('bcryptjs');
const config = require('../../src/config/env');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe('AuthService', () => {
  describe('signup e RBAC (Controlo de Acessos)', () => {
    it('deve criar um USER comum por padrão', async () => {
      const { user } = await AuthService.signup('Cliente', 'cliente@test.com', '123456');
      expect(user.role).toBe('USER');
    });

    it('deve criar um ADMIN se a chave correta for fornecida', async () => {
      const { user } = await AuthService.signup('Admin', 'admin@test.com', '123456', 'ADMIN', config.adminAccessKey);
      expect(user.role).toBe('ADMIN');
    });

    it('deve lançar erro se tentar criar ADMIN com chave incorreta', async () => {
      await expect(AuthService.signup('Admin Falso', 'admin2@test.com', '123456', 'ADMIN', 'chave_errada'))
        .rejects.toThrow('Chave de acesso de administrador inválida');
    });

    it('deve lançar erro se o e-mail já existir', async () => {
      await AuthService.signup('Manu', 'manu@test.com', '123456');
      await expect(AuthService.signup('Manu 2', 'manu@test.com', '654321'))
        .rejects.toThrow('Usuário já existe');
    });
  });

  describe('login', () => {
    it('deve fazer login e retornar token para credenciais válidas', async () => {
      await AuthService.signup('Manu', 'manu@test.com', '123456');
      const { token, user } = await AuthService.login('manu@test.com', '123456');
      expect(token).toBeDefined();
      expect(user.email).toBe('manu@test.com');
    });

    it('deve lançar erro para e-mail inválido', async () => {
      await expect(AuthService.login('wrong@test.com', '123456'))
        .rejects.toThrow('Credenciais inválidas');
    });
  });
});
const { validateEmail, validatePassword, validateProductInput } = require('../../src/utils/validators');

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should not throw on valid email', () => {
      expect(() => validateEmail('teste@email.com')).not.toThrow();
    });
    it('should throw on invalid email without @', () => {
      expect(() => validateEmail('testeemail.com')).toThrow('Formato de e-mail inválido');
    });
    it('should throw on invalid email without domain', () => {
      expect(() => validateEmail('teste@.com')).toThrow('Formato de e-mail inválido');
    });
  });

  describe('validatePassword', () => {
    it('should not throw on valid password', () => {
      expect(() => validatePassword('123456')).not.toThrow();
    });
    it('should throw on short password', () => {
      expect(() => validatePassword('12345')).toThrow('A senha deve ter pelo menos 6 caracteres');
    });
    it('should throw on empty password', () => {
      expect(() => validatePassword('')).toThrow('A senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('validateProductInput', () => {
    it('should not throw on valid product', () => {
      expect(() => validateProductInput({ name: 'Smash', price: 25.5 })).not.toThrow();
    });
    it('should throw on missing name', () => {
      expect(() => validateProductInput({ name: '   ', price: 25.5 })).toThrow('O nome do produto é obrigatório');
    });
    it('should throw on negative price', () => {
      expect(() => validateProductInput({ name: 'Smash', price: -5 })).toThrow('O preço do produto deve ser válido e positivo');
    });
  });
});
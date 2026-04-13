// Importação de dependências
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { validateEmail, validatePassword } = require('../utils/validators');

// Serviço responsável pela lógica de autenticação
class AuthService {
  // Registra um novo usuário
  async signup(name, email, password, role = 'USER', adminKey = null) {
    // Validações de formato
    validateEmail(email);
    validatePassword(password);

    if (!name || name.trim() === '') {
      throw new Error('O nome é obrigatório');
    }

    // Se role for ADMIN, exige a chave de acesso correta
    if (role === 'ADMIN') {
      if (adminKey !== config.adminAccessKey) {
        throw new Error('Chave de acesso de administrador inválida');
      }
    } else {
      role = 'USER'; // Garante que role seja USER para clientes comuns
    }

    // Verifica se o e-mail já está cadastrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    // Hash da senha com bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Cria e salva o novo usuário
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    await user.save();

    // Gera token JWT com validade de 7 dias
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      config.jwtSecret, 
      { expiresIn: '7d' }
    );

    return { token, user };
  }

  // Autentica um usuário existente
  async login(email, password) {
    validateEmail(email);

    // Busca usuário pelo e-mail
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verifica se a senha confere
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gera token JWT com validade de 7 dias
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      config.jwtSecret, 
      { expiresIn: '7d' }
    );

    return { token, user };
  }
}

// Exporta uma instância única do serviço
module.exports = new AuthService();
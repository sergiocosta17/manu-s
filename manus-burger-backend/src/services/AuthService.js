const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { validateEmail, validatePassword } = require('../utils/validators');

class AuthService {
  async signup(name, email, password) {
    validateEmail(email);
    validatePassword(password);

    if (!name || name.trim() === '') {
      throw new Error('O nome é obrigatório');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
      expiresIn: '7d'
    });

    return { token, user };
  }

  async login(email, password) {
    validateEmail(email);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
      expiresIn: '7d'
    });

    return { token, user };
  }
}

module.exports = new AuthService();
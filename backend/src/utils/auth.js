const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Função auxiliar para extrair e verificar o usuário a partir do token JWT
const getUser = (token) => {
  if (!token) return null; // Sem token, retorna null (usuário não autenticado)
  
  try {
    // Remove o prefixo "Bearer " do header Authorization
    const parsedToken = token.replace('Bearer ', '');
    // Verifica e decodifica o token usando a chave secreta
    return jwt.verify(parsedToken, config.jwtSecret);
  } catch (err) {
    // Token inválido ou expirado retorna null
    return null;
  }
};

module.exports = { getUser };
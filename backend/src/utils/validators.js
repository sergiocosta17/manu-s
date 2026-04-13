// Valida se o e-mail possui formato válido
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw new Error('Formato de e-mail inválido');
  }
};

// Valida se a senha possui pelo menos 6 caracteres
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres');
  }
};

// Valida os campos obrigatórios de um produto (nome e preço)
const validateProductInput = (input) => {
  if (!input.name || input.name.trim() === '') {
    throw new Error('O nome do produto é obrigatório');
  }
  if (input.price == null || input.price < 0) {
    throw new Error('O preço do produto deve ser válido e positivo');
  }
};

module.exports = { validateEmail, validatePassword, validateProductInput };
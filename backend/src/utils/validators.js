const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw new Error('Formato de e-mail inválido');
  }
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres');
  }
};

const validateProductInput = (input) => {
  if (!input.name || input.name.trim() === '') {
    throw new Error('O nome do produto é obrigatório');
  }
  if (input.price == null || input.price < 0) {
    throw new Error('O preço do produto deve ser válido e positivo');
  }
};

module.exports = { validateEmail, validatePassword, validateProductInput };
// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Objeto de configuração central da aplicação
const config = {
  port: process.env.PORT || 4000,                 
  mongoUri: process.env.MONGO_URI,    
  jwtSecret: process.env.JWT_SECRET || 'secret', 
  adminAccessKey: process.env.ADMIN_ACCESS_KEY || 'manus123' 
};

// Validação obrigatória: encerra a aplicação se MONGO_URI não estiver definida
if (!config.mongoUri) {
  process.exit(1);
}

// Exporta o objeto de configuração para uso em outros módulos
module.exports = config;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const config = require('./config/env');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUser } = require('./utils/auth');

// Função principal para inicializar o servidor
async function startServer() {
  const app = express();

  // Middleware para habilitar CORS (Apollo gerencia JSON automaticamente)
  app.use(cors());

  // Configuração do servidor Apollo GraphQL
  const server = new ApolloServer({
    typeDefs,      // Definições de tipos GraphQL
    resolvers,     // Resolvers para as operações
    context: ({ req }) => {
      // Extrai token do cabeçalho Authorization e obtém usuário autenticado
      const token = req.headers.authorization || '';
      const user = getUser(token);
      return { user };
    },
    formatError: (err) => {
      // Tratamento de erros específicos do MongoDB (ex: chave duplicada)
      if (err.message.includes('MongoError') || err.message.includes('E11000')) {
        return new Error('Erro interno do banco de dados');
      }
      return err;
    }
  });

  // Inicia o Apollo Server e aplica middleware no Express
  await server.start();
  server.applyMiddleware({ app });

  // Conexão com o MongoDB usando a URI definida nas variáveis de ambiente
  await mongoose.connect(config.mongoUri, {});

  // Inicia o servidor HTTP na porta configurada
  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}${server.graphqlPath}`);
  });
}

// Executa a função de inicialização
startServer();
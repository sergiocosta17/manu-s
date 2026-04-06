const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const config = require('./config/env');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUser } = require('./utils/auth');

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      const user = getUser(token);
      return { user };
    },
    formatError: (err) => {
      if (err.message.includes('MongoError') || err.message.includes('E11000')) {
        return new Error('Erro interno do banco de dados');
      }
      return err;
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}${server.graphqlPath}`);
  });
}

startServer();
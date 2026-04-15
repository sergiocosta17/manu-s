const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');

const config = require('./config/env');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUser } = require('./utils/auth');

async function startServer() {
  const app = express();

  app.use(cors());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      const user = getUser(token);
      return { user };
    },
    formatError: (err) => {
      console.error('GraphQL Error:', err);
      if (err.message.includes('MongoError') || err.message.includes('E11000')) {
        return new Error('Erro interno do banco de dados');
      }
      return err;
    }
  });

  await server.start();
  
  server.applyMiddleware({ 
    app,
    bodyParserConfig: false
  });

  await mongoose.connect(config.mongoUri, {});

  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}${server.graphqlPath}`);
  });
}

startServer();
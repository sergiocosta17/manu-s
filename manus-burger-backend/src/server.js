require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const authRoutes = require('./routes/authRoutes');

async function startServer() {
  const app = express();
  
  app.use(cors());

  await mongoose.connect(process.env.MONGO_URI);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    }
  });

  await server.start();

  server.applyMiddleware({ app });
  app.use('/api/auth', express.json(), authRoutes);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(` Servidor rodando!`);
    console.log(`REST API: http://localhost:${PORT}/api/auth`);
    console.log(`GraphQL: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
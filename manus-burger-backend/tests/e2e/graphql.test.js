const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const request = require('supertest');
const typeDefs = require('../../src/graphql/typeDefs');
const resolvers = require('../../src/graphql/resolvers');
const { getUser } = require('../../src/utils/auth');
const { connectDB, disconnectDB, clearDB } = require('../setup/db');

let app;
let server;

beforeAll(async () => {
  await connectDB();
  app = express();

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      const user = getUser(token);
      return { user };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
});

afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe('GraphQL E2E API', () => {
  it('should not allow fetching orders without auth', async () => {
    const query = `
      query {
        orders {
          id
        }
      }
    `;
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ query });
      
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('Não autorizado');
  });

  it('should register a user and fetch empty orders using token', async () => {
    const signupMutation = `
      mutation {
        signup(name: "Test E2E", email: "teste2e@test.com", password: "password123") {
          token
        }
      }
    `;
    const signupRes = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ query: signupMutation });

    expect(signupRes.body).not.toHaveProperty('errors');
    
    const token = signupRes.body.data.signup.token;

    const ordersQuery = `
      query {
        orders {
          id
        }
      }
    `;
    const ordersRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ query: ordersQuery });

    expect(ordersRes.body).not.toHaveProperty('errors');
    expect(ordersRes.body.data.orders).toEqual([]);
  });
});
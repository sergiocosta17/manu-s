const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const request = require('supertest');
const typeDefs = require('../../src/graphql/typeDefs');
const resolvers = require('../../src/graphql/resolvers');
const { getUser } = require('../../src/utils/auth');
const { connectDB, disconnectDB, clearDB } = require('../setup/db');
const config = require('../../src/config/env');

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

// Helper blindado: Se houver erro de GraphQL, ele trava e exibe o erro no terminal!
const execGraphQL = async (query, token = '') => {
  const res = await request(app)
    .post('/graphql')
    .set('Authorization', token ? `Bearer ${token}` : '')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ query });
    
  if (res.body && res.body.errors) {
      throw new Error("ERRO GRAPHQL: " + JSON.stringify(res.body.errors[0].message));
  }
  
  return res;
};

describe('GraphQL E2E API - Área Administrativa', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // 1. Usando a chave correta dinamicamente direto das configurações
    const adminRes = await execGraphQL(`
      mutation { signup(name: "Admin", email: "admin@msb.com", password: "password", role: ADMIN, adminKey: "${config.adminAccessKey}") { token } }
    `);
    adminToken = adminRes.body.data.signup.token;

    // 2. Criando o user comum
    const userRes = await execGraphQL(`
      mutation { signup(name: "Cliente", email: "cliente@msb.com", password: "password") { token } }
    `);
    userToken = userRes.body.data.signup.token;
  });

  it('deve permitir que o ADMIN crie um produto', async () => {
    const mutation = `
      mutation {
        createProduct(input: { name: "Super Smash", price: 29.99, description: "Delicioso" }) {
          id
          name
        }
      }
    `;
    const res = await execGraphQL(mutation, adminToken);
    expect(res.body.data.createProduct.name).toBe('Super Smash');
  });

  it('deve BLOQUEAR um USER comum de criar um produto', async () => {
    const mutation = `
      mutation {
        createProduct(input: { name: "Hack Burger", price: 1.00 }) { id }
      }
    `;
    
    // Como esperamos que falhe, interceptamos a requisição manualmente aqui
    const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query: mutation });

    expect(res.body.errors[0].message).toContain('Acesso negado');
  });

  it('deve BLOQUEAR um USER comum de ver o Dashboard', async () => {
    const query = `query { dashboardMetrics { totalOrders } }`;
    const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query });
        
    expect(res.body.errors[0].message).toContain('Acesso negado');
  });

  it('deve permitir que o ADMIN veja o Dashboard', async () => {
    const query = `query { dashboardMetrics { totalOrders pendingOrders totalRevenue } }`;
    const res = await execGraphQL(query, adminToken);
    expect(res.body.data.dashboardMetrics.totalOrders).toBe(0); 
  });
});
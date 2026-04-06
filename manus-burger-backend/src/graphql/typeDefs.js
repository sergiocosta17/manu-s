const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
  }

  type OrderItem {
    product: Product!
    quantity: Int!
  }

  type Order {
    id: ID!
    user: ID
    items: [OrderItem!]!
    total: Float!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input ProductInput {
    name: String!
    price: Float!
    description: String
  }

  input OrderItemInput {
    product: ID!
    quantity: Int!
  }

  input OrderInput {
    items: [OrderItemInput!]!
    total: Float!
  }

  type Query {
    products(limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product
    orders(limit: Int, offset: Int): [Order!]!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createProduct(input: ProductInput!): Product!
    createOrder(input: OrderInput!): Order!
  }
`;

module.exports = typeDefs;
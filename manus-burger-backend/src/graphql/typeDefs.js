const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  enum OrderStatus {
    PENDING
    PREPARING
    READY
    DELIVERED
    CANCELLED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
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
    user: User
    items: [OrderItem!]!
    total: Float!
    status: OrderStatus!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DashboardMetrics {
    totalOrders: Int!
    pendingOrders: Int!
    totalRevenue: Float!
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
    orders(limit: Int, offset: Int, status: OrderStatus): [Order!]!
    order(id: ID!): Order!
    dashboardMetrics: DashboardMetrics!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!, role: Role, adminKey: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`;

module.exports = typeDefs;
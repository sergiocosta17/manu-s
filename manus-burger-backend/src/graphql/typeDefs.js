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

  enum Category {
    BURGER
    CHICKEN
    COMBO
    SIDE
    DRINK
    DESSERT
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
    promotionalPrice: Float
    description: String
    category: Category!
    imageUrl: String
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

  input ProductInput {
    name: String!
    price: Float!
    promotionalPrice: Float
    description: String
    category: Category!
    imageUrl: String
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
    products(category: Category): [Product!]!
    orders: [Order!]!
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
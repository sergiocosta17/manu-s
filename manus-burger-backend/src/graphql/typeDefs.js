const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: String!
  }

  type OrderItem {
    product: Product
    quantity: Int
  }

  type Order {
    id: ID!
    client: ID!
    items: [OrderItem]
    totalPrice: Float!
    status: String!
    createdAt: String
  }

  input OrderItemInput {
    product: ID!
    quantity: Int!
  }

  type Query {
    getProducts: [Product]
    getProduct(id: ID!): Product
    getOrders: [Order]
    getMyOrders: [Order]
  }

  type Mutation {
    addProduct(name: String!, description: String, price: Float!, category: String!): Product
    updateProduct(id: ID!, name: String, price: Float): Product
    deleteProduct(id: ID!): String
    createOrder(items: [OrderItemInput]!, totalPrice: Float!): Order
    updateOrderStatus(id: ID!, status: String!): Order
  }
`;

module.exports = typeDefs;
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: String!
  }

  type Query {
    getProducts: [Product]
    getProduct(id: ID!): Product
  }

  type Mutation {
    addProduct(name: String!, description: String, price: Float!, category: String!): Product
    updateProduct(id: ID!, name: String, price: Float): Product
    deleteProduct(id: ID!): String
  }
`;

module.exports = typeDefs;
import { gql } from '@apollo/client';

// Mutação GraphQL para autenticação de usuário (login)
export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token        # Token JWT para autenticação nas próximas requisições
      user {
        id
        name
        role      # Papel do usuário (USER ou ADMIN)
      }
    }
  }
`;
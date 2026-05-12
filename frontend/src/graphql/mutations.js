import { gql } from '@apollo/client';

// mutação graphql para login de usuário
export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token        # token jwt para autenticação
      user {
        id
        name
        role      # papel do usuário (user ou admin)
      }
    }
  }
`;
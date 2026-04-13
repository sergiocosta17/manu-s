import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Página de registro/cadastro de novo usuário (cliente)
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Submete o formulário de cadastro via GraphQL
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Signup($name: String!, $email: String!, $password: String!) {
              signup(name: $name, email: $email, password: $password) {
                token
                user {
                  id
                  name
                  role
                }
              }
            }
          `,
          variables: { name, email, password }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const { token, user } = result.data.signup;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      
      navigate('/menu'); // Redireciona para o cardápio após cadastro bem-sucedido

    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-brand-yellow">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">
            🍔 Criar Conta
          </h1>
          <p className="text-gray-500 mt-2">Junte-se ao Manu's Smash</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-brand-red text-sm text-center font-semibold">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-dark hover:bg-gray-800 text-white font-bold text-lg py-3 rounded-lg transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta? <Link to="/" className="text-brand-red hover:underline font-semibold">Faça Login</Link>
        </div>

      </div>
    </div>
  );
}
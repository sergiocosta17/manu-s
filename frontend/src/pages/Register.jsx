import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import bgImage from '../assets/manus-chuva-de-hamburger.png';
import bgImage2 from '../assets/logo-manus-sem-personagem.png';

// Página de registro/cadastro de novo usuário
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
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
            mutation Signup($name: String!, $email: String!, $password: String!, $role: Role, $adminKey: String) {
              signup(name: $name, email: $email, password: $password, role: $role, adminKey: $adminKey) {
                token
                user {
                  id
                  name
                  role
                }
              }
            }
          `,
          variables: { 
            name, 
            email, 
            password,
            role: isAdmin ? 'ADMIN' : 'USER',
            adminKey: isAdmin ? adminKey : null
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const { token, user } = result.data.signup;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      
      navigate('/menu');

    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex selection:bg-white selection:text-[#1e3a5f] overflow-hidden">
      
      {/* Lado esquerdo - imagem */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="w-full lg:w-1/2 relative flex flex-col overflow-hidden">
        
        {/* Imagem de fundo para o lado direito*/}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage2})` }}
        />
        
        <div className="absolute inset-0 bg-[#1e3a5f]/85 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          
          {/* Header com botão voltar*/}
          <div className="flex-shrink-0 flex items-center justify-between p-6 lg:p-8">
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              <span className="text-sm font-medium">Voltar</span>
            </button>

            <div className="w-20"></div>
          </div>

          <div className="flex-grow overflow-y-auto px-6 lg:px-16 xl:px-24 pb-8">
            <div className="w-full max-w-md mx-auto">
              
              {/* Título */}
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Crie sua conta na Manu´s
                </h2>
                <p className="text-white/50">
                  Junte-se à família Manu's
                </p>
              </div>

              <div className="flex gap-1 p-1 bg-white/10 rounded-xl mb-8">
                <Link
                  to="/login"
                  className="flex-1 py-3 text-sm font-medium rounded-lg transition-all text-white/50 hover:text-white/70 text-center"
                >
                  Entrar
                </Link>
                <button
                  type="button"
                  className="flex-1 py-3 text-sm font-medium rounded-lg transition-all bg-white text-[#1e3a5f] shadow-sm"
                >
                  Cadastrar
                </button>
              </div>

              {/* Formulário */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nome e Sobrenome
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:bg-white/15 outline-none transition-all text-white placeholder-white/40"
                    placeholder="Como devemos te chamar?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    E-mail
                  </label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:bg-white/15 outline-none transition-all text-white placeholder-white/40"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/10 border border-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:bg-white/15 outline-none transition-all text-white placeholder-white/40"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group py-2">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-white/30 peer-checked:border-white peer-checked:bg-white transition-all flex items-center justify-center">
                      {isAdmin && (
                        <svg className="w-3 h-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                    Sou gestor da loja
                  </span>
                </label>

                {isAdmin && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      Chave de segurança
                    </label>
                    <input 
                      type="password" 
                      required={isAdmin}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/30 focus:border-white/60 focus:ring-2 focus:ring-white/20 outline-none transition-all text-white placeholder-white/40 font-mono tracking-wider"
                      placeholder="Digite o código"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white hover:bg-white/90 text-[#1e3a5f] font-semibold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar conta</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Termos */}
              <p className="text-center text-white/30 text-xs mt-6 pb-4">
                Ao continuar, você concorda com nossos{' '}
                <span className="text-white/50 hover:text-white cursor-pointer underline underline-offset-2">
                  Termos de Uso
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

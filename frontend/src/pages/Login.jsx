import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Página de login e cadastro de usuários
export default function Login() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); 
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Define o modo (login ou cadastro) baseado no parâmetro da URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  // Submete o formulário para autenticação ou criação de conta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Seleciona a mutation GraphQL apropriada
    const query = isLogin ? `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user { id name role }
        }
      }
    ` : `
      mutation Signup($name: String!, $email: String!, $password: String!, $role: Role, $adminKey: String) {
        signup(name: $name, email: $email, password: $password, role: $role, adminKey: $adminKey) {
          token
          user { id name role }
        }
      }
    `;

    const variables = isLogin ? { email, password } : {
      name,
      email,
      password,
      role: isAdmin ? 'ADMIN' : 'USER',
      adminKey: isAdmin ? adminKey : null
    };

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });

      const result = await response.json();

      if (result.errors) throw new Error(result.errors[0].message);

      const data = isLogin ? result.data.login : result.data.signup;
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      
      // Limpa produto pendente no sessionStorage (caso exista)
      const pendingProduct = sessionStorage.getItem('pendingProduct');
      if (pendingProduct) {
        sessionStorage.removeItem('pendingProduct');
      }
      
      navigate('/menu');
    } catch (err) {
      setError(err.message || 'Erro ao processar a requisição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-4 md:p-8 selection:bg-[#1e3a5f] selection:text-white overflow-hidden relative">
      
      {/* Padrão de fundo decorativo sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a5f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Linhas decorativas nas bordas */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent opacity-20"></div>

      {/* Botão para voltar ao cardápio */}
      <button
        onClick={() => navigate('/menu')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#1e3a5f]/60 hover:text-[#1e3a5f] transition-all group z-20"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span className="text-sm font-medium">Voltar ao cardápio</span>
      </button>

      <div className="relative z-10 w-full max-w-5xl">
        
        {/* Card principal com layout dividido */}
        <div className="bg-white rounded-3xl shadow-[0_25px_80px_rgba(30,58,95,0.12)] border border-[#1e3a5f]/5 flex overflow-hidden">
          
          {/* Lado esquerdo - Branding (visível apenas em telas grandes) */}
          <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] flex-col justify-center items-center p-16 text-center relative overflow-hidden">
            
            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a853] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Linhas douradas nos cantos */}
            <div className="absolute top-12 left-12 w-20 h-px bg-gradient-to-r from-[#d4a853] to-transparent"></div>
            <div className="absolute top-12 left-12 w-px h-20 bg-gradient-to-b from-[#d4a853] to-transparent"></div>
            <div className="absolute bottom-12 right-12 w-20 h-px bg-gradient-to-l from-[#d4a853] to-transparent"></div>
            <div className="absolute bottom-12 right-12 w-px h-20 bg-gradient-to-t from-[#d4a853] to-transparent"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Logo */}
              <div className="mb-10 transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="/logo.png" 
                  alt="Manu's Smash Burger" 
                  className="h-32 w-auto filter drop-shadow-2xl brightness-0 invert"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-center">
                  <h1 className="text-5xl font-black text-white tracking-tight leading-none italic" style={{ fontFamily: 'Georgia, serif' }}>
                    Manu's
                  </h1>
                  <p className="text-[11px] font-bold text-[#d4a853] tracking-[0.4em] uppercase mt-2">
                    Smash Burger
                  </p>
                </div>
              </div>
              
              {/* Divisor dourado */}
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d4a853] to-transparent mb-10"></div>
              
              {/* Descrição da marca */}
              <p className="text-white/70 text-sm font-light max-w-xs leading-relaxed tracking-wide">
                O autêntico sabor do smash burger artesanal. Qualidade e tradição em cada mordida.
              </p>
              
              {/* Badges com estatísticas */}
              <div className="flex gap-6 mt-14">
                <div className="text-center">
                  <p className="text-3xl font-light text-[#d4a853]">500+</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Clientes</p>
                </div>
                <div className="w-px bg-white/20"></div>
                <div className="text-center">
                  <p className="text-3xl font-light text-[#d4a853]">4.9</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Avaliação</p>
                </div>
                <div className="w-px bg-white/20"></div>
                <div className="text-center">
                  <p className="text-3xl font-light text-[#d4a853]">30'</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Entrega</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário de login/cadastro */}
          <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
            
            {/* Logo para mobile */}
            <div className="lg:hidden text-center mb-10">
              <img 
                src="/logo.png" 
                alt="Manu's Smash Burger" 
                className="h-20 w-auto mx-auto mb-2"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-center">
                <h1 className="text-4xl font-black text-[#1e3a5f] tracking-tight leading-none italic" style={{ fontFamily: 'Georgia, serif' }}>
                  Manu's
                </h1>
                <p className="text-[10px] font-bold text-[#1e3a5f]/60 tracking-[0.3em] uppercase mt-1">
                  Smash Burger
                </p>
              </div>
            </div>

            {/* Título da seção */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-[#1e3a5f] tracking-wide">
                {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
              </h2>
              <p className="text-sm text-[#1e3a5f]/50 mt-2">
                {isLogin ? 'Entre para continuar seu pedido' : 'Junte-se à família Manu\'s'}
              </p>
            </div>

            {/* Tabs para alternar entre login e cadastro */}
            <div className="flex border-b border-[#1e3a5f]/10 mb-8">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-4 text-sm font-medium tracking-wide transition-all duration-300 relative ${
                  isLogin 
                    ? 'text-[#1e3a5f]' 
                    : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
                }`}
              >
                Entrar
                {isLogin && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#1e3a5f] rounded-full"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-4 text-sm font-medium tracking-wide transition-all duration-300 relative ${
                  !isLogin 
                    ? 'text-[#1e3a5f]' 
                    : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
                }`}
              >
                Cadastrar
                {!isLogin && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#1e3a5f] rounded-full"></div>
                )}
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="group">
                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2 tracking-wide">
                    Nome Completo
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-4 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:bg-white focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all text-[#1e3a5f] placeholder-[#1e3a5f]/30"
                    placeholder="Como devemos te chamar?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="group">
                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2 tracking-wide">
                  E-mail
                </label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-4 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:bg-white focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all text-[#1e3a5f] placeholder-[#1e3a5f]/30"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2 tracking-wide">
                  Senha
                </label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-4 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:bg-white focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all text-[#1e3a5f] placeholder-[#1e3a5f]/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div className="pt-2">
                  <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-[#1e3a5f]/10 bg-[#faf8f5] hover:bg-[#f5f3f0] transition-all group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                      />
                      <div className="w-5 h-5 rounded border-2 border-[#1e3a5f]/20 peer-checked:border-[#1e3a5f] peer-checked:bg-[#1e3a5f] transition-all flex items-center justify-center">
                        {isAdmin && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-[#1e3a5f]/70 group-hover:text-[#1e3a5f] transition-colors">
                      Sou gestor da loja
                    </span>
                  </label>
                </div>
              )}

              {/* Campo de chave de segurança para admin (apenas no cadastro) */}
              {!isLogin && isAdmin && (
                <div className="animate-fade-in pt-2">
                  <label className="text-xs font-medium text-[#d4a853] mb-2 flex items-center gap-2 tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#d4a853] rounded-full animate-pulse"></span>
                    Chave de Segurança
                  </label>
                  <input 
                    type="password" 
                    required={isAdmin}
                    className="w-full px-4 py-4 rounded-xl bg-[#1e3a5f]/5 border border-[#d4a853]/30 focus:border-[#d4a853] text-[#1e3a5f] focus:ring-4 focus:ring-[#d4a853]/10 outline-none transition-all font-mono tracking-widest placeholder-[#1e3a5f]/30"
                    placeholder="Digite o código"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                  />
                </div>
              )}

              {/* Exibição de erro */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  {error}
                </div>
              )}

              {/* Botão de submissão */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium text-sm py-4 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 disabled:opacity-70 mt-8 flex justify-center items-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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
                    <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divisor "ou" */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-[#1e3a5f]/10"></div>
              <span className="text-xs text-[#1e3a5f]/30 uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-[#1e3a5f]/10"></div>
            </div>

            {/* Opção para continuar sem conta */}
            <button 
              onClick={() => navigate('/menu')}
              className="w-full border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 hover:bg-[#faf8f5] text-[#1e3a5f]/70 font-medium text-sm py-4 rounded-xl transition-all flex justify-center items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span>Só quero ver o cardápio</span>
            </button>

            {/* Rodapé com termos */}
            <p className="text-center text-[#1e3a5f]/30 text-xs mt-8">
              Ao continuar, você concorda com nossos{' '}
              <span className="text-[#1e3a5f]/50 hover:text-[#1e3a5f] cursor-pointer underline">Termos de Uso</span>
            </p>
          </div>
        </div>

        {/* Badge de copyright inferior */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-[#1e3a5f]/40 text-xs">
            <span>©</span>
            <span>Manu's Smash Burger</span>
            <span>•</span>
            <span>Todos os direitos reservados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
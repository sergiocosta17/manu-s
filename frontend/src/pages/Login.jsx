import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      navigate('/menu');
    } catch (err) {
      setError(err.message || 'Erro ao processar a requisição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9EB] p-4 md:p-8 selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-5xl flex overflow-hidden border border-white">
        
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] flex-col justify-center items-center p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#C1704D] opacity-20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-[#EBCB6C] opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FDF9EB] tracking-tighter leading-none mb-2">MANU´S</h1>
            <p className="text-sm font-black text-[#EBCB6C] tracking-[0.4em] uppercase mb-10">Smash Burguer</p>
            <div className="mb-8 filter drop-shadow-2xl hover:scale-110 transition-transform duration-500 cursor-default">
              <svg className="w-28 h-28 text-[#EBCB6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 15h16v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1zm16-4H4v1h16v-1zm-2-2H6C6 5 9.5 4 12 4s6 1 6 5z"></path>
              </svg>
            </div>
            <p className="text-[#FDF9EB] opacity-70 text-base font-semibold max-w-sm leading-relaxed">
              O sabor autêntico do smash. Faça o seu pedido agora e acompanhe o status em tempo real!
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white/50">
          <div className="md:hidden text-center mb-10">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#C1704D] tracking-tighter leading-none mb-1">MANU´S</h1>
            <p className="text-[10px] font-black text-[#C1704D] tracking-[0.3em] uppercase">Smash Burguer</p>
          </div>

          <div className="flex justify-between items-center mb-10 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 uppercase ${isLogin ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-400 hover:text-[#1A1A1A]'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 uppercase ${!isLogin ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-400 hover:text-[#1A1A1A]'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-[#E5DCC3] focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 outline-none transition-all font-bold text-[#1A1A1A] placeholder-gray-300"
                  placeholder="Como devemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">E-mail de Acesso</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-4 rounded-2xl bg-white border border-[#E5DCC3] focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 outline-none transition-all font-bold text-[#1A1A1A] placeholder-gray-300"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Senha</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-4 rounded-2xl bg-white border border-[#E5DCC3] focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 outline-none transition-all font-bold text-[#1A1A1A] placeholder-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-[#C1704D] rounded border-gray-300 focus:ring-[#C1704D] cursor-pointer"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Sou Gestor da Loja</span>
                </label>
              </div>
            )}

            {!isLogin && isAdmin && (
              <div className="animate-fade-in-down pt-2">
                <label className="text-[10px] font-black text-[#C1704D] mb-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C1704D] rounded-full animate-pulse"></span>
                  Chave de Segurança
                </label>
                <input 
                  type="password" 
                  required={isAdmin}
                  className="w-full px-5 py-4 rounded-2xl bg-gradient-to-r from-[#1A1A1A] to-[#2a2a2a] text-[#EBCB6C] border border-[#1A1A1A] focus:ring-4 focus:ring-[#1A1A1A]/20 outline-none transition-all font-black tracking-widest placeholder-[#EBCB6C]/30 shadow-inner"
                  placeholder="INSIRA O CÓDIGO SECRETO"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-xs font-black border border-red-200 uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C1704D] to-[#A35C3E] hover:from-[#A35C3E] hover:to-[#C1704D] text-white font-black tracking-widest text-sm py-4.5 rounded-2xl transition-all duration-300 active:scale-95 shadow-[0_8px_25px_rgba(193,112,77,0.3)] disabled:opacity-70 mt-6 uppercase flex justify-center items-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> PROCESSANDO...</>
              ) : (isLogin ? 'Entrar na Conta' : 'Finalizar Registo')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
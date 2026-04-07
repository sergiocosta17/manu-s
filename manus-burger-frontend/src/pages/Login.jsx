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
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9EB] p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex overflow-hidden border-2 border-[#E5DCC3]">
        
        <div className="hidden md:flex md:w-1/2 bg-[#1A1A1A] flex-col justify-center items-center p-12 text-center relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-6xl font-extrabold text-[#FDF9EB] tracking-tight leading-none mb-2">MANU´S</h1>
            <p className="text-lg font-bold text-[#EBCB6C] tracking-widest uppercase mb-8">Smash Burguer</p>
            <div className="text-8xl mb-8 filter drop-shadow-lg">🍔</div>
            <p className="text-[#FDF9EB] opacity-80 text-lg font-semibold max-w-xs leading-snug">
              O sabor autêntico do smash. Peça agora e acompanhe em tempo real!
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="md:hidden text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-none">MANU´S</h1>
            <p className="text-xs font-bold text-[#C1704D] tracking-widest uppercase">Smash Burguer</p>
          </div>

          <div className="flex justify-between items-center mb-8 bg-[#FDF9EB] p-1.5 rounded-xl border border-[#E5DCC3]">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-lg text-sm font-extrabold transition-all ${isLogin ? 'bg-[#1A1A1A] text-[#EBCB6C] shadow-md' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'}`}
            >
              ENTRAR
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-lg text-sm font-extrabold transition-all ${!isLogin ? 'bg-[#1A1A1A] text-[#EBCB6C] shadow-md' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'}`}
            >
              CADASTRAR
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#FDF9EB] border border-[#E5DCC3] focus:bg-white focus:ring-2 focus:ring-[#C1704D] focus:border-transparent outline-none transition-all font-semibold text-[#1A1A1A]"
                  placeholder="Como devemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl bg-[#FDF9EB] border border-[#E5DCC3] focus:bg-white focus:ring-2 focus:ring-[#C1704D] focus:border-transparent outline-none transition-all font-semibold text-[#1A1A1A]"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Senha</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-xl bg-[#FDF9EB] border border-[#E5DCC3] focus:bg-white focus:ring-2 focus:ring-[#C1704D] focus:border-transparent outline-none transition-all font-semibold text-[#1A1A1A]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#E5DCC3] bg-[#FDF9EB]">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-[#C1704D] rounded border-gray-300 focus:ring-[#C1704D]"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <span className="text-sm font-extrabold text-[#1A1A1A] uppercase tracking-wide">Sou Administrador</span>
                </label>
              </div>
            )}

            {!isLogin && isAdmin && (
              <div className="animate-fade-in-down">
                <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Chave de Segurança</label>
                <input 
                  type="password" 
                  required={isAdmin}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] text-[#EBCB6C] border border-[#EBCB6C] focus:ring-2 focus:ring-[#EBCB6C] outline-none transition-all font-bold tracking-widest placeholder-[#EBCB6C]/40"
                  placeholder="DIGITE A CHAVE"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
            )}

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-200 uppercase tracking-wide">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#C1704D] hover:bg-[#A35C3E] text-white font-extrabold tracking-widest text-lg py-4 rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-70 mt-6"
            >
              {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR' : 'CRIAR CONTA')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
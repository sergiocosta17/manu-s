import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('INFO');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            query: `
              query GetOrders {
                orders {
                  id total status createdAt
                  items { quantity product { name imageUrl } }
                }
              }
            `
          })
        });
        
        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        const safeOrders = Array.isArray(result.data?.orders) ? result.data.orders : [];
        setOrders(safeOrders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        setError('Não foi possível carregar o histórico de pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Tem a certeza que deseja terminar a sessão?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      PENDING: { label: 'Aguardando', color: 'text-red-500 bg-red-50 border border-red-100' },
      PREPARING: { label: 'Em Produção', color: 'text-[#C1704D] bg-[#C1704D]/10 border border-[#C1704D]/20' },
      READY: { label: 'Pronto p/ Entrega', color: 'text-[#EBCB6C] bg-[#1A1A1A]' },
      DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 border border-green-100' },
      CANCELLED: { label: 'Cancelado', color: 'text-gray-500 bg-gray-100 border border-gray-200' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-500 bg-gray-100' };
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const tabs = [
    { 
      id: 'INFO', 
      label: 'Dados Pessoais', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> 
    },
    { 
      id: 'ADDRESSES', 
      label: 'Meus Endereços', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> 
    },
    { 
      id: 'ORDERS', 
      label: 'Histórico de Compras', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> 
    },
    { 
      id: 'PAYMENTS', 
      label: 'Cartões e Pagamento', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> 
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-black text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Minha Conta</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Voltar à Loja
            </button>
            {userRole === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Painel Admin
              </button>
            )}
          </div>
          <div className="md:hidden text-[#EBCB6C] opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 p-6 flex flex-col h-full">
            
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#C1704D] flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] leading-none">Olá, Cliente!</h2>
                <p className="text-xs font-semibold text-[#1A1A1A]/50 mt-1">Bem-vindo(a) de volta</p>
              </div>
            </div>

            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-sm transition-all duration-300 whitespace-nowrap md:whitespace-normal ${
                    activeTab === tab.id 
                    ? 'bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] shadow-md scale-[1.02]' 
                    : 'text-[#1A1A1A]/60 hover:bg-gray-50 hover:text-[#1A1A1A]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 md:mt-auto pt-8 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-colors active:scale-95 border border-red-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Terminar Sessão
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-grow animate-fade-in w-full">
          
          {activeTab === 'INFO' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 p-8 md:p-10 w-full overflow-hidden">
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-8">Informações Pessoais</h3>
              <form className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Nome Completo</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D] transition-all" defaultValue="Cliente Manu's" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Telemóvel / Celular</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D] transition-all" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">E-mail de Acesso</label>
                  <input type="email" className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl font-bold text-[#1A1A1A]/60 outline-none cursor-not-allowed" defaultValue="cliente@email.com" disabled />
                  <p className="text-[10px] text-[#1A1A1A]/40 mt-2 font-semibold">O e-mail é a sua chave de identificação e não pode ser alterado.</p>
                </div>
                <button type="button" className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] hover:from-[#333333] hover:to-[#1A1A1A] text-[#EBCB6C] font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl shadow-[0_8px_25px_rgba(26,26,26,0.3)] transition-all active:scale-95 mt-4">
                  Salvar Alterações
                </button>
              </form>
            </div>
          )}

          {activeTab === 'ADDRESSES' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 p-8 md:p-10 w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-[#1A1A1A]">Meus Endereços</h3>
                <button className="text-[#C1704D] font-black text-sm hover:underline flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Novo
                </button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="border border-[#EBCB6C] bg-gradient-to-r from-white to-[#FDF9EB]/50 p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                  <div className="absolute top-4 right-4 bg-[#1A1A1A] text-[#EBCB6C] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Principal</div>
                  <h4 className="font-black text-[#1A1A1A] text-lg mb-1">Casa</h4>
                  <p className="text-sm font-semibold text-[#1A1A1A]/60 leading-relaxed mb-5">Rua das Flores, 123 - Apt 402<br/>Centro - Campina Grande, PB</p>
                  <div className="flex gap-4 pt-4 border-t border-[#EBCB6C]/30">
                    <button className="text-[10px] font-black text-[#1A1A1A] hover:text-[#C1704D] transition-colors uppercase tracking-widest">Editar</button>
                    <button className="text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest">Remover</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ORDERS' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 p-8 md:p-10 w-full">
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-8">Histórico de Compras</h3>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <svg className="w-10 h-10 animate-spin text-[#C1704D]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              ) : error ? (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 p-6 rounded-2xl text-center shadow-sm">
                  <p className="text-red-600 font-black mb-1 uppercase tracking-widest text-xs">Aviso</p>
                  <p className="text-red-500 font-medium text-sm">{error}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  <p className="text-[#1A1A1A]/40 font-black text-sm uppercase tracking-[0.2em]">Nenhum pedido realizado.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => {
                    const status = getStatusDisplay(order.status);
                    return (
                      <div key={order.id} className="border border-gray-100 hover:border-[#E5DCC3] bg-white p-5 md:p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors shadow-sm hover:shadow-md">
                        <div className="w-full md:w-auto">
                          <div className="flex items-center justify-between md:justify-start gap-3 mb-3">
                            <span className="font-black text-[#1A1A1A] tracking-wider text-sm">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#1A1A1A]/50 mb-4">{formatDate(order.createdAt)}</p>
                          <div className="space-y-1">
                            {order.items.map((i, idx) => (
                              <p key={idx} className="text-sm font-semibold text-[#1A1A1A]">
                                <span className="text-[#C1704D] font-black mr-2">{i.quantity}x</span> 
                                {i.product?.name || 'Produto Removido'}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="text-left md:text-right mt-2 md:mt-0 w-full md:w-auto border-t md:border-0 border-gray-100 pt-4 md:pt-0">
                          <p className="text-[10px] font-black text-[#1A1A1A]/40 tracking-widest uppercase mb-1">Total da Compra</p>
                          <p className="text-2xl font-black text-[#C1704D]">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 p-8 md:p-10 w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-[#1A1A1A]">Pagamentos</h3>
                <button className="text-[#C1704D] font-black text-sm hover:underline flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Novo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333333] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start mb-6">
                    <svg className="w-10 h-10 text-[#EBCB6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
                  <p className="font-mono text-xl tracking-widest opacity-90 mb-2">**** **** **** 1234</p>
                  <div className="flex justify-between items-center text-xs font-black tracking-widest uppercase opacity-60">
                    <span>Validade 12/29</span>
                    <span>MasterCard</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
          </button>
          
          <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
          </button>

          {userRole === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-[9px] font-black tracking-[0.2em]">ADMIN</span>
            </button>
          )}

          <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all relative">
            <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A] -mt-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] mt-1">PERFIL</span>
          </button>
          
        </div>
      </footer>
    </div>
  );
}
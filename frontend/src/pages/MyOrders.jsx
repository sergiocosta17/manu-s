import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchOrders = async () => {
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
                  id
                  total
                  status
                  createdAt
                  items {
                    quantity
                    product {
                      name
                      price
                      imageUrl
                    }
                  }
                }
              }
            `
          })
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        
        const safeOrders = Array.isArray(result.data?.orders) ? result.data.orders : [];
        setOrders(safeOrders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      } catch (err) {
        setError('Falha de conexão com o histórico de pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      PENDING: { label: 'AGUARDANDO RESTAURANTE', color: 'bg-red-50 text-red-600 border border-red-200 animate-pulse' },
      PREPARING: { label: 'PREPARANDO', color: 'bg-[#FDF9EB] text-[#C1704D] border border-[#C1704D]/30 shadow-sm' },
      READY: { label: 'PRONTO PARA ENTREGA', color: 'bg-gradient-to-r from-[#C1704D] to-[#A35C3E] text-white shadow-[0_4px_15px_rgba(193,112,77,0.3)] border border-transparent' },
      DELIVERED: { label: 'PEDIDO ENTREGUE', color: 'bg-green-50 text-green-700 border border-green-200' },
      CANCELLED: { label: 'CANCELADO', color: 'bg-gray-100 text-gray-500 border border-gray-200' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left flex-grow md:flex-grow-0 cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-extrabold text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Smash Burguer</p>
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
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors text-sm">Sair</button>
          </div>

          <div className="md:hidden text-[#EBCB6C] text-2xl font-bold px-4 opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto p-4 md:p-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 px-2 md:px-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#C1704D] tracking-tight">Meus Pedidos</h2>
            <p className="text-[#1A1A1A]/60 font-semibold mt-1">Acompanhe o status das suas compras.</p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col justify-center items-center py-32 opacity-50">
            <svg className="w-12 h-12 animate-spin text-[#C1704D] mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-extrabold tracking-widest text-[#1A1A1A] uppercase text-sm">A Carregar Histórico...</p>
          </div>
        )}
        
        {error && (
           <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-sm mt-10">
             <p className="text-red-600 font-extrabold mb-2 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               Erro de Sincronização
             </p>
             <p className="text-red-500 font-medium">{error}</p>
           </div>
        )}
        
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <svg className="w-16 h-16 text-[#1A1A1A] opacity-20 mb-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <p className="text-[#1A1A1A]/40 font-black text-lg uppercase tracking-[0.2em] mb-8">Ainda não pediu connosco?</p>
            <button onClick={() => navigate('/menu')} className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] hover:from-[#333333] hover:to-[#1A1A1A] text-[#EBCB6C] font-black text-sm tracking-widest uppercase py-4 px-10 rounded-xl shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto">
              Ir para o Cardápio
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              const isCompleted = order.status === 'DELIVERED' || order.status === 'CANCELLED';

              return (
                <div key={order.id} className={`bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col transition-all duration-300 ${isCompleted ? 'opacity-80 hover:opacity-100' : 'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'}`}>
                  
                  <div className={`p-5 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isCompleted ? 'bg-gray-50/50' : 'bg-gradient-to-r from-white to-[#FDF9EB]/50'}`}>
                    <div>
                      <p className="text-[#1A1A1A]/40 font-black text-[10px] tracking-widest uppercase mb-1">Pedido #{order.id.slice(-6)}</p>
                      <p className="text-[#1A1A1A] font-extrabold text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </div>
                  </div>

                  <div className="p-5 md:p-6 space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-5">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-gray-100 relative">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-black text-[#1A1A1A] leading-tight text-lg md:text-xl mb-1">{item.product.name}</p>
                          <p className="text-[#1A1A1A]/40 font-black text-xs uppercase tracking-widest">Qtd: <span className="text-[#C1704D]">{item.quantity}x</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`p-5 md:p-6 flex justify-between items-end border-t border-gray-100 ${isCompleted ? '' : 'bg-[#FDF9EB]/30'}`}>
                    <span className="font-black text-[#1A1A1A]/40 text-[10px] tracking-[0.2em] uppercase mb-1">Total da Compra</span>
                    <span className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                      <span className="text-lg opacity-50 mr-1">R$</span>{order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
          </button>
          <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all relative">
            <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A] -mt-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] mt-1">COMPRAS</span>
          </button>
          {userRole === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-[9px] font-black tracking-[0.2em]">ADMIN</span>
            </button>
          )}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-red-400/50 hover:text-red-400 p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">SAIR</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
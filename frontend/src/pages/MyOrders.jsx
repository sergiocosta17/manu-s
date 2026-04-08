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
        setOrders(result.data.orders);
      } catch (err) {
        setError(err.message || 'Erro ao carregar pedidos.');
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
      PENDING: { label: 'PENDENTE', color: 'bg-[#EBCB6C] text-[#1A1A1A]' },
      PREPARING: { label: 'PREPARANDO', color: 'bg-[#C1704D] text-white' },
      READY: { label: 'PRONTO', color: 'bg-green-600 text-white' },
      DELIVERED: { label: 'ENTREGUE', color: 'bg-[#1A1A1A] text-[#FDF9EB]' },
      CANCELLED: { label: 'CANCELADO', color: 'bg-red-100 text-red-600 border border-red-200' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-200 text-gray-800' };
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0">
      <header className="sticky top-0 z-40 bg-[#1A1A1A] p-4 shadow-lg border-b-4 border-[#EBCB6C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left flex-grow md:flex-grow-0 cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-extrabold text-[#FDF9EB] tracking-tight leading-none">MANU´S</h1>
            <p className="text-[10px] md:text-xs font-bold text-[#FDF9EB] opacity-60 tracking-widest uppercase">Smash Burguer</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">🍔 Cardápio</button>
            {userRole === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">⚙️ Painel</button>
            )}
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors">Sair</button>
          </div>

          <div className="md:hidden text-[#EBCB6C] text-2xl font-bold px-4">
            📦
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-8 px-2 md:px-0">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] uppercase">
            MEUS PEDIDOS
          </h2>
          <div className="h-1 flex-grow bg-gradient-to-r from-[#C1704D] to-transparent rounded-full opacity-50"></div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin text-4xl text-[#C1704D]">🍔</div>
          </div>
        )}
        
        {error && <p className="text-center text-red-600 font-bold py-10 bg-red-50 rounded-2xl border border-red-200">{error}</p>}
        
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E5DCC3]">
            <p className="text-[#1A1A1A]/40 font-extrabold text-xl uppercase tracking-wider">Você ainda não pediu.</p>
            <button onClick={() => navigate('/menu')} className="mt-6 bg-[#C1704D] text-white font-bold py-3 px-8 rounded-xl">VER CARDÁPIO</button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              return (
                <div key={order.id} className="bg-white rounded-3xl shadow-sm border-2 border-[#E5DCC3] overflow-hidden">
                  <div className="bg-[#FDF9EB] p-4 md:p-6 border-b-2 border-[#E5DCC3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-[#1A1A1A]/60 font-bold text-xs tracking-widest uppercase mb-1">Pedido #{order.id.slice(-6)}</p>
                      <p className="text-[#1A1A1A] font-extrabold text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </div>
                  </div>

                  <div className="p-4 md:p-6 space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-extrabold text-[#1A1A1A] leading-tight">{item.product.name}</p>
                          <p className="text-[#C1704D] font-bold text-sm">x{item.quantity}</p>
                        </div>
                        <p className="font-extrabold text-[#1A1A1A]">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#1A1A1A] p-4 md:p-6 flex justify-between items-center">
                    <span className="font-extrabold text-[#EBCB6C] tracking-widest">TOTAL PAGO</span>
                    <span className="text-2xl font-extrabold text-white">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] p-2 px-6 border-t-2 border-[#EBCB6C] pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
            <span className="text-xl">🍔</span>
            <span className="text-[10px] font-bold tracking-wider">MENU</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#EBCB6C] p-2">
            <span className="text-xl">📦</span>
            <span className="text-[10px] font-bold tracking-wider">PEDIDOS</span>
          </button>
          {userRole === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
              <span className="text-xl">⚙️</span>
              <span className="text-[10px] font-bold tracking-wider">ADMIN</span>
            </button>
          )}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400/70 hover:text-red-400 p-2">
            <span className="text-xl">🚪</span>
            <span className="text-[10px] font-bold tracking-wider">SAIR</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
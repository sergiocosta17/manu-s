import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchOrders();
  }, []);

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
                user { name }
                items {
                  quantity
                  product { name }
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
      setError(err.message || 'Erro ao carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
              updateOrderStatus(id: $id, status: $status) { id status }
            }
          `,
          variables: { id: orderId, status: newStatus }
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar o status.');
    }
  };

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
            <p className="text-[10px] md:text-xs font-bold text-[#FDF9EB] opacity-60 tracking-widest uppercase">Admin Panel</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/admin/products')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">🍔 Produtos</button>
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">🏠 Loja</button>
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors">Sair</button>
          </div>
          
          <div className="md:hidden text-[#EBCB6C] text-2xl font-bold px-4">
            ⚙️
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2 md:px-0">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] uppercase">GESTÃO DE PEDIDOS</h2>
          </div>
          <button onClick={() => navigate('/admin/products')} className="bg-[#1A1A1A] text-[#EBCB6C] font-extrabold py-3 px-6 rounded-xl hover:bg-[#333] transition-colors shadow-md">
            GERIR PRODUTOS
          </button>
        </div>

        {loading && <p className="text-center text-[#C1704D] font-extrabold py-10 animate-pulse text-xl">CARREGANDO...</p>}
        {error && <p className="text-center text-red-600 font-bold py-10">{error}</p>}
        
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E5DCC3]">
            <p className="text-[#1A1A1A]/40 font-extrabold text-xl uppercase tracking-wider">Nenhum pedido no sistema.</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border-2 border-[#E5DCC3] overflow-hidden flex flex-col h-full">
                
                <div className="bg-[#FDF9EB] p-4 border-b-2 border-[#E5DCC3] flex justify-between items-center">
                  <span className="font-extrabold text-[#1A1A1A]">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-extrabold tracking-wider ${getStatusDisplay(order.status).color}`}>
                    {getStatusDisplay(order.status).label}
                  </span>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <p className="text-sm text-[#1A1A1A] mb-3">
                    <strong className="text-[#C1704D]">Cliente:</strong> {order.user ? order.user.name : 'Desconhecido'} <br/>
                    <strong className="text-[#C1704D]">Data:</strong> {formatDate(order.createdAt)}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 flex-grow border border-gray-100">
                    <ul className="text-sm text-[#1A1A1A] font-semibold space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-[#C1704D]">{item.quantity}x</span>
                          <span>{item.product.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="font-extrabold text-2xl text-[#1A1A1A] mb-4">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    {order.status === 'PENDING' && (
                      <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="col-span-2 bg-[#C1704D] hover:bg-[#A35C3E] text-white font-extrabold py-3 rounded-xl shadow-md transition-colors">
                        PREPARAR PEDIDO
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button onClick={() => updateOrderStatus(order.id, 'READY')} className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-colors">
                        MARCAR COMO PRONTO
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="col-span-2 bg-[#1A1A1A] hover:bg-[#333] text-[#EBCB6C] font-extrabold py-3 rounded-xl shadow-md transition-colors">
                        ENTREGAR
                      </button>
                    )}
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="col-span-2 bg-red-50 text-red-600 border border-red-200 font-extrabold py-3 rounded-xl transition-colors mt-2">
                        CANCELAR PEDIDO
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] p-2 px-6 border-t-2 border-[#EBCB6C] pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-bold tracking-wider">LOJA</span>
          </button>
          <button onClick={() => navigate('/admin/products')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
            <span className="text-xl">🍔</span>
            <span className="text-[10px] font-bold tracking-wider">PRODUTOS</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#EBCB6C] p-2">
            <span className="text-xl">⚙️</span>
            <span className="text-[10px] font-bold tracking-wider">PEDIDOS</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400/70 hover:text-red-400 p-2">
            <span className="text-xl">🚪</span>
            <span className="text-[10px] font-bold tracking-wider">SAIR</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
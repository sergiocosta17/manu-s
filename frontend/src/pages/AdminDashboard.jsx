import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [expandedHistory, setExpandedHistory] = useState({});
  const [revenueFilter, setRevenueFilter] = useState('MONTH');
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
      
      const sortedOrders = result.data.orders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setOrders(sortedOrders);
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

  const toggleHistory = (monthYear) => {
    setExpandedHistory(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      PENDING: { label: 'NOVO', color: 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' },
      PREPARING: { label: 'PREPARANDO', color: 'bg-[#EBCB6C] text-[#1A1A1A] shadow-md shadow-[#EBCB6C]/30' },
      READY: { label: 'PRONTO', color: 'bg-[#C1704D] text-white shadow-md shadow-[#C1704D]/30' },
      DELIVERED: { label: 'ENTREGUE', color: 'bg-green-600 text-white' },
      CANCELLED: { label: 'CANCELADO', color: 'bg-gray-200 text-gray-500 line-through' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-200 text-gray-800' };
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const date = new Date(Number(order.createdAt));
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const getFilteredRevenue = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfDay - (now.getDay() * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const delivered = orders.filter(o => o.status === 'DELIVERED');

    switch (revenueFilter) {
      case 'DAY':
        return delivered.filter(o => Number(o.createdAt) >= startOfDay).reduce((acc, o) => acc + o.total, 0);
      case 'WEEK':
        return delivered.filter(o => Number(o.createdAt) >= startOfWeek).reduce((acc, o) => acc + o.total, 0);
      case 'MONTH':
        return delivered.filter(o => Number(o.createdAt) >= startOfMonth).reduce((acc, o) => acc + o.total, 0);
      case 'YEAR':
        return delivered.filter(o => Number(o.createdAt) >= startOfYear).reduce((acc, o) => acc + o.total, 0);
      case 'ALL':
      default:
        return delivered.reduce((acc, o) => acc + o.total, 0);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  const renderOrderCard = (order) => {
    const statusDisplay = getStatusDisplay(order.status);
    const isCompleted = order.status === 'DELIVERED' || order.status === 'CANCELLED';

    return (
      <div key={order.id} className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden flex flex-col h-full transition-all ${isCompleted ? 'border-gray-200 opacity-75 hover:opacity-100' : 'border-[#E5DCC3] hover:shadow-lg'}`}>
        <div className={`p-4 border-b-2 flex justify-between items-center ${isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-[#FDF9EB] border-[#E5DCC3]'}`}>
          <span className="font-extrabold text-[#1A1A1A] tracking-wider">#{order.id.slice(-6).toUpperCase()}</span>
          <span className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-extrabold text-[#1A1A1A] uppercase mb-1">
              👤 {order.user ? order.user.name : 'Cliente Anônimo'}
            </p>
            <p className="text-xs text-[#1A1A1A]/60 font-bold">🕒 {formatDate(order.createdAt)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-4 mb-5 flex-grow border border-gray-100">
            <ul className="text-sm text-[#1A1A1A] font-semibold space-y-2">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                  <span className="text-[#C1704D] font-extrabold">{item.quantity}x</span>
                  <span className="leading-tight">{item.product.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p className={`font-extrabold text-3xl mb-5 text-center ${isCompleted ? 'text-gray-400' : 'text-[#1A1A1A]'}`}>
            R$ {order.total.toFixed(2).replace('.', ',')}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            {order.status === 'PENDING' && (
              <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="col-span-2 bg-[#1A1A1A] hover:bg-[#333333] text-[#EBCB6C] font-extrabold py-3.5 rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm">
                ACEITAR E PREPARAR
              </button>
            )}
            {order.status === 'PREPARING' && (
              <button onClick={() => updateOrderStatus(order.id, 'READY')} className="col-span-2 bg-[#C1704D] hover:bg-[#A35C3E] text-white font-extrabold py-3.5 rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm">
                MARCAR COMO PRONTO
              </button>
            )}
            {order.status === 'READY' && (
              <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm">
                FINALIZAR ENTREGA
              </button>
            )}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="col-span-2 bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 font-extrabold py-3 rounded-xl transition-colors mt-2 uppercase tracking-wider text-xs">
                CANCELAR PEDIDO
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0">
      <header className="sticky top-0 z-40 bg-[#1A1A1A] p-4 shadow-lg border-b-4 border-[#EBCB6C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left flex-grow md:flex-grow-0 cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-extrabold text-[#FDF9EB] tracking-tight leading-none">MANU´S</h1>
            <p className="text-[10px] md:text-xs font-bold text-[#FDF9EB] opacity-60 tracking-widest uppercase">Admin Control</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">🏠 Ver Loja</button>
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors">Sair</button>
          </div>
          <div className="md:hidden text-[#EBCB6C] text-2xl font-bold px-4">👑</div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-6 px-2 md:px-0">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] uppercase">PAINEL DE CONTROLE</h2>
          <div className="h-1 flex-grow bg-gradient-to-r from-[#C1704D] to-transparent rounded-full opacity-50"></div>
        </div>

        <nav className="mb-8 flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-shrink-0 px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'OVERVIEW' ? 'bg-[#1A1A1A] text-[#EBCB6C] scale-105 shadow-xl border border-[#EBCB6C]' : 'bg-[#E5DCC3] text-[#1A1A1A]/70 hover:bg-[#D4C9AA]'
            }`}
          >
            <span className="text-sm uppercase font-extrabold tracking-wide">📊 Visão Geral</span>
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex-shrink-0 px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer relative ${
              activeTab === 'ORDERS' ? 'bg-[#1A1A1A] text-[#EBCB6C] scale-105 shadow-xl border border-[#EBCB6C]' : 'bg-[#E5DCC3] text-[#1A1A1A]/70 hover:bg-[#D4C9AA]'
            }`}
          >
            <span className="text-sm uppercase font-extrabold tracking-wide">📦 Gestão de Pedidos</span>
            {pendingOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                {pendingOrders.length}
              </span>
            )}
          </button>
        </nav>

        {loading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin text-5xl text-[#C1704D]">⚙️</div>
           </div>
        ) : error ? (
           <p className="text-center text-red-600 font-bold py-10 bg-red-50 rounded-2xl border border-red-200">{error}</p>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <div className="animate-fade-in space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  
                  {/* Cartão de Faturamento com Filtro */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-[#E5DCC3] flex flex-col justify-center relative min-h-[140px]">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[#1A1A1A]/50 font-extrabold text-xs tracking-widest uppercase">Faturamento</p>
                      <select 
                        value={revenueFilter} 
                        onChange={(e) => setRevenueFilter(e.target.value)}
                        className="bg-[#FDF9EB] border border-[#E5DCC3] text-[#1A1A1A] text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:border-[#C1704D] cursor-pointer"
                      >
                        <option value="DAY">Hoje</option>
                        <option value="WEEK">Esta Semana</option>
                        <option value="MONTH">Este Mês</option>
                        <option value="YEAR">Este Ano</option>
                        <option value="ALL">Geral</option>
                      </select>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl md:text-4xl font-extrabold text-[#C1704D]">
                        R$ {getFilteredRevenue().toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] rounded-3xl p-6 shadow-lg border-2 border-[#EBCB6C] flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[140px]">
                    <p className="text-[#EBCB6C]/70 font-extrabold text-xs tracking-widest uppercase mb-2">Pedidos Ativos</p>
                    <p className="text-4xl md:text-5xl font-extrabold text-white">{pendingOrders.length}</p>
                    {pendingOrders.length > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-[#E5DCC3] flex flex-col justify-center items-center text-center min-h-[140px]">
                    <p className="text-[#1A1A1A]/50 font-extrabold text-xs tracking-widest uppercase mb-2">Pedidos Entregues</p>
                    <p className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A]">{deliveredOrders}</p>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-[#1A1A1A] mt-8 mb-4 border-b-2 border-[#E5DCC3] pb-2 uppercase tracking-widest">Ações do Administrador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => navigate('/admin/products')} className="bg-white hover:bg-gray-50 border-2 border-[#E5DCC3] rounded-3xl p-8 text-left transition-all hover:shadow-lg group flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-extrabold text-[#1A1A1A] mb-1">🍔 Gerir Cardápio</h4>
                      <p className="text-sm text-[#1A1A1A]/60 font-semibold">Adicionar, editar preços ou excluir produtos da vitrine.</p>
                    </div>
                    <span className="text-[#C1704D] text-3xl group-hover:translate-x-2 transition-transform">→</span>
                  </button>
                  
                  <button onClick={() => navigate('/menu')} className="bg-[#1A1A1A] hover:bg-[#333333] rounded-3xl p-8 text-left transition-all shadow-md group flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-extrabold text-[#EBCB6C] mb-1">🏠 Ver Loja</h4>
                      <p className="text-sm text-[#FDF9EB]/60 font-semibold">Acessar o cardápio exatamente como os clientes veem.</p>
                    </div>
                    <span className="text-[#EBCB6C] text-3xl group-hover:translate-x-2 transition-transform">→</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ORDERS' && (
              <div className="animate-fade-in space-y-12">
                {Object.keys(groupedOrders).length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E5DCC3]">
                    <p className="text-[#1A1A1A]/40 font-extrabold text-xl uppercase tracking-wider">Nenhum pedido no sistema.</p>
                  </div>
                ) : (
                  Object.keys(groupedOrders).map(monthYear => {
                    const monthOrders = groupedOrders[monthYear];
                    const pendingList = monthOrders.filter(o => o.status === 'PENDING');
                    const activeList = monthOrders.filter(o => ['PREPARING', 'READY'].includes(o.status));
                    const completedList = monthOrders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

                    return (
                      <div key={monthYear} className="mb-12 bg-white/50 p-4 md:p-8 rounded-3xl border border-[#E5DCC3]">
                        
                        <div className="flex items-center gap-4 mb-8">
                          <div className="bg-[#1A1A1A] text-[#EBCB6C] px-6 py-2 rounded-xl font-extrabold text-xl shadow-md uppercase tracking-widest inline-block">
                            {monthYear}
                          </div>
                          <div className="h-[2px] flex-grow bg-[#1A1A1A]/10"></div>
                        </div>

                        <div className="space-y-10">
                          {pendingList.length > 0 && (
                            <div>
                              <h4 className="text-lg font-extrabold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                                Novos Pedidos ({pendingList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pendingList.map(renderOrderCard)}
                              </div>
                            </div>
                          )}

                          {activeList.length > 0 && (
                            <div>
                              <h4 className="text-lg font-extrabold text-[#C1704D] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 bg-[#C1704D] rounded-full"></span>
                                Em Produção ({activeList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeList.map(renderOrderCard)}
                              </div>
                            </div>
                          )}

                          {completedList.length > 0 && (
                            <div>
                              <button 
                                onClick={() => toggleHistory(monthYear)} 
                                className="flex items-center justify-between w-full text-left focus:outline-none mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition-colors"
                              >
                                <h4 className="text-lg font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                                  Histórico ({completedList.length})
                                </h4>
                                <span className="text-gray-500 text-xl font-bold px-2">
                                  {expandedHistory[monthYear] ? '▼' : '▶'}
                                </span>
                              </button>
                              
                              {expandedHistory[monthYear] && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                  {completedList.map(renderOrderCard)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] p-2 px-6 border-t-2 border-[#EBCB6C] pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2 transition-colors">
            <span className="text-xl">🍔</span>
            <span className="text-[10px] font-bold tracking-wider">MENU</span>
          </button>
          <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2 transition-colors">
            <span className="text-xl">📦</span>
            <span className="text-[10px] font-bold tracking-wider">PEDIDOS</span>
          </button>
          {userRole === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 text-[#EBCB6C] p-2 transition-colors">
              <span className="text-xl">⚙️</span>
              <span className="text-[10px] font-bold tracking-wider">ADMIN</span>
            </button>
          )}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400/70 hover:text-red-400 p-2 transition-colors">
            <span className="text-xl">🚪</span>
            <span className="text-[10px] font-bold tracking-wider">SAIR</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
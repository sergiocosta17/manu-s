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
      alert('Erro ao atualizar o status: ' + err.message);
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
      PENDING: { label: 'NOVO PEDIDO', color: 'bg-red-50 text-red-600 border border-red-200 animate-pulse' },
      PREPARING: { label: 'EM PRODUÇÃO', color: 'bg-[#FDF9EB] text-[#C1704D] border border-[#C1704D]/30' },
      READY: { label: 'PRONTO PARA ENTREGA', color: 'bg-gradient-to-r from-[#C1704D] to-[#A35C3E] text-white shadow-[0_4px_15px_rgba(193,112,77,0.3)] border border-transparent' },
      DELIVERED: { label: 'ENTREGUE', color: 'bg-green-50 text-green-700 border border-green-200' },
      CANCELLED: { label: 'CANCELADO', color: 'bg-gray-100 text-gray-500 border border-gray-200' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
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
      case 'DAY': return delivered.filter(o => Number(o.createdAt) >= startOfDay).reduce((acc, o) => acc + o.total, 0);
      case 'WEEK': return delivered.filter(o => Number(o.createdAt) >= startOfWeek).reduce((acc, o) => acc + o.total, 0);
      case 'MONTH': return delivered.filter(o => Number(o.createdAt) >= startOfMonth).reduce((acc, o) => acc + o.total, 0);
      case 'YEAR': return delivered.filter(o => Number(o.createdAt) >= startOfYear).reduce((acc, o) => acc + o.total, 0);
      case 'ALL': default: return delivered.reduce((acc, o) => acc + o.total, 0);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  const renderOrderCard = (order) => {
    const statusDisplay = getStatusDisplay(order.status);
    const isCompleted = order.status === 'DELIVERED' || order.status === 'CANCELLED';

    return (
      <div key={order.id} className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 flex flex-col h-full transition-all duration-300 ${isCompleted ? 'opacity-80 hover:opacity-100 shadow-sm' : 'shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1'}`}>
        <div className={`px-5 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-3xl ${isCompleted ? 'bg-gray-50/50' : 'bg-gradient-to-r from-white to-[#FDF9EB]/50'}`}>
          <span className="font-black text-[#1A1A1A] tracking-wider text-sm">#{order.id.slice(-6).toUpperCase()}</span>
          <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>

        <div className="p-5 md:p-6 flex-grow flex flex-col">
          <div className="mb-5 flex justify-between items-start">
            <div>
              <p className="text-[10px] text-[#1A1A1A]/50 font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Cliente
              </p>
              <p className="text-base font-black text-[#1A1A1A] leading-tight">
                {order.user ? order.user.name : 'Cliente Anônimo'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#1A1A1A]/50 font-black tracking-widest uppercase mb-1 flex items-center justify-end gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Horário
              </p>
              <p className="text-xs font-bold text-[#1A1A1A] bg-gray-100 px-2 py-1 rounded-lg">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          
          <div className="bg-[#FDF9EB]/50 rounded-2xl p-4 mb-6 flex-grow border border-[#E5DCC3]/30">
            <ul className="text-sm text-[#1A1A1A] font-medium space-y-3">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="bg-[#1A1A1A] text-[#EBCB6C] font-black text-xs px-2 py-0.5 rounded-md min-w-[28px] text-center">{item.quantity}x</span>
                  <span className="leading-tight font-bold opacity-80">{item.product.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black tracking-widest text-[#1A1A1A]/50 uppercase">Total a Receber</span>
            <p className={`font-black text-3xl ${isCompleted ? 'text-gray-400' : 'text-[#C1704D]'}`}>
              <span className="text-lg mr-1 opacity-70 font-bold">R$</span>{order.total.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
            {order.status === 'PENDING' && (
              <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="col-span-full bg-gradient-to-r from-[#1A1A1A] to-[#333333] hover:from-[#333333] hover:to-[#1A1A1A] text-[#EBCB6C] font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-widest text-xs active:scale-95">
                Aceitar e Preparar
              </button>
            )}
            {order.status === 'PREPARING' && (
              <button onClick={() => updateOrderStatus(order.id, 'READY')} className="col-span-full bg-gradient-to-r from-[#C1704D] to-[#A35C3E] hover:from-[#A35C3E] hover:to-[#C1704D] text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(193,112,77,0.3)] hover:shadow-[0_8px_25px_rgba(193,112,77,0.4)] transition-all uppercase tracking-widest text-xs active:scale-95">
                Marcar como Pronto
              </button>
            )}
            {order.status === 'READY' && (
              <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="col-span-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(22,163,74,0.3)] transition-all uppercase tracking-widest text-xs active:scale-95">
                Finalizar Entrega
              </button>
            )}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="col-span-full bg-white text-red-500 border border-red-100 hover:bg-red-50 font-black py-3 rounded-xl transition-colors mt-2 uppercase tracking-widest text-[10px] active:scale-95">
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left flex-grow md:flex-grow-0 cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-black text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Admin Control</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Ver Loja
            </button>
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors text-sm">Sair da Conta</button>
          </div>
          <div className="md:hidden text-[#EBCB6C] bg-white/5 p-2 rounded-xl border border-white/10 opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 px-2 md:px-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#C1704D] tracking-tight">Painel Central</h2>
            <p className="text-[#1A1A1A]/60 font-semibold mt-1">Bem-vindo à gestão da sua loja.</p>
          </div>
        </div>

        <nav className="mb-10 flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all duration-300 cursor-pointer ${
              activeTab === 'OVERVIEW' 
              ? 'bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#EBCB6C] scale-[1.02] shadow-[0_8px_25px_rgba(26,26,26,0.3)] border border-[#EBCB6C]/20' 
              : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="text-sm uppercase tracking-widest flex items-center gap-2">
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Visão Geral
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all duration-300 cursor-pointer relative ${
              activeTab === 'ORDERS' 
              ? 'bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#EBCB6C] scale-[1.02] shadow-[0_8px_25px_rgba(26,26,26,0.3)] border border-[#EBCB6C]/20' 
              : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="text-sm uppercase tracking-widest flex items-center gap-2">
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              Gestão de Pedidos
            </span>
            {pendingOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse border-2 border-[#FDF9EB]">
                {pendingOrders.length}
              </span>
            )}
          </button>
        </nav>

        {loading ? (
           <div className="flex flex-col justify-center items-center py-32 opacity-50">
             <svg className="w-12 h-12 animate-spin text-[#C1704D] mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <p className="font-black tracking-widest text-[#1A1A1A] uppercase text-sm">A Sincronizar...</p>
           </div>
        ) : error ? (
           <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-sm mt-10">
             <p className="text-red-600 font-black mb-2 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               Erro de Conexão
             </p>
             <p className="text-red-500 font-medium">{error}</p>
           </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <div className="animate-fade-in space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-center relative min-h-[160px] group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-[#C1704D]/10 group-hover:text-[#C1704D] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <select 
                        value={revenueFilter} 
                        onChange={(e) => setRevenueFilter(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <option value="DAY">Hoje</option>
                        <option value="WEEK">Semana</option>
                        <option value="MONTH">Mês</option>
                        <option value="YEAR">Ano</option>
                        <option value="ALL">Geral</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[#1A1A1A]/40 font-black text-[10px] tracking-widest uppercase mb-1">Faturamento Liquido</p>
                      <p className="text-4xl font-black text-[#1A1A1A] tracking-tight">
                        <span className="text-xl text-[#1A1A1A]/40 font-bold mr-1">R$</span>{getFilteredRevenue().toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] rounded-3xl p-8 shadow-[0_15px_40px_rgba(26,26,26,0.3)] border border-[#EBCB6C]/20 flex flex-col justify-center relative overflow-hidden min-h-[160px] group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="bg-[#EBCB6C]/20 p-2.5 rounded-xl text-[#EBCB6C]">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      {pendingOrders.length > 0 && <span className="bg-red-500 w-3 h-3 rounded-full animate-ping"></span>}
                    </div>
                    <div className="relative z-10">
                      <p className="text-[#EBCB6C]/70 font-black text-[10px] tracking-widest uppercase mb-1">Pedidos Ativos</p>
                      <p className="text-5xl font-black text-white tracking-tight">{pendingOrders.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-center relative min-h-[160px] group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[#1A1A1A]/40 font-black text-[10px] tracking-widest uppercase mb-1">Volume de Entregas</p>
                      <p className="text-4xl font-black text-[#1A1A1A] tracking-tight">{deliveredOrders}</p>
                    </div>
                  </div>

                </div>

                <div className="pt-6">
                  <h3 className="text-sm font-black text-[#1A1A1A] mb-6 uppercase tracking-[0.2em] opacity-80 flex items-center gap-4">
                    Atalhos Rápidos
                    <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => navigate('/admin/products')} className="bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl p-8 text-left transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group flex items-center justify-between hover:-translate-y-1">
                      <div>
                        <h4 className="text-xl font-black text-[#1A1A1A] mb-2 flex items-center gap-3">
                          <span className="bg-[#C1704D]/10 text-[#C1704D] p-2.5 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                          </span>
                          Gerir Cardápio
                        </h4>
                        <p className="text-sm text-[#1A1A1A]/50 font-medium max-w-xs">Adicione novos produtos, defina preços promocionais ou remova itens do sistema.</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#C1704D] group-hover:text-white transition-colors text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </button>
                    
                    <button onClick={() => navigate('/menu')} className="bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl p-8 text-left transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group flex items-center justify-between hover:-translate-y-1">
                      <div>
                        <h4 className="text-xl font-black text-[#1A1A1A] mb-2 flex items-center gap-3">
                          <span className="bg-[#EBCB6C]/20 text-[#EBCB6C] p-2.5 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                          </span>
                          Visualizar Loja
                        </h4>
                        <p className="text-sm text-[#1A1A1A]/50 font-medium max-w-xs">Acesse o frontend da loja exatamente como os seus clientes o veem no dia a dia.</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#EBCB6C] group-hover:text-[#1A1A1A] transition-colors text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ORDERS' && (
              <div className="animate-fade-in space-y-12">
                {Object.keys(groupedOrders).length === 0 ? (
                  <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm">
                    <svg className="w-16 h-16 text-[#1A1A1A] opacity-10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    <p className="text-[#1A1A1A]/40 font-black text-sm uppercase tracking-[0.2em]">Sem fluxo de pedidos no momento.</p>
                  </div>
                ) : (
                  Object.keys(groupedOrders).map(monthYear => {
                    const monthOrders = groupedOrders[monthYear];
                    const pendingList = monthOrders.filter(o => o.status === 'PENDING');
                    const activeList = monthOrders.filter(o => ['PREPARING', 'READY'].includes(o.status));
                    const completedList = monthOrders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

                    return (
                      <div key={monthYear} className="mb-12">
                        
                        <div className="flex items-center gap-4 mb-8">
                          <div className="bg-white border border-gray-100 text-[#1A1A1A] px-6 py-2.5 rounded-2xl font-black text-sm shadow-sm uppercase tracking-[0.2em]">
                            {monthYear}
                          </div>
                          <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
                        </div>

                        <div className="space-y-10 pl-2 md:pl-4">
                          {pendingList.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                                Aguardando Aceite ({pendingList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {pendingList.map(renderOrderCard)}
                              </div>
                            </div>
                          )}

                          {activeList.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black text-[#C1704D] uppercase tracking-[0.2em] mb-6 flex items-center gap-3 mt-10">
                                <span className="w-2.5 h-2.5 bg-[#C1704D] rounded-full shadow-[0_0_8px_rgba(193,112,77,0.6)]"></span>
                                Produção & Despacho ({activeList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {activeList.map(renderOrderCard)}
                              </div>
                            </div>
                          )}

                          {completedList.length > 0 && (
                            <div className="mt-10">
                              <button 
                                onClick={() => toggleHistory(monthYear)} 
                                className="flex items-center justify-between w-full md:w-auto text-left focus:outline-none mb-6 cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl transition-all shadow-sm group"
                              >
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                  Histórico Fechado ({completedList.length})
                                </h4>
                                <span className={`text-gray-400 text-sm font-bold ml-6 transition-transform duration-300 ${expandedHistory[monthYear] ? 'rotate-180' : ''}`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </span>
                              </button>
                              
                              {expandedHistory[monthYear] && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in origin-top">
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

      {/* RODAPÉ MOBILE (PADRÃO PARA TODAS AS PÁGINAS) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
          </button>
          <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">COMPRAS</span>
          </button>
          {userRole === 'ADMIN' && (
            <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all -mt-4 relative">
               <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               </div>
              <span className="text-[9px] font-black tracking-[0.2em] mt-1">ADMIN</span>
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
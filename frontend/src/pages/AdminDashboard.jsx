import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [expandedHistory, setExpandedHistory] = useState({});
  const [revenueFilter, setRevenueFilter] = useState('MONTH');
  
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '' });

  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `query { orders { id total status createdAt user { name } items { quantity product { name } } } banners { id title subtitle imageUrl } }`
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      setOrders(result.data.orders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      setBanners(result.data.banners);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) { updateOrderStatus(id: $id, status: $status) { id } }`,
          variables: { id: orderId, status: newStatus }
        })
      });
      fetchData();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBannerForm({ ...bannerForm, imageUrl: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `mutation CreateBanner($input: BannerInput!) { createBanner(input: $input) { id } }`,
          variables: { input: bannerForm }
        })
      });
      setIsBannerModalOpen(false);
      setBannerForm({ title: '', subtitle: '', imageUrl: '' });
      fetchData();
    } catch (err) { alert('Erro ao guardar banner.'); }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Tem a certeza que deseja excluir este Banner?')) return;
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: `mutation { deleteBanner(id: "${id}") }` })
      });
      fetchData();
    } catch (err) {}
  };

  const toggleHistory = (monthYear) => setExpandedHistory(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const getStatusDisplay = (status) => {
    const statusMap = {
      PENDING: { label: 'NOVO PEDIDO', color: 'bg-red-50 text-red-600 border border-red-200 animate-pulse' },
      PREPARING: { label: 'EM PRODUÇÃO', color: 'bg-[#FDF9EB] text-[#C1704D] border border-[#C1704D]/30' },
      READY: { label: 'PRONTO', color: 'bg-gradient-to-r from-[#C1704D] to-[#A35C3E] text-white shadow-[0_4px_15px_rgba(193,112,77,0.3)] border border-transparent' },
      DELIVERED: { label: 'ENTREGUE', color: 'bg-green-50 text-green-700 border border-green-200' },
      CANCELLED: { label: 'CANCELADO', color: 'bg-gray-100 text-gray-500 border border-gray-200' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const monthYear = new Date(Number(order.createdAt)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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
          <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest ${statusDisplay.color}`}>{statusDisplay.label}</span>
        </div>
        <div className="p-5 md:p-6 flex-grow flex flex-col">
          <div className="mb-5 flex justify-between items-start">
            <div>
              <p className="text-[10px] text-[#1A1A1A]/50 font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">Cliente</p>
              <p className="text-base font-black text-[#1A1A1A] leading-tight">{order.user ? order.user.name : 'Cliente Anônimo'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#1A1A1A]/50 font-black tracking-widest uppercase mb-1 flex items-center justify-end gap-1.5">Horário</p>
              <p className="text-xs font-bold text-[#1A1A1A] bg-gray-100 px-2 py-1 rounded-lg">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="bg-[#FDF9EB]/50 rounded-2xl p-4 mb-6 flex-grow border border-[#E5DCC3]/30">
            <ul className="text-sm text-[#1A1A1A] font-medium space-y-3">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="bg-[#1A1A1A] text-[#EBCB6C] font-black text-xs px-2 py-0.5 rounded-md min-w-[28px] text-center">{item.quantity}x</span>
                  <span className="leading-tight font-bold opacity-80">{item.product?.name || 'Item Removido'}</span>
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
            {order.status === 'PENDING' && <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="col-span-full bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs active:scale-95">Aceitar e Preparar</button>}
            {order.status === 'PREPARING' && <button onClick={() => updateOrderStatus(order.id, 'READY')} className="col-span-full bg-gradient-to-r from-[#C1704D] to-[#A35C3E] text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs active:scale-95">Marcar como Pronto</button>}
            {order.status === 'READY' && <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="col-span-full bg-gradient-to-r from-green-600 to-green-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs active:scale-95">Finalizar Entrega</button>}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="col-span-full bg-white text-red-500 border border-red-100 font-black py-3 rounded-xl uppercase tracking-widest text-[10px] active:scale-95 mt-2">Cancelar Pedido</button>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      
      {/* CABEÇALHO UNIVERSAL ADMIN */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-black text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Smash Burguer</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/promotions')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Ofertas
            </button>
            <button onClick={() => navigate('/profile')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Meu Perfil
            </button>
            <button onClick={() => window.scrollTo(0,0)} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Gestão
            </button>
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
          <button onClick={() => setActiveTab('OVERVIEW')} className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all duration-300 outline-none ${activeTab === 'OVERVIEW' ? 'bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#EBCB6C] shadow-md scale-[1.02]' : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'}`}>
            Visão Geral
          </button>
          <button onClick={() => setActiveTab('ORDERS')} className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all duration-300 relative outline-none ${activeTab === 'ORDERS' ? 'bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#EBCB6C] shadow-md scale-[1.02]' : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'}`}>
            Pedidos
            {pendingOrders.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">{pendingOrders.length}</span>}
          </button>
          {/* TAB DE PRODUTOS RESTAURADA */}
          <button onClick={() => navigate('/admin/products')} className="flex-shrink-0 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all duration-300 outline-none bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200">
            Produtos
          </button>
          <button onClick={() => setActiveTab('BANNERS')} className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all duration-300 outline-none ${activeTab === 'BANNERS' ? 'bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#EBCB6C] shadow-md scale-[1.02]' : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'}`}>
            Destaques
          </button>
        </nav>

        {loading ? (
           <div className="flex flex-col justify-center items-center py-32 opacity-50">
             <svg className="w-12 h-12 animate-spin text-[#C1704D] mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </div>
        ) : error ? (
           <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 p-8 rounded-3xl text-center shadow-sm">
             <p className="text-red-500 font-medium">{error}</p>
           </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <div className="animate-fade-in space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm flex flex-col justify-center relative min-h-[160px]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                      <select value={revenueFilter} onChange={(e) => setRevenueFilter(e.target.value)} className="bg-gray-50 border border-gray-200 text-[#1A1A1A] text-[10px] font-black uppercase rounded-xl px-4 py-2 outline-none">
                        <option value="DAY">Hoje</option><option value="WEEK">Semana</option><option value="MONTH">Mês</option><option value="YEAR">Ano</option><option value="ALL">Geral</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[#1A1A1A]/40 font-black text-[10px] tracking-widest uppercase mb-1">Faturamento Liquido</p>
                      <p className="text-4xl font-black text-[#1A1A1A] tracking-tight"><span className="text-xl text-[#1A1A1A]/40 font-bold mr-1">R$</span>{getFilteredRevenue().toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] rounded-3xl p-8 shadow-md border border-[#EBCB6C]/20 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="bg-[#EBCB6C]/20 p-2.5 rounded-xl text-[#EBCB6C]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                      {pendingOrders.length > 0 && <span className="bg-red-500 w-3 h-3 rounded-full animate-ping"></span>}
                    </div>
                    <div className="relative z-10">
                      <p className="text-[#EBCB6C]/70 font-black text-[10px] tracking-widest uppercase mb-1">Pedidos Ativos</p>
                      <p className="text-5xl font-black text-white tracking-tight">{pendingOrders.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm flex flex-col justify-center relative min-h-[160px]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                    </div>
                    <div>
                      <p className="text-[#1A1A1A]/40 font-black text-[10px] tracking-widest uppercase mb-1">Volume de Entregas</p>
                      <p className="text-4xl font-black text-[#1A1A1A] tracking-tight">{deliveredOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ORDERS' && (
              <div className="animate-fade-in space-y-12">
                {Object.keys(groupedOrders).length === 0 ? (
                  <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm">
                    <p className="text-[#1A1A1A]/40 font-black text-sm uppercase tracking-[0.2em]">Sem fluxo de pedidos.</p>
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
                          <div className="bg-white border border-gray-100 text-[#1A1A1A] px-6 py-2.5 rounded-2xl font-black text-sm uppercase">{monthYear}</div>
                          <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
                        </div>

                        <div className="space-y-10 pl-2 md:pl-4">
                          {pendingList.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black text-red-500 uppercase mb-6 flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span> Aguardando Aceite ({pendingList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{pendingList.map(renderOrderCard)}</div>
                            </div>
                          )}

                          {activeList.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black text-[#C1704D] uppercase mb-6 flex items-center gap-3 mt-10">
                                <span className="w-2.5 h-2.5 bg-[#C1704D] rounded-full"></span> Produção & Despacho ({activeList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{activeList.map(renderOrderCard)}</div>
                            </div>
                          )}

                          {completedList.length > 0 && (
                            <div className="mt-10">
                              <button onClick={() => toggleHistory(monthYear)} className="flex items-center justify-between w-full md:w-auto text-left mb-6 bg-white px-6 py-3 rounded-2xl shadow-sm">
                                <h4 className="text-xs font-black text-gray-500 uppercase flex items-center gap-3">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Histórico Fechado ({completedList.length})
                                </h4>
                                <span className={`text-gray-400 text-sm font-bold ml-6 transition-transform duration-300 ${expandedHistory[monthYear] ? 'rotate-180' : ''}`}>▼</span>
                              </button>
                              {expandedHistory[monthYear] && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">{completedList.map(renderOrderCard)}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'BANNERS' && (
              <div className="animate-fade-in space-y-8">
                 <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/60">
                   <div>
                     <h3 className="text-2xl font-black text-[#1A1A1A]">Destaques da Loja</h3>
                     <p className="text-sm font-semibold text-[#1A1A1A]/60 mt-1">Gira o carrossel de promoções da página inicial.</p>
                   </div>
                   <button onClick={() => setIsBannerModalOpen(true)} className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] font-black px-6 py-3.5 rounded-xl shadow-lg active:scale-95 uppercase text-xs flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg> Novo
                   </button>
                 </div>

                 {banners.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-3xl shadow-sm">
                      <p className="text-[#1A1A1A]/40 font-black text-sm uppercase">Nenhum banner ativo.</p>
                    </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {banners.map(b => (
                       <div key={b.id} className="bg-white rounded-3xl overflow-hidden shadow-sm relative group h-48">
                         <img src={b.imageUrl} className="w-full h-full object-cover" alt={b.title || 'Banner'} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                         <div className="absolute bottom-4 left-4 right-4">
                           {b.title && <h4 className="text-white font-black text-xl drop-shadow-md truncate">{b.title}</h4>}
                           {b.subtitle && <p className="text-white/80 font-bold text-xs truncate drop-shadow-sm">{b.subtitle}</p>}
                         </div>
                         <button onClick={() => handleDeleteBanner(b.id)} className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL NOVO BANNER */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6">
          <div className="bg-[#FDF9EB] rounded-[2rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E5DCC3]/50">
              <h2 className="text-2xl font-black text-[#1A1A1A]">Novo Destaque</h2>
              <button onClick={() => setIsBannerModalOpen(false)} className="bg-gray-200/50 hover:bg-gray-200 text-gray-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-6">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-48 flex items-center justify-center relative overflow-hidden group">
                 {bannerForm.imageUrl ? (
                   <img src={bannerForm.imageUrl} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center">
                     <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Carregar Imagem (Obrigatório)</span>
                   </div>
                 )}
                 <input type="file" accept="image/*" onChange={handleBannerImageUpload} required className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div>
                {/* NOTA: Título agora é Opcional */}
                <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Título do Banner (Opcional)</label>
                <input className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" placeholder="Ex: MEGA PROMOÇÃO" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Subtítulo (Opcional)</label>
                <input className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" placeholder="Ex: 50% de desconto" value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} />
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-[#E5DCC3]/50">
                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="md:w-1/3 bg-white border border-gray-200 text-[#1A1A1A] font-black py-4.5 rounded-2xl uppercase text-xs active:scale-95">Cancelar</button>
                <button type="submit" className="md:w-2/3 bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] font-black py-4.5 rounded-2xl shadow-lg uppercase text-xs active:scale-95">Publicar Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RODAPÉ UNIVERSAL ADMIN */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
          </button>
          
          <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all relative">
            <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A] -mt-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] mt-1">PAINEL</span>
          </button>

          <button onClick={() => navigate('/admin/products')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
             <span className="text-[9px] font-black tracking-[0.2em]">PRODUTOS</span>
          </button>

          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">PERFIL</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
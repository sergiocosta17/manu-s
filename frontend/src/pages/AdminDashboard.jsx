import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// Painel administrativo para gerenciar pedidos, banners e visualizar métricas
export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [expandedHistory, setExpandedHistory] = useState({});
  const [revenueFilter, setRevenueFilter] = useState('DAY');
  
  // Estados do modal de criação/edição de banner
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '' });

  const navigate = useNavigate();

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          query: `
            query {
              orders {
                id total status createdAt
                user { name email }
                items { name quantity price product { name } }
              }
              banners { id title subtitle imageUrl }
            }
          `
        })
      });
      const result = await response.json();
      
      if (result.errors) throw new Error(result.errors[0].message);
      
      setOrders(result.data.orders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      setBanners(result.data.banners || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  // ORDERS
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          query: `mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) { 
            updateOrderStatus(id: $id, status: $status) { id status } 
          }`,
          variables: { id: orderId, status: newStatus }
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      fetchData(); 
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // BANNERS
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

  // Abre modal para criar novo banner
  const openCreateBannerModal = () => {
    setEditingBanner(null);
    setBannerForm({ title: '', subtitle: '', imageUrl: '' });
    setIsBannerModalOpen(true);
  };

  // Abre modal para editar banner existente
  const openEditBannerModal = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || ''
    });
    setIsBannerModalOpen(true);
  };

  // Fecha o modal e limpa estados
  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBanner(null);
    setBannerForm({ title: '', subtitle: '', imageUrl: '' });
  };

  // Salva banner (criar ou atualizar)
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            query: `mutation UpdateBanner($id: ID!, $input: BannerInput!) { 
              updateBanner(id: $id, input: $input) { id title subtitle imageUrl } 
            }`,
            variables: { id: editingBanner.id, input: bannerForm }
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
      } else {
        // Criar novo banner
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            query: `mutation CreateBanner($input: BannerInput!) { createBanner(input: $input) { id } }`,
            variables: { input: bannerForm }
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
      }
      closeBannerModal();
      fetchData();
    } catch (err) { 
      alert('Erro ao salvar banner: ' + err.message); 
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Excluir este banner?')) return;
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: `mutation { deleteBanner(id: "${id}") }` })
      });
      fetchData();
    } catch (err) {}
  };

  // HELPERS
  const toggleHistory = (monthYear) => setExpandedHistory(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
  
  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

  const getStatusDisplay = (status) => {
    const statusMap = {
      PLACED: { label: 'Novo', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
      CONFIRMED: { label: 'Confirmado', color: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500' },
      PENDING: { label: 'Novo', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
      PREPARING: { label: 'Preparando', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
      READY: { label: 'Pronto', color: 'bg-green-50 text-green-600 border-green-200', dot: 'bg-green-500' },
      OUT_FOR_DELIVERY: { label: 'Em Entrega', color: 'bg-purple-50 text-purple-600 border-purple-200', dot: 'bg-purple-500' },
      DELIVERED: { label: 'Entregue', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
      COMPLETED: { label: 'Finalizado', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
      CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };
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
    
    const delivered = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED');

    switch (revenueFilter) {
      case 'DAY': return delivered.filter(o => Number(o.createdAt) >= startOfDay).reduce((acc, o) => acc + o.total, 0);
      case 'WEEK': return delivered.filter(o => Number(o.createdAt) >= startOfWeek).reduce((acc, o) => acc + o.total, 0);
      case 'MONTH': return delivered.filter(o => Number(o.createdAt) >= startOfMonth).reduce((acc, o) => acc + o.total, 0);
      case 'YEAR': return delivered.filter(o => Number(o.createdAt) >= startOfYear).reduce((acc, o) => acc + o.total, 0);
      case 'ALL': default: return delivered.reduce((acc, o) => acc + o.total, 0);
    }
  };

  const pendingOrders = orders.filter(o => 
    ['PENDING', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;

  const renderOrderCard = (order) => {
    const statusDisplay = getStatusDisplay(order.status);
    const isCompleted = order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'CANCELLED';
    const isNew = order.status === 'PLACED' || order.status === 'PENDING' || order.status === 'CONFIRMED';

    return (
      <div 
        key={order.id} 
        className={`bg-white rounded-2xl border flex flex-col h-full transition-all duration-300 overflow-hidden ${
          isNew 
            ? 'border-red-200 shadow-lg shadow-red-100 ring-1 ring-red-100' 
            : isCompleted 
              ? 'border-[#1e3a5f]/5 opacity-70 hover:opacity-100' 
              : 'border-[#1e3a5f]/10 shadow-sm hover:shadow-lg hover:shadow-[#1e3a5f]/5 hover:-translate-y-1'
        }`}
      >
        <div className={`px-5 py-4 border-b flex justify-between items-center ${
          isNew ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-100' : 'bg-[#faf8f5] border-[#1e3a5f]/5'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${statusDisplay.dot} ${isNew ? 'animate-pulse' : ''}`}></span>
            <span className="font-bold text-[#1e3a5f] text-sm">#{order.id.slice(-6).toUpperCase()}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Cliente</p>
              <p className="font-semibold text-[#1e3a5f]">{order.user?.name || 'Cliente'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Horário</p>
              <p className="text-xs font-medium text-[#1e3a5f] bg-[#faf8f5] px-2 py-1 rounded-lg">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          
          <div className="bg-[#faf8f5] rounded-xl p-4 mb-5 flex-grow border border-[#1e3a5f]/5">
            <ul className="space-y-2">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-center text-sm">
                  <span className="bg-[#1e3a5f] text-white font-bold text-xs px-2 py-0.5 rounded min-w-[28px] text-center">
                    {item.quantity}x
                  </span>
                  <span className="text-[#1e3a5f]/70 font-medium">{item.name || item.product?.name || 'Item'}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center mb-5">
            <span className="text-xs font-medium text-[#1e3a5f]/40">Total</span>
            <p className={`font-bold text-2xl ${isCompleted ? 'text-[#1e3a5f]/40' : 'text-[#1e3a5f]'}`}>
              <span className="text-sm mr-0.5 opacity-60">R$</span>
              {order.total.toFixed(2).replace('.', ',')}
            </p>
          </div>
          
          <div className="space-y-2 mt-auto">
            {(order.status === 'PLACED' || order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'PREPARING')} 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <FireIcon className="w-4 h-4" /> Aceitar e Preparar
              </button>
            )}
            
            {order.status === 'PREPARING' && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')} 
                className="w-full bg-gradient-to-r from-[#d4a853] to-[#c49a4a] hover:from-[#c49a4a] hover:to-[#b38a3a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#d4a853]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RocketIcon className="w-4 h-4" /> Saiu para Entrega
              </button>
            )}
            
            {(order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY') && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'DELIVERED')} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-4 h-4" /> Confirmar Entrega
              </button>
            )}
            
            {!isCompleted && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')} 
                className="w-full bg-white text-red-500 border border-red-100 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-all text-sm"
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-[#faf8f5]/85 pointer-events-none"></div>
      
      <div className="relative z-10 h-20"></div>

      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-[#d4a853]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Painel</h1>
            </div>
            <p className="text-[#1e3a5f]/50 text-sm">Acompanhe os pedidos e métricas</p>
          </div>
          
          <button 
            onClick={fetchData}
            className="bg-white border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 text-[#1e3a5f] font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all hover:shadow-md"
          >
            <RefreshIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        <nav className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'OVERVIEW', label: 'Visão Geral', icon: <ChartIcon /> },
            { key: 'ORDERS', label: 'Pedidos', badge: pendingOrders.length, icon: <OrderIcon /> },
            { key: 'BANNERS', label: 'Banners', icon: <ImageIcon /> }
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)} 
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 relative text-sm ${
                activeTab === tab.key 
                  ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20' 
                  : 'bg-white text-[#1e3a5f]/60 hover:bg-[#1e3a5f]/5 border border-[#1e3a5f]/10'
              }`}
            >
              <span className={activeTab === tab.key ? 'text-[#d4a853]' : ''}>{tab.icon}</span>
              {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.key 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm">Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4a853]/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-[#d4a853]/10 rounded-xl flex items-center justify-center">
                        <DollarIcon className="w-6 h-6 text-[#d4a853]" />
                      </div>
                      <select 
                        value={revenueFilter} 
                        onChange={(e) => setRevenueFilter(e.target.value)} 
                        className="bg-[#faf8f5] border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]/30"
                      >
                        <option value="DAY">Hoje</option>
                        <option value="WEEK">Semana</option>
                        <option value="MONTH">Mês</option>
                        <option value="YEAR">Ano</option>
                        <option value="ALL">Total</option>
                      </select>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">Faturamento</p>
                      <p className="text-3xl font-bold text-[#1e3a5f]">
                        <span className="text-lg text-[#1e3a5f]/40 mr-1">R$</span>
                        {getFilteredRevenue().toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1e3a5f] rounded-2xl p-6 shadow-lg shadow-[#1e3a5f]/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4a853]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-[#d4a853]" />
                      </div>
                      {pendingOrders.length > 0 && (
                        <span className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium">
                          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                          Ativo
                        </span>
                      )}
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-white/50 text-xs font-medium mb-1">Pedidos Ativos</p>
                      <p className="text-4xl font-bold text-white">{pendingOrders.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">Entregas Realizadas</p>
                      <p className="text-3xl font-bold text-[#1e3a5f]">{deliveredOrders}</p>
                    </div>
                  </div>
                </div>

                {pendingOrders.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-[#1e3a5f] flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Pedidos em Andamento
                      </h3>
                      <button 
                        onClick={() => setActiveTab('ORDERS')}
                        className="text-sm font-medium text-[#1e3a5f]/50 hover:text-[#1e3a5f] transition-colors"
                      >
                        Ver todos →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingOrders.slice(0, 6).map(renderOrderCard)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ORDERS' && (
              <div className="space-y-8">
                {Object.keys(groupedOrders).length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5">
                    <OrderIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  Object.keys(groupedOrders).map(monthYear => {
                    const monthOrders = groupedOrders[monthYear];
                    const pendingList = monthOrders.filter(o => ['PENDING', 'PLACED', 'CONFIRMED'].includes(o.status));
                    const activeList = monthOrders.filter(o => ['PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status));
                    const completedList = monthOrders.filter(o => ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.status));

                    return (
                      <div key={monthYear}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="bg-white border border-[#1e3a5f]/10 text-[#1e3a5f] px-4 py-2 rounded-xl font-semibold text-sm">
                            {monthYear}
                          </div>
                          <div className="h-px flex-grow bg-gradient-to-r from-[#1e3a5f]/10 to-transparent"></div>
                        </div>

                        <div className="space-y-8">
                          {pendingList.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-red-500 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Novos Pedidos ({pendingList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {pendingList.map(renderOrderCard)}
                              </div>
                            </div>
                          )}

                          {activeList.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-amber-600 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                Em Andamento ({activeList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {activeList.map(renderOrderCard)}
                              </div>
                            </div>
                          )}

                          {completedList.length > 0 && (
                            <div>
                              <button 
                                onClick={() => toggleHistory(monthYear)} 
                                className="flex items-center justify-between w-full md:w-auto text-left mb-4 bg-white px-5 py-3 rounded-xl shadow-sm border border-[#1e3a5f]/5 hover:shadow-md transition-all"
                              >
                                <h4 className="text-sm font-semibold text-[#1e3a5f]/50 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                                  Histórico ({completedList.length})
                                </h4>
                                <ChevronIcon className={`w-4 h-4 text-[#1e3a5f]/30 ml-4 transition-transform ${expandedHistory[monthYear] ? 'rotate-180' : ''}`} />
                              </button>
                              {expandedHistory[monthYear] && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
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

            {/* BANNERS TAB */}
            {activeTab === 'BANNERS' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1e3a5f]">Banners Promocionais</h3>
                    <p className="text-sm text-[#1e3a5f]/50 mt-1">Gerencie o carrossel da página inicial</p>
                  </div>
                  <button 
                    onClick={openCreateBannerModal} 
                    className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 flex items-center gap-2 text-sm transition-all"
                  >
                    <PlusIcon className="w-4 h-4" /> Novo Banner
                  </button>
                </div>

                {banners.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5">
                    <ImageIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium">Nenhum banner ativo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map(b => (
                      <div key={b.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#1e3a5f]/5 group hover:shadow-lg transition-all">
                        <div className="relative h-48">
                          <img src={b.imageUrl} className="w-full h-full object-cover" alt={b.title || 'Banner'} />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/80 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            {b.title && <h4 className="text-white font-bold text-lg truncate">{b.title}</h4>}
                            {b.subtitle && <p className="text-white/70 text-sm truncate">{b.subtitle}</p>}
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button 
                              onClick={() => openEditBannerModal(b)} 
                              className="bg-white hover:bg-gray-100 text-[#1e3a5f] w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors"
                              title="Editar banner"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBanner(b.id)} 
                              className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors"
                              title="Excluir banner"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE BANNER */}
      {isBannerModalOpen && (
        <Modal onClose={closeBannerModal} title={editingBanner ? "Editar Banner" : "Novo Banner"}>
          <form onSubmit={handleSaveBanner} className="space-y-5">
            <div className={`border-2 border-dashed rounded-2xl h-48 flex items-center justify-center relative overflow-hidden transition-all ${
              bannerForm.imageUrl ? 'border-[#1e3a5f]/20' : 'border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'
            }`}>
              {bannerForm.imageUrl ? (
                <>
                  <img src={bannerForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-[#1e3a5f] px-4 py-2 rounded-lg font-medium text-sm">
                      Trocar imagem
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-[#1e3a5f]/20 mx-auto mb-2" />
                  <span className="text-sm text-[#1e3a5f]/40">Clique para enviar imagem</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleBannerImageUpload} 
                required={!editingBanner}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>

            <InputField
              label="Título (opcional)"
              value={bannerForm.title}
              onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
              placeholder="Ex: Mega Promoção"
            />
            
            <InputField
              label="Subtítulo (opcional)"
              value={bannerForm.subtitle}
              onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
              placeholder="Ex: 50% de desconto"
            />

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={closeBannerModal} 
                className="flex-1 py-3.5 rounded-xl font-medium bg-[#faf8f5] hover:bg-[#f0eeeb] text-[#1e3a5f] transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all"
              >
                {editingBanner ? 'Salvar' : 'Publicar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FOOTER DE NAVEGAÇÃO MOBILE */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Loja" />
          <NavBtn onClick={() => navigate('/promotions')} icon={<TagIcon />} label="Ofertas" />
          <NavBtn onClick={() => navigate('/admin/products')} icon={<BoxIcon />} label="Produtos" />
          <NavBtn onClick={() => {}} icon={<SettingsIcon />} label="Painel" active />
          <NavBtn onClick={() => navigate('/profile')} icon={<UserIcon />} label="Perfil" />
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES
const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between p-6 border-b border-[#1e3a5f]/10 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-[#1e3a5f]">{title}</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-[#faf8f5] hover:bg-[#f0eeeb] flex items-center justify-center text-[#1e3a5f]/50 hover:text-[#1e3a5f] transition-all"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const InputField = ({ label, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">{label}</label>}
    <input
      className="w-full px-4 py-3.5 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:bg-white outline-none transition-all text-[#1e3a5f] placeholder-[#1e3a5f]/30"
      {...props}
    />
  </div>
);

const NavBtn = ({ onClick, icon, label, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${
      active ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
    }`}
  >
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

// ÍCONES SVG
const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

const ChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const OrderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
  </svg>
);

const BoxIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
  </svg>
);

const ImageIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

const DollarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
);

const ChevronIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const TagIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const FireIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
  </svg>
);

const RocketIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

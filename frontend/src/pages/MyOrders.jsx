import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();
  
  const { setIsTrackingOpen, activeTrackingOrders } = useCart?.() || {};

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: `query { 
            orders { 
              id total status createdAt 
              items { quantity name price product { name imageUrl } } 
            } 
          }`
        })
      });
      
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      const sorted = (result.data?.orders || []).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setOrders(sorted);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const map = {
      PLACED: { label: 'Recebido', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: '📥', progress: 1 },
      CONFIRMED: { label: 'Confirmado', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: '✅', progress: 1 },
      PREPARING: { label: 'Em Produção', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: '🔥', progress: 2 },
      OUT_FOR_DELIVERY: { label: 'Saiu p/ Entrega', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: '🚗', progress: 3 },
      DELIVERED: { label: 'Entregue', color: 'bg-green-50 text-green-600 border-green-200', icon: '🎉', progress: 4 },
      COMPLETED: { label: 'Concluído', color: 'bg-green-50 text-green-600 border-green-200', icon: '✓', progress: 4 },
      CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: '✕', progress: 0 }
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200', icon: '?', progress: 0 };
  };

  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const isActive = (status) => ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(status);

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : filter === 'ACTIVE' 
      ? orders.filter(o => isActive(o.status))
      : orders.filter(o => !isActive(o.status));

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white">
      
      {/* Espaço para Header */}
      <div className="h-20"></div>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <OrderIcon className="w-5 h-5 text-[#d4a853]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Meus Pedidos</h1>
            </div>
            <p className="text-[#1e3a5f]/50 text-sm">Acompanhe o histórico de todos os seus pedidos</p>
          </div>
          
          {/* Pedidos Ativos Badge */}
          {activeTrackingOrders?.length > 0 && (
            <button
              onClick={() => setIsTrackingOpen?.(true)}
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-5 py-3 rounded-xl transition-all"
            >
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-medium">{activeTrackingOrders.length} pedido(s) em andamento</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'ALL', label: 'Todos', count: orders.length },
            { key: 'ACTIVE', label: 'Em Andamento', count: orders.filter(o => isActive(o.status)).length },
            { key: 'COMPLETED', label: 'Finalizados', count: orders.filter(o => !isActive(o.status)).length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                filter === f.key
                  ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20'
                  : 'bg-white text-[#1e3a5f]/60 border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5'
              }`}
            >
              {f.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === f.key
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1e3a5f]/10 text-[#1e3a5f]/50'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#1e3a5f]/5">
            <div className="w-20 h-20 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <OrderIcon className="w-10 h-10 text-[#1e3a5f]/20" />
            </div>
            <p className="text-[#1e3a5f]/40 font-medium text-lg">
              {filter === 'ACTIVE' ? 'Nenhum pedido em andamento' : 'Nenhum pedido encontrado'}
            </p>
            <p className="text-[#1e3a5f]/30 text-sm mt-2">
              {filter === 'ALL' ? 'Faça seu primeiro pedido agora!' : 'Selecione outro filtro ou faça um novo pedido'}
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="mt-6 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#1e3a5f]/20"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = getStatusDisplay(order.status);
              const isOrderActive = isActive(order.status);
              
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                    isOrderActive 
                      ? 'border-[#1e3a5f]/20 shadow-md' 
                      : 'border-[#1e3a5f]/5'
                  }`}
                >
                  {/* Header do Pedido */}
                  <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isOrderActive ? 'bg-gradient-to-r from-[#1e3a5f]/5 to-transparent border-[#1e3a5f]/10' : 'bg-[#faf8f5] border-[#1e3a5f]/5'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        isOrderActive ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                      }`}>
                        {status.icon}
                      </div>
                      <div>
                        <p className="font-bold text-[#1e3a5f]">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-[#1e3a5f]/40">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`self-start sm:self-center px-4 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  {/* Progress Bar para pedidos ativos */}
                  {isOrderActive && (
                    <div className="px-6 py-4 bg-[#faf8f5]/50 border-b border-[#1e3a5f]/5">
                      <div className="flex items-center justify-between mb-3">
                        {['Recebido', 'Preparando', 'Saiu p/ Entrega', 'Entregue'].map((step, idx) => (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              idx < status.progress 
                                ? 'bg-[#1e3a5f] text-white' 
                                : idx === status.progress 
                                  ? 'bg-[#d4a853] text-white animate-pulse' 
                                  : 'bg-[#1e3a5f]/10 text-[#1e3a5f]/30'
                            }`}>
                              {idx < status.progress ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[9px] mt-1.5 text-center ${
                              idx <= status.progress ? 'text-[#1e3a5f]/70 font-medium' : 'text-[#1e3a5f]/30'
                            }`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="h-1 bg-[#1e3a5f]/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#d4a853] rounded-full transition-all duration-500"
                          style={{ width: `${(status.progress / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Itens do Pedido */}
                  <div className="p-6">
                    <div className="space-y-3 mb-5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4] rounded-xl overflow-hidden flex-shrink-0">
                            {item.product?.imageUrl ? (
                              <img src={item.product.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl opacity-40">🍔</div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-[#1e3a5f]">{item.name || item.product?.name}</p>
                            <p className="text-xs text-[#1e3a5f]/40">Qtd: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-[#1e3a5f]">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total */}
                    <div className="flex justify-between items-center pt-5 border-t border-[#1e3a5f]/10">
                      <span className="text-[#1e3a5f]/50 font-medium">Total do Pedido</span>
                      <span className="text-2xl font-bold text-[#1e3a5f]">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Início" />
          <NavBtn onClick={() => navigate('/promotions')} icon={<TagIcon />} label="Ofertas" />
          <NavBtn onClick={() => {}} icon={<OrderIcon />} label="Pedidos" active />
          <NavBtn onClick={() => navigate('/profile')} icon={<UserIcon />} label="Perfil" />
        </div>
      </footer>
    </div>
  );
}

// ============ COMPONENTES AUXILIARES ============

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

// ============ ÍCONES ============

const OrderIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
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

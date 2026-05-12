import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// CONSTANTES

const DAYS_OF_WEEK = [
  { value: 'SUNDAY', label: 'Dom' },
  { value: 'MONDAY', label: 'Seg' },
  { value: 'TUESDAY', label: 'Ter' },
  { value: 'WEDNESDAY', label: 'Qua' },
  { value: 'THURSDAY', label: 'Qui' },
  { value: 'FRIDAY', label: 'Sex' },
  { value: 'SATURDAY', label: 'Sáb' }
];

const CATEGORIES = [
  { value: 'BURGER', label: 'Hambúrgueres' },
  { value: 'CHICKEN', label: 'Frango' },
  { value: 'COMBO', label: 'Combos' },
  { value: 'SIDE', label: 'Acompanhamentos' },
  { value: 'DRINK', label: 'Bebidas' },
  { value: 'DESSERT', label: 'Sobremesas' }
];

const ORDER_STATUS_DISPLAY = {
  PLACED: { label: 'Novo', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20', dot: 'bg-[#1e3a5f]' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20', dot: 'bg-[#1e3a5f]' },
  PREPARING: { label: 'Preparando', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
  READY: { label: 'Pronto', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
  READY_FOR_PICKUP: { label: 'Pronto p/ Retirada', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
  OUT_FOR_DELIVERY: { label: 'Em Entrega', color: 'bg-[#1e3a5f]/30 text-[#1e3a5f] border-[#1e3a5f]/40', dot: 'bg-[#1e3a5f]' },
  DELIVERED: { label: 'Entregue', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]/60 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/40' },
  COMPLETED: { label: 'Finalizado', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]/60 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/40' },
  CANCELLED: { label: 'Cancelado', color: 'bg-[#1e3a5f]/5 text-[#1e3a5f]/40 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/30' }
};

const PICKUP_STATUS_DISPLAY = {
  ...ORDER_STATUS_DISPLAY,
  READY: { label: 'Pronto p/ Retirada', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
  OUT_FOR_DELIVERY: { label: 'Pronto p/ Retirada', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
  DELIVERED: { label: 'Retirado', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]/60 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/40' }
};

// FUNÇÕES AUXILIARES

const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const formatFullDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatDateBR = (timestamp) => timestamp ? new Date(Number(timestamp)).toLocaleDateString('pt-BR') : '-';
const formatCPF = (cpf) => cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const formatPhone = (phone) => phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
const getCategoryLabel = (value) => CATEGORIES.find(c => c.value === value)?.label || value;
const getDayLabel = (value) => DAYS_OF_WEEK.find(d => d.value === value)?.label || value;
const getStatusDisplay = (status, deliveryType) => deliveryType === 'PICKUP' ? PICKUP_STATUS_DISPLAY[status] || ORDER_STATUS_DISPLAY[status] : ORDER_STATUS_DISPLAY[status];
const isCouponExpired = (coupon) => !coupon.hasNoEndDate && new Date(Number(coupon.endDate)) < new Date();
const isCampaignActive = (campaign) => {
  const now = new Date();
  const start = new Date(Number(campaign.startDate));
  if (!campaign.isActive || now < start) return false;
  if (campaign.hasNoEndDate) return true;
  return now <= new Date(Number(campaign.endDate));
};
const formatSchedule = (schedule) => {
  if (!schedule) return null;
  const days = schedule.daysOfWeek?.map(getDayLabel).join(', ') || 'Todos os dias';
  return `${schedule.startTime} - ${schedule.endTime} (${days})`;
};

// ÍCONES (mantidos igual ao original, apenas organizados)

// (todos os ícones SVG do código original foram mantidos, omitidos aqui para brevidade)

// SUBCOMPONENTES

const Toast = ({ feedback, onClose }) => {
  if (!feedback.show) return null;
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border backdrop-blur-xl ${
        feedback.type === 'success' ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-red-500 text-white border-red-500'
      }`}>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          {feedback.type === 'success' ? <CheckIcon className="w-5 h-5" /> : <CloseIcon className="w-5 h-5" />}
        </div>
        <span className="font-medium">{feedback.message}</span>
        <button onClick={onClose} className="ml-2 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ConfirmModal = ({ confirmModal, onConfirm, onCancel }) => {
  if (!confirmModal.show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        <div className="p-6 border-b border-[#1e3a5f]/10">
          <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertIcon className="w-7 h-7 text-[#1e3a5f]" />
          </div>
          <h3 className="text-xl font-bold text-[#1e3a5f] text-center">{confirmModal.title}</h3>
          <p className="text-[#1e3a5f]/60 text-center mt-2">{confirmModal.message}</p>
        </div>
        <div className="p-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f]">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick} className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 relative text-sm ${
    active ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20' : 'bg-white text-[#1e3a5f]/60 hover:bg-[#1e3a5f]/5 border border-[#1e3a5f]/10'
  }`}>
    <span className={active ? 'text-white' : ''}>{icon}</span>
    {label}
    {badge > 0 && (
      <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'}`}>{badge}</span>
    )}
  </button>
);

const MetricCard = ({ icon, title, value, filterSelect, filterValue, onFilterChange }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5 relative overflow-hidden group hover:shadow-lg transition-all">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1e3a5f]/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">{icon}</div>
      {filterSelect && (
        <select value={filterValue} onChange={onFilterChange} className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-medium rounded-lg px-3 py-2 outline-none">
          <option value="DAY">Hoje</option><option value="WEEK">Semana</option><option value="MONTH">Mês</option><option value="YEAR">Ano</option><option value="ALL">Total</option>
        </select>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-[#1e3a5f]">{value}</p>
    </div>
  </div>
);

// Componente OrderCard (extraído para reduzir complexidade)
const OrderCard = ({ order, onUpdateStatus, onAssignCourier, onConfirmModal }) => {
  const isPickup = order.deliveryType === 'PICKUP';
  const statusDisplay = getStatusDisplay(order.status, order.deliveryType);
  const isCompleted = ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status);
  const isNew = ['PLACED', 'PENDING', 'CONFIRMED'].includes(order.status);
  const isPreparing = order.status === 'PREPARING';
  const isDelivery = order.deliveryType === 'DELIVERY';

  const handleAction = (action, ...args) => {
    if (action === 'status') onUpdateStatus(order.id, ...args);
    else if (action === 'assign') onAssignCourier(order);
    else if (action === 'cancel') onConfirmModal('Cancelar Pedido', 'Tem certeza que deseja cancelar este pedido?', () => onUpdateStatus(order.id, 'CANCELLED', isPickup));
  };

  return (
    <div className={`bg-white rounded-2xl border flex flex-col h-full transition-all duration-300 overflow-hidden ${
      isNew ? 'border-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20 ring-2 ring-[#1e3a5f]/20' : isCompleted ? 'border-[#1e3a5f]/10 opacity-70 hover:opacity-100' : 'border-[#1e3a5f]/20 shadow-sm hover:shadow-lg hover:-translate-y-1'
    }`}>
      <div className={`px-5 py-4 border-b flex justify-between items-center ${isNew ? 'bg-gradient-to-r from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-[#1e3a5f]/20' : 'bg-[#faf8f5] border-[#1e3a5f]/5'}`}>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${statusDisplay.dot} ${isNew ? 'animate-pulse' : ''}`}></span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1e3a5f] text-sm">#{order.id.slice(-6).toUpperCase()}</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${isPickup ? 'bg-[#1e3a5f]/20 text-[#1e3a5f]' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]/70'}`}>
              {isPickup ? <StoreIcon className="w-2.5 h-2.5" /> : <MotorcycleIcon className="w-2.5 h-2.5" />}
              {isPickup ? 'Retirada' : 'Entrega'}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${statusDisplay.color}`}>{statusDisplay.label}</span>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div><p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Cliente</p><p className="font-semibold text-[#1e3a5f]">{order.user?.name || 'Cliente'}</p></div>
          <div className="text-right"><p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Horário</p><p className="text-xs font-medium text-[#1e3a5f] bg-[#1e3a5f]/5 px-2 py-1 rounded-lg">{formatDate(order.createdAt)}</p></div>
        </div>
        {order.courier && isDelivery && (
          <div className="bg-[#1e3a5f]/5 rounded-xl p-3 mb-4 border border-[#1e3a5f]/10">
            <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Entregador</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center"><MotorcycleIcon className="w-4 h-4 text-white" /></div>
              <div><p className="font-semibold text-[#1e3a5f] text-sm">{order.courier.firstName} {order.courier.lastName}</p><p className="text-xs text-[#1e3a5f]/50">{formatPhone(order.courier.phone)}</p></div>
            </div>
          </div>
        )}
        <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-5 flex-grow border border-[#1e3a5f]/10">
          <ul className="space-y-2">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-center text-sm">
                <span className="bg-[#1e3a5f] text-white font-bold text-xs px-2 py-0.5 rounded min-w-[28px] text-center">{item.quantity}x</span>
                <span className="text-[#1e3a5f]/70 font-medium">{item.name || item.product?.name || 'Item'}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-xs font-medium text-[#1e3a5f]/40">Total</span>
          <p className={`font-bold text-2xl ${isCompleted ? 'text-[#1e3a5f]/40' : 'text-[#1e3a5f]'}`}>
            <span className="text-sm mr-0.5 opacity-60">R$</span>{order.total.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="space-y-2 mt-auto">
          {['PLACED', 'PENDING', 'CONFIRMED'].includes(order.status) && (
            <button onClick={() => handleAction('status', 'PREPARING', isPickup)} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2">
              <FireIcon className="w-4 h-4" /> Aceitar e Preparar
            </button>
          )}
          {isPreparing && isDelivery && !order.courier && (
            <button onClick={() => handleAction('assign')} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2">
              <MotorcycleIcon className="w-4 h-4" /> Atribuir Entregador
            </button>
          )}
          {isPreparing && isPickup && (
            <button onClick={() => handleAction('status', 'OUT_FOR_DELIVERY', true)} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2">
              <BellIcon className="w-4 h-4" /> Pronto para Retirada
            </button>
          )}
          {isPreparing && isDelivery && order.courier && (
            <button onClick={() => handleAction('status', 'OUT_FOR_DELIVERY', false)} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2">
              <RocketIcon className="w-4 h-4" /> Saiu para Entrega
            </button>
          )}
          {['READY', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(order.status) && (
            <button onClick={() => handleAction('status', 'DELIVERED', isPickup)} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2">
              <CheckIcon className="w-4 h-4" /> {isPickup ? 'Confirmar Retirada' : 'Confirmar Entrega'}
            </button>
          )}
          {!isCompleted && (
            <button onClick={() => handleAction('cancel')} className="w-full bg-white text-[#1e3a5f]/60 border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f] font-medium py-2.5 rounded-xl transition-all text-sm">
              Cancelar Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Estados principais
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [couriersMetrics, setCouriersMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [expandedHistory, setExpandedHistory] = useState({});
  const [revenueFilter, setRevenueFilter] = useState('DAY');
  const [courierPeriodFilter, setCourierPeriodFilter] = useState('MONTH');

  // Estados de modais
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // Estados de cupons e cashback
  const [coupons, setCoupons] = useState([]);
  const [cashbackSettings, setCashbackSettings] = useState(null);
  const [cashbackRules, setCashbackRules] = useState([]);
  const [cashbackCampaigns, setCashbackCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [couponsSubTab, setCouponsSubTab] = useState('COUPONS');

  // Estados de modais específicos (banner, courier, cupom, etc.) - omitidos para brevidade, mantidos do original

  // Funções de feedback e confirmação
  const showFeedback = useCallback((type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 4000);
  }, []);

  const showConfirmModal = useCallback((title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  }, []);

  // Requisições GraphQL (encapsuladas em objeto para organização)
  const api = useMemo(() => ({
    async request(query, variables = {}) {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query, variables })
      });
      const result = await res.json();
      if (result.errors) throw new Error(result.errors[0].message);
      return result.data;
    },
    async fetchOrdersAndBanners() {
      const data = await this.request(`
        query {
          orders { id total status createdAt deliveryType shippingFee user { name email } items { name quantity price product { name } } courier { id firstName lastName phone } }
          banners { id title subtitle imageUrl }
          couriers(onlyActive: false) { id firstName lastName phone email cpf isActive totalDeliveries totalEarnings vehicle { brand model plate year color } }
        }
      `);
      setOrders(data.orders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      setBanners(data.banners || []);
      setCouriers(data.couriers || []);
    },
    async fetchCouponsAndCashback() {
      const data = await this.request(`
        query {
          coupons { id code name description discountType discountValue maxDiscountValue minOrderValue applicableCategories customerType maxTotalUses maxUsesPerUser totalUsedCount allowWithCashback startDate endDate hasNoEndDate schedule { startTime endTime daysOfWeek } isActive }
          cashbackSettings { id isEnabled defaultPercentage minRedeemValue maxRedeemPercentage maxRedeemValue defaultExpirationDays displayMessage }
          cashbackRules { id name description type percentage categories minOrderValue maxCashbackValue expirationDays allowEarnOnCashbackPayment allowEarnWithCoupon priority isActive }
          cashbackCampaigns { id name description multiplier fixedPercentage categories maxCashbackValue maxUsesPerUser startDate endDate hasNoEndDate schedule { startTime endTime daysOfWeek } isActive }
          products(onlyAvailable: false) { id name category price isAvailable }
        }
      `);
      setCoupons(data.coupons || []);
      setCashbackSettings(data.cashbackSettings);
      setCashbackRules(data.cashbackRules || []);
      setCashbackCampaigns(data.cashbackCampaigns || []);
      setProducts(data.products || []);
    },
    async fetchCouriersMetrics(period) {
      const data = await this.request(`query GetCouriersMetrics($period: String!) { couriersMetrics(period: $period) { totalCouriers activeCouriers totalDeliveries totalEarnings periodDeliveries periodEarnings courierMetrics { courierId courierName deliveries earnings } } }`, { period });
      setCouriersMetrics(data.couriersMetrics);
    },
    async fetchAvailableCouriers() {
      const data = await this.request(`query { availableCouriers { id firstName lastName phone vehicle { brand model plate color } } }`);
      return data.availableCouriers || [];
    },
    async fetchCourierDeliveries(courierId, period) {
      const data = await this.request(`query GetCourierDeliveries($courierId: ID!, $period: String!) { courierDeliveries(courierId: $courierId, period: $period) { id total shippingFee status createdAt updatedAt user { name } deliveryAddress { street number neighborhood } } }`, { courierId, period });
      return data.courierDeliveries || [];
    },
    async updateOrderStatus(orderId, status) {
      return this.request(`mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) { updateOrderStatus(id: $id, status: $status) { id status } }`, { id: orderId, status });
    },
    async assignCourier(orderId, courierId) {
      return this.request(`mutation AssignCourier($orderId: ID!, $courierId: ID!) { assignCourier(orderId: $orderId, courierId: $courierId) { id status courier { id firstName lastName } } }`, { orderId, courierId });
    }
    // ... outras funções de mutation (banner, courier, cupom, cashback) seguiriam o mesmo padrão
  }), []);

  // Effects
  useEffect(() => { api.fetchOrdersAndBanners().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (activeTab === 'COURIERS') api.fetchCouriersMetrics(courierPeriodFilter); }, [activeTab, courierPeriodFilter]);
  useEffect(() => { if (activeTab === 'COUPONS_CASHBACK') api.fetchCouponsAndCashback(); }, [activeTab]);

  // Funções de manipulação (simplificadas)
  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus, isPickup = false) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showFeedback('success', { PREPARING: 'Pedido aceito e em preparação!', OUT_FOR_DELIVERY: isPickup ? 'Pedido pronto para retirada!' : 'Pedido saiu para entrega!', DELIVERED: isPickup ? 'Retirada confirmada!' : 'Entrega confirmada!', CANCELLED: 'Pedido cancelado.' }[newStatus] || 'Status atualizado!');
      api.fetchOrdersAndBanners();
    } catch (err) { showFeedback('error', 'Erro ao atualizar status: ' + err.message); }
  }, [api, showFeedback]);

  const handleAssignCourier = useCallback(async (orderId, courierId) => {
    try {
      await api.assignCourier(orderId, courierId);
      showFeedback('success', 'Entregador atribuído com sucesso!');
      api.fetchOrdersAndBanners();
    } catch (err) { showFeedback('error', 'Erro ao atribuir entregador: ' + err.message); }
  }, [api, showFeedback]);

  // ... outras funções (banner, courier, cupom, cashback) seguem o mesmo padrão (omitidas para brevidade)

  // Renderização condicional
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // Renderização principal
  return (
    <div className="min-h-screen flex flex-col relative pb-28 md:pb-0 font-sans" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-[#faf8f5]/85 pointer-events-none"></div>
      <div className="relative z-10 h-20"></div>

      <Toast feedback={feedback} onClose={() => setFeedback({ show: false, type: '', message: '' })} />
      <ConfirmModal confirmModal={confirmModal} onConfirm={confirmModal.onConfirm} onCancel={closeConfirmModal} />

      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center"><SettingsIcon className="w-5 h-5 text-white" /></div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Painel</h1>
            </div>
            <p className="text-[#1e3a5f]/50 text-sm">Acompanhe os pedidos e métricas</p>
          </div>
          <button onClick={() => api.fetchOrdersAndBanners()} className="bg-white border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 text-[#1e3a5f] font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all">
            <RefreshIcon className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {/* Tabs */}
        <nav className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'OVERVIEW', label: 'Visão Geral', icon: <ChartIcon className="w-4 h-4" /> },
            { key: 'ORDERS', label: 'Pedidos', badge: orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length, icon: <OrderIcon className="w-4 h-4" /> },
            { key: 'COURIERS', label: 'Entregadores', badge: couriers.filter(c => c.isActive).length, icon: <MotorcycleIcon className="w-4 h-4" /> },
            { key: 'COUPONS_CASHBACK', label: 'Cupons & Cashback', icon: <TicketIcon className="w-4 h-4" /> },
            { key: 'BANNERS', label: 'Banners', icon: <ImageIcon className="w-4 h-4" /> }
          ].map(tab => (
            <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} icon={tab.icon} label={tab.label} badge={tab.badge || 0} />
          ))}
        </nav>

        {/* Conteúdo das abas (simplificado, mantendo a mesma estrutura do original) */}
        {activeTab === 'OVERVIEW' && <OverviewTab orders={orders} revenueFilter={revenueFilter} setRevenueFilter={setRevenueFilter} onUpdateStatus={handleUpdateStatus} onAssignCourier={openAssignCourierModal} />}
        {activeTab === 'ORDERS' && <OrdersTab orders={orders} expandedHistory={expandedHistory} setExpandedHistory={setExpandedHistory} onUpdateStatus={handleUpdateStatus} onAssignCourier={openAssignCourierModal} />}
        {activeTab === 'COURIERS' && <CouriersTab couriers={couriers} couriersMetrics={couriersMetrics} courierPeriodFilter={courierPeriodFilter} setCourierPeriodFilter={setCourierPeriodFilter} onEdit={openEditCourierModal} onToggleActive={handleToggleCourierActive} onDelete={handleDeleteCourier} onViewDetails={openCourierDetail} />}
        {activeTab === 'COUPONS_CASHBACK' && <CouponsCashbackTab />}
        {activeTab === 'BANNERS' && <BannersTab banners={banners} onEdit={openEditBannerModal} onDelete={handleDeleteBanner} onCreate={openCreateBannerModal} />}
      </main>
    </div>
  );
}
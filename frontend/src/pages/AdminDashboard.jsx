import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

export default function AdminDashboard() {
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
  
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '' });

  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState(null);
  const [courierForm, setCourierForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    cpf: '',
    vehicle: { brand: '', model: '', plate: '', year: '', color: '' }
  });

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [courierDeliveries, setCourierDeliveries] = useState([]);
  const [isCourierDetailOpen, setIsCourierDetailOpen] = useState(false);

  const [isAssignCourierModalOpen, setIsAssignCourierModalOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [availableCouriers, setAvailableCouriers] = useState([]);

  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const navigate = useNavigate();

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 4000);
  };

  const showConfirmModal = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  useEffect(() => {
    if (activeTab === 'COURIERS') {
      fetchCouriersMetrics();
    }
  }, [activeTab, courierPeriodFilter]);

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
                id total status createdAt deliveryType shippingFee
                user { name email }
                items { name quantity price product { name } }
                courier { id firstName lastName phone }
              }
              banners { id title subtitle imageUrl }
              couriers(onlyActive: false) {
                id firstName lastName phone email cpf isActive
                totalDeliveries totalEarnings
                vehicle { brand model plate year color }
              }
            }
          `
        })
      });
      const result = await response.json();
      
      if (result.errors) throw new Error(result.errors[0].message);
      
      setOrders(result.data.orders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      setBanners(result.data.banners || []);
      setCouriers(result.data.couriers || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriersMetrics = async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          query: `
            query GetCouriersMetrics($period: String!) {
              couriersMetrics(period: $period) {
                totalCouriers
                activeCouriers
                totalDeliveries
                totalEarnings
                periodDeliveries
                periodEarnings
                courierMetrics {
                  courierId
                  courierName
                  deliveries
                  earnings
                }
              }
            }
          `,
          variables: { period: courierPeriodFilter }
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setCouriersMetrics(result.data.couriersMetrics);
    } catch (err) {
      console.error('Erro ao buscar metricas de entregadores:', err);
    }
  };

  const fetchAvailableCouriers = async () => {
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
              availableCouriers {
                id firstName lastName phone
                vehicle { brand model plate color }
              }
            }
          `
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setAvailableCouriers(result.data.availableCouriers || []);
    } catch (err) {
      console.error('Erro ao buscar entregadores disponiveis:', err);
    }
  };

  const fetchCourierDeliveries = async (courierId) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          query: `
            query GetCourierDeliveries($courierId: ID!, $period: String!) {
              courierDeliveries(courierId: $courierId, period: $period) {
                id total shippingFee status createdAt updatedAt
                user { name }
                deliveryAddress { street number neighborhood }
              }
            }
          `,
          variables: { courierId, period: courierPeriodFilter }
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setCourierDeliveries(result.data.courierDeliveries || []);
    } catch (err) {
      console.error('Erro ao buscar entregas do entregador:', err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, isPickup = false) => {
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
      
      const statusMessages = {
        PREPARING: 'Pedido aceito e em preparacao!',
        OUT_FOR_DELIVERY: isPickup ? 'Pedido pronto para retirada!' : 'Pedido saiu para entrega!',
        DELIVERED: isPickup ? 'Retirada confirmada com sucesso!' : 'Entrega confirmada com sucesso!',
        CANCELLED: 'Pedido cancelado.'
      };
      showFeedback('success', statusMessages[newStatus] || 'Status atualizado!');
      fetchData(); 
    } catch (err) {
      showFeedback('error', 'Erro ao atualizar status: ' + err.message);
    }
  };

  const assignCourierToOrder = async (orderId, courierId) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          query: `mutation AssignCourier($orderId: ID!, $courierId: ID!) { 
            assignCourier(orderId: $orderId, courierId: $courierId) { 
              id status 
              courier { id firstName lastName }
            } 
          }`,
          variables: { orderId, courierId }
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      showFeedback('success', 'Entregador atribuido com sucesso!');
      setIsAssignCourierModalOpen(false);
      setOrderToAssign(null);
      fetchData(); 
    } catch (err) {
      showFeedback('error', 'Erro ao atribuir entregador: ' + err.message);
    }
  };

  // Banner handlers
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

  const openCreateBannerModal = () => {
    setEditingBanner(null);
    setBannerForm({ title: '', subtitle: '', imageUrl: '' });
    setIsBannerModalOpen(true);
  };

  const openEditBannerModal = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || ''
    });
    setIsBannerModalOpen(true);
  };

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBanner(null);
    setBannerForm({ title: '', subtitle: '', imageUrl: '' });
  };

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
        showFeedback('success', 'Banner atualizado com sucesso!');
      } else {
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
        showFeedback('success', 'Banner publicado com sucesso!');
      }
      closeBannerModal();
      fetchData();
    } catch (err) { 
      showFeedback('error', 'Erro ao salvar banner: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    showConfirmModal(
      'Excluir Banner',
      'Tem certeza que deseja excluir este banner? Esta acao nao pode ser desfeita.',
      async () => {
        try {
          await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ query: `mutation { deleteBanner(id: "${id}") }` })
          });
          showFeedback('success', 'Banner excluido com sucesso!');
          fetchData();
        } catch (err) {
          showFeedback('error', 'Erro ao excluir banner.');
        }
        closeConfirmModal();
      }
    );
  };

  // Courier handlers
  const openCreateCourierModal = () => {
    setEditingCourier(null);
    setCourierForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      cpf: '',
      vehicle: { brand: '', model: '', plate: '', year: '', color: '' }
    });
    setIsCourierModalOpen(true);
  };

  const openEditCourierModal = (courier) => {
    setEditingCourier(courier);
    setCourierForm({
      firstName: courier.firstName,
      lastName: courier.lastName,
      phone: courier.phone,
      email: courier.email,
      cpf: courier.cpf,
      vehicle: {
        brand: courier.vehicle.brand,
        model: courier.vehicle.model,
        plate: courier.vehicle.plate,
        year: courier.vehicle.year.toString(),
        color: courier.vehicle.color
      }
    });
    setIsCourierModalOpen(true);
  };

  const closeCourierModal = () => {
    setIsCourierModalOpen(false);
    setEditingCourier(null);
    setCourierForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      cpf: '',
      vehicle: { brand: '', model: '', plate: '', year: '', color: '' }
    });
  };

  const handleSaveCourier = async (e) => {
    e.preventDefault();
    try {
      const input = {
        firstName: courierForm.firstName,
        lastName: courierForm.lastName,
        phone: courierForm.phone,
        email: courierForm.email,
        cpf: courierForm.cpf,
        vehicle: {
          brand: courierForm.vehicle.brand,
          model: courierForm.vehicle.model,
          plate: courierForm.vehicle.plate.toUpperCase(),
          year: parseInt(courierForm.vehicle.year),
          color: courierForm.vehicle.color
        }
      };

      if (editingCourier) {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            query: `mutation UpdateCourier($id: ID!, $input: UpdateCourierInput!) { 
              updateCourier(id: $id, input: $input) { id firstName lastName } 
            }`,
            variables: { id: editingCourier.id, input }
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        showFeedback('success', 'Entregador atualizado com sucesso!');
      } else {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            query: `mutation CreateCourier($input: CourierInput!) { createCourier(input: $input) { id } }`,
            variables: { input }
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        showFeedback('success', 'Entregador cadastrado com sucesso!');
      }
      closeCourierModal();
      fetchData();
      fetchCouriersMetrics();
    } catch (err) { 
      showFeedback('error', 'Erro ao salvar entregador: ' + err.message);
    }
  };

  const handleToggleCourierActive = async (id, currentStatus) => {
    const action = currentStatus ? 'desativar' : 'ativar';
    showConfirmModal(
      `${currentStatus ? 'Desativar' : 'Ativar'} Entregador`,
      `Tem certeza que deseja ${action} este entregador?`,
      async () => {
        try {
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ 
              query: `mutation { toggleCourierActive(id: "${id}") { id isActive } }` 
            })
          });
          const result = await response.json();
          if (result.errors) throw new Error(result.errors[0].message);
          showFeedback('success', `Entregador ${currentStatus ? 'desativado' : 'ativado'} com sucesso!`);
          fetchData();
          fetchCouriersMetrics();
        } catch (err) {
          showFeedback('error', err.message);
        }
        closeConfirmModal();
      }
    );
  };

  const handleDeleteCourier = async (id) => {
    showConfirmModal(
      'Excluir Entregador',
      'Tem certeza que deseja excluir este entregador? Esta acao nao pode ser desfeita.',
      async () => {
        try {
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ query: `mutation { deleteCourier(id: "${id}") }` })
          });
          const result = await response.json();
          if (result.errors) throw new Error(result.errors[0].message);
          showFeedback('success', 'Entregador excluido com sucesso!');
          fetchData();
          fetchCouriersMetrics();
        } catch (err) {
          showFeedback('error', err.message);
        }
        closeConfirmModal();
      }
    );
  };

  const openCourierDetail = async (courier) => {
    setSelectedCourier(courier);
    await fetchCourierDeliveries(courier.id);
    setIsCourierDetailOpen(true);
  };

  const closeCourierDetail = () => {
    setIsCourierDetailOpen(false);
    setSelectedCourier(null);
    setCourierDeliveries([]);
  };

  const openAssignCourierModal = async (order) => {
    setOrderToAssign(order);
    await fetchAvailableCouriers();
    setIsAssignCourierModalOpen(true);
  };

  const closeAssignCourierModal = () => {
    setIsAssignCourierModalOpen(false);
    setOrderToAssign(null);
    setAvailableCouriers([]);
  };

  const toggleHistory = (monthYear) => setExpandedHistory(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
  
  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

  const formatFullDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const formatCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const getStatusDisplay = (status, deliveryType = 'DELIVERY') => {
    const isPickup = deliveryType === 'PICKUP';
    const statusMap = {
      PLACED: { label: 'Novo', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20', dot: 'bg-[#1e3a5f]' },
      CONFIRMED: { label: 'Confirmado', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20', dot: 'bg-[#1e3a5f]' },
      PENDING: { label: 'Novo', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20', dot: 'bg-[#1e3a5f]' },
      PREPARING: { label: 'Preparando', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
      READY: { label: isPickup ? 'Pronto p/ Retirada' : 'Pronto', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30', dot: 'bg-[#1e3a5f]' },
      OUT_FOR_DELIVERY: { label: isPickup ? 'Pronto p/ Retirada' : 'Em Entrega', color: 'bg-[#1e3a5f]/30 text-[#1e3a5f] border-[#1e3a5f]/40', dot: 'bg-[#1e3a5f]' },
      DELIVERED: { label: isPickup ? 'Retirado' : 'Entregue', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]/60 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/40' },
      COMPLETED: { label: 'Finalizado', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]/60 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/40' },
      CANCELLED: { label: 'Cancelado', color: 'bg-[#1e3a5f]/5 text-[#1e3a5f]/40 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/30' }
    };
    return statusMap[status] || { label: status, color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]/50 border-[#1e3a5f]/10', dot: 'bg-[#1e3a5f]/30' };
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

  const getPeriodLabel = (period) => {
    const labels = { DAY: 'Hoje', WEEK: 'Esta Semana', MONTH: 'Este Mes', YEAR: 'Este Ano' };
    return labels[period] || period;
  };

  const renderOrderCard = (order) => {
    const isPickup = order.deliveryType === 'PICKUP';
    const statusDisplay = getStatusDisplay(order.status, order.deliveryType);
    const isCompleted = order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'CANCELLED';
    const isNew = order.status === 'PLACED' || order.status === 'PENDING' || order.status === 'CONFIRMED';
    const isFinished = order.status === 'DELIVERED' || order.status === 'COMPLETED';
    const isPreparing = order.status === 'PREPARING';
    const isDelivery = order.deliveryType === 'DELIVERY';

    return (
      <div 
        key={order.id} 
        className={`bg-white rounded-2xl border flex flex-col h-full transition-all duration-300 overflow-hidden ${
          isNew 
            ? 'border-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20 ring-2 ring-[#1e3a5f]/20' 
            : isCompleted 
              ? 'border-[#1e3a5f]/10 opacity-70 hover:opacity-100' 
              : 'border-[#1e3a5f]/20 shadow-sm hover:shadow-lg hover:shadow-[#1e3a5f]/10 hover:-translate-y-1'
        }`}
      >
        <div className={`px-5 py-4 border-b flex justify-between items-center ${
          isNew ? 'bg-gradient-to-r from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-[#1e3a5f]/20' : 'bg-[#faf8f5] border-[#1e3a5f]/5'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${statusDisplay.dot} ${isNew ? 'animate-pulse' : ''}`}></span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1e3a5f] text-sm">#{order.id.slice(-6).toUpperCase()}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${
                isPickup ? 'bg-[#1e3a5f]/20 text-[#1e3a5f]' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]/70'
              }`}>
                {isPickup ? <><StoreIcon className="w-2.5 h-2.5" />Retirada</> : <><MotorcycleIcon className="w-2.5 h-2.5" />Entrega</>}
              </span>
            </div>
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
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Horario</p>
              <p className="text-xs font-medium text-[#1e3a5f] bg-[#1e3a5f]/5 px-2 py-1 rounded-lg">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {order.courier && isDelivery && (
            <div className="bg-[#1e3a5f]/5 rounded-xl p-3 mb-4 border border-[#1e3a5f]/10">
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Entregador</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                  <MotorcycleIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#1e3a5f] text-sm">{order.courier.firstName} {order.courier.lastName}</p>
                  <p className="text-xs text-[#1e3a5f]/50">{formatPhone(order.courier.phone)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-5 flex-grow border border-[#1e3a5f]/10">
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
                onClick={() => updateOrderStatus(order.id, 'PREPARING', isPickup)} 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <FireIcon className="w-4 h-4" /> Aceitar e Preparar
              </button>
            )}
            
            {isPreparing && isDelivery && !order.courier && (
              <button 
                onClick={() => openAssignCourierModal(order)} 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <MotorcycleIcon className="w-4 h-4" /> Atribuir Entregador
              </button>
            )}

            {isPreparing && isPickup && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY', isPickup)} 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <BellIcon className="w-4 h-4" /> Pronto para Retirada
              </button>
            )}

            {isPreparing && isDelivery && order.courier && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY', isPickup)} 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RocketIcon className="w-4 h-4" /> Saiu para Entrega
              </button>
            )}
            
            {(order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY') && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'DELIVERED', isPickup)} 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-4 h-4" /> {isPickup ? 'Confirmar Retirada' : 'Confirmar Entrega'}
              </button>
            )}

            {isFinished && (
              <button 
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ReceiptIcon className="w-4 h-4" /> Gerar Nota Fiscal
              </button>
            )}
            
            {!isCompleted && (
              <button 
                onClick={() => showConfirmModal(
                  'Cancelar Pedido',
                  'Tem certeza que deseja cancelar este pedido?',
                  () => { updateOrderStatus(order.id, 'CANCELLED', isPickup); closeConfirmModal(); }
                )}
                className="w-full bg-white text-[#1e3a5f]/60 border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f] font-medium py-2.5 rounded-xl transition-all text-sm"
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCourierCard = (courier) => {
    const metrics = couriersMetrics?.courierMetrics?.find(m => m.courierId === courier.id);
    
    return (
      <div 
        key={courier.id} 
        className={`bg-white rounded-2xl border flex flex-col transition-all duration-300 overflow-hidden ${
          courier.isActive 
            ? 'border-[#1e3a5f]/20 shadow-sm hover:shadow-lg hover:shadow-[#1e3a5f]/10 hover:-translate-y-1' 
            : 'border-[#1e3a5f]/10 opacity-60'
        }`}
      >
        <div className={`px-5 py-4 border-b flex justify-between items-center ${
          courier.isActive ? 'bg-[#faf8f5] border-[#1e3a5f]/5' : 'bg-[#1e3a5f]/5 border-[#1e3a5f]/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              courier.isActive ? 'bg-[#1e3a5f]' : 'bg-[#1e3a5f]/30'
            }`}>
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#1e3a5f]">{courier.firstName} {courier.lastName}</p>
              <p className="text-xs text-[#1e3a5f]/50">{formatPhone(courier.phone)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
            courier.isActive 
              ? 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20' 
              : 'bg-[#1e3a5f]/5 text-[#1e3a5f]/40 border-[#1e3a5f]/10'
          }`}>
            {courier.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        
        <div className="p-5 flex-grow">
          <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-4 border border-[#1e3a5f]/10">
            <div className="flex items-center gap-2 mb-3">
              <CarIcon className="w-4 h-4 text-[#1e3a5f]" />
              <span className="text-xs font-semibold text-[#1e3a5f]">Veiculo</span>
            </div>
            <p className="font-semibold text-[#1e3a5f]">{courier.vehicle.brand} {courier.vehicle.model}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#1e3a5f]/60">
              <span className="bg-[#1e3a5f]/10 px-2 py-1 rounded font-mono font-bold">{courier.vehicle.plate}</span>
              <span>{courier.vehicle.year}</span>
              <span>{courier.vehicle.color}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1e3a5f]/5 rounded-xl p-3 text-center border border-[#1e3a5f]/10">
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">{getPeriodLabel(courierPeriodFilter)}</p>
              <p className="text-xl font-bold text-[#1e3a5f]">{metrics?.deliveries || 0}</p>
              <p className="text-[10px] text-[#1e3a5f]/40">entregas</p>
            </div>
            <div className="bg-[#1e3a5f]/5 rounded-xl p-3 text-center border border-[#1e3a5f]/10">
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">{getPeriodLabel(courierPeriodFilter)}</p>
              <p className="text-xl font-bold text-[#1e3a5f]">
                <span className="text-xs opacity-60">R$</span>
                {(metrics?.earnings || 0).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-[10px] text-[#1e3a5f]/40">faturado</p>
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-t border-[#1e3a5f]/10">
            <div className="text-center flex-1">
              <p className="text-[10px] text-[#1e3a5f]/40 font-medium">Total Entregas</p>
              <p className="font-bold text-[#1e3a5f]">{courier.totalDeliveries}</p>
            </div>
            <div className="w-px h-8 bg-[#1e3a5f]/10"></div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-[#1e3a5f]/40 font-medium">Total Faturado</p>
              <p className="font-bold text-[#1e3a5f]">
                <span className="text-xs opacity-60">R$</span>
                {courier.totalEarnings.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-2">
          <button 
            onClick={() => openCourierDetail(courier)}
            className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-2.5 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <EyeIcon className="w-4 h-4" /> Ver Detalhes
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => openEditCourierModal(courier)}
              className="flex-1 bg-white text-[#1e3a5f] border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 font-medium py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              <EditIcon className="w-4 h-4" /> Editar
            </button>
            <button 
              onClick={() => handleToggleCourierActive(courier.id, courier.isActive)}
              className={`flex-1 font-medium py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                courier.isActive 
                  ? 'bg-white text-[#1e3a5f]/60 border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5' 
                  : 'bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f]/20'
              }`}
            >
              {courier.isActive ? <><PauseIcon className="w-4 h-4" /> Desativar</> : <><PlayIcon className="w-4 h-4" /> Ativar</>}
            </button>
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

      {feedback.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border backdrop-blur-xl ${
            feedback.type === 'success' ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-[#1e3a5f]/90 text-white border-[#1e3a5f]'
          }`}>
            {feedback.type === 'success' ? (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><CheckIcon className="w-5 h-5" /></div>
            ) : (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><CloseIcon className="w-5 h-5" /></div>
            )}
            <span className="font-medium">{feedback.message}</span>
            <button onClick={() => setFeedback({ show: false, type: '', message: '' })} className="ml-2 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeConfirmModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
            <div className="p-6 border-b border-[#1e3a5f]/10">
              <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertIcon className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] text-center">{confirmModal.title}</h3>
              <p className="text-[#1e3a5f]/60 text-center mt-2">{confirmModal.message}</p>
            </div>
            <div className="p-6 flex gap-3">
              <button onClick={closeConfirmModal} className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors">Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Painel</h1>
            </div>
            <p className="text-[#1e3a5f]/50 text-sm">Acompanhe os pedidos e metricas</p>
          </div>
          
          <button onClick={fetchData} className="bg-white border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 text-[#1e3a5f] font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all hover:shadow-md">
            <RefreshIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        <nav className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'OVERVIEW', label: 'Visao Geral', icon: <ChartIcon /> },
            { key: 'ORDERS', label: 'Pedidos', badge: pendingOrders.length, icon: <OrderIcon /> },
            { key: 'COURIERS', label: 'Entregadores', badge: couriers.filter(c => c.isActive).length, icon: <MotorcycleIcon /> },
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
              <span className={activeTab === tab.key ? 'text-white' : ''}>{tab.icon}</span>
              {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>{tab.badge}</span>
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
          <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 p-8 rounded-2xl text-center">
            <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertIcon className="w-7 h-7 text-[#1e3a5f]" />
            </div>
            <p className="text-[#1e3a5f] font-medium">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1e3a5f]/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                        <DollarIcon className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                      <select value={revenueFilter} onChange={(e) => setRevenueFilter(e.target.value)} className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]/30">
                        <option value="DAY">Hoje</option>
                        <option value="WEEK">Semana</option>
                        <option value="MONTH">Mes</option>
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
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-white" />
                      </div>
                      {pendingOrders.length > 0 && (
                        <span className="flex items-center gap-2 bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-medium">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1e3a5f]/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-[#1e3a5f]" />
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
                        <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-pulse"></span>
                        Pedidos em Andamento
                      </h3>
                      <button onClick={() => setActiveTab('ORDERS')} className="text-sm font-medium text-[#1e3a5f]/50 hover:text-[#1e3a5f] transition-colors">Ver todos</button>
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
                          <div className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl font-semibold text-sm">{monthYear}</div>
                          <div className="h-px flex-grow bg-gradient-to-r from-[#1e3a5f]/20 to-transparent"></div>
                        </div>

                        <div className="space-y-8">
                          {pendingList.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-pulse"></span>
                                Novos Pedidos ({pendingList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{pendingList.map(renderOrderCard)}</div>
                            </div>
                          )}

                          {activeList.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-[#1e3a5f]/70 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#1e3a5f]/60 rounded-full"></span>
                                Em Andamento ({activeList.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{activeList.map(renderOrderCard)}</div>
                            </div>
                          )}

                          {completedList.length > 0 && (
                            <div>
                              <button onClick={() => toggleHistory(monthYear)} className="flex items-center justify-between w-full md:w-auto text-left mb-4 bg-white px-5 py-3 rounded-xl shadow-sm border border-[#1e3a5f]/10 hover:shadow-md transition-all">
                                <h4 className="text-sm font-semibold text-[#1e3a5f]/50 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-[#1e3a5f]/30 rounded-full"></span>
                                  Historico ({completedList.length})
                                </h4>
                                <ChevronIcon className={`w-4 h-4 text-[#1e3a5f]/30 ml-4 transition-transform ${expandedHistory[monthYear] ? 'rotate-180' : ''}`} />
                              </button>
                              {expandedHistory[monthYear] && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">{completedList.map(renderOrderCard)}</div>
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

            {activeTab === 'COURIERS' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#1e3a5f]">Entregadores</h3>
                      <p className="text-sm text-[#1e3a5f]/50 mt-1">Gerencie sua equipe de entregadores</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select value={courierPeriodFilter} onChange={(e) => setCourierPeriodFilter(e.target.value)} className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-[#1e3a5f]/30">
                        <option value="DAY">Hoje</option>
                        <option value="WEEK">Esta Semana</option>
                        <option value="MONTH">Este Mes</option>
                        <option value="YEAR">Este Ano</option>
                      </select>
                      <button onClick={openCreateCourierModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-[#1e3a5f]/20 flex items-center gap-2 text-sm transition-all">
                        <PlusIcon className="w-4 h-4" /> Novo Entregador
                      </button>
                    </div>
                  </div>

                  {couriersMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
                        <div className="flex items-center gap-2 mb-2">
                          <UsersIcon className="w-4 h-4 text-[#1e3a5f]/60" />
                          <span className="text-xs font-medium text-[#1e3a5f]/50">Entregadores</span>
                        </div>
                        <p className="text-2xl font-bold text-[#1e3a5f]">{couriersMetrics.activeCouriers}</p>
                        <p className="text-[10px] text-[#1e3a5f]/40">de {couriersMetrics.totalCouriers} cadastrados</p>
                      </div>
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
                        <div className="flex items-center gap-2 mb-2">
                          <BoxIcon className="w-4 h-4 text-[#1e3a5f]/60" />
                          <span className="text-xs font-medium text-[#1e3a5f]/50">Entregas ({getPeriodLabel(courierPeriodFilter)})</span>
                        </div>
                        <p className="text-2xl font-bold text-[#1e3a5f]">{couriersMetrics.periodDeliveries}</p>
                        <p className="text-[10px] text-[#1e3a5f]/40">{couriersMetrics.totalDeliveries} total</p>
                      </div>
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarIcon className="w-4 h-4 text-[#1e3a5f]/60" />
                          <span className="text-xs font-medium text-[#1e3a5f]/50">Faturamento ({getPeriodLabel(courierPeriodFilter)})</span>
                        </div>
                        <p className="text-2xl font-bold text-[#1e3a5f]">
                          <span className="text-sm opacity-60">R$</span>
                          {couriersMetrics.periodEarnings.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-[10px] text-[#1e3a5f]/40">R$ {couriersMetrics.totalEarnings.toFixed(2).replace('.', ',')} total</p>
                      </div>
                      <div className="bg-[#1e3a5f] rounded-xl p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUpIcon className="w-4 h-4 text-white/60" />
                          <span className="text-xs font-medium text-white/60">Media por Entrega</span>
                        </div>
                        <p className="text-2xl font-bold">
                          <span className="text-sm opacity-60">R$</span>
                          {couriersMetrics.periodDeliveries > 0 ? (couriersMetrics.periodEarnings / couriersMetrics.periodDeliveries).toFixed(2).replace('.', ',') : '0,00'}
                        </p>
                        <p className="text-[10px] text-white/40">{getPeriodLabel(courierPeriodFilter)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {couriers.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5">
                    <MotorcycleIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium mb-4">Nenhum entregador cadastrado</p>
                    <button onClick={openCreateCourierModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all">
                      Cadastrar Primeiro Entregador
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{couriers.map(renderCourierCard)}</div>
                )}
              </div>
            )}

            {activeTab === 'BANNERS' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1e3a5f]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1e3a5f]">Banners Promocionais</h3>
                    <p className="text-sm text-[#1e3a5f]/50 mt-1">Gerencie o carrossel da pagina inicial</p>
                  </div>
                  <button onClick={openCreateBannerModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 flex items-center gap-2 text-sm transition-all">
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
                            <button onClick={() => openEditBannerModal(b)} className="bg-white hover:bg-gray-100 text-[#1e3a5f] w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors" title="Editar banner">
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteBanner(b.id)} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors" title="Excluir banner">
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

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <Modal onClose={closeBannerModal} title={editingBanner ? "Editar Banner" : "Novo Banner"}>
          <form onSubmit={handleSaveBanner} className="space-y-5">
            <div className={`border-2 border-dashed rounded-2xl h-48 flex items-center justify-center relative overflow-hidden transition-all ${bannerForm.imageUrl ? 'border-[#1e3a5f]/20' : 'border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'}`}>
              {bannerForm.imageUrl ? (
                <>
                  <img src={bannerForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-[#1e3a5f]/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-[#1e3a5f] px-4 py-2 rounded-lg font-medium text-sm">Trocar imagem</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-[#1e3a5f]/20 mx-auto mb-2" />
                  <span className="text-sm text-[#1e3a5f]/40">Clique para enviar imagem</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleBannerImageUpload} required={!editingBanner} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <InputField label="Titulo (opcional)" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="Ex: Mega Promocao" />
            <InputField label="Subtitulo (opcional)" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} placeholder="Ex: 50% de desconto" />
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeBannerModal} className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">{editingBanner ? 'Salvar' : 'Publicar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Courier Modal */}
      {isCourierModalOpen && (
        <Modal onClose={closeCourierModal} title={editingCourier ? "Editar Entregador" : "Novo Entregador"}>
          <form onSubmit={handleSaveCourier} className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2"><UserIcon className="w-4 h-4" /> Informacoes Pessoais</h4>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Nome" value={courierForm.firstName} onChange={(e) => setCourierForm({ ...courierForm, firstName: e.target.value })} placeholder="Nome" required />
                <InputField label="Sobrenome" value={courierForm.lastName} onChange={(e) => setCourierForm({ ...courierForm, lastName: e.target.value })} placeholder="Sobrenome" required />
              </div>
              <div className="grid grid-cols-1 gap-3 mt-3">
                <InputField label="Telefone" value={courierForm.phone} onChange={(e) => setCourierForm({ ...courierForm, phone: e.target.value })} placeholder="(00) 00000-0000" required />
                <InputField label="E-mail" type="email" value={courierForm.email} onChange={(e) => setCourierForm({ ...courierForm, email: e.target.value })} placeholder="email@exemplo.com" required />
                <InputField label="CPF" value={courierForm.cpf} onChange={(e) => setCourierForm({ ...courierForm, cpf: e.target.value })} placeholder="000.000.000-00" required />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2"><CarIcon className="w-4 h-4" /> Informacoes do Veiculo</h4>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Marca" value={courierForm.vehicle.brand} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, brand: e.target.value }})} placeholder="Ex: Honda" required />
                <InputField label="Modelo" value={courierForm.vehicle.model} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, model: e.target.value }})} placeholder="Ex: CG 160" required />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <InputField label="Placa" value={courierForm.vehicle.plate} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, plate: e.target.value.toUpperCase() }})} placeholder="ABC1D23" required />
                <InputField label="Ano" type="number" value={courierForm.vehicle.year} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, year: e.target.value }})} placeholder="2024" required />
                <InputField label="Cor" value={courierForm.vehicle.color} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, color: e.target.value }})} placeholder="Preta" required />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeCourierModal} className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">{editingCourier ? 'Salvar' : 'Cadastrar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Courier Detail Modal */}
      {isCourierDetailOpen && selectedCourier && (
        <Modal onClose={closeCourierDetail} title="Detalhes do Entregador">
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#1e3a5f]/10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedCourier.isActive ? 'bg-[#1e3a5f]' : 'bg-[#1e3a5f]/30'}`}>
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#1e3a5f] text-lg">{selectedCourier.firstName} {selectedCourier.lastName}</h3>
                <p className="text-sm text-[#1e3a5f]/50">{formatPhone(selectedCourier.phone)}</p>
                <p className="text-sm text-[#1e3a5f]/50">{selectedCourier.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
                <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">CPF</p>
                <p className="font-semibold text-[#1e3a5f]">{formatCPF(selectedCourier.cpf)}</p>
              </div>
              <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
                <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Status</p>
                <p className={`font-semibold ${selectedCourier.isActive ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40'}`}>{selectedCourier.isActive ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>

            <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
              <div className="flex items-center gap-2 mb-3">
                <CarIcon className="w-4 h-4 text-[#1e3a5f]" />
                <span className="text-sm font-semibold text-[#1e3a5f]">Veiculo</span>
              </div>
              <p className="font-semibold text-[#1e3a5f]">{selectedCourier.vehicle.brand} {selectedCourier.vehicle.model}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#1e3a5f]/60">
                <span className="bg-[#1e3a5f]/10 px-2 py-1 rounded font-mono font-bold">{selectedCourier.vehicle.plate}</span>
                <span>{selectedCourier.vehicle.year}</span>
                <span>{selectedCourier.vehicle.color}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e3a5f] rounded-xl p-4 text-white">
                <p className="text-xs text-white/50 font-medium mb-1">Total de Entregas</p>
                <p className="text-3xl font-bold">{selectedCourier.totalDeliveries}</p>
              </div>
              <div className="bg-[#1e3a5f] rounded-xl p-4 text-white">
                <p className="text-xs text-white/50 font-medium mb-1">Total Faturado</p>
                <p className="text-3xl font-bold"><span className="text-lg opacity-60">R$</span>{selectedCourier.totalEarnings.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-[#1e3a5f]">Entregas - {getPeriodLabel(courierPeriodFilter)}</h4>
                <span className="text-xs text-[#1e3a5f]/50">{courierDeliveries.length} entregas</span>
              </div>
              
              {courierDeliveries.length === 0 ? (
                <div className="text-center py-8 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
                  <BoxIcon className="w-8 h-8 text-[#1e3a5f]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#1e3a5f]/40">Nenhuma entrega no periodo</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {courierDeliveries.map(delivery => (
                    <div key={delivery.id} className="bg-[#1e3a5f]/5 rounded-xl p-3 border border-[#1e3a5f]/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#1e3a5f] text-sm">#{delivery.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-[#1e3a5f]/50">{delivery.user?.name}</p>
                          {delivery.deliveryAddress && (
                            <p className="text-xs text-[#1e3a5f]/40 mt-1">{delivery.deliveryAddress.street}, {delivery.deliveryAddress.number}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1e3a5f]">R$ {delivery.shippingFee?.toFixed(2).replace('.', ',') || '0,00'}</p>
                          <p className="text-[10px] text-[#1e3a5f]/40">{formatFullDate(delivery.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { closeCourierDetail(); openEditCourierModal(selectedCourier); }} className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors flex items-center justify-center gap-2">
                <EditIcon className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => { handleDeleteCourier(selectedCourier.id); closeCourierDetail(); }} className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2">
                <TrashIcon className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Courier Modal */}
      {isAssignCourierModalOpen && orderToAssign && (
        <Modal onClose={closeAssignCourierModal} title="Atribuir Entregador">
          <div className="space-y-4">
            <div className="bg-[#1e3a5f]/5 rounded-xl p-4 border border-[#1e3a5f]/10">
              <p className="text-xs text-[#1e3a5f]/40 font-medium mb-1">Pedido</p>
              <p className="font-bold text-[#1e3a5f]">#{orderToAssign.id.slice(-6).toUpperCase()}</p>
              <p className="text-sm text-[#1e3a5f]/60">{orderToAssign.user?.name}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1e3a5f] mb-3">Selecione um entregador:</p>
              {availableCouriers.length === 0 ? (
                <div className="text-center py-8 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
                  <MotorcycleIcon className="w-8 h-8 text-[#1e3a5f]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#1e3a5f]/40">Nenhum entregador disponivel</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableCouriers.map(courier => (
                    <button
                      key={courier.id}
                      onClick={() => assignCourierToOrder(orderToAssign.id, courier.id)}
                      className="w-full bg-white hover:bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 rounded-xl p-4 transition-all flex items-center gap-4 text-left"
                    >
                      <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
                        <MotorcycleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-[#1e3a5f]">{courier.firstName} {courier.lastName}</p>
                        <p className="text-xs text-[#1e3a5f]/50">{courier.vehicle.brand} {courier.vehicle.model} - {courier.vehicle.plate}</p>
                        <p className="text-xs text-[#1e3a5f]/40">{formatPhone(courier.phone)}</p>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-[#1e3a5f]/30" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={closeAssignCourierModal} className="w-full py-3 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors">Cancelar</button>
          </div>
        </Modal>
      )}

      {/* Footer Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Loja" />
          <NavBtn onClick={() => navigate('/promotions')} icon={<TagIcon />} label="Ofertas" />
          <NavBtn onClick={() => navigate('/admin/products')} icon={<BoxIcon />} label="Produtos" />
          <NavBtn onClick={() => {}} icon={<SettingsIcon />} label="Painel" active />
          <NavBtn onClick={() => navigate('/profile')} icon={<UserIcon />} label="Perfil" />
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        @keyframes slide-down { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
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
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 flex items-center justify-center text-[#1e3a5f]/50 hover:text-[#1e3a5f] transition-all">
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
    <input className="w-full px-4 py-3.5 rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:bg-white outline-none transition-all text-[#1e3a5f] placeholder-[#1e3a5f]/30" {...props} />
  </div>
);

const NavBtn = ({ onClick, icon, label, active }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'}`}>
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

// ICONES SVG
const SettingsIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const ChartIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>);
const OrderIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>);
const BoxIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>);
const ImageIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>);
const DollarIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const ClockIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const PlusIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>);
const RefreshIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>);
const TrashIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>);
const EditIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>);
const ChevronIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>);
const ChevronRightIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>);
const CloseIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>);
const AlertIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>);
const HomeIcon = ({ className = "w-6 h-6" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>);
const TagIcon = ({ className = "w-6 h-6" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>);
const UserIcon = ({ className = "w-6 h-6" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>);
const UsersIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>);
const FireIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>);
const RocketIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path></svg>);
const CheckIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>);
const ReceiptIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path></svg>);
const BellIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>);
const MotorcycleIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 5h8m-4-9v18M5 21a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4z"></path></svg>);
const StoreIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>);
const CarIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>);
const EyeIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>);
const PauseIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const PlayIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const TrendingUpIcon = ({ className = "w-5 h-5" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>);

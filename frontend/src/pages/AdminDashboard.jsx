import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

const DAYS_OF_WEEK = [
  { value: 'SUNDAY', label: 'Dom' },
  { value: 'MONDAY', label: 'Seg' },
  { value: 'TUESDAY', label: 'Ter' },
  { value: 'WEDNESDAY', label: 'Qua' },
  { value: 'THURSDAY', label: 'Qui' },
  { value: 'FRIDAY', label: 'Sex' },
  { value: 'SATURDAY', label: 'Sáb' }
];

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

  const [coupons, setCoupons] = useState([]);
  const [cashbackSettings, setCashbackSettings] = useState(null);
  const [cashbackRules, setCashbackRules] = useState([]);
  const [cashbackCampaigns, setCashbackCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [couponsSubTab, setCouponsSubTab] = useState('COUPONS');

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountValue: '',
    minOrderValue: '',
    applicableCategories: [],
    customerType: 'ALL',
    maxTotalUses: '',
    maxUsesPerUser: '1',
    allowWithCashback: true,
    startDate: '',
    endDate: '',
    hasNoEndDate: false,
    schedule: {
      enabled: false,
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    },
    isActive: true
  });

  const [isCashbackRuleModalOpen, setIsCashbackRuleModalOpen] = useState(false);
  const [editingCashbackRule, setEditingCashbackRule] = useState(null);
  const [cashbackRuleForm, setCashbackRuleForm] = useState({
    name: '',
    description: '',
    type: 'GLOBAL',
    percentage: '',
    categories: [],
    minOrderValue: '',
    maxCashbackValue: '',
    expirationDays: '30',
    allowEarnOnCashbackPayment: false,
    allowEarnWithCoupon: true,
    priority: '0',
    isActive: true
  });

  const [isCashbackCampaignModalOpen, setIsCashbackCampaignModalOpen] = useState(false);
  const [editingCashbackCampaign, setEditingCashbackCampaign] = useState(null);
  const [cashbackCampaignForm, setCashbackCampaignForm] = useState({
    name: '',
    description: '',
    multiplier: '',
    fixedPercentage: '',
    categories: [],
    maxCashbackValue: '',
    maxUsesPerUser: '',
    startDate: '',
    endDate: '',
    hasNoEndDate: false,
    schedule: {
      enabled: false,
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    },
    isActive: true
  });

  const [isCashbackSettingsModalOpen, setIsCashbackSettingsModalOpen] = useState(false);
  const [cashbackSettingsForm, setCashbackSettingsForm] = useState({
    isEnabled: true,
    defaultPercentage: '5',
    minRedeemValue: '5',
    maxRedeemPercentage: '50',
    maxRedeemValue: '',
    defaultExpirationDays: '30',
    displayMessage: ''
  });

  const navigate = useNavigate();

  const CATEGORIES = [
    { value: 'BURGER', label: 'Hambúrgueres' },
    { value: 'CHICKEN', label: 'Frango' },
    { value: 'COMBO', label: 'Combos' },
    { value: 'SIDE', label: 'Acompanhamentos' },
    { value: 'DRINK', label: 'Bebidas' },
    { value: 'DESSERT', label: 'Sobremesas' }
  ];

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

  useEffect(() => {
    if (activeTab === 'COUPONS_CASHBACK') {
      fetchCouponsAndCashback();
    }
  }, [activeTab]);

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

  const fetchCouponsAndCashback = async () => {
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
              coupons {
                id code name description discountType discountValue
                maxDiscountValue minOrderValue applicableCategories
                customerType maxTotalUses maxUsesPerUser totalUsedCount
                allowWithCashback startDate endDate hasNoEndDate
                schedule { startTime endTime daysOfWeek }
                isActive
              }
              cashbackSettings {
                id isEnabled defaultPercentage minRedeemValue
                maxRedeemPercentage maxRedeemValue defaultExpirationDays
                displayMessage
              }
              cashbackRules {
                id name description type percentage categories
                minOrderValue maxCashbackValue expirationDays
                allowEarnOnCashbackPayment allowEarnWithCoupon
                priority isActive
              }
              cashbackCampaigns {
                id name description multiplier fixedPercentage
                categories maxCashbackValue maxUsesPerUser
                startDate endDate hasNoEndDate
                schedule { startTime endTime daysOfWeek }
                isActive
              }
              products(onlyAvailable: false) {
                id name category price isAvailable
              }
            }
          `
        })
      });
      const result = await response.json();
      
      if (result.errors) throw new Error(result.errors[0].message);
      
      setCoupons(result.data.coupons || []);
      setCashbackSettings(result.data.cashbackSettings);
      setCashbackRules(result.data.cashbackRules || []);
      setCashbackCampaigns(result.data.cashbackCampaigns || []);
      setProducts(result.data.products || []);
    } catch (err) {
      console.error('Erro ao buscar cupons e cashback:', err);
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

  const openCreateCouponModal = () => {
    setEditingCoupon(null);
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setCouponForm({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountValue: '',
      minOrderValue: '',
      applicableCategories: [],
      customerType: 'ALL',
      maxTotalUses: '',
      maxUsesPerUser: '1',
      allowWithCashback: true,
      startDate: now.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      hasNoEndDate: false,
      schedule: {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      },
      isActive: true
    });
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxDiscountValue: coupon.maxDiscountValue?.toString() || '',
      minOrderValue: coupon.minOrderValue?.toString() || '',
      applicableCategories: coupon.applicableCategories || [],
      customerType: coupon.customerType,
      maxTotalUses: coupon.maxTotalUses?.toString() || '',
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '1',
      allowWithCashback: coupon.allowWithCashback,
      startDate: new Date(Number(coupon.startDate)).toISOString().split('T')[0],
      endDate: coupon.endDate ? new Date(Number(coupon.endDate)).toISOString().split('T')[0] : '',
      hasNoEndDate: coupon.hasNoEndDate || false,
      schedule: coupon.schedule ? {
        enabled: true,
        startTime: coupon.schedule.startTime || '00:00',
        endTime: coupon.schedule.endTime || '23:59',
        daysOfWeek: coupon.schedule.daysOfWeek || ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      } : {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      },
      isActive: coupon.isActive
    });
    setIsCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setIsCouponModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      const input = {
        code: couponForm.code.toUpperCase(),
        name: couponForm.name,
        description: couponForm.description || null,
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        maxDiscountValue: couponForm.maxDiscountValue ? parseFloat(couponForm.maxDiscountValue) : null,
        minOrderValue: couponForm.minOrderValue ? parseFloat(couponForm.minOrderValue) : 0,
        applicableCategories: couponForm.applicableCategories.length > 0 ? couponForm.applicableCategories : null,
        customerType: couponForm.customerType,
        maxTotalUses: couponForm.maxTotalUses ? parseInt(couponForm.maxTotalUses) : null,
        maxUsesPerUser: parseInt(couponForm.maxUsesPerUser) || 1,
        allowWithCashback: couponForm.allowWithCashback,
        startDate: new Date(couponForm.startDate).toISOString(),
        endDate: couponForm.hasNoEndDate ? null : new Date(couponForm.endDate + 'T23:59:59').toISOString(),
        hasNoEndDate: couponForm.hasNoEndDate,
        schedule: couponForm.schedule.enabled ? {
          startTime: couponForm.schedule.startTime,
          endTime: couponForm.schedule.endTime,
          daysOfWeek: couponForm.schedule.daysOfWeek
        } : null,
        isActive: couponForm.isActive
      };

      if (editingCoupon) {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            query: `mutation UpdateCoupon($id: ID!, $input: CouponInput!) { 
              updateCoupon(id: $id, input: $input) { id code name } 
            }`,
            variables: { id: editingCoupon.id, input }
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        showFeedback('success', 'Cupom atualizado com sucesso!');
      } else {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            query: `mutation CreateCoupon($input: CouponInput!) { createCoupon(input: $input) { id } }`,
            variables: { input }
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        showFeedback('success', 'Cupom criado com sucesso!');
      }
      closeCouponModal();
      fetchCouponsAndCashback();
    } catch (err) { 
      showFeedback('error', 'Erro ao salvar cupom: ' + err.message);
    }
  };

  const handleToggleCouponActive = async (id, currentStatus) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ 
          query: `mutation { toggleCouponActive(id: "${id}") { id isActive } }` 
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      showFeedback('success', `Cupom ${currentStatus ? 'desativado' : 'ativado'}!`);
      fetchCouponsAndCashback();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteCoupon = async (id) => {
    showConfirmModal(
      'Excluir Cupom',
      'Tem certeza que deseja excluir este cupom?',
      async () => {
        try {
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ query: `mutation { deleteCoupon(id: "${id}") }` })
          });
          const result = await response.json();
          if (result.errors) throw new Error(result.errors[0].message);
          showFeedback('success', 'Cupom excluído!');
          fetchCouponsAndCashback();
        } catch (err) {
          showFeedback('error', err.message);
        }
        closeConfirmModal();
      }
    );
  };

  const openCreateCashbackRuleModal = () => {
    setEditingCashbackRule(null);
    setCashbackRuleForm({
      name: '',
      description: '',
      type: 'GLOBAL',
      percentage: '',
      categories: [],
      minOrderValue: '',
      maxCashbackValue: '',
      expirationDays: '30',
      allowEarnOnCashbackPayment: false,
      allowEarnWithCoupon: true,
      priority: '0',
      isActive: true
    });
    setIsCashbackRuleModalOpen(true);
  };

  const openEditCashbackRuleModal = (rule) => {
    setEditingCashbackRule(rule);
    setCashbackRuleForm({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      percentage: rule.percentage.toString(),
      categories: rule.categories || [],
      minOrderValue: rule.minOrderValue?.toString() || '',
      maxCashbackValue: rule.maxCashbackValue?.toString() || '',
      expirationDays: rule.expirationDays?.toString() || '30',
      allowEarnOnCashbackPayment: rule.allowEarnOnCashbackPayment,
      allowEarnWithCoupon: rule.allowEarnWithCoupon,
      priority: rule.priority?.toString() || '0',
      isActive: rule.isActive
    });
    setIsCashbackRuleModalOpen(true);
  };

  const closeCashbackRuleModal = () => {
    setIsCashbackRuleModalOpen(false);
    setEditingCashbackRule(null);
  };

  const handleSaveCashbackRule = async (e) => {
    e.preventDefault();
    try {
      const input = {
        name: cashbackRuleForm.name,
        description: cashbackRuleForm.description || null,
        type: cashbackRuleForm.type,
        percentage: parseFloat(cashbackRuleForm.percentage),
        categories: cashbackRuleForm.categories.length > 0 ? cashbackRuleForm.categories : null,
        minOrderValue: cashbackRuleForm.minOrderValue ? parseFloat(cashbackRuleForm.minOrderValue) : null,
        maxCashbackValue: cashbackRuleForm.maxCashbackValue ? parseFloat(cashbackRuleForm.maxCashbackValue) : null,
        expirationDays: parseInt(cashbackRuleForm.expirationDays) || 30,
        allowEarnOnCashbackPayment: cashbackRuleForm.allowEarnOnCashbackPayment,
        allowEarnWithCoupon: cashbackRuleForm.allowEarnWithCoupon,
        priority: parseInt(cashbackRuleForm.priority) || 0,
        isActive: cashbackRuleForm.isActive
      };

      const mutation = editingCashbackRule 
        ? `mutation UpdateCashbackRule($id: ID!, $input: CashbackRuleInput!) { updateCashbackRule(id: $id, input: $input) { id } }`
        : `mutation CreateCashbackRule($input: CashbackRuleInput!) { createCashbackRule(input: $input) { id } }`;
      
      const variables = editingCashbackRule 
        ? { id: editingCashbackRule.id, input }
        : { input };

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: mutation, variables })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      showFeedback('success', editingCashbackRule ? 'Regra atualizada!' : 'Regra criada!');
      closeCashbackRuleModal();
      fetchCouponsAndCashback();
    } catch (err) { 
      showFeedback('error', 'Erro: ' + err.message);
    }
  };

  const handleToggleCashbackRuleActive = async (id) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ 
          query: `mutation { toggleCashbackRuleActive(id: "${id}") { id isActive } }` 
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      showFeedback('success', 'Status atualizado!');
      fetchCouponsAndCashback();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteCashbackRule = async (id) => {
    showConfirmModal('Excluir Regra', 'Tem certeza?', async () => {
      try {
        await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ query: `mutation { deleteCashbackRule(id: "${id}") }` })
        });
        showFeedback('success', 'Regra excluída!');
        fetchCouponsAndCashback();
      } catch (err) {
        showFeedback('error', err.message);
      }
      closeConfirmModal();
    });
  };

  const openCreateCashbackCampaignModal = () => {
    setEditingCashbackCampaign(null);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setCashbackCampaignForm({
      name: '',
      description: '',
      multiplier: '2',
      fixedPercentage: '',
      categories: [],
      maxCashbackValue: '',
      maxUsesPerUser: '',
      startDate: now.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      hasNoEndDate: false,
      schedule: {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      },
      isActive: true
    });
    setIsCashbackCampaignModalOpen(true);
  };

  const openEditCashbackCampaignModal = (campaign) => {
    setEditingCashbackCampaign(campaign);
    setCashbackCampaignForm({
      name: campaign.name,
      description: campaign.description || '',
      multiplier: campaign.multiplier?.toString() || '',
      fixedPercentage: campaign.fixedPercentage?.toString() || '',
      categories: campaign.categories || [],
      maxCashbackValue: campaign.maxCashbackValue?.toString() || '',
      maxUsesPerUser: campaign.maxUsesPerUser?.toString() || '',
      startDate: new Date(Number(campaign.startDate)).toISOString().split('T')[0],
      endDate: campaign.endDate ? new Date(Number(campaign.endDate)).toISOString().split('T')[0] : '',
      hasNoEndDate: campaign.hasNoEndDate || false,
      schedule: campaign.schedule ? {
        enabled: true,
        startTime: campaign.schedule.startTime || '00:00',
        endTime: campaign.schedule.endTime || '23:59',
        daysOfWeek: campaign.schedule.daysOfWeek || ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      } : {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      },
      isActive: campaign.isActive
    });
    setIsCashbackCampaignModalOpen(true);
  };

  const closeCashbackCampaignModal = () => {
    setIsCashbackCampaignModalOpen(false);
    setEditingCashbackCampaign(null);
  };

  const handleSaveCashbackCampaign = async (e) => {
    e.preventDefault();
    try {
      const input = {
        name: cashbackCampaignForm.name,
        description: cashbackCampaignForm.description || null,
        multiplier: cashbackCampaignForm.multiplier ? parseFloat(cashbackCampaignForm.multiplier) : null,
        fixedPercentage: cashbackCampaignForm.fixedPercentage ? parseFloat(cashbackCampaignForm.fixedPercentage) : null,
        categories: cashbackCampaignForm.categories.length > 0 ? cashbackCampaignForm.categories : null,
        maxCashbackValue: cashbackCampaignForm.maxCashbackValue ? parseFloat(cashbackCampaignForm.maxCashbackValue) : null,
        maxUsesPerUser: cashbackCampaignForm.maxUsesPerUser ? parseInt(cashbackCampaignForm.maxUsesPerUser) : null,
        startDate: new Date(cashbackCampaignForm.startDate).toISOString(),
        endDate: cashbackCampaignForm.hasNoEndDate ? null : new Date(cashbackCampaignForm.endDate + 'T23:59:59').toISOString(),
        hasNoEndDate: cashbackCampaignForm.hasNoEndDate,
        schedule: cashbackCampaignForm.schedule.enabled ? {
          startTime: cashbackCampaignForm.schedule.startTime,
          endTime: cashbackCampaignForm.schedule.endTime,
          daysOfWeek: cashbackCampaignForm.schedule.daysOfWeek
        } : null,
        isActive: cashbackCampaignForm.isActive
      };

      const mutation = editingCashbackCampaign 
        ? `mutation UpdateCashbackCampaign($id: ID!, $input: CashbackCampaignInput!) { updateCashbackCampaign(id: $id, input: $input) { id } }`
        : `mutation CreateCashbackCampaign($input: CashbackCampaignInput!) { createCashbackCampaign(input: $input) { id } }`;
      
      const variables = editingCashbackCampaign 
        ? { id: editingCashbackCampaign.id, input }
        : { input };

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: mutation, variables })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      showFeedback('success', editingCashbackCampaign ? 'Campanha atualizada!' : 'Campanha criada!');
      closeCashbackCampaignModal();
      fetchCouponsAndCashback();
    } catch (err) { 
      showFeedback('error', 'Erro: ' + err.message);
    }
  };

  const handleDeleteCashbackCampaign = async (id) => {
    showConfirmModal('Excluir Campanha', 'Tem certeza?', async () => {
      try {
        await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ query: `mutation { deleteCashbackCampaign(id: "${id}") }` })
        });
        showFeedback('success', 'Campanha excluída!');
        fetchCouponsAndCashback();
      } catch (err) {
        showFeedback('error', err.message);
      }
      closeConfirmModal();
    });
  };

  const openCashbackSettingsModal = () => {
    if (cashbackSettings) {
      setCashbackSettingsForm({
        isEnabled: cashbackSettings.isEnabled,
        defaultPercentage: cashbackSettings.defaultPercentage?.toString() || '5',
        minRedeemValue: cashbackSettings.minRedeemValue?.toString() || '5',
        maxRedeemPercentage: cashbackSettings.maxRedeemPercentage?.toString() || '50',
        maxRedeemValue: cashbackSettings.maxRedeemValue?.toString() || '',
        defaultExpirationDays: cashbackSettings.defaultExpirationDays?.toString() || '30',
        displayMessage: cashbackSettings.displayMessage || ''
      });
    }
    setIsCashbackSettingsModalOpen(true);
  };

  const closeCashbackSettingsModal = () => {
    setIsCashbackSettingsModalOpen(false);
  };

  const handleSaveCashbackSettings = async (e) => {
    e.preventDefault();
    try {
      const input = {
        isEnabled: cashbackSettingsForm.isEnabled,
        defaultPercentage: parseFloat(cashbackSettingsForm.defaultPercentage) || 5,
        minRedeemValue: parseFloat(cashbackSettingsForm.minRedeemValue) || 5,
        maxRedeemPercentage: parseFloat(cashbackSettingsForm.maxRedeemPercentage) || 50,
        maxRedeemValue: cashbackSettingsForm.maxRedeemValue ? parseFloat(cashbackSettingsForm.maxRedeemValue) : null,
        defaultExpirationDays: parseInt(cashbackSettingsForm.defaultExpirationDays) || 30,
        displayMessage: cashbackSettingsForm.displayMessage || null
      };

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `mutation UpdateCashbackSettings($input: CashbackSettingsInput!) { 
            updateCashbackSettings(input: $input) { id isEnabled } 
          }`,
          variables: { input }
        })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      showFeedback('success', 'Configurações salvas!');
      closeCashbackSettingsModal();
      fetchCouponsAndCashback();
    } catch (err) { 
      showFeedback('error', 'Erro: ' + err.message);
    }
  };

  const toggleHistory = (monthYear) => setExpandedHistory(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
  
  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

  const formatFullDate = (timestamp) => new Date(Number(timestamp)).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const formatDateBR = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('pt-BR');
  };

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

  const getCategoryLabel = (value) => CATEGORIES.find(c => c.value === value)?.label || value;

  const getDayLabel = (value) => DAYS_OF_WEEK.find(d => d.value === value)?.label || value;

  const isCouponExpired = (coupon) => {
    if (coupon.hasNoEndDate) return false;
    return new Date(Number(coupon.endDate)) < new Date();
  };

  const isCampaignActive = (campaign) => {
    const now = new Date();
    const start = new Date(Number(campaign.startDate));
    if (!campaign.isActive || now < start) return false;
    if (campaign.hasNoEndDate) return true;
    const end = new Date(Number(campaign.endDate));
    return now <= end;
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return null;
    const days = schedule.daysOfWeek?.map(getDayLabel).join(', ') || 'Todos os dias';
    return `${schedule.startTime} - ${schedule.endTime} (${days})`;
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

  // Icons
  const ChartIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
  const OrderIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);
  const MotorcycleIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
  const ImageIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
  const SettingsIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
  const RefreshIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
  const DollarIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
  const ClockIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
  const CheckCircleIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
  const FireIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>);
  const BellIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
  const RocketIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>);
  const CheckIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>);
  const ReceiptIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>);
  const StoreIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
  const AlertIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
  const CloseIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
  const UserIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
  const CarIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4-9a9 9 0 110 18 9 9 0 010-18z" /></svg>);
  const EyeIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
  const EditIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
  const PauseIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
  const PlayIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
  const TicketIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>);
  const PercentIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>);
  const SparklesIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
  const CogIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
  const CopyIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
  const PlusIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
  const TrashIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
  const InfinityIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" /></svg>);
  const CalendarIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
  const TruckIcon = ({ className }) => (<svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>);

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
            feedback.type === 'success' ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-red-500 text-white border-red-500'
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
            { key: 'OVERVIEW', label: 'Visao Geral', icon: <ChartIcon className="w-4 h-4" /> },
            { key: 'ORDERS', label: 'Pedidos', badge: pendingOrders.length, icon: <OrderIcon className="w-4 h-4" /> },
            { key: 'COURIERS', label: 'Entregadores', badge: couriers.filter(c => c.isActive).length, icon: <MotorcycleIcon className="w-4 h-4" /> },
            { key: 'COUPONS_CASHBACK', label: 'Cupons & Cashback', icon: <TicketIcon className="w-4 h-4" /> },
            { key: 'BANNERS', label: 'Banners', icon: <ImageIcon className="w-4 h-4" /> }
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
                              <button 
                                onClick={() => toggleHistory(monthYear)}
                                className="text-sm font-semibold text-[#1e3a5f]/40 mb-4 flex items-center gap-2 hover:text-[#1e3a5f]/60 transition-colors"
                              >
                                <span className="w-2 h-2 bg-[#1e3a5f]/20 rounded-full"></span>
                                Historico ({completedList.length})
                                <svg className={`w-4 h-4 transition-transform ${expandedHistory[monthYear] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {expandedHistory[monthYear] && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{completedList.map(renderOrderCard)}</div>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <select
                      value={courierPeriodFilter}
                      onChange={(e) => setCourierPeriodFilter(e.target.value)}
                      className="bg-white border border-[#1e3a5f]/20 text-[#1e3a5f] text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-[#1e3a5f]/40"
                    >
                      <option value="DAY">Hoje</option>
                      <option value="WEEK">Esta Semana</option>
                      <option value="MONTH">Este Mes</option>
                      <option value="YEAR">Este Ano</option>
                    </select>
                  </div>
                  <button
                    onClick={openCreateCourierModal}
                    className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-[#1e3a5f]/20 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" /> Novo Entregador
                  </button>
                </div>

                {couriersMetrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-[#1e3a5f]/10">
                      <p className="text-xs text-[#1e3a5f]/40 font-medium">Total Entregadores</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">{couriersMetrics.totalCouriers}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#1e3a5f]/10">
                      <p className="text-xs text-[#1e3a5f]/40 font-medium">Ativos</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">{couriersMetrics.activeCouriers}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#1e3a5f]/10">
                      <p className="text-xs text-[#1e3a5f]/40 font-medium">Entregas ({getPeriodLabel(courierPeriodFilter)})</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">{couriersMetrics.periodDeliveries}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#1e3a5f]/10">
                      <p className="text-xs text-[#1e3a5f]/40 font-medium">Faturado ({getPeriodLabel(courierPeriodFilter)})</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">
                        <span className="text-sm opacity-60">R$</span>
                        {couriersMetrics.periodEarnings.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                )}

                {couriers.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5">
                    <MotorcycleIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium">Nenhum entregador cadastrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {couriers.map(renderCourierCard)}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'COUPONS_CASHBACK' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { key: 'COUPONS', label: 'Cupons', icon: <TicketIcon className="w-4 h-4" /> },
                    { key: 'CASHBACK_RULES', label: 'Regras de Cashback', icon: <PercentIcon className="w-4 h-4" /> },
                    { key: 'CASHBACK_CAMPAIGNS', label: 'Campanhas', icon: <SparklesIcon className="w-4 h-4" /> },
                    { key: 'CASHBACK_SETTINGS', label: 'Configuracoes', icon: <CogIcon className="w-4 h-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setCouponsSubTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        couponsSubTab === tab.key
                          ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20'
                          : 'bg-white text-[#1e3a5f]/60 border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {couponsSubTab === 'COUPONS' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[#1e3a5f]">Cupons de Desconto</h3>
                      <button onClick={openCreateCouponModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-[#1e3a5f]/20 transition-all">
                        <PlusIcon className="w-4 h-4" /> Novo Cupom
                      </button>
                    </div>

                    {coupons.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-[#1e3a5f]/10">
                        <TicketIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                        <p className="text-[#1e3a5f]/40 font-medium">Nenhum cupom criado</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {coupons.map(coupon => {
                          const expired = isCouponExpired(coupon);
                          return (
                            <div key={coupon.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                              !coupon.isActive || expired ? 'border-[#1e3a5f]/10 opacity-60' : 'border-[#1e3a5f]/20 hover:shadow-lg hover:-translate-y-1'
                            }`}>
                              <div className="px-5 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5]">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono font-bold text-[#1e3a5f] bg-[#1e3a5f]/10 px-2 py-1 rounded text-sm">{coupon.code}</span>
                                      {expired && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600">Expirado</span>}
                                      {coupon.hasNoEndDate && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-600 flex items-center gap-1"><InfinityIcon className="w-3 h-3" />Sem prazo</span>}
                                    </div>
                                    <p className="text-sm font-medium text-[#1e3a5f]">{coupon.name}</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={coupon.isActive} onChange={() => handleToggleCouponActive(coupon.id, coupon.isActive)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-[#1e3a5f]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                                  </label>
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                                    {coupon.discountType === 'PERCENTAGE' ? (
                                      <span className="text-white font-bold text-lg">{coupon.discountValue}%</span>
                                    ) : coupon.discountType === 'FIXED' ? (
                                      <span className="text-white font-bold text-lg">R${coupon.discountValue}</span>
                                    ) : (
                                      <TruckIcon className="w-6 h-6 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#1e3a5f]/40">Desconto</p>
                                    <p className="font-semibold text-[#1e3a5f]">
                                      {coupon.discountType === 'PERCENTAGE' && `${coupon.discountValue}% OFF`}
                                      {coupon.discountType === 'FIXED' && `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                                      {coupon.discountType === 'FREE_SHIPPING' && 'Frete Gratis'}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                  <div>
                                    <p className="text-[#1e3a5f]/40">Pedido Min.</p>
                                    <p className="font-medium text-[#1e3a5f]">R$ {(coupon.minOrderValue || 0).toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#1e3a5f]/40">Usos</p>
                                    <p className="font-medium text-[#1e3a5f]">{coupon.totalUsedCount || 0} / {coupon.maxTotalUses || '∞'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-[#1e3a5f]/40">Validade</p>
                                    <p className="font-medium text-[#1e3a5f]">
                                      {formatDateBR(coupon.startDate)} - {coupon.hasNoEndDate ? <span className="text-blue-600">Sem prazo</span> : formatDateBR(coupon.endDate)}
                                    </p>
                                  </div>
                                  {coupon.schedule && (
                                    <div className="col-span-2">
                                      <p className="text-[#1e3a5f]/40">Horario</p>
                                      <p className="font-medium text-[#1e3a5f] flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3" />
                                        {formatSchedule(coupon.schedule)}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <button onClick={() => openEditCouponModal(coupon)} className="flex-1 bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] font-medium py-2 rounded-xl text-sm flex items-center justify-center gap-1 transition-all">
                                    <EditIcon className="w-4 h-4" /> Editar
                                  </button>
                                  <button onClick={() => handleDeleteCoupon(coupon.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-medium p-2 rounded-xl transition-all">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {couponsSubTab === 'CASHBACK_RULES' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[#1e3a5f]">Regras de Cashback</h3>
                      <button onClick={openCreateCashbackRuleModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-[#1e3a5f]/20 transition-all">
                        <PlusIcon className="w-4 h-4" /> Nova Regra
                      </button>
                    </div>

                    {cashbackRules.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-[#1e3a5f]/10">
                        <PercentIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                        <p className="text-[#1e3a5f]/40 font-medium">Nenhuma regra criada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cashbackRules.sort((a, b) => b.priority - a.priority).map(rule => (
                          <div key={rule.id} className={`bg-white rounded-xl border p-5 ${!rule.isActive ? 'opacity-60' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">{rule.percentage}%</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-[#1e3a5f]">{rule.name}</p>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e3a5f]/10 text-[#1e3a5f]">
                                      Prioridade: {rule.priority}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[#1e3a5f]/50">{rule.description || 'Sem descricao'}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-1 rounded-lg text-xs bg-[#1e3a5f]/5 text-[#1e3a5f]/60">
                                      {rule.type === 'GLOBAL' ? 'Global' : rule.type === 'CATEGORY' ? 'Por Categoria' : 'Por Produto'}
                                    </span>
                                    {rule.minOrderValue > 0 && (
                                      <span className="px-2 py-1 rounded-lg text-xs bg-[#1e3a5f]/5 text-[#1e3a5f]/60">
                                        Pedido min: R$ {rule.minOrderValue.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="px-2 py-1 rounded-lg text-xs bg-[#1e3a5f]/5 text-[#1e3a5f]/60">
                                      Expira em {rule.expirationDays} dias
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={rule.isActive} onChange={() => handleToggleCashbackRuleActive(rule.id)} className="sr-only peer" />
                                  <div className="w-9 h-5 bg-[#1e3a5f]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                                </label>
                                <button onClick={() => openEditCashbackRuleModal(rule)} className="p-2 hover:bg-[#1e3a5f]/10 rounded-lg transition-colors">
                                  <EditIcon className="w-4 h-4 text-[#1e3a5f]" />
                                </button>
                                <button onClick={() => handleDeleteCashbackRule(rule.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {couponsSubTab === 'CASHBACK_CAMPAIGNS' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[#1e3a5f]">Campanhas de Cashback</h3>
                      <button onClick={openCreateCashbackCampaignModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-[#1e3a5f]/20 transition-all">
                        <PlusIcon className="w-4 h-4" /> Nova Campanha
                      </button>
                    </div>

                    {cashbackCampaigns.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-[#1e3a5f]/10">
                        <SparklesIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                        <p className="text-[#1e3a5f]/40 font-medium">Nenhuma campanha ativa</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cashbackCampaigns.map(campaign => {
                          const active = isCampaignActive(campaign);
                          return (
                            <div key={campaign.id} className={`bg-white rounded-2xl border overflow-hidden ${active ? 'border-[#1e3a5f]/20' : 'border-[#1e3a5f]/10 opacity-60'}`}>
                              <div className="px-5 py-4 border-b border-[#1e3a5f]/10 bg-gradient-to-r from-[#1e3a5f]/10 to-[#1e3a5f]/5">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                                      <SparklesIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#1e3a5f]">{campaign.name}</p>
                                      <div className="flex items-center gap-2">
                                        {campaign.hasNoEndDate && (
                                          <span className="text-xs text-blue-600 flex items-center gap-1">
                                            <InfinityIcon className="w-3 h-3" /> Sem prazo
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-600' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]/50'}`}>
                                    {active ? 'Ativa' : 'Inativa'}
                                  </span>
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="bg-[#1e3a5f]/5 rounded-xl p-4 flex-1 text-center">
                                    {campaign.multiplier ? (
                                      <>
                                        <p className="text-3xl font-bold text-[#1e3a5f]">{campaign.multiplier}x</p>
                                        <p className="text-xs text-[#1e3a5f]/50">Multiplicador</p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-3xl font-bold text-[#1e3a5f]">{campaign.fixedPercentage}%</p>
                                        <p className="text-xs text-[#1e3a5f]/50">Cashback Fixo</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="px-2 py-1 rounded-lg text-xs bg-[#1e3a5f]/5 text-[#1e3a5f]/60">
                                    {formatDateBR(campaign.startDate)} - {campaign.hasNoEndDate ? <span className="text-blue-600">Sem prazo</span> : formatDateBR(campaign.endDate)}
                                  </span>
                                  {campaign.schedule && (
                                    <span className="px-2 py-1 rounded-lg text-xs bg-[#1e3a5f]/5 text-[#1e3a5f]/60 flex items-center gap-1">
                                      <ClockIcon className="w-3 h-3" />
                                      {formatSchedule(campaign.schedule)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => openEditCashbackCampaignModal(campaign)} className="flex-1 bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] font-medium py-2 rounded-xl text-sm flex items-center justify-center gap-1">
                                    <EditIcon className="w-4 h-4" /> Editar
                                  </button>
                                  <button onClick={() => handleDeleteCashbackCampaign(campaign.id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {couponsSubTab === 'CASHBACK_SETTINGS' && (
                  <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-[#1e3a5f]">Configuracoes Gerais de Cashback</h3>
                        <p className="text-sm text-[#1e3a5f]/50">Configure o comportamento padrao do sistema de cashback</p>
                      </div>
                      <button onClick={openCashbackSettingsModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                        <EditIcon className="w-4 h-4" /> Editar
                      </button>
                    </div>

                    {cashbackSettings ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1e3a5f]/5 rounded-xl p-4">
                          <p className="text-xs text-[#1e3a5f]/40 mb-1">Status</p>
                          <p className={`font-semibold ${cashbackSettings.isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                            {cashbackSettings.isEnabled ? 'Ativo' : 'Desativado'}
                          </p>
                        </div>
                        <div className="bg-[#1e3a5f]/5 rounded-xl p-4">
                          <p className="text-xs text-[#1e3a5f]/40 mb-1">% Padrao</p>
                          <p className="font-semibold text-[#1e3a5f]">{cashbackSettings.defaultPercentage}%</p>
                        </div>
                        <div className="bg-[#1e3a5f]/5 rounded-xl p-4">
                          <p className="text-xs text-[#1e3a5f]/40 mb-1">Valor Min. Resgate</p>
                          <p className="font-semibold text-[#1e3a5f]">R$ {cashbackSettings.minRedeemValue?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="bg-[#1e3a5f]/5 rounded-xl p-4">
                          <p className="text-xs text-[#1e3a5f]/40 mb-1">Max % Resgate</p>
                          <p className="font-semibold text-[#1e3a5f]">{cashbackSettings.maxRedeemPercentage}%</p>
                        </div>
                        <div className="bg-[#1e3a5f]/5 rounded-xl p-4">
                          <p className="text-xs text-[#1e3a5f]/40 mb-1">Expiracao Padrao</p>
                          <p className="font-semibold text-[#1e3a5f]">{cashbackSettings.defaultExpirationDays} dias</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#1e3a5f]/40">Carregando configuracoes...</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'BANNERS' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#1e3a5f]">Banners do Carrossel</h3>
                  <button onClick={openCreateBannerModal} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-[#1e3a5f]/20 transition-all">
                    <PlusIcon className="w-4 h-4" /> Novo Banner
                  </button>
                </div>

                {banners.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5">
                    <ImageIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium">Nenhum banner publicado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map(banner => (
                      <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5 overflow-hidden group hover:shadow-lg transition-all">
                        <div className="relative aspect-[16/7] bg-[#1e3a5f]/5">
                          {banner.imageUrl && (
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/80 via-transparent to-transparent flex items-end p-6">
                            <div>
                              <h4 className="text-white font-bold text-xl mb-1">{banner.title || 'Sem titulo'}</h4>
                              <p className="text-white/70 text-sm">{banner.subtitle || 'Sem subtitulo'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 flex justify-end gap-2">
                          <button onClick={() => openEditBannerModal(banner)} className="bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all">
                            <EditIcon className="w-4 h-4" /> Editar
                          </button>
                          <button onClick={() => handleDeleteBanner(banner.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all">
                            <TrashIcon className="w-4 h-4" /> Excluir
                          </button>
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

      {/* MODALS */}
      
      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeBannerModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f]">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h3>
              <button onClick={closeBannerModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <form onSubmit={handleSaveBanner} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Imagem</label>
                <div className="border-2 border-dashed border-[#1e3a5f]/20 rounded-xl p-4 text-center hover:border-[#1e3a5f]/40 transition-colors cursor-pointer" onClick={() => document.getElementById('bannerImageInput').click()}>
                  {bannerForm.imageUrl ? (
                    <img src={bannerForm.imageUrl} alt="Preview" className="w-full aspect-[16/7] object-cover rounded-lg" />
                  ) : (
                    <div className="py-8"><ImageIcon className="w-12 h-12 text-[#1e3a5f]/30 mx-auto mb-2" /><p className="text-[#1e3a5f]/40 text-sm">Clique para enviar imagem</p></div>
                  )}
                </div>
                <input id="bannerImageInput" type="file" accept="image/*" onChange={handleBannerImageUpload} className="hidden" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Titulo</label>
                <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="Titulo do banner" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Subtitulo</label>
                <input type="text" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} placeholder="Subtitulo do banner" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeBannerModal} className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">{editingBanner ? 'Salvar' : 'Publicar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courier Modal */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeCourierModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f]">{editingCourier ? 'Editar Entregador' : 'Novo Entregador'}</h3>
              <button onClick={closeCourierModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <form onSubmit={handleSaveCourier} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Nome *</label>
                  <input type="text" value={courierForm.firstName} onChange={(e) => setCourierForm({ ...courierForm, firstName: e.target.value })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Sobrenome *</label>
                  <input type="text" value={courierForm.lastName} onChange={(e) => setCourierForm({ ...courierForm, lastName: e.target.value })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Telefone *</label>
                  <input type="tel" value={courierForm.phone} onChange={(e) => setCourierForm({ ...courierForm, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">CPF *</label>
                  <input type="text" value={courierForm.cpf} onChange={(e) => setCourierForm({ ...courierForm, cpf: e.target.value })} placeholder="000.000.000-00" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Email</label>
                <input type="email" value={courierForm.email} onChange={(e) => setCourierForm({ ...courierForm, email: e.target.value })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
              </div>
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2"><CarIcon className="w-4 h-4" /> Veiculo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Marca *</label>
                    <input type="text" value={courierForm.vehicle.brand} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, brand: e.target.value } })} placeholder="Honda" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Modelo *</label>
                    <input type="text" value={courierForm.vehicle.model} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, model: e.target.value } })} placeholder="CG 160" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Placa *</label>
                    <input type="text" value={courierForm.vehicle.plate} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, plate: e.target.value.toUpperCase() } })} placeholder="ABC-1234" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none uppercase" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Ano *</label>
                    <input type="number" value={courierForm.vehicle.year} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, year: e.target.value } })} placeholder="2023" min="1990" max="2030" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Cor *</label>
                    <input type="text" value={courierForm.vehicle.color} onChange={(e) => setCourierForm({ ...courierForm, vehicle: { ...courierForm.vehicle, color: e.target.value } })} placeholder="Preta" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeCourierModal} className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">{editingCourier ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courier Detail Modal */}
      {isCourierDetailOpen && selectedCourier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeCourierDetail}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center"><UserIcon className="w-6 h-6 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-[#1e3a5f]">{selectedCourier.firstName} {selectedCourier.lastName}</h3>
                  <p className="text-sm text-[#1e3a5f]/50">{formatPhone(selectedCourier.phone)}</p>
                </div>
              </div>
              <button onClick={closeCourierDetail} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1e3a5f]/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#1e3a5f]/40">Email</p>
                  <p className="font-medium text-[#1e3a5f] text-sm truncate">{selectedCourier.email || '-'}</p>
                </div>
                <div className="bg-[#1e3a5f]/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#1e3a5f]/40">CPF</p>
                  <p className="font-medium text-[#1e3a5f] text-sm">{formatCPF(selectedCourier.cpf)}</p>
                </div>
                <div className="bg-[#1e3a5f]/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#1e3a5f]/40">Total Entregas</p>
                  <p className="font-bold text-[#1e3a5f] text-xl">{selectedCourier.totalDeliveries}</p>
                </div>
                <div className="bg-[#1e3a5f]/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#1e3a5f]/40">Total Faturado</p>
                  <p className="font-bold text-[#1e3a5f] text-xl">R$ {selectedCourier.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2"><CarIcon className="w-4 h-4" /> Veiculo</h4>
                <p className="text-[#1e3a5f]">{selectedCourier.vehicle.brand} {selectedCourier.vehicle.model} - {selectedCourier.vehicle.year}</p>
                <p className="text-sm text-[#1e3a5f]/60">Placa: {selectedCourier.vehicle.plate} | Cor: {selectedCourier.vehicle.color}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-[#1e3a5f]">Entregas Recentes ({getPeriodLabel(courierPeriodFilter)})</h4>
                  <select value={courierPeriodFilter} onChange={(e) => { setCourierPeriodFilter(e.target.value); fetchCourierDeliveries(selectedCourier.id); }} className="text-sm bg-[#1e3a5f]/5 border-0 rounded-lg px-3 py-1">
                    <option value="DAY">Hoje</option>
                    <option value="WEEK">Semana</option>
                    <option value="MONTH">Mes</option>
                  </select>
                </div>
                {courierDeliveries.length === 0 ? (
                  <p className="text-[#1e3a5f]/40 text-center py-8">Nenhuma entrega no periodo</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {courierDeliveries.map(delivery => (
                      <div key={delivery.id} className="flex items-center justify-between p-3 bg-white border border-[#1e3a5f]/10 rounded-xl">
                        <div>
                          <p className="font-medium text-[#1e3a5f] text-sm">#{delivery.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-[#1e3a5f]/50">{delivery.user?.name} - {delivery.deliveryAddress?.neighborhood}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1e3a5f]">R$ {delivery.shippingFee?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-[#1e3a5f]/40">{formatFullDate(delivery.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Courier Modal */}
      {isAssignCourierModalOpen && orderToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeAssignCourierModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f]">Atribuir Entregador</h3>
              <button onClick={closeAssignCourierModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#1e3a5f]/60 mb-4">Pedido: <span className="font-semibold text-[#1e3a5f]">#{orderToAssign.id.slice(-6).toUpperCase()}</span></p>
              {availableCouriers.length === 0 ? (
                <p className="text-[#1e3a5f]/40 text-center py-8">Nenhum entregador disponivel</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableCouriers.map(courier => (
                    <button key={courier.id} onClick={() => assignCourierToOrder(orderToAssign.id, courier.id)} className="w-full flex items-center gap-3 p-3 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 rounded-xl transition-colors text-left">
                      <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center"><MotorcycleIcon className="w-5 h-5 text-white" /></div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#1e3a5f]">{courier.firstName} {courier.lastName}</p>
                        <p className="text-xs text-[#1e3a5f]/50">{courier.vehicle.brand} {courier.vehicle.model} - {courier.vehicle.plate}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeCouponModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2"><TicketIcon className="w-5 h-5" />{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <button onClick={closeCouponModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <form onSubmit={handleSaveCoupon} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Codigo do Cupom *</label>
                    <div className="relative">
                      <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="EX: PROMO10" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none font-mono uppercase tracking-wider" required />
                      <button type="button" onClick={() => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let code = ''; for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length)); setCouponForm({ ...couponForm, code }); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#1e3a5f] hover:bg-[#1e3a5f]/10 px-2 py-1 rounded">Gerar</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Nome *</label>
                    <input type="text" value={couponForm.name} onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })} placeholder="Ex: Desconto de Boas-Vindas" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Descricao</label>
                  <textarea value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="Descricao opcional do cupom..." rows={2} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none resize-none" />
                </div>
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm">Tipo de Desconto</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'PERCENTAGE', label: 'Porcentagem', icon: <span className="text-lg font-bold">%</span> }, 
                      { value: 'FIXED', label: 'Valor Fixo', icon: <span className="text-lg font-bold">R$</span> }, 
                      { value: 'FREE_SHIPPING', label: 'Frete Gratis', icon: <TruckIcon className="w-6 h-6" /> }
                    ].map(type => (
                      <button key={type.value} type="button" onClick={() => setCouponForm({ ...couponForm, discountType: type.value })} className={`p-3 rounded-xl border-2 text-center transition-all ${couponForm.discountType === type.value ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white' : 'border-[#1e3a5f]/20 bg-white text-[#1e3a5f] hover:border-[#1e3a5f]/40'}`}>
                        <div className="flex justify-center">{type.icon}</div>
                        <p className="text-xs mt-1 font-medium">{type.label}</p>
                      </button>
                    ))}
                  </div>
                  {couponForm.discountType !== 'FREE_SHIPPING' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1e3a5f] mb-1">{couponForm.discountType === 'PERCENTAGE' ? 'Porcentagem (%)' : 'Valor (R$)'} *</label>
                        <input type="number" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} placeholder={couponForm.discountType === 'PERCENTAGE' ? 'Ex: 10' : 'Ex: 15.00'} min="0" max={couponForm.discountType === 'PERCENTAGE' ? '100' : undefined} step={couponForm.discountType === 'PERCENTAGE' ? '1' : '0.01'} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                      </div>
                      {couponForm.discountType === 'PERCENTAGE' && (
                        <div>
                          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Desconto Maximo (R$)</label>
                          <input type="number" value={couponForm.maxDiscountValue} onChange={(e) => setCouponForm({ ...couponForm, maxDiscountValue: e.target.value })} placeholder="Ex: 30.00" min="0" step="0.01" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm">Restricoes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Pedido Minimo (R$)</label>
                      <input type="number" value={couponForm.minOrderValue} onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })} placeholder="0.00" min="0" step="0.01" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Tipo de Cliente</label>
                      <select value={couponForm.customerType} onChange={(e) => setCouponForm({ ...couponForm, customerType: e.target.value })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none bg-white">
                        <option value="ALL">Todos os clientes</option>
                        <option value="NEW">Apenas novos clientes</option>
                        <option value="EXISTING">Apenas clientes existentes</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Categorias Aplicaveis</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button key={cat.value} type="button" onClick={() => { const cats = couponForm.applicableCategories.includes(cat.value) ? couponForm.applicableCategories.filter(c => c !== cat.value) : [...couponForm.applicableCategories, cat.value]; setCouponForm({ ...couponForm, applicableCategories: cats }); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${couponForm.applicableCategories.includes(cat.value) ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-[#1e3a5f]/20 text-[#1e3a5f]/60 hover:border-[#1e3a5f]/40'}`}>{cat.label}</button>
                      ))}
                    </div>
                    <p className="text-xs text-[#1e3a5f]/40 mt-1">Deixe vazio para aplicar a todas</p>
                  </div>
                </div>
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm">Limites de Uso</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Usos Totais</label>
                      <input type="number" value={couponForm.maxTotalUses} onChange={(e) => setCouponForm({ ...couponForm, maxTotalUses: e.target.value })} placeholder="Ilimitado" min="1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Usos por Cliente</label>
                      <input type="number" value={couponForm.maxUsesPerUser} onChange={(e) => setCouponForm({ ...couponForm, maxUsesPerUser: e.target.value })} placeholder="1" min="1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                    </div>
                  </div>
                </div>
                
                {/* Validade */}
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Validade</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Data Inicio *</label>
                      <input type="date" value={couponForm.startDate} onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Data Fim {!couponForm.hasNoEndDate && '*'}</label>
                      <input type="date" value={couponForm.endDate} onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })} disabled={couponForm.hasNoEndDate} className={`w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none ${couponForm.hasNoEndDate ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]/40' : ''}`} required={!couponForm.hasNoEndDate} />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-[#1e3a5f]/20 hover:border-[#1e3a5f]/40 transition-colors">
                    <input type="checkbox" checked={couponForm.hasNoEndDate} onChange={(e) => setCouponForm({ ...couponForm, hasNoEndDate: e.target.checked, endDate: e.target.checked ? '' : couponForm.endDate })} className="w-5 h-5 text-[#1e3a5f] border-[#1e3a5f]/30 rounded focus:ring-[#1e3a5f]" />
                    <div className="flex items-center gap-2">
                      <InfinityIcon className="w-5 h-5 text-[#1e3a5f]" />
                      <span className="text-sm font-medium text-[#1e3a5f]">Cupom sem prazo de termino (valido indefinidamente)</span>
                    </div>
                  </label>
                </div>

                {/* Horário de Funcionamento */}
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#1e3a5f] text-sm flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Horario de Funcionamento</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={couponForm.schedule.enabled} onChange={(e) => setCouponForm({ ...couponForm, schedule: { ...couponForm.schedule, enabled: e.target.checked } })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#1e3a5f]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                    </label>
                  </div>
                  {couponForm.schedule.enabled && (
                    <>
                      <p className="text-xs text-[#1e3a5f]/50">Defina os dias e horarios em que o cupom ficara disponivel</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Horario Inicio</label>
                          <input type="time" value={couponForm.schedule.startTime} onChange={(e) => setCouponForm({ ...couponForm, schedule: { ...couponForm.schedule, startTime: e.target.value } })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Horario Fim</label>
                          <input type="time" value={couponForm.schedule.endTime} onChange={(e) => setCouponForm({ ...couponForm, schedule: { ...couponForm.schedule, endTime: e.target.value } })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Dias da Semana</label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map(day => (
                            <button key={day.value} type="button" onClick={() => { const days = couponForm.schedule.daysOfWeek.includes(day.value) ? couponForm.schedule.daysOfWeek.filter(d => d !== day.value) : [...couponForm.schedule.daysOfWeek, day.value]; setCouponForm({ ...couponForm, schedule: { ...couponForm.schedule, daysOfWeek: days } }); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${couponForm.schedule.daysOfWeek.includes(day.value) ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-[#1e3a5f]/20 text-[#1e3a5f]/60 hover:border-[#1e3a5f]/40'}`}>{day.label}</button>
                          ))}
                        </div>
                        <p className="text-xs text-[#1e3a5f]/40 mt-2">Selecione os dias em que o cupom estara ativo</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={couponForm.allowWithCashback} onChange={(e) => setCouponForm({ ...couponForm, allowWithCashback: e.target.checked })} className="w-4 h-4 text-[#1e3a5f] border-[#1e3a5f]/30 rounded focus:ring-[#1e3a5f]" />
                    <span className="text-sm text-[#1e3a5f]">Permitir uso com cashback</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={couponForm.isActive} onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })} className="w-4 h-4 text-[#1e3a5f] border-[#1e3a5f]/30 rounded focus:ring-[#1e3a5f]" />
                    <span className="text-sm text-[#1e3a5f]">Cupom ativo</span>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-end gap-3">
                <button type="button" onClick={closeCouponModal} className="px-5 py-2.5 rounded-xl font-medium text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">{editingCoupon ? 'Salvar Alteracoes' : 'Criar Cupom'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cashback Rule Modal */}
      {isCashbackRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeCashbackRuleModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f]">{editingCashbackRule ? 'Editar Regra' : 'Nova Regra de Cashback'}</h3>
              <button onClick={closeCashbackRuleModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <form onSubmit={handleSaveCashbackRule} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Nome *</label>
                <input type="text" value={cashbackRuleForm.name} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, name: e.target.value })} placeholder="Ex: Cashback Padrao" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Descricao</label>
                <textarea value={cashbackRuleForm.description} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, description: e.target.value })} rows={2} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Porcentagem (%) *</label>
                  <input type="number" value={cashbackRuleForm.percentage} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, percentage: e.target.value })} min="0" max="100" step="0.1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Prioridade</label>
                  <input type="number" value={cashbackRuleForm.priority} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, priority: e.target.value })} min="0" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Pedido Minimo (R$)</label>
                  <input type="number" value={cashbackRuleForm.minOrderValue} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, minOrderValue: e.target.value })} min="0" step="0.01" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Cashback Max (R$)</label>
                  <input type="number" value={cashbackRuleForm.maxCashbackValue} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, maxCashbackValue: e.target.value })} min="0" step="0.01" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Expiracao (dias)</label>
                <input type="number" value={cashbackRuleForm.expirationDays} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, expirationDays: e.target.value })} min="1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cashbackRuleForm.allowEarnWithCoupon} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, allowEarnWithCoupon: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-[#1e3a5f]">Ganhar cashback com cupom</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cashbackRuleForm.isActive} onChange={(e) => setCashbackRuleForm({ ...cashbackRuleForm, isActive: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-[#1e3a5f]">Regra ativa</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeCashbackRuleModal} className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20">{editingCashbackRule ? 'Salvar' : 'Criar Regra'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cashback Campaign Modal */}
      {isCashbackCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeCashbackCampaignModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2"><SparklesIcon className="w-5 h-5" />{editingCashbackCampaign ? 'Editar Campanha' : 'Nova Campanha de Cashback'}</h3>
              <button onClick={closeCashbackCampaignModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <form onSubmit={handleSaveCashbackCampaign} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Nome da Campanha *</label>
                  <input type="text" value={cashbackCampaignForm.name} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, name: e.target.value })} placeholder="Ex: Cashback Dobro de Aniversario" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Descricao</label>
                  <textarea value={cashbackCampaignForm.description} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, description: e.target.value })} placeholder="Descricao da campanha..." rows={2} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none resize-none" />
                </div>
                <div className="p-4 bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm">Tipo de Beneficio</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Multiplicador</label>
                      <div className="relative">
                        <input type="number" value={cashbackCampaignForm.multiplier} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, multiplier: e.target.value, fixedPercentage: '' })} placeholder="Ex: 2" min="1" step="0.5" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1e3a5f]/40 font-bold">x</span>
                      </div>
                      <p className="text-xs text-[#1e3a5f]/40 mt-1">Ex: 2x = cashback dobro</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">OU Porcentagem Fixa</label>
                      <div className="relative">
                        <input type="number" value={cashbackCampaignForm.fixedPercentage} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, fixedPercentage: e.target.value, multiplier: '' })} placeholder="Ex: 15" min="0" max="100" step="0.1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1e3a5f]/40 font-bold">%</span>
                      </div>
                      <p className="text-xs text-[#1e3a5f]/40 mt-1">Substitui a % padrao</p>
                    </div>
                  </div>
                </div>

                {/* Validade */}
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Validade</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Data Inicio *</label>
                      <input type="date" value={cashbackCampaignForm.startDate} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, startDate: e.target.value })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Data Fim {!cashbackCampaignForm.hasNoEndDate && '*'}</label>
                      <input type="date" value={cashbackCampaignForm.endDate} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, endDate: e.target.value })} disabled={cashbackCampaignForm.hasNoEndDate} className={`w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none ${cashbackCampaignForm.hasNoEndDate ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]/40' : ''}`} required={!cashbackCampaignForm.hasNoEndDate} />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-[#1e3a5f]/20 hover:border-[#1e3a5f]/40 transition-colors">
                    <input type="checkbox" checked={cashbackCampaignForm.hasNoEndDate} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, hasNoEndDate: e.target.checked, endDate: e.target.checked ? '' : cashbackCampaignForm.endDate })} className="w-5 h-5 text-[#1e3a5f] border-[#1e3a5f]/30 rounded focus:ring-[#1e3a5f]" />
                    <div className="flex items-center gap-2">
                      <InfinityIcon className="w-5 h-5 text-[#1e3a5f]" />
                      <span className="text-sm font-medium text-[#1e3a5f]">Campanha sem prazo de termino</span>
                    </div>
                  </label>
                </div>

                {/* Horário de Funcionamento */}
                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#1e3a5f] text-sm flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Horario de Funcionamento</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={cashbackCampaignForm.schedule.enabled} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, schedule: { ...cashbackCampaignForm.schedule, enabled: e.target.checked } })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#1e3a5f]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                    </label>
                  </div>
                  {cashbackCampaignForm.schedule.enabled && (
                    <>
                      <p className="text-xs text-[#1e3a5f]/50">Defina os dias e horarios em que a campanha ficara ativa</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Horario Inicio</label>
                          <input type="time" value={cashbackCampaignForm.schedule.startTime} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, schedule: { ...cashbackCampaignForm.schedule, startTime: e.target.value } })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Horario Fim</label>
                          <input type="time" value={cashbackCampaignForm.schedule.endTime} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, schedule: { ...cashbackCampaignForm.schedule, endTime: e.target.value } })} className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Dias da Semana</label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map(day => (
                            <button key={day.value} type="button" onClick={() => { const days = cashbackCampaignForm.schedule.daysOfWeek.includes(day.value) ? cashbackCampaignForm.schedule.daysOfWeek.filter(d => d !== day.value) : [...cashbackCampaignForm.schedule.daysOfWeek, day.value]; setCashbackCampaignForm({ ...cashbackCampaignForm, schedule: { ...cashbackCampaignForm.schedule, daysOfWeek: days } }); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${cashbackCampaignForm.schedule.daysOfWeek.includes(day.value) ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-[#1e3a5f]/20 text-[#1e3a5f]/60 hover:border-[#1e3a5f]/40'}`}>{day.label}</button>
                          ))}
                        </div>
                        <p className="text-xs text-[#1e3a5f]/40 mt-2">Selecione os dias em que a campanha estara ativa</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 bg-[#1e3a5f]/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-[#1e3a5f] text-sm">Restricoes (Opcional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Cashback Maximo (R$)</label>
                      <input type="number" value={cashbackCampaignForm.maxCashbackValue} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, maxCashbackValue: e.target.value })} placeholder="Sem limite" min="0" step="0.01" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Usos por Cliente</label>
                      <input type="number" value={cashbackCampaignForm.maxUsesPerUser} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, maxUsesPerUser: e.target.value })} placeholder="Ilimitado" min="1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Categorias (deixe vazio para todas)</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button key={cat.value} type="button" onClick={() => { const cats = cashbackCampaignForm.categories.includes(cat.value) ? cashbackCampaignForm.categories.filter(c => c !== cat.value) : [...cashbackCampaignForm.categories, cat.value]; setCashbackCampaignForm({ ...cashbackCampaignForm, categories: cats }); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cashbackCampaignForm.categories.includes(cat.value) ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-[#1e3a5f]/20 text-[#1e3a5f]/60 hover:border-[#1e3a5f]/40'}`}>{cat.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cashbackCampaignForm.isActive} onChange={(e) => setCashbackCampaignForm({ ...cashbackCampaignForm, isActive: e.target.checked })} className="w-4 h-4 text-[#1e3a5f] border-[#1e3a5f]/30 rounded focus:ring-[#1e3a5f]" />
                  <span className="text-sm text-[#1e3a5f]">Campanha ativa</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-end gap-3">
                <button type="button" onClick={closeCashbackCampaignModal} className="px-5 py-2.5 rounded-xl font-medium text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all">{editingCashbackCampaign ? 'Salvar Alteracoes' : 'Criar Campanha'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cashback Settings Modal */}
      {isCashbackSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={closeCashbackSettingsModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-[#1e3a5f]/10 bg-[#faf8f5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e3a5f]">Configuracoes de Cashback</h3>
              <button onClick={closeCashbackSettingsModal} className="p-2 hover:bg-[#1e3a5f]/10 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-[#1e3a5f]" /></button>
            </div>
            <form onSubmit={handleSaveCashbackSettings} className="p-6 space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#1e3a5f]/5 rounded-xl">
                <span className="font-medium text-[#1e3a5f]">Cashback Ativo</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={cashbackSettingsForm.isEnabled} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, isEnabled: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#1e3a5f]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                </label>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">% Padrao</label>
                  <input type="number" value={cashbackSettingsForm.defaultPercentage} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, defaultPercentage: e.target.value })} min="0" max="100" step="0.1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Expiracao (dias)</label>
                  <input type="number" value={cashbackSettingsForm.defaultExpirationDays} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, defaultExpirationDays: e.target.value })} min="1" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Valor Min. Resgate (R$)</label>
                  <input type="number" value={cashbackSettingsForm.minRedeemValue} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, minRedeemValue: e.target.value })} min="0" step="0.01" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Max % Resgate</label>
                  <input type="number" value={cashbackSettingsForm.maxRedeemPercentage} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, maxRedeemPercentage: e.target.value })} min="0" max="100" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Valor Max. Resgate (R$)</label>
                <input type="number" value={cashbackSettingsForm.maxRedeemValue} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, maxRedeemValue: e.target.value })} min="0" step="0.01" placeholder="Sem limite" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Mensagem de Exibicao</label>
                <input type="text" value={cashbackSettingsForm.displayMessage} onChange={(e) => setCashbackSettingsForm({ ...cashbackSettingsForm, displayMessage: e.target.value })} placeholder="Ex: Ganhe cashback em todas as compras!" className="w-full p-3 border border-[#1e3a5f]/20 rounded-xl" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeCashbackSettingsModal} className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-down { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

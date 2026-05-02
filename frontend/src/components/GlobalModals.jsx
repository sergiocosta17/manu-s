import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import CheckoutModal from './CheckoutModal';

// ÍCONES SVG
const Icons = {
  Cart: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Clipboard: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Fire: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  Sparkles: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Motorcycle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  Package: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Gift: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  XCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  LocationMarker: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Store: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Ticket: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Error: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Edit: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Minus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
    </svg>
  ),
  Alert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

// Query para buscar produto com opcionais
const GET_PRODUCT = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      promotionalPrice
      imageUrl
      category
      addonGroups {
        id
        name
        description
        selectionType
        minSelection
        maxSelection
        isRequired
        addons {
          id
          name
          price
          isAvailable
        }
      }
    }
  }
`;

export default function GlobalModals() {
  const {
    isCartOpen,
    setIsCartOpen,
    isTrackingOpen,
    setIsTrackingOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    updateCartItem,
    getCartTotal,
    activeTrackingOrders,
    fetchMyOrders,
    handleConfirmDelivery,
    // Cupom
    appliedCoupon,
    couponDiscount,
    couponFreeShipping,
    applyCoupon,
    clearCoupon,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  
  // Estados para cupom no carrinho
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Estados para edição de item
  const [editingItem, setEditingItem] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSelectedAddons, setEditSelectedAddons] = useState({});
  const [editObservation, setEditObservation] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editValidationErrors, setEditValidationErrors] = useState({});

  useEffect(() => {
    if (!isTrackingOpen) return;
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [isTrackingOpen, fetchMyOrders]);

  // Limpa mensagens de cupom quando carrinho fecha
  useEffect(() => {
    if (!isCartOpen) {
      setCouponError('');
      setCouponSuccess('');
      if (!appliedCoupon) {
        setCouponCode('');
      }
    }
  }, [isCartOpen, appliedCoupon]);

  // Limpa erro de confirmação quando modal fecha
  useEffect(() => {
    if (!isTrackingOpen) {
      setConfirmError(null);
    }
  }, [isTrackingOpen]);

  // ============================================
  // FUNÇÕES DE EDIÇÃO DE ITEM
  // ============================================

  const openEditModal = async (item, index) => {
    setEditingItem(item);
    setEditingItemIndex(index);
    setEditLoading(true);
    setEditObservation(item.observation || '');
    setEditQuantity(item.quantity);
    setEditValidationErrors({});

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          query: GET_PRODUCT,
          variables: { id: item.id },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const product = result.data?.product;
      setEditProduct(product);

      // Inicializar seleções baseadas nos opcionais já selecionados no item
      const initialSelections = {};
      product?.addonGroups?.forEach(group => {
        initialSelections[group.id] = [];
        
        // Verificar quais addons já estão selecionados
        if (item.selectedAddons && item.selectedAddons.length > 0) {
          group.addons.forEach(addon => {
            const isSelected = item.selectedAddons.some(
              selected => selected.addonId === addon.id || selected.name === addon.name
            );
            if (isSelected) {
              initialSelections[group.id].push(addon);
            }
          });
        }
      });
      setEditSelectedAddons(initialSelections);

    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      alert('Erro ao carregar detalhes do produto');
      closeEditModal();
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditingItemIndex(null);
    setEditProduct(null);
    setEditSelectedAddons({});
    setEditObservation('');
    setEditQuantity(1);
    setEditValidationErrors({});
  };

  const handleEditAddonSelect = (groupId, addon, group) => {
    setEditSelectedAddons(prev => {
      const currentSelections = prev[groupId] || [];
      
      if (group.selectionType === 'SINGLE') {
        if (currentSelections.some(a => a.id === addon.id)) {
          if (group.isRequired || group.minSelection > 0) {
            return prev;
          }
          return { ...prev, [groupId]: [] };
        }
        return { ...prev, [groupId]: [addon] };
      } else {
        const isSelected = currentSelections.some(a => a.id === addon.id);
        
        if (isSelected) {
          return { 
            ...prev, 
            [groupId]: currentSelections.filter(a => a.id !== addon.id) 
          };
        } else {
          if (currentSelections.length >= group.maxSelection) {
            return prev;
          }
          return { 
            ...prev, 
            [groupId]: [...currentSelections, addon] 
          };
        }
      }
    });
    
    setEditValidationErrors(prev => ({ ...prev, [groupId]: null }));
  };

  const isEditAddonSelected = (groupId, addonId) => {
    return (editSelectedAddons[groupId] || []).some(a => a.id === addonId);
  };

  const getEditGroupSelectionCount = (groupId) => {
    return (editSelectedAddons[groupId] || []).length;
  };

  const calculateEditAddonsTotal = () => {
    let total = 0;
    Object.values(editSelectedAddons).forEach(addons => {
      addons.forEach(addon => {
        total += Number(addon.price) || 0;
      });
    });
    return total;
  };

  const validateEditAddons = () => {
    const errors = {};
    let isValid = true;

    editProduct?.addonGroups?.forEach(group => {
      const selectionCount = getEditGroupSelectionCount(group.id);
      
      if (group.isRequired && selectionCount === 0) {
        errors[group.id] = `Selecione pelo menos ${group.minSelection || 1} opção`;
        isValid = false;
      } else if (selectionCount < group.minSelection) {
        errors[group.id] = `Selecione pelo menos ${group.minSelection} ${group.minSelection === 1 ? 'opção' : 'opções'}`;
        isValid = false;
      }
    });

    setEditValidationErrors(errors);
    return isValid;
  };

  const getEditSelectedAddonsForCart = () => {
    const result = [];
    Object.entries(editSelectedAddons).forEach(([groupId, addons]) => {
      addons.forEach(addon => {
        result.push({
          addonId: addon.id,
          name: addon.name,
          price: Number(addon.price) || 0,
          quantity: 1
        });
      });
    });
    return result;
  };

  const getEditCurrentPrice = () => {
    if (!editProduct) return editingItem?.price || 0;
    const hasPromo = editProduct.promotionalPrice && Number(editProduct.promotionalPrice) > 0;
    return hasPromo ? Number(editProduct.promotionalPrice) : Number(editProduct.price);
  };

  const getEditTotal = () => {
    const basePrice = getEditCurrentPrice();
    const addonsTotal = calculateEditAddonsTotal();
    return (basePrice + addonsTotal) * editQuantity;
  };

  const handleSaveEdit = () => {
    if (!validateEditAddons()) {
      return;
    }

    const newSelectedAddons = getEditSelectedAddonsForCart();
    const newAddonsTotal = calculateEditAddonsTotal();

    // Atualizar o item no carrinho
    updateCartItem(editingItemIndex, {
      quantity: editQuantity,
      observation: editObservation,
      selectedAddons: newSelectedAddons,
      addonsTotal: newAddonsTotal,
    });

    closeEditModal();
  };

  // Handler para aplicar cupom
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const result = await applyCoupon(couponCode.trim());
      
      if (result.valid) {
        setCouponSuccess(result.message || 'Cupom aplicado com sucesso!');
        setCouponCode('');
      } else {
        setCouponError(result.message || 'Cupom inválido');
      }
    } catch (err) {
      setCouponError('Erro ao aplicar cupom');
    } finally {
      setCouponLoading(false);
    }
  };

  // Handler para remover cupom
  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const getStatusInfo = (status, deliveryType = 'DELIVERY') => {
    const isPickup = deliveryType === 'PICKUP';

    const baseStatusMap = {
      PLACED: {
        label: 'Pedido Recebido',
        icon: <Icons.Clipboard className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 1,
        description: 'Aguardando confirmação do restaurante',
      },
      CONFIRMED: {
        label: 'Confirmado',
        icon: <Icons.CheckCircle className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 1,
        description: 'Pedido confirmado pelo restaurante',
      },
      PENDING: {
        label: 'Pedido Recebido',
        icon: <Icons.Clipboard className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 1,
        description: 'Aguardando confirmação',
      },
      PREPARING: {
        label: 'Em Preparo',
        icon: <Icons.Fire className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/20',
        border: 'border-[#1e3a5f]/30',
        step: 2,
        description: 'Seu pedido está sendo preparado',
      },
      COMPLETED: {
        label: 'Finalizado',
        icon: <Icons.CheckCircle className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 4,
        description: 'Pedido concluído com sucesso!',
      },
      CANCELLED: {
        label: 'Cancelado',
        icon: <Icons.XCircle className="w-4 h-4" />,
        color: 'text-[#1e3a5f]/50',
        bg: 'bg-[#1e3a5f]/5',
        border: 'border-[#1e3a5f]/10',
        step: 0,
        description: 'Este pedido foi cancelado',
      },
    };

    const pickupStatusMap = {
      ...baseStatusMap,
      READY: {
        label: 'Pronto para Retirada',
        icon: <Icons.Bell className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/20',
        border: 'border-[#1e3a5f]/30',
        step: 3,
        description: 'Seu pedido está pronto! Venha retirar',
      },
      OUT_FOR_DELIVERY: {
        label: 'Pronto para Retirada',
        icon: <Icons.Package className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/30',
        border: 'border-[#1e3a5f]/40',
        step: 3,
        description: 'Seu pedido está pronto! Venha retirar no balcão',
      },
      READY_FOR_PICKUP: {
        label: 'Pronto para Retirada',
        icon: <Icons.Package className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/30',
        border: 'border-[#1e3a5f]/40',
        step: 3,
        description: 'Seu pedido está pronto! Venha retirar no balcão',
      },
      DELIVERED: {
        label: 'Retirado',
        icon: <Icons.Gift className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 4,
        description: 'Confirme a retirada do seu pedido',
      },
      PICKED_UP: {
        label: 'Retirado',
        icon: <Icons.Gift className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 4,
        description: 'Confirme a retirada do seu pedido',
      },
    };

    const deliveryStatusMap = {
      ...baseStatusMap,
      READY: {
        label: 'Pronto',
        icon: <Icons.Sparkles className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/20',
        border: 'border-[#1e3a5f]/30',
        step: 3,
        description: 'Pedido pronto! Saindo para entrega',
      },
      OUT_FOR_DELIVERY: {
        label: 'Saiu para Entrega',
        icon: <Icons.Motorcycle className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/30',
        border: 'border-[#1e3a5f]/40',
        step: 3,
        description: 'O entregador está a caminho',
      },
      DELIVERED: {
        label: 'Entregue',
        icon: <Icons.Gift className="w-4 h-4" />,
        color: 'text-[#1e3a5f]',
        bg: 'bg-[#1e3a5f]/10',
        border: 'border-[#1e3a5f]/20',
        step: 4,
        description: 'Confirme o recebimento do seu pedido',
      },
    };

    const statusMap = isPickup ? pickupStatusMap : deliveryStatusMap;
    return statusMap[status] || baseStatusMap.PENDING;
  };

  const needsConfirmation = (order) => {
    return ['DELIVERED', 'PICKED_UP'].includes(order.status);
  };

  const getConfirmationTexts = (order) => {
    const isPickup = order.deliveryType === 'PICKUP';
    if (isPickup) {
      return {
        title: 'Pedido retirado!',
        subtitle: 'Por favor, confirme a retirada',
        buttonText: 'Confirmar Retirada',
        icon: <Icons.Package className="w-5 h-5" />,
      };
    }
    return {
      title: 'Seu pedido chegou!',
      subtitle: 'Por favor, confirme o recebimento',
      buttonText: 'Confirmar Recebimento',
      icon: <Icons.Gift className="w-5 h-5" />,
    };
  };

  const formatTime = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onConfirmDelivery = async (orderId) => {
    if (confirmingOrderId) return;
    
    setConfirmingOrderId(orderId);
    setConfirmError(null);
    
    try {
      const result = await handleConfirmDelivery(orderId);
      
      if (result && !result.success) {
        setConfirmError(result.message || 'Erro ao confirmar');
      } else {
        await fetchMyOrders();
      }
    } catch (err) {
      console.error('Erro ao confirmar:', err);
      setConfirmError('Erro ao confirmar. Tente novamente.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const deliveryFee = 5.0;
  const cartTotal = getCartTotal();
  const finalShippingFee = couponFreeShipping ? 0 : deliveryFee;
  const orderTotal = cartTotal - couponDiscount + finalShippingFee;

  const hasAddons = editProduct?.addonGroups && editProduct.addonGroups.length > 0;

  return (
    <>
      {/* MODAL DO CARRINHO */}
      {isCartOpen && !editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Header do carrinho */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icons.Cart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Seu Carrinho</h2>
                    <p className="text-white/60 text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icons.Close className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Lista de itens do carrinho */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#faf8f5]">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center mb-4">
                    <Icons.Cart className="w-10 h-10 text-[#1e3a5f]/30" />
                  </div>
                  <p className="text-[#1e3a5f]/40 font-bold text-lg">Carrinho vazio</p>
                  <p className="text-[#1e3a5f]/30 text-sm mt-1">Adicione itens do cardápio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id}-${item.observation || ''}-${index}`}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-[#1e3a5f]/5"
                    >
                      <div className="flex gap-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#1e3a5f] font-bold truncate">{item.name}</h3>
                          
                          {/* Mostrar opcionais */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.selectedAddons.map((addon, idx) => (
                                <p key={idx} className="text-xs text-[#1e3a5f]/50">
                                  + {addon.name} {addon.price > 0 && `(R$ ${Number(addon.price).toFixed(2).replace('.', ',')})`}
                                </p>
                              ))}
                            </div>
                          )}
                          
                          {/* Mostrar observação */}
                          {item.observation && (
                            <p className="text-xs text-[#1e3a5f]/40 mt-1 italic truncate">
                              Obs: {item.observation}
                            </p>
                          )}
                          
                          <p className="text-[#1e3a5f] font-black text-lg mt-1">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-[#faf8f5] rounded-xl p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.observation, item.selectedAddons, index)}
                                className="w-8 h-8 rounded-lg bg-white border border-[#1e3a5f]/10 text-[#1e3a5f] font-bold hover:bg-[#1e3a5f] hover:text-white transition-colors flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="text-[#1e3a5f] font-bold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.observation, item.selectedAddons, index)}
                                className="w-8 h-8 rounded-lg bg-white border border-[#1e3a5f]/10 text-[#1e3a5f] font-bold hover:bg-[#1e3a5f] hover:text-white transition-colors flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Botão de editar */}
                              <button
                                onClick={() => openEditModal(item, index)}
                                className="p-2 text-[#1e3a5f]/40 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-lg transition-colors"
                                title="Editar item"
                              >
                                <Icons.Edit className="w-5 h-5" />
                              </button>
                              
                              {/* Botão de remover */}
                              <button
                                onClick={() => removeFromCart(item.id, item.observation, item.selectedAddons, index)}
                                className="p-2 text-[#1e3a5f]/40 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-lg transition-colors"
                                title="Remover item"
                              >
                                <Icons.Trash className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* SEÇÃO DE CUPOM NO CARRINHO */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1e3a5f]/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Icons.Ticket className="w-5 h-5 text-[#1e3a5f]" />
                      <span className="font-bold text-[#1e3a5f] text-sm">Cupom de Desconto</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-3 border border-[#1e3a5f]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                              <Icons.CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1e3a5f] text-sm">{appliedCoupon.code}</p>
                              <p className="text-[#1e3a5f]/50 text-xs">{appliedCoupon.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-[#1e3a5f]/40 hover:text-[#1e3a5f] p-1 hover:bg-[#1e3a5f]/10 rounded-lg transition-colors"
                          >
                            <Icons.Close className="w-4 h-4" />
                          </button>
                        </div>
                        {couponDiscount > 0 && (
                          <p className="text-[#1e3a5f] font-bold text-sm mt-2">
                            -R$ {couponDiscount.toFixed(2).replace('.', ',')}
                          </p>
                        )}
                        {couponFreeShipping && (
                          <div className="flex items-center gap-1 text-[#1e3a5f] font-medium text-xs mt-1">
                            <Icons.Motorcycle className="w-3 h-3" />
                            <span>Frete grátis aplicado!</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            placeholder="Digite o código"
                            className="flex-1 bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]/30 uppercase"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleApplyCoupon();
                            }}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-[#1e3a5f]/30 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2"
                          >
                            {couponLoading ? (
                              <Icons.Spinner className="w-4 h-4" />
                            ) : (
                              'Aplicar'
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <Icons.XCircle className="w-3 h-3" />
                            {couponError}
                          </p>
                        )}
                        {couponSuccess && (
                          <p className="text-[#1e3a5f] text-xs flex items-center gap-1">
                            <Icons.CheckCircle className="w-3 h-3" />
                            {couponSuccess}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer com resumo e botão de finalizar */}
            {cartItems.length > 0 && (
              <div className="bg-white border-t border-[#1e3a5f]/10 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[#1e3a5f]/60 text-sm">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#1e3a5f] text-sm">
                      <span className="flex items-center gap-1">
                        <Icons.Ticket className="w-3 h-3" />
                        Desconto do cupom
                      </span>
                      <span>-R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-[#1e3a5f]/60 text-sm">
                    <span>Taxa de entrega</span>
                    <span className={couponFreeShipping ? 'line-through text-[#1e3a5f]/30' : ''}>
                      R$ {deliveryFee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  {couponFreeShipping && (
                    <div className="flex justify-between text-[#1e3a5f] text-sm">
                      <span className="flex items-center gap-1">
                        <Icons.Motorcycle className="w-3 h-3" />
                        Frete grátis
                      </span>
                      <span>-R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-[#1e3a5f]/10 pt-3 flex justify-between items-center">
                    <span className="text-[#1e3a5f] font-bold">Total</span>
                    <span className="text-[#1e3a5f] font-black text-2xl">
                      R$ {orderTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#1e3a5f]/20 flex items-center justify-center gap-2"
                >
                  Finalizar Pedido
                  <Icons.ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE ITEM */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeEditModal}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Icons.ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white">Editar Item</h2>
                    <p className="text-white/60 text-sm truncate max-w-[200px]">{editingItem.name}</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icons.Close className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#faf8f5]">
              {editLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Icons.Spinner className="w-10 h-10 text-[#1e3a5f]" />
                  <p className="text-[#1e3a5f]/50 mt-4">Carregando opções...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Imagem e info do produto */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1e3a5f]/5">
                    <div className="flex gap-4">
                      {(editProduct?.imageUrl || editingItem.imageUrl) && (
                        <img
                          src={editProduct?.imageUrl || editingItem.imageUrl}
                          alt={editingItem.name}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-[#1e3a5f] font-bold text-lg">{editingItem.name}</h3>
                        {editProduct?.description && (
                          <p className="text-[#1e3a5f]/50 text-sm mt-1 line-clamp-2">
                            {editProduct.description}
                          </p>
                        )}
                        <p className="text-[#1e3a5f] font-bold text-xl mt-2">
                          R$ {getEditCurrentPrice().toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1e3a5f]/5">
                    <p className="text-sm text-[#1e3a5f]/50 mb-3">Quantidade</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setEditQuantity(prev => Math.max(1, prev - 1))}
                          disabled={editQuantity <= 1}
                          className="w-12 h-12 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Icons.Minus className="w-5 h-5 text-[#1e3a5f]" />
                        </button>
                        <span className="text-2xl font-bold text-[#1e3a5f] w-8 text-center">
                          {editQuantity}
                        </span>
                        <button
                          onClick={() => setEditQuantity(prev => Math.min(99, prev + 1))}
                          disabled={editQuantity >= 99}
                          className="w-12 h-12 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Icons.Plus className="w-5 h-5 text-[#1e3a5f]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Opcionais */}
                  {hasAddons && (
                    <div className="space-y-4">
                      {editProduct.addonGroups.map((group) => {
                        const selectionCount = getEditGroupSelectionCount(group.id);
                        const hasError = editValidationErrors[group.id];
                        const availableAddons = group.addons.filter(a => a.isAvailable !== false);
                        
                        if (availableAddons.length === 0) return null;

                        return (
                          <div 
                            key={group.id} 
                            className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                              hasError 
                                ? 'border-red-300 bg-red-50/30' 
                                : 'border-[#1e3a5f]/5'
                            }`}
                          >
                            {/* Header do grupo */}
                            <div className="p-4 border-b border-[#1e3a5f]/5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[#1e3a5f]">{group.name}</h3>
                                    {group.isRequired && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e3a5f] text-white">
                                        Obrigatório
                                      </span>
                                    )}
                                  </div>
                                  {group.description && (
                                    <p className="text-xs text-[#1e3a5f]/50 mt-1">{group.description}</p>
                                  )}
                                  <p className="text-xs text-[#1e3a5f]/40 mt-1">
                                    {group.selectionType === 'SINGLE' 
                                      ? 'Escolha 1 opção'
                                      : group.minSelection > 0 
                                        ? `Escolha de ${group.minSelection} a ${group.maxSelection} opções`
                                        : `Escolha até ${group.maxSelection} ${group.maxSelection === 1 ? 'opção' : 'opções'}`
                                    }
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`text-sm font-medium ${
                                    selectionCount > 0 ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/30'
                                  }`}>
                                    {selectionCount}/{group.selectionType === 'SINGLE' ? 1 : group.maxSelection}
                                  </span>
                                </div>
                              </div>
                              {hasError && (
                                <div className="flex items-center gap-2 mt-2 text-red-500">
                                  <Icons.Alert className="w-4 h-4" />
                                  <span className="text-xs font-medium">{hasError}</span>
                                </div>
                              )}
                            </div>

                            {/* Lista de opcionais */}
                            <div className="divide-y divide-[#1e3a5f]/5">
                              {availableAddons.map((addon) => {
                                const isSelected = isEditAddonSelected(group.id, addon.id);
                                const isDisabled = !isSelected && 
                                  group.selectionType === 'MULTIPLE' && 
                                  selectionCount >= group.maxSelection;

                                return (
                                  <button
                                    key={addon.id}
                                    type="button"
                                    onClick={() => handleEditAddonSelect(group.id, addon, group)}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                                      isSelected 
                                        ? 'bg-[#1e3a5f]/5' 
                                        : isDisabled 
                                          ? 'opacity-40 cursor-not-allowed' 
                                          : 'hover:bg-[#faf8f5]'
                                    }`}
                                  >
                                    {/* Ícone de seleção */}
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-${group.selectionType === 'SINGLE' ? 'full' : 'lg'} border-2 flex items-center justify-center transition-all ${
                                      isSelected 
                                        ? 'bg-[#1e3a5f] border-[#1e3a5f]' 
                                        : 'border-[#1e3a5f]/20'
                                    }`}>
                                      {isSelected && (
                                        <Icons.Check className="w-4 h-4 text-white" />
                                      )}
                                    </div>

                                    {/* Nome do opcional */}
                                    <span className={`flex-grow font-medium ${
                                      isSelected ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/70'
                                    }`}>
                                      {addon.name}
                                    </span>

                                    {/* Preço */}
                                    {addon.price > 0 && (
                                      <span className={`font-semibold ${
                                        isSelected ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/50'
                                      }`}>
                                        + R$ {Number(addon.price).toFixed(2).replace('.', ',')}
                                      </span>
                                    )}
                                    {addon.price === 0 && (
                                      <span className="text-xs text-[#1e3a5f]/30 font-medium">
                                        Grátis
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Observações */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1e3a5f]/5">
                    <p className="text-sm text-[#1e3a5f]/50 mb-3">
                      Observações (opcional)
                    </p>
                    <textarea
                      value={editObservation}
                      onChange={(e) => setEditObservation(e.target.value)}
                      placeholder="Ex: sem cebola, molho separado..."
                      maxLength={200}
                      className="w-full h-24 resize-none rounded-xl border border-[#1e3a5f]/10 p-3 text-sm outline-none focus:border-[#1e3a5f] bg-[#faf8f5]"
                    />
                    <div className="text-right text-xs text-[#1e3a5f]/30 mt-1">
                      {editObservation.length}/200
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer com total e botão salvar */}
            {!editLoading && (
              <div className="bg-white border-t border-[#1e3a5f]/10 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#1e3a5f]/50">Total do item</p>
                    {calculateEditAddonsTotal() > 0 && (
                      <p className="text-xs text-[#1e3a5f]/40">
                        (+ R$ {calculateEditAddonsTotal().toFixed(2).replace('.', ',')} em opcionais)
                      </p>
                    )}
                  </div>
                  <span className="text-[#1e3a5f] font-black text-2xl">
                    R$ {getEditTotal().toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={handleSaveEdit}
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#1e3a5f]/20 flex items-center justify-center gap-2"
                >
                  <Icons.Check className="w-5 h-5" />
                  Salvar Alterações
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />

      {/* MODAL DE ACOMPANHAR PEDIDOS */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
            onClick={() => setIsTrackingOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-4 sm:p-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Meus Pedidos</h2>
                  <p className="text-white/60 text-xs sm:text-sm flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Atualizando em tempo real
                  </p>
                </div>
                <button
                  onClick={() => setIsTrackingOpen(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icons.Close className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Erro global */}
            {confirmError && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <Icons.Error className="w-4 h-4 flex-shrink-0" />
                <span>{confirmError}</span>
                <button 
                  onClick={() => setConfirmError(null)}
                  className="ml-auto p-1 hover:bg-red-100 rounded"
                >
                  <Icons.Close className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Lista de pedidos ativos */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#faf8f5]">
              {activeTrackingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center mb-4">
                    <Icons.Clipboard className="w-10 h-10 text-[#1e3a5f]/30" />
                  </div>
                  <p className="text-[#1e3a5f]/40 font-bold text-lg">Nenhum pedido ativo</p>
                  <p className="text-[#1e3a5f]/30 text-sm mt-1">Seus pedidos aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {activeTrackingOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status, order.deliveryType);
                    const showConfirmation = needsConfirmation(order);
                    const confirmTexts = getConfirmationTexts(order);
                    const isCancelled = order.status === 'CANCELLED';
                    const isPickup = order.deliveryType === 'PICKUP';
                    const isConfirming = confirmingOrderId === order.id;
                    const isReadyForPickup = isPickup && ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'READY'].includes(order.status);

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${
                          showConfirmation 
                            ? 'border-[#1e3a5f]/30 shadow-[#1e3a5f]/10' 
                            : isReadyForPickup
                              ? 'border-[#1e3a5f]/40 shadow-[#1e3a5f]/15'
                              : isCancelled
                                ? 'border-[#1e3a5f]/10'
                                : 'border-[#1e3a5f]/5'
                        }`}
                      >
                        {/* Cabeçalho do pedido */}
                        <div className="p-3 sm:p-4 border-b border-[#1e3a5f]/5">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-xs font-bold text-[#1e3a5f]/40">
                                  #{order.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-1 bg-[#1e3a5f]/10 text-[#1e3a5f]">
                                  {isPickup ? <Icons.Store className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Icons.Motorcycle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                  {isPickup ? 'Retirada' : 'Entrega'}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#1e3a5f]/40 mt-1 flex items-center gap-1">
                                <Icons.Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {formatTime(order.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border`}
                            >
                              {statusInfo.icon}
                              <span className="hidden xs:inline">{statusInfo.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Timeline de progresso */}
                        {!isCancelled && (
                          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-[#faf8f5]">
                            <div className="flex gap-1 mb-1.5 sm:mb-2">
                              {[1, 2, 3, 4].map((step) => (
                                <div
                                  key={step}
                                  className={`flex-1 h-1 sm:h-1.5 rounded-full transition-all duration-500 ${
                                    step <= statusInfo.step
                                      ? 'bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f]'
                                      : 'bg-[#1e3a5f]/10'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] sm:text-xs text-[#1e3a5f]/60 text-center">
                              {statusInfo.description}
                            </p>
                          </div>
                        )}

                        {/* Mensagem para pedidos cancelados */}
                        {isCancelled && (
                          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-[#1e3a5f]/5">
                            <p className="text-[#1e3a5f]/60 font-medium text-xs sm:text-sm text-center flex items-center justify-center gap-2">
                              <Icons.XCircle className="w-4 h-4" />
                              {statusInfo.description}
                            </p>
                          </div>
                        )}

                        {/* Endereço de entrega */}
                        {!isPickup && order.deliveryAddress && (
                          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-[#1e3a5f]/5 border-t border-[#1e3a5f]/10">
                            <p className="text-[10px] sm:text-xs font-bold text-[#1e3a5f] mb-0.5 sm:mb-1 flex items-center gap-1">
                              <Icons.LocationMarker className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              Entregar em:
                            </p>
                            <p className="text-[10px] sm:text-xs text-[#1e3a5f]/70">
                              {order.deliveryAddress.street}, {order.deliveryAddress.number}
                              {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
                            </p>
                          </div>
                        )}

                        {/* Aviso especial para pedidos prontos para retirada */}
                        {isReadyForPickup && (
                          <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-[#1e3a5f]/15 to-[#1e3a5f]/5 border-t border-[#1e3a5f]/20">
                            <div className="flex items-center justify-center gap-2 text-[#1e3a5f]">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center animate-pulse">
                                <Icons.Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-sm sm:text-base">Pedido pronto!</p>
                                <p className="text-[10px] sm:text-xs text-[#1e3a5f]/70">Retire seu pedido no balcão</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lista de itens do pedido */}
                        <div className="p-3 sm:p-4">
                          <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs sm:text-sm">
                                <span className="text-[#1e3a5f]/70">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-medium text-[#1e3a5f]">
                                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Mostrar cashback ganho se houver */}
                          {order.cashbackEarned > 0 && order.status !== 'CANCELLED' && (
                            <div className="flex items-center gap-2 py-2 px-3 bg-[#1e3a5f]/5 rounded-lg mb-2">
                              <Icons.Sparkles className="w-4 h-4 text-[#1e3a5f]" />
                              <span className="text-xs text-[#1e3a5f] font-medium">
                                +R$ {order.cashbackEarned.toFixed(2).replace('.', ',')} de cashback
                              </span>
                            </div>
                          )}
                          
                          <div className="border-t border-[#1e3a5f]/10 pt-2 sm:pt-3 flex justify-between">
                            <span className="font-bold text-[#1e3a5f] text-sm">Total</span>
                            <span className="font-black text-[#1e3a5f] text-base sm:text-lg">
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                        {/* Botão de confirmação */}
                        {showConfirmation && (
                          <div className="p-3 sm:p-4 bg-[#1e3a5f]/10 border-t border-[#1e3a5f]/20">
                            <div className="text-center mb-2 sm:mb-3">
                              <p className="text-[#1e3a5f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                                {confirmTexts.icon}
                                {confirmTexts.title}
                              </p>
                              <p className="text-[#1e3a5f]/60 text-[10px] sm:text-xs">
                                {confirmTexts.subtitle}
                              </p>
                            </div>
                            <button
                              onClick={() => onConfirmDelivery(order.id)}
                              disabled={isConfirming}
                              className={`w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#2d4a6f] hover:to-[#1e3a5f] text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all flex items-center justify-center gap-2 text-sm ${
                                isConfirming ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              {isConfirming ? (
                                <>
                                  <Icons.Spinner className="w-4 h-4 sm:w-5 sm:h-5" />
                                  Confirmando...
                                </>
                              ) : (
                                <>
                                  <Icons.Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                  {confirmTexts.buttonText}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
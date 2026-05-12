// components/CheckoutModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import PaymentModal from './PaymentModal';

// Configuração da área de entrega
const DELIVERY_CONFIG = {
  allowedCity: 'Campina Grande',
  allowedState: 'PB',
  allowedCityNormalized: 'CAMPINA GRANDE',
  allowedStateNormalized: 'PB'
};

// Função para normalizar strings
const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Função para validar área de entrega
const isValidDeliveryArea = (city, state) => {
  const normalizedCity = normalizeString(city);
  const normalizedState = normalizeString(state);
  const validCities = ['CAMPINA GRANDE'];
  const validStates = ['PB', 'PARAIBA'];
  return validCities.includes(normalizedCity) && validStates.includes(normalizedState);
};

// ÍCONES SVG
const Icons = {
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Motorcycle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  Store: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  LocationMarker: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  LocationOff: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Phone: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  Error: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  Info: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  MapPin: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Ticket: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Wallet: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Sparkles: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  XCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export default function CheckoutModal({ isOpen, onClose }) {
  const { 
    cart, 
    getCartTotal, 
    clearCart,
    // Cupom
    appliedCoupon,
    couponDiscount,
    couponFreeShipping,
    applyCoupon,
    clearCoupon,
    // Cashback
    cashbackToUse,
    setCashbackToUse,
    userCashbackBalance,
    cashbackSettings,
    fetchCashbackBalance,
  } = useCart();
  
  // Estados locais
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [deliveryAreaError, setDeliveryAreaError] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deliveryType, setDeliveryType] = useState('DELIVERY');
  const [storeAddress, setStoreAddress] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);

  // Estados para cupom (no checkout)
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Estados para cashback
  const [cashbackInputValue, setCashbackInputValue] = useState('');
  const [cashbackError, setCashbackError] = useState('');
  const [cashbackToEarn, setCashbackToEarn] = useState(0);

  // Estados para feedback visual
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  // Cálculo de valores
  const baseShippingFee = 5.0;
  const subtotal = getCartTotal();
  const shippingFee = deliveryType === 'DELIVERY' ? (couponFreeShipping ? 0 : baseShippingFee) : 0;
  const total = Math.max(0, subtotal - couponDiscount - cashbackToUse + shippingFee);

  // Bloqueia scroll
  useEffect(() => {
    if (isOpen || showPaymentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showPaymentModal]);

  // Carrega dados quando modal abre
  useEffect(() => {
    if (isOpen) {
      fetchUserAddresses();
      fetchStoreAddress();
      fetchCashbackBalance();
      fetchCashbackPreview();
    }
  }, [isOpen]);

  // Atualiza preview de cashback quando valores mudam
  useEffect(() => {
    if (isOpen) {
      fetchCashbackPreview();
    }
  }, [subtotal, couponDiscount, cashbackToUse, appliedCoupon]);

  // Busca preview do cashback a ganhar
  const fetchCashbackPreview = async () => {
    const token = localStorage.getItem('token');
    if (!token || cart.length === 0) return;

    try {
      const items = cart.map(item => ({
        product: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category || 'BURGER'
      }));

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query PreviewOrderDiscounts($input: OrderPreviewInput!) {
            previewOrderDiscounts(input: $input) {
              cashbackToEarn
              cashbackToEarnExpiration
            }
          }`,
          variables: {
            input: {
              items,
              subtotal,
              shippingFee: deliveryType === 'DELIVERY' ? baseShippingFee : 0,
              couponCode: appliedCoupon?.code || null,
              cashbackToUse: cashbackToUse || 0,
              deliveryType
            }
          }
        }),
      });

      const result = await response.json();
      if (result.data?.previewOrderDiscounts) {
        setCashbackToEarn(result.data.previewOrderDiscounts.cashbackToEarn || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar preview de cashback:', err);
    }
  };

  // Busca endereços do usuário
  const fetchUserAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query { 
            me { 
              id 
              addresses {
                id
                label
                zipCode
                street
                number
                complement
                neighborhood
                city
                state
                isDefault
              }
            } 
          }`,
        }),
      });

      const result = await response.json();
      if (result.data?.me?.addresses) {
        setSavedAddresses(result.data.me.addresses);
        const defaultAddr = result.data.me.addresses.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (result.data.me.addresses.length > 0) {
          setSelectedAddressId(result.data.me.addresses[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar endereços:', err);
      showToast('Erro ao carregar endereços salvos', 'error');
    }
  };

  // Busca endereço da loja
  const fetchStoreAddress = async () => {
    setLoadingStore(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { 
            storeInfo {
              storeName
              phone
              storeAddress {
                street
                number
                complement
                neighborhood
                city
                state
                zipCode
              }
            }
          }`,
        }),
      });

      const result = await response.json();
      
      if (result.data?.storeInfo) {
        const info = result.data.storeInfo;
        const addr = info.storeAddress;
        
        let formattedAddress = null;
        if (addr && addr.street) {
          formattedAddress = `${addr.street}, ${addr.number || 'S/N'}`;
          if (addr.complement) formattedAddress += ` - ${addr.complement}`;
          formattedAddress += ` - ${addr.neighborhood || ''}, ${addr.city || ''}/${addr.state || ''}`;
          if (addr.zipCode) formattedAddress += ` - CEP: ${addr.zipCode}`;
        }
        
        setStoreAddress({
          storeName: info.storeName || 'Nossa Loja',
          storeAddress: formattedAddress || 'Endereço não configurado pelo administrador',
          storePhone: info.phone || null
        });
      } else {
        setStoreAddress({
          storeName: 'Nossa Loja',
          storeAddress: 'Endereço não configurado pelo administrador',
          storePhone: null
        });
      }
    } catch (err) {
      console.error('Erro ao buscar endereço da loja:', err);
      setStoreAddress({
        storeName: 'Nossa Loja',
        storeAddress: 'Erro ao carregar endereço da loja',
        storePhone: null
      });
    } finally {
      setLoadingStore(false);
    }
  };

  // Consulta CEP
  const fetchAddressByCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    setCepError('');
    setDeliveryAreaError(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        showToast('CEP não encontrado', 'error');
        return;
      }

      if (!isValidDeliveryArea(data.localidade, data.uf)) {
        setDeliveryAreaError(true);
        setNewAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
          complement: data.complemento || prev.complement,
        }));
        showToast('Este endereço está fora da nossa área de entrega', 'error');
        return;
      }

      setNewAddress(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        complement: data.complemento || prev.complement,
      }));

      setCepError('');
      setDeliveryAreaError(false);
      showToast('Endereço encontrado!', 'success');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP');
      showToast('Erro ao buscar CEP', 'error');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    
    setNewAddress({ ...newAddress, zipCode: value });
    setCepError('');
    setDeliveryAreaError(false);

    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setNewAddress(prev => ({ ...prev, city }));
    if (newAddress.state) {
      setDeliveryAreaError(!isValidDeliveryArea(city, newAddress.state));
    }
  };

  const handleStateChange = (e) => {
    const state = e.target.value.toUpperCase();
    setNewAddress(prev => ({ ...prev, state }));
    if (newAddress.city) {
      setDeliveryAreaError(!isValidDeliveryArea(newAddress.city, state));
    }
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
        
        // Se cupom não permite cashback, limpa
        if (result.coupon && !result.coupon.allowWithCashback && cashbackToUse > 0) {
          setCashbackToUse(0);
          setCashbackInputValue('');
          showToast('Este cupom não pode ser usado com cashback', 'info');
        }
      } else {
        setCouponError(result.message || 'Cupom inválido');
      }
    } catch (err) {
      setCouponError('Erro ao aplicar cupom');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Handler para aplicar cashback
  const handleApplyCashback = () => {
    setCashbackError('');
    
    const value = parseFloat(cashbackInputValue.replace(',', '.')) || 0;
    
    if (value <= 0) {
      setCashbackError('Digite um valor válido');
      return;
    }

    if (!cashbackSettings?.isEnabled) {
      setCashbackError('Cashback está desabilitado no momento');
      return;
    }

    if (value < cashbackSettings.minRedeemValue) {
      setCashbackError(`Valor mínimo: R$ ${cashbackSettings.minRedeemValue.toFixed(2).replace('.', ',')}`);
      return;
    }

    if (value > userCashbackBalance) {
      setCashbackError('Saldo insuficiente');
      return;
    }

    // Verifica se cupom permite cashback
    if (appliedCoupon && !appliedCoupon.allowWithCashback) {
      setCashbackError('Este cupom não permite uso de cashback');
      return;
    }

    // Calcula máximo permitido
    const afterCoupon = subtotal - couponDiscount;
    const maxByPercentage = (afterCoupon * cashbackSettings.maxRedeemPercentage) / 100;
    const maxAllowed = cashbackSettings.maxRedeemValue 
      ? Math.min(maxByPercentage, cashbackSettings.maxRedeemValue, userCashbackBalance)
      : Math.min(maxByPercentage, userCashbackBalance);

    if (value > maxAllowed) {
      setCashbackError(`Máximo permitido: R$ ${maxAllowed.toFixed(2).replace('.', ',')}`);
      return;
    }

    setCashbackToUse(value);
    showToast(`R$ ${value.toFixed(2).replace('.', ',')} de cashback aplicado!`, 'success');
  };

  const handleRemoveCashback = () => {
    setCashbackToUse(0);
    setCashbackInputValue('');
    setCashbackError('');
  };

  // Aplica valor máximo de cashback
  const handleApplyMaxCashback = () => {
    if (!cashbackSettings?.isEnabled || userCashbackBalance <= 0) return;

    const afterCoupon = subtotal - couponDiscount;
    const maxByPercentage = (afterCoupon * cashbackSettings.maxRedeemPercentage) / 100;
    const maxAllowed = cashbackSettings.maxRedeemValue 
      ? Math.min(maxByPercentage, cashbackSettings.maxRedeemValue, userCashbackBalance)
      : Math.min(maxByPercentage, userCashbackBalance);

    const finalMax = Math.max(0, Math.min(maxAllowed, afterCoupon));
    
    if (finalMax >= cashbackSettings.minRedeemValue) {
      setCashbackInputValue(finalMax.toFixed(2).replace('.', ','));
      setCashbackToUse(finalMax);
      setCashbackError('');
      showToast(`R$ ${finalMax.toFixed(2).replace('.', ',')} de cashback aplicado!`, 'success');
    } else {
      setCashbackError(`Valor mínimo: R$ ${cashbackSettings.minRedeemValue.toFixed(2).replace('.', ',')}`);
    }
  };

  const canContinueToPayment = () => {
    if (deliveryType === 'PICKUP') return true;
    
    if (showNewAddress) {
      return newAddress.street && 
             newAddress.number && 
             newAddress.city && 
             newAddress.state && 
             !deliveryAreaError;
    }
    
    return !!selectedAddressId;
  };

  const handleContinueToPayment = () => {
    if (deliveryType === 'DELIVERY') {
      if (showNewAddress && deliveryAreaError) {
        showToast('O endereço informado está fora da nossa área de entrega', 'error');
        return;
      }
      
      if (!selectedAddressId && !newAddress.street) {
        showToast('Selecione ou adicione um endereço de entrega', 'error');
        return;
      }
    }
    setShowPaymentModal(true);
  };

  const getSelectedAddress = () => {
    if (deliveryType === 'PICKUP') return null;
    if (showNewAddress) return newAddress;
    return savedAddresses.find(a => a.id === selectedAddressId);
  };

  const resetNewAddressForm = () => {
    setNewAddress({
      label: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    });
    setCepError('');
    setDeliveryAreaError(false);
  };

  if (!isOpen) return null;

if (showPaymentModal) {
  return (
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => {
        setShowPaymentModal(false);
        onClose();
      }}
      onBack={() => setShowPaymentModal(false)}
      address={getSelectedAddress()}
      isNewAddress={showNewAddress && deliveryType === 'DELIVERY'}
      deliveryType={deliveryType}
      cart={cart}
      subtotal={subtotal}
      shippingFee={shippingFee}
      total={total}
      // ADICIONE ESTAS PROPS:
      couponCode={appliedCoupon?.code || null}
      couponDiscount={couponDiscount}
      couponFreeShipping={couponFreeShipping}
      cashbackToUse={cashbackToUse}
      cashbackToEarn={cashbackToEarn}
      onSuccess={() => {
        setShowPaymentModal(false);
        onClose();
        clearCart();
      }}
    />
  );
}


  // Verifica se pode usar cashback
  const canUseCashback = cashbackSettings?.isEnabled && 
                         userCashbackBalance >= (cashbackSettings?.minRedeemValue || 0) &&
                         (!appliedCoupon || appliedCoupon.allowWithCashback);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-[#1e3a5f]/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />

      <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Finalizar Pedido</h2>
              <p className="text-white/60 text-sm mt-1">Etapa 1 de 2 - Entrega e Descontos</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icons.Close className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1.5 bg-white rounded-full" />
            <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#faf8f5]">
          
          {/* Info da área de entrega */}
          <div className="bg-[#1e3a5f]/5 rounded-2xl p-4 flex items-center gap-3 border border-[#1e3a5f]/10">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
              <Icons.MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1e3a5f]">Área de Entrega</p>
              <p className="text-xs text-[#1e3a5f]/60">
                Atendemos apenas em <strong>Campina Grande - PB</strong>
              </p>
            </div>
          </div>
          
          {/* Tipo de entrega */}
          <div>
            <label className="block text-[#1e3a5f] font-bold mb-3">Como deseja receber?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('DELIVERY')}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'DELIVERY'
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                    : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                  deliveryType === 'DELIVERY' ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  <Icons.Motorcycle className="w-6 h-6" />
                </div>
                <p className="text-[#1e3a5f] font-bold text-sm">Delivery</p>
                <p className={`text-xs ${couponFreeShipping ? 'text-green-600 font-medium' : 'text-[#1e3a5f]/50'}`}>
                  {couponFreeShipping ? 'Grátis!' : 'R$ 5,00'}
                </p>
              </button>
              <button
                onClick={() => setDeliveryType('PICKUP')}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'PICKUP'
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                    : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                  deliveryType === 'PICKUP' ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  <Icons.Store className="w-6 h-6" />
                </div>
                <p className="text-[#1e3a5f] font-bold text-sm">Retirada</p>
                <p className="text-[#1e3a5f]/50 text-xs font-medium">Grátis</p>
              </button>
            </div>
          </div>

          {/* Local de retirada */}
          {deliveryType === 'PICKUP' && (
            <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/10 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Icons.LocationMarker className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#1e3a5f]/50 text-xs font-medium mb-1">Local de Retirada</h4>
                  {loadingStore ? (
                    <div className="flex items-center gap-2 text-[#1e3a5f]/50 text-sm">
                      <Icons.Spinner className="w-4 h-4" />
                      Carregando...
                    </div>
                  ) : storeAddress ? (
                    <>
                      <p className="text-[#1e3a5f] font-bold text-base">{storeAddress.storeName}</p>
                      <p className="text-[#1e3a5f]/70 text-sm mt-1 leading-relaxed">{storeAddress.storeAddress}</p>
                      
                      {storeAddress.storePhone && (
                        <div className="mt-3">
                          <span className="text-[#1e3a5f]/50 text-xs flex items-center gap-1.5 bg-[#1e3a5f]/5 px-2.5 py-1.5 rounded-lg inline-flex">
                            <Icons.Phone className="w-3.5 h-3.5" />
                            {storeAddress.storePhone}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[#1e3a5f]/50 text-sm">Endereço não configurado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Endereço de entrega */}
          {deliveryType === 'DELIVERY' && (
            <div>
              <label className="block text-[#1e3a5f] font-bold mb-3">Endereço de Entrega</label>

              {savedAddresses.length > 0 && !showNewAddress && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                          : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          selectedAddressId === addr.id ? 'border-[#1e3a5f]' : 'border-[#1e3a5f]/30'
                        }`}>
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 bg-[#1e3a5f] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[#1e3a5f] font-bold">{addr.label || 'Endereço'}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-0.5 rounded-full font-bold">
                                PADRÃO
                              </span>
                            )}
                          </div>
                          <p className="text-[#1e3a5f]/70 text-sm mt-1">
                            {addr.street}, {addr.number}
                            {addr.complement && ` - ${addr.complement}`}
                          </p>
                          <p className="text-[#1e3a5f]/50 text-xs">
                            {addr.neighborhood} - {addr.city}/{addr.state}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!showNewAddress ? (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-[#1e3a5f]/20 hover:border-[#1e3a5f]/40 text-left transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center">
                      <Icons.Plus className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <span className="text-[#1e3a5f] font-bold">Usar outro endereço</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-4 p-4 bg-white rounded-2xl border border-[#1e3a5f]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1e3a5f] font-bold">Novo Endereço</span>
                    <button
                      onClick={() => {
                        setShowNewAddress(false);
                        resetNewAddressForm();
                      }}
                      className="text-[#1e3a5f]/50 hover:text-[#1e3a5f] text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>

                  {deliveryAreaError && (
                    <div className="bg-[#1e3a5f]/10 border-2 border-[#1e3a5f]/30 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icons.LocationOff className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1e3a5f] text-sm">Fora da área de entrega</p>
                        <p className="text-xs text-[#1e3a5f]/70 mt-1">
                          Desculpe, nosso delivery atende apenas a cidade de <strong>Campina Grande - PB</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">CEP *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newAddress.zipCode}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          maxLength={9}
                          className={`w-full bg-[#faf8f5] border rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none transition-colors ${
                            cepError || deliveryAreaError
                              ? 'border-[#1e3a5f]/50 focus:border-[#1e3a5f] bg-[#1e3a5f]/5' 
                              : loadingCep 
                                ? 'border-[#1e3a5f]/30' 
                                : 'border-[#1e3a5f]/10 focus:border-[#1e3a5f]'
                          }`}
                        />
                        {loadingCep && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Icons.Spinner className="w-4 h-4 text-[#1e3a5f]" />
                          </div>
                        )}
                        {!loadingCep && newAddress.street && newAddress.zipCode.length === 9 && !deliveryAreaError && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Icons.Check className="w-4 h-4 text-[#1e3a5f]" />
                          </div>
                        )}
                      </div>
                      {cepError && <p className="text-[#1e3a5f]/60 text-xs mt-1">{cepError}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Apelido</label>
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Ex: Casa, Trabalho..."
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Rua *</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Nome da rua"
                        disabled={loadingCep}
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Nº *</label>
                      <input
                        type="text"
                        value={newAddress.number}
                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                        placeholder="123"
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Complemento</label>
                    <input
                      type="text"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                      placeholder="Apto, Bloco..."
                      className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Bairro *</label>
                    <input
                      type="text"
                      value={newAddress.neighborhood}
                      onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      disabled={loadingCep}
                      className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Cidade *</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={handleCityChange}
                        placeholder="Campina Grande"
                        disabled={loadingCep}
                        className={`w-full bg-[#faf8f5] border rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none disabled:opacity-50 ${
                          deliveryAreaError 
                            ? 'border-[#1e3a5f]/50 bg-[#1e3a5f]/5' 
                            : 'border-[#1e3a5f]/10 focus:border-[#1e3a5f]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">UF *</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={handleStateChange}
                        placeholder="PB"
                        maxLength={2}
                        disabled={loadingCep}
                        className={`w-full bg-[#faf8f5] border rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none disabled:opacity-50 uppercase ${
                          deliveryAreaError 
                            ? 'border-[#1e3a5f]/50 bg-[#1e3a5f]/5' 
                            : 'border-[#1e3a5f]/10 focus:border-[#1e3a5f]'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seção de cupom */}
          <div className="bg-white rounded-2xl p-4 border border-[#1e3a5f]/10">
            <div className="flex items-center gap-2 mb-3">
              <Icons.Ticket className="w-5 h-5 text-[#1e3a5f]" />
              <span className="font-bold text-[#1e3a5f] text-sm">Cupom de Desconto</span>
            </div>

            {appliedCoupon ? (
              <div className="bg-[#1e3a5f]/5 rounded-xl p-3 border border-[#1e3a5f]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                      <Icons.CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1e3a5f] text-sm">{appliedCoupon.code}</p>
                      <p className="text-[#1e3a5f]/60 text-xs">{appliedCoupon.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[#1e3a5f]/60 hover:text-[#1e3a5f] p-1 hover:bg-[#1e3a5f]/10 rounded-lg transition-colors"
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
                {!appliedCoupon.allowWithCashback && (
                  <div className="flex items-center gap-1 text-[#1e3a5f]/70 font-medium text-xs mt-1">
                    <Icons.AlertTriangle className="w-3 h-3" />
                    <span>Este cupom não permite uso de cashback</span>
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
                    {couponLoading ? <Icons.Spinner className="w-4 h-4" /> : 'Aplicar'}
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

          {/* Seção de cashback */}
          {cashbackSettings?.isEnabled && (
            <div className="bg-white rounded-2xl p-4 border border-[#1e3a5f]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icons.Wallet className="w-5 h-5 text-[#1e3a5f]" />
                  <span className="font-bold text-[#1e3a5f] text-sm">Usar Cashback</span>
                </div>
                <div className="flex items-center gap-1 bg-[#1e3a5f]/5 px-2 py-1 rounded-lg">
                  <Icons.Sparkles className="w-3 h-3 text-[#1e3a5f]" />
                  <span className="text-xs font-bold text-[#1e3a5f]">
                    R$ {userCashbackBalance.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {cashbackToUse > 0 ? (
                <div className="bg-[#1e3a5f]/5 rounded-xl p-3 border border-[#1e3a5f]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                        <Icons.Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1e3a5f] text-sm">Cashback aplicado</p>
                        <p className="text-[#1e3a5f] font-bold">
                          -R$ {cashbackToUse.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCashback}
                      className="text-[#1e3a5f]/60 hover:text-[#1e3a5f] p-1 hover:bg-[#1e3a5f]/10 rounded-lg transition-colors"
                    >
                      <Icons.Close className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : canUseCashback ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e3a5f]/50 text-sm">R$</span>
                      <input
                        type="text"
                        value={cashbackInputValue}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d,]/g, '');
                          setCashbackInputValue(val);
                          setCashbackError('');
                        }}
                        placeholder="0,00"
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl pl-9 pr-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]/30"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleApplyCashback();
                        }}
                      />
                    </div>
                    <button
                      onClick={handleApplyMaxCashback}
                      className="bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] font-medium px-3 py-2.5 rounded-xl transition-all text-xs"
                    >
                      Máx
                    </button>
                    <button
                      onClick={handleApplyCashback}
                      disabled={!cashbackInputValue}
                      className="bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-[#1e3a5f]/30 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
                    >
                      Usar
                    </button>
                  </div>
                  <p className="text-[#1e3a5f]/50 text-xs">
                    Mínimo: R$ {cashbackSettings.minRedeemValue.toFixed(2).replace('.', ',')} | 
                    Máx: {cashbackSettings.maxRedeemPercentage}% do pedido
                  </p>
                  {cashbackError && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <Icons.XCircle className="w-3 h-3" />
                      {cashbackError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-[#1e3a5f]/50 text-sm text-center py-2">
                  {!cashbackSettings?.isEnabled ? (
                    'Cashback está desabilitado no momento'
                  ) : userCashbackBalance < (cashbackSettings?.minRedeemValue || 0) ? (
                    `Saldo mínimo para resgate: R$ ${(cashbackSettings?.minRedeemValue || 0).toFixed(2).replace('.', ',')}`
                  ) : appliedCoupon && !appliedCoupon.allowWithCashback ? (
                    'O cupom aplicado não permite uso de cashback'
                  ) : (
                    'Você não possui cashback disponível'
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resumo do pedido */}
          <div className="bg-white rounded-2xl p-4 border border-[#1e3a5f]/10">
            <h3 className="text-[#1e3a5f] font-bold mb-3">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#1e3a5f]/60">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#1e3a5f]">
                  <span className="flex items-center gap-1">
                    <Icons.Ticket className="w-3 h-3" />
                    Cupom ({appliedCoupon?.code})
                  </span>
                  <span>-R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              {cashbackToUse > 0 && (
                <div className="flex justify-between text-[#1e3a5f]">
                  <span className="flex items-center gap-1">
                    <Icons.Wallet className="w-3 h-3" />
                    Cashback
                  </span>
                  <span>-R$ {cashbackToUse.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="flex justify-between text-[#1e3a5f]/60">
                <span>Entrega</span>
                <span className={couponFreeShipping && deliveryType === 'DELIVERY' ? 'line-through text-[#1e3a5f]/30' : ''}>
                  {deliveryType === 'PICKUP' ? 'Grátis' : `R$ ${baseShippingFee.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              
              {couponFreeShipping && deliveryType === 'DELIVERY' && (
                <div className="flex justify-between text-[#1e3a5f]">
                  <span className="flex items-center gap-1">
                    <Icons.Motorcycle className="w-3 h-3" />
                    Frete grátis
                  </span>
                  <span>-R$ {baseShippingFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="border-t border-[#1e3a5f]/10 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#1e3a5f] font-bold">Total</span>
                  <span className="text-[#1e3a5f] font-black text-xl">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Preview de cashback a ganhar */}
              {cashbackToEarn > 0 && (
                <div className="flex items-center justify-center gap-2 pt-2 text-[#1e3a5f]">
                  <Icons.Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Você vai ganhar R$ {cashbackToEarn.toFixed(2).replace('.', ',')} de cashback!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-[#1e3a5f]/10 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-bold transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleContinueToPayment}
              disabled={!canContinueToPayment()}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#1e3a5f]/20"
            >
              Continuar
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Toast Component
const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const typeStyles = {
    success: 'bg-[#1e3a5f] text-white',
    error: 'bg-[#1e3a5f]/90 text-white border border-white/20',
    info: 'bg-[#1e3a5f]/80 text-white'
  };

  const icons = {
    success: <Icons.CheckCircle className="w-5 h-5" />,
    error: <Icons.Error className="w-5 h-5" />,
    info: <Icons.Info className="w-5 h-5" />
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-slide-down">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${typeStyles[toast.type]}`}>
        {icons[toast.type]}
        <span className="font-medium text-sm">{toast.message}</span>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
          <Icons.Close className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// contexts/CartContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const CartContext = createContext();

// Função para obter a chave do carrinho baseada no usuário
const getCartStorageKey = (userId) => {
  return userId ? `delivery_cart_${userId}` : null;
};

const getCouponStorageKey = (userId) => {
  return userId ? `delivery_coupon_${userId}` : null;
};

// Função para carregar carrinho do localStorage
const loadCartFromStorage = (userId) => {
  if (!userId) return [];
  
  try {
    const key = getCartStorageKey(userId);
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error);
  }
  return [];
};

// Função para carregar cupom do localStorage
const loadCouponFromStorage = (userId) => {
  if (!userId) return null;
  
  try {
    const key = getCouponStorageKey(userId);
    const savedCoupon = localStorage.getItem(key);
    if (savedCoupon) {
      return JSON.parse(savedCoupon);
    }
  } catch (error) {
    console.error('Erro ao carregar cupom do localStorage:', error);
  }
  return null;
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  // ============================================
  // ESTADO DO USUÁRIO ATUAL
  // ============================================
  const getCurrentUserId = () => localStorage.getItem('userId') || null;
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId);
  
  // ============================================
  // ESTADOS COM PERSISTÊNCIA NO LOCALSTORAGE
  // ============================================
  const [cart, setCart] = useState(() => loadCartFromStorage(getCurrentUserId()));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  
  // Estados para cupom e cashback
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = loadCouponFromStorage(getCurrentUserId());
    return saved?.coupon || null;
  });
  const [couponDiscount, setCouponDiscount] = useState(() => {
    const saved = loadCouponFromStorage(getCurrentUserId());
    return saved?.discount || 0;
  });
  const [couponFreeShipping, setCouponFreeShipping] = useState(() => {
    const saved = loadCouponFromStorage(getCurrentUserId());
    return saved?.freeShipping || false;
  });
  const [cashbackToUse, setCashbackToUse] = useState(0);
  const [userCashbackBalance, setUserCashbackBalance] = useState(0);
  const [cashbackSettings, setCashbackSettings] = useState(null);
  
  // ============================================
  // ESTADOS PARA MODAL DE CONFIRMAÇÃO
  // ============================================
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    product: null,
    observation: '',
    action: null
  });
  
  const addingRef = useRef(false);
  const confirmingRef = useRef(false);

  // ============================================
  // PERSISTIR CARRINHO NO LOCALSTORAGE (POR USUÁRIO)
  // ============================================
  useEffect(() => {
    if (!currentUserId) return;
    
    try {
      const key = getCartStorageKey(currentUserId);
      if (key) {
        localStorage.setItem(key, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }, [cart, currentUserId]);

  // ============================================
  // PERSISTIR CUPOM NO LOCALSTORAGE (POR USUÁRIO)
  // ============================================
  useEffect(() => {
    if (!currentUserId) return;
    
    try {
      const key = getCouponStorageKey(currentUserId);
      if (key) {
        if (appliedCoupon) {
          localStorage.setItem(key, JSON.stringify({
            coupon: appliedCoupon,
            discount: couponDiscount,
            freeShipping: couponFreeShipping
          }));
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar cupom no localStorage:', error);
    }
  }, [appliedCoupon, couponDiscount, couponFreeShipping, currentUserId]);

  // ============================================
  // FUNÇÕES DO MODAL DE CONFIRMAÇÃO
  // ============================================
  const openConfirmModal = useCallback((product, observation, action) => {
    setConfirmModal({
      isOpen: true,
      product,
      observation,
      action
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      product: null,
      observation: '',
      action: null
    });
  }, []);

  const confirmRemoval = useCallback(() => {
    const { product, observation } = confirmModal;
    if (product) {
      setCart((prevCart) => 
        prevCart.filter(
          (item) => !(item.id === product.id && item.observation === observation)
        )
      );
    }
    closeConfirmModal();
  }, [confirmModal, closeConfirmModal]);

  // ============================================
  // ADICIONAR AO CARRINHO
  // ============================================
  const addToCart = useCallback((product, quantity = 1, observation = '') => {
    if (addingRef.current) return;
    addingRef.current = true;
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.observation === observation
      );
      
      if (existingIndex > -1) {
        const updated = prevCart.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return updated;
      }
      
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.promotionalPrice) > 0 
            ? Number(product.promotionalPrice) 
            : Number(product.price),
          imageUrl: product.imageUrl,
          quantity,
          observation,
          category: product.category,
        },
      ];
    });
    
    setTimeout(() => {
      addingRef.current = false;
    }, 100);
  }, []);

  // ============================================
  // REMOVER DO CARRINHO (COM CONFIRMAÇÃO)
  // ============================================
  const removeFromCart = useCallback((productId, observation = '') => {
    const product = cart.find(
      (item) => item.id === productId && item.observation === observation
    );
    
    if (product) {
      openConfirmModal(product, observation, 'remove');
    }
  }, [cart, openConfirmModal]);

  // Remoção direta sem confirmação (para uso interno)
  const removeFromCartDirect = useCallback((productId, observation = '') => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.id === productId && item.observation === observation)
      )
    );
  }, []);

  // ============================================
  // ATUALIZAR QUANTIDADE (COM CONFIRMAÇÃO AO ZERAR)
  // ============================================
  const updateQuantity = useCallback((productId, quantity, observation = '') => {
    if (quantity <= 0) {
      const product = cart.find(
        (item) => item.id === productId && item.observation === observation
      );
      
      if (product) {
        openConfirmModal(product, observation, 'decrease');
      }
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.observation === observation 
          ? { ...item, quantity } 
          : item
      )
    );
  }, [cart, openConfirmModal]);

  // ============================================
  // LIMPAR CARRINHO
  // ============================================
  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
    setCashbackToUse(0);
    
    // Limpa também do localStorage
    if (currentUserId) {
      const cartKey = getCartStorageKey(currentUserId);
      const couponKey = getCouponStorageKey(currentUserId);
      if (cartKey) localStorage.removeItem(cartKey);
      if (couponKey) localStorage.removeItem(couponKey);
    }
  }, [currentUserId]);

  const clearCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
    if (currentUserId) {
      const couponKey = getCouponStorageKey(currentUserId);
      if (couponKey) localStorage.removeItem(couponKey);
    }
  }, [currentUserId]);

  const clearCashbackToUse = useCallback(() => {
    setCashbackToUse(0);
  }, []);

  // ============================================
  // LOGIN - CARREGA CARRINHO DO USUÁRIO
  // ============================================
  const handleLogin = useCallback((userId) => {
    console.log('🔐 handleLogin chamado com userId:', userId);
    
    setCurrentUserId(userId);
    
    // Carrega o carrinho do usuário
    const userCart = loadCartFromStorage(userId);
    const userCoupon = loadCouponFromStorage(userId);
    
    console.log('🛒 Carrinho carregado:', userCart);
    
    setCart(userCart);
    setAppliedCoupon(userCoupon?.coupon || null);
    setCouponDiscount(userCoupon?.discount || 0);
    setCouponFreeShipping(userCoupon?.freeShipping || false);
    
    // Reseta estados temporários
    setCashbackToUse(0);
    setMyOrders([]);
  }, []);

  // ============================================
  // LOGOUT - LIMPA ESTADOS E FECHA MODAIS
  // ============================================
  const handleLogout = useCallback(() => {
    console.log('🚪 handleLogout chamado');
    
    // Fecha os modais/painéis
    setIsCartOpen(false);
    setIsTrackingOpen(false);
    closeConfirmModal();
    
    // Limpa o carrinho da memória (mas mantém no localStorage do usuário)
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
    setCashbackToUse(0);
    setUserCashbackBalance(0);
    setCashbackSettings(null);
    setMyOrders([]);
    
    // Limpa o usuário atual
    setCurrentUserId(null);
  }, [closeConfirmModal]);

  // ============================================
  // BUSCAR SALDO DE CASHBACK
  // ============================================
  const fetchCashbackBalance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query {
            myCashbackSummary {
              balance
              pendingExpiration
              nextExpirationDate
              totalEarned
              isEnabled
              currentCampaign {
                id
                name
                description
                multiplier
                fixedPercentage
                endDate
              }
            }
            cashbackSettings {
              isEnabled
              defaultPercentage
              minRedeemValue
              maxRedeemPercentage
              maxRedeemValue
              displayMessage
            }
          }`,
        }),
      });

      const result = await response.json();

      if (result.data?.myCashbackSummary) {
        setUserCashbackBalance(result.data.myCashbackSummary.balance || 0);
      }
      if (result.data?.cashbackSettings) {
        setCashbackSettings(result.data.cashbackSettings);
      }
    } catch (err) {
      console.error('Erro ao buscar cashback:', err);
    }
  }, []);

  // ============================================
  // VALIDAR E APLICAR CUPOM
  // ============================================
  const validateCoupon = useCallback(async (code, orderTotal) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          query: `query ValidateCoupon($code: String!, $orderTotal: Float!) {
            validateCoupon(code: $code, orderTotal: $orderTotal) {
              valid
              message
              discount
              freeShipping
              coupon {
                id
                code
                name
                discountType
                discountValue
                allowWithCashback
              }
            }
          }`,
          variables: { code, orderTotal },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return { valid: false, message: result.errors[0].message };
      }

      return result.data.validateCoupon;
    } catch (err) {
      console.error('Erro ao validar cupom:', err);
      return { valid: false, message: 'Erro ao validar cupom' };
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const validation = await validateCoupon(code, subtotal);

    if (validation.valid) {
      setAppliedCoupon(validation.coupon);
      setCouponDiscount(validation.discount || 0);
      setCouponFreeShipping(validation.freeShipping || false);
      
      if (validation.coupon && !validation.coupon.allowWithCashback) {
        setCashbackToUse(0);
      }
    }

    return validation;
  }, [cart, validateCoupon]);

  // ============================================
  // CÁLCULOS DO CARRINHO
  // ============================================
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotalValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // ============================================
  // BUSCAR PEDIDOS
  // ============================================
  const fetchMyOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query { 
            orders { 
              id 
              status 
              createdAt 
              total
              subtotal
              shippingFee
              discount
              cashbackUsed
              cashbackEarned
              deliveryType
              paymentMethod
              paymentStatus
              couponCode
              deliveryAddress {
                street
                number
                complement
                neighborhood
                city
              }
              items { 
                name 
                quantity 
                price 
              } 
            } 
          }`,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error('Erro ao buscar pedidos:', result.errors);
        return;
      }

      if (result.data?.orders) {
        setMyOrders(result.data.orders);
      }
    } catch (err) {
      console.error('Erro de rede ao buscar pedidos:', err);
    }
  }, []);

  const activeTrackingOrders = myOrders.filter((order) => {
    const finishedStatuses = ['COMPLETED', 'CANCELLED'];
    return !finishedStatuses.includes(order.status);
  });

  // ============================================
  // CONFIRMAR ENTREGA (CLIENTE)
  // ============================================
  const handleConfirmDelivery = useCallback(async (orderId) => {
    if (confirmingRef.current) {
      console.log('Confirmação já em andamento, ignorando...');
      return { success: false, message: 'Confirmação já em andamento' };
    }
    
    confirmingRef.current = true;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log('📦 Cliente confirmando recebimento do pedido:', orderId);

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation ConfirmOrderReceived($id: ID!) {
              confirmOrderReceived(id: $id) {
                id
                status
                cashbackEarned
                customerConfirmedAt
              }
            }
          `,
          variables: { id: orderId },
        }),
      });
      
      const result = await response.json();
      
      if (result.errors) {
        console.error('❌ Erro ao confirmar entrega:', result.errors);
        throw new Error(result.errors[0].message);
      }
      
      if (result.data?.confirmOrderReceived) {
        console.log('✅ Pedido confirmado pelo cliente:', result.data.confirmOrderReceived);
        
        setMyOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'COMPLETED' }
              : order
          )
        );
        
        await fetchCashbackBalance();
        
        return { success: true, data: result.data.confirmOrderReceived };
      }
      
      return { success: false, message: 'Erro desconhecido' };
    } catch (err) {
      console.error('❌ Erro ao confirmar entrega:', err);
      return { success: false, message: err.message };
    } finally {
      setTimeout(() => {
        confirmingRef.current = false;
      }, 1000);
    }
  }, [fetchCashbackBalance]);

  const cartItems = cart;
  const setActiveTrackingOrders = setMyOrders;

  // ============================================
  // VALOR EXPORTADO
  // ============================================
  const value = {
    cart,
    cartItems,
    setCart,
    isCartOpen,
    setIsCartOpen,
    isTrackingOpen,
    setIsTrackingOpen,
    myOrders,
    setMyOrders,
    activeTrackingOrders,
    setActiveTrackingOrders,
    addToCart,
    removeFromCart,
    removeFromCartDirect,
    updateQuantity,
    clearCart,
    cartItemsCount,
    cartTotalValue,
    getCartTotal,
    fetchMyOrders,
    handleConfirmDelivery,
    handleLogin,
    handleLogout,
    currentUserId,
    // Cupom
    appliedCoupon,
    setAppliedCoupon,
    couponDiscount,
    setCouponDiscount,
    couponFreeShipping,
    setCouponFreeShipping,
    validateCoupon,
    applyCoupon,
    clearCoupon,
    // Cashback
    cashbackToUse,
    setCashbackToUse,
    userCashbackBalance,
    setUserCashbackBalance,
    cashbackSettings,
    setCashbackSettings,
    fetchCashbackBalance,
    clearCashbackToUse,
    // Modal de confirmação
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    confirmRemoval,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
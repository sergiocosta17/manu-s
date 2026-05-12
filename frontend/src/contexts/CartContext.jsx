// contexts/CartContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const CartContext = createContext();

// Chave do carrinho no localStorage baseada no usuário
const getCartStorageKey = (userId) => (userId ? `delivery_cart_${userId}` : null);

// Chave do cupom no localStorage
const getCouponStorageKey = (userId) => (userId ? `delivery_coupon_${userId}` : null);

// Gera uma chave única para o item (produto + observação + opcionais)
const createCartItemKey = (productId, observation, selectedAddons = []) => {
  const addonsKey = selectedAddons.map((a) => a.addonId).sort().join('-');
  return `${productId}|${observation || ''}|${addonsKey}`;
};

// Carrega carrinho do localStorage
const loadCartFromStorage = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(getCartStorageKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          selectedAddons: item.selectedAddons || [],
          addonsTotal: item.addonsTotal || 0,
          cartItemKey: item.cartItemKey || createCartItemKey(item.id, item.observation, item.selectedAddons),
        }));
      }
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
  }
  return [];
};

// Carrega cupom do localStorage
const loadCouponFromStorage = (userId) => {
  if (!userId) return null;
  try {
    const saved = localStorage.getItem(getCouponStorageKey(userId));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider');
  return context;
}

export function CartProvider({ children }) {
  // Estados do usuário
  const getCurrentUserId = () => localStorage.getItem('userId') || null;
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId);

  // Estados principais
  const [cart, setCart] = useState(() => loadCartFromStorage(getCurrentUserId()));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myOrders, setMyOrders] = useState([]);

  // Estados do cupom
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

  // Estados do cashback
  const [cashbackToUse, setCashbackToUse] = useState(0);
  const [userCashbackBalance, setUserCashbackBalance] = useState(0);
  const [cashbackSettings, setCashbackSettings] = useState(null);

  // Modal de confirmação
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    product: null,
    observation: '',
    cartItemKey: '',
    action: null,
  });

  const addingRef = useRef(false);
  const confirmingRef = useRef(false);

  // Persiste carrinho no localStorage
  useEffect(() => {
    if (!currentUserId) return;
    try {
      const key = getCartStorageKey(currentUserId);
      if (key) localStorage.setItem(key, JSON.stringify(cart));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }, [cart, currentUserId]);

  // Persiste cupom no localStorage
  useEffect(() => {
    if (!currentUserId) return;
    try {
      const key = getCouponStorageKey(currentUserId);
      if (key) {
        if (appliedCoupon) {
          localStorage.setItem(key, JSON.stringify({ coupon: appliedCoupon, discount: couponDiscount, freeShipping: couponFreeShipping }));
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
    }
  }, [appliedCoupon, couponDiscount, couponFreeShipping, currentUserId]);

  // Abre modal de confirmação
  const openConfirmModal = useCallback((product, observation, action, cartItemKey = '') => {
    setConfirmModal({
      isOpen: true,
      product,
      observation,
      cartItemKey: cartItemKey || createCartItemKey(product.id, observation, product.selectedAddons),
      action,
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      product: null,
      observation: '',
      cartItemKey: '',
      action: null,
    });
  }, []);

  const confirmRemoval = useCallback(() => {
    const { cartItemKey } = confirmModal;
    if (cartItemKey) {
      setCart((prev) => prev.filter((item) => item.cartItemKey !== cartItemKey));
    }
    closeConfirmModal();
  }, [confirmModal, closeConfirmModal]);

  // Adiciona item ao carrinho (com opcionais)
  const addToCart = useCallback((product, quantity = 1, observation = '', selectedAddons = [], addonsTotal = 0) => {
    if (addingRef.current) return;
    addingRef.current = true;

    const cartItemKey = createCartItemKey(product.id, observation, selectedAddons);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemKey === cartItemKey);
      if (existingIndex > -1) {
        return prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      const basePrice = Number(product.promotionalPrice) > 0 ? Number(product.promotionalPrice) : Number(product.price);
      const unitPrice = basePrice + Number(addonsTotal || 0);

      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: unitPrice,
          basePrice,
          imageUrl: product.imageUrl,
          quantity,
          observation,
          category: product.category,
          selectedAddons: selectedAddons || [],
          addonsTotal: Number(addonsTotal || 0),
          cartItemKey,
        },
      ];
    });

    setTimeout(() => {
      addingRef.current = false;
    }, 100);
  }, []);

  // Atualiza um item existente (edição)
  const updateCartItem = useCallback((index, updates) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      if (index >= 0 && index < newCart.length) {
        const current = newCart[index];
        const newSelectedAddons = updates.selectedAddons !== undefined ? updates.selectedAddons : current.selectedAddons;
        const newObservation = updates.observation !== undefined ? updates.observation : current.observation;
        const newAddonsTotal = updates.addonsTotal !== undefined ? updates.addonsTotal : current.addonsTotal;
        const newPrice = current.basePrice + Number(newAddonsTotal || 0);
        const newCartItemKey = createCartItemKey(current.id, newObservation, newSelectedAddons);

        newCart[index] = {
          ...current,
          ...updates,
          price: newPrice,
          addonsTotal: Number(newAddonsTotal || 0),
          cartItemKey: newCartItemKey,
        };
      }
      return newCart;
    });
  }, []);

  // Remove item com confirmação
  const removeFromCart = useCallback((productId, observation = '', selectedAddons = [], index = null) => {
    let product;
    if (index !== null && index >= 0 && index < cart.length) {
      product = cart[index];
    } else {
      const cartItemKey = createCartItemKey(productId, observation, selectedAddons);
      product = cart.find((item) => item.cartItemKey === cartItemKey) ||
                cart.find((item) => item.id === productId && item.observation === observation);
    }
    if (product) {
      openConfirmModal(product, product.observation, 'remove', product.cartItemKey);
    }
  }, [cart, openConfirmModal]);

  const removeFromCartDirect = useCallback((productId, observation = '', cartItemKey = '') => {
    setCart((prev) => {
      if (cartItemKey) return prev.filter((item) => item.cartItemKey !== cartItemKey);
      return prev.filter((item) => !(item.id === productId && item.observation === observation));
    });
  }, []);

  // Atualiza quantidade (zera com confirmação)
  const updateQuantity = useCallback((productId, quantity, observation = '', selectedAddons = [], index = null) => {
    let itemIndex = index;
    let product;

    if (index !== null && index >= 0 && index < cart.length) {
      product = cart[index];
      itemIndex = index;
    } else {
      const cartItemKey = createCartItemKey(productId, observation, selectedAddons);
      itemIndex = cart.findIndex((item) => item.cartItemKey === cartItemKey);
      if (itemIndex === -1) {
        itemIndex = cart.findIndex((item) => item.id === productId && item.observation === observation);
      }
      product = itemIndex > -1 ? cart[itemIndex] : null;
    }

    if (quantity <= 0) {
      if (product) openConfirmModal(product, product.observation, 'decrease', product.cartItemKey);
      return;
    }

    if (itemIndex > -1) {
      setCart((prev) => prev.map((item, idx) => (idx === itemIndex ? { ...item, quantity } : item)));
    }
  }, [cart, openConfirmModal]);

  // Limpa carrinho e cupom
  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
    setCashbackToUse(0);
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
      const key = getCouponStorageKey(currentUserId);
      if (key) localStorage.removeItem(key);
    }
  }, [currentUserId]);

  const clearCashbackToUse = useCallback(() => setCashbackToUse(0), []);

  // Login: carrega dados do usuário
  const handleLogin = useCallback((userId) => {
    setCurrentUserId(userId);
    const userCart = loadCartFromStorage(userId);
    const userCoupon = loadCouponFromStorage(userId);
    setCart(userCart);
    setAppliedCoupon(userCoupon?.coupon || null);
    setCouponDiscount(userCoupon?.discount || 0);
    setCouponFreeShipping(userCoupon?.freeShipping || false);
    setCashbackToUse(0);
    setMyOrders([]);
  }, []);

  // Logout: limpa estados e fecha modais
  const handleLogout = useCallback(() => {
    setIsCartOpen(false);
    setIsTrackingOpen(false);
    closeConfirmModal();
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
    setCashbackToUse(0);
    setUserCashbackBalance(0);
    setCashbackSettings(null);
    setMyOrders([]);
    setCurrentUserId(null);
  }, [closeConfirmModal]);

  // Busca saldo de cashback
  const fetchCashbackBalance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `query {
            myCashbackSummary { balance }
            cashbackSettings { isEnabled defaultPercentage minRedeemValue maxRedeemPercentage maxRedeemValue displayMessage }
          }`,
        }),
      });
      const result = await res.json();
      if (result.data?.myCashbackSummary) setUserCashbackBalance(result.data.myCashbackSummary.balance || 0);
      if (result.data?.cashbackSettings) setCashbackSettings(result.data.cashbackSettings);
    } catch (err) {
      console.error('Erro ao buscar cashback:', err);
    }
  }, []);

  // Valida cupom na API
  const validateCoupon = useCallback(async (code, orderTotal) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          query: `query ValidateCoupon($code: String!, $orderTotal: Float!) {
            validateCoupon(code: $code, orderTotal: $orderTotal) {
              valid message discount freeShipping coupon { id code name discountType discountValue allowWithCashback }
            }
          }`,
          variables: { code, orderTotal },
        }),
      });
      const result = await res.json();
      if (result.errors) return { valid: false, message: result.errors[0].message };
      return result.data.validateCoupon;
    } catch (err) {
      return { valid: false, message: 'Erro ao validar cupom' };
    }
  }, []);

  // Aplica cupom ao carrinho
  const applyCoupon = useCallback(async (code) => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const validation = await validateCoupon(code, subtotal);
    if (validation.valid) {
      setAppliedCoupon(validation.coupon);
      setCouponDiscount(validation.discount || 0);
      setCouponFreeShipping(validation.freeShipping || false);
      if (validation.coupon && !validation.coupon.allowWithCashback) setCashbackToUse(0);
    }
    return validation;
  }, [cart, validateCoupon]);

  // Cálculos do carrinho
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalValue = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartSubtotalWithoutAddons = cart.reduce((total, item) => total + (item.basePrice || item.price) * item.quantity, 0);
  const cartAddonsTotal = cart.reduce((total, item) => total + (item.addonsTotal || 0) * item.quantity, 0);

  const getCartTotal = useCallback(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const getCartSubtotal = useCallback(() => cart.reduce((total, item) => total + (item.basePrice || item.price) * item.quantity, 0), [cart]);
  const getCartAddonsTotal = useCallback(() => cart.reduce((total, item) => total + (item.addonsTotal || 0) * item.quantity, 0), [cart]);

  // Busca pedidos do usuário
  const fetchMyOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `query { orders { id status createdAt total subtotal shippingFee discount cashbackUsed cashbackEarned deliveryType paymentMethod paymentStatus couponCode deliveryAddress { street number complement neighborhood city } items { name quantity price selectedAddons { addonId name price quantity } addonsTotal } } }`,
        }),
      });
      const result = await res.json();
      if (!result.errors && result.data?.orders) setMyOrders(result.data.orders);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    }
  }, []);

  const activeTrackingOrders = myOrders.filter((order) => !['COMPLETED', 'CANCELLED'].includes(order.status));

  // Confirma recebimento do pedido
  const handleConfirmDelivery = useCallback(async (orderId) => {
    if (confirmingRef.current) return { success: false, message: 'Confirmação já em andamento' };
    confirmingRef.current = true;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation ConfirmOrderReceived($id: ID!) { confirmOrderReceived(id: $id) { id status cashbackEarned customerConfirmedAt } }`,
          variables: { id: orderId },
        }),
      });
      const result = await res.json();
      if (result.errors) throw new Error(result.errors[0].message);
      if (result.data?.confirmOrderReceived) {
        setMyOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: 'COMPLETED' } : order)));
        await fetchCashbackBalance();
        return { success: true, data: result.data.confirmOrderReceived };
      }
      return { success: false, message: 'Erro desconhecido' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setTimeout(() => { confirmingRef.current = false; }, 1000);
    }
  }, [fetchCashbackBalance]);

  // Helpers para opcionais
  const getItemAddons = useCallback((cartItemKey) => cart.find((i) => i.cartItemKey === cartItemKey)?.selectedAddons || [], [cart]);
  const formatAddonsText = useCallback((selectedAddons) => selectedAddons.map((a) => a.name).join(', '), []);
  const haveSameAddons = useCallback((addons1, addons2) => {
    if (!addons1 && !addons2) return true;
    if (!addons1 || !addons2) return false;
    if (addons1.length !== addons2.length) return false;
    const ids1 = addons1.map((a) => a.addonId).sort();
    const ids2 = addons2.map((a) => a.addonId).sort();
    return ids1.every((id, idx) => id === ids2[idx]);
  }, []);

  const value = {
    cart,
    cartItems: cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    isTrackingOpen,
    setIsTrackingOpen,
    myOrders,
    setMyOrders,
    activeTrackingOrders,
    setActiveTrackingOrders: setMyOrders,
    addToCart,
    removeFromCart,
    removeFromCartDirect,
    updateQuantity,
    updateCartItem,
    clearCart,
    cartItemsCount,
    cartTotalValue,
    cartSubtotalWithoutAddons,
    cartAddonsTotal,
    getCartTotal,
    getCartSubtotal,
    getCartAddonsTotal,
    fetchMyOrders,
    handleConfirmDelivery,
    handleLogin,
    handleLogout,
    currentUserId,
    appliedCoupon,
    setAppliedCoupon,
    couponDiscount,
    setCouponDiscount,
    couponFreeShipping,
    setCouponFreeShipping,
    validateCoupon,
    applyCoupon,
    clearCoupon,
    cashbackToUse,
    setCashbackToUse,
    userCashbackBalance,
    setUserCashbackBalance,
    cashbackSettings,
    setCashbackSettings,
    fetchCashbackBalance,
    clearCashbackToUse,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    confirmRemoval,
    getItemAddons,
    formatAddonsText,
    haveSameAddons,
    createCartItemKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
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

// Função para criar uma chave única para o item do carrinho
// Considera produto + observação + opcionais selecionados
const createCartItemKey = (productId, observation, selectedAddons = []) => {
  const addonsKey = selectedAddons
    .map(a => a.addonId)
    .sort()
    .join('-');
  return `${productId}|${observation || ''}|${addonsKey}`;
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
        // Garante que todos os itens tenham a estrutura correta
        return parsed.map(item => ({
          ...item,
          selectedAddons: item.selectedAddons || [],
          addonsTotal: item.addonsTotal || 0,
          cartItemKey: item.cartItemKey || createCartItemKey(item.id, item.observation, item.selectedAddons)
        }));
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
    cartItemKey: '',
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
  const openConfirmModal = useCallback((product, observation, action, cartItemKey = '') => {
    setConfirmModal({
      isOpen: true,
      product,
      observation,
      cartItemKey: cartItemKey || createCartItemKey(product.id, observation, product.selectedAddons),
      action
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      product: null,
      observation: '',
      cartItemKey: '',
      action: null
    });
  }, []);

  const confirmRemoval = useCallback(() => {
    const { cartItemKey } = confirmModal;
    if (cartItemKey) {
      setCart((prevCart) => 
        prevCart.filter((item) => item.cartItemKey !== cartItemKey)
      );
    }
    closeConfirmModal();
  }, [confirmModal, closeConfirmModal]);

  // ============================================
  // ADICIONAR AO CARRINHO (COM SUPORTE A OPCIONAIS)
  // ============================================
  const addToCart = useCallback((product, quantity = 1, observation = '', selectedAddons = [], addonsTotal = 0) => {
    if (addingRef.current) return;
    addingRef.current = true;
    
    const cartItemKey = createCartItemKey(product.id, observation, selectedAddons);
    
    setCart((prevCart) => {
      // Busca item existente pela chave única (produto + observação + opcionais)
      const existingIndex = prevCart.findIndex(
        (item) => item.cartItemKey === cartItemKey
      );
      
      if (existingIndex > -1) {
        // Atualiza quantidade se já existe item idêntico
        const updated = prevCart.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return updated;
      }
      
      // Calcula o preço base do produto
      const basePrice = Number(product.promotionalPrice) > 0 
        ? Number(product.promotionalPrice) 
        : Number(product.price);
      
      // Preço unitário = preço base + opcionais
      const unitPrice = basePrice + Number(addonsTotal || 0);
      
      // Adiciona novo item ao carrinho
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: unitPrice, // Preço unitário já com opcionais
          basePrice: basePrice, // Preço base sem opcionais
          imageUrl: product.imageUrl,
          quantity,
          observation,
          category: product.category,
          selectedAddons: selectedAddons || [],
          addonsTotal: Number(addonsTotal || 0),
          cartItemKey, // Chave única para identificação
        },
      ];
    });
    
    setTimeout(() => {
      addingRef.current = false;
    }, 100);
  }, []);

  // ============================================
  // ATUALIZAR ITEM DO CARRINHO (EDIÇÃO COMPLETA)
  // ============================================
  const updateCartItem = useCallback((index, updates) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      
      if (index >= 0 && index < newCart.length) {
        const currentItem = newCart[index];
        
        // Se os opcionais ou observação mudaram, recalcula a chave
        const newSelectedAddons = updates.selectedAddons !== undefined 
          ? updates.selectedAddons 
          : currentItem.selectedAddons;
        const newObservation = updates.observation !== undefined 
          ? updates.observation 
          : currentItem.observation;
        const newAddonsTotal = updates.addonsTotal !== undefined 
          ? updates.addonsTotal 
          : currentItem.addonsTotal;
        
        // Recalcula o preço unitário
        const newPrice = currentItem.basePrice + Number(newAddonsTotal || 0);
        
        // Cria nova chave única
        const newCartItemKey = createCartItemKey(
          currentItem.id, 
          newObservation, 
          newSelectedAddons
        );
        
        newCart[index] = {
          ...currentItem,
          ...updates,
          price: newPrice,
          addonsTotal: Number(newAddonsTotal || 0),
          cartItemKey: newCartItemKey,
        };
      }
      
      return newCart;
    });
  }, []);

  // ============================================
  // REMOVER DO CARRINHO (COM CONFIRMAÇÃO)
  // ============================================
  const removeFromCart = useCallback((productId, observation = '', selectedAddons = [], index = null) => {
    let product;
    
    // Se tiver index, usa diretamente
    if (index !== null && index >= 0 && index < cart.length) {
      product = cart[index];
    } else {
      // Tenta encontrar pelo cartItemKey
      const cartItemKey = createCartItemKey(productId, observation, selectedAddons);
      product = cart.find((item) => item.cartItemKey === cartItemKey);
      
      // Fallback para método antigo
      if (!product) {
        product = cart.find(
          (item) => item.id === productId && item.observation === observation
        );
      }
    }
    
    if (product) {
      openConfirmModal(product, product.observation, 'remove', product.cartItemKey);
    }
  }, [cart, openConfirmModal]);

  // Remoção direta sem confirmação (para uso interno)
  const removeFromCartDirect = useCallback((productId, observation = '', cartItemKey = '') => {
    setCart((prevCart) => {
      if (cartItemKey) {
        return prevCart.filter((item) => item.cartItemKey !== cartItemKey);
      }
      // Fallback para o método antigo
      return prevCart.filter(
        (item) => !(item.id === productId && item.observation === observation)
      );
    });
  }, []);

  // ============================================
  // ATUALIZAR QUANTIDADE (COM CONFIRMAÇÃO AO ZERAR)
  // ============================================
  const updateQuantity = useCallback((productId, quantity, observation = '', selectedAddons = [], index = null) => {
    // Encontra o item
    let product;
    let itemIndex = index;
    
    if (index !== null && index >= 0 && index < cart.length) {
      product = cart[index];
    } else {
      const cartItemKey = createCartItemKey(productId, observation, selectedAddons);
      itemIndex = cart.findIndex((item) => item.cartItemKey === cartItemKey);
      product = itemIndex > -1 ? cart[itemIndex] : null;
      
      // Fallback
      if (!product) {
        itemIndex = cart.findIndex(
          (item) => item.id === productId && item.observation === observation
        );
        product = itemIndex > -1 ? cart[itemIndex] : null;
      }
    }
    
    if (quantity <= 0) {
      if (product) {
        openConfirmModal(product, product.observation, 'decrease', product.cartItemKey);
      }
      return;
    }
    
    if (itemIndex !== null && itemIndex > -1) {
      setCart((prevCart) =>
        prevCart.map((item, idx) => 
          idx === itemIndex ? { ...item, quantity } : item
        )
      );
    }
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

  // Total do carrinho (preço já inclui opcionais)
  const cartTotalValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Subtotal sem opcionais (para exibição separada, se necessário)
  const cartSubtotalWithoutAddons = cart.reduce(
    (total, item) => total + (item.basePrice || item.price) * item.quantity,
    0
  );

  // Total de opcionais
  const cartAddonsTotal = cart.reduce(
    (total, item) => total + (item.addonsTotal || 0) * item.quantity,
    0
  );

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Retorna o subtotal base (sem opcionais)
  const getCartSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.basePrice || item.price) * item.quantity, 0);
  }, [cart]);

  // Retorna apenas o total de opcionais
  const getCartAddonsTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.addonsTotal || 0) * item.quantity, 0);
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
                selectedAddons {
                  addonId
                  name
                  price
                  quantity
                }
                addonsTotal
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

  // ============================================
  // HELPERS PARA OBTER INFORMAÇÕES DE OPCIONAIS
  // ============================================
  
  // Retorna os opcionais de um item específico do carrinho
  const getItemAddons = useCallback((cartItemKey) => {
    const item = cart.find(i => i.cartItemKey === cartItemKey);
    return item?.selectedAddons || [];
  }, [cart]);

  // Formata os opcionais para exibição
  const formatAddonsText = useCallback((selectedAddons) => {
    if (!selectedAddons || selectedAddons.length === 0) return '';
    return selectedAddons.map(a => a.name).join(', ');
  }, []);

  // Verifica se dois itens têm os mesmos opcionais
  const haveSameAddons = useCallback((addons1, addons2) => {
    if (!addons1 && !addons2) return true;
    if (!addons1 || !addons2) return false;
    if (addons1.length !== addons2.length) return false;
    
    const ids1 = addons1.map(a => a.addonId).sort();
    const ids2 = addons2.map(a => a.addonId).sort();
    
    return ids1.every((id, index) => id === ids2[index]);
  }, []);

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
    updateCartItem, // NOVA FUNÇÃO ADICIONADA
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
    // Helpers para opcionais
    getItemAddons,
    formatAddonsText,
    haveSameAddons,
    createCartItemKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
// contexts/CartContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  
  // Estados para cupom e cashback
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);
  const [cashbackToUse, setCashbackToUse] = useState(0);
  const [userCashbackBalance, setUserCashbackBalance] = useState(0);
  const [cashbackSettings, setCashbackSettings] = useState(null);
  
  const addingRef = useRef(false);
  const confirmingRef = useRef(false);

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

  const removeFromCart = useCallback((productId, observation = '') => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.id === productId && item.observation === observation)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity, observation = '') => {
    if (quantity <= 0) {
      removeFromCart(productId, observation);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.observation === observation 
          ? { ...item, quantity } 
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
    setCashbackToUse(0);
  }, []);

  const clearCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
  }, []);

  const clearCashbackToUse = useCallback(() => {
    setCashbackToUse(0);
  }, []);

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

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotalValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

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
  // CORRIGIDO: Usar confirmOrderReceived em vez de confirmDelivery
  // ============================================
  const handleConfirmDelivery = useCallback(async (orderId) => {
    // Evita múltiplas chamadas simultâneas
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

      // CORRIGIDO: Usar confirmOrderReceived (mutation para CLIENTE)
      // Em vez de confirmDelivery (mutation para ADMIN)
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
        
        // Atualiza o pedido localmente
        setMyOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'COMPLETED' }
              : order
          )
        );
        
        // Atualiza cashback após confirmar
        await fetchCashbackBalance();
        
        return { success: true, data: result.data.confirmOrderReceived };
      }
      
      return { success: false, message: 'Erro desconhecido' };
    } catch (err) {
      console.error('❌ Erro ao confirmar entrega:', err);
      return { success: false, message: err.message };
    } finally {
      // Libera após delay para evitar cliques duplos
      setTimeout(() => {
        confirmingRef.current = false;
      }, 1000);
    }
  }, [fetchCashbackBalance]);

  const cartItems = cart;
  const setActiveTrackingOrders = setMyOrders;

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
    updateQuantity,
    clearCart,
    cartItemsCount,
    cartTotalValue,
    getCartTotal,
    fetchMyOrders,
    handleConfirmDelivery,
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
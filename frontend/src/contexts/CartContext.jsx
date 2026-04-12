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
  
  // Ref para evitar chamadas duplicadas do StrictMode
  const addingRef = useRef(false);

  const addToCart = useCallback((product, quantity = 1, observation = '') => {
    // Previne chamada dupla do StrictMode
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
        },
      ];
    });
    
    // Libera após um pequeno delay
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
  }, []);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotalValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // ✅ Buscar pedidos do usuário
  const fetchMyOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

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
              deliveryType
              paymentMethod
              paymentStatus
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

  // ✅ Pedidos ativos para rastreamento
  const activeTrackingOrders = myOrders.filter((order) => {
    const finishedStatuses = ['COMPLETED', 'CANCELLED'];
    return !finishedStatuses.includes(order.status);
  });

  // ✅ Confirmar entrega/retirada pelo cliente
  const handleConfirmDelivery = useCallback(async (orderId) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: `mutation { confirmDelivery(id: "${orderId}") { id status } }`,
        }),
      });
      
      const result = await response.json();
      
      if (result.data?.confirmDelivery) {
        setMyOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'COMPLETED' }
              : order
          )
        );
        
        await fetchMyOrders();
      } else if (result.errors) {
        console.error('Erro ao confirmar:', result.errors);
      }
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err);
    }
  }, [fetchMyOrders]);

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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

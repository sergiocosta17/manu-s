// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const addToCart = (product, quantity = 1, observation = '') => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.observation === observation
      );
      
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.promotionalPrice || product.price,
          imageUrl: product.imageUrl,
          quantity,
          observation,
        },
      ];
    });
  };

  const removeFromCart = (productId, observation = '') => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.id === productId && item.observation === observation)
      )
    );
  };

  const updateQuantity = (productId, quantity, observation = '') => {
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
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotalValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

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

  // ✅ Pedidos ativos para rastreamento - Filtro corrigido
  const activeTrackingOrders = myOrders.filter((order) => {
    // Status que indicam pedido finalizado ou cancelado
    const finishedStatuses = ['COMPLETED', 'CANCELLED'];
    return !finishedStatuses.includes(order.status);
  });

  // ✅ Confirmar entrega/retirada pelo cliente - Corrigido
  const handleConfirmDelivery = async (orderId) => {
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
        // ✅ Atualiza o estado local imediatamente para remover o pedido da lista
        setMyOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'COMPLETED' }
              : order
          )
        );
        
        // Também faz fetch para garantir sincronização
        await fetchMyOrders();
      } else if (result.errors) {
        console.error('Erro ao confirmar:', result.errors);
      }
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err);
    }
  };

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

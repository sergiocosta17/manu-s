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
      // Verifica se já existe o mesmo produto com a mesma observação
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

  // ✅ Função getCartTotal (para compatibilidade com GlobalModals)
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
            myOrders { 
              id 
              status 
              createdAt 
              items { name quantity price } 
              total 
            } 
          }`,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        // Tenta query alternativa se myOrders não existir
        const altResponse = await fetch('http://localhost:4000/graphql', {
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
                items { name quantity price } 
                total 
              } 
            }`,
          }),
        });
        const altResult = await altResponse.json();
        if (altResult.data?.orders) {
          setMyOrders(altResult.data.orders);
        }
        return;
      }

      if (result.data?.myOrders) {
        setMyOrders(result.data.myOrders);
      }
    } catch (err) {
      console.error('Erro de rede ao buscar pedidos:', err);
    }
  }, []);

  // ✅ Pedidos ativos para rastreamento
  // DELIVERED fica visível para o cliente confirmar recebimento
  const activeTrackingOrders = myOrders.filter(
    (order) => !['COMPLETED', 'CANCELLED'].includes(order.status)
  );

  // ✅ Confirmar entrega pelo cliente
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
        await fetchMyOrders();
      }
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err);
    }
  };

  // ✅ Alias para compatibilidade com GlobalModals
  const cartItems = cart;
  const setActiveTrackingOrders = setMyOrders;

  const value = {
    // Dados do carrinho
    cart,
    cartItems,
    setCart,
    isCartOpen,
    setIsCartOpen,
    
    // Dados de rastreamento
    isTrackingOpen,
    setIsTrackingOpen,
    myOrders,
    setMyOrders,
    activeTrackingOrders,
    setActiveTrackingOrders,
    
    // Funções do carrinho
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemsCount,
    cartTotalValue,
    getCartTotal,
    
    // Funções de pedidos
    fetchMyOrders,
    handleConfirmDelivery,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

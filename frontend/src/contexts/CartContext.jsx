import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// Criação do contexto do carrinho
const CartContext = createContext();

// Hook personalizado para acessar o contexto do carrinho
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}

// Provider que encapsula toda a lógica do carrinho e pedidos
export function CartProvider({ children }) {
  // Estados do carrinho e UI
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  
  // Ref para evitar chamadas duplicadas causadas pelo StrictMode do React
  const addingRef = useRef(false);

  // Adiciona um produto ao carrinho (com quantidade e observação opcional)
  const addToCart = useCallback((product, quantity = 1, observation = '') => {
    // Previne chamada dupla do StrictMode
    if (addingRef.current) return;
    addingRef.current = true;
    
    setCart((prevCart) => {
      // Verifica se o item já existe (mesmo id e mesma observação)
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.observation === observation
      );
      
      if (existingIndex > -1) {
        // Se existe, apenas incrementa a quantidade
        const updated = prevCart.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return updated;
      }
      
      // Se não existe, adiciona novo item ao carrinho
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          // Usa preço promocional se disponível, senão o preço normal
          price: Number(product.promotionalPrice) > 0 
            ? Number(product.promotionalPrice) 
            : Number(product.price),
          imageUrl: product.imageUrl,
          quantity,
          observation,
        },
      ];
    });
    
    // Libera o bloqueio após um pequeno delay
    setTimeout(() => {
      addingRef.current = false;
    }, 100);
  }, []);

  // Remove um item do carrinho (baseado em id e observação)
  const removeFromCart = useCallback((productId, observation = '') => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.id === productId && item.observation === observation)
      )
    );
  }, []);

  // Atualiza a quantidade de um item no carrinho
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

  // Limpa completamente o carrinho
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Calcula o número total de itens no carrinho
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calcula o valor total do carrinho (soma dos preços * quantidades)
  const cartTotalValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Função para obter o total do carrinho (usada em componentes)
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Busca os pedidos do usuário autenticado via GraphQL
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

  // Filtra pedidos ativos (não finalizados nem cancelados) para rastreamento
  const activeTrackingOrders = myOrders.filter((order) => {
    const finishedStatuses = ['COMPLETED', 'CANCELLED'];
    return !finishedStatuses.includes(order.status);
  });

  // Confirma a entrega ou retirada de um pedido pelo cliente
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
        // Atualiza o estado local imediatamente
        setMyOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'COMPLETED' }
              : order
          )
        );
        
        // Recarrega os pedidos para garantir consistência
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

  // Objeto de valor exposto pelo contexto
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
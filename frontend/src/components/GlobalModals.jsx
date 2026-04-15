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
};

// Componente que gerencia os modais globais: Carrinho e Acompanhamento de Pedidos
export default function GlobalModals() {
  const {
    isCartOpen,
    setIsCartOpen,
    isTrackingOpen,
    setIsTrackingOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    activeTrackingOrders,
    fetchMyOrders,
    handleConfirmDelivery,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); 
  const [confirmingOrderId, setConfirmingOrderId] = useState(null); 

  useEffect(() => {
    if (!isTrackingOpen) return;
    fetchMyOrders(); 
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [isTrackingOpen, fetchMyOrders]);

  // Retorna informações visuais para cada status do pedido
  // Agora considera o tipo de entrega (DELIVERY ou PICKUP)
  const getStatusInfo = (status, deliveryType = 'DELIVERY') => {
    const isPickup = deliveryType === 'PICKUP';

    // Status base (comum para delivery e pickup)
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

    // Status específicos para PICKUP (Retirada)
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

    // Status específicos para DELIVERY (Entrega)
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

    // Seleciona o mapa de status correto baseado no tipo de entrega
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
    setConfirmingOrderId(orderId);
    await handleConfirmDelivery(orderId);
    setConfirmingOrderId(null);
  };

  const deliveryFee = 5.0;
  const cartTotal = getCartTotal();
  const orderTotal = cartTotal + deliveryFee;

  return (
    <>
      {/* MODAL DO CARRINHO */}
      {isCartOpen && (
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
                      key={`${item.id}-${item.observation || index}`}
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
                          {item.observation && (
                            <p className="text-[#1e3a5f]/40 text-xs mt-1 truncate">
                              Obs: {item.observation}
                            </p>
                          )}
                          <p className="text-[#1e3a5f] font-black text-lg mt-1">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            {/* Controles de quantidade */}
                            <div className="flex items-center gap-2 bg-[#faf8f5] rounded-xl p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.observation)}
                                className="w-8 h-8 rounded-lg bg-white border border-[#1e3a5f]/10 text-[#1e3a5f] font-bold hover:bg-[#1e3a5f] hover:text-white transition-colors flex items-center justify-center"
                              >
                                −
                              </button>
                              <span className="text-[#1e3a5f] font-bold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.observation)}
                                className="w-8 h-8 rounded-lg bg-white border border-[#1e3a5f]/10 text-[#1e3a5f] font-bold hover:bg-[#1e3a5f] hover:text-white transition-colors flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            {/* Botão remover item */}
                            <button
                              onClick={() => removeFromCart(item.id, item.observation)}
                              className="p-2 text-[#1e3a5f]/40 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-lg transition-colors"
                            >
                              <Icons.Trash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <div className="flex justify-between text-[#1e3a5f]/60 text-sm">
                    <span>Taxa de entrega</span>
                    <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
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

                        {/* Timeline de progresso (exceto cancelados) */}
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

                        {/* Endereço de entrega (apenas para delivery) */}
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
                          <div className="border-t border-[#1e3a5f]/10 pt-2 sm:pt-3 flex justify-between">
                            <span className="font-bold text-[#1e3a5f] text-sm">Total</span>
                            <span className="font-black text-[#1e3a5f] text-base sm:text-lg">
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                        {/* Botão de confirmação (quando entregue/retirado) */}
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
                                  <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
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

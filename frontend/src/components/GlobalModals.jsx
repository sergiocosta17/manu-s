import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import CheckoutModal from './CheckoutModal';

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
    clearCart,
    activeTrackingOrders,
    fetchMyOrders,
    handleConfirmDelivery,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // ✅ POLLING: Atualiza status dos pedidos quando modal está aberto
  useEffect(() => {
    if (!isTrackingOpen) return;
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [isTrackingOpen, fetchMyOrders]);

  // ✅ FUNÇÃO ATUALIZADA: Retorna info do status baseado no tipo de entrega
  const getStatusInfo = (status, deliveryType = 'DELIVERY') => {
    const isPickup = deliveryType === 'PICKUP';

    const statusMap = {
      PLACED: {
        label: 'Pedido Recebido',
        icon: '📋',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        step: 1,
        description: 'Aguardando confirmação do restaurante',
      },
      CONFIRMED: {
        label: 'Confirmado',
        icon: '✅',
        color: 'text-green-600',
        bg: 'bg-green-50',
        step: 1,
        description: 'Pedido confirmado pelo restaurante',
      },
      PENDING: {
        label: 'Pedido Recebido',
        icon: '📋',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        step: 1,
        description: 'Aguardando confirmação',
      },
      PREPARING: {
        label: 'Em Preparo',
        icon: '🔥',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        step: 2,
        description: 'Seu pedido está sendo preparado',
      },
      READY: {
        label: 'Pronto',
        icon: '✨',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        step: 3,
        description: isPickup 
          ? 'Pedido pronto para retirada!' 
          : 'Pedido pronto! Saindo para entrega',
      },
      // ✅ STATUS PARA ENTREGA
      OUT_FOR_DELIVERY: {
        label: 'Saiu para Entrega',
        icon: '🛵',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        step: 3,
        description: 'O entregador está a caminho',
      },
      DELIVERED: {
        label: 'Entregue',
        icon: '🎉',
        color: 'text-green-600',
        bg: 'bg-green-50',
        step: 4,
        description: 'Confirme o recebimento do seu pedido',
      },
      // ✅ STATUS PARA RETIRADA
      READY_FOR_PICKUP: {
        label: 'Pronto para Retirada',
        icon: '📦',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        step: 3,
        description: 'Seu pedido está pronto! Venha retirar',
      },
      PICKED_UP: {
        label: 'Retirado',
        icon: '🎉',
        color: 'text-green-600',
        bg: 'bg-green-50',
        step: 4,
        description: 'Confirme a retirada do seu pedido',
      },
      COMPLETED: {
        label: 'Finalizado',
        icon: '✅',
        color: 'text-green-600',
        bg: 'bg-green-50',
        step: 4,
        description: 'Pedido concluído com sucesso!',
      },
      CANCELLED: {
        label: 'Cancelado',
        icon: '❌',
        color: 'text-red-600',
        bg: 'bg-red-50',
        step: 0,
        description: 'Este pedido foi cancelado',
      },
    };

    return statusMap[status] || statusMap.PENDING;
  };

  // ✅ FUNÇÃO: Verifica se precisa confirmar (entrega ou retirada)
  const needsConfirmation = (order) => {
    if (order.deliveryType === 'PICKUP') {
      return order.status === 'PICKED_UP';
    }
    return order.status === 'DELIVERED';
  };

  // ✅ FUNÇÃO: Retorna texto e mensagens baseado no tipo
  const getConfirmationTexts = (deliveryType) => {
    if (deliveryType === 'PICKUP') {
      return {
        title: '📦 Pedido retirado!',
        subtitle: 'Por favor, confirme a retirada',
        buttonText: '✓ CONFIRMAR RETIRADA',
      };
    }
    return {
      title: '🎉 Seu pedido chegou!',
      subtitle: 'Por favor, confirme o recebimento',
      buttonText: '✓ CONFIRMAR RECEBIMENTO',
    };
  };

  // ✅ FUNÇÃO: Retorna o label do tipo de pedido
  const getDeliveryTypeLabel = (deliveryType) => {
    return deliveryType === 'PICKUP' ? '📦 Retirada' : '🛵 Entrega';
  };

  const formatTime = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const deliveryFee = 5.0;
  const cartTotal = getCartTotal();
  const orderTotal = cartTotal + deliveryFee;

  return (
    <>
      {/* ==================== MODAL DO CARRINHO ==================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#1A1A1A] h-full shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">Seu Carrinho</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-white/60 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Itens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 font-bold">Carrinho vazio</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.observation || index}`}
                    className="bg-white/5 rounded-2xl p-4 flex gap-4"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{item.name}</h3>
                      {item.observation && (
                        <p className="text-white/40 text-xs mt-1">Obs: {item.observation}</p>
                      )}
                      <p className="text-[#EBCB6C] font-black mt-1">
                        R$ {(item.promotionalPrice || item.price).toFixed(2).replace('.', ',')}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.observation)}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20"
                        >
                          -
                        </button>
                        <span className="text-white font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.observation)}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.observation)}
                          className="ml-auto text-red-400 hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Taxa de entrega</span>
                  <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-white font-black text-xl">
                  <span>Total</span>
                  <span className="text-[#EBCB6C]">
                    R$ {orderTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-[#EBCB6C] text-[#1A1A1A] font-black py-4 rounded-2xl hover:bg-[#d4b85e] transition-colors"
                >
                  FINALIZAR PEDIDO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ CHECKOUT MODAL */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />

      {/* ==================== MODAL DE ACOMPANHAMENTO ==================== */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsTrackingOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FDF9EB] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#E5DCC3] flex justify-between items-center sticky top-0 bg-[#FDF9EB] rounded-t-3xl z-10">
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A]">Acompanhar Pedidos</h2>
                <p className="text-xs text-[#1A1A1A]/40 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Atualizando automaticamente
                </p>
              </div>
              <button
                onClick={() => setIsTrackingOpen(false)}
                className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeTrackingOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#1A1A1A]/40 font-bold">Nenhum pedido ativo</p>
                </div>
              ) : (
                activeTrackingOrders.map((order) => {
                  // ✅ Passa o deliveryType para obter status correto
                  const statusInfo = getStatusInfo(order.status, order.deliveryType);
                  const showConfirmation = needsConfirmation(order);
                  const confirmTexts = getConfirmationTexts(order.deliveryType);
                  const isCancelled = order.status === 'CANCELLED';
                  const isPickup = order.deliveryType === 'PICKUP';

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                        showConfirmation 
                          ? 'border-green-300 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                          : isCancelled
                            ? 'border-red-200'
                            : 'border-[#E5DCC3]'
                      }`}
                    >
                      {/* Cabeçalho do pedido */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-sm font-black text-[#1A1A1A]/40">
                            PEDIDO #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <p className="text-xs text-[#1A1A1A]/40 mt-1">
                            {formatTime(order.createdAt)}
                          </p>
                          {/* ✅ Badge do tipo de pedido */}
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-bold ${
                            isPickup 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {getDeliveryTypeLabel(order.deliveryType)}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-black ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>

                      {/* Timeline de status */}
                      {!isCancelled && (
                        <div className="mb-6">
                          <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`w-1/4 h-2 rounded-full mx-0.5 transition-all duration-500 ${
                                  step <= statusInfo.step
                                    ? 'bg-gradient-to-r from-[#C1704D] to-[#EBCB6C]'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-[#1A1A1A]/60 text-center">
                            {statusInfo.description}
                          </p>
                        </div>
                      )}

                      {/* Mensagem de cancelado */}
                      {isCancelled && (
                        <div className="mb-4 p-4 bg-red-50 rounded-xl text-center">
                          <p className="text-red-600 font-bold">{statusInfo.description}</p>
                        </div>
                      )}

                      {/* ✅ Endereço de entrega (apenas para DELIVERY) */}
                      {!isPickup && order.deliveryAddress && (
                        <div className="bg-blue-50 rounded-xl p-3 mb-4">
                          <p className="text-xs font-bold text-blue-700 mb-1">📍 Entregar em:</p>
                          <p className="text-sm text-blue-900">
                            {order.deliveryAddress.street}, {order.deliveryAddress.number}
                            {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
                            <br />
                            {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}/{order.deliveryAddress.state}
                          </p>
                        </div>
                      )}

                      {/* ✅ Aviso de retirada (apenas para PICKUP) */}
                      {isPickup && order.status === 'READY_FOR_PICKUP' && (
                        <div className="bg-purple-50 rounded-xl p-3 mb-4 text-center">
                          <p className="text-purple-700 font-bold text-sm">
                            📍 Retire seu pedido no balcão!
                          </p>
                        </div>
                      )}

                      {/* Itens do pedido */}
                      <div className="bg-[#FDF9EB] rounded-xl p-4 mb-4">
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-sm">
                              <span className="text-[#1A1A1A]/80">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-bold text-[#1A1A1A]">
                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-[#E5DCC3] mt-3 pt-3 flex justify-between">
                          <span className="font-black text-[#1A1A1A]">Total</span>
                          <span className="font-black text-[#C1704D]">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      {/* ✅ BOTÃO DE CONFIRMAR (ENTREGA OU RETIRADA) */}
                      {showConfirmation && (
                        <div className="space-y-3">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <p className="text-green-700 font-bold text-sm mb-1">
                              {confirmTexts.title}
                            </p>
                            <p className="text-green-600 text-xs">
                              {confirmTexts.subtitle}
                            </p>
                          </div>
                          <button
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
                          >
                            {confirmTexts.buttonText}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
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

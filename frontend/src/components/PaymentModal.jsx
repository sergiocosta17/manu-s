import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

// ÍCONES SVG
// Componentes funcionais para ícones usados no modal de pagamento
const Icons = {
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Motorcycle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  Store: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Pix: ({ className = "w-5 h-5", color = "currentColor" }) => (
    <svg className={className} fill={color} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z"/>
      <path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z"/>
    </svg>
  ),
  CreditCard: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Cash: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Lightning: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

// Modal de pagamento (etapa final do checkout)
export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onBack,
  address,
  isNewAddress,
  deliveryType,
  cart, 
  subtotal, 
  shippingFee, 
  total,
  onSuccess 
}) {
  const { fetchMyOrders } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);

  // Opções de métodos de pagamento disponíveis
  const paymentMethods = [
    { 
      id: 'PIX', 
      label: 'PIX', 
      icon: (selected) => <Icons.Pix className="w-6 h-6" color={selected ? "#fff" : "#32BCAD"} />,
      description: 'Pagamento instantâneo', 
      highlight: true 
    },
    { 
      id: 'CREDIT_CARD', 
      label: 'Cartão de Crédito', 
      icon: () => <Icons.CreditCard className="w-6 h-6" />,
      description: 'Pague na entrega' 
    },
    { 
      id: 'DEBIT_CARD', 
      label: 'Cartão de Débito', 
      icon: () => <Icons.CreditCard className="w-6 h-6" />,
      description: 'Pague na entrega' 
    },
    { 
      id: 'CASH', 
      label: 'Dinheiro', 
      icon: () => <Icons.Cash className="w-6 h-6" />,
      description: 'Pague na entrega' 
    },
  ];

  // Submete o pedido para a API GraphQL
  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      alert('Selecione uma forma de pagamento');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Prepara os itens do pedido a partir do carrinho
      const itemsInput = cart.map((item) => ({
        product: item.id,
        name: item.name,
        price: item.promotionalPrice || item.price,
        quantity: item.quantity,
      }));

      // Prepara endereço de entrega se for delivery
      let deliveryAddressInput = null;
      if (deliveryType === 'DELIVERY' && address) {
        deliveryAddressInput = {
          label: address.label || 'Entrega',
          zipCode: address.zipCode,
          street: address.street,
          number: address.number,
          complement: address.complement || '',
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        };
      }

      // Monta o input completo do pedido
      const orderInput = {
        items: itemsInput,
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: 0,
        total: total,
        couponCode: null,
        deliveryType: deliveryType,
        deliveryAddress: deliveryAddressInput,
        paymentMethod: paymentMethod,
      };

      // Chamada GraphQL para criar pedido
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateOrder($input: OrderInput!) {
              createOrder(input: $input) {
                id
                status
                total
                createdAt
              }
            }
          `,
          variables: { input: orderInput },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.createOrder) {
        await fetchMyOrders();
        onSuccess(); 
        alert(`Pedido #${result.data.createOrder.id.slice(-6).toUpperCase()} criado com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      alert(`Erro ao finalizar pedido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Formata endereço para exibição resumida
  const formatAddress = () => {
    if (!address) return 'Retirada na loja';
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood} - ${address.city}/${address.state}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay escurecido */}
      <div 
        className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header com título e progresso */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Pagamento</h2>
              <p className="text-white/60 text-sm mt-1">Etapa 2 de 2 • Forma de pagamento</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icons.Close className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Barra de progresso - ambas etapas preenchidas na etapa 2 */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1.5 bg-[#d4a853] rounded-full" />
            <div className="flex-1 h-1.5 bg-[#d4a853] rounded-full" />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#faf8f5]">
          
          {/* Card de endereço/tipo de entrega selecionado */}
          <div className="bg-white rounded-2xl p-4 border border-[#1e3a5f]/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center flex-shrink-0 text-white">
                {deliveryType === 'DELIVERY' ? <Icons.Motorcycle className="w-5 h-5" /> : <Icons.Store className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1e3a5f]/50 text-xs font-medium">
                  {deliveryType === 'DELIVERY' ? 'Entregar em' : 'Retirar em'}
                </p>
                <p className="text-[#1e3a5f] font-bold text-sm truncate">{formatAddress()}</p>
              </div>
              <button
                onClick={onBack}
                className="text-[#d4a853] text-sm font-bold hover:underline flex-shrink-0"
              >
                Alterar
              </button>
            </div>
          </div>

          {/* Seleção de forma de pagamento */}
          <div>
            <label className="block text-[#1e3a5f] font-bold mb-3">Forma de Pagamento</label>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                        : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                      }`}>
                        {method.icon(isSelected)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[#1e3a5f] font-bold">{method.label}</p>
                          {method.highlight && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Icons.Lightning className="w-3 h-3" />
                              RÁPIDO
                            </span>
                          )}
                        </div>
                        <p className="text-[#1e3a5f]/50 text-sm">{method.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#1e3a5f]' : 'border-[#1e3a5f]/30'
                      }`}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 bg-[#1e3a5f] rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumo final do pedido */}
          <div className="bg-white rounded-2xl p-4 border border-[#1e3a5f]/10">
            <h3 className="text-[#1e3a5f] font-bold mb-3">Resumo do Pedido</h3>
            
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-[#1e3a5f]/70">{item.quantity}x {item.name}</span>
                  <span className="text-[#1e3a5f]/70">
                    R$ {((item.promotionalPrice || item.price) * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1e3a5f]/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-[#1e3a5f]/60">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-[#1e3a5f]/60">
                <span>Entrega</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee > 0 ? `R$ ${shippingFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e3a5f]/10">
                <span className="text-[#1e3a5f] font-bold">Total</span>
                <span className="text-[#d4a853] font-black text-2xl">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botões de navegação */}
        <div className="p-6 bg-white border-t border-[#1e3a5f]/10">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={!paymentMethod || loading}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c49843] hover:from-[#c49843] hover:to-[#b48833] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4a853]/30"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Icons.Spinner className="w-5 h-5" />
                  Enviando...
                </div>
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
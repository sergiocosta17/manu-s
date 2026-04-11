import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

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

  const paymentMethods = [
    { id: 'PIX', label: 'PIX', icon: '💠', description: 'Pagamento instantâneo' },
    { id: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳', description: 'Pague na entrega' },
    { id: 'DEBIT_CARD', label: 'Cartão de Débito', icon: '💳', description: 'Pague na entrega' },
    { id: 'CASH', label: 'Dinheiro', icon: '💵', description: 'Pague na entrega' },
  ];

  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      alert('Selecione uma forma de pagamento');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // ✅ Montar items conforme OrderItemInput do schema
      const itemsInput = cart.map((item) => ({
        product: item.id,
        name: item.name,
        price: item.promotionalPrice || item.price,
        quantity: item.quantity,
      }));

      // ✅ Montar deliveryAddress conforme AddressInput
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
          variables: {
            input: orderInput,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.createOrder) {
        await fetchMyOrders();
        onSuccess();
        alert(`Pedido #${result.data.createOrder.id.slice(-6).toUpperCase()} criado com sucesso! 🎉`);
      }
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      alert(`Erro ao finalizar pedido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!address) return 'Retirada na loja';
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood} - ${address.city}/${address.state}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#1A1A1A] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Pagamento</h2>
              <p className="text-white/50 text-sm mt-1">Etapa 2 de 2 - Forma de pagamento</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 bg-[#C1704D] rounded-full" />
            <div className="flex-1 h-1 bg-[#C1704D] rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Endereço/Tipo Selecionado */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C1704D]/20 flex items-center justify-center text-xl">
                {deliveryType === 'DELIVERY' ? '🛵' : '🏪'}
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-xs font-medium">
                  {deliveryType === 'DELIVERY' ? 'Entregar em' : 'Retirar em'}
                </p>
                <p className="text-white font-bold text-sm">{formatAddress()}</p>
              </div>
              <button
                onClick={onBack}
                className="text-[#C1704D] text-sm font-bold hover:underline"
              >
                Alterar
              </button>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div>
            <label className="block text-white font-bold mb-3">Forma de Pagamento *</label>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === method.id
                      ? 'border-[#C1704D] bg-[#C1704D]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      paymentMethod === method.id ? 'bg-[#C1704D]' : 'bg-white/10'
                    }`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{method.label}</p>
                      <p className="text-white/50 text-sm">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id ? 'border-[#C1704D]' : 'border-white/30'
                    }`}>
                      {paymentMethod === method.id && (
                        <div className="w-2.5 h-2.5 bg-[#C1704D] rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumo Final */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">Resumo do Pedido</h3>
            
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-white/70">{item.quantity}x {item.name}</span>
                  <span className="text-white/70">
                    R$ {((item.promotionalPrice || item.price) * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Entrega</span>
                <span>{shippingFee > 0 ? `R$ ${shippingFee.toFixed(2).replace('.', ',')}` : 'Grátis'}</span>
              </div>
              <div className="flex justify-between text-white font-black text-xl pt-2">
                <span>Total</span>
                <span className="text-[#C1704D]">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={!paymentMethod || loading}
              className="flex-1 py-4 rounded-2xl bg-[#C1704D] hover:bg-[#A35C3E] text-white font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
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

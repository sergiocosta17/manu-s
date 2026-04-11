import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import PaymentModal from './PaymentModal';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, getCartTotal, clearCart } = useCart();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deliveryType, setDeliveryType] = useState('DELIVERY');
  
  // Estado para endereço da loja
  const [storeAddress, setStoreAddress] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);

  const shippingFee = deliveryType === 'DELIVERY' ? 5.0 : 0;
  const subtotal = getCartTotal();
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (isOpen) {
      fetchUserAddresses();
      fetchStoreAddress();
    }
  }, [isOpen]);

  const fetchUserAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query { 
            me { 
              id 
              addresses {
                id
                label
                zipCode
                street
                number
                complement
                neighborhood
                city
                state
                isDefault
              }
            } 
          }`,
        }),
      });

      const result = await response.json();
      if (result.data?.me?.addresses) {
        setSavedAddresses(result.data.me.addresses);
        const defaultAddr = result.data.me.addresses.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (result.data.me.addresses.length > 0) {
          setSelectedAddressId(result.data.me.addresses[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar endereços:', err);
    }
  };

  // Busca endereço da loja (configurações do admin)
  const fetchStoreAddress = async () => {
    setLoadingStore(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query { 
            storeSettings {
              storeName
              storeAddress
              storePhone
            }
          }`,
        }),
      });

      const result = await response.json();
      if (result.data?.storeSettings) {
        setStoreAddress(result.data.storeSettings);
      }
    } catch (err) {
      console.error('Erro ao buscar endereço da loja:', err);
      // Fallback caso a query não exista ainda
      setStoreAddress({
        storeName: 'Nossa Loja',
        storeAddress: 'Configure o endereço no painel admin',
        storePhone: null
      });
    } finally {
      setLoadingStore(false);
    }
  };

  // Função para buscar CEP via ViaCEP
  const fetchAddressByCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    setCepError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }

      setNewAddress(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        complement: data.complemento || prev.complement,
      }));

      setCepError('');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  // Handler para mudança no campo CEP
  const handleCepChange = (e) => {
    let value = e.target.value;
    
    value = value.replace(/\D/g, '');
    
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    
    setNewAddress({ ...newAddress, zipCode: value });
    setCepError('');

    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const handleContinueToPayment = () => {
    // Para retirada, não precisa de endereço do cliente
    if (deliveryType === 'DELIVERY' && !selectedAddressId && !newAddress.street) {
      alert('Selecione ou adicione um endereço de entrega');
      return;
    }
    setShowPaymentModal(true);
  };

  const getSelectedAddress = () => {
    // Para retirada, retorna null (não precisa de endereço do cliente)
    if (deliveryType === 'PICKUP') {
      return null;
    }
    if (showNewAddress) {
      return newAddress;
    }
    return savedAddresses.find(a => a.id === selectedAddressId);
  };

  // Reseta o formulário de novo endereço
  const resetNewAddressForm = () => {
    setNewAddress({
      label: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    });
    setCepError('');
  };

  if (!isOpen) return null;

  if (showPaymentModal) {
    return (
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          onClose();
        }}
        onBack={() => setShowPaymentModal(false)}
        address={getSelectedAddress()}
        isNewAddress={showNewAddress && deliveryType === 'DELIVERY'}
        deliveryType={deliveryType}
        cart={cart}
        subtotal={subtotal}
        shippingFee={shippingFee}
        total={total}
        onSuccess={() => {
          setShowPaymentModal(false);
          onClose();
          clearCart();
        }}
      />
    );
  }

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
              <h2 className="text-2xl font-black text-white">Finalizar Pedido</h2>
              <p className="text-white/50 text-sm mt-1">Etapa 1 de 2 - Entrega</p>
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
            <div className="flex-1 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tipo de Entrega */}
          <div>
            <label className="block text-white font-bold mb-3">Tipo de Entrega *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('DELIVERY')}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'DELIVERY'
                    ? 'border-[#C1704D] bg-[#C1704D]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-2">🛵</div>
                <p className="text-white font-bold text-sm">Delivery</p>
                <p className="text-white/50 text-xs">R$ 5,00</p>
              </button>
              <button
                onClick={() => setDeliveryType('PICKUP')}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'PICKUP'
                    ? 'border-[#C1704D] bg-[#C1704D]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-2">🏪</div>
                <p className="text-white font-bold text-sm">Retirada</p>
                <p className="text-white/50 text-xs">Grátis</p>
              </button>
            </div>
          </div>

          {/* Endereço da Loja (para PICKUP) */}
          {deliveryType === 'PICKUP' && (
            <div className="bg-gradient-to-br from-[#C1704D]/20 to-[#C1704D]/5 rounded-2xl p-5 border border-[#C1704D]/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C1704D]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#C1704D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-sm mb-1">Local de Retirada</h4>
                  {loadingStore ? (
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Carregando...
                    </div>
                  ) : storeAddress ? (
                    <>
                      <p className="text-[#C1704D] font-bold">{storeAddress.storeName || 'Nossa Loja'}</p>
                      <p className="text-white/70 text-sm mt-1">{storeAddress.storeAddress || 'Endereço não configurado'}</p>
                      {storeAddress.storePhone && (
                        <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {storeAddress.storePhone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-white/50 text-sm">Endereço da loja não configurado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Endereços (apenas para DELIVERY) */}
          {deliveryType === 'DELIVERY' && (
            <div>
              <label className="block text-white font-bold mb-3">Endereço de Entrega *</label>

              {savedAddresses.length > 0 && !showNewAddress && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#C1704D] bg-[#C1704D]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          selectedAddressId === addr.id ? 'border-[#C1704D]' : 'border-white/30'
                        }`}>
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 bg-[#C1704D] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{addr.label || 'Endereço'}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-[#C1704D]/20 text-[#C1704D] px-2 py-0.5 rounded-full font-bold">
                                PADRÃO
                              </span>
                            )}
                          </div>
                          <p className="text-white/70 text-sm mt-1">
                            {addr.street}, {addr.number}
                            {addr.complement && ` - ${addr.complement}`}
                          </p>
                          <p className="text-white/50 text-xs">
                            {addr.neighborhood} - {addr.city}/{addr.state}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Botão Adicionar Novo */}
              {!showNewAddress ? (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Usar outro endereço</span>
                  </div>
                </button>
              ) : (
                /* Formulário Novo Endereço */
                <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Novo Endereço</span>
                    <button
                      onClick={() => {
                        setShowNewAddress(false);
                        resetNewAddressForm();
                      }}
                      className="text-white/50 hover:text-white text-sm"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* CAMPO CEP COM BUSCA AUTOMÁTICA */}
                    <div>
                      <label className="block text-white/70 text-xs mb-1">CEP *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newAddress.zipCode}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          maxLength={9}
                          className={`w-full bg-white/10 border rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                            cepError 
                              ? 'border-red-500 focus:border-red-500' 
                              : loadingCep 
                                ? 'border-yellow-500' 
                                : 'border-white/10 focus:border-[#C1704D]'
                          }`}
                        />
                        {loadingCep && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg className="w-4 h-4 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                        {!loadingCep && newAddress.street && newAddress.zipCode.length === 9 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      {cepError && (
                        <p className="text-red-400 text-xs mt-1">{cepError}</p>
                      )}
                    </div>
                    
                    {/* Apelido sem valor padrão */}
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Apelido</label>
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Ex: Casa, Trabalho..."
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-white/70 text-xs mb-1">Rua *</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Nome da rua"
                        disabled={loadingCep}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Nº *</label>
                      <input
                        type="text"
                        value={newAddress.number}
                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                        placeholder="123"
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-xs mb-1">Complemento</label>
                    <input
                      type="text"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                      placeholder="Apto, Bloco..."
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-xs mb-1">Bairro *</label>
                    <input
                      type="text"
                      value={newAddress.neighborhood}
                      onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      disabled={loadingCep}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D] disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-white/70 text-xs mb-1">Cidade *</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Cidade"
                        disabled={loadingCep}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs mb-1">UF *</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value.toUpperCase() })}
                        placeholder="PB"
                        maxLength={2}
                        disabled={loadingCep}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C1704D] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resumo */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Entrega</span>
                <span>{shippingFee > 0 ? `R$ ${shippingFee.toFixed(2).replace('.', ',')}` : 'Grátis'}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between text-white font-black text-lg">
                  <span>Total</span>
                  <span className="text-[#C1704D]">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleContinueToPayment}
              disabled={deliveryType === 'DELIVERY' && !selectedAddressId && !newAddress.street}
              className="flex-1 py-4 rounded-2xl bg-[#C1704D] hover:bg-[#A35C3E] text-white font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continuar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import PaymentModal from './PaymentModal';

// ÍCONES SVG
// Componentes funcionais para ícones usados na interface
const Icons = {
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
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
  LocationMarker: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Phone: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
};

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, getCartTotal, clearCart } = useCart(); // Contexto do carrinho
  
  // Estados locais
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
  const [deliveryType, setDeliveryType] = useState('DELIVERY'); // 'DELIVERY' ou 'PICKUP'
  const [storeAddress, setStoreAddress] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);

  // Cálculo de valores
  const shippingFee = deliveryType === 'DELIVERY' ? 5.0 : 0;
  const subtotal = getCartTotal();
  const total = subtotal + shippingFee;

  // Efeito executado quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      fetchUserAddresses(); // Busca endereços salvos do usuário
      fetchStoreAddress();  // Busca dados da loja para retirada
    }
  }, [isOpen]);

  // Busca os endereços do usuário autenticado via GraphQL
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
        // Seleciona o endereço padrão ou o primeiro da lista
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

  // Busca configurações da loja (endereço para retirada) via GraphQL
  const fetchStoreAddress = async () => {
    setLoadingStore(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setStoreAddress({
        storeName: 'Nossa Loja',
        storeAddress: 'Configure o endereço no painel admin',
        storePhone: null
      });
    } finally {
      setLoadingStore(false);
    }
  };

  // Consulta API ViaCEP para preencher automaticamente o endereço
  const fetchAddressByCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

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

  // Handler para campo CEP com máscara e disparo da consulta
  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
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

  // Avança para a etapa de pagamento, validando endereço se delivery
  const handleContinueToPayment = () => {
    if (deliveryType === 'DELIVERY' && !selectedAddressId && !newAddress.street) {
      alert('Selecione ou adicione um endereço de entrega');
      return;
    }
    setShowPaymentModal(true);
  };

  // Obtém o objeto de endereço atualmente selecionado/preenchido
  const getSelectedAddress = () => {
    if (deliveryType === 'PICKUP') return null;
    if (showNewAddress) return newAddress;
    return savedAddresses.find(a => a.id === selectedAddressId);
  };

  // Limpa o formulário de novo endereço
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

  // Se modal fechado, não renderiza nada
  if (!isOpen) return null;

  // Se estiver na etapa de pagamento, renderiza PaymentModal
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

  // Renderização principal do modal de checkout
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header com título e progresso */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Finalizar Pedido</h2>
              <p className="text-white/60 text-sm mt-1">Etapa 1 de 2 • Entrega</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icons.Close className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1.5 bg-[#d4a853] rounded-full" />
            <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#faf8f5]">
          
          {/* Seletor de tipo de entrega */}
          <div>
            <label className="block text-[#1e3a5f] font-bold mb-3">Como deseja receber?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('DELIVERY')}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'DELIVERY'
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                    : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                  deliveryType === 'DELIVERY' ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  <Icons.Motorcycle className="w-6 h-6" />
                </div>
                <p className="text-[#1e3a5f] font-bold text-sm">Delivery</p>
                <p className="text-[#1e3a5f]/50 text-xs">R$ 5,00</p>
              </button>
              <button
                onClick={() => setDeliveryType('PICKUP')}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'PICKUP'
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                    : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                  deliveryType === 'PICKUP' ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  <Icons.Store className="w-6 h-6" />
                </div>
                <p className="text-[#1e3a5f] font-bold text-sm">Retirada</p>
                <p className="text-green-600 text-xs font-medium">Grátis</p>
              </button>
            </div>
          </div>

          {/* Informações da loja para retirada */}
          {deliveryType === 'PICKUP' && (
            <div className="bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 rounded-2xl p-5 border border-[#1e3a5f]/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Icons.LocationMarker className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[#1e3a5f] font-bold text-sm mb-1">Local de Retirada</h4>
                  {loadingStore ? (
                    <div className="flex items-center gap-2 text-[#1e3a5f]/50 text-sm">
                      <Icons.Spinner className="w-4 h-4" />
                      Carregando...
                    </div>
                  ) : storeAddress ? (
                    <>
                      <p className="text-[#d4a853] font-bold">{storeAddress.storeName || 'Nossa Loja'}</p>
                      <p className="text-[#1e3a5f]/70 text-sm mt-1">{storeAddress.storeAddress || 'Endereço não configurado'}</p>
                      {storeAddress.storePhone && (
                        <p className="text-[#1e3a5f]/50 text-xs mt-2 flex items-center gap-1">
                          <Icons.Phone className="w-3 h-3" />
                          {storeAddress.storePhone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[#1e3a5f]/50 text-sm">Endereço não configurado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Seleção/criação de endereço (apenas para DELIVERY) */}
          {deliveryType === 'DELIVERY' && (
            <div>
              <label className="block text-[#1e3a5f] font-bold mb-3">Endereço de Entrega</label>

              {/* Lista de endereços salvos */}
              {savedAddresses.length > 0 && !showNewAddress && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                          : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          selectedAddressId === addr.id ? 'border-[#1e3a5f]' : 'border-[#1e3a5f]/30'
                        }`}>
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 bg-[#1e3a5f] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[#1e3a5f] font-bold">{addr.label || 'Endereço'}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-[#d4a853]/20 text-[#d4a853] px-2 py-0.5 rounded-full font-bold">
                                PADRÃO
                              </span>
                            )}
                          </div>
                          <p className="text-[#1e3a5f]/70 text-sm mt-1">
                            {addr.street}, {addr.number}
                            {addr.complement && ` - ${addr.complement}`}
                          </p>
                          <p className="text-[#1e3a5f]/50 text-xs">
                            {addr.neighborhood} - {addr.city}/{addr.state}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Botão para adicionar novo endereço */}
              {!showNewAddress ? (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-[#1e3a5f]/20 hover:border-[#1e3a5f]/40 text-left transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center">
                      <Icons.Plus className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <span className="text-[#1e3a5f] font-bold">Usar outro endereço</span>
                  </div>
                </button>
              ) : (
                /* Formulário para novo endereço */
                <div className="space-y-4 p-4 bg-white rounded-2xl border border-[#1e3a5f]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1e3a5f] font-bold">Novo Endereço</span>
                    <button
                      onClick={() => {
                        setShowNewAddress(false);
                        resetNewAddressForm();
                      }}
                      className="text-[#1e3a5f]/50 hover:text-[#1e3a5f] text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Campos do endereço */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">CEP *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newAddress.zipCode}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          maxLength={9}
                          className={`w-full bg-[#faf8f5] border rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none transition-colors ${
                            cepError 
                              ? 'border-red-400 focus:border-red-500' 
                              : loadingCep 
                                ? 'border-amber-400' 
                                : 'border-[#1e3a5f]/10 focus:border-[#1e3a5f]'
                          }`}
                        />
                        {loadingCep && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Icons.Spinner className="w-4 h-4 text-amber-500" />
                          </div>
                        )}
                        {!loadingCep && newAddress.street && newAddress.zipCode.length === 9 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Icons.Check className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Apelido</label>
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Ex: Casa, Trabalho..."
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Rua *</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Nome da rua"
                        disabled={loadingCep}
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Nº *</label>
                      <input
                        type="text"
                        value={newAddress.number}
                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                        placeholder="123"
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Complemento</label>
                    <input
                      type="text"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                      placeholder="Apto, Bloco..."
                      className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Bairro *</label>
                    <input
                      type="text"
                      value={newAddress.neighborhood}
                      onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      disabled={loadingCep}
                      className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">Cidade *</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Cidade"
                        disabled={loadingCep}
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1e3a5f]/70 text-xs mb-1 font-medium">UF *</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value.toUpperCase() })}
                        placeholder="PB"
                        maxLength={2}
                        disabled={loadingCep}
                        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-3 py-2.5 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resumo do pedido */}
          <div className="bg-white rounded-2xl p-4 border border-[#1e3a5f]/10">
            <h3 className="text-[#1e3a5f] font-bold mb-3">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#1e3a5f]/60">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-[#1e3a5f]/60">
                <span>Entrega</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee > 0 ? `R$ ${shippingFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
                </span>
              </div>
              <div className="border-t border-[#1e3a5f]/10 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#1e3a5f] font-bold">Total</span>
                  <span className="text-[#d4a853] font-black text-xl">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com ações de navegação */}
        <div className="p-6 bg-white border-t border-[#1e3a5f]/10">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-bold transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleContinueToPayment}
              disabled={deliveryType === 'DELIVERY' && !selectedAddressId && !newAddress.street}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#1e3a5f]/20"
            >
              Continuar
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
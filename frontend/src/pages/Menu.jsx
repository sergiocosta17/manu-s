import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// ÍCONES SVG
const Icons = {
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Minus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
    </svg>
  ),
  Cart: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  ChevronRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Trash: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Home: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Tag: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  User: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Box: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Burger: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 10H2c0-2.76 4.48-5 10-5s10 2.24 10 5zM2 12h20v2c0 1.1-.9 2-2 2h-.67c.44-.58.67-1.27.67-2 0-1.65-1.35-3-3-3s-3 1.35-3 3c0 .73.23 1.42.67 2h-5.34c.44-.58.67-1.27.67-2 0-1.65-1.35-3-3-3s-3 1.35-3 3c0 .73.23 1.42.67 2H4c-1.1 0-2-.9-2-2v-2zm0 6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2H2z"/>
    </svg>
  ),
  Star: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  AlertCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Mapeamento de dias da semana
const DAY_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Função para verificar status da loja baseado nos horários
const getStoreStatus = (businessHours) => {
  if (!businessHours) {
    return { isOpen: true, message: '', closingSoon: false, opensAt: '', closesAt: '' };
  }

  try {
    const now = new Date();
    const currentDay = DAY_MAP[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayHours = businessHours[currentDay];

    if (!todayHours || !todayHours.isOpen) {
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (now.getDay() + i) % 7;
        const nextDay = DAY_MAP[nextDayIndex];
        const nextDayHours = businessHours[nextDay];
        if (nextDayHours && nextDayHours.isOpen) {
          const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          return {
            isOpen: false,
            message: i === 1 ? `Abre amanhã às ${nextDayHours.openTime}` : `Abre ${dayNames[nextDayIndex]} às ${nextDayHours.openTime}`,
            closingSoon: false,
            opensAt: nextDayHours.openTime,
            closesAt: ''
          };
        }
      }
      return { isOpen: false, message: 'Fechado', closingSoon: false, opensAt: '', closesAt: '' };
    }

    const [openHour, openMin] = (todayHours.openTime || '00:00').split(':').map(Number);
    const [closeHour, closeMin] = (todayHours.closeTime || '23:59').split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (currentMinutes < openMinutes) {
      return {
        isOpen: false,
        message: `Abre às ${todayHours.openTime}`,
        closingSoon: false,
        opensAt: todayHours.openTime,
        closesAt: todayHours.closeTime
      };
    }

    if (currentMinutes >= closeMinutes) {
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (now.getDay() + i) % 7;
        const nextDay = DAY_MAP[nextDayIndex];
        const nextDayHours = businessHours[nextDay];
        if (nextDayHours && nextDayHours.isOpen) {
          const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          return {
            isOpen: false,
            message: i === 1 ? `Abre amanhã às ${nextDayHours.openTime}` : `Abre ${dayNames[nextDayIndex]} às ${nextDayHours.openTime}`,
            closingSoon: false,
            opensAt: nextDayHours.openTime,
            closesAt: ''
          };
        }
      }
      return { isOpen: false, message: 'Fechado', closingSoon: false, opensAt: '', closesAt: '' };
    }

    const minutesUntilClose = closeMinutes - currentMinutes;
    const closingSoon = minutesUntilClose <= 30;

    return {
      isOpen: true,
      message: closingSoon ? `Fecha em ${minutesUntilClose} min` : `Fecha às ${todayHours.closeTime}`,
      closingSoon,
      opensAt: todayHours.openTime,
      closesAt: todayHours.closeTime
    };
  } catch (e) {
    console.error('Erro ao verificar horário:', e);
    return { isOpen: true, message: '', closingSoon: false, opensAt: '', closesAt: '' };
  }
};

// Página principal do cardápio
export default function Menu() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('FEATURED');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [businessHours, setBusinessHours] = useState(null);
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, message: '', closingSoon: false, opensAt: '', closesAt: '' });

  // Estado para modal de confirmação de remoção
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    product: null
  });

  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    removeFromCartDirect,
    updateQuantity,
    clearCart,
    cartItemsCount,
    cartTotalValue,
    isTrackingOpen,
    setIsTrackingOpen,
    myOrders,
    fetchMyOrders,
    activeTrackingOrders,
    handleConfirmDelivery,
  } = useCart();

  const categories = [
    { id: 'FEATURED', label: 'Destaques', icon: Icons.Star },
    { id: 'BURGER', label: 'Burgers' },
    { id: 'CHICKEN', label: 'Frango' },
    { id: 'COMBO', label: 'Combos' },
    { id: 'SIDE', label: 'Batata-Frita' },
    { id: 'DRINK', label: 'Bebidas' },
    { id: 'DESSERT', label: 'Doces' },
  ];

  // Função para obter quantidade do produto no carrinho
  const getProductQuantityInCart = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Função para obter item do carrinho
  const getCartItem = (productId) => {
    return cart.find(item => item.id === productId);
  };

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query { storeSettings { id businessHours } }`
          })
        });
        const result = await response.json();

        if (result.data?.storeSettings?.businessHours) {
          const parsed = JSON.parse(result.data.storeSettings.businessHours);
          setBusinessHours(parsed);
          setStoreStatus(getStoreStatus(parsed));
        }
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
      }
    };

    fetchBusinessHours();
  }, []);

  useEffect(() => {
    if (!businessHours) return;

    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus(businessHours));
    }, 60000);

    return () => clearInterval(interval);
  }, [businessHours]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            query: `query { 
              products { id name price promotionalPrice description category imageUrl isFeatured } 
              banners { id title subtitle imageUrl }
            }`,
          }),
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);

        setProducts(
          Array.isArray(result.data?.products) ? result.data.products : []
        );
        setBanners(
          Array.isArray(result.data?.banners) ? result.data.banners : []
        );
      } catch (err) {
        setError('Não foi possível sincronizar com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      fetchMyOrders();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners]);

  const goToPreviousBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handleCheckout = async () => {
    if (!storeStatus.isOpen) {
      alert('A loja está fechada no momento. Não é possível finalizar o pedido.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: `mutation CreateOrder($input: OrderInput!) { createOrder(input: $input) { id } }`,
          variables: {
            input: {
              items: cart.map((i) => ({
                product: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
              })),
              subtotal: cartTotalValue,
              shippingFee: 0,
              discount: 0,
              total: cartTotalValue,
              deliveryType: 'DELIVERY',
              paymentMethod: 'PIX',
            },
          },
        }),
      });
      const res = await response.json();
      if (res.errors) throw new Error(res.errors[0].message);

      clearCart();
      setIsCartOpen(false);
      await fetchMyOrders();
      setIsTrackingOpen(true);
    } catch (err) {
      alert('Erro ao finalizar pedido: ' + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const hasValidPromoPrice = (product) => {
    return product.promotionalPrice && Number(product.promotionalPrice) > 0;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    if (!storeStatus.isOpen) {
      alert('A loja está fechada no momento. Volte no horário de funcionamento para fazer seu pedido.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    addToCart(product);
  };

  // Função para incrementar quantidade
  const handleIncrement = (e, product) => {
    e.stopPropagation();
    
    if (!storeStatus.isOpen) {
      alert('A loja está fechada no momento.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    addToCart(product);
  };

  // Função para decrementar quantidade
  const handleDecrement = (e, product) => {
    e.stopPropagation();
    
    const currentQty = getProductQuantityInCart(product.id);
    const cartItem = getCartItem(product.id);
    
    if (currentQty <= 1) {
      // Abre modal de confirmação
      setRemoveModal({
        isOpen: true,
        product: {
          ...product,
          imageUrl: product.imageUrl,
          quantity: currentQty
        }
      });
    } else {
      // Apenas decrementa
      updateQuantity(product.id, currentQty - 1, cartItem?.observation || '');
    }
  };

  // Função para confirmar remoção
  const handleConfirmRemove = () => {
    if (removeModal.product) {
      const cartItem = getCartItem(removeModal.product.id);
      removeFromCartDirect(removeModal.product.id, cartItem?.observation || '');
    }
    setRemoveModal({ isOpen: false, product: null });
  };

  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = activeCategory === 'FEATURED'
    ? safeProducts.filter((p) => p.isFeatured === true)
    : safeProducts.filter((p) => p.category === activeCategory);

  const featuredCount = safeProducts.filter((p) => p.isFeatured === true).length;

  const visibleCategories = categories.filter((cat) => {
    if (cat.id === 'FEATURED') {
      return featuredCount > 0;
    }
    return safeProducts.some((p) => p.category === cat.id);
  });

  useEffect(() => {
    const stillExists = visibleCategories.some(
      (cat) => cat.id === activeCategory
    );

    if (!stillExists && visibleCategories.length > 0) {
      setActiveCategory(visibleCategories[0].id);
    }
  }, [visibleCategories, activeCategory]);

  return (
    <div
      className="min-h-screen flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-[#faf8f5]/85 pointer-events-none"></div>

      <div className="relative z-10 h-20"></div>

      {/* Modal de confirmação de remoção */}
      <ConfirmModal
        isOpen={removeModal.isOpen}
        onClose={() => setRemoveModal({ isOpen: false, product: null })}
        onConfirm={handleConfirmRemove}
        title="Remover item?"
        message="Tem certeza que deseja remover este item do carrinho?"
        product={removeModal.product}
        confirmText="Remover"
        cancelText="Manter"
      />

      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Card de Status da Loja */}
        {businessHours && (
          <div className="mb-6 md:mb-8 rounded-2xl p-4 md:p-5 shadow-lg border-2 transition-all bg-gradient-to-r from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-[#1e3a5f]/30">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {/* Indicador de status */}
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1e3a5f]/20">
                  <div className={`w-3 h-3 rounded-full ${
                    storeStatus.isOpen
                      ? storeStatus.closingSoon
                        ? 'bg-[#1e3a5f]/60'
                        : 'bg-[#1e3a5f]'
                      : 'bg-[#1e3a5f]/30'
                  }`}></div>
                  {storeStatus.isOpen && !storeStatus.closingSoon && (
                    <div className="absolute inset-0 rounded-full bg-[#1e3a5f] animate-ping opacity-30"></div>
                  )}
                  {storeStatus.closingSoon && (
                    <div className="absolute inset-0 rounded-full bg-[#1e3a5f]/60 animate-pulse opacity-30"></div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg text-[#1e3a5f]">
                    {storeStatus.isOpen 
                      ? storeStatus.closingSoon 
                        ? 'Fechando em Breve' 
                        : 'Loja Aberta' 
                      : 'Loja Fechada'
                    }
                  </h3>
                  <p className="text-sm text-[#1e3a5f]/70">
                    {storeStatus.message}
                  </p>
                </div>
              </div>

              {/* Horários do dia */}
              {storeStatus.isOpen && storeStatus.closesAt && (
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                  <Icons.Clock className="w-5 h-5 text-[#1e3a5f]/70" />
                  <span className="text-sm font-medium text-[#1e3a5f]/80">
                    Hoje: {storeStatus.opensAt} - {storeStatus.closesAt}
                  </span>
                </div>
              )}
            </div>

            {/* Aviso quando fechado */}
            {!storeStatus.isOpen && (
              <div className="mt-3 pt-3 border-t border-[#1e3a5f]/20 flex items-center gap-2">
                <Icons.AlertCircle className="w-5 h-5 text-[#1e3a5f]/60" />
                <span className="text-sm text-[#1e3a5f]/70">
                  Não é possível fazer pedidos no momento. Volte no horário de funcionamento!
                </span>
              </div>
            )}

            {/* Aviso quando próximo de fechar */}
            {storeStatus.isOpen && storeStatus.closingSoon && (
              <div className="mt-3 pt-3 border-t border-[#1e3a5f]/20 flex items-center gap-2">
                <Icons.AlertCircle className="w-5 h-5 text-[#1e3a5f]/60" />
                <span className="text-sm text-[#1e3a5f]/70">
                  A loja está prestes a fechar. Finalize seu pedido em breve!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Seção de banners com setas de navegação */}
        {banners.length > 0 && (
          <div className="relative w-full max-w-5xl mx-auto h-56 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden mb-10 md:mb-14 shadow-[0_20px_60px_rgba(30,58,95,0.15)] group">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-all duration-1000 ${
                  idx === currentBannerIndex
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                <img
                  src={b.imageUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt={b.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/30 via-[#1e3a5f]/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10">
                  {b.title && (
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                      {b.title}
                    </h2>
                  )}
                  {b.subtitle && (
                    <p className="text-sm md:text-base font-medium text-white/80 max-w-xl">
                      {b.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {banners.length > 1 && (
              <>
                <button
                  onClick={goToPreviousBanner}
                  className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-[#1e3a5f] transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                  aria-label="Banner anterior"
                >
                  <Icons.ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <button
                  onClick={goToNextBanner}
                  className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-[#1e3a5f] transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                  aria-label="Próximo banner"
                >
                  <Icons.ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </>
            )}

            {banners.length > 1 && (
              <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex gap-2 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentBannerIndex
                        ? 'bg-white w-8'
                        : 'bg-white/30 w-1.5 hover:bg-white/50'
                    }`}
                  ></button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navegação por categorias */}
        <nav className="mb-8 md:mb-12">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 md:justify-center">
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 text-sm md:text-base flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20 scale-[1.02]'
                    : 'bg-white text-[#1e3a5f]/60 hover:bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'
                }`}
              >
                {cat.id === 'FEATURED' && (
                  <Icons.Star className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'text-[#1e3a5f]'}`} />
                )}
                {cat.label}
                {cat.id === 'FEATURED' && featuredCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                  }`}>
                    {featuredCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Grid de produtos */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm tracking-wide">Carregando cardápio...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
                  {activeCategory === 'FEATURED' && (
                    <Icons.Star className="w-6 h-6 text-[#1e3a5f]" />
                  )}
                  {categories.find(c => c.id === activeCategory)?.label}
                </h3>
                <p className="text-[#1e3a5f]/40 text-sm mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item disponível' : 'itens disponíveis'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((p) => {
                const quantityInCart = getProductQuantityInCart(p.id);
                const isInCart = quantityInCart > 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleProductClick(p.id)}
                    className="bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#1e3a5f]/8 border border-[#1e3a5f]/5 flex flex-col overflow-hidden transition-all duration-500 group hover:-translate-y-1 relative cursor-pointer"
                  >
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {hasValidPromoPrice(p) && (
                        <div className="bg-[#1e3a5f] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                          Oferta
                        </div>
                      )}
                      {p.isFeatured && activeCategory !== 'FEATURED' && (
                        <div className="bg-[#1e3a5f]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Icons.Star className="w-3 h-3" />
                          Destaque
                        </div>
                      )}
                    </div>

                    {/* Badge de quantidade no carrinho */}
                    {isInCart && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-[#1e3a5f] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                          {quantityInCart}
                        </div>
                      </div>
                    )}

                    <div className="h-44 md:h-52 bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4] relative overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icons.Burger className="w-16 h-16 text-[#1e3a5f]/20 group-hover:scale-125 transition-transform duration-500" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 md:p-6 flex-grow flex flex-col">
                      <h3 className="text-base md:text-lg font-bold text-[#1e3a5f] leading-tight mb-2 line-clamp-2 group-hover:text-[#1e3a5f] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[#1e3a5f]/40 text-xs md:text-sm mb-5 line-clamp-2 leading-relaxed">
                        {p.description || 'Delicioso smash burger artesanal.'}
                      </p>

                      <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                          {hasValidPromoPrice(p) ? (
                            <>
                              <span className="text-[#1e3a5f]/30 line-through text-xs font-medium">
                                R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}
                              </span>
                              <span className="text-2xl font-bold text-[#1e3a5f]">
                                R$ {Number(p.promotionalPrice).toFixed(2).replace('.', ',')}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-[#1e3a5f]">
                              R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>

                        {/* Botão de adicionar ou contador de quantidade */}
                        {!isAdmin && (
                          <>
                            {isInCart ? (
                              // Contador de quantidade
                              <div 
                                className="flex items-center gap-1 bg-[#1e3a5f] rounded-xl overflow-hidden shadow-lg shadow-[#1e3a5f]/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => handleDecrement(e, p)}
                                  disabled={!storeStatus.isOpen}
                                  className={`w-10 h-10 flex items-center justify-center transition-all ${
                                    storeStatus.isOpen
                                      ? 'text-white hover:bg-white/10 active:scale-95'
                                      : 'text-white/30 cursor-not-allowed'
                                  }`}
                                  title="Diminuir quantidade"
                                >
                                  <Icons.Minus className="w-4 h-4" />
                                </button>
                                
                                <span className="w-8 text-center text-white font-bold text-sm">
                                  {quantityInCart}
                                </span>
                                
                                <button
                                  onClick={(e) => handleIncrement(e, p)}
                                  disabled={!storeStatus.isOpen}
                                  className={`w-10 h-10 flex items-center justify-center transition-all ${
                                    storeStatus.isOpen
                                      ? 'text-white hover:bg-white/10 active:scale-95'
                                      : 'text-white/30 cursor-not-allowed'
                                  }`}
                                  title="Aumentar quantidade"
                                >
                                  <Icons.Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              // Botão de adicionar
                              <button
                                onClick={(e) => handleAddToCart(e, p)}
                                disabled={!storeStatus.isOpen}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95 group/btn ${
                                  storeStatus.isOpen
                                    ? 'bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30'
                                    : 'bg-[#1e3a5f]/30 text-white/50 cursor-not-allowed shadow-[#1e3a5f]/10'
                                }`}
                                title={storeStatus.isOpen ? 'Adicionar ao carrinho' : 'Loja fechada'}
                              >
                                <Icons.Plus className={`w-5 h-5 ${storeStatus.isOpen ? 'group-hover/btn:scale-110' : ''} transition-transform`} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#1e3a5f]/5">
                <div className="mb-4 flex justify-center">
                  {activeCategory === 'FEATURED' ? (
                    <Icons.Star className="w-16 h-16 text-[#1e3a5f]/30" />
                  ) : (
                    <Icons.Burger className="w-16 h-16 text-[#1e3a5f]/20" />
                  )}
                </div>
                <p className="text-[#1e3a5f]/40 font-medium">
                  {activeCategory === 'FEATURED'
                    ? 'Nenhum produto em destaque no momento'
                    : 'Nenhum item disponível nesta categoria'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Botão flutuante do carrinho (desktop) */}
      {!isAdmin && cartItemsCount > 0 && (
        <div className="hidden md:block fixed bottom-8 right-8 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-[#1e3a5f]/30 flex items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <div className="relative">
              <Icons.Cart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-[#1e3a5f] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Ver carrinho</p>
              <p className="font-bold text-lg">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</p>
            </div>
            <Icons.ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Barra de navegação inferior (mobile)*/}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          {isAdmin ? (
            <>
              <NavButton
                onClick={() => navigate('/promotions')}
                icon={<Icons.Tag className="w-6 h-6" />}
                label="Ofertas"
              />
              <NavButton
                onClick={() => navigate('/admin')}
                icon={<Icons.Settings className="w-6 h-6" />}
                label="Painel"
              />
              <NavButton
                onClick={() => navigate('/admin/products')}
                icon={<Icons.Box className="w-6 h-6" />}
                label="Produtos"
              />
              <NavButton
                onClick={() => navigate('/profile')}
                icon={<Icons.User className="w-6 h-6" />}
                label="Perfil"
              />
            </>
          ) : (
            <>
              <NavButton
                onClick={() => window.scrollTo(0, 0)}
                icon={<Icons.Home className="w-6 h-6" />}
                label="Início"
                active
              />
              <NavButton
                onClick={() => navigate('/promotions')}
                icon={<Icons.Tag className="w-6 h-6" />}
                label="Ofertas"
              />
              <NavButton
                onClick={() => navigate('/profile')}
                icon={<Icons.User className="w-6 h-6" />}
                label="Perfil"
              />

              {cartItemsCount > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex flex-col items-center gap-1 p-2"
                >
                  <div className="relative bg-[#1e3a5f] p-3 rounded-2xl shadow-lg shadow-[#1e3a5f]/30">
                    <Icons.Cart className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 bg-white text-[#1e3a5f] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  </div>
                </button>
              )}

              {activeTrackingOrders.length > 0 && (
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="relative flex flex-col items-center gap-1 p-2"
                >
                  <div className="relative">
                    <Icons.Clock className="w-6 h-6 text-[#1e3a5f]/40" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#1e3a5f] rounded-full animate-pulse"></span>
                  </div>
                  <span className="text-[9px] font-semibold text-[#1e3a5f]/40 uppercase tracking-wider">Pedido</span>
                </button>
              )}
            </>
          )}
        </div>
      </footer>

      {/* Sidebar do carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-[#faf8f5] h-full flex flex-col shadow-2xl animate-slide-left">
            <div className="bg-[#1e3a5f] p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Icons.Cart className="w-6 h-6 text-white" />
                  Seu Pedido
                </h2>
                <p className="text-white/50 text-sm mt-1">{cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'}</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="relative z-10 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso de loja fechada no carrinho */}
            {!storeStatus.isOpen && cart.length > 0 && (
              <div className="bg-[#1e3a5f]/90 p-4 flex items-center gap-3">
                <Icons.Clock className="w-5 h-5 text-white/70 flex-shrink-0" />
                <p className="text-sm text-white/80">
                  A loja está fechada. Você não poderá finalizar o pedido agora.
                </p>
              </div>
            )}

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center mb-4">
                    <Icons.Cart className="w-10 h-10 text-[#1e3a5f]/20" />
                  </div>
                  <p className="text-[#1e3a5f]/40 font-medium">Seu carrinho está vazio</p>
                  <p className="text-[#1e3a5f]/30 text-sm mt-1">Adicione itens do cardápio</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.id}-${item.observation || ''}`}
                    className="bg-white p-4 rounded-2xl border border-[#1e3a5f]/5 flex items-center gap-4 group hover:shadow-lg hover:shadow-[#1e3a5f]/5 transition-all"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4] rounded-xl overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icons.Burger className="w-8 h-8 text-[#1e3a5f]/20" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-[#1e3a5f] truncate">{item.name}</h4>
                      <p className="text-[#1e3a5f] font-bold mt-1">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Contador no carrinho sidebar */}
                      <div className="flex items-center gap-1 bg-[#faf8f5] rounded-lg border border-[#1e3a5f]/10">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              setRemoveModal({
                                isOpen: true,
                                product: item
                              });
                            } else {
                              updateQuantity(item.id, item.quantity - 1, item.observation || '');
                            }
                          }}
                          disabled={!storeStatus.isOpen}
                          className="w-8 h-8 flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-l-lg transition-all disabled:opacity-30"
                        >
                          <Icons.Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-[#1e3a5f] font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.observation || '')}
                          disabled={!storeStatus.isOpen}
                          className="w-8 h-8 flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-r-lg transition-all disabled:opacity-30"
                        >
                          <Icons.Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => setRemoveModal({ isOpen: true, product: item })}
                        className="text-[#1e3a5f]/40 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-[#1e3a5f]/5 shadow-[0_-10px_40px_rgba(30,58,95,0.05)]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1e3a5f]/50">Subtotal</span>
                    <span className="text-[#1e3a5f] font-medium">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1e3a5f]/50">Taxa de entrega</span>
                    <span className="text-[#1e3a5f] font-medium">Grátis</span>
                  </div>
                  <div className="h-px bg-[#1e3a5f]/10"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a5f]/70 font-medium">Total</span>
                    <span className="text-2xl font-bold text-[#1e3a5f]">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !storeStatus.isOpen}
                  className={`w-full font-semibold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-3 group ${
                    storeStatus.isOpen
                      ? 'bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-[#1e3a5f]/20 hover:shadow-xl'
                      : 'bg-[#1e3a5f]/30 text-white/50 cursor-not-allowed shadow-[#1e3a5f]/10'
                  } disabled:opacity-70`}
                >
                  {checkoutLoading ? (
                    <>
                      <Icons.Spinner className="w-5 h-5" />
                      <span>Processando...</span>
                    </>
                  ) : !storeStatus.isOpen ? (
                    <>
                      <Icons.Clock className="w-5 h-5" />
                      <span>Loja Fechada</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar Pedido</span>
                      <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

const NavButton = ({ onClick, icon, label, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${
      active ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
    }`}
  >
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);
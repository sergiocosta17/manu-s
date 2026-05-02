import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// ÍCONES SVG
const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Burger: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 10H2c0-2.76 4.48-5 10-5s10 2.24 10 5zM2 12h20v2c0 1.1-.9 2-2 2h-.67c.44-.58.67-1.27.67-2 0-1.65-1.35-3-3-3s-3 1.35-3 3c0 .73.23 1.42.67 2h-5.34c.44-.58.67-1.27.67-2 0-1.65-1.35-3-3-3s-3 1.35-3 3c0 .73.23 1.42.67 2H4c-1.1 0-2-.9-2-2v-2zm0 6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2H2z"/>
    </svg>
  ),
  Fire: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.277 1.09-4.34 2.75-5.65.276-.218.675-.078.753.26.107.462.243.893.405 1.29.081.199.021.424-.14.564-.47.406-.768.998-.768 1.536 0 1.105.895 2 2 2s2-.895 2-2c0-.014 0-.027-.001-.041.008-.576.073-1.141.205-1.688.084-.347.466-.489.756-.278C15.91 13.827 17 15.89 17 18c0 3.866-3.134 7-7 7zm0-14c-.552 0-1-.448-1-1V4c0-.552.448-1 1-1s1 .448 1 1v4c0 .552-.448 1-1 1z"/>
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ShoppingBag: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Alert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const GET_PRODUCT = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      promotionalPrice
      imageUrl
      category
      addonGroups {
        id
        name
        description
        selectionType
        minSelection
        maxSelection
        isRequired
        addons {
          id
          name
          price
          isAvailable
        }
      }
    }
  }
`;

const GET_STORE_SETTINGS = `
  query GetStoreSettings {
    storeSettings {
      id
      businessHours
    }
  }
`;

const categoryLabels = {
  BURGER: 'Burger',
  CHICKEN: 'Frango',
  COMBO: 'Combo',
  SIDE: 'Acompanhamento',
  DRINK: 'Bebida',
  DESSERT: 'Sobremesa',
};

const DAY_MAP = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const DAY_LABELS_PT = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [observations, setObservations] = useState('');
  
  // Estado para opcionais selecionados
  const [selectedAddons, setSelectedAddons] = useState({});
  const [addonValidationErrors, setAddonValidationErrors] = useState({});
  
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [storeHoursMessage, setStoreHoursMessage] = useState('');
  const [todayHours, setTodayHours] = useState(null);
  const [isClosingSoon, setIsClosingSoon] = useState(false);
  
  const isAddingRef = useRef(false);
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  // Calcular quantidade total deste produto no carrinho (todos os itens com mesmo id)
  const getTotalQuantityInCart = () => {
    if (!product) return 0;
    return cart
      .filter(item => item.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const totalInCart = getTotalQuantityInCart();

  const checkStoreOpen = (businessHours) => {
    if (!businessHours) {
      return { isOpen: true, message: '', todayHours: null, closingSoon: false };
    }

    try {
      const hours = typeof businessHours === 'string' ? JSON.parse(businessHours) : businessHours;
      const now = new Date();
      const currentDay = DAY_MAP[now.getDay()];
      const todayConfig = hours[currentDay];

      if (!todayConfig || !todayConfig.isOpen) {
        const nextOpenDay = findNextOpenDay(hours, now.getDay());
        return {
          isOpen: false,
          message: nextOpenDay 
            ? `Abrimos ${nextOpenDay.label} às ${nextOpenDay.openTime}`
            : 'Loja fechada',
          todayHours: null,
          closingSoon: false
        };
      }

      const [openHour, openMinute] = todayConfig.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = todayConfig.closeTime.split(':').map(Number);
      
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const openMinutes = openHour * 60 + openMinute;
      const closeMinutes = closeHour * 60 + closeMinute;

      const isWithinHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

      if (!isWithinHours) {
        if (currentMinutes < openMinutes) {
          return {
            isOpen: false,
            message: `Abrimos hoje às ${todayConfig.openTime}`,
            todayHours: todayConfig,
            closingSoon: false
          };
        } else {
          const nextOpenDay = findNextOpenDay(hours, now.getDay());
          return {
            isOpen: false,
            message: nextOpenDay 
              ? `Abrimos ${nextOpenDay.label} às ${nextOpenDay.openTime}`
              : 'Loja fechada',
            todayHours: todayConfig,
            closingSoon: false
          };
        }
      }

      const minutesUntilClose = closeMinutes - currentMinutes;
      const closingSoon = minutesUntilClose <= 30;
      let closingMessage = '';
      
      if (closingSoon) {
        closingMessage = `Fechamos em ${minutesUntilClose} min`;
      }

      return {
        isOpen: true,
        message: closingMessage,
        todayHours: todayConfig,
        closingSoon
      };

    } catch (e) {
      console.error('Erro ao parsear horários:', e);
      return { isOpen: true, message: '', todayHours: null, closingSoon: false };
    }
  };

  const findNextOpenDay = (hours, currentDayIndex) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextIndex];
      const config = hours[nextDay];
      
      if (config && config.isOpen) {
        return {
          day: nextDay,
          label: i === 1 ? 'amanhã' : DAY_LABELS_PT[nextDay],
          openTime: config.openTime
        };
      }
    }
    
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token') || '';
        
        const [productRes, settingsRes] = await Promise.all([
          fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: GET_PRODUCT,
              variables: { id },
            }),
          }),
          fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: GET_STORE_SETTINGS,
            }),
          })
        ]);

        const [productResult, settingsResult] = await Promise.all([
          productRes.json(),
          settingsRes.json()
        ]);

        if (productResult.errors) {
          throw new Error(productResult.errors[0].message);
        }

        if (!productResult.data?.product) {
          throw new Error('Produto não encontrado');
        }

        setProduct(productResult.data.product);
        
        // Inicializar seleções de opcionais
        const initialSelections = {};
        productResult.data.product.addonGroups?.forEach(group => {
          initialSelections[group.id] = [];
        });
        setSelectedAddons(initialSelections);

        if (settingsResult.data?.storeSettings?.businessHours) {
          const storeStatus = checkStoreOpen(settingsResult.data.storeSettings.businessHours);
          setIsStoreOpen(storeStatus.isOpen);
          setStoreHoursMessage(storeStatus.message);
          setTodayHours(storeStatus.todayHours);
          setIsClosingSoon(storeStatus.closingSoon);
        }

      } catch (err) {
        setError(err.message || 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (!todayHours) return;

    const interval = setInterval(() => {
      const storeStatus = checkStoreOpen(JSON.stringify({ [DAY_MAP[new Date().getDay()]]: todayHours }));
      setIsStoreOpen(storeStatus.isOpen);
      setStoreHoursMessage(storeStatus.message);
      setIsClosingSoon(storeStatus.closingSoon);
    }, 60000);

    return () => clearInterval(interval);
  }, [todayHours]);

  // ============================================
  // FUNÇÕES PARA GERENCIAR OPCIONAIS
  // ============================================

  const handleAddonSelect = (groupId, addon, group) => {
    setSelectedAddons(prev => {
      const currentSelections = prev[groupId] || [];
      
      if (group.selectionType === 'SINGLE') {
        // Se já está selecionado, desseleciona (se não for obrigatório ou min > 0)
        if (currentSelections.some(a => a.id === addon.id)) {
          if (group.isRequired || group.minSelection > 0) {
            return prev; // Não pode desselecionar
          }
          return { ...prev, [groupId]: [] };
        }
        // Seleciona o novo
        return { ...prev, [groupId]: [addon] };
      } else {
        // Múltipla seleção
        const isSelected = currentSelections.some(a => a.id === addon.id);
        
        if (isSelected) {
          // Remove
          return { 
            ...prev, 
            [groupId]: currentSelections.filter(a => a.id !== addon.id) 
          };
        } else {
          // Adiciona (verificando máximo)
          if (currentSelections.length >= group.maxSelection) {
            return prev; // Atingiu o máximo
          }
          return { 
            ...prev, 
            [groupId]: [...currentSelections, addon] 
          };
        }
      }
    });
    
    // Limpar erro de validação ao selecionar
    setAddonValidationErrors(prev => ({ ...prev, [groupId]: null }));
  };

  const isAddonSelected = (groupId, addonId) => {
    return (selectedAddons[groupId] || []).some(a => a.id === addonId);
  };

  const getGroupSelectionCount = (groupId) => {
    return (selectedAddons[groupId] || []).length;
  };

  const calculateAddonsTotal = () => {
    let total = 0;
    Object.values(selectedAddons).forEach(addons => {
      addons.forEach(addon => {
        total += Number(addon.price) || 0;
      });
    });
    return total;
  };

  const validateAddons = () => {
    const errors = {};
    let isValid = true;

    product?.addonGroups?.forEach(group => {
      const selectionCount = getGroupSelectionCount(group.id);
      
      if (group.isRequired && selectionCount === 0) {
        errors[group.id] = `Selecione pelo menos ${group.minSelection || 1} opção`;
        isValid = false;
      } else if (selectionCount < group.minSelection) {
        errors[group.id] = `Selecione pelo menos ${group.minSelection} ${group.minSelection === 1 ? 'opção' : 'opções'}`;
        isValid = false;
      }
    });

    setAddonValidationErrors(errors);
    return isValid;
  };

  const getSelectedAddonsForCart = () => {
    const result = [];
    Object.entries(selectedAddons).forEach(([groupId, addons]) => {
      addons.forEach(addon => {
        result.push({
          addonId: addon.id,
          name: addon.name,
          price: Number(addon.price) || 0,
          quantity: 1
        });
      });
    });
    return result;
  };

  const resetSelections = () => {
    // Resetar quantidade
    setQuantity(1);
    // Resetar observações
    setObservations('');
    // Resetar opcionais
    const initialSelections = {};
    product?.addonGroups?.forEach(group => {
      initialSelections[group.id] = [];
    });
    setSelectedAddons(initialSelections);
    // Limpar erros
    setAddonValidationErrors({});
  };

  const hasValidPromoPrice = (p) => {
    if (!p || p.promotionalPrice === null || p.promotionalPrice === undefined) return false;
    const promo = Number(p.promotionalPrice);
    return !isNaN(promo) && promo > 0;
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    return hasValidPromoPrice(product) 
      ? Number(product.promotionalPrice) 
      : Number(product.price);
  };

  const getTotal = () => {
    const basePrice = getCurrentPrice();
    const addonsTotal = calculateAddonsTotal();
    return (basePrice + addonsTotal) * quantity;
  };

  const getDiscountPercent = () => {
    if (!hasValidPromoPrice(product)) return 0;
    const original = Number(product.price);
    const promo = Number(product.promotionalPrice);
    return Math.round(((original - promo) / original) * 100);
  };

  const handleAddToCart = () => {
    if (!product || isAddingRef.current || addedToCart) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!isStoreOpen) {
      return;
    }

    // Validar opcionais
    if (!validateAddons()) {
      return;
    }
    
    isAddingRef.current = true;
    
    const selectedAddonsList = getSelectedAddonsForCart();
    const addonsTotal = calculateAddonsTotal();
    
    // Adicionar ao carrinho com opcionais
    addToCart(product, quantity, observations, selectedAddonsList, addonsTotal);
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
      isAddingRef.current = false;
      // Resetar seleções após adicionar ao carrinho
      resetSelections();
    }, 2000);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 999));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-[#faf8f5]/85"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-[#1e3a5f]/40 font-medium">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-[#faf8f5]/85"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Produto não encontrado</h2>
          <p className="text-[#1e3a5f]/50 mb-6">{error || 'O produto que você procura não existe.'}</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#162d4a] transition-all shadow-lg"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  const showPromoPrice = hasValidPromoPrice(product);
  const displayPrice = Number(product.price || 0).toFixed(2).replace('.', ',');
  const displayPromoPrice = showPromoPrice 
    ? Number(product.promotionalPrice).toFixed(2).replace('.', ',') 
    : null;
  const savings = showPromoPrice 
    ? (Number(product.price) - Number(product.promotionalPrice)).toFixed(2).replace('.', ',')
    : null;
  const addonsTotal = calculateAddonsTotal();
  const hasAddons = product.addonGroups && product.addonGroups.length > 0;

  return (
    <div 
      className="min-h-screen pb-24 md:pb-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0 bg-[#faf8f5]/85 pointer-events-none z-0"></div>

      <div className="h-20"></div>

      {!isStoreOpen && (
        <div className="relative z-20 max-w-5xl mx-auto px-4 pt-4 pb-2">
          <div className="bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <Icons.Clock className="w-5 h-5 text-[#1e3a5f]/60 flex-shrink-0" />
            <p className="text-sm text-[#1e3a5f]">
              <span className="font-semibold">Fechado</span>
              {storeHoursMessage && <span className="text-[#1e3a5f]/70"> · {storeHoursMessage}</span>}
            </p>
          </div>
        </div>
      )}

      {isStoreOpen && isClosingSoon && (
        <div className="relative z-20 max-w-5xl mx-auto px-4 pt-4 pb-2">
          <div className="bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <Icons.Clock className="w-5 h-5 text-[#1e3a5f]/60" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#1e3a5f] rounded-full animate-pulse"></span>
            </div>
            <p className="text-sm text-[#1e3a5f]">
              <span className="font-semibold">{storeHoursMessage}</span>
              <span className="text-[#1e3a5f]/70"> · Finalize seu pedido</span>
            </p>
          </div>
        </div>
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex w-12 h-12 bg-white rounded-xl items-center justify-center shadow-md hover:shadow-lg transition-all border border-[#1e3a5f]/10 flex-shrink-0 self-start"
            >
              <Icons.ArrowLeft className="w-5 h-5 text-[#1e3a5f]" />
            </button>

            <div className="flex-grow">
              <button
                onClick={() => navigate(-1)}
                className="md:hidden w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all border border-[#1e3a5f]/10 mb-4"
              >
                <Icons.ArrowLeft className="w-5 h-5 text-[#1e3a5f]" />
              </button>

              <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-[#1e3a5f]/5 relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4]">
                    <Icons.Burger className="w-24 h-24 text-[#1e3a5f]/20" />
                  </div>
                )}

                {showPromoPrice && (
                  <div className="absolute top-4 left-4 bg-[#1e3a5f] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Icons.Fire className="w-4 h-4" />
                    <span>-{getDiscountPercent()}% OFF</span>
                  </div>
                )}

                {/* Badge mostrando quantidade total no carrinho */}
                {totalInCart > 0 && (
                  <div className="absolute top-4 right-4 bg-[#1e3a5f] text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center">
                    {totalInCart}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {product.category && (
              <span className="inline-block self-start px-3 py-1 bg-white/80 text-[#1e3a5f]/60 text-xs font-medium rounded-full mb-3 backdrop-blur-sm">
                {categoryLabels[product.category] || product.category}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">
              {product.name}
            </h1>

            <p className="text-[#1e3a5f]/60 leading-relaxed mb-6">
              {product.description || 'Delicioso smash burger artesanal, preparado com ingredientes selecionados e muito carinho.'}
            </p>

            <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5 mb-6 shadow-sm">
              <div className="flex items-end gap-3">
                {showPromoPrice ? (
                  <>
                    <span className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">
                      R$ {displayPromoPrice}
                    </span>
                    <span className="text-lg text-[#1e3a5f]/30 line-through mb-1">
                      R$ {displayPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">
                    R$ {displayPrice}
                  </span>
                )}
              </div>
              {showPromoPrice && savings && (
                <p className="text-[#1e3a5f]/70 text-sm font-medium mt-1">
                  Você economiza R$ {savings}
                </p>
              )}
            </div>

            {/* Indicador de itens no carrinho */}
            {totalInCart > 0 && (
              <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.ShoppingBag className="w-5 h-5 text-[#1e3a5f]/60" />
                  <span className="text-sm text-[#1e3a5f]">
                    <span className="font-semibold">{totalInCart}</span> {totalInCart === 1 ? 'unidade' : 'unidades'} no carrinho
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="text-sm font-medium text-[#1e3a5f] hover:underline"
                >
                  Ver carrinho
                </button>
              </div>
            )}

            {/* ============================================ */}
            {/* SEÇÃO DE OPCIONAIS */}
            {/* ============================================ */}
            {!isAdmin && hasAddons && (
              <div className={`space-y-4 mb-6 ${!isStoreOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                {product.addonGroups.map((group) => {
                  const selectionCount = getGroupSelectionCount(group.id);
                  const hasError = addonValidationErrors[group.id];
                  const availableAddons = group.addons.filter(a => a.isAvailable !== false);
                  
                  if (availableAddons.length === 0) return null;

                  return (
                    <div 
                      key={group.id} 
                      className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                        hasError 
                          ? 'border-red-300 bg-red-50/30' 
                          : 'border-[#1e3a5f]/5'
                      }`}
                    >
                      {/* Header do grupo */}
                      <div className="p-4 border-b border-[#1e3a5f]/5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[#1e3a5f]">{group.name}</h3>
                              {group.isRequired && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e3a5f] text-white">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                            {group.description && (
                              <p className="text-xs text-[#1e3a5f]/50 mt-1">{group.description}</p>
                            )}
                            <p className="text-xs text-[#1e3a5f]/40 mt-1">
                              {group.selectionType === 'SINGLE' 
                                ? 'Escolha 1 opção'
                                : group.minSelection > 0 
                                  ? `Escolha de ${group.minSelection} a ${group.maxSelection} opções`
                                  : `Escolha até ${group.maxSelection} ${group.maxSelection === 1 ? 'opção' : 'opções'}`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              selectionCount > 0 ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/30'
                            }`}>
                              {selectionCount}/{group.selectionType === 'SINGLE' ? 1 : group.maxSelection}
                            </span>
                          </div>
                        </div>
                        {hasError && (
                          <div className="flex items-center gap-2 mt-2 text-red-500">
                            <Icons.Alert className="w-4 h-4" />
                            <span className="text-xs font-medium">{hasError}</span>
                          </div>
                        )}
                      </div>

                      {/* Lista de opcionais */}
                      <div className="divide-y divide-[#1e3a5f]/5">
                        {availableAddons.map((addon) => {
                          const isSelected = isAddonSelected(group.id, addon.id);
                          const isDisabled = !isSelected && 
                            group.selectionType === 'MULTIPLE' && 
                            selectionCount >= group.maxSelection;

                          return (
                            <button
                              key={addon.id}
                              type="button"
                              onClick={() => handleAddonSelect(group.id, addon, group)}
                              disabled={isDisabled}
                              className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                                isSelected 
                                  ? 'bg-[#1e3a5f]/5' 
                                  : isDisabled 
                                    ? 'opacity-40 cursor-not-allowed' 
                                    : 'hover:bg-[#faf8f5]'
                              }`}
                            >
                              {/* Ícone de seleção */}
                              <div className={`flex-shrink-0 w-6 h-6 rounded-${group.selectionType === 'SINGLE' ? 'full' : 'lg'} border-2 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-[#1e3a5f] border-[#1e3a5f]' 
                                  : 'border-[#1e3a5f]/20'
                              }`}>
                                {isSelected && (
                                  <Icons.Check className="w-4 h-4 text-white" />
                                )}
                              </div>

                              {/* Nome do opcional */}
                              <span className={`flex-grow font-medium ${
                                isSelected ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/70'
                              }`}>
                                {addon.name}
                              </span>

                              {/* Preço */}
                              {addon.price > 0 && (
                                <span className={`font-semibold ${
                                  isSelected ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/50'
                                }`}>
                                  + R$ {Number(addon.price).toFixed(2).replace('.', ',')}
                                </span>
                              )}
                              {addon.price === 0 && (
                                <span className="text-xs text-[#1e3a5f]/30 font-medium">
                                  Grátis
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isAdmin && (
              <>
                <div className={`bg-white rounded-2xl p-5 border border-[#1e3a5f]/5 mb-6 shadow-sm ${!isStoreOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                  <p className="text-sm text-[#1e3a5f]/50 mb-3">Quantidade</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1 || !isStoreOpen}
                        className="w-12 h-12 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icons.Minus className="w-5 h-5 text-[#1e3a5f]" />
                      </button>
                      <span className="text-2xl font-bold text-[#1e3a5f] w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= 999 || !isStoreOpen}
                        className="w-12 h-12 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icons.Plus className="w-5 h-5 text-[#1e3a5f]" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#1e3a5f]/40">Total</p>
                      <p className="text-xl font-bold text-[#1e3a5f]">
                        R$ {getTotal().toFixed(2).replace('.', ',')}
                      </p>
                      {addonsTotal > 0 && (
                        <p className="text-xs text-[#1e3a5f]/40">
                          (+ R$ {addonsTotal.toFixed(2).replace('.', ',')} em opcionais)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-2xl p-5 border border-[#1e3a5f]/5 mb-6 shadow-sm ${!isStoreOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                  <p className="text-sm text-[#1e3a5f]/50 mb-3">
                    Observações para o pedido (opcional)
                  </p>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Ex: sem cebola, molho separado..."
                    maxLength={200}
                    disabled={!isStoreOpen}
                    className="w-full h-24 resize-none rounded-xl border border-[#1e3a5f]/10 p-3 text-sm outline-none focus:border-[#1e3a5f] bg-[#faf8f5] disabled:cursor-not-allowed"
                  />
                  <div className="text-right text-xs text-[#1e3a5f]/30 mt-1">
                    {observations.length}/200
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart || !isStoreOpen}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                    !isStoreOpen
                      ? 'bg-[#1e3a5f]/30 text-white/50 cursor-not-allowed'
                      : addedToCart
                        ? 'bg-[#1e3a5f] text-white cursor-not-allowed'
                        : 'bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-lg shadow-[#1e3a5f]/20'
                  }`}
                >
                  {!isStoreOpen ? (
                    <>
                      <Icons.Clock className="w-5 h-5" />
                      <span>Loja Fechada</span>
                    </>
                  ) : addedToCart ? (
                    <>
                      <Icons.Check className="w-5 h-5" />
                      <span>Adicionado ao Carrinho!</span>
                    </>
                  ) : (
                    <>
                      <Icons.Cart className="w-5 h-5" />
                      <span>Adicionar · R$ {getTotal().toFixed(2).replace('.', ',')}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
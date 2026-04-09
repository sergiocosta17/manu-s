import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('BURGER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [acknowledgedDeliveries, setAcknowledgedDeliveries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('acknowledgedOrders')) || []; }
    catch(e) { return []; }
  });

  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';

  const categories = [
    { id: 'BURGER', label: 'Bovinos' },
    { id: 'CHICKEN', label: 'Frango' },
    { id: 'COMBO', label: 'Combos' },
    { id: 'SIDE', label: 'Lanches' },
    { id: 'DRINK', label: 'Bebidas' },
    { id: 'DESSERT', label: 'Doces' }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
          body: JSON.stringify({
            query: `query { 
              products { id name price promotionalPrice description category imageUrl } 
              banners { id title subtitle imageUrl }
            }`
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        
        setProducts(Array.isArray(result.data?.products) ? result.data.products : []);
        setBanners(Array.isArray(result.data?.banners) ? result.data.banners : []);
      } catch (err) {
        setError('Não foi possível sincronizar com o servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
    if (!isAdmin) fetchMyOrders();
  }, [isAdmin]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const fetchMyOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: `query { orders { id status total createdAt items { quantity product { name } } } }` })
      });
      const result = await response.json();
      if (!result.errors) {
        const safeOrders = Array.isArray(result.data?.orders) ? result.data.orders : [];
        setMyOrders(safeOrders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
      }
    } catch (err) {}
  };

  const handleAddToCart = (product) => {
    const effectivePrice = product.promotionalPrice || product.price;
    setCart((prev) => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, price: effectivePrice, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => setCart((prev) => prev.filter(item => item.id !== productId));

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `mutation CreateOrder($input: OrderInput!) { createOrder(input: $input) { id } }`,
          variables: { input: { items: cart.map(i => ({ product: i.id, quantity: i.quantity })), total: cartTotalValue } }
        })
      });
      const res = await response.json();
      if(res.errors) throw new Error(res.errors[0].message);
      
      setCart([]);
      setIsCartOpen(false);
      await fetchMyOrders();
      setIsTrackingOpen(true);
    } catch (err) {
      alert('Erro ao finalizar pedido: ' + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleConfirmDelivery = (orderId) => {
    const updated = [...acknowledgedDeliveries, orderId];
    setAcknowledgedDeliveries(updated);
    localStorage.setItem('acknowledgedOrders', JSON.stringify(updated));
  };

  const activeTrackingOrders = myOrders.filter(o => 
    o.status !== 'CANCELLED' && !(o.status === 'DELIVERED' && acknowledgedDeliveries.includes(o.id))
  );

  const getOrderProgress = (status) => {
    switch(status) {
      case 'PENDING': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(p => p.category === activeCategory);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalValue = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-extrabold text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Smash Burguer</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <>
                <button onClick={() => navigate('/promotions')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Ofertas
                </button>
                <button onClick={() => navigate('/profile')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Meu Perfil
                </button>
                <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Gestão
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/promotions')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Ofertas
                </button>
                <button onClick={() => navigate('/profile')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Meu Perfil
                </button>
                <button onClick={() => { setIsTrackingOpen(true); fetchMyOrders(); }} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2 relative border border-[#EBCB6C]/30 px-4 py-1.5 rounded-full bg-[#EBCB6C]/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Acompanhar
                  {activeTrackingOrders.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-3 h-3 rounded-full animate-ping border border-black"></span>}
                </button>
                <button onClick={() => setIsCartOpen(true)} className="bg-gradient-to-br from-[#C1704D] to-[#A35C3E] hover:from-[#A35C3E] hover:to-[#C1704D] text-white font-black px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(193,112,77,0.3)] flex items-center gap-3 transition-transform active:scale-95 uppercase tracking-wider text-xs ml-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <span>{cartItemsCount} Itens</span>
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {!isAdmin && (
              <>
                {activeTrackingOrders.length > 0 && (
                  <button onClick={() => { setIsTrackingOpen(true); fetchMyOrders(); }} className="relative flex items-center justify-center text-blue-400 bg-blue-400/10 p-2.5 rounded-xl border border-blue-400/20 shadow-sm active:scale-95 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">{activeTrackingOrders.length}</span>
                  </button>
                )}
                <button onClick={() => setIsCartOpen(true)} className="relative flex items-center justify-center text-[#EBCB6C] bg-white/5 p-2.5 rounded-xl border border-white/10 shadow-sm active:scale-95 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {cartItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">{cartItemsCount}</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        
        {banners.length > 0 ? (
           <div className="relative w-full max-w-5xl mx-auto h-64 md:h-80 rounded-[2rem] overflow-hidden mb-10 shadow-[0_15px_40px_rgba(26,26,26,0.2)] bg-black">
             {banners.map((b, idx) => (
                <div key={b.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBannerIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                   <img src={b.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={b.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                   <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10 flex flex-col items-center md:items-start text-center md:text-left">
                     {b.title && <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{b.title}</h2>}
                     {b.subtitle && <p className="text-sm md:text-base font-bold text-[#EBCB6C] max-w-xl drop-shadow-md">{b.subtitle}</p>}
                   </div>
                </div>
             ))}
             {banners.length > 1 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                 {banners.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentBannerIndex(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentBannerIndex ? 'bg-[#EBCB6C] w-8' : 'bg-white/40 w-2.5'}`}></button>
                 ))}
               </div>
             )}
           </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] rounded-[2rem] p-8 md:p-12 text-center shadow-[0_15px_40px_rgba(26,26,26,0.2)] border border-[#EBCB6C]/30 mb-10 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-2xl md:text-4xl font-black text-[#EBCB6C] mb-3 tracking-tight">BEM VINDO À MANU'S</h2>
              <p className="text-sm md:text-base font-bold text-[#FDF9EB] leading-relaxed mb-5 max-w-lg mx-auto opacity-90">No seu primeiro pedido, o frete fica por nossa conta!</p>
            </div>
          </div>
        )}

        <nav className="mb-10 flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 md:justify-center">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex-shrink-0 px-8 py-3.5 rounded-2xl font-extrabold whitespace-nowrap transition-all duration-300 cursor-pointer ${activeCategory === cat.id ? 'bg-gradient-to-br from-[#C1704D] to-[#A35C3E] text-white scale-[1.02] shadow-md' : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'}`}>
              <span className="text-xs uppercase tracking-widest">{cat.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex justify-center items-center py-32 opacity-50">
            <svg className="w-12 h-12 animate-spin text-[#C1704D]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300 relative group">
                {p.promotionalPrice && <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase">Oferta</div>}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center bg-gray-200">🍔</div>}
                </div>
                <div className="p-6 flex-grow flex flex-col bg-white">
                  <h3 className="text-lg font-black text-[#1A1A1A] leading-tight mb-2 line-clamp-2">{p.name}</h3>
                  <p className="text-[#1A1A1A]/50 text-xs font-medium mb-6 line-clamp-2 leading-relaxed">{p.description || 'Sem descrição.'}</p>
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                      {p.promotionalPrice ? (
                        <><span className="text-gray-300 line-through text-[10px] font-bold">R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</span><span className="text-2xl font-black text-red-500">R$ {Number(p.promotionalPrice || 0).toFixed(2).replace('.', ',')}</span></>
                      ) : (
                        <span className="text-2xl font-black text-[#C1704D]">R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</span>
                      )}
                    </div>
                    {!isAdmin && (
                      <button onClick={() => handleAddToCart(p)} className="bg-gray-50 hover:bg-[#C1704D] text-[#C1704D] hover:text-white border border-[#E5DCC3] hover:border-[#C1704D] font-black w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isTrackingOpen && !isAdmin && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex justify-start md:justify-center items-center z-50 p-0 md:p-6">
          <div className="bg-[#FDF9EB] w-full md:w-[500px] h-full md:h-[80vh] md:max-h-[700px] md:rounded-[2.5rem] flex flex-col shadow-2xl animate-fade-in md:overflow-hidden">
            <div className="bg-[#1A1A1A] p-6 md:p-8 flex justify-between items-center relative flex-shrink-0">
              <h2 className="text-xl font-black text-white tracking-widest relative z-10 flex items-center gap-3"><svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ACOMPANHAR PEDIDO</h2>
              <button onClick={() => setIsTrackingOpen(false)} className="text-white/50 hover:text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center z-10">X</button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-gray-50/50">
              {activeTrackingOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40"><p className="font-black uppercase text-center">Nenhum pedido<br/>em andamento.</p></div>
              ) : (
                <div className="space-y-6">
                  {activeTrackingOrders.map(order => {
                    const step = getOrderProgress(order.status);
                    return (
                      <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white/60 relative overflow-hidden">
                        {step === 4 && <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>}
                        <div className="flex justify-between items-center mb-8">
                          <span className="font-black text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{new Date(Number(order.createdAt)).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="relative flex justify-between items-center mb-8 px-2">
                          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-gray-100 rounded-full z-0"></div>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-blue-500 rounded-full z-0 transition-all duration-1000" style={{ width: `calc(${(step - 1) * 33.33}% - 1rem)` }}></div>
                          {[1, 2, 3, 4].map(s => (
                             <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${step >= s ? 'bg-blue-500 text-white scale-110' : 'bg-gray-50 border-2 border-gray-200 text-gray-300'}`}>
                               {s === 1 && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                               {s === 2 && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path></svg>}
                               {s === 3 && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                               {s === 4 && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
                             </div>
                          ))}
                        </div>
                        <div className="text-center mb-4">
                          <h4 className="font-black text-lg">{step === 1 && 'Pedido Recebido'}{step === 2 && 'Em Produção'}{step === 3 && 'A Caminho!'}{step === 4 && 'Entregue'}</h4>
                          <p className="text-[11px] text-gray-500 font-bold uppercase mt-1.5">{step === 1 && 'Aguardando confirmação'}{step === 2 && 'O chefe está a preparar'}{step === 3 && 'O seu pedido já foi despachado'}{step === 4 && 'Esperamos que tenha gostado!'}</p>
                        </div>
                        {step === 4 && (
                          <div className="mt-8 border-t border-gray-100 pt-6">
                             <button onClick={() => handleConfirmDelivery(order.id)} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4.5 rounded-xl uppercase text-xs">Confirmar Receção</button>
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

      {isCartOpen && !isAdmin && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 flex justify-end z-50 p-0 md:p-6">
          <div className="bg-[#FDF9EB] w-full md:w-[450px] h-full md:rounded-[2rem] flex flex-col shadow-2xl overflow-hidden">
             {/* Conteúdo do Carrinho (Inalterado) */}
             <div className="bg-[#1A1A1A] p-6 flex justify-between items-center"><h2 className="text-2xl font-black text-white">PEDIDO</h2><button onClick={() => setIsCartOpen(false)} className="text-white">X</button></div>
             <div className="flex-grow p-6 overflow-y-auto space-y-4">
               {cart.map(i => (
                 <div key={i.id} className="bg-white p-5 rounded-2xl flex justify-between items-center">
                    <div><h4 className="font-black">{i.name}</h4><p className="text-sm font-black text-[#C1704D]">R$ {(i.price * i.quantity).toFixed(2).replace('.', ',')}</p></div>
                    <div className="flex items-center gap-4"><span className="bg-[#FDF9EB] px-3 py-1.5 rounded-lg font-black text-xs">x{i.quantity}</span><button onClick={() => handleRemoveFromCart(i.id)} className="text-red-400">X</button></div>
                 </div>
               ))}
             </div>
             <div className="p-6 bg-white border-t border-gray-200">
               <div className="flex justify-between items-end mb-6"><span className="font-black text-[10px] uppercase">Total</span><span className="text-3xl font-black">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span></div>
               <button onClick={handleCheckout} disabled={cart.length === 0 || checkoutLoading} className="w-full bg-[#1A1A1A] text-[#EBCB6C] font-black py-5 rounded-2xl uppercase">FINALIZAR COMPRA</button>
             </div>
          </div>
        </div>
      )}

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          {isAdmin ? (
            <>
              <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
              </button>
              <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">PAINEL</span>
              </button>
              <button onClick={() => navigate('/admin/products')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">PRODUTOS</span>
              </button>
              <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">PERFIL</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 relative">
                <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-lg border-4 border-[#1A1A1A] -mt-6"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>
                <span className="text-[9px] font-black tracking-[0.2em] mt-1">LOJA</span>
              </button>
              <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
              </button>
              <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">PERFIL</span>
              </button>
              {activeTrackingOrders.length > 0 && (
                <button onClick={() => setIsTrackingOpen(true)} className="flex flex-col items-center gap-1.5 text-blue-400 p-2 relative">
                  <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="absolute -top-1 right-2 bg-blue-500 w-2 h-2 rounded-full"></span><span className="text-[9px] font-black tracking-[0.2em]">TRACK</span>
                </button>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Promotions() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            query: `query { products { id name price promotionalPrice description category imageUrl } }`
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        
        setProducts(Array.isArray(result.data?.products) ? result.data.products : []);
      } catch (err) {
        setError('Não foi possível carregar as ofertas. ' + err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const effectivePrice = product.promotionalPrice || product.price;
    setCart((prev) => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, price: effectivePrice, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: `mutation CreateOrder($input: OrderInput!) { createOrder(input: $input) { id } }`,
          variables: { input: { items: cart.map(i => ({ product: i.id, quantity: i.quantity })), total: cartTotalValue } }
        })
      });
      const res = await response.json();
      if(res.errors) throw new Error(res.errors[0].message);
      
      setCart([]);
      setIsCartOpen(false);
      navigate('/profile'); 
    } catch (err) {
      alert('Erro ao finalizar pedido: ' + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const promoProducts = products.filter(p => p.promotionalPrice && Number(p.promotionalPrice) > 0);
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalValue = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
        
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-[2rem] p-8 md:p-12 shadow-[0_15px_40px_rgba(239,68,68,0.3)] border border-red-400 mb-10 md:mb-14 max-w-5xl mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-black/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                Tempo Limitado
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">OFERTAS IMPERDÍVEIS 🔥</h2>
              <p className="text-sm md:text-base font-bold text-white/90 leading-relaxed max-w-lg">
                Os melhores preços do cardápio selecionados especialmente para você. Aproveite antes que acabe!
              </p>
            </div>
            <div className="hidden md:flex text-9xl filter drop-shadow-2xl">🍔</div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 opacity-50">
            <svg className="w-12 h-12 animate-spin text-red-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-extrabold tracking-widest text-[#1A1A1A] uppercase text-sm">Buscando Ofertas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-sm mt-10">
             <p className="text-red-600 font-extrabold mb-2 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               Alerta
             </p>
             <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {promoProducts.map((p) => (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-2 border-red-100 flex flex-col overflow-hidden hover:shadow-[0_15px_40px_rgba(239,68,68,0.15)] hover:-translate-y-2 hover:border-red-300 transition-all duration-300 relative group">
                
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.5)] tracking-widest uppercase flex items-center gap-1 animate-pulse">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
                  Oferta
                </div>

                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-40 filter grayscale">🍔</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col bg-white">
                  <h3 className="text-lg font-black text-[#1A1A1A] leading-tight mb-2 line-clamp-2">{p.name}</h3>
                  <p className="text-[#1A1A1A]/50 text-xs font-medium mb-6 line-clamp-2 leading-relaxed">{p.description || 'Sem descrição.'}</p>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[#1A1A1A]/30 line-through text-[10px] font-bold tracking-wider mb-0.5">R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</span>
                      <span className="text-2xl font-black text-red-600 tracking-tight leading-none">
                        <span className="text-sm mr-0.5 opacity-80">R$</span>{Number(p.promotionalPrice || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(p)} 
                      className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-red-600 font-black w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {!loading && promoProducts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm">
                <svg className="w-16 h-16 text-[#1A1A1A] opacity-20 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-[#1A1A1A]/40 font-extrabold text-sm uppercase tracking-[0.2em]">Nenhuma oferta ativa no momento.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-[#FDF9EB] w-full md:w-[450px] h-full flex flex-col shadow-2xl animate-fade-in">
            
            <div className="bg-[#1A1A1A] p-6 md:p-8 flex justify-between items-center border-b border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C1704D] opacity-10 rounded-full blur-3xl"></div>
              <h2 className="text-2xl font-black text-white tracking-tight relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6 text-[#EBCB6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                SEU PEDIDO
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white/50 hover:text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-colors relative z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-4">
              {cart.map(i => (
                <div key={i.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5DCC3]/50 flex justify-between items-center group">
                  <div className="flex-1 pr-4">
                    <h4 className="font-black text-[#1A1A1A] leading-tight mb-1">{i.name}</h4>
                    <p className="text-sm font-black text-[#C1704D]">R$ {(i.price * i.quantity).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-[#FDF9EB] border border-[#E5DCC3] text-[#1A1A1A] px-3 py-1.5 rounded-lg font-black text-xs">x{i.quantity}</span>
                    <button onClick={() => handleRemoveFromCart(i.id)} className="text-red-400 hover:text-red-600 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <p className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">Carrinho Vazio</p>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-white border-t border-[#E5DCC3]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-10">
              <div className="flex justify-between items-end mb-6">
                <span className="font-black text-[#1A1A1A]/50 text-[10px] tracking-widest uppercase mb-1">Total a Pagar</span>
                <span className="text-4xl font-black text-[#1A1A1A] tracking-tight">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>
              </div>
              <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0 || checkoutLoading} 
                className="w-full bg-gradient-to-r from-[#1A1A1A] to-[#333333] hover:from-[#333333] hover:to-[#1A1A1A] text-[#EBCB6C] font-black text-sm tracking-widest uppercase py-5 rounded-2xl cursor-pointer disabled:opacity-50 transition-all shadow-[0_8px_25px_rgba(26,26,26,0.3)] active:scale-95 flex justify-center items-center gap-3"
              >
                {checkoutLoading ? (
                  <>
                     <svg className="w-4 h-4 animate-spin text-[#EBCB6C]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Processando...
                  </>
                ) : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ MOBILE (COM OFERTAS NO MEIO) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
          </button>
          
          <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-red-500 p-2 transition-all relative">
            <div className="bg-gradient-to-tr from-red-600 to-orange-400 text-white p-3 rounded-full shadow-[0_4px_15px_rgba(239,68,68,0.4)] border-4 border-[#1A1A1A] -mt-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] mt-1">OFERTAS</span>
          </button>

          {userRole === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-[9px] font-black tracking-[0.2em]">ADMIN</span>
            </button>
          )}

          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">PERFIL</span>
          </button>
          
        </div>
      </footer>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('BURGER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  const categories = [
    { id: 'BURGER', label: 'BURGERS', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
    { id: 'CHICKEN', label: 'FRANGO', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1046/1046769.png' },
    { id: 'COMBO', label: 'COMBOS', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3480/3480830.png' },
    { id: 'SIDE', label: 'ENTRADAS', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2839/2839213.png' },
    { id: 'DRINK', label: 'BEBIDAS', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2839/2839218.png' },
    { id: 'DESSERT', label: 'DOCES', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2839/2839230.png' }
  ];

  const categoryImages = {
    BURGER: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    CHICKEN: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=300&q=80',
    COMBO: 'https://images.unsplash.com/photo-1594212691516-069eab3ce5eb?auto=format&fit=crop&w=300&q=80',
    SIDE: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=300&q=80',
    DRINK: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80',
    DESSERT: 'https://images.unsplash.com/photo-1551024601-bec66cea7040?auto=format&fit=crop&w=300&q=80'
  };

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
            query: `query { products { id name price description category imageUrl } }`
          })
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        setProducts(result.data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
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
      alert('Pedido realizado com sucesso!');
      setCart([]);
      setIsCartOpen(false);
      navigate('/orders');
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.category === activeCategory);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalValue = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0">
      <header className="sticky top-0 z-40 bg-[#1A1A1A] p-4 shadow-lg border-b-4 border-[#EBCB6C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left grow md:grow-0">
            <h1 className="text-3xl font-extrabold text-[#FDF9EB] tracking-tight leading-none">MANU´S</h1>
            <p className="text-[10px] md:text-xs font-bold text-[#FDF9EB] opacity-60 tracking-widest uppercase">Smash Burguer</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/orders')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">📦 Meus Pedidos</button>
            {userRole === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">⚙️ Painel</button>
            )}
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors">Sair</button>
            <button onClick={() => setIsCartOpen(true)} className="bg-[#C1704D] hover:bg-[#A35C3E] text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-transform active:scale-95">
              <span>🛒</span>
              <span>{cartItemsCount} Itens</span>
              {cartTotalValue > 0 && <span className="border-l border-white/30 pl-2">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>}
            </button>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-[#EBCB6C] text-2xl">
            🛒
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#C1704D] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-[#1A1A1A] rounded-3xl p-6 md:p-10 text-center shadow-xl border-2 border-[#EBCB6C] mb-8 md:mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#EBCB6C] mb-2">FRETE GRÁTIS 🔥</h2>
          <p className="text-base md:text-lg font-bold text-[#FDF9EB] leading-tight mb-3">NO SEU PRIMEIRO PEDIDO GANHE FRETE GRÁTIS</p>
          <div className="inline-block bg-[#C1704D] text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold tracking-wider">
            CUPOM: PRIMEIROPEDIDO
          </div>
        </div>

        <nav className="mb-10 flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide md:justify-center px-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex flex-col md:flex-row items-center gap-2 md:gap-3 p-4 md:px-6 md:py-3 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id 
                ? 'bg-[#1A1A1A] text-white scale-105 shadow-xl border border-[#EBCB6C]' 
                : 'bg-[#E5DCC3] text-[#1A1A1A]/70 hover:bg-[#D4C9AA]'
              }`}
            >
              <img src={cat.iconUrl} alt={cat.label} className="w-10 h-10 md:w-8 md:h-8 object-contain" />
              <span className="text-xs md:text-sm uppercase font-extrabold tracking-wide">{cat.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin text-4xl text-[#C1704D]">🍔</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-[#E5DCC3] flex flex-row overflow-hidden h-32.5 md:h-37.5">
                <div className="w-27.5 md:w-35 shrink-0 bg-gray-100 relative">
                  <img src={p.imageUrl || categoryImages[p.category]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="grow flex flex-col justify-between p-3 md:p-4">
                  <div>
                    <h3 className="text-base md:text-lg font-extrabold text-[#1A1A1A] leading-tight mb-1 line-clamp-1">{p.name}</h3>
                    <p className="text-[#1A1A1A]/60 text-xs md:text-sm leading-snug line-clamp-2 md:line-clamp-3">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="bg-[#C1704D] px-3 py-1 rounded-lg text-sm md:text-base font-extrabold text-white">
                      R$ {p.price.toFixed(2).replace('.', ',')}
                    </span>
                    <button onClick={() => handleAddToCart(p)} className="text-[#C1704D] hover:bg-[#C1704D] hover:text-white border-2 border-[#C1704D] font-extrabold w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] p-2 px-6 border-t-2 border-[#EBCB6C] pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1 text-[#EBCB6C] p-2">
            <span className="text-xl">🍔</span>
            <span className="text-[10px] font-bold tracking-wider">MENU</span>
          </button>
          <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
            <span className="text-xl">📦</span>
            <span className="text-[10px] font-bold tracking-wider">PEDIDOS</span>
          </button>
          {userRole === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
              <span className="text-xl">⚙️</span>
              <span className="text-[10px] font-bold tracking-wider">ADMIN</span>
            </button>
          )}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400/70 hover:text-red-400 p-2">
            <span className="text-xl">🚪</span>
            <span className="text-[10px] font-bold tracking-wider">SAIR</span>
          </button>
        </div>
      </footer>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-[#FDF9EB] w-full md:w-auto md:min-w-100 max-w-md h-full flex flex-col shadow-2xl">
            <div className="bg-[#1A1A1A] p-6 border-b-4 border-[#EBCB6C] flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-white">CARRINHO</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[#EBCB6C] text-3xl font-bold cursor-pointer">&times;</button>
            </div>
            <div className="grow overflow-y-auto p-6 space-y-4">
              {cart.map(i => (
                <div key={i.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E5DCC3] flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <h4 className="font-extrabold text-[#1A1A1A] leading-tight">{i.name}</h4>
                    <p className="text-sm font-bold text-[#C1704D]">R$ {(i.price * i.quantity).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-[#1A1A1A] px-3 py-1 rounded-lg font-bold">x{i.quantity}</span>
                    <button onClick={() => handleRemoveFromCart(i.id)} className="text-red-400 font-bold p-1">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white border-t-2 border-[#E5DCC3]">
              <div className="flex justify-between items-center mb-6">
                <span className="font-extrabold text-[#1A1A1A] text-lg">TOTAL</span>
                <span className="text-3xl font-extrabold text-[#C1704D]">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>
              </div>
              <button onClick={handleCheckout} disabled={cart.length === 0 || checkoutLoading} className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-[#EBCB6C] font-extrabold text-lg py-4 rounded-xl cursor-pointer">
                {checkoutLoading ? 'PROCESSANDO...' : 'FINALIZAR PEDIDO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// Página de ofertas/promoções - exibe produtos com preço promocional
export default function Promotions() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';
  
  const { addToCart } = useCart?.() || {};

  // Lista de categorias com ícones para exibição
  const categories = [
    { value: 'BURGER', label: 'Bovinos', icon: '🍔' },
    { value: 'CHICKEN', label: 'Frango', icon: '🍗' },
    { value: 'COMBO', label: 'Combos', icon: '🎁' },
    { value: 'SIDE', label: 'Lanches', icon: '🌮' },
    { value: 'DRINK', label: 'Bebidas', icon: '🥤' },
    { value: 'DESSERT', label: 'Doces', icon: '🍰' }
  ];

  // Efeito para buscar produtos com preço promocional
  useEffect(() => {
    const fetchPromotions = async () => {
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
        
        // Filtra apenas produtos que possuem preço promocional
        const promoProducts = (result.data?.products || []).filter(p => p.promotionalPrice);
        setProducts(promoProducts);
      } catch (err) {
        console.error('Erro ao carregar ofertas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Calcula o percentual de desconto
  const calculateDiscount = (original, promo) => {
    return Math.round(((original - promo) / original) * 100);
  };

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

      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* cabeçalho destacado com informações de ofertas */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#162d4a] rounded-2xl md:rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a853]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-[#d4a853] to-transparent"></div>
          <div className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-[#d4a853] to-transparent"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#d4a853]/20 text-[#d4a853] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 bg-[#d4a853] rounded-full animate-pulse"></span>
                Promoções Ativas
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Ofertas Especiais
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-md leading-relaxed">
                Aproveite os melhores preços em nossos smash burgers artesanais. Ofertas por tempo limitado!
              </p>
            </div>
            
            {/* Contador de ofertas disponíveis */}
            <div className="flex items-center gap-4">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-5xl md:text-6xl font-bold text-[#d4a853]">{products.length}</p>
                <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Ofertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm">Carregando ofertas...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#1e3a5f]/5">
            <div className="w-20 h-20 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <TagIcon className="w-10 h-10 text-[#1e3a5f]/20" />
            </div>
            <p className="text-[#1e3a5f]/40 font-medium text-lg">Nenhuma oferta disponível</p>
            <p className="text-[#1e3a5f]/30 text-sm mt-2">Volte em breve para conferir novas promoções!</p>
            <button
              onClick={() => navigate('/menu')}
              className="mt-6 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#1e3a5f]/20"
            >
              Ver Cardápio Completo
            </button>
          </div>
        ) : (
          <>
            {/* Cabeçalho da listagem */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1e3a5f]">Produtos em Oferta</h2>
                <p className="text-[#1e3a5f]/40 text-sm mt-1">{products.length} produtos com desconto</p>
              </div>
            </div>

            {/* Grid de produtos em oferta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#1e3a5f]/8 border border-[#1e3a5f]/5 flex flex-col overflow-hidden transition-all duration-500 group hover:-translate-y-1 relative"
                >
                  {/* Badge com percentual de desconto */}
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <span className="text-sm">🔥</span>
                    -{calculateDiscount(p.price, p.promotionalPrice)}%
                  </div>
                  
                  {/* Imagem do produto */}
                  <div className="h-48 md:h-56 bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4] relative overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl opacity-30 group-hover:scale-125 transition-transform duration-500">
                          {categories.find(c => c.value === p.category)?.icon || '🍔'}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Informações do produto */}
                  <div className="p-5 md:p-6 flex-grow flex flex-col">
                    <span className="text-[10px] font-semibold text-[#1e3a5f]/40 uppercase tracking-wider mb-2">
                      {categories.find(c => c.value === p.category)?.label}
                    </span>
                    
                    <h3 className="text-lg font-bold text-[#1e3a5f] leading-tight mb-2 line-clamp-2">
                      {p.name}
                    </h3>
                    
                    <p className="text-[#1e3a5f]/40 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {p.description || 'Delicioso smash burger artesanal.'}
                    </p>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[#1e3a5f]/30 line-through text-sm font-medium">
                          R$ {Number(p.price).toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-2xl font-bold text-red-500">
                          R$ {Number(p.promotionalPrice).toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] font-medium text-green-600 mt-1">
                          Economize R$ {(p.price - p.promotionalPrice).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      
                      {/* Botão adicionar ao carrinho (apenas para clientes) */}
                      {!isAdmin && (
                        <button
                          onClick={() => addToCart?.(p)}
                          className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 active:scale-95 group/btn"
                        >
                          <svg
                            className="w-5 h-5 group-hover/btn:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* botão para ver cardápio completo */}
            <div className="mt-12 bg-white rounded-2xl p-8 border border-[#1e3a5f]/5 text-center">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Quer ver mais opções?</h3>
              <p className="text-[#1e3a5f]/50 text-sm mb-4">Confira nosso cardápio completo com todos os sabores</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-[#faf8f5] hover:bg-[#f0eeeb] border border-[#1e3a5f]/10 text-[#1e3a5f] font-medium px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
              >
                Ver Cardápio
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Barra de navegação inferior (mobile) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Início" />
          <NavBtn onClick={() => {}} icon={<TagIcon />} label="Ofertas" active />
          <NavBtn onClick={() => navigate('/profile')} icon={<UserIcon />} label="Perfil" />
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES

// Botão da barra de navegação mobile
const NavBtn = ({ onClick, icon, label, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${
      active ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
    }`}
  >
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

// ÍCONES SVG

const TagIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
  </svg>
);

const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

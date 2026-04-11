import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';
  const isLoggedIn = !!localStorage.getItem('token');

  const { 
    cartItemsCount = 0, 
    cartTotalValue = 0,
    setIsCartOpen, 
    activeTrackingOrders, 
    setIsTrackingOpen 
  } = useCart?.() || {};

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setIsAdminMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Deseja sair da sua conta?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleAdminNavigate = (path) => {
    navigate(path);
    setIsAdminMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  if (!isLoggedIn) return null;

  const activeOrdersCount = activeTrackingOrders?.length || 0;
  const hasItemsInCart = cartItemsCount > 0;

  // Itens do menu admin
  const adminMenuItems = [
    { path: '/menu', label: 'Cardápio', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/promotions', label: 'Ofertas', icon: <TagIcon className="w-5 h-5" /> },
    { path: '/admin', label: 'Painel', icon: <ChartIcon className="w-5 h-5" /> },
    { path: '/admin/products', label: 'Produtos', icon: <BoxIcon className="w-5 h-5" /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-[#1e3a5f]/5 border-b border-[#1e3a5f]/5' 
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <button 
            onClick={() => navigate('/menu')} 
            className="flex items-center gap-3 group"
          >
            <img 
              src="/logo.png" 
              alt="Manu's Smash Burger" 
              className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center">
              <span className="text-2xl font-black text-[#1e3a5f] italic tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Manu's
              </span>
            </div>
          </button>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink onClick={() => navigate('/menu')} active={isActive('/menu')}>
              <HomeIcon className="w-4 h-4" />
              Cardápio
            </NavLink>
            
            <NavLink onClick={() => navigate('/promotions')} active={isActive('/promotions')}>
              <TagIcon className="w-4 h-4" />
              Ofertas
            </NavLink>

            {isAdmin && (
              <>
                <NavLink onClick={() => navigate('/admin')} active={isActive('/admin')}>
                  <ChartIcon className="w-4 h-4" />
                  Painel
                </NavLink>
                <NavLink onClick={() => navigate('/admin/products')} active={isActive('/admin/products')}>
                  <BoxIcon className="w-4 h-4" />
                  Produtos
                </NavLink>
              </>
            )}
          </nav>

          {/* Ações Desktop */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Meus Pedidos - Cliente */}
            {!isAdmin && (
              <button
                onClick={() => setIsTrackingOpen?.(true)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  activeOrdersCount > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20'
                    : 'bg-[#faf8f5] hover:bg-[#f0eeeb] text-[#1e3a5f] border border-[#1e3a5f]/10'
                }`}
              >
                {activeOrdersCount > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                )}
                <DeliveryIcon className="w-4 h-4" />
                <span>Acompanhar</span>
                {activeOrdersCount > 0 && (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Carrinho - Cliente */}
            {!isAdmin && (
              <button 
                onClick={() => setIsCartOpen?.(true)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  hasItemsInCart
                    ? 'bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-md hover:shadow-lg'
                    : 'bg-[#faf8f5] hover:bg-[#f0eeeb] text-[#1e3a5f] border border-[#1e3a5f]/10'
                }`}
              >
                <CartIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {hasItemsInCart 
                    ? `R$ ${cartTotalValue.toFixed(2).replace('.', ',')}`
                    : 'Carrinho'
                  }
                </span>
                {hasItemsInCart && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#d4a853] text-[#1e3a5f] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Perfil */}
            <button 
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                isActive('/profile')
                  ? 'bg-[#1e3a5f] text-white shadow-md'
                  : 'bg-[#faf8f5] hover:bg-[#f0eeeb] text-[#1e3a5f] border border-[#1e3a5f]/10'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Perfil</span>
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all border border-red-100"
              title="Sair"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Ações Mobile */}
          <div className="flex md:hidden items-center gap-2">
            
            {/* Menu Admin Mobile */}
            {isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className={`p-2.5 rounded-xl transition-all ${
                    isAdminMenuOpen
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-[#faf8f5] text-[#1e3a5f] border border-[#1e3a5f]/10'
                  }`}
                >
                  {isAdminMenuOpen ? (
                    <CloseIcon className="w-5 h-5" />
                  ) : (
                    <MenuHamburgerIcon className="w-5 h-5" />
                  )}
                </button>

                {/* Dropdown Menu Admin */}
                {isAdminMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#1e3a5f]/10 overflow-hidden animate-fade-in z-50">
                    <div className="p-2">
                      {adminMenuItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleAdminNavigate(item.path)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                            isActive(item.path)
                              ? 'bg-[#1e3a5f] text-white'
                              : 'text-[#1e3a5f] hover:bg-[#faf8f5]'
                          }`}
                        >
                          {item.icon}
                          <span className="font-medium text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-[#1e3a5f]/10 mx-2"></div>
                    
                    {/* Perfil e Logout no Menu */}
                    <div className="p-2">
                      <button
                        onClick={() => handleAdminNavigate('/profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                          isActive('/profile')
                            ? 'bg-[#1e3a5f] text-white'
                            : 'text-[#1e3a5f] hover:bg-[#faf8f5]'
                        }`}
                      >
                        <UserIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">Perfil</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-red-500 hover:bg-red-50"
                      >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meus Pedidos - Mobile (só cliente) */}
            {!isAdmin && (
              <button
                onClick={() => setIsTrackingOpen?.(true)}
                className={`relative p-2.5 rounded-xl transition-all ${
                  activeOrdersCount > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-[#faf8f5] text-[#1e3a5f] border border-[#1e3a5f]/10'
                }`}
              >
                <DeliveryIcon className="w-5 h-5" />
                {activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-green-600 text-[9px] font-bold items-center justify-center">
                      {activeOrdersCount}
                    </span>
                  </span>
                )}
              </button>
            )}

            {/* Carrinho Mobile (só cliente) */}
            {!isAdmin && (
              <button 
                onClick={() => setIsCartOpen?.(true)}
                className={`relative p-2.5 rounded-xl transition-all ${
                  hasItemsInCart
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-[#faf8f5] text-[#1e3a5f] border border-[#1e3a5f]/10'
                }`}
              >
                <CartIcon className="w-5 h-5" />
                {hasItemsInCart && (
                  <span className="absolute -top-1 -right-1 bg-[#d4a853] text-[#1e3a5f] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Logout Mobile (só cliente) */}
            {!isAdmin && (
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-all border border-red-100"
                title="Sair"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {isAdminMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setIsAdminMenuOpen(false)}
        />
      )}

      {/* CSS para animação */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}

// ============ COMPONENTES AUXILIARES ============

const NavLink = ({ onClick, active, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
      active
        ? 'bg-[#1e3a5f] text-white shadow-md'
        : 'text-[#1e3a5f]/60 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5'
    }`}
  >
    {children}
  </button>
);

// ============ ÍCONES ============

const HomeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const TagIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
  </svg>
);

const ChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const BoxIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const CartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

const DeliveryIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
  </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);

const MenuHamburgerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

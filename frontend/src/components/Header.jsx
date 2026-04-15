import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import logoManus from '../assets/logo-manus-sem-fundo.png';

// Componente Header principal com navegação responsiva e estados de autenticação
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';
  const isLoggedIn = !!localStorage.getItem('token');

  // Extrai funções e dados do contexto do carrinho
  const { 
    cartItemsCount = 0, 
    cartTotalValue = 0,
    setIsCartOpen, 
    activeTrackingOrders, 
    setIsTrackingOpen 
  } = useCart?.() || {};

  // Estados para feedback visual (toast e confirm modal)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // Função para mostrar toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  // Função para mostrar modal de confirmação
  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  }, []);

  // Função para fechar modal de confirmação
  const closeConfirm = useCallback(() => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  }, []);

  // Efeito para detectar scroll e aplicar estilo de fundo
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha o menu dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fecha o menu dropdown ao navegar para outra rota
  useEffect(() => {
    setIsAdminMenuOpen(false);
  }, [location.pathname]);

  // Realiza logout, limpando o localStorage e redirecionando
  const handleLogout = () => {
    showConfirm(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta?',
      () => {
        localStorage.clear();
        closeConfirm();
        showToast('Você saiu da sua conta', 'info');
        setTimeout(() => navigate('/menu'), 500);
      }
    );
  };

  // Navega para rota administrativa e fecha o menu dropdown
  const handleAdminNavigate = (path) => {
    navigate(path);
    setIsAdminMenuOpen(false);
  };

  // Verifica se a rota atual corresponde ao caminho fornecido
  const isActive = (path) => location.pathname === path;

  const activeOrdersCount = activeTrackingOrders?.length || 0;
  const hasItemsInCart = cartItemsCount > 0;

  // Itens do menu administrativo
  const adminMenuItems = [
    { path: '/menu', label: 'Cardápio', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/promotions', label: 'Ofertas', icon: <TagIcon className="w-5 h-5" /> },
    { path: '/admin', label: 'Painel', icon: <ChartIcon className="w-5 h-5" /> },
    { path: '/admin/products', label: 'Produtos', icon: <BoxIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />

      {/* Confirm Modal */}
      <ConfirmModal 
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/60 backdrop-blur-2xl shadow-xl shadow-black/10 border-b border-white/20' 
            : 'bg-white/40 backdrop-blur-xl border-b border-white/10'
        }`}
        style={{
          WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(16px) saturate(150%)',
          backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(16px) saturate(150%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-24 md:h-28">
            
            {/* Logo */}
            <button 
              onClick={() => navigate('/menu')} 
              className="flex items-center group"
            >
              <img 
                src={logoManus} 
                alt="Manu's Smash Burger" 
                className="h-24 md:h-28 lg:h-36 w-auto transition-all duration-300 group-hover:scale-105 drop-shadow-lg"
              />
            </button>

            {/* Navegação para desktop */}
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

            {/* Ações do usuário (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* USUÁRIO LOGADO */}
              {isLoggedIn ? (
                <>
                  {/* Botão "Acompanhar Pedidos" - apenas cliente */}
                  {!isAdmin && (
                    <button
                      onClick={() => setIsTrackingOpen?.(true)}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm backdrop-blur-md ${
                        activeOrdersCount > 0
                          ? 'bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f] hover:from-white/70 hover:to-white/90 text-white hover:text-[#1e3a5f] shadow-lg shadow-white/50'
                          : 'bg-white/70 hover:bg-white/90 text-[#1e3a5f] border border-white/50 shadow-sm'
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

                  {/* Botão Carrinho - apenas cliente */}
                  {!isAdmin && (
                    <button 
                      onClick={() => setIsCartOpen?.(true)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all backdrop-blur-md ${
                        hasItemsInCart
                          ? 'bg-[#1e3a5f]/90 hover:bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20'
                          : 'bg-white/70 hover:bg-white/90 text-[#1e3a5f] border border-white/50 shadow-sm'
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
                        <span className="absolute -top-1.5 -right-1.5 bg-white text-[#1e3a5f] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                          {cartItemsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Botão Perfil */}
                  <button 
                    onClick={() => navigate('/profile')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all backdrop-blur-md ${
                      isActive('/profile')
                        ? 'bg-[#1e3a5f]/90 text-white shadow-lg shadow-[#1e3a5f]/20'
                        : 'bg-white/70 hover:bg-white/90 text-[#1e3a5f] border border-white/50 shadow-sm'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Perfil</span>
                  </button>

                  {/* Botão Logout */}
                  <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] flex items-center justify-center transition-all border border-[#1e3a5f]/20 backdrop-blur-md"
                    title="Sair"
                  >
                    <LogoutIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                /* USUÁRIO NÃO LOGADO */
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all bg-white/70 hover:bg-white/90 text-[#1e3a5f] border border-white/50 font-medium text-sm backdrop-blur-md shadow-sm"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Entrar</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/login?mode=register')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all bg-[#1e3a5f]/90 hover:bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20 font-medium text-sm backdrop-blur-md"
                  >
                    <span>Criar Conta</span>
                  </button>
                </>
              )}
            </div>

            {/* Ações Mobile (hamburger e botões compactos) */}
            <div className="flex md:hidden items-center gap-2">
              
              {/* USUÁRIO LOGADO - MOBILE*/}
              {isLoggedIn ? (
                <>
                  {/* Menu Admin Mobile (dropdown com ícone de hamburger) */}
                  {isAdmin && (
                    <div className="relative" ref={adminMenuRef}>
                      <button
                        onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                        className={`p-2.5 rounded-xl transition-all backdrop-blur-md ${
                          isAdminMenuOpen
                            ? 'bg-[#1e3a5f]/90 text-white'
                            : 'bg-white/70 text-[#1e3a5f] border border-white/50'
                        }`}
                      >
                        {isAdminMenuOpen ? (
                          <CloseIcon className="w-5 h-5" />
                        ) : (
                          <MenuHamburgerIcon className="w-5 h-5" />
                        )}
                      </button>

                      {/* Dropdown do menu administrativo (mobile) */}
                      {isAdminMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 overflow-hidden animate-fade-in z-50">
                          <div className="p-2">
                            {adminMenuItems.map((item) => (
                              <button
                                key={item.path}
                                onClick={() => handleAdminNavigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                                  isActive(item.path)
                                    ? 'bg-[#1e3a5f]/90 text-white'
                                    : 'text-[#1e3a5f] hover:bg-white/50'
                                }`}
                              >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                              </button>
                            ))}
                          </div>
                          
                          {/* Dividir entre navegação e ações de perfil */}
                          <div className="border-t border-[#1e3a5f]/10 mx-2"></div>
                          
                          {/* Perfil e Logout dentro do dropdown */}
                          <div className="p-2">
                            <button
                              onClick={() => handleAdminNavigate('/profile')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                                isActive('/profile')
                                  ? 'bg-[#1e3a5f]/90 text-white'
                                  : 'text-[#1e3a5f] hover:bg-white/50'
                              }`}
                            >
                              <UserIcon className="w-5 h-5" />
                              <span className="font-medium text-sm">Perfil</span>
                            </button>
                            
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-[#1e3a5f]/60 hover:bg-[#1e3a5f]/5"
                            >
                              <LogoutIcon className="w-5 h-5" />
                              <span className="font-medium text-sm">Sair</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meus Pedidos - Mobile (apenas cliente) */}
                  {!isAdmin && (
                    <button
                      onClick={() => setIsTrackingOpen?.(true)}
                      className={`relative p-2.5 rounded-xl transition-all backdrop-blur-md ${
                        activeOrdersCount > 0
                          ? 'bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f] text-white shadow-lg shadow-white/50'
                          : 'bg-white/70 text-[#1e3a5f] border border-white/50'
                      }`}
                    >
                      <DeliveryIcon className="w-5 h-5" />
                      {activeOrdersCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-[#1e3a5f] text-[9px] font-bold items-center justify-center">
                            {activeOrdersCount}
                          </span>
                        </span>
                      )}
                    </button>
                  )}

                  {/* Carrinho Mobile (apenas cliente) */}
                  {!isAdmin && (
                    <button 
                      onClick={() => setIsCartOpen?.(true)}
                      className={`relative p-2.5 rounded-xl transition-all backdrop-blur-md ${
                        hasItemsInCart
                          ? 'bg-[#1e3a5f]/90 text-white'
                          : 'bg-white/70 text-[#1e3a5f] border border-white/50'
                      }`}
                    >
                      <CartIcon className="w-5 h-5" />
                      {hasItemsInCart && (
                        <span className="absolute -top-1 -right-1 bg-white text-[#1e3a5f] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Logout Mobile (apenas cliente) */}
                  {!isAdmin && (
                    <button 
                      onClick={handleLogout}
                      className="p-2.5 rounded-xl bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition-all border border-[#1e3a5f]/20 backdrop-blur-md"
                      title="Sair"
                    >
                      <LogoutIcon className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                /* USUÁRIO NÃO LOGADO - MOBILE*/
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all bg-white/70 hover:bg-white/90 text-[#1e3a5f] border border-white/50 font-medium text-sm backdrop-blur-md"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Entrar</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/login?mode=register')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all bg-[#1e3a5f]/90 hover:bg-[#1e3a5f] text-white shadow-md font-medium text-sm backdrop-blur-md"
                  >
                    <span>Criar Conta</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {isAdminMenuOpen && (
          <div 
            className="fixed inset-0 z-40 md:hidden bg-black/10 backdrop-blur-sm" 
            onClick={() => setIsAdminMenuOpen(false)}
          />
        )}

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          @keyframes slide-down {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>
      </header>
    </>
  );
}

// COMPONENTES AUXILIARES

// Toast Notification Component
const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const typeStyles = {
    success: 'bg-[#1e3a5f] text-white',
    error: 'bg-[#1e3a5f]/90 text-white border-2 border-white/20',
    info: 'bg-[#1e3a5f]/80 text-white'
  };

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5" />,
    error: <ErrorIcon className="w-5 h-5" />,
    info: <InfoIcon className="w-5 h-5" />
  };

  return (
    <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${typeStyles[toast.type]}`}>
        {icons[toast.type]}
        <span className="font-medium text-sm">{toast.message}</span>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Confirm Modal Component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
            <AlertIcon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1e3a5f]">{title}</h3>
          </div>
        </div>
        <p className="text-[#1e3a5f]/60 text-sm mb-6 pl-16">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-medium text-[#1e3a5f] bg-[#faf8f5] hover:bg-[#f0eeeb] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#1e3a5f] hover:bg-[#162d4a] transition-all shadow-lg shadow-[#1e3a5f]/20"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Link de navegação reutilizável com estilo ativo/inativo
const NavLink = ({ onClick, active, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all backdrop-blur-md ${
      active
        ? 'bg-[#1e3a5f]/90 text-white shadow-lg shadow-[#1e3a5f]/20'
        : 'text-[#1e3a5f]/70 hover:text-[#1e3a5f] hover:bg-white/50'
    }`}
  >
    {children}
  </button>
);

// ÍCONES SVG

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

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const AlertIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
  </svg>
);

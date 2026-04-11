import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const {
    cartItemsCount,
    setIsCartOpen,
    setIsTrackingOpen,
    activeTrackingOrders,
    fetchMyOrders,
  } = useCart();

  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';

  const handleOpenTracking = () => {
    fetchMyOrders();
    setIsTrackingOpen(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/menu" className="flex items-center gap-3 group">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tight">
              MANU'S
            </span>
            <span className="text-[10px] font-bold text-[#C1704D] tracking-[0.3em] -mt-1">
              SMASH BURGUER
            </span>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/promotions"
            className="px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
          >
            Ofertas
          </Link>

          <Link
            to="/profile"
            className="px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
          >
            Meu Perfil
          </Link>

          {isAdmin ? (
            <Link
              to="/admin"
              className="ml-2 flex items-center gap-2 bg-[#C1704D] hover:bg-[#A35C3E] text-white font-black px-6 py-3 rounded-2xl transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              GESTÃO
            </Link>
          ) : (
            <>
              {/* ✅ BOTÃO ACOMPANHAR - SEMPRE VISÍVEL PARA CLIENTE */}
              <button
                onClick={handleOpenTracking}
                className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  ></path>
                </svg>
                Acompanhar
                {activeTrackingOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C1704D] opacity-75"></span>
                    <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-[#C1704D] text-white text-[10px] font-black">
                      {activeTrackingOrders.length}
                    </span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="ml-2 flex items-center gap-2 bg-[#EBCB6C] hover:bg-[#d4b85e] text-[#1A1A1A] font-black px-6 py-3 rounded-2xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                {cartItemsCount} ITENS
              </button>
            </>
          )}
        </nav>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-[#C1704D] hover:bg-[#A35C3E] text-white font-black px-4 py-2.5 rounded-xl transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </Link>
          ) : (
            <>
              {/* ✅ BOTÃO ACOMPANHAR MOBILE */}
              <button
                onClick={handleOpenTracking}
                className="relative flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold p-2.5 rounded-xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  ></path>
                </svg>
                {activeTrackingOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C1704D] opacity-75"></span>
                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-[#C1704D] text-white text-[9px] font-black">
                      {activeTrackingOrders.length}
                    </span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-[#EBCB6C] hover:bg-[#d4b85e] text-[#1A1A1A] font-black px-4 py-2.5 rounded-xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                {cartItemsCount}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

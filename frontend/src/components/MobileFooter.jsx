import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Componente de rodapé fixo para navegação em dispositivos móveis
export default function MobileFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se a rota atual corresponde ao caminho fornecido
  const isActive = (path) => location.pathname === path;

  // Itens do menu de navegação mobile (Início, Ofertas, Perfil)
  const menuItems = [
    {
      path: '/menu',
      label: 'Início',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/promotions',
      label: 'Ofertas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Perfil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <nav className="flex justify-around items-center py-2 px-4 pb-safe">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 min-w-[72px] rounded-xl transition-all ${
              isActive(item.path)
                ? 'text-[#1e3a5f]'
                : 'text-gray-400 active:scale-95'
            }`}
          >
            <div className={`relative transition-transform ${isActive(item.path) ? 'scale-110' : ''}`}>
              {item.icon}
              {isActive(item.path) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#d4a853] rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </footer>
  );
}
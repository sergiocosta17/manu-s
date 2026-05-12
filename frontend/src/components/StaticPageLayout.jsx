import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// Ícone de seta para esquerda
const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Componente de layout principal para páginas estáticas (termos, privacidade, etc.)
export default function StaticPageLayout({ children, title, subtitle, icon: Icon }) {
  const navigate = useNavigate();

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
      {/* Overlay de fundo */}
      <div className="fixed inset-0 bg-[#faf8f5]/90 pointer-events-none z-0"></div>

      {/* Espaço para compensar header fixo */}
      <div className="h-20"></div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Botão voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[#1e3a5f]/60 hover:text-[#1e3a5f] transition-colors group"
        >
          <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all border border-[#1e3a5f]/10">
            <ArrowLeftIcon className="w-5 h-5 text-[#1e3a5f]" />
          </span>
          <span className="font-medium">Voltar</span>
        </button>

        {/* Cabeçalho da página */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-[#1e3a5f]/5 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {Icon && (
              <div className="w-14 h-14 bg-[#1e3a5f]/5 rounded-2xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-[#1e3a5f]" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">{title}</h1>
              {subtitle && <p className="text-[#1e3a5f]/50 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}

// Seção com título opcional e ícone
export function Section({ title, children, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#1e3a5f]/5">
      {title && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="w-10 h-10 bg-[#1e3a5f]/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#1e3a5f]" />
            </div>
          )}
          <h2 className="text-lg md:text-xl font-semibold text-[#1e3a5f]">{title}</h2>
        </div>
      )}
      <div className="text-[#1e3a5f]/70 leading-relaxed space-y-4">{children}</div>
    </div>
  );
}

// Lista de itens com marcador circular
export function List({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="w-2 h-2 bg-[#1e3a5f] rounded-full mt-2 flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Card informativo com ícone, título e descrição
export function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-[#1e3a5f]/5 rounded-xl p-5 border border-[#1e3a5f]/10">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[#1e3a5f] mb-1">{title}</h3>
          <p className="text-[#1e3a5f]/60 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
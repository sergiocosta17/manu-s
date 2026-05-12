import React from 'react';
import StaticPageLayout, { Section, InfoCard } from '../components/StaticPageLayout';

// Ícones usados na página
const Icons = {
  Building: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Heart: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Star: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Sparkles: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Leaf: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

// Dados dos diferenciais (evita repetição no JSX)
const DIFFERENTIALS = [
  {
    number: 1,
    title: 'Ingredientes Selecionados',
    description: 'Trabalhamos com fornecedores locais para garantir a frescura e qualidade de cada ingrediente.'
  },
  {
    number: 2,
    title: 'Técnica Smash Autêntica',
    description: 'Nossa técnica de preparo garante aquela crosta caramelizada perfeita que só o smash burger proporciona.'
  },
  {
    number: 3,
    title: 'Receitas Exclusivas',
    description: 'Molhos artesanais e combinações únicas desenvolvidas especialmente para você.'
  }
];

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="Sobre Nós"
      subtitle="Conheça nossa história e paixão por hambúrgueres"
      icon={Icons.Building}
    >
      {/* Nossa História */}
      <Section title="Nossa História" icon={Icons.Heart}>
        <p>
          Fundada em 2020, a <strong className="text-[#1e3a5f]">Smash Burger</strong> nasceu 
          de uma paixão genuína pela arte de fazer hambúrgueres artesanais. O que começou como 
          um pequeno sonho em uma cozinha caseira, hoje se transformou em uma referência 
          em sabor e qualidade na região.
        </p>
        <p>
          Nossa jornada começou quando decidimos que era hora de compartilhar com o mundo 
          a receita que aperfeiçoamos durante anos. Cada hambúrguer que servimos carrega 
          consigo dedicação, ingredientes selecionados e o compromisso de oferecer uma 
          experiência gastronômica única.
        </p>
      </Section>

      {/* Nossos Valores */}
      <Section title="Nossos Valores" icon={Icons.Star}>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <InfoCard
            icon={Icons.Sparkles}
            title="Qualidade Premium"
            description="Utilizamos apenas ingredientes frescos e de alta qualidade, selecionados diariamente."
          />
          <InfoCard
            icon={Icons.Users}
            title="Atendimento Excepcional"
            description="Cada cliente é especial. Trabalhamos para superar suas expectativas sempre."
          />
          <InfoCard
            icon={Icons.Clock}
            title="Agilidade"
            description="Preparamos seu pedido com rapidez, sem jamais comprometer a qualidade."
          />
          <InfoCard
            icon={Icons.Target}
            title="Compromisso"
            description="Mantemos nosso compromisso com a excelência em cada detalhe."
          />
        </div>
      </Section>

      {/* Nossa Missão */}
      <Section title="Nossa Missão" icon={Icons.Target}>
        <p>
          Proporcionar a melhor experiência em hambúrgueres artesanais, combinando 
          ingredientes de qualidade superior com técnicas tradicionais de preparo, 
          criando momentos memoráveis para nossos clientes e contribuindo para o 
          desenvolvimento da comunidade local.
        </p>
      </Section>

      {/* Por Que Nos Escolher? */}
      <Section title="Por Que Nos Escolher?" icon={Icons.Sparkles}>
        <div className="space-y-4 mt-2">
          {DIFFERENTIALS.map((item) => (
            <div key={item.number} className="flex items-start gap-4 p-4 bg-[#1e3a5f]/5 rounded-xl">
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{item.number}</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1e3a5f]">{item.title}</h4>
                <p className="text-sm text-[#1e3a5f]/60 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </StaticPageLayout>
  );
}
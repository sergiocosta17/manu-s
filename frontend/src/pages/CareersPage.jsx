import React, { useState } from 'react';
import StaticPageLayout, { Section, InfoCard, List } from '../components/StaticPageLayout';

const Icons = {
  Briefcase: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Heart: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Gift: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  Send: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MapPin: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const positions = [
  {
    id: 1,
    title: 'Chapeiro',
    type: 'Tempo Integral',
    location: 'Presencial',
    description: 'Responsável pelo preparo dos hambúrgueres seguindo nossos padrões de qualidade.',
    requirements: [
      'Experiência prévia na função',
      'Disponibilidade de horários',
      'Proatividade e trabalho em equipe',
    ],
  },
  {
    id: 2,
    title: 'Atendente',
    type: 'Tempo Integral / Parcial',
    location: 'Presencial',
    description: 'Atendimento ao cliente, recebimento de pedidos e organização do salão.',
    requirements: [
      'Boa comunicação',
      'Simpatia e cordialidade',
      'Ensino médio completo',
    ],
  },
  {
    id: 3,
    title: 'Auxiliar de Cozinha',
    type: 'Tempo Integral',
    location: 'Presencial',
    description: 'Apoio nas atividades da cozinha, preparo de ingredientes e manutenção da limpeza.',
    requirements: [
      'Vontade de aprender',
      'Organização',
      'Disponibilidade para início imediato',
    ],
  },
];

export default function CareersPage() {
  const [expandedPosition, setExpandedPosition] = useState(null);

  return (
    <StaticPageLayout
      title="Trabalhe Conosco"
      subtitle="Faça parte do nosso time e cresça com a gente"
      icon={Icons.Briefcase}
    >
      {/* Introdução */}
      <Section title="Junte-se à Nossa Equipe" icon={Icons.Users}>
        <p>
          Na <strong className="text-[#1e3a5f]">Smash Burger</strong>, acreditamos que pessoas 
          fazem toda a diferença. Estamos sempre em busca de talentos apaixonados por gastronomia 
          e que compartilhem dos nossos valores de qualidade, respeito e dedicação.
        </p>
        <p>
          Se você é uma pessoa comprometida, que gosta de trabalhar em equipe e quer crescer 
          profissionalmente em um ambiente dinâmico e acolhedor, queremos conhecer você.
        </p>
      </Section>

      {/* Benefícios */}
      <Section title="Nossos Benefícios" icon={Icons.Gift}>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <InfoCard
            icon={Icons.TrendingUp}
            title="Plano de Carreira"
            description="Oportunidades reais de crescimento dentro da empresa."
          />
          <InfoCard
            icon={Icons.Clock}
            title="Horários Flexíveis"
            description="Escalas que se adaptam à sua rotina quando possível."
          />
          <InfoCard
            icon={Icons.Heart}
            title="Ambiente Acolhedor"
            description="Equipe unida e clima organizacional positivo."
          />
          <InfoCard
            icon={Icons.Gift}
            title="Alimentação no Local"
            description="Refeições inclusas durante o expediente de trabalho."
          />
        </div>
      </Section>

      {/* Vagas Disponíveis */}
      <Section title="Vagas Disponíveis" icon={Icons.Briefcase}>
        <div className="space-y-4 mt-4">
          {positions.map((position) => (
            <div 
              key={position.id}
              className="border border-[#1e3a5f]/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedPosition(
                  expandedPosition === position.id ? null : position.id
                )}
                className="w-full p-5 text-left hover:bg-[#1e3a5f]/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1e3a5f] text-lg">{position.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1e3a5f]/60 bg-[#1e3a5f]/5 px-2.5 py-1 rounded-full">
                        <Icons.Clock className="w-3.5 h-3.5" />
                        {position.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1e3a5f]/60 bg-[#1e3a5f]/5 px-2.5 py-1 rounded-full">
                        <Icons.MapPin className="w-3.5 h-3.5" />
                        {position.location}
                      </span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center transition-transform ${expandedPosition === position.id ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {expandedPosition === position.id && (
                <div className="px-5 pb-5 border-t border-[#1e3a5f]/10">
                  <p className="text-[#1e3a5f]/70 mt-4 mb-4">{position.description}</p>
                  <h4 className="font-medium text-[#1e3a5f] mb-2">Requisitos:</h4>
                  <ul className="space-y-2">
                    {position.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#1e3a5f]/60">
                        <Icons.CheckCircle className="w-4 h-4 text-[#1e3a5f]" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Como se Candidatar */}
      <Section title="Como se Candidatar" icon={Icons.Send}>
        <p>
          Interessado em fazer parte do nosso time? Envie seu currículo para o e-mail abaixo 
          com o título da vaga desejada no assunto:
        </p>
        <div className="mt-4 p-5 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#1e3a5f]/50">E-mail para candidaturas</p>
              <a 
                href="mailto:carreiras@smashburger.com.br" 
                className="text-[#1e3a5f] font-semibold hover:underline"
              >
                carreiras@smashburger.com.br
              </a>
            </div>
          </div>
        </div>
        <p className="text-sm text-[#1e3a5f]/50 mt-4">
          Todas as candidaturas são analisadas e entraremos em contato caso seu perfil 
          seja compatível com nossas vagas.
        </p>
      </Section>
    </StaticPageLayout>
  );
}
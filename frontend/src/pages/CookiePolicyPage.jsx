import React from 'react';
import StaticPageLayout, { Section, List } from '../components/StaticPageLayout';

// Ícones utilizados na página
const Icons = {
  Cookie: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-.343-.018-.682-.052-1.016a3.5 3.5 0 01-3.432-3.432A10.019 10.019 0 0012 2z" />
      <circle cx="8" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  ),
  Info: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

// Dados dos tipos de cookie (evita repetição no JSX)
const cookieTypes = [
  {
    name: 'Cookies Essenciais',
    description: 'Necessários para o funcionamento básico do site. Sem eles, funcionalidades como carrinho de compras e login não funcionariam.',
    required: true,
    examples: ['Sessão de usuário', 'Token de autenticação', 'Preferências de carrinho'],
  },
  {
    name: 'Cookies de Desempenho',
    description: 'Coletam informações anônimas sobre como você usa o site, ajudando-nos a melhorar a experiência.',
    required: false,
    examples: ['Google Analytics', 'Tempo de carregamento', 'Páginas mais visitadas'],
  },
  {
    name: 'Cookies de Funcionalidade',
    description: 'Permitem lembrar suas escolhas e preferências para proporcionar uma experiência personalizada.',
    required: false,
    examples: ['Preferências de idioma', 'Região selecionada', 'Layout preferido'],
  },
  {
    name: 'Cookies de Marketing',
    description: 'Utilizados para exibir anúncios relevantes e medir a eficácia de campanhas publicitárias.',
    required: false,
    examples: ['Facebook Pixel', 'Google Ads', 'Remarketing'],
  },
];

// Dados para links de configuração dos navegadores
const browserLinks = [
  { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
  { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/pt-BR/kb/cookies' },
  { name: 'Microsoft Edge', url: 'https://support.microsoft.com/pt-br/microsoft-edge' },
  { name: 'Safari', url: 'https://support.apple.com/pt-br/guide/safari' },
];

export default function CookiePolicyPage() {
  const lastUpdated = '28 de Abril de 2026';

  return (
    <StaticPageLayout
      title="Política de Cookies"
      subtitle="Entenda como utilizamos cookies em nosso site"
      icon={Icons.Cookie}
    >
      {/* Data de atualização */}
      <div className="bg-[#1e3a5f]/5 rounded-xl px-5 py-4 flex items-center gap-3 border border-[#1e3a5f]/10">
        <Icons.Calendar className="w-5 h-5 text-[#1e3a5f]" />
        <span className="text-sm text-[#1e3a5f]">
          <strong>Última atualização:</strong> {lastUpdated}
        </span>
      </div>

      {/* O que são cookies */}
      <Section title="O que são Cookies?" icon={Icons.Info}>
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, 
          tablet ou celular) quando você visita um site. Eles são amplamente utilizados para 
          fazer os sites funcionarem de maneira mais eficiente, bem como fornecer informações 
          aos proprietários do site.
        </p>
        <p>
          Os cookies podem ser "persistentes" (permanecem no dispositivo até expirarem ou 
          serem excluídos) ou "de sessão" (são excluídos quando você fecha o navegador).
        </p>
      </Section>

      {/* Tipos de cookies */}
      <Section title="Tipos de Cookies que Utilizamos" icon={Icons.Layers}>
        <div className="space-y-4 mt-4">
          {cookieTypes.map((cookie, index) => (
            <div key={index} className="border border-[#1e3a5f]/10 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-[#1e3a5f]">{cookie.name}</h4>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  cookie.required 
                    ? 'bg-[#1e3a5f] text-white' 
                    : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  {cookie.required ? 'Obrigatório' : 'Opcional'}
                </span>
              </div>
              <p className="text-[#1e3a5f]/60 text-sm mb-3">{cookie.description}</p>
              <div className="flex flex-wrap gap-2">
                {cookie.examples.map((example, idx) => (
                  <span key={idx} className="text-xs bg-[#1e3a5f]/5 text-[#1e3a5f]/70 px-2.5 py-1 rounded-md">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Por que usamos cookies */}
      <Section title="Por que Usamos Cookies?" icon={Icons.Shield}>
        <p className="mb-4">
          Utilizamos cookies por diversos motivos, incluindo:
        </p>
        <List items={[
          'Manter você conectado enquanto navega pelo site',
          'Lembrar itens adicionados ao seu carrinho',
          'Entender como você usa nosso site para melhorá-lo',
          'Personalizar o conteúdo de acordo com suas preferências',
          'Garantir a segurança de suas transações',
          'Medir a eficácia de nossas campanhas de marketing',
        ]} />
      </Section>

      {/* Como gerenciar cookies */}
      <Section title="Como Gerenciar Cookies" icon={Icons.Settings}>
        <p>
          Você tem controle sobre os cookies armazenados em seu dispositivo. A maioria 
          dos navegadores permite que você:
        </p>
        <List items={[
          'Visualize quais cookies estão armazenados e exclua-os individualmente',
          'Bloqueie cookies de terceiros ou de sites específicos',
          'Bloqueie todos os cookies de serem armazenados',
          'Exclua todos os cookies ao fechar o navegador',
        ]} />
        <p className="mt-4">
          <strong className="text-[#1e3a5f]">Importante:</strong> Bloquear todos os cookies 
          pode afetar a funcionalidade do site, especialmente recursos como login e carrinho 
          de compras.
        </p>

        {/* Configurações por navegador */}
        <div className="mt-6 p-5 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
          <h4 className="font-semibold text-[#1e3a5f] mb-3">Configurações por Navegador</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {browserLinks.map((browser, idx) => (
              <a
                key={idx}
                href={browser.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {browser.name}
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* Cookies de terceiros */}
      <Section title="Cookies de Terceiros" icon={Icons.Layers}>
        <p>
          Alguns cookies são colocados por serviços de terceiros que aparecem em nossas 
          páginas. Não temos controle sobre esses cookies, que são regidos pelas políticas 
          de privacidade dessas empresas:
        </p>
        <List items={[
          'Google Analytics - Análise de tráfego e comportamento',
          'Facebook Pixel - Publicidade e remarketing',
          'Hotjar - Mapas de calor e gravações de sessão',
        ]} />
        <p className="mt-4 text-sm text-[#1e3a5f]/50">
          Recomendamos consultar as políticas de privacidade desses serviços para mais informações.
        </p>
      </Section>

      {/* Alterações */}
      <Section title="Alterações nesta Política" icon={Icons.Info}>
        <p>
          Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças 
          em nossas práticas ou por motivos operacionais, legais ou regulatórios. 
          Recomendamos revisar esta página regularmente para se manter informado.
        </p>
        <p>
          Alterações significativas serão comunicadas através de um aviso em destaque 
          em nosso site ou por e-mail, quando aplicável.
        </p>
      </Section>
    </StaticPageLayout>
  );
}
import React from 'react';
import StaticPageLayout, { Section, List } from '../components/StaticPageLayout';

const Icons = {
  Document: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ShoppingBag: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  CreditCard: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Scale: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Globe: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
};

export default function TermsOfUsePage() {
  const lastUpdated = '28 de Abril de 2026';

  return (
    <StaticPageLayout
      title="Termos de Uso"
      subtitle="Condições para utilização dos nossos serviços"
      icon={Icons.Document}
    >
      {/* Data de atualização */}
      <div className="bg-[#1e3a5f]/5 rounded-xl px-5 py-4 flex items-center gap-3 border border-[#1e3a5f]/10">
        <Icons.Calendar className="w-5 h-5 text-[#1e3a5f]" />
        <span className="text-sm text-[#1e3a5f]">
          <strong>Última atualização:</strong> {lastUpdated}
        </span>
      </div>

      {/* Aceitação dos termos */}
      <Section title="Aceitação dos Termos" icon={Icons.CheckCircle}>
        <p>
          Ao acessar e utilizar o site e serviços da <strong className="text-[#1e3a5f]">Smash Burger</strong>, 
          você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso. 
          Se você não concordar com qualquer disposição, solicitamos que não utilize nossos serviços.
        </p>
        <p>
          Estes termos constituem um acordo legal entre você ("Usuário") e a Smash Burger ("Empresa", 
          "nós" ou "nosso"), regulando o uso de nossa plataforma de pedidos online.
        </p>
      </Section>

      {/* Nossos serviços */}
      <Section title="Nossos Serviços" icon={Icons.ShoppingBag}>
        <p className="mb-4">
          A Smash Burger oferece uma plataforma online para:
        </p>
        <List items={[
          'Visualização de cardápio e informações de produtos',
          'Realização de pedidos para entrega ou retirada',
          'Processamento de pagamentos online',
          'Acompanhamento de pedidos em tempo real',
          'Acesso a promoções e ofertas exclusivas',
        ]} />
        <p className="mt-4">
          Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto 
          do serviço a qualquer momento, com ou sem aviso prévio.
        </p>
      </Section>

      {/* Cadastro e conta */}
      <Section title="Cadastro e Conta" icon={Icons.Shield}>
        <p>
          Para utilizar determinadas funcionalidades, você precisará criar uma conta. 
          Ao se cadastrar, você concorda em:
        </p>
        <List items={[
          'Fornecer informações verdadeiras, precisas e completas',
          'Manter suas informações de cadastro atualizadas',
          'Ser responsável pela confidencialidade de sua senha',
          'Ser responsável por todas as atividades em sua conta',
          'Notificar-nos imediatamente sobre uso não autorizado',
        ]} />
        <p className="mt-4">
          Reservamo-nos o direito de recusar, suspender ou cancelar contas que violem 
          estes termos ou apresentem atividades suspeitas.
        </p>
      </Section>

      {/* Pedidos e pagamentos */}
      <Section title="Pedidos e Pagamentos" icon={Icons.CreditCard}>
        <p className="mb-4">
          Ao realizar um pedido através de nossa plataforma:
        </p>
        <List items={[
          'Você declara que todas as informações fornecidas são corretas',
          'Os preços exibidos estão sujeitos a alterações sem aviso prévio',
          'A confirmação do pedido está sujeita à disponibilidade dos produtos',
          'O pagamento deve ser realizado integralmente antes do preparo',
          'Promoções e cupons estão sujeitos a condições específicas',
        ]} />
        
        <div className="mt-6 p-4 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
          <h4 className="font-semibold text-[#1e3a5f] flex items-center gap-2 mb-2">
            <Icons.AlertTriangle className="w-5 h-5" />
            Cancelamentos e Reembolsos
          </h4>
          <p className="text-sm text-[#1e3a5f]/70">
            Pedidos podem ser cancelados apenas se ainda não tiverem entrado em preparo. 
            Reembolsos serão processados conforme o meio de pagamento utilizado, podendo 
            levar até 10 dias úteis para serem efetivados.
          </p>
        </div>
      </Section>

      {/* Obrigações do usuário */}
      <Section title="Obrigações do Usuário" icon={Icons.CheckCircle}>
        <p className="mb-4">
          Ao utilizar nossos serviços, você se compromete a:
        </p>
        <List items={[
          'Utilizar a plataforma apenas para fins legais e autorizados',
          'Não compartilhar credenciais de acesso com terceiros',
          'Não tentar acessar áreas restritas do sistema',
          'Não realizar atividades que possam prejudicar o funcionamento do site',
          'Respeitar os direitos de propriedade intelectual da empresa',
          'Fornecer endereço de entrega correto e estar disponível para receber o pedido',
        ]} />
      </Section>

      {/* Condutas proibidas */}
      <Section title="Condutas Proibidas" icon={Icons.XCircle}>
        <p className="mb-4">
          É expressamente proibido:
        </p>
        <List items={[
          'Utilizar robôs, scrapers ou ferramentas automatizadas',
          'Tentar contornar medidas de segurança do site',
          'Transmitir vírus, malware ou código malicioso',
          'Realizar pedidos falsos ou fraudulentos',
          'Usar o serviço para assediar, ameaçar ou prejudicar terceiros',
          'Reproduzir, copiar ou distribuir conteúdo da plataforma sem autorização',
          'Fornecer informações falsas ou enganosas',
        ]} />
        <p className="mt-4">
          A violação dessas proibições pode resultar na suspensão ou encerramento 
          da sua conta, sem prejuízo de medidas legais cabíveis.
        </p>
      </Section>

      {/* Propriedade intelectual */}
      <Section title="Propriedade Intelectual" icon={Icons.Globe}>
        <p>
          Todo o conteúdo presente na plataforma, incluindo mas não se limitando a textos, 
          imagens, logotipos, ícones, fotografias, vídeos, gráficos, layout e código-fonte, 
          é de propriedade exclusiva da Smash Burger ou de seus licenciadores, sendo protegido 
          pelas leis de propriedade intelectual.
        </p>
        <p>
          É concedida ao usuário uma licença limitada, não exclusiva e revogável para acessar 
          e usar a plataforma exclusivamente para fins pessoais e não comerciais.
        </p>
      </Section>

      {/* Limitação de responsabilidade */}
      <Section title="Limitação de Responsabilidade" icon={Icons.Scale}>
        <p className="mb-4">
          A Smash Burger não será responsável por:
        </p>
        <List items={[
          'Interrupções temporárias do serviço por manutenção ou problemas técnicos',
          'Atrasos na entrega causados por fatores externos (trânsito, clima, etc.)',
          'Erros de digitação ou informações incorretas fornecidas pelo usuário',
          'Danos indiretos, incidentais ou consequenciais decorrentes do uso do serviço',
          'Ações de terceiros que utilizem sua conta de forma não autorizada',
        ]} />
        <p className="mt-4">
          Nossa responsabilidade total em qualquer circunstância está limitada ao valor 
          do pedido em questão.
        </p>
      </Section>

      {/* Modificações dos termos */}
      <Section title="Modificações dos Termos" icon={Icons.Document}>
        <p>
          Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
          As alterações entrarão em vigor imediatamente após a publicação no site. 
          O uso continuado da plataforma após as modificações constitui aceitação dos 
          novos termos.
        </p>
        <p>
          Recomendamos revisar esta página periodicamente para se manter informado sobre 
          eventuais alterações. Mudanças substanciais serão comunicadas através de aviso 
          em destaque na plataforma.
        </p>
      </Section>

      {/* Legislação e foro */}
      <Section title="Legislação Aplicável e Foro" icon={Icons.Scale}>
        <p>
          Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
          Qualquer controvérsia decorrente destes termos será submetida ao foro da comarca 
          de Garanhuns/PE, com exclusão de qualquer outro, por mais privilegiado que seja.
        </p>
        <div className="mt-4 p-4 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
          <p className="text-sm text-[#1e3a5f]">
            <strong>CNPJ:</strong> XX.XXX.XXX/0001-XX<br />
            <strong>Razão Social:</strong> Smash Burger Alimentos LTDA<br />
            <strong>Endereço:</strong> Rua Exemplo, 123 - Centro, Garanhuns/PE
          </p>
        </div>
      </Section>

      {/* Contato */}
      <Section title="Contato" icon={Icons.CheckCircle}>
        <p>
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato:
        </p>
        <div className="mt-4 p-5 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#1e3a5f]/50">E-mail para contato</p>
              <a href="mailto:contato@smashburger.com.br" className="text-[#1e3a5f] font-medium hover:underline">
                contato@smashburger.com.br
              </a>
            </div>
          </div>
        </div>
      </Section>
    </StaticPageLayout>
  );
}
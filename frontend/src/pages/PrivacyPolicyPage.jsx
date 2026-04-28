import React from 'react';
import StaticPageLayout, { Section, List } from '../components/StaticPageLayout';

const Icons = {
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Database: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Share: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  Lock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  User: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Mail: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '28 de Abril de 2026';

  return (
    <StaticPageLayout
      title="Política de Privacidade"
      subtitle="Como coletamos, usamos e protegemos seus dados"
      icon={Icons.Shield}
    >
      {/* Data de Atualização */}
      <div className="bg-[#1e3a5f]/5 rounded-xl px-5 py-4 flex items-center gap-3 border border-[#1e3a5f]/10">
        <Icons.Calendar className="w-5 h-5 text-[#1e3a5f]" />
        <span className="text-sm text-[#1e3a5f]">
          <strong>Última atualização:</strong> {lastUpdated}
        </span>
      </div>

      {/* Introdução */}
      <Section title="Introdução" icon={Icons.Shield}>
        <p>
          A <strong className="text-[#1e3a5f]">Smash Burger</strong> ("nós", "nosso" ou "empresa") 
          está comprometida em proteger a privacidade de seus usuários ("você" ou "usuário"). 
          Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
          suas informações pessoais quando você utiliza nosso site e serviços.
        </p>
        <p>
          Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política. 
          Recomendamos a leitura completa deste documento para entender nossos procedimentos 
          relacionados às suas informações pessoais.
        </p>
      </Section>

      {/* Dados Coletados */}
      <Section title="Dados que Coletamos" icon={Icons.Database}>
        <p className="mb-4">
          Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
        </p>
        
        <h4 className="font-semibold text-[#1e3a5f] mb-2">Informações fornecidas por você:</h4>
        <List items={[
          'Nome completo e dados de identificação',
          'Endereço de e-mail e telefone de contato',
          'Endereço de entrega e dados de localização',
          'Informações de pagamento (processadas por terceiros seguros)',
          'Histórico de pedidos e preferências',
        ]} />

        <h4 className="font-semibold text-[#1e3a5f] mb-2 mt-6">Informações coletadas automaticamente:</h4>
        <List items={[
          'Endereço IP e dados do dispositivo',
          'Tipo de navegador e sistema operacional',
          'Páginas visitadas e tempo de navegação',
          'Dados de cookies e tecnologias similares',
        ]} />
      </Section>

      {/* Uso dos Dados */}
      <Section title="Como Usamos seus Dados" icon={Icons.Eye}>
        <p className="mb-4">
          Utilizamos suas informações pessoais para as seguintes finalidades:
        </p>
        <List items={[
          'Processar e entregar seus pedidos corretamente',
          'Comunicar sobre status de pedidos e atualizações importantes',
          'Personalizar sua experiência de navegação e recomendações',
          'Enviar promoções e novidades (com seu consentimento)',
          'Melhorar nossos produtos, serviços e atendimento',
          'Prevenir fraudes e garantir a segurança da plataforma',
          'Cumprir obrigações legais e regulatórias',
        ]} />
      </Section>

      {/* Compartilhamento */}
      <Section title="Compartilhamento de Dados" icon={Icons.Share}>
        <p className="mb-4">
          Não vendemos suas informações pessoais. Podemos compartilhar seus dados apenas com:
        </p>
        <List items={[
          'Processadores de pagamento para completar transações',
          'Serviços de entrega para realizar a logística dos pedidos',
          'Prestadores de serviços que auxiliam nossas operações',
          'Autoridades competentes quando exigido por lei',
        ]} />
        <p className="mt-4">
          Todos os terceiros com quem compartilhamos dados são obrigados contratualmente 
          a proteger suas informações e utilizá-las apenas para os fins especificados.
        </p>
      </Section>

      {/* Segurança */}
      <Section title="Segurança dos Dados" icon={Icons.Lock}>
        <p>
          Implementamos medidas técnicas e organizacionais adequadas para proteger suas 
          informações pessoais contra acesso não autorizado, alteração, divulgação ou 
          destruição. Isso inclui:
        </p>
        <List items={[
          'Criptografia SSL/TLS em todas as transmissões de dados',
          'Armazenamento seguro em servidores protegidos',
          'Acesso restrito apenas a funcionários autorizados',
          'Monitoramento contínuo de segurança',
          'Políticas internas de proteção de dados',
        ]} />
      </Section>

      {/* Direitos do Usuário */}
      <Section title="Seus Direitos" icon={Icons.User}>
        <p className="mb-4">
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você possui os seguintes direitos:
        </p>
        <List items={[
          'Confirmação da existência de tratamento de dados',
          'Acesso aos seus dados pessoais',
          'Correção de dados incompletos ou desatualizados',
          'Anonimização, bloqueio ou eliminação de dados desnecessários',
          'Portabilidade dos dados a outro fornecedor',
          'Eliminação dos dados tratados com seu consentimento',
          'Informação sobre compartilhamento com terceiros',
          'Revogação do consentimento a qualquer momento',
        ]} />
      </Section>

      {/* Retenção */}
      <Section title="Retenção de Dados" icon={Icons.Database}>
        <p>
          Mantemos suas informações pessoais pelo tempo necessário para cumprir as finalidades 
          descritas nesta política, a menos que um período de retenção mais longo seja exigido 
          ou permitido por lei. Os critérios para determinar o período de retenção incluem:
        </p>
        <List items={[
          'Duração do relacionamento comercial com você',
          'Existência de obrigações legais de retenção',
          'Necessidade para resolução de disputas ou processos judiciais',
          'Orientações de autoridades de proteção de dados',
        ]} />
      </Section>

      {/* Contato */}
      <Section title="Contato" icon={Icons.Mail}>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
          entre em contato conosco:
        </p>
        <div className="mt-4 p-5 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icons.Mail className="w-5 h-5 text-[#1e3a5f]" />
              <div>
                <p className="text-sm text-[#1e3a5f]/50">E-mail do Encarregado (DPO)</p>
                <a href="mailto:privacidade@smashburger.com.br" className="text-[#1e3a5f] font-medium hover:underline">
                  privacidade@smashburger.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-[#1e3a5f]/50 mt-4">
          Responderemos sua solicitação no prazo máximo de 15 dias úteis, conforme 
          determinado pela legislação vigente.
        </p>
      </Section>
    </StaticPageLayout>
  );
}
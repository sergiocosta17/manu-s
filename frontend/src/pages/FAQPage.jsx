import React, { useState } from 'react';
import StaticPageLayout, { Section } from '../components/StaticPageLayout';

const Icons = {
  QuestionMarkCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ShoppingBag: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Truck: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  CreditCard: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ChevronDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

const faqCategories = [
  {
    id: 'pedidos',
    title: 'Pedidos',
    icon: Icons.ShoppingBag,
    questions: [
      {
        question: 'Como faço para realizar um pedido?',
        answer: 'Para fazer um pedido, basta navegar pelo nosso cardápio, escolher os itens desejados, adicioná-los ao carrinho e finalizar a compra. Você precisará criar uma conta ou fazer login para concluir o pedido.',
      },
      {
        question: 'Posso modificar ou cancelar meu pedido?',
        answer: 'Você pode modificar ou cancelar seu pedido apenas se ele ainda não tiver sido enviado para preparo. Entre em contato conosco o mais rápido possível através do WhatsApp ou telefone informado no site.',
      },
      {
        question: 'Qual o valor mínimo para pedidos?',
        answer: 'O valor mínimo para pedidos pode variar de acordo com a forma de entrega escolhida. Para delivery, o pedido mínimo é de R$ 25,00. Para retirada no local, não há valor mínimo.',
      },
      {
        question: 'Como acompanho o status do meu pedido?',
        answer: 'Após finalizar seu pedido, você pode acompanhar o status em tempo real através da seção "Meus Pedidos" no seu perfil. Também enviamos atualizações por notificação.',
      },
    ],
  },
  {
    id: 'entrega',
    title: 'Entrega',
    icon: Icons.Truck,
    questions: [
      {
        question: 'Qual a área de entrega?',
        answer: 'Realizamos entregas em toda a cidade e região metropolitana. Durante o checkout, você poderá verificar se seu endereço está dentro da nossa área de cobertura.',
      },
      {
        question: 'Qual o tempo médio de entrega?',
        answer: 'O tempo médio de entrega é de 30 a 50 minutos, podendo variar de acordo com a demanda e condições climáticas. Você receberá uma estimativa mais precisa ao finalizar o pedido.',
      },
      {
        question: 'Quanto custa a taxa de entrega?',
        answer: 'A taxa de entrega é calculada automaticamente com base na distância do seu endereço até nossa loja. O valor é exibido antes de você confirmar o pedido.',
      },
      {
        question: 'Vocês fazem entrega em dias de chuva?',
        answer: 'Sim, realizamos entregas mesmo em dias chuvosos. No entanto, o tempo de entrega pode ser um pouco maior devido às condições do trânsito.',
      },
    ],
  },
  {
    id: 'pagamento',
    title: 'Pagamento',
    icon: Icons.CreditCard,
    questions: [
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer: 'Aceitamos Pix, cartões de crédito e débito das principais bandeiras (Visa, Mastercard, Elo, American Express), e dinheiro na entrega.',
      },
      {
        question: 'O pagamento é seguro?',
        answer: 'Sim! Utilizamos criptografia de ponta e não armazenamos dados de cartões. Todos os pagamentos são processados por plataformas certificadas e seguras.',
      },
      {
        question: 'Posso pagar na entrega?',
        answer: 'Sim, oferecemos a opção de pagamento na entrega em dinheiro ou cartão. Basta selecionar essa opção durante o checkout.',
      },
      {
        question: 'Como solicito a nota fiscal?',
        answer: 'A nota fiscal é enviada automaticamente para o e-mail cadastrado após a confirmação do pagamento. Caso precise de uma segunda via, entre em contato conosco.',
      },
    ],
  },
  {
    id: 'horarios',
    title: 'Horários',
    icon: Icons.Clock,
    questions: [
      {
        question: 'Qual o horário de funcionamento?',
        answer: 'Funcionamos de terça a domingo, das 18h às 23h. Segundas-feiras não abrimos para manutenção e descanso da equipe.',
      },
      {
        question: 'Vocês abrem em feriados?',
        answer: 'Sim, funcionamos normalmente na maioria dos feriados. Em datas especiais como Natal e Ano Novo, podemos ter horários diferenciados que serão comunicados com antecedência.',
      },
      {
        question: 'Até que horas posso fazer pedido?',
        answer: 'Os pedidos podem ser feitos até 30 minutos antes do horário de fechamento. Pedidos realizados após esse horário serão processados no próximo dia de funcionamento.',
      },
    ],
  },
  {
    id: 'conta',
    title: 'Conta e Segurança',
    icon: Icons.Shield,
    questions: [
      {
        question: 'Como crio uma conta?',
        answer: 'Clique em "Entrar" no menu superior e depois em "Criar conta". Preencha seus dados básicos e pronto! Você também pode se cadastrar durante seu primeiro pedido.',
      },
      {
        question: 'Esqueci minha senha, o que faço?',
        answer: 'Na tela de login, clique em "Esqueci minha senha" e informe seu e-mail. Enviaremos um link para você criar uma nova senha.',
      },
      {
        question: 'Como altero meus dados cadastrais?',
        answer: 'Acesse seu perfil clicando no ícone de usuário no menu. Lá você pode alterar nome, e-mail, telefone e endereços salvos.',
      },
      {
        question: 'Como excluo minha conta?',
        answer: 'Para solicitar a exclusão da sua conta e dados, entre em contato conosco pelo e-mail informado na Política de Privacidade. Processaremos sua solicitação em até 5 dias úteis.',
      },
    ],
  },
];

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-[#1e3a5f]/10 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-[#1e3a5f]/5 transition-colors px-4 -mx-4 rounded-lg"
      >
        <span className="font-medium text-[#1e3a5f] pr-4">{question}</span>
        <div className={`w-6 h-6 rounded-md bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown className="w-4 h-4 text-[#1e3a5f]" />
        </div>
      </button>
      {isOpen && (
        <div className="pb-4 text-[#1e3a5f]/60 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <StaticPageLayout
      title="Perguntas Frequentes"
      subtitle="Encontre respostas para as dúvidas mais comuns"
      icon={Icons.QuestionMarkCircle}
    >
      {faqCategories.map((category) => (
        <Section key={category.id} title={category.title} icon={category.icon}>
          <div className="mt-2">
            {category.questions.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openItems[`${category.id}-${index}`]}
                onClick={() => toggleItem(category.id, index)}
              />
            ))}
          </div>
        </Section>
      ))}

      {/* Não encontrou sua dúvida */}
      <Section>
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-[#1e3a5f]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.QuestionMarkCircle className="w-8 h-8 text-[#1e3a5f]" />
          </div>
          <h3 className="font-semibold text-[#1e3a5f] text-lg mb-2">
            Não encontrou sua dúvida?
          </h3>
          <p className="text-[#1e3a5f]/60 mb-4">
            Entre em contato conosco que teremos prazer em ajudar.
          </p>
          <a 
            href="mailto:contato@smashburger.com.br"
            className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#162d4a] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar E-mail
          </a>
        </div>
      </Section>
    </StaticPageLayout>
  );
}
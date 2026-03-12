🍔 Manu’s Smash Burger - BackendEste projeto é o núcleo de processamento e gerenciamento de pedidos da hamburgueria Manu’s Smash Burger. Trata-se de uma aplicação robusta que integra tecnologias modernas para oferecer uma experiência de pedido fluida para clientes e um painel de controle eficiente para administradores.
🚀 Tecnologias Utilizadasa 
- Node.js Ambiente de execução JavaScript
- Express Framework web para rotas e middleware REST
- Apollo Server Implementação da interface GraphQL
- MongoDB Atlas Banco de dados NoSQL baseado em nuvem
- Mongoose Modelagem de objetos e relacionamento de dados
- JWT (JSON Web Token) Segurança e autorização de usuários
- BcryptJS Criptografia de senhas (hashing)

🛠️ Requisitos Atendidos
O desenvolvimento foi pautado no cumprimento rigoroso dos seguintes critérios técnicos:
- Validação de Dados: Implementada via Schemas do Mongoose com regras de obrigatoriedade, valores únicos e tipos enumerados (ex: categorias de produtos e status de pedidos).

- Relacionamento entre Entidades: Uso de referências (ObjectIds) e o método .populate() para vincular Pedidos a Clientes e Produtos, garantindo integridade referencial.
  
- Segurança e Autenticação: Sistema de login com geração de tokens JWT e controle de acesso baseado em cargos (RBAC), distinguindo permissões de client e admin.

- Interfaces Híbridas: * RESTful: Endpoints otimizados para fluxo de autenticação e registro.

= GraphQL: Interface flexível para consultas de cardápio e gestão complexa de pedidos.

📂 Estrutura do Projeto
src/
├── graphql/      # Definições de Tipos (Schemas) e Resolvers
├── middleware/   # Validação de tokens e controle de acesso
├── models/       # Modelagem de dados (User, Product, Order)
├── routes/       # Definição de rotas REST
└── server.js     # Ponto de entrada e configuração do servidor

⚙️ Instalação e Execução
- Clonar o repositório:
git clone https://github.com/seu-usuario/manus-burger-backend.git
cd manus-burger-backend

- Instalar dependências:
npm install

- Configurar variáveis de ambiente:
Crie um arquivo .env na raiz do projeto:
PORT=4000
MONGO_URI=sua_url_do_mongodb_atlas
JWT_SECRET=sua_chave_secreta

Rodar o servidor:
npm start

👨‍💻 Desenvolvedor
Projeto desenvolvido como parte do currículo acadêmico, focado em escalabilidade e segurança de aplicações web.

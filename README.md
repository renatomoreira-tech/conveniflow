# 🏪 GestorFlow

Sistema completo de gestão para pequenos comércios, desenvolvido com **Node.js**, **React**, **PostgreSQL** e **Prisma ORM**.

🔗 **Acesse:** [gestorflow-app.vercel.app](https://gestorflow-app.vercel.app)

🔑 **Demo:** `demo@gestorflow.com` / `demo123`

---

## 📋 Sobre o Projeto

O GestorFlow é um sistema full stack para gerenciamento de conveniências, lojas de bebidas, açaiterias, salões de beleza e pequenos comércios em geral. Ele permite o controle completo de produtos, vendas, estoque, caixa, categorias e fornecedores, com autenticação segura e controle de acesso por perfil de usuário.

---

## 🚀 Funcionalidades

- **Autenticação JWT** com senhas criptografadas (bcrypt)
- **Controle de acesso por roles** (Admin, Gerente, Caixa)
- **Dashboard com métricas** — vendas do dia, pedidos, ticket médio, estoque baixo
- **Gestão de Produtos** — cadastro com código de barras, preço de custo/venda, estoque mínimo
- **Registro de Vendas** — múltiplos itens por venda, formas de pagamento (Dinheiro, PIX, Cartão), desconto
- **Cancelamento de Vendas** — com devolução automática do estoque
- **Controle de Caixa** — abertura/fechamento com histórico e diferença de valores
- **Categorias e Fornecedores** — organização e rastreabilidade dos produtos
- **Relatórios** — vendas por período com faturamento total e ticket médio
- **Dark mode** — tema claro/escuro com persistência e detecção automática da preferência do sistema
- **Sidebar de navegação** — interface profissional com menu lateral e ícones
- **Visibilidade por role** — cada perfil vê apenas o que pode acessar
- **Soft Delete** — produtos e usuários são desativados sem perder histórico

---

## 🛠️ Tecnologias

### Backend

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT (jsonwebtoken)
- Bcrypt

### Frontend

- React (Vite)
- React Router DOM
- Axios
- Lucide React (ícones)
- CSS Variables (sistema de tema light/dark)

### Deploy

- Frontend: Vercel
- Backend: Railway
- Banco de dados: Railway (PostgreSQL)

---

## 📁 Estrutura do Projeto

```
gestorflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── productController.js
│   │   │   ├── saleController.js
│   │   │   ├── categoriaController.js
│   │   │   ├── fornecedorController.js
│   │   │   └── caixaController.js
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── saleRoutes.js
│   │   │   ├── categoriaRoutes.js
│   │   │   ├── fornecedorRoutes.js
│   │   │   └── caixaRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── app.js
│   │   └── database.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── favicon.ico
    │   ├── icon.svg
    │   ├── icon-192.png
    │   └── icon-512.png
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── ThemeToggle/
    │   │       ├── ThemeToggle.jsx
    │   │       └── ThemeToggle.module.css
    │   ├── hooks/
    │   │   └── useTheme.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Produtos.jsx
    │   │   ├── Vendas.jsx
    │   │   ├── Relatorios.jsx
    │   │   ├── Categorias.jsx
    │   │   ├── Fornecedores.jsx
    │   │   └── Caixa.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── theme.css
    │   └── App.jsx
    ├── vercel.json
    └── package.json
```

---

## 🗄️ Modelagem do Banco de Dados

- **User** — Usuários com roles (Admin, Gerente, Caixa)
- **Product** — Produtos com código de barras, preços e estoque
- **Sale** — Vendas com forma de pagamento e status
- **ItemVenda** — Itens de cada venda (relacionamento N:N entre Sale e Product)
- **Categoria** — Classificação dos produtos
- **Fornecedor** — Dados dos fornecedores
- **Caixa** — Controle de abertura e fechamento

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

- Node.js (v18+)
- PostgreSQL
- npm

### Backend

```bash
cd backend
npm install
```

Configure o arquivo `.env`:

```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/gestorflow_db"
JWT_SECRET=sua_chave_secreta
```

Rode as migrações e inicie o servidor:

```bash
npx prisma migrate dev
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🔐 Controle de Acesso

| Funcionalidade            | ADMIN | GERENTE | CAIXA |
| ------------------------- | ----- | ------- | ----- |
| Dashboard com métricas    | ✅    | ✅      | ✅    |
| Visualizar produtos       | ✅    | ✅      | ✅    |
| Criar/editar produtos     | ✅    | ✅      | ❌    |
| Desativar produtos        | ✅    | ❌      | ❌    |
| Registrar vendas          | ✅    | ✅      | ✅    |
| Cancelar vendas           | ✅    | ✅      | ❌    |
| Relatórios                | ✅    | ✅      | ❌    |
| Categorias e Fornecedores | ✅    | ✅      | ❌    |
| Caixa                     | ✅    | ✅      | ✅    |
| Gerenciar usuários        | ✅    | ❌      | ❌    |

---

## 🔗 Endpoints da API

### Autenticação

| Método | Rota         | Descrição        |
| ------ | ------------ | ---------------- |
| POST   | /users/login | Login do usuário |
| POST   | /users       | Criar usuário    |

### Usuários (autenticado)

| Método | Rota       | Descrição       |
| ------ | ---------- | --------------- |
| GET    | /users     | Listar usuários |
| GET    | /users/:id | Buscar por ID   |
| PUT    | /users/:id | Atualizar       |
| DELETE | /users/:id | Desativar       |

### Produtos (autenticado)

| Método | Rota                    | Descrição                  |
| ------ | ----------------------- | -------------------------- |
| GET    | /products               | Listar produtos            |
| GET    | /products/:id           | Buscar por ID              |
| GET    | /products/estoque-baixo | Produtos com estoque baixo |
| POST   | /products               | Criar produto              |
| PUT    | /products/:id           | Atualizar                  |
| DELETE | /products/:id           | Desativar                  |

### Vendas (autenticado)

| Método | Rota                | Descrição             |
| ------ | ------------------- | --------------------- |
| POST   | /sales              | Registrar venda       |
| GET    | /sales              | Listar vendas         |
| GET    | /sales/:id          | Buscar por ID         |
| GET    | /sales/relatorio    | Relatório por período |
| PATCH  | /sales/:id/cancelar | Cancelar venda        |

### Categorias (autenticado)

| Método | Rota            | Descrição |
| ------ | --------------- | --------- |
| GET    | /categorias     | Listar    |
| POST   | /categorias     | Criar     |
| PUT    | /categorias/:id | Atualizar |
| DELETE | /categorias/:id | Excluir   |

### Fornecedores (autenticado)

| Método | Rota              | Descrição     |
| ------ | ----------------- | ------------- |
| GET    | /fornecedores     | Listar        |
| GET    | /fornecedores/:id | Buscar por ID |
| POST   | /fornecedores     | Criar         |
| PUT    | /fornecedores/:id | Atualizar     |
| DELETE | /fornecedores/:id | Excluir       |

### Caixa (autenticado)

| Método | Rota              | Descrição        |
| ------ | ----------------- | ---------------- |
| GET    | /caixa            | Listar histórico |
| GET    | /caixa/atual      | Caixa aberto     |
| POST   | /caixa/abrir      | Abrir caixa      |
| PATCH  | /caixa/:id/fechar | Fechar caixa     |

---

## 👤 Autor

**Renato Moreira**

- GitHub: [@renatomoreira-tech](https://github.com/renatomoreira-tech)
- LinkedIn: [Renato Moreira](https://www.linkedin.com/in/renato-moreira-5836b8205/)

---

## 📄 Licença

Este projeto está sob a licença MIT.

# ConveniFlow 🏪

Sistema de gestão para conveniências desenvolvido como projeto de estudos,
com foco em aprendizado de arquitetura full stack, autenticação JWT,
integração com banco de dados relacional e boas práticas de desenvolvimento.

## 🛠️ Tecnologias

**Backend**

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT (autenticação)

**Frontend**

- React
- Vite
- Axios
- React Router DOM

## ✅ Funcionalidades

- Autenticação com login e controle de acesso por perfil (Admin)
- Gerenciamento de produtos com controle de estoque
- Registro e acompanhamento de vendas
- Cadastro de categorias e fornecedores
- Relatórios de desempenho do negócio

## ✅ Pré-requisitos

- Node.js v18 ou superior
- PostgreSQL instalado e rodando

## ▶️ Como executar

**Backend**
cd backend
npm install
cp .env.example .env
npx prisma generate
node server.js

**Frontend**

cd frontend
npm install
npm run dev

Acesse: `http://localhost:5173`

## 📌 Status

Em desenvolvimento — funcionalidades de categorias,
fornecedores e relatórios ainda em construção.

## 📌 Autor

Renato Moreira
github.com/renatomoreira-tech

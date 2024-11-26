# PetShop API

Uma API completa para gerenciamento de petshop desenvolvida com NestJS, Prisma e MySQL.

## Índice

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Deploy](#deploy)
- [Exemplos de Payloads](#exemplos-de-payloads)

## Visão Geral

O PetShop API é um sistema completo para gerenciamento de petshops, oferecendo funcionalidades como gestão de clientes, pets, produtos, serviços, agendamentos e notificações. A API foi desenvolvida seguindo as melhores práticas de desenvolvimento e arquitetura de software.

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js para construção de aplicações escaláveis
- **Prisma**: ORM moderno para Node.js e TypeScript
- **MySQL**: Sistema de gerenciamento de banco de dados
- **TypeScript**: Linguagem de programação
- **Jest**: Framework de testes
- **Swagger**: Documentação da API
- **Docker**: Containerização da aplicação
- **JWT**: Autenticação e autorização

## Funcionalidades

- **Autenticação e Autorização**
  - Login com JWT
  - Controle de acesso baseado em roles (ADMIN, EMPLOYEE, CLIENT)

- **Gestão de Usuários**
  - Cadastro de clientes, funcionários e administradores
  - Gerenciamento de perfis

- **Gestão de Pets**
  - Cadastro de pets
  - Histórico médico
  - Vinculação com proprietários

- **Produtos**
  - Cadastro de produtos
  - Controle de estoque
  - Preços e descrições

- **Serviços**
  - Cadastro de serviços
  - Precificação
  - Duração dos serviços

- **Agendamentos**
  - Marcação de consultas e serviços
  - Calendário de atendimentos
  - Status de agendamentos

- **Notificações**
  - Sistema de notificações para usuários
  - Alertas de agendamentos

## Requisitos

- Node.js (versão 18 ou superior)
- MySQL (versão 8 ou superior)
- Docker e Docker Compose (opcional)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/petshop-api.git
cd petshop-api
```

2. Instale as dependências:
```bash
npm install
```

## Configuração

1. Crie um arquivo .env na raiz do projeto:
```env
DATABASE_URL="mysql://user:password@localhost:3306/petshop"
JWT_SECRET="seu-secret-jwt"
PORT=3000
```

2. Configure o banco de dados:
```bash
# Executa as migrations do Prisma
npx prisma migrate dev
```

## Executando a Aplicação

### Usando npm:
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

### Usando Docker:
```bash
# Inicia os containers
docker-compose up -d
```

## Documentação da API

A documentação completa da API está disponível através do Swagger UI:

- Local: http://localhost:3000/api/docs
- Produção: https://seu-dominio.com/api/docs

### Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Para acessar endpoints protegidos:

1. Faça login através do endpoint `/api/auth/login`
2. Use o token retornado no header `Authorization: Bearer {token}`

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## Estrutura do Projeto

```
petshop-api/
├── src/
│   ├── modules/           # Módulos da aplicação
│   │   ├── auth/         # Autenticação
│   │   ├── users/        # Gestão de usuários
│   │   ├── pets/         # Gestão de pets
│   │   ├── products/     # Gestão de produtos
│   │   ├── services/     # Gestão de serviços
│   │   ├── appointments/ # Gestão de agendamentos
│   │   └── notifications/# Sistema de notificações
│   ├── common/           # Código compartilhado
│   ├── prisma/          # Configuração do Prisma
│   └── main.ts          # Ponto de entrada
├── test/                # Testes
├── prisma/             # Schemas e migrations
└── docker-compose.yml  # Configuração Docker
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 🚀 Deploy

### Preparação para Produção

1. **Variáveis de Ambiente**
   ```env
   # Produção
   DATABASE_URL="mysql://user:password@your-db-host:3306/petshop"
   JWT_SECRET="seu-secret-jwt-producao"
   PORT=3000
   NODE_ENV=production
   ```

2. **Build da Aplicação**
   ```bash
   # Gera a build otimizada
   npm run build
   
   # Verifica a build
   npm run start:prod
   ```

### Opções de Deploy

#### 1. Deploy Tradicional

1. **Preparação do Servidor**
   ```bash
   # Instala o Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Instala o PM2
   npm install -g pm2
   ```

2. **Deploy da Aplicação**
   ```bash
   # Copia os arquivos para o servidor
   scp -r dist package.json .env user@your-server:/app/petshop-api

   # Instala dependências
   npm install --production

   # Inicia com PM2
   pm2 start dist/main.js --name petshop-api
   ```

3. **Configuração do Nginx**
   ```nginx
   server {
       listen 80;
       server_name api.seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### 2. Deploy com Docker

1. **Build da Imagem**
   ```bash
   # Constrói a imagem
   docker build -t petshop-api .

   # Testa a imagem localmente
   docker run -p 3000:3000 --env-file .env petshop-api
   ```

2. **Deploy com Docker Compose**
   ```bash
   # Inicia os serviços
   docker-compose -f docker-compose.prod.yml up -d

   # Verifica os logs
   docker-compose logs -f
   ```

#### 3. Deploy em Cloud

##### AWS Elastic Beanstalk

1. **Configuração do EB CLI**
   ```bash
   # Instala EB CLI
   pip install awsebcli

   # Inicializa o projeto
   eb init petshop-api --platform node.js --region us-east-1
   ```

2. **Deploy**
   ```bash
   # Cria o ambiente
   eb create production

   # Deploy de atualizações
   eb deploy
   ```

##### Heroku

1. **Configuração**
   ```bash
   # Login no Heroku
   heroku login

   # Cria a aplicação
   heroku create petshop-api
   ```

2. **Deploy**
   ```bash
   # Configura variáveis de ambiente
   heroku config:set DATABASE_URL="seu-database-url"
   heroku config:set JWT_SECRET="seu-jwt-secret"

   # Push para o Heroku
   git push heroku main
   ```

### Monitoramento e Manutenção

1. **Monitoramento com PM2**
   ```bash
   # Status da aplicação
   pm2 status

   # Monitoramento em tempo real
   pm2 monit

   # Logs
   pm2 logs petshop-api
   ```

2. **Backup do Banco de Dados**
   ```bash
   # Backup
   mysqldump -u user -p petshop > backup.sql

   # Restauração
   mysql -u user -p petshop < backup.sql
   ```

3. **Healthcheck**
   - Endpoint: `/api/health`
   - Monitora: status da API, conexão com banco de dados e serviços externos

### CI/CD Pipeline (Exemplo com GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to production
        run: |
          # Seus comandos de deploy aqui
```

### Boas Práticas de Deploy

1. **Segurança**
   - Use HTTPS
   - Configure CORS adequadamente
   - Mantenha as dependências atualizadas
   - Implemente rate limiting

2. **Performance**
   - Configure cache adequadamente
   - Use compressão gzip/brotli
   - Otimize consultas ao banco de dados

3. **Disponibilidade**
   - Configure auto-scaling
   - Implemente retry policies
   - Mantenha logs adequados

4. **Backup e Recuperação**
   - Mantenha backups regulares
   - Documente procedimentos de recuperação
   - Teste os procedimentos periodicamente

---

Desenvolvido com ❤️ pela equipe PetShop API

## 📦 Exemplos de Payloads

### Autenticação

#### Login
```json
POST /api/auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

// Resposta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@exemplo.com",
    "name": "Usuário Exemplo",
    "role": "CLIENT"
  }
}
```

### Usuários

#### Criar Usuário
```json
POST /api/users
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "role": "CLIENT"
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "role": "CLIENT",
  "createdAt": "2024-02-20T10:00:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

### Pets

#### Cadastrar Pet
```json
POST /api/pets
{
  "name": "Rex",
  "species": "DOG",
  "breed": "Golden Retriever",
  "birthDate": "2020-01-15"
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Rex",
  "species": "DOG",
  "breed": "Golden Retriever",
  "birthDate": "2020-01-15",
  "ownerId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-02-20T10:00:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

### Produtos

#### Criar Produto
```json
POST /api/products
{
  "name": "Ração Premium",
  "description": "Ração premium para cães adultos",
  "price": 89.90,
  "stock": 100
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Ração Premium",
  "description": "Ração premium para cães adultos",
  "price": 89.90,
  "stock": 100,
  "createdAt": "2024-02-20T10:00:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

#### Atualizar Estoque
```json
PATCH /api/products/{id}/stock
{
  "quantity": 50,
  "operation": "ADD" // ou "REMOVE"
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "stock": 150
}
```

### Serviços

#### Criar Serviço
```json
POST /api/services
{
  "name": "Banho e Tosa",
  "description": "Banho e tosa completa para cães",
  "price": 80.00,
  "duration": 60
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Banho e Tosa",
  "description": "Banho e tosa completa para cães",
  "price": 80.00,
  "duration": 60,
  "createdAt": "2024-02-20T10:00:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

### Agendamentos

#### Criar Agendamento
```json
POST /api/appointments
{
  "petId": "123e4567-e89b-12d3-a456-426614174000",
  "serviceId": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-03-01T14:00:00Z"
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "petId": "123e4567-e89b-12d3-a456-426614174000",
  "serviceId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-03-01T14:00:00Z",
  "status": "SCHEDULED",
  "createdAt": "2024-02-20T10:00:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

#### Atualizar Status do Agendamento
```json
PATCH /api/appointments/{id}/status
{
  "status": "COMPLETED"
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "COMPLETED",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

### Notificações

#### Marcar Notificação como Lida
```json
PATCH /api/notifications/{id}/read
{
  "read": true
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "read": true,
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

### Relatórios

#### Gerar Relatório de Vendas
```json
POST /api/reports/sales
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "type": "PRODUCT" // ou "SERVICE"
}

// Resposta
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "totalSales": 15890.50,
  "totalItems": 234,
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Ração Premium",
      "quantity": 45,
      "totalValue": 4045.50
    }
  ]
}
```

### Códigos de Erro Comuns

```json
// Erro de Validação (400 Bad Request)
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too weak"],
  "error": "Bad Request"
}

// Erro de Autenticação (401 Unauthorized)
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

// Erro de Permissão (403 Forbidden)
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

// Recurso não encontrado (404 Not Found)
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}

// Conflito (409 Conflict)
{
  "statusCode": 409,
  "message": "Já existe um produto com este nome",
  "error": "Conflict"
}

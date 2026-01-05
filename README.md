# 🏢 BM&V Software

Sistema de gestão financeira, contábil, OKRs e consultoria para PMEs.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/mirandatcunha-debug/bmv-software.git
cd bmv-software
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://acsaaslumtkypjihjnjz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
DATABASE_URL=postgresql://postgres:[SENHA]@db.acsaaslumtkypjihjnjz.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[SENHA]@db.acsaaslumtkypjihjnjz.supabase.co:5432/postgres
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
bmv-software/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (auth)/             # Rotas de autenticação
│   │   ├── (dashboard)/        # Rotas protegidas
│   │   └── api/                # API Routes
│   ├── components/             # Componentes React
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── charts/             # Gráficos
│   │   └── layout/             # Sidebar, Header
│   ├── lib/                    # Utilitários
│   ├── services/               # Lógica de negócio
│   └── types/                  # Tipos TypeScript
├── prisma/
│   └── schema.prisma           # Schema do banco
└── public/                     # Arquivos estáticos
```

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **UI:** shadcn/ui, Radix UI
- **Backend:** Next.js API Routes
- **Banco de Dados:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Autenticação:** Supabase Auth
- **Gráficos:** Recharts

## 📦 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Verifica código
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza schema com banco
npm run db:studio    # Abre Prisma Studio
npm run test         # Executa testes
```

## 🌐 Deploy na Vercel

1. Conecte seu repositório GitHub na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## 📝 Módulos

- **Dashboard:** Visão geral e KPIs
- **Financeiro:** Receitas, despesas, fluxo de caixa
- **Contábil:** DRE, DFC, centros de custo
- **OKRs:** Objetivos e resultados-chave
- **Consultoria:** Kanban e acompanhamento

## 🔐 Perfis de Usuário

| Perfil | Acesso |
|--------|--------|
| Admin BM&V | Total |
| Consultor BM&V | Múltiplos tenants |
| Gestor | Seu tenant |
| Colaborador | Limitado |
| Cliente | Visualização |

## 📄 Licença

Proprietário - BM&V Consultoria © 2026

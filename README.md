# 🎨 Controle de Gastos - Front-end

Front-end moderno e minimalista em React + TypeScript + Tailwind CSS para o sistema de controle de gastos pessoais.

## 🚀 Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navegação SPA
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **Chart.js** - Gráficos (preparado para uso)

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Backend rodando em `http://localhost:8080`

## 🔧 Instalação

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API (opcional - padrão é localhost:8080):
```bash
# Edite o arquivo .env
REACT_APP_API_URL=http://localhost:8080
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O app estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Layout principal com sidebar
│   │   └── PrivateRoute.tsx    # Proteção de rotas autenticadas
│   ├── pages/
│   │   ├── Login.tsx           # Página de login
│   │   ├── Register.tsx        # Página de registro
│   │   ├── Dashboard.tsx       # Dashboard com Top 5
│   │   ├── Transacoes.tsx      # CRUD de transações com tags
│   │   ├── Cartoes.tsx         # Gestão de cartões
│   │   ├── Categorias.tsx      # Gestão de categorias
│   │   └── Tags.tsx            # Gestão de tags (NOVO!)
│   ├── services/
│   │   ├── api.ts              # Configuração Axios
│   │   ├── authService.ts      # Serviços de autenticação
│   │   ├── transacaoService.ts # Serviços de transações
│   │   ├── cartaoService.ts    # Serviços de cartões
│   │   ├── categoriaService.ts # Serviços de categorias
│   │   ├── tagService.ts       # Serviços de tags (NOVO!)
│   │   └── dashboardService.ts # Serviços de dashboard
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── App.tsx                 # Componente principal
│   ├── index.tsx               # Entry point
│   └── index.css               # Estilos globais Tailwind
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login com JWT
- [x] Registro de usuário
- [x] Logout
- [x] Proteção de rotas privadas
- [x] Interceptor automático para token

### 💰 Transações
- [x] Listar todas as transações
- [x] Criar nova transação
- [x] Editar transação existente
- [x] Deletar transação
- [x] Importar CSV
- [x] Associar múltiplas tags
- [x] Visualização de tags (badges)
- [x] Visualização formatada (pt-BR)
- [x] Filtro por tipo (receita/despesa)

### 🏷️ Tags (NOVO!)
- [x] Listar tags ativas/inativas
- [x] Criar nova tag
- [x] Ativar/Inativar tags
- [x] Deletar tags
- [x] Associar tags a transações
- [x] Visualização em grid

### 💳 Cartões
- [x] Listar cartões com limite disponível
- [x] Criar novo cartão
- [x] Visualizar percentual de uso do limite
- [x] Verificar melhor dia para compra
- [x] Registrar pagamento antecipado
- [x] Deletar cartão

### 📊 Dashboard
- [x] Resumo financeiro (receitas, despesas, saldo)
- [x] Filtro por mês/ano
- [x] Top 5 Cartões com valor e percentual
- [x] Top 5 Tags com valor e percentual
- [x] Top 5 Categorias com valor e percentual
- [x] Visualização de metas de categorias
- [x] Indicadores visuais de progresso

### 📂 Categorias
- [x] Listar categorias ativas/inativas
- [x] Criar nova categoria
- [x] Ativar/Inativar categorias
- [x] Separação visual por tipo (receita/despesa)

## 🎨 Design System

### Cores Principais
- **Primary**: Azul (`#0ea5e9`) - Botões e elementos principais
- **Success**: Verde - Receitas e sucesso
- **Danger**: Vermelho - Despesas e exclusões
- **Gray**: Cinza - Textos e fundos neutros

### Componentes Reutilizáveis
- `btn-primary` - Botão principal
- `btn-secondary` - Botão secundário
- `btn-danger` - Botão de ação destrutiva
- `input-field` - Campo de input padrão
- `card` - Container com sombra
- `card-hover` - Card interativo com hover

## 🔐 Autenticação

O token JWT é armazenado no `localStorage` e automaticamente incluído em todas as requisições através do interceptor do Axios.

```typescript
// Exemplo de uso
import { authService } from './services/authService';

// Login
await authService.login({ username, password });

// Verificar autenticação
const isAuth = authService.isAuthenticated();

// Logout
authService.logout();
```

## 📡 Consumo da API

Todos os serviços estão prontos para consumir os endpoints do backend:

```typescript
// Exemplo: Criar transação
import { transacaoService } from './services/transacaoService';

const novaTransacao = {
  valor: 150.50,
  data: '2026-01-07',
  categoriaUid: 'uuid-da-categoria',
  descricao: 'Compra no supermercado',
  cartaoUid: 'uuid-do-cartao' // opcional
};

await transacaoService.criar(novaTransacao);
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
REACT_APP_API_URL=http://localhost:8080
```

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `build/`.

## 🎯 Próximas Funcionalidades

- [ ] Gráficos de evolução de gastos
- [ ] Filtros avançados nas transações
- [ ] Exportação de relatórios
- [ ] Dark mode
- [ ] Notificações toast
- [ ] Gestão de tags
- [ ] Gestão de recorrências
- [ ] Visualização de compras parceladas
- [ ] Top 5 gastos com gráficos

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se de que o backend tem CORS habilitado para `http://localhost:3000`

### Token inválido/expirado
Faça logout e login novamente. O token é renovado a cada login.

### Erro ao importar CSV
Verifique se o formato do CSV está correto:
```csv
Data,Descricao,Valor,Categoria
2026-01-07,Supermercado,150.50,Alimentação
```

## 📱 Responsividade

O design é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto.

## 👨‍💻 Autor

Desenvolvido com ❤️ para controle financeiro pessoal.

---

**Dica:** Para uma melhor experiência, use o frontend junto com o backend rodando em paralelo!

# controle_de_gastos_frontend

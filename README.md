# 💰 Sistema Financeiro - POUPE AGORA

Um sistema completo de gestão financeira pessoal desenvolvido com React, TypeScript e Firebase.

## 🚀 Funcionalidades

- **📊 Dashboard**: Visualização de receitas, despesas e saldo
- **💳 Transações**: Gerenciamento completo de receitas e despesas
- **📂 Categorias**: Organização por categorias personalizáveis
- **⏰ Lembretes**: Sistema de lembretes para contas e compromissos
- **📈 Relatórios**: Relatórios detalhados e gráficos
- **👤 Perfil**: Gerenciamento de perfil do usuário
- **🔐 Autenticação**: Login com email/senha e Google
- **📱 Responsivo**: Interface adaptável para mobile e desktop

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Autenticação**: Firebase Auth (Email/Senha + Google)
- **Banco de Dados**: Firestore (NoSQL)
- **Deploy**: Vercel/Netlify (recomendado)

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/apoloodev/Sistema-financeiro.git
cd Sistema-financeiro
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Senha e Google)
   - Crie um banco Firestore
   - Configure as regras de segurança
   - Copie as credenciais para `.env.local`

4. **Configure as variáveis de ambiente**
```bash
cp env.firebase.example .env.local
# Edite .env.local com suas credenciais do Firebase
```

5. **Execute o projeto**
```bash
npm run dev
```

## 🔧 Configuração do Firebase

### 1. Criar Projeto
- Acesse [Firebase Console](https://console.firebase.google.com/)
- Clique em "Adicionar projeto"
- Digite o nome: "Sistema Financeiro"
- Siga os passos de configuração

### 2. Configurar Authentication
- No menu lateral, clique em "Authentication"
- Clique em "Get started"
- Em "Sign-in method", ative:
  - Email/Password
  - Google

### 3. Configurar Firestore
- No menu lateral, clique em "Firestore Database"
- Clique em "Create database"
- Escolha "Start in test mode"
- Selecione a região mais próxima

### 4. Configurar Índices
Crie os seguintes índices compostos no Firestore:

**Coleção: transacoes**
- userid (Ascending) + quando (Descending)

**Coleção: Categoria**
- userid (Ascending) + created_at (Descending)

**Coleção: Lembretes**
- userid (Ascending) + data (Ascending)

### 5. Obter Credenciais
- No menu lateral, clique em "Project settings"
- Role até "Your apps"
- Clique em "Add app" → "Web"
- Copie as credenciais para `.env.local`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── auth/           # Componentes de autenticação
│   ├── dashboard/      # Componentes do dashboard
│   ├── transactions/   # Componentes de transações
│   ├── categories/     # Componentes de categorias
│   ├── reminders/      # Componentes de lembretes
│   └── ui/            # Componentes de UI (shadcn/ui)
├── hooks/              # Custom hooks
├── integrations/       # Integrações externas
│   └── firebase/      # Configuração e serviços do Firebase
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

## 📱 Funcionalidades Principais

### Dashboard
- Resumo financeiro mensal
- Gráficos de receitas vs despesas
- Lembretes próximos
- Dicas financeiras

### Transações
- Adicionar receitas e despesas
- Editar transações existentes
- Deletar transações
- Filtros por categoria, tipo e data
- Busca por estabelecimento

### Categorias
- Criar categorias personalizadas
- Editar categorias existentes
- Deletar categorias
- Tags para organização

### Lembretes
- Criar lembretes de contas
- Definir valores e datas
- Visualizar próximos vencimentos
- Marcar como pagos

### Relatórios
- Relatórios mensais/anuais
- Exportação em PDF
- Gráficos detalhados
- Análise de gastos por categoria

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Apolo Dev**
- GitHub: [@apoloodev](https://github.com/apoloodev)
- LinkedIn: [Apolo Dev](https://linkedin.com/in/apoloodev)

## 🙏 Agradecimentos

- [Shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Firebase](https://firebase.google.com/) - Backend e autenticação
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://reactjs.org/) - Framework frontend
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

🚀 **Deploy Status**: Configurado para Vercel com configurações padrão

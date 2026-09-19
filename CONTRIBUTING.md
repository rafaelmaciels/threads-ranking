# Guia de Contribuição — Threads Ranking 🤝

Agradecemos o seu interesse em contribuir para o **Threads Ranking**! Este documento fornece todas as diretrizes e instruções necessárias para configurar o ambiente de desenvolvimento, submeter melhorias e garantir a qualidade do código.

---

## 🛠️ Como Configurar o Ambiente de Desenvolvimento

### Pré-requisitos
- **Node.js**: versão 20.x ou 22.x LTS instalada.
- **Git**: instalado e configurado em seu computador.
- **Docker & Docker Compose** *(opcional)*: para executar o banco de dados PostgreSQL e o Redis localmente.

### 1. Clonando o Repositório
```bash
git clone https://github.com/rafaelmaciels/threads-ranking.git
cd threads-ranking
```

### 2. Instalando as Dependências
```bash
npm install
```

### 3. Configurando as Variáveis de Ambiente
Copie o arquivo de exemplo para seu ambiente local:
```bash
cp .env.example .env.local
```

> **Dica**: O projeto vem configurado por padrão com `THREADS_PROVIDER=mock`, permitindo que você desenvolva e teste toda a interface e lógica de ordenação imediatamente, sem necessidade de credenciais de APIs externas.

### 4. Gerando os Tipos do Prisma
```bash
npx prisma generate
```

### 5. Iniciando o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` em seu navegador.

---

## 🌿 Fluxo de Branches

1. Certifique-se de que sua branch `main` local esteja atualizada:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Crie uma branch com nome descritivo para sua alteração:
   - `feat/nome-da-funcionalidade` para novos recursos.
   - `fix/correcao-de-bug` para resolução de problemas.
   - `docs/atualizacao-documentacao` para textos e guias.
   - `test/novos-testes` para cobertura de testes.

```bash
git checkout -b feat/exportar-ranking-csv
```

---

## 📝 Padrão de Commits

Utilizamos o padrão **Conventional Commits** para manter o histórico do repositório organizado e facilitar a geração de changelogs semânticos:

- `feat:` Nova funcionalidade para o usuário.
- `fix:` Correção de bug.
- `docs:` Alterações exclusivas na documentação.
- `style:` Formatação, ponto e vírgula, espaços (sem alteração de código).
- `refactor:` Refatoração de código sem alteração de comportamento público.
- `test:` Adição ou refatoração de testes.
- `chore:` Tarefas de manutenção, dependências ou configuração de build.

*Exemplo:*
```bash
git commit -m "feat: add export ranking button to profile view"
```

---

## 🧪 Como Executar Testes e Validações

Antes de abrir um Pull Request, certifique-se de que todas as validações passam localmente:

1. **Checagem estrita de tipos TypeScript:**
   ```bash
   npm run type-check
   ```
2. **Suíte de testes automatizados com Vitest:**
   ```bash
   npm test
   ```
3. **Validação de build de produção:**
   ```bash
   npm run build
   ```

---

## 📬 Como Abrir uma Issue

- Verifique se a sua dúvida, bug ou sugestão já não foi reportada anteriormente na aba [Issues](https://github.com/rafaelmaciels/threads-ranking/issues).
- Utilize os templates oficiais de **Bug Report** ou **Feature Request**.
- Forneça detalhes suficientes, passos para reproduzir e ambiente operacional.

---

## 🚀 Como Enviar um Pull Request (PR)

1. Envie suas alterações para seu fork ou branch remota:
   ```bash
   git push origin feat/minha-melhoria
   ```
2. Acesse o repositório no GitHub e clique em **New Pull Request**.
3. Preencha a descrição do PR explicando o que foi feito, o motivo e como testar.
4. Aguarde a validação do pipeline de CI no GitHub Actions.
5. Participe da revisão de código até a aprovação e merge.

Muito obrigado por ajudar a construir um ecossistema mais aberto e transparente para o Threads!

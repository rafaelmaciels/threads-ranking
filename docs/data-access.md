# Acesso a Dados e Limitações da API do Threads

Este documento detalha as características técnicas, permissões, rate limits e limitações de obtenção de dados da plataforma Threads (Meta), fundamentando a decisão arquitetural do projeto **Threads Ranking**.

---

## 1. O que a API Oficial Permite

A API Oficial do Threads (`graph.threads.net/v1.0`), disponibilizada através da plataforma **Meta for Developers**, suporta:

1. **Autenticação OAuth 2.0:**
   - Permite que um usuário faça login com sua conta do Threads e autorize permissões específicas.
2. **Gerenciamento de Conteúdo do Próprio Usuário:**
   - Publicação de posts em texto, imagem e vídeo (`threads_content_publish`).
   - Consulta e moderação de comentários/respostas (`threads_read_replies`, `threads_manage_replies`).
3. **Métricas Próprias (Insights):**
   - Através do escopo `threads_manage_insights`, o dono da conta pode ler:
     - `views` (visualizações)
     - `likes` (curtidas)
     - `replies` (respostas)
     - `reposts` (republicações)
     - `quotes` (citações)
     - `shares` (compartilhamentos)
   - **Nota de Escopo:** Essas métricas são retornadas **apenas** para posts pertencentes ao usuário autenticado (`app-scoped user`).

---

## 2. O que a API Oficial NÃO Permite (Bloqueios e Restrições)

1. **Obtenção de Curtidas de Perfis de Terceiros:**
   - O endpoint de leitura de posts de terceiros (`/profile_posts`) **não fornece o campo de curtidas** (`like_count`).
   - O endpoint de métricas (`/{media-id}/insights`) recusa chamadas para posts que não pertençam ao usuário autenticado, retornando:
     ```text
     OAuthException: (#100) Only available for media objects created by the app-scoped user.
     ```
2. **Pesquisa Aberta e Irrestrita:**
   - O escopo `threads_profile_discovery` exige aprovação em **App Review** com caso de uso demonstrado (ex: análise de concorrência corporativa).
   - Em modo de teste ("Standard Access"), a Meta só permite consultar contas institucionais autorizadas (`@meta`, `@threads`, etc.).
   - Apenas perfis com **100 seguidores ou mais** são retornados.
3. **Limites de Requisição (Rate Limits):**
   - O escopo `threads_profile_discovery` impõe teto de **1.000 requisições por usuário por janela deslizante de 24 horas**.

---

## 3. Dados Disponíveis por Tipo de Provedor

| Funcionalidade | `MockThreadsProvider` | `OfficialThreadsProvider` | `ExternalThreadsProvider` |
| :--- | :--- | :--- | :--- |
| **Ambiente** | Desenvolvimento local e testes | Produção (usuário autenticado) | Produção (perfis públicos gerais) |
| **Necessita API Key?** | Não (100% autônomo) | Sim (Meta App Credentials) | Sim (Key do provedor externo) |
| **Perfil Próprio (Likes)** | Sim (Simulado) | **Sim (Suporte nativo oficial)** | Sim |
| **Perfil de Terceiros (Likes)** | Sim (Simulado) | **Não suportado pela Meta** | **Sim (Dados públicos consolidados)** |
| **Cálculo de Crescimento** | Sim | Sim (para conta própria) | Sim (com snapshots periódicos) |

---

## 4. Política de Conformidade (Compliance)

O **Threads Ranking** é desenvolvido com respeito integral aos termos de uso da Meta e legislações vigentes:
- Não são utilizadas técnicas evasivas de contorno a CAPTCHAs, botnets ou credenciais falsificadas.
- O software desacopla os provedores para que o operador do sistema escolha a fonte legítima de dados de acordo com sua jurisdição e plano de dados.
- O projeto inclui mecanismos de exclusão sob solicitação para perfis que não desejem constar no índice público.

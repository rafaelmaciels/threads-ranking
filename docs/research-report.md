# Relatório Técnico de Pesquisa e Viabilidade — Threads Ranking

**Projeto:** Threads Ranking  
**Fase:** Etapa 1 — Pesquisa e Validação Técnica  
**Data:** 19 de Setembro de 2026  
**Status:** Concluído — Aguardando aprovação para Etapa 2  

---

## 1. Visão Geral e Contexto do Projeto

O **Threads Ranking** é uma aplicação web *open source* inspirada conceitualmente no clássico *Favstars*. A proposta central consiste em permitir a busca por qualquer perfil público da rede social Threads (Meta) e apresentar suas publicações ordenadas por engajamento — primordialmente pelo número de curtidas (likes), do maior para o menor (`ORDER BY like_count DESC`), além de viabilizar filtros adicionais (mais comentados, mais repostados, mais citados, crescimento de engajamento ao longo do tempo).

Para que o projeto atinja nível de arquitetura sênior e conformidade com os termos da Meta, esta primeira etapa investigou em profundidade a viabilidade técnica de obtenção desses dados através da API oficial da Meta e de serviços de dados públicos de terceiros.

---

## 2. Análise Detalhada da API Oficial da Meta / Threads

### 2.1 Infraestrutura e Autenticação

* **URL Base Oficial:** `https://graph.threads.net/v1.0/`
* **Protocolo de Autenticação:** OAuth 2.0.
* **Mecanismo de Handshake de Tokens:**
  1. **Redirecionamento do Usuário:** O usuário é encaminhado para a tela de autorização da Meta:
     ```http
     https://threads.net/oauth/authorize?client_id={app-id}&redirect_uri={redirect-uri}&scope=threads_basic,threads_manage_insights&response_type=code
     ```
  2. **Obtenção do Short-Lived Token (Duração: 1 hora):**
     ```http
     POST https://graph.threads.net/oauth/access_token
     Content-Type: application/x-www-form-urlencoded

     client_id={app-id}&client_secret={app-secret}&grant_type=authorization_code&redirect_uri={redirect-uri}&code={code}
     ```
     *Retorno:* JSON contendo `access_token` e `user_id`.
  3. **Troca por Long-Lived Token (Duração: 60 dias):**
     ```http
     GET https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret={app-secret}&access_token={short-lived-token}
     ```
  4. **Renovação Automática (Refresh Token):**
     Antes da expiração dos 60 dias, o token pode ser renovado sem nova intervenção manual:
     ```http
     GET https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token={long-lived-token}
     ```

---

### 2.2 Escopos e Permissões Oficiais (Scopes)

| Escopo / Permissão | Finalidade Oficial | Exige App Review? |
| :--- | :--- | :--- |
| `threads_basic` | Obrigatória para qualquer requisição à Graph API do Threads. Permite ler informações cadastrais da conta autenticada (`id`, `username`, `name`, `threads_profile_picture_url`, `threads_biography`). | Sim (para produção) |
| `threads_content_publish` | Criação de containers de mídia e publicação programática de posts. | Sim |
| `threads_read_replies` | Leitura de comentários/respostas recebidas nos posts da conta. | Sim |
| `threads_manage_replies` | Moderação de comentários (ocultar/desocultar respostas). | Sim |
| `threads_manage_insights` | Leitura de métricas e analytics de posts e da conta. | Sim |
| `threads_profile_discovery` | Leitura de perfis públicos e posts de **outros usuários** (terceiros) para análise de concorrência. | **Sim (Estrita)** |

---

### 2.3 Endpoints Oficiais e Campos Retornados

#### 1. Perfil do Usuário Autenticado
* **Endpoint:** `GET https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography`
* **Permissão:** `threads_basic`

#### 2. Posts do Usuário Autenticado
* **Endpoint:** `GET https://graph.threads.net/v1.0/me/threads?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,is_quote_post,has_replies`
* **Permissão:** `threads_basic`
* **Paginação:** Utiliza cursores `paging.cursors.after` e `paging.next`.

#### 3. Métricas e Insights de Post
* **Endpoint:** `GET https://graph.threads.net/v1.0/{threads-media-id}/insights?metric=views,likes,replies,reposts,quotes,shares`
* **Permissão:** `threads_basic,threads_manage_insights`
* **Métricas Retornadas:**
  * `views`: Impressões/visualizações do post.
  * `likes`: Total de curtidas registradas no post.
  * `replies`: Respostas diretas ao post.
  * `reposts`: Total de reposts.
  * `quotes`: Total de citações de outros posts.
  * `shares`: Total de compartilhamentos.
* **⚠️ Restrição Crítica da Meta:** Este endpoint é restrito exclusivamente a mídias pertencentes ao próprio usuário autenticado (`app-scoped user`). Chamar este endpoint para IDs de mídias de outros usuários retorna erro de autorização (`OAuthException: (#100) Only available for media objects created by the app-scoped user`).

#### 4. Consulta a Perfis de Terceiros (`threads_profile_discovery`)
* **Endpoints:**
  * `GET https://graph.threads.net/v1.0/profile_lookup?username={username}`
  * `GET https://graph.threads.net/v1.0/profile_posts?username={username}`
* **Campos Retornados do Post:** `id`, `media_product_type`, `media_type`, `permalink`, `owner`, `username`, `text`, `timestamp`, `shortcode`, `is_quote_post`.
* **⚠️ Restrições Oficiais Documentadas:**
  1. O endpoint `profile_posts` **NÃO expõe o campo `likes` ou `like_count`**.
  2. A Meta exige submissão a App Review formal com gravação de vídeo demonstrando caso de uso restrito a análise concorrencial legítima.
  3. No modo de desenvolvimento ("Standard Access"), a API aceita consultas unicamente a perfis institucionais da Meta (`@meta`, `@threads`, `@instagram`).
  4. Só retorna contas públicas que tenham pelo menos **100 seguidores**.
  5. Rate limit restrito a **1.000 requisições por usuário por período deslizante de 24 horas**.

---

## 3. Avaliação de Viabilidade do "Threads Ranking"

### 3.1 Pipeline de Consulta Desejado

```text
@username
   ↓
Identificação do perfil público
   ↓
Listagem dos posts
   ↓
Métricas de cada post (likes)
   ↓
ORDER BY likes DESC
```

### 3.2 Diagnóstico Técnico por Cenário

#### Cenário 1: O Dono da Conta Loga no Threads Ranking (Self-Profile Analytics)
* **Status:** **100% VIÁVEL pela API Oficial.**
* O usuário autoriza a aplicação via OAuth concedendo `threads_basic` e `threads_manage_insights`.
* O sistema consome `GET /me/threads`, itera sobre os posts, consulta `GET /{media-id}/insights?metric=likes` e persiste os snapshots para ordenar por likes no banco.

#### Cenário 2: Consulta Pública Arbitrária (Estilo Favstars: Qualquer Visitante Digita `@qualquer_um`)
* **Status:** **BLOQUEADO pela API Oficial da Meta.**
* **Etapa exata do bloqueio:** `Métricas de cada post (likes)`.
* **Motivo Técnico:**
  1. A Meta não fornece o campo `like_count` no endpoint `GET /profile_posts`.
  2. O endpoint `GET /{media-id}/insights` rejeita posts cujo autor seja diferente da conta associada ao access token.
  3. O escopo `threads_profile_discovery` foi planejado como ferramenta de auditoria pontual e análise competitiva, não como feed público aberto com métricas completas de engajamento.

---

## 4. Análise de Provedores de Dados Públicos de Terceiros

Diante da restrição da API oficial para leitura pública não autenticada de curtidas, torna-se mandatório suportar provedores de dados externos. Foi realizado o levantamento de três alternativas do mercado:

| Critério | EnsembleData | SocialFetch | RapidAPI Marketplace (ex: ScrapeCreators) |
| :--- | :--- | :--- | :--- |
| **Arquitetura** | API estruturada especializada em dados sociais | API unificada multi-rede (Threads, TikTok, X) | Marketplace de scrapers e endpoints independentes |
| **Autenticação** | Token via Header (`x-api-key`) ou Query Param | API Key via Header (`Authorization: Bearer <key>`) | Header `X-RapidAPI-Key` |
| **Endpoints Principais** | `/threads/user/info`<br>`/threads/user/posts`<br>`/threads/post/info` | `/threads/profile`<br>`/threads/posts`<br>`/threads/post-details` | Variável conforme autor do endpoint |
| **Métricas Disponibilizadas** | `like_count`, `reply_count`, `repost_count`, `quote_count` | `like_count`, `reply_count`, `repost_count` | Variável (`like_count` frequentemente disponível) |
| **Paginação** | Suporte a cursor/token (`max_id`) | Suporte a cursor e número de página | Cursor ou offset |
| **Modelo de Custos** | Unidades diárias: Free (50 u/dia). Planos a partir de **US$ 100/mês** (1.500 u/dia) até US$ 1.400/mês. | Freemium / Pay-per-result (sem mensalidade obrigatória alta; créditos sob demanda). | Assinatura mensal fixa por API (US$ 10 a US$ 80/mês) ou por requisição. |
| **Estabilidade & SLA** | Média-Alta (infraestrutura de proxies dedicados). | Média-Alta (esquema JSON normalizado). | Baixa a Média (risco de abandono pelo desenvolvedor). |
| **Riscos Técnicos** | Serviços de terceiros que dependem de engenharia reversa podem sofrer oscilações caso a Meta altere proteções anti-bot. | Dependência de infraestrutura externa e latência de rede adicional. | Altíssima fragmentação e falta de garantia contratual contínua. |
| **Recomendação de Adoção** | Excelente para operações corporativas com volume estável. | **Altamente recomendado para início, projetos open source e modo pay-as-you-go.** | Apropriado apenas para testes pontuais. |

---

## 5. Decisão Arquitetural: Adapter & Strategy Pattern

Para assegurar **zero lock-in**, testabilidade e independência do restante da aplicação, foi desenhada uma camada de abstração pura.

### 5.1 Interface Agnóstica do Domínio

```typescript
export interface ThreadsProfile {
  id: string;
  username: string;
  name?: string;
  biography?: string;
  profilePictureUrl?: string;
  isVerified?: boolean;
}

export interface ThreadsPostMetrics {
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
}

export interface ThreadsPost {
  id: string;
  profileId: string;
  text?: string;
  permalink: string;
  publishedAt: Date;
  metrics: ThreadsPostMetrics;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface GetPostsOptions {
  cursor?: string;
  limit?: number;
}

export interface ThreadsDataProvider {
  readonly providerName: string;
  getProfile(username: string): Promise<ThreadsProfile>;
  getPosts(profileId: string, options?: GetPostsOptions): Promise<PaginatedResult<ThreadsPost>>;
  getPostMetrics(postId: string): Promise<ThreadsPostMetrics>;
}
```

### 5.2 Estratégia de Provedores

1. **`MockThreadsProvider`:**
   * Provedor em memória com dados determinísticos realistas (perfis como `@demo`, `@zuck`, `@ranking_test`).
   * Permite que qualquer desenvolvedor clone o repositório e execute todo o sistema imediatamente com `THREADS_PROVIDER=mock`, sem necessidade de chaves de API pagas ou credenciais da Meta.
2. **`OfficialThreadsProvider`:**
   * Integração oficial com `graph.threads.net`.
   * Suporta sincronização completa da conta do usuário autenticado.
   * Lança exceção tipada `UnsupportedCapabilityError` caso seja requisitado ranking de curtidas de terceiros não autenticados, prevenindo falhas silenciosas e esclarecendo os motivos ao usuário.
3. **`ExternalThreadsProvider`:**
   * Adaptador HTTP desacoplado para provedores de dados públicos estruturados.
   * Implementa retries com *exponential backoff*, circuit breaker e conversão para as entidades de domínio internas.

---

## 6. Fluxo de Execução e Ciclo de Dados

```text
                  ┌─────────────────────────────────────┐
                  │          Usuário / Browser          │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Next.js Route / Server Action    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │         ProfileSyncService          │
                  └──────┬───────────────────────┬──────┘
                         │                       │
           (Cache Check) │                       │ (Fetch & Sync)
                         ▼                       ▼
                  ┌──────────────┐      ┌─────────────────────────┐
                  │  Redis Cache │      │   ThreadsDataProvider   │
                  └──────────────┘      └────────────┬────────────┘
                                                     │
                             ┌───────────────────────┼───────────────────────┐
                             │                       │                       │
                             ▼                       ▼                       ▼
                     ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
                     │ MockProvider  │       │OfficialProvider│      │ExternalProvider│
                     └───────────────┘       └───────────────┘       └───────────────┘
                                                     │
                                                     ▼
                                        Dados Normalizados (Domain)
                                                     │
                                                     ▼
                                        ┌─────────────────────────┐
                                        │   PostgreSQL (Prisma)   │
                                        │  - profiles             │
                                        │  - posts                │
                                        │  - post_metric_snapshots│
                                        └────────────┬────────────┘
                                                     │
                                                     ▼
                                        ┌─────────────────────────┐
                                        │     RankingService      │
                                        │  ORDER BY like_count DESC
                                        └─────────────────────────┘
```

---

## 7. Escolha da Licença Open Source

| Licença | Permissividade | Proteção de Patentes | Copyleft (Derivados) | Recomendação para o Projeto |
| :--- | :--- | :--- | :--- | :--- |
| **MIT** | Altíssima (uso irrestrito) | Neutro | Não (código derivado pode ser fechado) | **Recomendada** — Máxima facilidade de adoção, contribuição comunitária e integração por desenvolvedores. |
| **Apache-2.0** | Alta | Concessão expressa de patentes | Não | Excelente para projetos que necessitam de blindagem formal de patentes. |
| **GNU GPL-3.0** | Média | Expressa | Sim (obriga derivados a serem GPL-3.0) | Desaconselhada se o objetivo for permitir que a comunidade integre o módulo de ranking em outras aplicações livremente. |

**Veredito:** Recomenda-se a adoção da licença **MIT** no repositório. A decisão final permanece a critério do mantenedor.

---

## 8. Fontes Oficiais Consultadas

1. **Meta for Developers — Threads API Reference & Overview:**  
   [https://developers.facebook.com/docs/threads](https://developers.facebook.com/docs/threads)
2. **Meta for Developers — Get Started with Threads API & Permissions:**  
   [https://developers.facebook.com/docs/threads/get-started](https://developers.facebook.com/docs/threads/get-started)
3. **Meta for Developers — Threads Insights API:**  
   [https://developers.facebook.com/docs/threads/insights](https://developers.facebook.com/docs/threads/insights)
4. **Meta for Developers — Profile Discovery & Public Posts:**  
   [https://developers.facebook.com/docs/threads/threads-profiles](https://developers.facebook.com/docs/threads/threads-profiles)
5. **EnsembleData API Documentation & Pricing:**  
   [https://ensembledata.com/apis](https://ensembledata.com/apis)
6. **SocialFetch Unified Social Media API Documentation:**  
   [https://docs.socialfetch.dev](https://docs.socialfetch.dev)

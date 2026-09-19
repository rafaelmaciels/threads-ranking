# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Planned
- **Busca por Kibe (Detecção de Conteúdo Semelhante):** Sistema conceitual para identificação transparente de possíveis publicações copiadas ou altamente semelhantes, comparando textos, datas e métricas de similaridade via processamento de linguagem natural e análise temporal, respeitando integralmente as regras e termos de uso da plataforma.
- **Expansão do Hub Trending:** Descoberta de tópicos em alta e perfis com crescimento acelerado na comunidade brasileira e internacional.
- **Exportação de Relatórios:** Exportação do ranking em formatos CSV e JSON para criadores de conteúdo e pesquisadores.

---

## [0.1.0] - 2026-09-19

### Added
- **Mecanismo de Busca e Indexação Pública:**
  - Consulta de qualquer perfil público do Threads sem necessidade de login prévio.
  - Extração nativa de dados oficiais do Threads (biografia autêntica, contagem real de seguidores e avatar em alta resolução).
  - Coleta direta via web scraping ético e integração com provedor mock para desenvolvimento offline.
- **Ranking Histórico Multimétricas:**
  - Classificação por publicações mais curtidas (*Likes*).
  - Classificação por discussões mais engajadas (*Replies/Comentários*).
  - Classificação por conteúdo mais compartilhado (*Reposts*).
  - Classificação por citações na rede (*Quotes*).
  - Linha do tempo cronológica com posts mais recentes (*Recent*).
  - Algoritmo de velocidade de engajamento acumulado por hora (*Growth Rate*).
- **Arquitetura de Resiliência & Performance:**
  - Cache multinível com Redis e fallback em memória ultrarrápido.
  - Circuit Breaker inteligente contra indisponibilidade do banco de dados local.
  - Proxy seguro de primeira parte para entrega de imagens de avatar da CDN da Meta sem bloqueios de CORS ou Referer (`/api/proxy/avatar`).
- **Arquitetura SEO Completa:**
  - Server-Side Rendering (SSR) entregando 100% dos dados no primeiro payload HTML.
  - Canonicals estritas em todas as rotas públicas.
  - Tratamento estrito de 404 para perfis inexistentes (prevenção de Soft 404).
  - Proteção contra *thin content* desativando indexação em contas vazias.
  - Dados estruturados Schema.org em formato JSON-LD (`ProfilePage`, `Person`, `SocialMediaPosting`, `WebSite`, `BreadcrumbList`, `FAQPage`).
  - Páginas institucionais de autoridade: `/sobre`, `/como-funciona`, `/metodologia`, `/faq` e `/trending`.
  - Geração dinâmica de `sitemap.xml` e `robots.txt`.
  - Integração com Google Analytics 4 via utilitário tipado (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- **Footer Institucional:**
  - Rodapé discreto em todas as páginas públicas com crédito: *"Desenvolvido por [Rafael Maciel](https://rafaelmaciel.net/)"*.
- **Infraestrutura & Qualidade:**
  - Docker Compose para orquestração de serviços locais (PostgreSQL 16 e Redis Alpine).
  - Suíte automatizada com 21 testes unitários em Vitest passando com 100% de sucesso.
  - Verificação estrita de tipagem TypeScript com zero erros.
  - Pipeline de Integração Contínua (CI) com GitHub Actions.

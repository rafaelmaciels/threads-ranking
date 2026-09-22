# Changelog

Todas as mudanÃ§as notÃ¡veis deste projeto serÃ£o documentadas neste arquivo.

O formato Ã© baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento SemÃ¢ntico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Planned
- **Busca por Kibe (DetecÃ§Ã£o de ConteÃºdo Semelhante):** Sistema conceitual para identificaÃ§Ã£o transparente de possÃ­veis publicaÃ§Ãµes copiadas ou altamente semelhantes, comparando textos, datas e mÃ©tricas de similaridade via processamento de linguagem natural e anÃ¡lise temporal, respeitando integralmente as regras e termos de uso da plataforma.
- **ExpansÃ£o do Hub Trending:** Descoberta de tÃ³picos em alta e perfis com crescimento acelerado na comunidade brasileira e internacional.
- **ExportaÃ§Ã£o de RelatÃ³rios:** ExportaÃ§Ã£o do ranking em formatos CSV e JSON para criadores de conteÃºdo e pesquisadores.

---

## [0.1.0] - 2026-09-19

### Added
- **Mecanismo de Busca e IndexaÃ§Ã£o PÃºblica:**
  - Consulta de qualquer perfil pÃºblico do Threads sem necessidade de login prÃ©vio.
  - ExtraÃ§Ã£o nativa de dados oficiais do Threads (biografia autÃªntica, contagem real de seguidores e avatar em alta resoluÃ§Ã£o).
  - Coleta direta via web scraping Ã©tico e integraÃ§Ã£o com provedor mock para desenvolvimento offline.
- **Ranking HistÃ³rico MultimÃ©tricas:**
  - ClassificaÃ§Ã£o por publicaÃ§Ãµes mais curtidas (*Likes*).
  - ClassificaÃ§Ã£o por discussÃµes mais engajadas (*Replies/ComentÃ¡rios*).
  - ClassificaÃ§Ã£o por conteÃºdo mais compartilhado (*Reposts*).
  - ClassificaÃ§Ã£o por citaÃ§Ãµes na rede (*Quotes*).
  - Linha do tempo cronolÃ³gica com posts mais recentes (*Recent*).
  - Algoritmo de velocidade de engajamento acumulado por hora (*Growth Rate*).
- **Arquitetura de ResiliÃªncia & Performance:**
  - Cache multinÃ­vel com Redis e fallback em memÃ³ria ultrarrÃ¡pido.
  - Circuit Breaker inteligente contra indisponibilidade do banco de dados local.
  - Proxy seguro de primeira parte para entrega de imagens de avatar da CDN da Meta sem bloqueios de CORS ou Referer (`/api/proxy/avatar`).
- **Arquitetura SEO Completa:**
  - Server-Side Rendering (SSR) entregando 100% dos dados no primeiro payload HTML.
  - Canonicals estritas em todas as rotas pÃºblicas.
  - Tratamento estrito de 404 para perfis inexistentes (prevenÃ§Ã£o de Soft 404).
  - ProteÃ§Ã£o contra *thin content* desativando indexaÃ§Ã£o em contas vazias.
  - Dados estruturados Schema.org em formato JSON-LD (`ProfilePage`, `Person`, `SocialMediaPosting`, `WebSite`, `BreadcrumbList`, `FAQPage`).
  - PÃ¡ginas institucionais de autoridade: `/sobre`, `/como-funciona`, `/metodologia`, `/faq` e `/trending`.
  - GeraÃ§Ã£o dinÃ¢mica de `sitemap.xml` e `robots.txt`.
  - IntegraÃ§Ã£o com Google Analytics 4 via utilitÃ¡rio tipado (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- **Footer Institucional:**
  - RodapÃ© discreto em todas as pÃ¡ginas pÃºblicas com crÃ©dito: *"Desenvolvido por [Rafael Maciel](https://rafaelmaciel.net/)"*.
- **Infraestrutura & Qualidade:**
  - Docker Compose para orquestraÃ§Ã£o de serviÃ§os locais (PostgreSQL 16 e Redis Alpine).
  - SuÃ­te automatizada com 21 testes unitÃ¡rios em Vitest passando com 100% de sucesso.
  - VerificaÃ§Ã£o estrita de tipagem TypeScript com zero erros.
  - Pipeline de IntegraÃ§Ã£o ContÃ­nua (CI) com GitHub Actions.

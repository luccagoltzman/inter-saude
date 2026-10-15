# InterSaúde — Landing Page

Landing page estática da **InterSaúde Distribuidora de Medicamento**: HTML, CSS e JavaScript vanilla, sem bundler. Visual farmacêutico premium (ícones 3D, tipografia Aventa, vermelho da marca) com scroll cinematográfico em seções-chave, cena **WebGL 3D real** no hero (Three.js via CDN) e camada de polimento (grain, cursor customizado, botões magnéticos, tilt 3D, glow reativo ao cursor).

Além da landing, o site inclui um **funil de conversão**: prova social, FAQ, formulário de lead qualificado (Formspree), página de agradecimento com handoff para WhatsApp, analytics e SEO técnico — ver [Setup de produção](#setup-de-produção--funil-de-conversão) antes de publicar.

---

## Setup de produção / Funil de conversão

A página já está estruturada para captar e qualificar leads, mas roda com **placeholders** que precisam ser substituídos antes de publicar. Nada quebra com os placeholders no lugar (os scripts de analytics carregam sem erro, o formulário cai no fallback de e-mail) — mas nenhum lead de verdade chega até esses itens serem resolvidos:

| Placeholder | Onde | Substituir por |
| --- | --- | --- |
| `https://formspree.io/f/XXXXXXXX` | `index.html`, atributo `action` do `#lead-form` | ID real de um formulário criado em [formspree.io](https://formspree.io) (plano free já inclui dashboard de leads, alerta por e-mail e export CSV — é o "painel" do cliente, sem precisar construir um painel custom exposto publicamente) |
| `G-XXXXXXXXXX` | `index.html` e `obrigado.html`, snippets GA4 | ID de medição real do Google Analytics 4 |
| `0000000000000000` | `index.html` e `obrigado.html`, snippet do Meta Pixel | ID real do Pixel (Gerenciador de Eventos da Meta) |
| `https://wa.me/5500000000000` | `#contato` e `obrigado.html` | Número real de WhatsApp comercial, formato `55DDXXXXXXXXX` |
| `contato@intersaude.com.br` | `#contato` e fallback `mailto:` no `js/main.js` | E-mail comercial real |
| `https://intersaude.com.br/` | meta tags OG/Twitter, JSON-LD, `robots.txt`, `sitemap.xml` | Domínio real de produção |
| `[Nome do cliente]` / `[Depoimento real a coletar]` | seção `#depoimentos` | Depoimentos reais — **nunca publicar um depoimento inventado como se fosse de um cliente real** |
| Endereço no JSON-LD `Organization` | `index.html`, bloco `application/ld+json` | Endereço físico real, se houver (campo não incluído por não ter dado real ainda) |

**Por que não há um painel de leads customizado:** o site é estático, sem backend. Um painel que lê leads de uma planilha/JSON público para "qualquer um ver" ficaria sem autenticação de verdade — expõe nome/telefone/e-mail sem proteção. O dashboard do Formspree entrega o mesmo resultado prático (ver os leads chegando, exportar, ser avisado por e-mail) com segurança de verdade e zero manutenção. Se no futuro fizer sentido um painel com a marca do cliente, isso é um upsell separado (ex: ler a API do Formspree com autenticação própria), não algo para expor sem login.

**Fluxo do lead:** formulário em `#contato` → POST para o Formspree (via `fetch`, com fallback automático para `mailto:` se o endpoint falhar, para o lead nunca se perder) → sucesso redireciona para `obrigado.html?nome=...&tel=...` → página de agradecimento personalizada, com CTA de WhatsApp pré-preenchido e disparo do evento de conversão (`generate_lead` / `Lead`) no destino, evitando contar o mesmo lead duas vezes.

---

## Por que a página “fica bonita”

A estética não depende de framework: depende de **hierarquia**, **ritmo de scroll** e **consistência de marca**.

| Princípio | Como foi aplicado |
|---|---|
| Marca no primeiro viewport | Hero com “InterSaúde” em escala tipográfica dominante + cápsula 3D |
| Uma ideia por seção | Cada bloco tem um título, um texto curto e um âncora visual |
| Cor dominante | Vermelho `#ff6534` (pack Red) em CTAs, glows, círculo de pílulas e painel stats |
| Atmosfera | Gradientes radiais quentes no fundo — evita “folha branca flat” |
| Movimento com propósito | Float nos renders, reveal no scroll, sticky horizontal e sticky vertical |
| Assets reais | Renders 3D de farmácia (não ícones genéricos de UI kit) |

A tipografia **Aventa** (Medium/Bold) carrega o tom editorial do clone Pharma original, recontextualizado para B2B de distribuição.

---

## Stack e estrutura

```
inter-saude/
├── index.html          # Marcação semântica + importmap do Three.js + script anti-reload-hash
├── obrigado.html       # Página de agradecimento do funil de lead (noindex)
├── robots.txt          # Libera indexação, exclui obrigado.html, aponta pro sitemap
├── sitemap.xml         # Sitemap com a home
├── css/styles.css      # Design tokens, layout, motion, responsivo, polimento (grain/cursor/tilt)
├── js/main.js          # Menu, reveal, scroll sync (diff + pills), FAQ, formulário de lead, logo, cursor/magnético/tilt/glow
├── js/hero-scene.js    # Cena WebGL (Three.js) de cápsulas 3D no hero, com fallback para PNG
├── fonts/              # Aventa-Medium.otf, Aventa-Bold.otf
├── images/             # Logo, favicon, renders 3D, preview/
└── README.md
```

| Camada | Papel |
|---|---|
| `index.html` | Seções âncora (`#sobre`, `#diferenciais`, `#portfolio`, `#contato`, `#cores`) |
| `css/styles.css` | Tokens CSS (`:root`), sticky/pin, grids, filtros de cor nos PNGs, polimento visual |
| `js/main.js` | Estado do menu, `IntersectionObserver`, `translate3d` ligado ao scroll, cursor/magnético/tilt/glow |
| `js/hero-scene.js` | Cena Three.js independente (ES module), com gate de capacidade e fallback |

Sem dependências npm obrigatórias — qualquer servidor estático serve. A única dependência externa é o **Three.js via CDN** (jsDelivr, versão fixada `0.169.0`, carregado por importmap), usado só no hero; se a CDN ou o WebGL não estiverem disponíveis, o hero cai automaticamente no PNG original (`images/pills.png`), sem erro visível.

**Importante:** como `js/hero-scene.js` é um ES module com importmap, ele só funciona servido via `http://`/`https://` — abrir `index.html` direto com `file://` não carrega a cena 3D (o resto da página funciona normalmente, cai no fallback).

---

## Como rodar

```bash
# Opção 1 — abrir direto
# abra index.html no navegador

# Opção 2 — servidor local (recomendado para hash/âncoras)
npx serve .
# ou Live Server / Python: python -m http.server 5500
```

---

## Arquitetura das seções

### 1. Header
- Fixo, com blur ao scroll (`.header.scrolled`).
- Logo PNG transparente (`images/logo.png`) + fallback tipográfico se a imagem falhar.
- Nav desktop; menu full-screen no mobile (`#mobile-nav` + atributo `hidden` respeitado via CSS).

### 2. Hero
- Grid 2 colunas: copy à esquerda, arte 3D à direita (sem corte por `overflow`/`right` negativo).
- Glow radial vermelho atrás da arte.
- **Cena WebGL (`js/hero-scene.js`)**: 5–9 cápsulas 3D (`THREE.CapsuleGeometry`) em vermelho/creme da marca, material PBR com clearcoat, luz de 3 pontos + ambiente procedural (`RoomEnvironment`, sem HDRI externo), bloom sutil (`UnrealBloomPass`). Rotação/float contínuos, parallax de mouse (lerp) e fade ao sair da viewport; pausa real do `requestAnimationFrame` fora da tela ou com a aba oculta.
- **Fallback**: se não houver WebGL, em `prefers-reduced-motion` o visual fica estático (sem animação) mas continua 3D; em mobile/ponteiro grosseiro ou se a CDN falhar, volta para `pills.png` com o tratamento `hue-rotate` + `floatY` original.

### 3. Sobre (`#sobre`)
- Texto + render (`toothpaste-open.png`), reveal ao entrar no viewport.

### 4. Diferenciais (`#diferenciais`) — scroll lateral
Padrão **pin + track horizontal**:

1. `.diff-pin` tem altura `~320vh` (espaço de scroll vertical).
2. `.diff-sticky` fica `position: sticky; top: 0; height: 100vh`.
3. Enquanto o usuário rola a página, o JS mapeia o progresso do pin em `translate3d(X)` na `.diff-track`.
4. Cada `.diff-row` recebe `.is-visible` e entra **da direita** (`translateX(72px)` → `0`).
5. Dots em `#diff-dots` acompanham o painel ativo.

Padding extra no último card evita texto colado na borda direita.

### 5. Stats (bloco escuro + laranja)
- Grid stretch: texto à esquerda, painel `var(--red)` à direita em **100% da altura** da seção.
- `bottle-with-pills.png` com `object-fit: cover` + cápsula/tampa flutuantes.

### 6. Portfólio (`#portfolio`)
- Grade de previews 3D; hover com leve elevação.
- Mesmo `hue-rotate` para unificar a paleta Red.

### 7. Depoimentos (`#depoimentos`)
- Faixa horizontal com `scroll-snap` de painéis de cor (`panel-coral` / `panel-blue` / `panel-soft`, mesma paleta do bloco Diferenciais) em vez de cards com borda — mantém a linguagem visual de blocos de cor cheios do resto da página. Um painel carrega `images/toothbrush.png` com o mesmo tratamento `hue-rotate` + `drop-shadow` usado nos outros renders.
- Placeholders explícitos (`[Nome do cliente]`, `[Depoimento real a coletar]`) — nunca publicar sem substituir por depoimentos reais.

### 8. Cores / pílulas (`#cores`) — scroll no círculo
Igual espírito do clone Pharma “customise colors”:

1. Seção alta (`.pill-scroll`).
2. Sticky com texto à esquerda + **círculo** (`.pill-scroll-circle`, `border-radius: 50%`, `overflow: hidden`).
3. Track vertical de cápsulas (`pill-blue` tintada / yellow / black) deslocada por `translateY` conforme o scroll.
4. Headlines trocam classe `.is-active` por faixa de progresso.

### 9. FAQ (`#faq`)
- Lista editorial numerada (`01`–`06`), sem card com borda/fundo — divisor é um hairline (`border-bottom`) entre itens, igual ao resto da página privilegia tipografia grande em vez de chrome de UI. `button` + `.faq-a-wrap` animado via `grid-template-rows: 0fr → 1fr` (sem medir `scrollHeight` em JS). O indicador de abrir/fechar é um `+` tipográfico (`.faq-toggle`, mesma fonte Aventa) que rotaciona 45° — não um ícone importado. JS só alterna `.is-open` e `aria-expanded` (`js/main.js`).

### 10. Contato + formulário de lead + footer
- Painel CTA com gradiente vermelho → ink.
- Formulário qualificado (`#lead-form`): nome, empresa, CNPJ, cidade/UF, tipo de estabelecimento, WhatsApp, e-mail, volume de compra, mensagem — mais um honeypot oculto (`_gotcha`) contra spam.
- Envio via `fetch` para o Formspree, com fallback automático para `mailto:` se o endpoint falhar (o lead nunca se perde) e estado de carregamento no botão.
- Sucesso redireciona para `obrigado.html?nome=...&tel=...`, que dispara o evento de conversão e oferece handoff direto pro WhatsApp comercial.
- Botão de WhatsApp direto mantido como alternativa pra quem não quer preencher formulário.
- Ver [Setup de produção](#setup-de-produção--funil-de-conversão) para os IDs/placeholders a substituir.

---

## Design system (tokens)

Definidos em `:root` (`css/styles.css`):

```css
--ink: #1e1f28;       /* texto / superfícies escuras */
--ink-soft: #3a3c4a;
--paper: #fff6f2;     /* fundo quente */
--red: #ff6534;       /* marca / CTAs / círculo / painel */
--red-deep: #ef4f1c;
--red-dark: #d63f12;
--red-soft: #ff8a5c;
--radius: 28px;
--header-h: 80px;
--ease: cubic-bezier(0.22, 1, 0.36, 1);
```

**Tint dos assets azuis → vermelho:** muitos PNGs do pack Blue recebem:

```css
filter: hue-rotate(164deg) saturate(1.15);
```

(~164° leva o azul do pack ao coral/vermelho `#ff6534`.)

---

## JavaScript — responsabilidades

Arquivo: `js/main.js`

| Módulo | Comportamento |
|---|---|
| Scroll restoration | `history.scrollRestoration = 'manual'`; no **reload**, limpa hash e volta ao topo (evita abrir em `#sobre` no mobile) |
| Header | Toggle `.scrolled` após `scrollY > 12` |
| Menu mobile | Abre/fecha `#mobile-nav`, trava `body` overflow |
| Reveal | `IntersectionObserver` → `.reveal.is-visible` |
| Logo | Se `img` carrega → `.is-ready` e esconde fallback; se erro → texto |
| Diff horizontal | Progresso do `.diff-pin` → `translateX` + `.is-visible` + dots |
| Pill circle | Progresso do `.pill-scroll` → `translateY` + headline ativa |
| FAQ | Toggle `.is-open` + `aria-expanded` por item (`.faq-a-wrap` anima via CSS) |
| Formulário de lead | `fetch` POST ao Formspree, estado de carregamento, redirect para `obrigado.html`, fallback `mailto:` se o endpoint falhar |
| `prefers-reduced-motion` | Congela transforms de scroll; revela conteúdo estático |

Há também um script **inline no `<head>`** que aplica a mesma lógica de reload/topo **antes do paint**, reduzindo flash de âncora.

---

## Identidade visual (arquivos)

| Arquivo | Uso |
|---|---|
| `images/logo.png` | Header e footer (fundo transparente) |
| `images/logo.jpg` | Fonte original (referência) |
| `images/favicon.png` | Favicon / apple-touch (logo guia, 256², transparente) |
| `images/og-image.png` | Preview social (OG/Twitter), 1200×630 — gerada via Higgsfield AI (`flux_2`), não parte do pack Pharma original |
| `fonts/Aventa-*.otf` | Display e corpo |

---

## Responsividade

Breakpoints principais em `styles.css`:

- **≤1024px** — grids viram coluna; cards do diff empilham imagem/texto; stats empilha.
- **≤768px** — nav some, menu hambúrguer; tipografia do hero reduz; pill-scroll e diff-pin com alturas ajustadas.

O menu mobile usa `[hidden] { display: none !important }` para o `display: flex` do overlay não sobrescrever o atributo nativo.

---

## Acessibilidade e performance

- Landmarks (`header`, `main`, `nav`, `footer`), `aria-label` / `aria-expanded` no menu.
- Imagens decorativas com `alt=""` e `aria-hidden` onde faz sentido.
- `font-display: swap` nos `@font-face`.
- Animações respeitam `prefers-reduced-motion`.
- Transforms em GPU (`translate3d`) nos tracks de scroll.

---

## Customização rápida

### Contato
Em `index.html`, seção Contato:

- `action` do `#lead-form` → ID real do Formspree
- `mailto:contato@intersaude.com.br` (aparece aqui e no fallback do `js/main.js`)
- `https://wa.me/5500000000000` (aparece aqui e em `obrigado.html`)

Checklist completo de placeholders em [Setup de produção](#setup-de-produção--funil-de-conversão).

### Cores
Altere `--red*` / `--paper` / `--ink` em `:root`. O resto da UI herda.

### Textos
Copy em português está embutido nas seções do `index.html` (hero, sobre, diff, stats, portfolio, cores, contato).

### Logo
Substitua `images/logo.png` (e `favicon.png` se quiser o mesmo símbolo na aba). O JS já trata fallback.

---

## Deploy

Qualquer host estático:

- GitHub Pages / Netlify / Vercel / S3 / IIS  
- Basta publicar a raiz do projeto (não há build step).

Checklist pós-deploy:

1. Favicon com cache-bust (`?v=2` no HTML — incremente se trocar o arquivo).
2. Testar reload no mobile (deve abrir no topo).
3. Testar scroll em Diferenciais e na seção do círculo de pílulas.
4. Validar e-mail/WhatsApp reais.

---

## Créditos de asset

Ilustrações 3D e tipografia Aventa originadas do pack visual **Pharmacy / Pharma** (Wannathis), adaptadas para a narrativa e a marca **InterSaúde** (logo oficial da distribuidora).

---

## Resumo técnico

A landing é um **documento HTML único** orquestrado por CSS sticky + JS de progresso de scroll. A “beleza” vem da combinação de:

1. tipografia display grande e controlada;
2. renders 3D com paleta unificada;
3. duas seções de storytelling por scroll (horizontal nos diferenciais, vertical no círculo);
4. contraste ink × vermelho × papel quente.

Sem SPA, sem CSS-in-JS: fácil de hospedar, auditar e evoluir.

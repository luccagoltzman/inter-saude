# InterSaúde — Landing Page

Landing page estática da **InterSaúde Distribuidora de Medicamento**: HTML, CSS e JavaScript vanilla, sem bundler. Visual farmacêutico premium (ícones 3D, tipografia Aventa, vermelho da marca) com scroll cinematográfico em seções-chave.

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
├── index.html          # Marcação semântica + script anti-reload-hash
├── css/styles.css      # Design tokens, layout, motion, responsivo
├── js/main.js          # Menu, reveal, scroll sync (diff + pills), logo
├── fonts/              # Aventa-Medium.otf, Aventa-Bold.otf
├── images/             # Logo, favicon, renders 3D, preview/
└── README.md
```

| Camada | Papel |
|---|---|
| `index.html` | Seções âncora (`#sobre`, `#diferenciais`, `#portfolio`, `#contato`, `#cores`) |
| `css/styles.css` | Tokens CSS (`:root`), sticky/pin, grids, filtros de cor nos PNGs |
| `js/main.js` | Estado do menu, `IntersectionObserver`, `translate3d` ligado ao scroll |

Sem dependências npm obrigatórias. Qualquer servidor estático serve.

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
- Grid 2 colunas: copy à esquerda, `pills.png` à direita (sem corte por `overflow`/`right` negativo).
- Glow radial vermelho atrás da arte.
- Cápsula com `hue-rotate` para alinhar ao vermelho da marca + `floatY`.

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

### 7. Cores / pílulas (`#cores`) — scroll no círculo
Igual espírito do clone Pharma “customise colors”:

1. Seção alta (`.pill-scroll`).
2. Sticky com texto à esquerda + **círculo** (`.pill-scroll-circle`, `border-radius: 50%`, `overflow: hidden`).
3. Track vertical de cápsulas (`pill-blue` tintada / yellow / black) deslocada por `translateY` conforme o scroll.
4. Headlines trocam classe `.is-active` por faixa de progresso.

### 8. Contato + footer
- Painel CTA com gradiente vermelho → ink.
- Links `mailto:` e WhatsApp (placeholders para atualizar).

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
| `prefers-reduced-motion` | Congela transforms de scroll; revela conteúdo estático |

Há também um script **inline no `<head>`** que aplica a mesma lógica de reload/topo **antes do paint**, reduzindo flash de âncora.

---

## Identidade visual (arquivos)

| Arquivo | Uso |
|---|---|
| `images/logo.png` | Header e footer (fundo transparente) |
| `images/logo.jpg` | Fonte original (referência) |
| `images/favicon.png` | Favicon / apple-touch (logo guia, 256², transparente) |
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

- `mailto:contato@intersaude.com.br`
- `https://wa.me/5500000000000`

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

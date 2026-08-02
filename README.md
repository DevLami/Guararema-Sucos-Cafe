# Guararema Sucos e Café

Site institucional de página única: sucos naturais, café e lanches, com pedidos pelo WhatsApp.

## Estrutura

```
index.html            página principal
site.webmanifest      ícones/tema (PWA)
css/                  estilos modularizados
  base.css            variáveis, reset, utilitários, acessibilidade
  layout.css          cabeçalho e rodapé
  buttons.css         botões, WhatsApp flutuante, voltar ao topo
  hero.css            hero + copo interativo
  menu.css            cardápio (abas, filtro, itens)
  sections.css        loja, parallax, como pedir, valores, CTA
  responsive.css      media queries
js/                   JavaScript em módulos ES
  main.js             ponto de entrada
  utils.js            utilitários (clamp, visibilidade, throttle)
  animations.js       revelar elementos ao rolar
  parallax.js         fundo de natureza
  hero.js             copo que enche conforme o scroll
  menu.js             cardápio (abas, teclado, filtro)
  backToTop.js        botão voltar ao topo
dados/
  cardapio.json       todo o cardápio (edite aqui para alterar itens/preços)
imagens/              logo, fotos (AVIF/WebP), favicons, copo.svg, OG
```

## Como editar o cardápio

Basta alterar `dados/cardapio.json`. Cada item aceita:
`n` (nome), `p` (preço), `d` (descrição, opcional) e `featured` (destaque, opcional).

## Como rodar

O site usa módulos ES e `fetch` (cardápio e copo), que **exigem HTTP** — não
funciona abrindo o arquivo direto (`file://`).

- **Local:** rode um servidor na pasta do projeto e acesse `http://localhost:8000`
  ```bash
  python -m http.server 8000
  ```
  (ou a extensão "Live Server" no VS Code)
- **Online:** publicado via GitHub Pages.

## Observação

As URLs absolutas de SEO (canonical, Open Graph, Schema.org) em `index.html`
apontam para o endereço do GitHub Pages. Se usar um domínio próprio, atualize-as.

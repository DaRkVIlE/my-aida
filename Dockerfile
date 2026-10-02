FROM ghcr.io/danny-avila/librechat-dev:latest

# Copia as configurações da AIDA para dentro da imagem oficial
COPY aida-config.yaml /app/librechat.yaml

# Copia o backend customizado (rotas MANA, Gamification models, manaAcquisition)
# JS puro — não precisa de etapa de build
COPY api/ /app/api/
RUN npm install traverse --no-save

# Substitui as logos da AIDA nos assets públicos e no dist pré-compilado
COPY aida-logo.svg /app/client/public/assets/logo.svg
COPY aida-logo.svg /app/client/dist/assets/logo.svg
COPY client/public/assets/aida-og.png /app/client/dist/assets/aida-og.png
COPY client/public/assets/aida-og.png /app/client/public/assets/aida-og.png

# Injeta o branding no index.html PRÉ-COMPILADO e recria o PWA Manifest
RUN node -e "\
const fs = require('fs');\
const path = '/app/client/dist/index.html';\
let html = fs.readFileSync(path, 'utf8');\
html = html.replace(/<title>.*<\/title>/, '<title>AIDA — Aprenda Inglês por Imersão Ativa</title>');\
html = html.replace(/<meta name=\"description\".*?>/, '<meta name=\"description\" content=\"AIDA — Aprenda inglês por imersão ativa com tutores de IA. Sem aulas chatas, sem gramática decorada. Conversação real desde o primeiro dia.\" />');\
html = html.replace(/assets\/favicon-32x32\.png/g, 'assets/logo.svg');\
html = html.replace(/assets\/favicon-16x16\.png/g, 'assets/logo.svg');\
html = html.replace(/assets\/apple-touch-icon-180x180\.png/g, 'assets/logo.svg');\
html = html.replace(/type=\"image\/png\"/g, 'type=\"image/svg+xml\"');\
const ogTags = '<meta property=\"og:title\" content=\"AIDA — Aprenda Inglês por Imersão Ativa\" />\\n<meta property=\"og:image\" content=\"https://aida.experiasolutions.com.br/assets/aida-og.png\" />\\n<meta property=\"og:description\" content=\"Converse com tutores de IA especializados e aprenda inglês do jeito que o cérebro foi feito para aprender — por imersão.\" />\\n<meta name=\"twitter:card\" content=\"summary_large_image\" />\\n<meta name=\"twitter:image\" content=\"https://aida.experiasolutions.com.br/assets/aida-og.png\" />\\n';\
html = html.replace('</head>', ogTags + '</head>');\
fs.writeFileSync(path, html);\
\
const manifestPath = '/app/client/dist/manifest.webmanifest';\
const manifest = {\
  name: 'AIDA',\
  short_name: 'AIDA',\
  description: 'Aprenda Inglês por Imersão Ativa',\
  start_url: './',\
  display: 'standalone',\
  background_color: '#0d0d0d',\
  theme_color: '#8b5cf6',\
  lang: 'pt-BR',\
  scope: './',\
  icons: [\
    { src: 'assets/logo.svg', sizes: '192x192', type: 'image/svg+xml' },\
    { src: 'assets/logo.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }\
  ]\
};\
fs.writeFileSync(manifestPath, JSON.stringify(manifest));\
\
const assetsDir = '/app/client/dist/assets';\
if (fs.existsSync(assetsDir)) {\
  const files = fs.readdirSync(assetsDir);\
  for (const file of files) {\
    if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json')) {\
      const filePath = assetsDir + '/' + file;\
      let content = fs.readFileSync(filePath, 'utf8');\
      content = content.replace(/https:\/\/www\.librechat\.ai/g, 'https://aida.experiasolutions.com.br');\
      content = content.replace(/https:\/\/librechat\.ai/g, 'https://aida.experiasolutions.com.br');\
      content = content.replace(/https:\/\/github\.com\/danny-avila\/LibreChat/g, 'https://experiasolutions.com.br');\
      content = content.replace(/noreply@librechat\.ai/g, 'noreply@experiasolutions.com.br');\
      content = content.replace(/contact@librechat\.ai/g, 'contato@experiasolutions.com.br');\
      content = content.replace(/\"LibreChat\"/g, '\"AIDA\"');\
      content = content.replace(/'LibreChat'/g, \"'AIDA'\");\
      content = content.replace(/\x60LibreChat\x60/g, '\x60AIDA\x60');\
      content = content.replace(/>LibreChat</g, '>AIDA<');\
      fs.writeFileSync(filePath, content);\
    }\
  }\
}\
const pkgPath = '/app/package.json';\
if (fs.existsSync(pkgPath)) {\
  let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));\
  pkg.name = 'aida-agents-hub';\
  pkg.description = 'AIDA Agents Hub — Plataforma de Imersão Ativa em Inglês com IA';\
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));\
}\
"

# Variáveis padrão e Branding AIDA
ENV HOST=0.0.0.0
ENV PORT=8080
ENV APP_TITLE=AIDA
ENV HELP_AND_FAQ_URL=https://experiasolutions.com.br
ENV CUSTOM_FOOTER="[AIDA](https://aida.experiasolutions.com.br) — Imersão Ativa em Inglês com IA"
EXPOSE 8080

CMD ["npm", "run", "backend"]

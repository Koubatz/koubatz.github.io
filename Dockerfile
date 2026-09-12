# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# deps — dependências completas (inclui devDependencies, exigidas pelo ng build)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# build — gera dist/koubatz.github.io/browser
# ---------------------------------------------------------------------------
FROM deps AS build
# O script npm usa /koubatz.github.io/ por causa do GitHub Pages; servido pelo
# Nginx na raiz do container o base href precisa ser /.
ARG BASE_HREF=/
COPY . .
RUN npx ng build --configuration production --base-href "${BASE_HREF}"

# ---------------------------------------------------------------------------
# lyrics-server — API Express de letras
# ---------------------------------------------------------------------------
FROM node:22-alpine AS lyrics-server
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY scripts ./scripts
USER node
EXPOSE 4300
CMD ["node", "scripts/lyrics-server.mjs"]

# ---------------------------------------------------------------------------
# web — Nginx servindo o build estático (mesmo artefato do GitHub Pages)
# ---------------------------------------------------------------------------
FROM nginx:alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/koubatz.github.io/browser /usr/share/nginx/html
EXPOSE 8080

# ---------------------------------------------------------------------------
# dev — ng serve com hot reload
# ---------------------------------------------------------------------------
FROM deps AS dev
COPY . .
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

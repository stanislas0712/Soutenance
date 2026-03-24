# ── Stage 1 : dépendances ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2 : développement ───────────────────────────────────────────────────
FROM deps AS development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Stage 3 : build production ────────────────────────────────────────────────
FROM deps AS builder

COPY . .
RUN npm run build

# ── Stage 4 : serveur production ──────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

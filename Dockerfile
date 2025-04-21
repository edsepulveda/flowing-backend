FROM node:lts-alpine AS dependencies

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./


RUN pnpm install --prod --frozen-lockfile
RUN cp -R node_modules prod_node_modules


RUN pnpm install --frozen-lockfile


FROM node:lts-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN pnpm build

FROM node:lts-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

COPY .env.example ./

RUN mkdir -p /app/logs/error /app/logs/combined /app/logs/application

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main.js"]






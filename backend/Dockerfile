FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ libc6-dev

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY backend/package.json ./backend/

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --filter backend...

COPY backend ./backend
COPY packages ./packages

WORKDIR /app/backend
RUN pnpm build

FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++ libc6-dev

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/index.js"]

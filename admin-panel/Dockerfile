FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY admin-panel/package.json ./admin-panel/
RUN pnpm install --filter admin-panel...
COPY admin-panel ./admin-panel
WORKDIR /app/admin-panel
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/admin-panel/.next/standalone ./
COPY --from=builder /app/admin-panel/.next/static ./admin-panel/.next/static
EXPOSE 3001
ENV PORT=3001
CMD ["node", "admin-panel/server.js"]

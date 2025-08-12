# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy Prisma files
COPY prisma ./prisma
RUN npx prisma generate

# Copy all other files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Environment variables (override these in docker run)
ENV NODE_ENV production
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["yarn", "start"]

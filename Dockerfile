# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install OpenSSL and other necessary build dependencies
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Copy Prisma files first
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install OpenSSL for production
RUN apk add --no-cache openssl

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
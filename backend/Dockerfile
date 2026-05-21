FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
RUN mkdir -p logs uploads
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "src/server.js"]

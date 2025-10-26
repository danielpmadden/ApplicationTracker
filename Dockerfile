# Stage 1: build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --production=false
COPY frontend/ ./
RUN npm run build

# Stage 2: production runtime
FROM node:20-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . ./
COPY --from=frontend-builder /app/frontend/dist/ ./public/
RUN npm prune --omit=dev \
  && addgroup -S app && adduser -S -G app app \
  && mkdir -p /app/tmp \
  && chown -R app:app /app \
  && chmod -R a-w /app \
  && chmod 755 /app/tmp

ENV NODE_ENV=production
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

USER app
ENV NODE_OPTIONS="--enable-source-maps"
VOLUME ["/app/tmp"]
CMD ["npm", "start"]

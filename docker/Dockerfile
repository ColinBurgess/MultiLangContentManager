# Multi-stage Dockerfile for MultiLangContentManager
# Stage 1: Build dependencies and prepare environment
FROM node:18-alpine AS base

# Install system dependencies including Python for the parser module
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    gcc \
    musl-dev \
    && ln -sf python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Stage 2: Install dependencies
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Install Python dependencies for parser
COPY parser/requirements.txt ./parser/
RUN pip3 install --no-cache-dir -r parser/requirements.txt

# Stage 3: Production image
FROM base AS runner

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /usr/lib/python3.11/site-packages /usr/lib/python3.11/site-packages

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p logs config && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 3000, path: '/api/system/routes', method: 'GET' }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["npm", "start"]
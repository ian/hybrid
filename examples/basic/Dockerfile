# Use Node.js 22 as base image (matches .node-version)
FROM node:22-slim AS base

# Install system dependencies (removed Foundry - not needed for apps/agent runtime)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy source code for all workspace packages first
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY config/ ./config/

# Install dependencies after copying source code
RUN pnpm install --no-frozen-lockfile

# Production stage
FROM node:22-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy source code for all workspace packages first
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY config/ ./config/

# Install only production dependencies, skip postinstall scripts for packages we don't need
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy source files (no build step needed - uses tsx directly)
COPY --from=base /app/apps/agent ./apps/agent
COPY --from=base /app/apps/contracts ./apps/contracts
COPY --from=base /app/packages ./packages
COPY --from=base /app/config ./config

# Set working directory to the agent app
WORKDIR /app/apps/agent

# Create non-root user for security
RUN groupadd -r agent && useradd -r -g agent agent -m
RUN chown -R agent:agent /app
RUN mkdir -p /home/agent/.local/share/pnpm && chown -R agent:agent /home/agent/.local
USER agent

# Expose port (configurable via PORT environment variable)
EXPOSE 3000

# Health check using the existing /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start the application
CMD ["pnpm", "start"]                           
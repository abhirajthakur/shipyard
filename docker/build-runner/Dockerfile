FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install required packages
RUN apk add --no-cache \
  git \
  bash \
  ca-certificates \
  tini

RUN addgroup -S runner && adduser -S runner -G runner

# Set working directory
WORKDIR /workspace

# Ensure workspace exists and owned by runner
RUN mkdir -p /workspace && chown -R runner:runner /workspace

# Drop privileges
USER runner

# Use tini as PID 1 (prevents zombie processes)
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sh"]

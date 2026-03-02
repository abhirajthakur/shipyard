FROM node:20-bookworm-slim

# Install required system dependencies
RUN apt-get update && apt-get install -y \
  git \
  bash \
  ca-certificates \
  tini \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN useradd -m -s /bin/bash runner

WORKDIR /workspace

# Prepare runner home directories
ENV PNPM_HOME="/home/runner/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN mkdir -p /workspace \
  && mkdir -p /home/runner/.local/share/pnpm \
  && chown -R runner:runner /workspace /home/runner

USER runner

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh"]

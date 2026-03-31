FROM mcr.microsoft.com/devcontainers/java:1-21-bookworm

# Node.js for Angular development
RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g npm@11 \
    && rm -rf /var/lib/apt/lists/*

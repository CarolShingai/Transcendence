# =========================================
# Dockerfile para Desenvolvimento React
# =========================================
# Suporta hot-reload e desenvolvimento rápido

FROM node:24-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta para desenvolvimento
EXPOSE 3000

# Modo desenvolvimento com hot-reload
CMD ["npm", "start"]

FROM node:20-alpine

WORKDIR /app

# Copia e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta de desenvolvimento do Next.js
EXPOSE 3000

# Executa em modo dev (com suporte a hot reload)
CMD ["npm", "run", "dev"]
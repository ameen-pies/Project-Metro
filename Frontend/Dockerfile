FROM node:20-alpine

WORKDIR /app

# Deps
COPY package.json package-lock.json* ./
RUN npm ci

# App code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

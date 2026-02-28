FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

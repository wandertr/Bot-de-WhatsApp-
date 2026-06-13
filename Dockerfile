FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de Chromium para Puppeteer
RUN apk add --no-cache udev ttf-freefont chromium

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]

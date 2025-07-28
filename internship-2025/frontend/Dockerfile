FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production=false

COPY . .

RUN npm run build

FROM nginx:alpine

# копируем собранное приложение из builder-стадии
COPY --from=builder /app/dist /usr/share/nginx/html

# копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# порт 80
EXPOSE 80

# запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

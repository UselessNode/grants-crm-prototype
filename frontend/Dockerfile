FROM node:18-alpine AS build

WORKDIR /app

# 1. Копируем и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --include=dev  # ← ВКЛЮЧАЕМ dev зависимости!

# 2. Копируем код
COPY . .

# 3. Собираем
RUN npm run build

# 4. Vite создает dist, переименовываем
RUN mv dist build 2>/dev/null || echo "dist already renamed or doesn't exist"

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
#EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

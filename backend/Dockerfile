FROM node:20-alpine

WORKDIR /app

RUN npm install -g tsx

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Create public folder
RUN mkdir -p public

EXPOSE 5000

CMD ["tsx", "src/app.ts"]

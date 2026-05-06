FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Create public folder
RUN mkdir -p public

EXPOSE 5000

CMD ["node", "server.js"]

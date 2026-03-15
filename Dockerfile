FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
# Explicitly use absolute path to avoid Railway path issues
CMD ["node", "/app/server.porkbun.cjs"]

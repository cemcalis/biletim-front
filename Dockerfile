FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run in dev mode instead of build/start to save time and resources during this test
EXPOSE 3000
CMD ["npm", "run", "dev"]

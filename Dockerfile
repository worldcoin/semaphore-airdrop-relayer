FROM node:lts-alpine
WORKDIR /app

COPY package*.json ./
COPY ./patches ./patches
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]

FROM node:19.0.1-alpine3.16
WORKDIR /app

COPY package*.json ./
COPY ./patches ./patches
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]

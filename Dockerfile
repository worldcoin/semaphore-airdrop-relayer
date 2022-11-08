FROM gcr.io/distroless/nodejs16-debian11
WORKDIR /app

COPY package*.json ./
COPY ./patches ./patches
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]

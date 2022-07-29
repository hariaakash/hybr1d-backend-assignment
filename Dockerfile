FROM node:16.15.1-alpine3.16

ARG NODE_ENV=production

USER root

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i --production

COPY . .

CMD [ "npm", "start" ]

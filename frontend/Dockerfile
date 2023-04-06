FROM node:19.7.0-alpine3.17

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

CMD npm run dev

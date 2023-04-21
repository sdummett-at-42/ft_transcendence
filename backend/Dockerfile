FROM node:19.7.0-alpine3.17

WORKDIR /app

ADD package*.json /app/

RUN npm install

COPY . /app

RUN npx prisma generate

CMD npx prisma migrate deploy && npx prisma db seed && npm run start:dev


FROM node:19.7.0-alpine3.17

WORKDIR /app

ADD package.json /app/package.json

RUN npm install

ADD . /app

RUN npx prisma generate

# Run prisma migrate and seed, then start the application
CMD npx prisma migrate dev --name init && npx prisma db seed && npm run start:dev

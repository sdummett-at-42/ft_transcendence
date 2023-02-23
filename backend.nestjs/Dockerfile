FROM node:19-alpine

WORKDIR /app

ADD package.json /app/package.json

RUN npm install

ADD . /app

RUN npx prisma generate

# Run prisma migrate and seed, then start the application
CMD npx prisma migrate dev && npx prisma db seed && npm run start:dev

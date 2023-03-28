FROM node:19.7.0-alpine3.17

WORKDIR /app

ADD package.json /app/package.json

RUN npm install

ADD . /app

RUN npx prisma generate

# Run prisma migrate deploy and seed the db with some datas, then start the application
CMD npm run start:dev

#npx prisma migrate deploy && npx prisma db seed && 

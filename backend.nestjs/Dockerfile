FROM node:19-alpine

WORKDIR /app

ADD package.json /app/package.json

RUN npm install

ADD . /app

RUN npx prisma generate
# same as npx prisma generate --schema=./prisma/schema.prisma

CMD ["npm", "run", "start:dev"]

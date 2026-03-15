FROM node:22-alpine AS dev

ENV NODE_ENV=development

WORKDIR /opt

COPY package*.json ./

RUN npm install

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app

CMD ["nodemon", "--exec", "node --require ts-node/register --inspect=0.0.0:9229", "src/app.ts"]
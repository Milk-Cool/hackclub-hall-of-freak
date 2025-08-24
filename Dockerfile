FROM node:18-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn && yarn build

CMD ["yarn", "start"]

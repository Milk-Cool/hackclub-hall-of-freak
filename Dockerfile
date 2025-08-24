FROM node:22

WORKDIR /usr/src/app

COPY . .

RUN yarn && yarn build

CMD ["yarn", "start"]

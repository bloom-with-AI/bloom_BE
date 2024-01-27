From node:alpine

WORKDIR /usr/app
COPY ./ /usr/app

RUN npm install

CMD ["node", "src/app.js"]
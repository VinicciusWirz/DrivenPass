FROM node:alpine

WORKDIR /app

COPY . .

EXPOSE 3000

RUN npm i

RUN npm run build

CMD ["npm", "run", "start:prod"]
FROM node:12-alpine
COPY . .
RUN npm install

CMD node bin/www

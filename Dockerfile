# develop stage
# FROM node:13.14-alpine as develop-stage
FROM node:lts-alpine3.15 as develop-stage
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli@latest
COPY . .
# build stage
FROM develop-stage as build-stage
RUN yarn
RUN quasar build
# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d
# CMD ["nginx", "-g", "daemon off;"]

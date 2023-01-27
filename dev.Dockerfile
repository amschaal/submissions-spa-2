# develop stage
# FROM node:13.14-alpine as develop-stage
# FROM node:lts-alpine3.15 as develop-stage
FROM node:16-alpine as develop-stage
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .
# build stage
FROM develop-stage as build-stage
RUN yarn
CMD ["quasar", "dev"]
# # production stage
# FROM nginx:stable-alpine as production-stage
# COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
# RUN rm /etc/nginx/conf.d/default.conf
# COPY ./nginx/nginx.conf /etc/nginx/conf.d
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

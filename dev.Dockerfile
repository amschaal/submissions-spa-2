# develop stage
# FROM node:13.14-alpine as develop-stage
# FROM node:lts-alpine3.15 as develop-stage
FROM node:18-alpine as develop-stage
ENV NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli@latest
COPY . .
# build stage
FROM develop-stage as build-stage
RUN yarn
# CMD ["tail", "-f", "/dev/null"]
CMD ["quasar", "dev"]
# # production stage
# FROM nginx:stable-alpine as production-stage
# COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
# RUN rm /etc/nginx/conf.d/default.conf
# COPY ./nginx/nginx.conf /etc/nginx/conf.d
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

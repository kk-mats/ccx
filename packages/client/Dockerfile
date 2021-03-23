FROM node:14-alpine as dev
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=1
ENV PATH=/ccx/node_modules/.bin:$PATH
EXPOSE 80 8081
ENV TS_NODE_PROJECT=/ccx/packages/client/tsconfig.dev.json
WORKDIR /ccx

FROM node:14-alpine as builder
ENV NODE_ENV=development
ENV PATH=/ccx/node_modules/.bin:$PATH
ENV TS_NODE_PROJECT=/ccx/packages/client/tsconfig.json
ARG URL_BASE
RUN mkdir -p /ccx/packages
COPY ./tsconfig.json /ccx
COPY ./package.json /ccx
COPY ./packages/common /ccx/packages/common
COPY ./packages/client /ccx/packages/client
RUN cd /ccx && \
	yarn install && \
	cd /ccx/packages/client && \
	yarn workspace client run build

FROM nginx:alpine as prod
EXPOSE 80
COPY --from=builder /dist/client /usr/share/nginx/html
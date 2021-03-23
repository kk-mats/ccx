FROM node:14-buster-slim as dev
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=1
ENV PATH=/ccx/node_modules/.bin:$PATH
EXPOSE 4000 5000
RUN apt-get update && \
	apt-get install -y python make g++ git procps && \
	yarn global add node-pre-gyp node-gyp && \
	apt-get remove -y python make g++ && \
	git config --global daemon.uploadpack true && \
	git config --global uploadpack.allowTipSHA1InWant true && \
	git config --global uploadpack.allowReachableSHA1InWant true
WORKDIR /ccx
CMD ["sh"]

FROM node:14-alpine as builder
ENV NODE_ENV=development
ENV PATH=/ccx/node_modules/.bin:$PATH
ARG URL_BASE
RUN mkdir -p /ccx/packages
COPY tsconfig.json /ccx
COPY package.json /ccx
COPY packages/common /ccx/packages/common
COPY packages/client /ccx/packages/client
RUN cd /ccx && \
	yarn install && \
	yarn run build


FROM node:14-buster-slim as prod
ENV NODE_ENV=production
ENV PATH=/ccx/node_modules/.bin:$PATH
EXPOSE 4000 5000
RUN apt-get update && \
	apt-get install -y git && \
	mkdir -p /ccx/packages && \
	apt-get remove -y python make g++ && \
	rm -rf /var/lib/apt/lists/* && \
	git config --global daemon.uploadpack true && \
	git config --global uploadpack.allowTipSHA1InWant true && \
	git config --global uploadpack.allowReachableSHA1InWant true
COPY --from=builder /ccx/dist /ccx/dist
COPY tsconfig.json /ccx
COPY package.json /ccx
COPY packages/common /ccx/packages/common
COPY packages/auth /ccx/packages/auth
COPY packages/core /ccx/packages/core
WORKDIR /ccx
RUN yarn install --production=false
CMD ["yarn", "run", "start"]
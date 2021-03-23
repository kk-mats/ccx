FROM gcc:latest as deckard-builder
RUN apt-get update && \
	apt-get install -y git python2 make bison flex&& \
	apt-get clean && \
	git clone https://github.com/skyhover/Deckard.git && \
	cd /Deckard/src/main && \
	./build.sh

FROM node:14-buster-slim as dev
COPY --from=deckard-builder /Deckard /Deckard
WORKDIR /plugin
RUN apt-get update && \
	apt-get install -y git python2 && \
	ln -s /usr/bin/python2 /usr/bin/python

FROM node:14-buster-slim as plugin-builder
COPY . /plugin
WORKDIR /plugin
RUN yarn install && \
	yarn run build

FROM node:14-buster-slim
ENV NODE_ENV=production
COPY --from=plugin-builder /plugin/dist/bundle.js /plugin.js
COPY --from=deckard-builder /Deckard /Deckard
RUN apt-get update && \
	apt-get install -y python2 && \
	ln -s /usr/bin/python2 /usr/bin/python && \
	rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["node", "/plugin.js"]
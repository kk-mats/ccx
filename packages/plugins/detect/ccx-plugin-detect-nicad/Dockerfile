FROM node:14-buster-slim as dev
RUN apt-get update && \
	apt-get install -y build-essential curl
RUN curl -SL https://www.txl.ca/download/28736-txl10.8.linux64.tar.gz | tar -xz && \
	cd /txl10.8.linux64 && \
	./InstallTxl && \
	cd / && \
	curl -SL https://www.txl.ca/download/24915-NiCad-6.2.tar.gz | tar -xz && \
	cd NiCad-6.2 && \
	make

FROM node:14-buster-slim as plugin-builder
COPY src /plugin/src
COPY package.json /plugin/package.json
COPY tsconfig.json /plugin/tsconfig.json
COPY yarn.lock /plugin/yarn.lock
WORKDIR /plugin
RUN yarn install && \
	yarn run build

FROM node:14-buster-slim
ENV NODE_ENV=production
COPY --from=plugin-builder /plugin/dist/bundle.js /plugin.js
COPY --from=dev /usr/local/bin/txl* /usr/local/bin/
COPY --from=dev /NiCad-6.2/ /NiCad-6.2/
ENTRYPOINT [ "node", "/plugin.js" ]
FROM golang:1.15-alpine as dev
EXPOSE 3000
WORKDIR /ccx
RUN apk add docker openrc build-base && \
	addgroup root docker && \
	rc-update add docker boot && \
	apk del openrc


FROM golang:1.15-alpine as builder
ENV CGO_ENABLED=0 GOOS=linux GIN_MODE=release
COPY . /worker
WORKDIR /worker
RUN go build -o dist/worker ./cmd/worker/main.go

FROM alpine:latest as prod
ENV GIN_MODE=release
EXPOSE 3000
COPY --from=builder /worker/dist/worker /worker
CMD [ "./worker" ]
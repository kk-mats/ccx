FROM gradle as builder
COPY . /plugin
WORKDIR /plugin
RUN wget https://github.com/YuichiSemura/CCFinderSW/raw/master/build/distributions/CCFinderSW-1.0.zip && \
	unzip CCFinderSW-1.0.zip && \
	rm -rf ./CCFinderSW-1.0.zip/icca && \
	chmod 755 ./CCFinderSW-1.0/bin/CCFinderSW && \
	chmod 777 gradlew && \
	./gradlew shadowJar

FROM openjdk:8-jre-alpine
COPY --from=builder /plugin/CCFinderSW-1.0 /plugin/CCFinderSW-1.0
COPY --from=builder /plugin/build/libs/ccx_plugin_detect_ccfsw.jar /plugin/ccx_plugin_detect_ccfsw.jar
WORKDIR /plugin
ENTRYPOINT ["java", "-jar", "ccx_plugin_detect_ccfsw.jar"]
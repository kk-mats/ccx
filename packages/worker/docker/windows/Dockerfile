FROM mcr.microsoft.com/windows/nanoserver:1809 as prod
ENV GIN_MODE=release
COPY worker.exe C:/worker.exe
CMD ["C:/worker.exe"]
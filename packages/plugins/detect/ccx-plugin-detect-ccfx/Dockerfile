FROM mcr.microsoft.com/powershell:lts-windowsservercore-1809 as dev
WORKDIR C:/
ADD https://www.python.org/ftp/python/2.6.5/python-2.6.5.msi ./
ADD http://www.ccfinder.net/download/ccfx-win32-en.zip ./
ADD https://nodejs.org/dist/v14.15.4/node-v14.15.4-win-x64.zip ./
RUN pwsh -Command \
	Start-Process -FilePath msiexec -ArgumentList '/i python-2.6.5.msi /quiet ADDLOCAL=ALL' -Wait; \
	Expand-Archive ccfx-win32-en.zip; \
	Expand-Archive node-v14.15.4-win-x64.zip; \
	$path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + 'C:/Python26;C:/node-v14.15.4-win-x64/node-v14.15.4-win-x64;'; \
	[Environment]::SetEnvironmentVariable('PATH', $path, 'Machine')
RUN npm install -g yarn

FROM mcr.microsoft.com/powershell:lts-windowsservercore-1809 as plugin-builder
COPY --from=dev C:/node-v14.15.4-win-x64/node-v14.15.4-win-x64 C:/node-v14.15.4-win-x64
RUN pwsh -Command \
	$path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + 'C:/node-v14.15.4-win-x64;'; \
	[Environment]::SetEnvironmentVariable('PATH', $path, 'Machine')
COPY . C:/plugin
WORKDIR C:/plugin
RUN pwsh -Command \
	yarn install; \
	yarn run build

FROM mcr.microsoft.com/powershell:lts-windowsservercore-1809 as prod
ADD https://www.python.org/ftp/python/2.6.5/python-2.6.5.msi ./
COPY --from=dev C:/ccfx-win32-en/ccfx-win32-en C:/ccfx-win32-en
COPY --from=dev C:/node-v14.15.4-win-x64/node-v14.15.4-win-x64 C:/node-v14.15.4-win-x64
COPY --from=plugin-builder C:/plugin/dist/bundle.js C:/plugin.js
USER ContainerAdministrator
RUN pwsh -Command \
	Start-Process -FilePath msiexec -ArgumentList '/i python-2.6.5.msi /quiet ADDLOCAL=ALL' -Wait; \
	$path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + 'C:/Python26;C:/node-v14.15.4-win-x64;'; \
	[Environment]::SetEnvironmentVariable('PATH', $path, 'Machine');  \
	mkdir C:/tmp
ENTRYPOINT [ "node", "C:/plugin.js"]

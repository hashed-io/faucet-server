FROM node:16.11.1
RUN mkdir /faucet-server-code
COPY . /faucet-server-code
WORKDIR /faucet-server-code
RUN npm install --omit=dev
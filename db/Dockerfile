FROM postgres:latest
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN mkdir /faucet-server-db
COPY faucet-server-db.sql /faucet-server-db
COPY setup.sh /docker-entrypoint-initdb.d
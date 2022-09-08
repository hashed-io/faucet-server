#!/usr/bin/env bash

usage="./start-all [build|image]"
if [ $# -ne 1 ]; then
    echo $usage
    exit 1
fi

if [[ $1 != 'build' && $1 != 'image' ]]; then
    echo $usage
    exit 1
fi

script_path="$(dirname $(realpath ${BASH_SOURCE[0]}))"

pushd $script_path

cp .env.all .env

if [[ $1 = build ]]; then
  docker-compose -f docker-compose.yaml -f docker-compose.all.yaml -f docker-compose.all.build.yaml -p faucet-server-$1 up --build -d
else
  docker-compose -f docker-compose.yaml -f docker-compose.all.yaml -f docker-compose.all.image.yaml -p faucet-server-$1 up -d
fi

popd

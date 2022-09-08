#!/usr/bin/env bash

usage="./down-all [build|image]"
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

if [[ $1 = build ]]; then
  docker-compose -p faucet-server-$1 down --remove-orphans
else
  docker-compose -p faucet-server-$1 down --remove-orphans -v
fi

popd

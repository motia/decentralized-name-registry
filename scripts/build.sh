#!/usr/bin/env bash

set -e

# compile types
cd ..
yarn compile

# build frontend
cd ./app
yarn build

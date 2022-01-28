#!/usr/bin/env bash

set -e

if [ $(git status --porcelain | wc -l) -ne "0" ]; then
  echo "All GIT changes must be committed before deployment."
  exit 1
fi


DEPLOY_NETWORK=${1:-ropsten}
bash ./build.sh

# Deploy frontend
cd ../app
yarn deploy

# Deploy Backend
cd ..
yarn migrate --network "$DEPLOY_NETWORK"

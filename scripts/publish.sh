#!/bin/sh

# This script is used to publish a new version of the package.
# if no argument is passed return 1
if [ -z "$1" ]
then
  echo "No argument supplied"
  exit 1
fi

pnpm changeset
pnpm changeset version
pnpm run build
git add .
git commit -m $1
pnpm changeset publish
git push
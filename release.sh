#!/bin/bash

set -e

IN_CI="false"

if [ "$1" = "--in-ci" ]; then
    IN_CI="true"
fi

if [ "$IN_CI" = "false" ]; then
    rm -fr dist
    git clone "$(node -pe "require('./package.json').repository.url")" dist
    pushd dist

  git checkout main
fi

git checkout -b dist || (git branch -D dist && git checkout -b dist)

VERSION="$(node -pe "require('./package.json').version")"

yarn install
echo "Building release for version $VERSION"
yarn run build

for file in $(git ls-files); do
	if [ "$file" = ".gitignore" ] || [ "$file" = "release.sh" ]; then
		echo "Skipping $file"
	else	
		git rm "$file"
	fi
done;

echo "Extracting build to root"
mv ./build/* .
echo "Done!"

if [ "$IN_CI" = "true" ]; then
    git config --local user.email "ci@no-reply.com"
    git config --local user.name "Automated Release"
fi

git add .
git commit -m "build(release): version $VERSION"

if [ "$IN_CI" = "false" ]; then
  git push --force --set-upstream origin dist

  rm -fr ./*
  popd
fi

echo "Success!"

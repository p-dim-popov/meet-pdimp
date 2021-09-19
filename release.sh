#!/bin/bash

set -e

CURRENT_BRANCH="$(git branch --show-current)"

git checkout main
git pull
git branch -D dist
git checkout -b dist

VERSION="$(node -pe 'require(`./package.json`).version')"

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

git add .
git commit -m "build(release): version $VERSION"
git push --force --set-upstream origin dist
git checkout "$CURRENT_BRANCH"

echo "Success!"

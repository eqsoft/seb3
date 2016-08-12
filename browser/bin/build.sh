#!/bin/bash
PACKAGER="../app/node_modules/.bin/electron-packager"
APP="../app"
OUT="../dist"
$PACKAGER $APP --all --out=$OUT --prune --overwrite

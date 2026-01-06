#!/bin/sh

cd /var/www/ruota-della-fortuna-frontend/
git pull -f origin main
npm install
npm run build
rm -rf ./served
mv ./dist ./served
sudo service apache2 restart
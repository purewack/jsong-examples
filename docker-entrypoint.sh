#!/bin/sh
set -e
: "${PORT:=8080}"
# Replace {{PORT}} placeholder in nginx conf
sed "s/{{PORT}}/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
# Run nginx in foreground
exec nginx -g 'daemon off;'

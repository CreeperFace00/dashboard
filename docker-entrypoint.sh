#!/bin/sh
set -e

# Substitute only ${NETDATA_URL} so nginx variables like $host are left intact
envsubst '${NETDATA_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'

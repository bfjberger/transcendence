#!/bin/sh

# Replace __TEMP_SERV__ with the value of DJANGO_ALLOWED_HOSTS
sed -i 's/__TEMP_SERV__/'"$DJANGO_ALLOWED_HOSTS"'/g' /etc/nginx/conf.d/nginx.conf

# Start Nginx
exec nginx -g 'daemon off;'
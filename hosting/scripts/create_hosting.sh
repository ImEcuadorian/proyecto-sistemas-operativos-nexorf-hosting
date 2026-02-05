#!/bin/sh

USER="$1"

if [ -z "$USER" ]; then
  echo "Uso: $0 <usuario>"
  exit 1
fi

DOMAIN="$USER.nexorf.com"
BASE="/var/www"
NGINX="/etc/nginx/conf.d"

echo "🚀 Creando hosting para $USER"

mkdir -p $BASE/$USER/public_html
cp /scripts/default_index.html $BASE/$USER/public_html/index.html
cp /scripts/nexorf_1.png $BASE/$USER/public_html/nexorf_1.png

chown -R 1000:1000 /var/www/$USER
chmod -R 755 /var/www/$USER

cat > $NGINX/$DOMAIN.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    root /var/www/$USER/public_html;
    index index.html index.php;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~ \.php\$ {
        fastcgi_pass nexorf-php:9000;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
    }
}
EOF

nginx -t
kill -HUP 1

echo "========================================"
echo "🌐 Dominio: http://$DOMAIN"
echo "📂 Web root: /var/www/$USER/public_html"
echo "========================================"

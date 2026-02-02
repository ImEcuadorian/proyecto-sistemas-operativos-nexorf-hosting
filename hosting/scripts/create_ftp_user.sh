#!/bin/sh

USER="$1"
PASS="$2"

/usr/bin/pure-pw useradd "$USER" \
  -u ftpuser \
  -d /home/ftpusers/$USER \
  -m <<EOF
$PASS
$PASS
EOF

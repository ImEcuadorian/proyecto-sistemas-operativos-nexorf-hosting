#!/bin/sh

USER=$1
ZONE="/etc/bind/db.nexorf.com"

echo "$USER    IN A 192.168.99.2" >> $ZONE
rndc reload

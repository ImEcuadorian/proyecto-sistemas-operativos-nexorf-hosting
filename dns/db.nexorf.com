$TTL 86400
@   IN  SOA mail.nexorf.com. admin.nexorf.com. (
        1 604800 86400 2419200 86400 )

@       IN  NS  mail.nexorf.com.
@       IN  MX  10 mail.nexorf.com.

@       IN  A   192.168.99.2
www     IN  A   192.168.99.2
mail    IN  A   192.168.99.2
phpmyadmin IN A 192.168.99.2
ftp     IN  A   192.168.99.2
*       IN  A   192.168.99.2

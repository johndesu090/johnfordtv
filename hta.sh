#!/bin/bash
rm -f /var/www/html/.htaccess
wget -O /var/www/html/.htaccess "https://raw.githubusercontent.com/johndesu090/johnfordtv/master/htlist"

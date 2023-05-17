#!/bin/bash
wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/enc.keyinfo
sleep 2
wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/activedrm.sh
sleep 2
wget -O /var/www/html/web/enc.key https://raw.githubusercontent.com/johndesu090/johnfordtv/master/enc.key
sleep 2

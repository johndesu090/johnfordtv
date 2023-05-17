#!/bin/bash
wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/enc.keyinfo
sleep 1
wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/activedrm.sh
sleep 1
wget -O /var/www/html/web/enc.key https://raw.githubusercontent.com/johndesu090/johnfordtv/master/enc.key
sleep 1
chmod +x activedrm.sh
sleep 1

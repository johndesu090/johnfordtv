#!/bin/sh
#Script by FordSenpai


# initializing var
MYIP=$(wget -qO- ipv4.icanhazip.com);
MYIP2="s/xxxxxxxxx/$MYIP/g";

# install dependencies
apt-get install gcc libgeoip-dev python-virtualenv python-dev geoip-database-extra nginx uwsgi uwsgi-plugin-python geoipupdate

# install openvpn-monitor srv
cd /srv
git clone https://github.com/furlongm/openvpn-monitor.git
cd openvpn-monitor
virtualenv .
. bin/activate
pip install -r requirements.txt

# configure uWSGI

cat > /etc/uwsgi/apps-available/openvpn-monitor.ini <<-END
[uwsgi]
base = /srv
project = openvpn-monitor
socket = 127.0.0.1:8084
logto = /var/log/uwsgi/app/%(project).log
plugins = python
chdir = %(base)/%(project)
virtualenv = %(chdir)
module = openvpn-monitor:application
manage-script-name = true
mount=/openvpn-monitor=openvpn-monitor.py
END

# Create an Nginx config

cat > /etc/nginx/conf.d/johnfordtv-ovpn.conf <<-END
server {
 listen 5556;
 server_name localhost;
location / {
 uwsgi_pass 127.0.0.1:8084;
 include /etc/nginx/uwsgi_params;
 }
}
END

# Enable uWSGI app and Nginx

ln -s /etc/uwsgi/apps-available/openvpn-monitor.ini /etc/uwsgi/apps-enabled/
service uwsgi restart
ln -s /etc/nginx/conf.d/johnfordtv-ovpn.conf /etc/nginx/conf.d/
service nginx reload

# info
clear
echo " "
echo "Installation has been completed!!"
echo " "
echo "--------------------------- Configuration Setup Server -------------------------"
echo "                      		 Debian AutoScript                                "
echo "                                 -FordSenpai-                                   "
echo "--------------------------------------------------------------------------------"
echo ""  | tee -a log-install.txt
echo "Server Information"  | tee -a log-install.txt
echo "   - Timezone    : Asia/Manila (GMT +8)"  | tee -a log-install.txt
echo "   - Fail2Ban    : [ON]"  | tee -a log-install.txt
echo "   - IPtables    : [ON]"  | tee -a log-install.txt
echo "   - Auto-Reboot : [OFF]"  | tee -a log-install.txt
echo "   - IPv6        : [OFF]"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo "Application & Port Information"  | tee -a log-install.txt
echo "   - OpenVPN-Monitor		: http://$MYIP:5556"  | tee -a log-install.txt
echo "------------------------------ Script by FordSenpai -----------------------------"
sleep 10

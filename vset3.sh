#!/bin/bash
# JohnFordTV's StreamOven Premium Script
# © Github.com/johndesu090

#############################
#############################
# Variables (Can be changed depends on your prefer/home/panel/html values)
# Script name
MyScriptName='StreamOven Engine'
# My VPS IP
MYIP=$(wget -qO- ipv4.icanhazip.com);
# Server local time
MyVPS_Time='Asia/Manila'
#############################
#############################


#############################
#############################
## All function used for this script
#############################
## WARNING: Do not modify or edit anything
## if you did'nt know what to do.
## This part is too sensitive.
#############################
#############################

function InstAsk(){
 clear
 echo ""
 echo "I need to ask some questions before starting setup"
 echo "You can leave the default option and just hit enter if you agree with the option"
 echo ""
 echo "You need to have a domain pointed in your server IP for before install"
 read -p " Domain: " -e -i .gamebits.live ydomain
 echo ""
 echo "Okay, that's all I need. We are ready to setup your server now"
 read -n1 -r -p "Press any key to continue..."
}

function InstUpdates(){
 apt-get update
 apt-get upgrade -y
 
 # Installing some important machine essentials
 sudo apt-get install wget unzip software-properties-common dpkg-dev git make gcc clamav clamav-daemon automake cron build-essential zlib1g-dev libpcre3 libpcre3-dev libssl-dev libxslt1-dev libxml2-dev libgd-dev libgeoip-dev libgoogle-perftools-dev libperl-dev pkg-config autotools-dev gpac ffmpeg mediainfo mencoder lame libvorbisenc2 libvorbisfile3 libx264-dev libvo-aacenc-dev libmp3lame-dev libopus-dev -y
 
 # Installing nginx 
 apt-get install nginx -y 

 # Trying to remove obsolette packages after installation
 apt-get autoremove -y
 
 # Installing mod rtmp with certbot
 apt-get install libnginx-mod-rtmp python3-certbot-nginx -y

}

function InstCreateDir(){
 
 # Making some important machine directories
 mkdir -p /var/www/html/web/cdnlive-33554180976
 mkdir -p /var/www/html/web/hackfight
 mkdir -p /var/livestream/hls /var/livestream/dash /var/livestream/recordings /var/livestream/keys
 ln -s /var/livestream/hls /var/www/html/web/hls
 ln -s /var/livestream/dash /var/www/html/web/dash
 
 # Grant permission to WWW
 #chown -R www-data:www-data /var/livestream /var/www/$ydomain

}

function InstRset(){
 
 # Download nginx rtmp module stat from github repo
 cd /usr/src
 git clone https://github.com/arut/nginx-rtmp-module
 
 # Copy stat to webroot dir
 cp /usr/src/nginx-rtmp-module/stat.xsl /var/www/html/stat.xsl
 cp /usr/src/nginx-rtmp-module/stat.xsl /var/www/html/web/stat.xsl
 cd
 
 # Create crossdomain config
 cat << EOF > /var/www/html/crossdomain.xml
<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
<allow-access-from domain="*"/>
</cross-domain-policy>
EOF

 # Copy crossdomain xml and default nginx page to webroot
 cp /var/www/html/crossdomain.xml /var/www/html/web/crossdomain.xml
 cp /var/www/html/index.nginx-debian.html /var/www/html/web/index.html

}

function InstNginx(){
 
 # Create nginx config
 wget -O /etc/nginx/sites-available/streamoven.conf  https://raw.githubusercontent.com/johndesu090/johnfordtv/master/nginxstream.conf

 # Change domain on nginx config
 sed -i "s|YOURDOMAIN|$ydomain|g" /etc/nginx/sites-available/streamoven.conf
 
 # Create a symlink to activate the config
 ln -s /etc/nginx/sites-available/streamoven.conf /etc/nginx/sites-enabled/streamoven.conf
 
 # Create backup of original nginx.conf
 mv /etc/nginx/nginx.conf /etc/nginx/nginx-original.conf
 
 # Import new nginx config from git
 wget -O /etc/nginx/nginx.conf  https://raw.githubusercontent.com/ustoopia/Nginx-config-for-livestreams-ABS-HLS-ffmpeg-transc-/main/etc/nginx/nginx.conf
 
 # Get ENC
 wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/enc.keyinfo
 wget -O /var/www/html/web/enc.key https://raw.githubusercontent.com/johndesu090/johnfordtv/master/enc.key
 
 # Restart nginx service
 systemctl restart nginx
 systemctl enable nginx

}

function InstActiveScript(){
 cd
 wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/soven6.zip
 unzip soven6.zip
 

 # Make active.sh executable
 chmod +x *.sh
 
 # Create Checker script
 cat <<'cheker' > /root/checker.sh
#!/bin/bash
if ps aux | grep -i '[f]fmpeg' ; then
  echo "running"
else
  echo "not running! restarting encoder..."
  /bin/bash /root/activebak3.sh
fi

cheker

 # Make checker script executable
 #chmod +x /root/checker.sh

 # For cron commands, visit https://crontab.guru
 #wget -O /etc/cron.d/tscron https://raw.githubusercontent.com/johndesu090/johnfordtv/master/tscron 
 #echo -e "* * * * * root /bin/bash /root/checker.sh" > /etc/cron.d/check_script
 
 # Rebooting cron service
 systemctl restart cron
 systemctl enable cron
 
}

function InstUFW(){
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny from 34.143.134.201 to any
ufw deny from 34.124.165.89 to any
ufw deny from 165.232.169.123 to any
ufw deny from 188.166.240.190 to any
ufw deny from 139.59.109.48 to any
ufw deny from 174.138.20.215 to any
ufw deny from 139.59.111.56 to any
ufw deny from 209.97.162.91 to any
ufw deny from 157.245.196.92 to any
ufw deny from 134.209.111.111 to any
ufw deny from 157.245.145.227 to any
ufw deny from 143.198.86.110 to any
ufw deny from 157.230.42.241 to any
ufw deny from 143.198.200.253 to any
ufw deny from 159.65.1.185 to any
ufw deny from 139.59.111.56 to any
ufw deny from 128.199.203.115 to any
ufw deny from 188.166.222.70 to any
ufw deny from 165.22.251.57 to any
ufw deny from 134.209.111.111 to any
ufw deny from 139.59.224.157 to any
ufw deny from 159.223.84.209 to any
ufw deny from 209.97.170.236 to any
ufw deny from 157.245.196.188 to any
ufw deny from 206.189.84.236 to any
ufw deny from 159.223.52.2 to any
ufw deny from 165.22.96.118 to any
ufw deny from 139.59.115.60 to any
ufw deny from 167.172.73.175 to any
ufw deny from 128.199.137.63 to any
ufw deny from 167.71.206.125 to any
ufw deny from 139.59.243.1 to any
ufw deny from 165.232.169.157 to any
ufw deny from 68.183.191.151 to any
ufw deny from 134.209.110.18 to any
ufw deny from 128.199.69.107 to any
ufw deny from 134.209.110.18 to any
ufw deny from 165.22.104.187 to any
ufw deny from 68.183.226.36 to any
ufw deny from 167.71.217.185 to any
ufw deny from 15.235.184.174 to any
ufw deny from 15.235.209.235 to any
ufw deny from 15.235.184.133 to any
ufw deny from 165.22.251.117 to any
ufw deny from 128.199.76.10 to any
ufw deny from 15.235.199.133 to any
ufw deny from 51.79.161.225 to any
ufw deny from 15.235.199.145 to any
ufw deny from 188.166.230.103 to any
ufw deny from 128.199.202.96 to any
ufw deny from 128.199.194.140 to any
ufw deny from 15.235.199.142 to any
ufw deny from 188.166.183.196 to any
ufw deny from 139.99.90.113 to any
ufw deny from 15.235.209.234 to any
ufw deny from 15.235.199.140 to any
ufw deny from 51.79.156.101 to any
ufw deny from 146.190.108.40 to any
ufw deny from 139.59.123.80 to any
ufw deny from 139.59.102.130 to any
ufw deny from 15.235.209.236 to any
ufw deny from 51.79.159.67 to any
ufw deny from 15.235.199.144 to any
ufw deny from 15.235.184.124 to any
ufw deny from 51.79.157.227 to any
ufw deny from 143.198.81.165 to any
ufw deny from 51.79.160.225 to any
ufw deny from 128.199.75.222 to any
ufw deny from 15.235.199.136 to any
ufw deny from 128.199.202.149 to any
ufw deny from 167.99.79.39 to any
ufw deny from 128.199.198.252 to any
ufw deny from 188.166.251.134 to any
ufw deny from 139.59.99.177 to any
ufw deny from 139.99.89.120 to any
ufw deny from 15.235.199.137 to any
ufw deny from 15.235.209.237 to any
ufw deny from 139.99.89.127 to any
ufw deny from 139.99.91.29 to any
ufw deny from 15.235.199.134 to any
ufw deny from 51.79.159.38 to any
ufw deny from 178.128.104.172 to any
ufw deny from 128.199.66.10 to any
ufw deny from 15.235.199.135 to any
ufw deny from 157.245.63.196 to any
ufw deny from 159.223.51.37 to any
ufw deny from 15.235.198.149 to any
ufw deny from 15.235.199.141 to any
ufw deny from 206.189.40.166 to any
ufw deny from 15.235.199.138 to any
ufw deny from 15.235.209.233 to any
ufw deny from 139.99.90.244 to any
ufw deny from 159.65.134.188 to any
ufw deny from 15.235.198.148 to any
ufw deny from 15.235.199.139 to any
ufw deny from 139.59.123.87 to any
ufw deny from 15.235.199.143 to any
ufw deny from 15.235.199.144 to any
ufw deny from 15.235.141.83 to any
ufw deny from 51.79.159.67 to any
ufw deny from 139.99.91.138 to any
ufw deny from 165.22.60.93 to any
ufw deny from 15.235.184.133 to any
ufw deny from 159.89.200.152 to any
ufw deny from 139.99.91.29 to any
ufw deny from 15.235.199.134 to any
ufw deny from 139.99.90.113 to any
ufw deny from 15.235.167.71 to any
ufw deny from 146.190.108.40 to any
ufw deny from 154.26.135.158 to any
ufw deny from 51.79.157.227 to any
ufw deny from 15.235.198.149 to any
ufw deny from 51.79.251.83 to any
ufw deny from 15.235.199.140 to any
ufw deny from 51.79.251.8 to any
ufw deny from 51.79.158.36 to any
ufw deny from 188.166.254.53 to any
ufw deny from 15.235.199.142 to any
ufw deny from 206.189.150.109 to any
ufw deny from 159.89.203.219 to any
ufw deny from 15.235.199.145 to any
ufw deny from 15.235.184.124 to any
ufw deny from 15.235.167.95 to any
ufw deny from 128.199.65.231 to any
ufw deny from 178.128.55.169 to any
ufw deny from 154.26.135.161 to any
ufw deny from 143.198.206.100 to any
ufw deny from 15.235.184.174 to any
ufw deny from 15.235.199.135 to any
ufw deny from 51.79.251.169 to any
ufw deny from 15.235.167.74 to any
ufw deny from 154.26.135.162 to any
ufw deny from 15.235.198.148 to any
ufw deny from 15.235.199.141 to any
ufw deny from 15.235.199.143 to any
ufw deny from 51.79.161.225 to any
ufw deny from 154.26.135.159 to any
ufw deny from 154.26.135.85 to any
ufw deny from 15.235.199.139 to any
ufw deny from 15.235.167.72 to any
ufw deny from 206.189.152.193 to any
ufw deny from 15.235.199.136 to any
ufw deny from 159.223.65.33 to any
ufw deny from 139.99.90.244 to any
ufw deny from 154.26.135.160 to any
ufw deny from 51.79.158.242 to any
ufw deny from 178.128.93.82 to any
ufw deny from 51.79.158.136 to any
ufw deny from 15.235.199.133 to any
ufw deny from 51.79.207.93 to any
ufw deny from 51.79.159.38 to any
ufw deny from 178.128.104.172 to any
ufw deny from 207.148.75.14 to any
ufw deny from 146.190.106.10 to any
ufw deny from 139.99.89.127 to any
ufw deny from 15.235.167.4 to any
ufw deny from 15.235.167.73 to any
ufw deny from 15.235.199.138 to any
ufw deny from 51.79.156.101 to any
ufw deny from 51.79.251.44 to any
ufw deny from 15.235.199.137 to any
ufw deny from 51.79.160.225 to any
ufw deny from 15.235.146.79 to any
ufw deny from 154.26.135.86 to any
ufw deny from 51.79.251.202 to any
ufw deny from 154.26.135.157 to any
ufw deny from 146.190.102.28 to any
ufw deny from 149.102.231.207 to any
ufw deny from 149.102.231.184 to any
ufw deny from 149.102.231.212 to any
ufw deny from 149.102.231.213 to any
ufw deny from 149.102.231.210 to any
ufw deny from 159.223.58.246 to any
ufw deny from 206.189.150.109 to any
ufw deny from 149.102.231.208 to any
ufw deny from 149.102.231.182 to any
ufw deny from 149.102.231.180 to any
ufw deny from 149.102.231.203 to any
ufw deny from 149.102.231.178 to any
ufw deny from 149.102.231.198 to any
ufw deny from 149.102.231.216 to any
ufw deny from 149.102.231.185 to any
ufw deny from 149.102.231.202 to any
ufw deny from 149.102.231.197 to any
ufw deny from 149.102.231.179 to any
ufw deny from 68.183.234.70 to any
ufw deny from 149.102.231.204 to any
ufw deny from 149.102.231.201 to any
ufw deny from 149.102.231.209 to any
ufw deny from 149.102.231.186 to any
ufw deny from 149.102.231.205 to any
ufw deny from 149.102.231.215 to any
ufw deny from 178.128.24.36 to any
ufw deny from 149.102.231.214 to any
ufw deny from 149.102.231.200 to any
ufw deny from 134.209.110.18 to any
ufw deny from 149.102.231.206 to any
ufw deny from 149.102.231.187 to any
ufw deny from 149.102.231.181 to any
ufw deny from 149.102.231.183 to any
ufw deny from 206.189.34.94 to any
ufw deny from 149.102.231.199 to any
ufw deny from 139.59.111.56 to any
ufw deny from 149.102.231.211 to any
ufw enable

}

function ScriptMessage(){
 echo -e " [\e[1;32m$MyScript Installer\e[0m]"
 echo -e ""
 echo -e " https://fb.com/fodobrando"
 echo -e "StreamOven Engine"
 echo -e ""
}

#############################
#############################
## Installation Process
#############################
## WARNING: Do not modify or edit anything
## if you did'nt know what to do.
## This part is too sensitive.
#############################
#############################

 # Check if our machine is in root user, if not, this script exits
 # If you're on sudo user, run `sudo su -` first before running this script
 if [[ $EUID -ne 0 ]];then
 ScriptMessage
 echo -e "[\e[1;31mError\e[0m] This script must be run as root, exiting..."
 exit 1
fi

# Begin Installation by Updating and Upgrading machine and then Installing all our wanted packages/services to be install.
 clear
 ScriptMessage
 sleep 2
 InstAsk
 
 # Update and Install Needed Files
 InstUpdates
 echo -e "Updating Server..."
 sleep 2
 
 # Create dirs
 InstCreateDir
 echo -e "Creating directories..."
 sleep 2
 
 # Setup RTMP
 InstRset
 echo -e "Setting up rtmp module..."
 sleep 2
 
 # Setup Nginx-config-for-livestreams-ABS-HLS-ffmpeg-transc-/main/etc/nginx/nginx
 InstNginx
 InstActiveScript
 
 # Setting server local time
 ln -fs /usr/share/zoneinfo/$MyVPS_Time /etc/localtime
 
 # Setup UFW and Blocklisted IP
 InstUFW
 sleep 2

 # Some assistance and startup scripts
 ScriptMessage
 sleep 2
 
 # info
clear
echo "=======================================================" | tee -a log-install.txt
echo "StreamOvenEngine is installed at http://$ydomain !!!" | tee -a log-install.txt
echo "" | tee -a log-install.txt
echo "Script Installer by StreamOven"  | tee -a log-install.txt
echo "        (http://fb.com/fodobrando)         "  | tee -a log-install.txt
echo "" | tee -a log-install.txt
echo "[HTTPS] Install SSL Certificate on your site. COMMANDS BELOW. " | tee -a log-install.txt
echo "########################################################" | tee -a log-install.txt
echo "certbot --nginx" | tee -a log-install.txt
echo "########################################################" | tee -a log-install.txt
echo "" | tee -a log-install.txt
echo "Installation Log --> /root/log-install.txt" | tee -a log-install.txt
echo "=======================================================" | tee -a log-install.txt
cd ~/

rm -rf /root/vset3.sh
sleep 2
reboot

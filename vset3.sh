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
 read -p " Domain: " -e -i allen.streamoven.com ydomain
 echo ""
 echo "Okay, that's all I need. We are ready to setup your server now"
 read -n1 -r -p "Press any key to continue..."
}

function InstUpdates(){
 apt-get update
 apt-get upgrade -y
 
 # Installing some important machine essentials
 sudo apt-get install wget unzip software-properties-common dpkg-dev git make gcc automake cron build-essential zlib1g-dev libpcre3 libpcre3-dev libssl-dev libxslt1-dev libxml2-dev libgd-dev libgeoip-dev libgoogle-perftools-dev libperl-dev pkg-config autotools-dev gpac ffmpeg mediainfo mencoder lame libvorbisenc2 libvorbisfile3 libx264-dev libvo-aacenc-dev libmp3lame-dev libopus-dev -y
 
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
 chown -R www-data:www-data /var/livestream /var/www/$ydomain

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
 
 # Restart nginx service
 systemctl restart nginx
 systemctl enable nginx

}

function InstActiveScript(){
 cd
 wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/soven2.zip
 unzip soven2.zip
 

 # Make active.sh executable
 chmod +x active.sh
 chmod +x active2.sh
 chmod +x active3.sh
  hmod +x actived.sh
 chmod +x actived2.sh
 chmod +x actived3.sh
 chmod +x activebak.sh
 chmod +x activebak2.sh
 chmod +x activebak3.sh
 
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
 chmod +x /root/checker.sh

 # For cron commands, visit https://crontab.guru
 wget -O /etc/cron.d/tscron https://raw.githubusercontent.com/johndesu090/johnfordtv/master/tscron 
 echo -e "* * * * * root /bin/bash /root/checker.sh" > /etc/cron.d/check_script
 
 # Rebooting cron service
 systemctl restart cron
 systemctl enable cron
 
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
 sleep 10
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
 #InstActiveScript
 
 # Setting server local time
 ln -fs /usr/share/zoneinfo/$MyVPS_Time /etc/localtime

 # Some assistance and startup scripts
 ScriptMessage
 sleep 3
 
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

rm -f vset3.sh
pause 5
reboot

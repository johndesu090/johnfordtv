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

function InstActiveScript(){
 cd
 wget https://raw.githubusercontent.com/johndesu090/johnfordtv/master/soven3.zip
 unzip soven3.zip
 

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

InstActiveScript


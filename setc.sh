#!/bin/bash
 echo -e "* * * * * root /bin/bash /root/checker.sh" > /etc/cron.d/check_script
 
  # Create Checker script
 cat <<'cheker' > /root/checker.sh
#!/bin/bash
if ps aux | grep -i '[f]fmpeg' ; then
  echo "running"
else
  echo "not running! restarting encoder..."
  /bin/bash /root/active.sh
fi

cheker

chmod +x /root/checker.sh
rm setc.sh

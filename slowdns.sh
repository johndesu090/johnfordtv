#!/bin/bash
# JohnFordTV's SlowDNS Proxy Script
# © Github.com/johndesu090
# Official Repository: https://github.com/johndesu090/
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090
clear

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CORTITLE='\033[1;41m'
SCOLOR='\033[0m'
banner='
 ___ _    _____      _____  _  _ ___ 
/ __| |  / _ \ \    / /   \| \| / __|
\__ \ |_| (_) \ \/\/ /| |) | .  \__ \
|___/____\___/ \_/\_/ |___/|_|\_|___/'

echo -e "=====================================" 
echo -e "        SSHPLUS CLIENT SLOWDNS       "
echo -e "=====================================" 
echo -e "$banner$"
[[ ! -e dns ]] && {
    yes| termux-setup-storage > /dev/null 2>&1
    unset LD_PRELOAD > /dev/null 2>&1
    cd $HOME
    mv slowdns $PREFIX/bin/slowdns
    chmod +x $PREFIX/bin/slowdns
    [[ $(grep -c 'slowdns' $PREFIX/etc/profile) == '0' ]] && echo 'slowdns' >> $PREFIX/etc/profile
    echo -e "\n${GREEN}DOWNLOADING SCRIPT PLEASE WAIT! ${SCOLOR}"
    curl -O https://raw.githubusercontent.com/johndesu090/johnfordtv/master/dns > /dev/null 2>&1
    echo -e "SCRIPT DOWNLOADED! NEXT TIME RUN ONLY THE COMMAND slowdns EVEN IF YOU'RE OFFLINE !"
    chmod +x dns
}
[[ ! -e $HOME/credenciais ]] && {
    ns=$1
    [[ -z "$ns" ]] && {
        echo -e "\n${RED}INCOMPLETE COMMAND${SCOLOR}"
        exit 0
    }
    chave=$2
    [[ -z "$chave" ]] && {
        echo -e "\n${RED}INCOMPLETE COMMAND${SCOLOR}"
        exit 0
    }
    echo -e "$ns\n$chave" > $HOME/credenciais
} || {
    perg=$(echo "${SCOLOR}[s/n]: ")
    echo -e "SCRIPT IS ALREADY CONFIGURED... SERVER IS READY FOR CONNECTION"
    read -p "$(echo -e "WANT TO CONTINUE WITH THE SAME?[y/n]: ")" -e -i s opc
    [[ "$opc" != @(y|yes|Y|YES) ]] && {
        rm $HOME/credenciais dns > /dev/null 2>&1
        rm $PREFIX/bin/slowdns > /dev/null 2>&1
        sed -i '/slowdns/d' $PREFIX/etc/profile > /dev/null 2>&1
        echo -e "\n${RED}SCRIPT REMOVED !${SCOLOR}"
        rm slowdns > /dev/null 2>&1
        exit 0
    } || {
        unset LD_PRELOAD > /dev/null 2>&1
        ns=$(sed -n 1p $HOME/credenciais)
        chave=$(sed -n 2p $HOME/credenciais)
    }
}
echo -ne "TO CONTINUE MAKE SURE YOU ARE ONLY WITH THEMOBILE DATA ACTIVATED! ENTER TO CONTINUE.."; read
$HOME/dns -udp 208.67.222.222:53 -pubkey ${chave} ${ns} 127.0.0.1:2222 > /dev/null 2>&1 &
echo -e "SLOWDNS STARTED! NOW CONNECT IN A VPN APP OR CLICK ON ENTER TO DISCONNECT "; read
piddns=$(ps x| grep -w 'dns' | grep -v 'grep'| awk -F' ' {'print $1'})
[[ ${piddns} != '' ]] && kill ${piddns} > /dev/null 2>&1
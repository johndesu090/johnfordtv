#!/bin/bash
# JohnFordTV's OpenVPN Single Cert Script
# © Github.com/johndesu090
# Official Repository: https://github.com/johndesu090/
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090

#############################
#############################
# Variables (Can be changed depends on your preferred values)

# Script name
MyScriptName='JohnFordTV-OpenVPN'

# OpenSSH Ports
SSH_Port1='22'
SSH_Port2='143'

# Your SSH Banner
SSH_Banner='https://www.dropbox.com/s/01jed4dmaq7cu8b/issue.net'

# Dropbear Ports
Dropbear_Port1='550'
Dropbear_Port2='445'

# OpenVPN Ports
OpenVPN_TCP_Port='993'
OpenVPN_UDP_Port='9201'


# OpenVPN Config Download Port
OvpnDownload_Port='80' # Before changing this value, please read this document. It contains all unsafe ports for Google Chrome Browser, please read from line #23 to line #89: https://chromium.googlesource.com/chromium/src.git/+/refs/heads/master/net/base/port_util.cc

# Server local time
MyVPS_Time='Asia/Manila'
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

function InstUpdates(){
 export DEBIAN_FRONTEND=noninteractive
 apt-get update
 apt-get upgrade -y
 
 # Removing some firewall tools that may affect other services
 apt-get remove --purge ufw firewalld -y

 
 # Installing some important machine essentials
 apt-get install nano wget curl zip unzip tar gzip p7zip-full bc rc openssl cron net-tools dnsutils dos2unix screen bzip2 psmisc lsof ccrypt -y
 
 # Now installing all our wanted services
 apt-get install gnupg tcpdump grepcidr dropbear screen privoxy ca-certificates ruby apt-transport-https lsb-release squid -y

 # Installing all required packages to install Webmin
 apt-get install perl libnet-ssleay-perl openssl libauthen-pam-perl libpam-runtime libio-pty-perl apt-show-versions python dbus libxml-parser-perl -y
 apt-get install shared-mime-info jq fail2ban -y

 
 # Installing a text colorizer
 gem install lolcat

 # Trying to remove obsolette packages after installation
 apt-get autoremove -y
 
 # Installing OpenVPN by pulling its repository inside sources.list file 
 rm -rf /etc/apt/sources.list.d/openvpn*
 echo "deb http://build.openvpn.net/debian/openvpn/release/2.4 $(lsb_release -sc) main" > /etc/apt/sources.list.d/openvpn.list
 wget -qO - http://build.openvpn.net/debian/openvpn/stable/pubkey.gpg|apt-key add -
 apt-get update
 apt-get install openvpn -y
 
 # Installing Latest Webmin
 rm -rf /etc/apt/sources.list.d/webmin*
 echo "deb http://download.webmin.com/download/repository sarge contrib" > /etc/apt/sources.list.d/webmin.list
 echo "deb http://webmin.mirror.somersettechsolutions.co.uk/repository sarge contrib" >> /etc/apt/sources.list.d/webmin.list
 wget -qO - http://www.webmin.com/jcameron-key.asc|apt-key add -
 apt-get update
 apt-get install webmin -y
}

function InstWebmin(){

 # Configuring webmin server config to use only http instead of https
 sed -i 's|ssl=1|ssl=0|g' /etc/webmin/miniserv.conf
 
 # Then restart to take effect
 systemctl restart webmin
}

function InstSSH(){
 # Removing some duplicated sshd server configs
 rm -f /etc/ssh/sshd_config*
 
 # Creating a SSH server config using cat eof tricks
 cat <<'MySSHConfig' > /etc/ssh/sshd_config
# My OpenSSH Server config
Port myPORT1
Port myPORT2
AddressFamily inet
ListenAddress 0.0.0.0
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key
PermitRootLogin yes
MaxSessions 1024
Compression yes
PubkeyAuthentication yes
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
ClientAliveInterval 240
ClientAliveCountMax 2
UseDNS no
Banner /etc/jftvban
AcceptEnv LANG LC_*
Subsystem   sftp  /usr/lib/openssh/sftp-server
MySSHConfig

 # Now we'll put our ssh ports inside of sshd_config
 sed -i "s|myPORT1|$SSH_Port1|g" /etc/ssh/sshd_config
 sed -i "s|myPORT2|$SSH_Port2|g" /etc/ssh/sshd_config

 # Download our SSH Banner
 rm -f /etc/banner
 rm -f /etc/jftvban
 wget -qO /etc/jftvban "$SSH_Banner"
 dos2unix -q /etc/jftvban

 # My workaround code to remove `BAD Password error` from passwd command, it will fix password-related error on their ssh accounts.
 sed -i '/password\s*requisite\s*pam_cracklib.s.*/d' /etc/pam.d/common-password
 sed -i 's/use_authtok //g' /etc/pam.d/common-password

 # Some command to identify null shells when you tunnel through SSH or using Stunnel, it will fix user/pass authentication error on HTTP Injector, KPN Tunnel, eProxy, SVI, HTTP Proxy Injector etc ssh/ssl tunneling apps.
 sed -i '/\/bin\/false/d' /etc/shells
 sed -i '/\/usr\/bin\/nologin/d' /etc/shells
 echo '/bin/false' >> /etc/shells
 echo '/usr/bin/nologin' >> /etc/shells
 
 # Restarting openssh service
 systemctl restart ssh
 
 # Removing some duplicate config file
 rm -rf /etc/default/dropbear*
 
 # creating dropbear config using cat eof tricks
 cat <<'MyDropbear' > /etc/default/dropbear
# My Dropbear Config
NO_START=0
DROPBEAR_PORT=PORT01
DROPBEAR_EXTRA_ARGS="-p PORT02"
DROPBEAR_BANNER="/etc/jftvban"
DROPBEAR_RSAKEY="/etc/dropbear/dropbear_rsa_host_key"
DROPBEAR_DSSKEY="/etc/dropbear/dropbear_dss_host_key"
DROPBEAR_ECDSAKEY="/etc/dropbear/dropbear_ecdsa_host_key"
DROPBEAR_RECEIVE_WINDOW=65536
MyDropbear

 # Now changing our desired dropbear ports
 sed -i "s|PORT01|$Dropbear_Port1|g" /etc/default/dropbear
 sed -i "s|PORT02|$Dropbear_Port2|g" /etc/default/dropbear
 
 # Restarting dropbear service
 systemctl restart dropbear
}


function InsOpenVPN(){
 # Checking if openvpn folder is accidentally deleted or purged
 if [[ ! -e /etc/openvpn ]]; then
  mkdir -p /etc/openvpn
 fi

 # Removing all existing openvpn server files
 rm -rf /etc/openvpn/*

 # Creating server.conf, ca.crt, server.crt and server.key

 cat <<'myOpenVPNconf' > /etc/openvpn/server_tcp.conf
# OpenVPN TCP
port OVPNTCP
proto tcp
dev tun
ca /etc/openvpn/ca.crt
cert /etc/openvpn/server.crt
key /etc/openvpn/server.key
dh /etc/openvpn/dh2048.pem
verify-client-cert none
username-as-common-name
key-direction 0
plugin /etc/openvpn/plugins/openvpn-plugin-auth-pam.so login
server 10.200.0.0 255.255.0.0
ifconfig-pool-persist ipp.txt
push "route-method exe"
push "route-delay 2"
keepalive 10 120
comp-lzo
user nobody
group nogroup
persist-key
persist-tun
status /var/www/openvpn/tcpstatus.txt
log tcp.log
verb 2
ncp-disable
cipher AES-128-CBC
auth SHA1
myOpenVPNconf

cat <<'myOpenVPNconf2' > /etc/openvpn/server_udp.conf
# OpenVPN UDP
port OVPNUDP
proto udp
dev tun
ca /etc/openvpn/ca.crt
cert /etc/openvpn/server.crt
key /etc/openvpn/server.key
dh /etc/openvpn/dh2048.pem
verify-client-cert none
username-as-common-name
key-direction 0
plugin /etc/openvpn/plugins/openvpn-plugin-auth-pam.so login
server 10.201.0.0 255.255.0.0
ifconfig-pool-persist ipp.txt
push "route-method exe"
push "route-delay 2"
keepalive 10 120
comp-lzo
user nobody
group nogroup
persist-key
persist-tun
status /var/www/openvpn/udpstatus.txt
log udp.log
verb 2
ncp-disable
cipher none
auth none
myOpenVPNconf2

 cat <<'EOF7'> /etc/openvpn/ca.crt
-----BEGIN CERTIFICATE-----
MIIFDDCCA/SgAwIBAgIJAIxbDcvh6vPEMA0GCSqGSIb3DQEBCwUAMIG0MQswCQYD
VQQGEwJQSDEPMA0GA1UECBMGVGFybGFjMRMwEQYDVQQHEwpDb25jZXBjaW9uMRMw
EQYDVQQKEwpKb2huRm9yZFRWMRMwEQYDVQQLEwpKb2huRm9yZFRWMRIwEAYDVQQD
EwlEZWJpYW5WUE4xHTAbBgNVBCkTFEpvaG4gRm9yZCBNYW5naWxpbWFuMSIwIAYJ
KoZIhvcNAQkBFhNhZG1pbkBqb2huZm9yZHR2Lm1lMB4XDTE5MTEyNTA4MDUzMFoX
DTI5MTEyMjA4MDUzMFowgbQxCzAJBgNVBAYTAlBIMQ8wDQYDVQQIEwZUYXJsYWMx
EzARBgNVBAcTCkNvbmNlcGNpb24xEzARBgNVBAoTCkpvaG5Gb3JkVFYxEzARBgNV
BAsTCkpvaG5Gb3JkVFYxEjAQBgNVBAMTCURlYmlhblZQTjEdMBsGA1UEKRMUSm9o
biBGb3JkIE1hbmdpbGltYW4xIjAgBgkqhkiG9w0BCQEWE2FkbWluQGpvaG5mb3Jk
dHYubWUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCf+WkN868YMiCl
d3z1Tq2OeRNb6ljiRGzEi1qrIvj/gXq6o0QD0SD+Nf3QWJrrJYFi1GECq72PNFhy
2jLFgZH0RRLOVZfG+jwZ9itxofweiwALvgMdz2e+mpQItMxKh1ZYkzNw+4zJ7zJV
u0Tq7YGPaMFPkLNU3V454rDYCdI8GG/wPDoW5FMc3FogI8fwylQvTWyE0yxHMxH6
FkISA5hOuSo6MO1FgAfDdNNwxa/MAbpHwJ+W6RBHv4lhE6bQePMCj/90pgt3NpxF
i++qwpSRfOR6OuuyDr1c++z6qhjLB7YzDLzj+HXCyfsPWPj+gJ0+3ckhW4gf/nhR
uB+BTd8fAgMBAAGjggEdMIIBGTAdBgNVHQ4EFgQULXGeDQBLXCPId0F3r/58FDCm
jC4wgekGA1UdIwSB4TCB3oAULXGeDQBLXCPId0F3r/58FDCmjC6hgbqkgbcwgbQx
CzAJBgNVBAYTAlBIMQ8wDQYDVQQIEwZUYXJsYWMxEzARBgNVBAcTCkNvbmNlcGNp
b24xEzARBgNVBAoTCkpvaG5Gb3JkVFYxEzARBgNVBAsTCkpvaG5Gb3JkVFYxEjAQ
BgNVBAMTCURlYmlhblZQTjEdMBsGA1UEKRMUSm9obiBGb3JkIE1hbmdpbGltYW4x
IjAgBgkqhkiG9w0BCQEWE2FkbWluQGpvaG5mb3JkdHYubWWCCQCMWw3L4erzxDAM
BgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBZUpwZ+LQWAQI8VW3hdZVN
WV+P12yYQ1UzyagtB3MqBR4aZhjk42NFBrwPZwpvWUXB0GB4DhBuvbVPtqnt5p4V
sDtQ6vKYeDlE/KDGDc0oJDsgxo2wwIXy+y/14EDqidAVjtf1rk5MDAAEVvonHxkP
861kzoIOZ0+D7sJDo3aZ8uNy8UznrRSzLDT63o28DkL3iLASyt1GHWu05wYmgzsg
m+w+AWvN5rL65mzyn/Bipf0I9snVB4saCgfy7TCI/4slOcMCNc2e6oOwOLvFA+s8
dZMt2qg62PEOj/LblYGD+qLn0xLRwqK0UWSmWobz5LXoxyssZLK2KiMkS41PHkfh
-----END CERTIFICATE-----
EOF7
 cat <<'EOF9'> /etc/openvpn/server.crt
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1 (0x1)
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=PH, ST=Tarlac, L=Concepcion, O=JohnFordTV, OU=JohnFordTV, CN=DebianVPN/name=John Ford Mangiliman/emailAddress=admin@johnfordtv.me
        Validity
            Not Before: Nov 25 08:06:59 2019 GMT
            Not After : Nov 22 08:06:59 2029 GMT
        Subject: C=PH, ST=Tarlac, L=Concepcion, O=JohnFordTV, OU=JohnFordTV, CN=DebianVPN/name=John Ford Mangiliman/emailAddress=admin@johnfordtv.me
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:c6:6d:3d:64:58:08:e2:70:9b:a3:55:75:ec:5a:
                    6e:9d:bc:7c:45:f5:64:c5:f6:23:2e:b0:1f:28:2e:
                    cb:60:8d:71:73:3d:c4:e6:f7:e3:36:0b:ad:9d:87:
                    f5:4b:2f:85:5f:d8:c9:88:d9:86:4a:52:ce:2b:39:
                    c6:b9:83:e0:7e:ab:8e:1f:2f:11:cc:08:15:12:62:
                    dd:8d:94:b1:79:3c:52:d9:cb:0a:6a:db:64:8b:ff:
                    c7:41:5c:cc:f9:18:4f:74:1a:e7:c1:b4:b8:89:fd:
                    56:5f:5c:65:c4:21:a8:08:98:3d:8e:35:44:b3:6f:
                    93:b5:01:59:b4:35:23:99:00:79:fa:44:df:b3:4c:
                    76:bf:3c:e4:f7:39:3e:50:e0:fe:85:8c:a0:e2:63:
                    b1:ec:a3:32:cd:6b:9d:5a:0e:f6:66:92:ac:6f:15:
                    5e:bb:3a:48:d9:3d:63:94:ff:9c:fb:d2:fe:5a:11:
                    b5:1a:c1:6c:8a:9e:d3:29:8d:d6:ff:fc:9f:9f:a4:
                    ad:9d:a0:ca:2b:6f:63:47:7f:7b:3c:98:bf:14:18:
                    6c:36:38:7a:c3:5d:a9:5a:26:28:12:33:9d:17:1b:
                    6f:2f:5d:33:e7:b5:8f:57:3a:3a:29:57:6a:0e:9e:
                    84:7a:60:d9:9c:fb:c7:f3:f8:93:a7:cd:43:89:ec:
                    3f:d3
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Basic Constraints:
                CA:FALSE
            Netscape Cert Type:
                SSL Server
            Netscape Comment:
                Easy-RSA Generated Server Certificate
            X509v3 Subject Key Identifier:
                50:31:04:C4:7A:47:C1:DA:46:CC:77:38:DE:1C:63:10:40:C3:80:22
            X509v3 Authority Key Identifier:
                keyid:2D:71:9E:0D:00:4B:5C:23:C8:77:41:77:AF:FE:7C:14:30:A6:8C:2E
                DirName:/C=PH/ST=Tarlac/L=Concepcion/O=JohnFordTV/OU=JohnFordTV/CN=DebianVPN/name=John Ford Mangiliman/emailAddress=admin@johnfordtv.me
                serial:8C:5B:0D:CB:E1:EA:F3:C4

            X509v3 Extended Key Usage:
                TLS Web Server Authentication
            X509v3 Key Usage:
                Digital Signature, Key Encipherment
            X509v3 Subject Alternative Name:
                DNS:server
    Signature Algorithm: sha256WithRSAEncryption
         87:59:21:fd:7d:41:c8:87:8f:ff:13:85:e9:ae:31:da:43:bc:
         48:3b:32:41:ba:65:82:9e:76:25:cd:43:8b:fc:07:16:49:c3:
         8d:bd:ad:bf:0e:f6:d3:53:35:de:f2:c6:a6:62:c2:79:e1:49:
         a5:ba:55:cf:b9:e9:58:d8:e5:02:96:0a:2a:97:7d:82:85:0b:
         38:b5:dc:0d:6b:bd:51:a6:f7:3f:71:94:90:c9:ad:51:69:15:
         24:58:04:99:96:69:40:9d:a1:9c:1c:a3:34:be:b9:c2:86:61:
         ab:18:03:9b:27:b1:9f:1d:a3:5e:29:47:16:6f:7e:55:62:93:
         57:85:45:34:2c:cb:10:2c:da:f0:9a:ee:3d:b2:92:87:d4:7e:
         1b:c7:66:22:e9:4c:a2:95:d0:df:32:1a:87:ce:8a:27:08:f2:
         87:a9:e6:eb:16:37:71:35:37:4d:8c:0e:df:12:d3:e0:63:0a:
         53:7d:c8:02:c5:34:c5:23:68:c3:ba:33:5b:ad:92:bd:e2:d0:
         9d:bc:bd:bd:0d:64:50:0f:f4:bd:91:fc:10:e0:ec:01:e8:a1:
         50:ed:79:bf:12:49:bc:a4:93:17:d6:71:ed:9e:99:f3:42:6d:
         26:b3:2d:ac:32:62:98:71:d1:e4:83:6c:58:02:e6:49:b6:c9:
         73:76:eb:8b
-----BEGIN CERTIFICATE-----
MIIFfzCCBGegAwIBAgIBATANBgkqhkiG9w0BAQsFADCBtDELMAkGA1UEBhMCUEgx
DzANBgNVBAgTBlRhcmxhYzETMBEGA1UEBxMKQ29uY2VwY2lvbjETMBEGA1UEChMK
Sm9obkZvcmRUVjETMBEGA1UECxMKSm9obkZvcmRUVjESMBAGA1UEAxMJRGViaWFu
VlBOMR0wGwYDVQQpExRKb2huIEZvcmQgTWFuZ2lsaW1hbjEiMCAGCSqGSIb3DQEJ
ARYTYWRtaW5Aam9obmZvcmR0di5tZTAeFw0xOTExMjUwODA2NTlaFw0yOTExMjIw
ODA2NTlaMIG0MQswCQYDVQQGEwJQSDEPMA0GA1UECBMGVGFybGFjMRMwEQYDVQQH
EwpDb25jZXBjaW9uMRMwEQYDVQQKEwpKb2huRm9yZFRWMRMwEQYDVQQLEwpKb2hu
Rm9yZFRWMRIwEAYDVQQDEwlEZWJpYW5WUE4xHTAbBgNVBCkTFEpvaG4gRm9yZCBN
YW5naWxpbWFuMSIwIAYJKoZIhvcNAQkBFhNhZG1pbkBqb2huZm9yZHR2Lm1lMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxm09ZFgI4nCbo1V17Fpunbx8
RfVkxfYjLrAfKC7LYI1xcz3E5vfjNgutnYf1Sy+FX9jJiNmGSlLOKznGuYPgfquO
Hy8RzAgVEmLdjZSxeTxS2csKattki//HQVzM+RhPdBrnwbS4if1WX1xlxCGoCJg9
jjVEs2+TtQFZtDUjmQB5+kTfs0x2vzzk9zk+UOD+hYyg4mOx7KMyzWudWg72ZpKs
bxVeuzpI2T1jlP+c+9L+WhG1GsFsip7TKY3W//yfn6StnaDKK29jR397PJi/FBhs
Njh6w12pWiYoEjOdFxtvL10z57WPVzo6KVdqDp6EemDZnPvH8/iTp81Diew/0wID
AQABo4IBmDCCAZQwCQYDVR0TBAIwADARBglghkgBhvhCAQEEBAMCBkAwNAYJYIZI
AYb4QgENBCcWJUVhc3ktUlNBIEdlbmVyYXRlZCBTZXJ2ZXIgQ2VydGlmaWNhdGUw
HQYDVR0OBBYEFFAxBMR6R8HaRsx3ON4cYxBAw4AiMIHpBgNVHSMEgeEwgd6AFC1x
ng0AS1wjyHdBd6/+fBQwpowuoYG6pIG3MIG0MQswCQYDVQQGEwJQSDEPMA0GA1UE
CBMGVGFybGFjMRMwEQYDVQQHEwpDb25jZXBjaW9uMRMwEQYDVQQKEwpKb2huRm9y
ZFRWMRMwEQYDVQQLEwpKb2huRm9yZFRWMRIwEAYDVQQDEwlEZWJpYW5WUE4xHTAb
BgNVBCkTFEpvaG4gRm9yZCBNYW5naWxpbWFuMSIwIAYJKoZIhvcNAQkBFhNhZG1p
bkBqb2huZm9yZHR2Lm1lggkAjFsNy+Hq88QwEwYDVR0lBAwwCgYIKwYBBQUHAwEw
CwYDVR0PBAQDAgWgMBEGA1UdEQQKMAiCBnNlcnZlcjANBgkqhkiG9w0BAQsFAAOC
AQEAh1kh/X1ByIeP/xOF6a4x2kO8SDsyQbplgp52Jc1Di/wHFknDjb2tvw7201M1
3vLGpmLCeeFJpbpVz7npWNjlApYKKpd9goULOLXcDWu9Uab3P3GUkMmtUWkVJFgE
mZZpQJ2hnByjNL65woZhqxgDmyexnx2jXilHFm9+VWKTV4VFNCzLECza8JruPbKS
h9R+G8dmIulMopXQ3zIah86KJwjyh6nm6xY3cTU3TYwO3xLT4GMKU33IAsU0xSNo
w7ozW62SveLQnby9vQ1kUA/0vZH8EODsAeihUO15vxJJvKSTF9Zx7Z6Z80JtJrMt
rDJimHHR5INsWALmSbbJc3briw==
-----END CERTIFICATE-----
EOF9
 cat <<'EOF10'> /etc/openvpn/server.key
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGbT1kWAjicJuj
VXXsWm6dvHxF9WTF9iMusB8oLstgjXFzPcTm9+M2C62dh/VLL4Vf2MmI2YZKUs4r
Oca5g+B+q44fLxHMCBUSYt2NlLF5PFLZywpq22SL/8dBXMz5GE90GufBtLiJ/VZf
XGXEIagImD2ONUSzb5O1AVm0NSOZAHn6RN+zTHa/POT3OT5Q4P6FjKDiY7HsozLN
a51aDvZmkqxvFV67OkjZPWOU/5z70v5aEbUawWyKntMpjdb//J+fpK2doMorb2NH
f3s8mL8UGGw2OHrDXalaJigSM50XG28vXTPntY9XOjopV2oOnoR6YNmc+8fz+JOn
zUOJ7D/TAgMBAAECggEBALidRIRKwCFmIfhKeAfqb4aEqp8wXI0un7c9mA970i9I
CijtbHh0ZEqRfPvXViqY0R/HBGM195LJDhb7j2BlSYaxOO7cjVNmpaxQnc+va5vf
uzn1hgC7lQYIeSvgGrkbnDjrG3uHGDcSpLzeq7RamAs/Ee5wszW7dxLuabaXxkH/
owRXl6wvwD1WNGZsWJe8eP6GtBePm9+Ls5VLN0DPWyuJCFxhN/VpvvphECFt7EPF
qY+ysAFqfSYkCyH7OklnLIx1jQ04iLbZ4HI+S9QH+w1261fDgCXAmf1kgXkgLaM6
4wK+e93JRyqw87NZZIKN3ooq35n6wAUaS2erIYQFjrkCgYEA5c6qeNORIuq4F1jP
JS9aaXEjaAKIgw20qTyZfhQv6AhkJ7GASgWSdBIIfZQo1JG4EsXwqQ/0x9EwDOVu
glTYMT3tMi0zrzMklYS1G8iQElywAfTro/8sngfimvkQeRljoNdlrzO4+knUXmV8
DymPDH6UGlhj2FwCFN+obhT1f48CgYEA3QrzBK+YRu6iqeMuifwXlcbUS/A+dBPJ
qoYDzM6Zc0LYRTZSqhEHC8XkcQp/18LUxXFSrZXP2lcKmkqg4pgeAxALRLJW2pfz
yAm1Hah5JXlvTjX4HnMTFL4fvB0oGZXsAimPNa/wUZvTSPYJRziZdEwVubW3AAxE
THN3qxXoGX0CgYAWeSxwnnf+CygvmE7BmyzjTN4iiMTi1A9L0ZJNIxpAPbnVq+UY
2AynbzAHX9rSVuHCbDsJvXa5p7pkOHejJTrzLdQpaQQ56O119cFkUyvLr+bCejol
EopBdhHyB9NVlGcKzqWyCYPYbinnhVMphG3p0eMX5Hb3LKBDfE/TXBdZ/wKBgEwe
3iup8M3Ulk3c/4TjPJgGvctc85Tzz4oa1qosJ6oKxgGnwHXyoTOLtay8CeSaor1P
1kITCl5NhUg3FQqTihpR5x+ELubeV0R3G1kYUIf4Nr1/Vm/d/x8wjisw+0M8Xucr
urapXSAtgmho2i8drbLgFMc8bcXlc4vEY9yWEbTdAoGAMa6KTb0U9M47mpJb23zu
WiO8mFqSPYAnhHmXOiBOPlCoVpRbPquk3Xq32g9KU97jPNrH4X2HKgYpboMTWYOJ
kR3Y5UeFF1xurA/RXUEREcP1zg6Uei5aj7S4Sp7CVfIQCOpJ8S/I4CZdAcvwY+pI
ZTC1+KZJbFyPwFcrIylEeBc=
-----END PRIVATE KEY-----
EOF10
 cat <<'EOF13'> /etc/openvpn/dh2048.pem
-----BEGIN DH PARAMETERS-----
MIIBCAKCAQEAlrn8QcDrwXzqWCI7NMhPJVgEjdSxvyHw3EDVN8JrVfMegnvZA0VZ
St3hduXTzlT7ceUGIxTJpM8RE6d3f1mMPnZJ4hBxJzzjrwMgSCupJrQDjSAIWGLZ
elcmJS6WOAibpxzFIiPB6pRjoLaJF8b/J+YnO0bLUt1senWkg9ql8mU74VM1aG3A
jOPztpLqYIRwla11bqAl4UcFLBI+PXAcPJsAIfzZ3DMn7aOa3Or6UjSmVQ8jGY/8
1F0T67NgB8U7FrOVNimRlWfSJ//FiJkP0PScHVX2NQ0Cgwdo+wekjoFN5xbPxicc
LxNkdRPpCACgzdo1M77xVsurtfcxsz+RswIBAg==
-----END DH PARAMETERS-----
EOF13

 # Getting all dns inside resolv.conf then use as Default DNS for our openvpn server
 grep -v '#' /etc/resolv.conf | grep 'nameserver' | grep -E -o '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | while read -r line; do
	echo "push \"dhcp-option DNS $line\"" >> /etc/openvpn/server_tcp.conf
done

 # Creating a New update message in server.conf
 cat <<'NUovpn' > /etc/openvpn/server.conf
 # New Update are now released, OpenVPN Server
 # are now running both TCP and UDP Protocol. (Both are only running on IPv4)
 # But our native server.conf are now removed and divided
 # Into two different configs base on their Protocols:
 #  * OpenVPN TCP (located at /etc/openvpn/server_tcp.conf
 #  * OpenVPN UDP (located at /etc/openvpn/server_udp.conf
 # 
 # Also other logging files like
 # status logs and server logs
 # are moved into new different file names:
 #  * OpenVPN TCP Server logs (/etc/openvpn/tcp.log)
 #  * OpenVPN UDP Server logs (/etc/openvpn/udp.log)
 #  * OpenVPN TCP Status logs (/etc/openvpn/tcp_stats.log)
 #  * OpenVPN UDP Status logs (/etc/openvpn/udp_stats.log)
 #
 # Server ports are configured base on env vars
 # executed/raised from this script (OpenVPN_TCP_Port/OpenVPN_UDP_Port)
 #
 # Enjoy the new update
 # Script by JohnFordTV

NUovpn

 # setting openvpn server port
 sed -i "s|OVPNTCP|$OpenVPN_TCP_Port|g" /etc/openvpn/server_tcp.conf
 sed -i "s|OVPNUDP|$OpenVPN_UDP_Port|g" /etc/openvpn/server_udp.conf
 
 # Getting some OpenVPN plugins for unix authentication
 cd
 wget https://www.dropbox.com/s/2g5cpf5fkd4o5ow/plugin.tgz
 tar -xzvf /root/plugin.tgz -C /etc/openvpn/
 rm -f plugin.tgz
 
 # Some workaround for OpenVZ machines for "Startup error" openvpn service
 if [[ "$(hostnamectl | grep -i Virtualization | awk '{print $2}' | head -n1)" == 'openvz' ]]; then
 sed -i 's|LimitNPROC|#LimitNPROC|g' /lib/systemd/system/openvpn*
 systemctl daemon-reload
fi

 # Allow IPv4 Forwarding
 sed -i '/net.ipv4.ip_forward.*/d' /etc/sysctl.conf
 sed -i '/net.ipv4.ip_forward.*/d' /etc/sysctl.d/*.conf
 echo 'net.ipv4.ip_forward=1' > /etc/sysctl.d/20-openvpn.conf
 sysctl --system &> /dev/null
 
 # Iptables Rule for Anti DDoS 
 cat <<'ADDOS' > /etc/openvpn/antiddos.bash
#!/bin/bash
#JohnFordTV Anti DDoS Script
# Drop all invalid packets
iptables -A INPUT -m state --state INVALID -j DROP
iptables -A FORWARD -m state --state INVALID -j DROP
iptables -A OUTPUT -m state --state INVALID -j DROP

# Attempt to block portscans
# Anyone who tried to portscan us is locked out for an entire day.
iptables -A INPUT   -m recent --name portscan --rcheck --seconds 86400 -j DROP
iptables -A FORWARD -m recent --name portscan --rcheck --seconds 86400 -j DROP

# Once the day has passed, remove them from the portscan list
iptables -A INPUT   -m recent --name portscan --remove
iptables -A FORWARD -m recent --name portscan --remove

# These rules add scanners to the portscan list, and log the attempt.
iptables -A INPUT   -p tcp -m tcp --dport 139 -m recent --name portscan --set -j LOG --log-prefix "Portscan:"
iptables -A INPUT   -p tcp -m tcp --dport 139 -m recent --name portscan --set -j DROP

iptables -A FORWARD -p tcp -m tcp --dport 139 -m recent --name portscan --set -j LOG --log-prefix "Portscan:"
iptables -A FORWARD -p tcp -m tcp --dport 139 -m recent --name portscan --set -j DROP
ADDOS
 chmod +x /etc/openvpn/antiddos.bash
 bash /etc/openvpn/antiddos.bash
 
 # Iptables Rule for Anti Torrent
 cat <<'ATorrent' > /etc/openvpn/antitorrent.bash
#!/bin/bash
#JohnFordTV Anti Torrent Script
iptables -A FORWARD -m string --algo bm --string "BitTorrent" -j DROP
iptables -A FORWARD -m string --algo bm --string "BitTorrent protocol" -j DROP
iptables -A FORWARD -m string --algo bm --string "peer_id=" -j DROP
iptables -A FORWARD -m string --algo bm --string ".torrent" -j DROP
iptables -A FORWARD -m string --algo bm --string "announce.php?passkey=" -j DROP
iptables -A FORWARD -m string --algo bm --string "torrent" -j DROP
iptables -A FORWARD -m string --algo bm --string "announce" -j DROP
iptables -A FORWARD -m string --algo bm --string "info_hash" -j DROP
ATorrent
 chmod +x /etc/openvpn/antitorrent.bash
 bash /etc/openvpn/antitorrent.bash

 # Iptables Rule for OpenVPN server
 cat <<'EOFipt' > /etc/openvpn/openvpn.bash
#!/bin/bash
PUBLIC_INET="$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)' | head -1)"
IPCIDR='10.200.0.0/16'
IPCIDR2='10.201.0.0/16'
iptables -I FORWARD -s $IPCIDR -j ACCEPT
iptables -I FORWARD -s $IPCIDR2 -j ACCEPT
iptables -t nat -A POSTROUTING -o $PUBLIC_INET -j MASQUERADE
iptables -t nat -A POSTROUTING -s $IPCIDR -o $PUBLIC_INET -j MASQUERADE
iptables -t nat -A POSTROUTING -s $IPCIDR2 -o $PUBLIC_INET -j MASQUERADE
EOFipt
 chmod +x /etc/openvpn/openvpn.bash
 bash /etc/openvpn/openvpn.bash

 # Enabling IPv4 Forwarding
 echo 1 > /proc/sys/net/ipv4/ip_forward
 
 # Starting OpenVPN server
 systemctl start openvpn@server_tcp
 systemctl enable openvpn@server_tcp
 systemctl start openvpn@server_udp
 systemctl enable openvpn@server_udp
 
  # Pulling OpenVPN no internet fixer script
 wget -qO /etc/openvpn/openvpn2.bash "https://www.dropbox.com/s/zw8552ctl000wws/openvpn.bash"
 chmod +x /etc/openvpn/openvpn2.bash
 service openvpn restart
}

function OvpnConfigs(){
 # Creating nginx config for our ovpn config downloads webserver
 cat <<'myNginxC' > /etc/nginx/conf.d/JohnFordTV-ovpn-config.conf
# My OpenVPN Config Download Directory
server {
 listen 0.0.0.0:myNginx;
 server_name localhost;
 root /var/www/openvpn;
 index index.html;
}
myNginxC

 # Setting our nginx config port for .ovpn download site
 sed -i "s|myNginx|$OvpnDownload_Port|g" /etc/nginx/conf.d/JohnFordTV-ovpn-config.conf

 # Removing Default nginx page(port 80)
 rm -rf /etc/nginx/sites-*

 # Creating our root directory for all of our .ovpn configs
 rm -rf /var/www/openvpn
 mkdir -p /var/www/openvpn

 # Now creating all of our OpenVPN Configs 
 
 cat <<'EOF' > /var/www/openvpn/tcpstatus.txt

EOF
 cat <<'EOF' > /var/www/openvpn/udpstatus.txt

EOF
 # Change permission of Status Files
 chmod 775 /var/www/openvpn/*
 
cat <<EOF17> /var/www/openvpn/DebianTCP.ovpn
# JohnFordTV's VPN Premium Script
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090
# Thanks for using this script, Enjoy Highspeed OpenVPN Service
client
dev tun
proto tcp-client
setenv FRIENDLY_NAME "JohnFordTV"
remote $IPADDR $OpenVPN_TCP_Port
remote-cert-tls server
bind
float
mssfix 1450
mute-replay-warnings
connect-retry-max 9999
redirect-gateway def1
connect-retry 0 1
resolv-retry infinite
setenv CLIENT_CERT 0
persist-tun
persist-key
auth-user-pass
auth SHA1
auth-nocache
auth-retry interact
cipher AES-128-CBC
comp-lzo
reneg-sec 0
verb 0
log /dev/null
setenv opt block-outside-dns 
<ca>
$(cat /etc/openvpn/ca.crt)
</ca>
EOF17

cat <<EOF17> /var/www/openvpn/DebianSTUNNEL.ovpn
# JohnFordTV's VPN Premium Script
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090
# Thanks for using this script, Enjoy Highspeed OpenVPN Service
auth-user-pass
client
dev tun
proto tcp
setenv FRIENDLY_NAME "JohnFordTV"
remote 127.0.0.1 $OpenVPN_TCP_Port
route $IPADDR 255.255.255.255 net_gateway
nobind
persist-key
persist-tun
comp-lzo
keepalive 10 120
tls-client
remote-cert-tls server
verb 0
auth-user-pass
cipher AES-128-CBC
auth SHA1
auth-nocache
auth-retry interact
connect-retry 0 1
nice -20
reneg-sec 0
redirect-gateway def1
dhcp-option DNS 1.1.1.1
dhcp-option DNS 1.0.0.1
log /dev/null
setenv opt block-outside-dns 
<ca>
$(cat /etc/openvpn/ca.crt)
</ca>
EOF17

cat <<EOF17> /var/www/openvpn/DebianSSL.ovpn
# JohnFordTV's VPN Premium Script
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090
# Thanks for using this script, Enjoy Highspeed OpenVPN Service
auth-user-pass
client
dev tun
proto udp
setenv FRIENDLY_NAME "JohnFordTV"
remote $IPADDR $OpenVPN_UDP_Port
rport $Stunnel_Port3
nobind
fast-io
persist-key
persist-tun
comp-lzo
keepalive 10 120
tls-client
remote-cert-tls server
verb 0
auth-user-pass
cipher AES-128-CBC
auth SHA1
auth-nocache
auth-retry interact
connect-retry 0 1
reneg-sec 0
redirect-gateway def1
dhcp-option DNS 1.1.1.1
dhcp-option DNS 1.0.0.1
log /dev/null
setenv opt block-outside-dns 
<ca>
$(cat /etc/openvpn/ca.crt)
</ca>
EOF17
 
cat <<EOF162> /var/www/openvpn/DebianUDP.ovpn
# JohnFordTV's VPN Premium Script
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090
# Thanks for using this script, Enjoy Highspeed OpenVPN Service
client
dev tun
proto udp
setenv FRIENDLY_NAME "JohnFordTV"
remote $IPADDR $OpenVPN_UDP_Port
remote-cert-tls server
resolv-retry infinite
float
fast-io
nobind
persist-key
persist-remote-ip
persist-tun
auth-user-pass
auth none
auth-nocache
cipher none
comp-lzo
redirect-gateway def1
setenv CLIENT_CERT 0
reneg-sec 0
verb 1
<ca>
$(cat /etc/openvpn/ca.crt)
</ca>
EOF162

 # Creating OVPN download site index.html
cat <<'mySiteOvpn' > /var/www/openvpn/index.html
<!DOCTYPE html>
<html lang="en"

<!-- Simple OVPN Download site by DebianVPN -->

<head><meta charset="utf-8" /><title>DebianVPN OVPN Config Download</title><meta name="description" content="DebianVPN Server" /><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" /><meta name="theme-color" content="#000000" /><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css"><link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet"><link href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.8.3/css/mdb.min.css" rel="stylesheet"></head><body><div class="container justify-content-center" style="margin-top:9em;margin-bottom:5em;"><div class="col-md"><div class="view"><img src="https://openvpn.net/wp-content/uploads/openvpn.jpg" class="card-img-top"><div class="mask rgba-white-slight"></div></div><div class="card"><div class="card-body"><h5 class="card-title">List Config</h5><br /><ul class="list-group"><li class="list-group-item justify-content-between align-items-center" style="margin-bottom:1em;"><p>Config TCP <span class="badge light-blue darken-4">Android/iOS</span><br /><small> Please press the Download button to the right of this</small></p><a class="btn btn-outline-success waves-effect btn-sm" href="http://IP-ADDRESS:NGINXPORT/DebianTCP.ovpn" style="float:right;"><i class="fa fa-download"></i> Download</a></li><li class="list-group-item justify-content-between align-items-center" style="margin-bottom:1em;"><p>Config UDP<span class="badge light-blue darken-4">Android/iOS</span><br /><small> Please press the Download button to the right of this</small></p><a class="btn btn-outline-success waves-effect btn-sm" href="http://IP-ADDRESS:NGINXPORT/DebianUDP.ovpn" style="float:right;"><i class="fa fa-download"></i> Download</a></li></ul></div></div></div></div></body></html>
mySiteOvpn

 
 # Setting template's correct name,IP address and nginx Port
 sed -i "s|MyScriptName|$MyScriptName|g" /var/www/openvpn/index.html
 sed -i "s|NGINXPORT|$OvpnDownload_Port|g" /var/www/openvpn/index.html
 sed -i "s|IP-ADDRESS|$IPADDR|g" /var/www/openvpn/index.html

 # Restarting nginx service
 systemctl restart nginx
 
 # Creating all .ovpn config archives
 cd /var/www/openvpn
 zip -qq -r configs.zip *.ovpn
 cd
}

function ip_address(){
  local IP="$( ip addr | egrep -o '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | egrep -v "^192\.168|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-2]\.|^10\.|^127\.|^255\.|^0\." | head -n 1 )"
  [ -z "${IP}" ] && IP="$( wget -qO- -t1 -T2 ipv4.icanhazip.com )"
  [ -z "${IP}" ] && IP="$( wget -qO- -t1 -T2 ipinfo.io/ip )"
  [ ! -z "${IP}" ] && echo "${IP}" || echo
} 
IPADDR="$(ip_address)"

function ConfStartup(){
 # Daily reboot time of our machine
 # For cron commands, visit https://crontab.guru
 echo -e "0 4\t* * *\troot\treboot" > /etc/cron.d/b_reboot_job
 echo -e "*/5 * * * * root /bin/bash /etc/JFTVrecon/autorecon.sh" > /etc/cron.d/reconcron
 echo -e "@reboot root /bin/bash /etc/JFTVrecon/autorecon.sh" > /etc/cron.d/reconcronr


 # Creating directory for startup script
 rm -rf /etc/DebianVPN
 mkdir -p /etc/DebianVPN
 chmod -R 755 /etc/DebianVPN
 
 # Creating SSH Autorecon for Dropbear 550
 rm -rf /etc/JFTVrecon
 mkdir -p /etc/JFTVrecon
 chmod -R 755 /etc/JFTVrecon
 
 cat <<'RECON' > /etc/JFTVrecon/recon.sh
#!/bin/bash

fuser -k 550/tcp && /etc/init.d/dropbear restart
RECON

 cat <<'RECON2' > /etc/JFTVrecon/autorecon.sh
#!/bin/bash

/etc/JFTVrecon/recon.sh && sleep 50 && /etc/JFTVrecon/recon.sh && sleep 50 && /etc/JFTVrecon/recon.sh && sleep 50 && /etc/JFTVrecon/recon.sh && sleep 50 && /etc/JFTVrecon/recon.sh &&sleep 50 && /etc/JFTVrecon/recon.sh
RECON2

 chmod +x /etc/JFTVrecon/autorecon.sh
 chmod +x /etc/JFTVrecon/recon.sh

 
 # Creating startup script using cat eof tricks
 cat <<'EOFSH' > /etc/DebianVPN/startup.sh
#!/bin/bash
# Setting server local time
ln -fs /usr/share/zoneinfo/MyVPS_Time /etc/localtime

# Prevent DOS-like UI when installing using APT (Disabling APT interactive dialog)
export DEBIAN_FRONTEND=noninteractive

# Allowing ALL TCP ports for our machine (Simple workaround for policy-based VPS)
iptables -A INPUT -s $(wget -4qO- http://ipinfo.io/ip) -p tcp -m multiport --dport 1:65535 -j ACCEPT

# Allowing OpenVPN to Forward traffic
/bin/bash /etc/openvpn/openvpn.bash

# Blocking torrent usage with IP Tables
/bin/bash /etc/openvpn/antitorrent.bash

# Blocking DDOS attacks 
/bin/bash /etc/openvpn/antiddos.bash

# Deleting Expired SSH Accounts
/usr/local/bin/user-delete-expired &> /dev/null
exit 0
EOFSH
 chmod +x /etc/DebianVPN/startup.sh
 
 # Setting server local time every time this machine reboots
 sed -i "s|MyVPS_Time|$MyVPS_Time|g" /etc/DebianVPN/startup.sh

 # 
 rm -rf /etc/sysctl.d/99*

 # Setting our startup script to run every machine boots 
 cat <<'KaizenServ' > /etc/systemd/system/DebianVPN.service
[Unit]
Description=DebianVPN Startup Script
Before=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/bin/bash /etc/DebianVPN/startup.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
KaizenServ
 chmod +x /etc/systemd/system/DebianVPN.service
 systemctl daemon-reload
 systemctl start DebianVPN
 systemctl enable DebianVPN &> /dev/null
 systemctl enable fail2ban &> /dev/null
 systemctl start fail2ban &> /dev/null

 # Rebooting cron service
 systemctl restart cron
 systemctl enable cron
 
}
 #Create Admin
 useradd admin
 echo "admin:itangsagli" | chpasswd

function ConfMenu(){
echo -e " Creating Menu scripts.." | lolcat

cd /usr/local/sbin/
rm -rf {accounts,base-ports,base-ports-wc,base-script,bench-network,clearcache,connections,create,create_random,create_trial,delete_expired,diagnose,edit_dropbear,edit_openssh,edit_openvpn,edit_ports,edit_squid3,edit_stunnel4,locked_list,menu,options,ram,reboot_sys,reboot_sys_auto,restart_services,server,set_multilogin_autokill,set_multilogin_autokill_lib,show_ports,speedtest,user_delete,user_details,user_details_lib,user_extend,user_list,user_lock,user_unlock}
wget -q 'https://www.dropbox.com/s/i9pb2i8k8yu6sry/bashmenu.zip'
unzip -qq bashmenu.zip
rm -f bashmenu.zip
chmod +x ./*
dos2unix ./* &> /dev/null
sed -i 's|/etc/squid/squid.conf|/etc/privoxy/config|g' ./*
sed -i 's|http_port|listen-address|g' ./*
cd ~
}

function ScriptMessage(){
 echo -e " $MyScriptName"  | lolcat
 echo -e ""
 echo -e " https://fb.com/johndesu090"
 echo -e "[GCASH] 09206200840 [PAYONEER] admin@johnfordtv.tech"
 echo -e ""
}

function InstPassword(){
read -p "Enter Script Password: " pwd
if test $pwd == "@johnfordtv"; then
echo "Password Accepted!"
else
echo "Password Incorrect!"
sleep 2
exit
fi
}

function InstBadVPN(){
 # Pull BadVPN Binary 64bit or 32bit
if [ "$(getconf LONG_BIT)" == "64" ]; then
 wget -O /usr/bin/badvpn-udpgw "https://www.dropbox.com/s/vttdpw9e4r9owt5/badvpn-udpgw64"
else
 wget -O /usr/bin/badvpn-udpgw "https://www.dropbox.com/s/db0uqdndpsra8h4/badvpn-udpgw"
fi
 # Set BadVPN to Start on Boot via .profile
 sed -i '$ i\screen -AmdS badvpn badvpn-udpgw --listen-addr 127.0.0.1:7300' /root/.profile
 # Change Permission to make it Executable
 chmod +x /usr/bin/badvpn-udpgw
 # Start BadVPN via Screen
 screen -AmdS badvpn badvpn-udpgw --listen-addr 127.0.0.1:7300
}

#############################################
#############################################
########## Installation Process##############
#############################################
## WARNING: Do not modify or edit anything
## if you did'nt know what to do.
## This part is too sensitive.
#############################################
#############################################

 # First thing to do is check if this machine is Debian
 source /etc/os-release
if [[ "$ID" != 'debian' ]]; then
 ScriptMessage
 echo -e "[\e[1;31mError\e[0m] This script is for Debian only, exiting..." 
 exit 1
fi

 # Now check if our machine is in root user, if not, this script exits
 # If you're on sudo user, run `sudo su -` first before running this script
 if [[ $EUID -ne 0 ]];then
 ScriptMessage
 echo -e "[\e[1;31mError\e[0m] This script must be run as root, exiting..."
 exit 1
fi

 # (For OpenVPN) Checking it this machine have TUN Module, this is the tunneling interface of OpenVPN server
 if [[ ! -e /dev/net/tun ]]; then
 echo -e "[\e[1;31mError\e[0m] You cant use this script without TUN Module installed/embedded in your machine, file a support ticket to your machine admin about this matter"
 echo -e "[\e[1;31m-\e[0m] Script is now exiting..."
 exit 1
fi

 # Begin Installation by Updating and Upgrading machine and then Installing all our wanted packages/services to be install.
 InstPassword
 sleep 1
 InstUpdates
 ScriptMessage
 sleep 10
 
 # Configure OpenSSH and Dropbear
 echo -e "Configuring ssh... "  | lolcat
 InstSSH
 
 # Configure BadVPN UDPGW
 echo -e "Configuring BadVPN UDPGW... " | lolcat
 InstBadVPN
 
 # Configure Webmin
 echo -e "Configuring webmin..." | lolcat
 InstWebmin
 
 # Configure OpenVPN
 echo -e "Configuring OpenVPN... " | lolcat
 InsOpenVPN
 
 # Configuring Nginx OVPN config download site
 OvpnConfigs

 # Some assistance and startup scripts
 ConfStartup

 # VPS Menu script v1.0
 ConfMenu
 
 # Setting server local time
 ln -fs /usr/share/zoneinfo/$MyVPS_Time /etc/localtime
 
 clear
 cd ~
 
#Install Figlet
apt-get install figlet
apt-get install cowsay fortune-mod -y
ln -s /usr/games/cowsay /bin
ln -s /usr/games/fortune /bin
echo "clear" >> .bashrc
echo 'echo -e ""' >> .bashrc
echo 'echo -e ""' >> .bashrc
echo 'cowsay -f dragon "WELCOME MY BOSS." | lolcat' >> .bashrc
echo 'figlet -k JOHNFORDTV' >> .bashrc
echo 'echo -e ""' >> .bashrc
echo 'echo -e "     =========================================================" | lolcat' >> .bashrc
echo 'echo -e "     *                  WELCOME TO VPS SERVER                *" | lolcat' >> .bashrc
echo 'echo -e "     =========================================================" | lolcat' >> .bashrc
echo 'echo -e "     *                 Autoscript By JohnFordTV              *" | lolcat' >> .bashrc
echo 'echo -e "     *                   Debian 9 & Debian 10                *" | lolcat' >> .bashrc
echo 'echo -e "     *                    Facebook: johndesu090              *" | lolcat' >> .bashrc
echo 'echo -e "     =========================================================" | lolcat' >> .bashrc
echo 'echo -e "     *     Type \033[1;32mmenu\033[0m to enter commands      *"' >> .bashrc
echo 'echo -e "     =========================================================" | lolcat' >> .bashrc
echo 'echo -e ""' >> .bashrc

 
 # Showing script's banner message
 ScriptMessage
 sleep 10
 
 # Showing additional information from installating this script
echo " "
echo "The server is 100% installed. Please read the server rules and reboot your VPS!"
echo " "
echo "--------------------------------------------------------------------------------"
echo "*                            Debian Premium Script                             *"
echo "*                                 -JohnFordTV-                                 *"
echo "--------------------------------------------------------------------------------"
echo ""  | tee -a log-install.txt
echo "-------------------"  | tee -a log-install.txt
echo "Server Information "  | tee -a log-install.txt
echo "-------------------"  | tee -a log-install.txt
echo "   - Timezone    : Asia/Manila (GMT +8)"  | tee -a log-install.txt
echo "   - Fail2Ban    : [ON]"  | tee -a log-install.txt
echo "   - IPtables    : [ON]"  | tee -a log-install.txt
echo "   - Auto-Reboot : [ON]"  | tee -a log-install.txt
echo "   - IPv6        : [OFF]"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo "--------------------------------"  | tee -a log-install.txt
echo "Application and Port Information"  | tee -a log-install.txt
echo "--------------------------------"  | tee -a log-install.txt
echo "   - OpenVPN		: TCP $OpenVPN_TCP_Port UDP $OpenVPN_UDP_Port SSL $Stunnel_Port3 "  | tee -a log-install.txt
echo "   - OpenSSH		: Port1: $SSH_Port1 Port2: $SSH_Port2"  | tee -a log-install.txt
echo "   - Dropbear		: Autorecon: $Dropbear_Port1 Normal: $Dropbear_Port2"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo "--------------------"  | tee -a log-install.txt
echo "Important information"  | tee -a log-install.txt
echo "--------------------"  | tee -a log-install.txt
echo "   - Installation Log    : cat /root/log-install.txt"  | tee -a log-install.txt
echo "   - Webmin              : http://$IPADDR:10000/"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo "------------------------"  | tee -a log-install.txt
echo "OpenVPN Configs Download"  | tee -a log-install.txt
echo "------------------------"  | tee -a log-install.txt
echo " Download Link Web        : http://$IPADDR:$OvpnDownload_Port" | tee -a log-install.txt
echo " Download Link Direct     : http://$IPADDR/configs.zip"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo "-----------------------"  | tee -a log-install.txt
echo "Premium Script Information"  | tee -a log-install.txt
echo "-----------------------"  | tee -a log-install.txt
echo "To display the menu list, please type: menu"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo " ©JohnFordTV"  | tee -a log-install.txt
echo ""  | tee -a log-install.txt
echo "---------------------------- REBOOT YOUR VPS! -----------------------------"

 # Clearing all logs from installation
rm -rf /root/.bash_history && history -c && echo '' > /var/log/syslog
rm -f setup*

#!/bin/bash
# JohnFordTV's VPN Premium Script (CentOS 6)
# © Github.com/johndesu090
# Official Repository: https://github.com/johndesu090/
# For Updates, Suggestions, and Bug Reports, Join to my Messenger Groupchat(VPS Owners): https://m.me/join/AbbHxIHfrY9SmoBO
# For Donations, Im accepting prepaid loads or GCash transactions:
# Smart: 09206200840
# Facebook: https://fb.me/johndesu090
# Thanks for using this script, Enjoy Highspeed OpenVPN Service
ln -fs /usr/share/zoneinfo/Asia/Manila /etc/localtime
#change this according to your database details
#Note: Password w/ Special Characters are not allowed.
dbhost='166.62.26.11';
dbuser='phsntnlvpn2';
dbpass='@xcarlx01';
dbname='phsntnlvpn1';
dbport='3306';


#<ca> certs
cacert='-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----';
servercert='Certificate:
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
-----END CERTIFICATE-----';
serverkey='-----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----';
dh='-----BEGIN DH PARAMETERS-----
MIIBCAKCAQEAlrn8QcDrwXzqWCI7NMhPJVgEjdSxvyHw3EDVN8JrVfMegnvZA0VZ
St3hduXTzlT7ceUGIxTJpM8RE6d3f1mMPnZJ4hBxJzzjrwMgSCupJrQDjSAIWGLZ
elcmJS6WOAibpxzFIiPB6pRjoLaJF8b/J+YnO0bLUt1senWkg9ql8mU74VM1aG3A
jOPztpLqYIRwla11bqAl4UcFLBI+PXAcPJsAIfzZ3DMn7aOa3Or6UjSmVQ8jGY/8
1F0T67NgB8U7FrOVNimRlWfSJ//FiJkP0PScHVX2NQ0Cgwdo+wekjoFN5xbPxicc
LxNkdRPpCACgzdo1M77xVsurtfcxsz+RswIBAg==
-----END DH PARAMETERS-----';
RED='\033[01;31m';
RESET='\033[0m';
GREEN='\033[01;32m';
WHITE='\033[01;37m';
YELLOW='\033[00;33m';

echo -e "$GREEN                Please Wait... $RESET"
sleep 3s
echo -e "$GREEN                Installing Updates $RESET"
yum update -y
clear
echo -e "$GREEN                Updates Done  $RESET"
sleep 3s
echo -e "$GREEN                Lets install the required packages. $RESET"
sleep 3s
clear
echo -e "$GREEN                Please Wait... $RESET"
yum update -y &> /dev/null
yum install -y telnet telnet-server vixie-cron crontabs httpd nano squid mysql-server &> /dev/null
yum install -y php php-pdo php-mysqli php-mysql php-mbstring.x86_64 epel-release &> /dev/null
yum install -y openvpn curl sudo &> /dev/null
MYIP=$(curl -4 icanhazip.com); &> /dev/null
echo -e "$GREEN                Installation Complete $RESET"
echo -e "$GREEN                Lets configure the settings and routing $RESET"
sleep 4s
clear
echo -e "$GREEN                Please wait while we are fighting with your firewall $RESET"
sleep 4s

#ethernet
ethernet=""

echo "**********************************************************************************"
echo -e " Note: Your Network Interface is followed by the word \e[1;31m' dev '\e[0m"
echo " If the interface doesnt match openvpn will be connected but no internet access."
echo " Please choose or type properly"
echo "**********************************************************************************"
echo ""
echo "Your Network Interface is:"
ip route | grep default
echo ""
echo "Ethernet:"
read ethernet
echo ""
echo ""
clear;

## making script and keys
mkdir /etc/openvpn/script
mkdir /etc/openvpn/log
mkdir /etc/openvpn/keys
mkdir /var/www/html/status
touch /var/www/html/status/tcp2.txt
cat << EOF > /etc/openvpn/keys/ca.crt
$cacert
EOF

cat << EOF > /etc/openvpn/keys/server.crt
$servercert
EOF

cat << EOF > /etc/openvpn/keys/server.key
$serverkey
EOF

cat << EOF > /etc/openvpn/keys/dh2048.pem
$dh
EOF

cat << EOF > /etc/openvpn/script/config.sh
#!/bin/bash
##Dababase Server
HOST='$dbhost'
USER='$dbuser'
PASS='$dbpass'
DB='$dbname'
PORT='$dbport'
EOF



echo -e "                $GREEN Type of your Server$RESET"
PS3='Choose or Type a Plan: '
options=("Premium" "VIP" "PRIVATE" "Quit")
select opt in "${options[@]}"; do
  case "$opt,$REPLY" in
    Premium,*|*,Premium) 
    echo "";
    
  
/bin/cat <<"EOM" >/etc/openvpn/script/login.sh
#!/bin/bash
. /etc/openvpn/script/config.sh

  
##PREMIUM##
PRE="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.duration > 0"
  
##VIP##
VIP="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.vip_duration > 0"
  
##PRIVATE##
PRIV="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.private_duration > 0"
  
Query="SELECT users.user_name FROM users WHERE $PRE OR $VIP OR $PRIV"
user_name=`mysql -u $USER -p$PASS -D $DB -h $HOST --skip-column-name -e "$Query"`
  
[ "$user_name" != '' ] && [ "$user_name" = "$username" ] && echo "user : $username" && echo 'authentication ok.' && exit 0 || echo 'authentication failed.'; exit 1
  
EOM
  
echo "";
echo -e "                $GREEN 1) Premium Selected$RESET";
break ;;
VIP,*|*,VIP) 
echo "";
  
/bin/cat <<"EOM" >/etc/openvpn/script/login.sh
#!/bin/bash
. /etc/openvpn/script/config.sh

##VIP##
VIP="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.vip_duration > 0"
  
##PRIVATE##
PRIV="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.private_duration > 0"
  
Query="SELECT users.user_name FROM users WHERE $VIP OR $PRIV"
user_name=`mysql -u $USER -p$PASS -D $DB -h $HOST --skip-column-name -e "$Query"`
  
[ "$user_name" != '' ] && [ "$user_name" = "$username" ] && echo "user : $username" && echo 'authentication ok.' && exit 0 || echo 'authentication failed.'; exit 1
EOM
  
echo "";
echo -e "                $GREEN 2) VIP Selected$RESET";
break ;;
PRIVATE,*|*,PRIVATE) 
echo "";

  
/bin/cat <<"EOM" >/etc/openvpn/script/login.sh
#!/bin/bash
. /etc/openvpn/script/config.sh

  
##PRIVATE##
PRIVATE="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.private_duration>0"
  
Query="SELECT users.user_name FROM users WHERE $PRIVATE"
user_name=`mysql -u $USER -p$PASS -D $DB -h $HOST --skip-column-name -e "$Query"`
  
[ "$user_name" != '' ] && [ "$user_name" = "$username" ] && echo "user : $username" && echo 'authentication ok.' && exit 0 || echo 'authentication failed.'; exit 1
EOM
  
echo "";
echo -e "                $GREEN 3) PRIVATE Selected$RESET";
break ;;
Quit,*|*,Quit) echo -e " $RED   Installation Cancelled!$RESET";
echo -e "                $RED   Rebuild your vps and correct the process.$RESET";
exit;
break ;; *)
echo -e "                $RED   Invalid: Just choose what you want$RESET";
esac
done
clear

cat << EOF > /etc/openvpn/server.conf
port 110
proto tcp
dev tun
ca /etc/openvpn/keys/ca.crt
cert /etc/openvpn/keys/server.crt
key /etc/openvpn/keys/server.key
dh /etc/openvpn/keys/dh2048.pem
client-cert-not-required
username-as-common-name
key-direction 0
auth-user-pass-verify /etc/openvpn/script/login.sh via-env
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt
push "route-method exe"
push "route-delay 2"
keepalive 10 120
comp-lzo
user nobody
group nogroup
persist-key
persist-tun
status /var/www/html/status/tcp2.txt 1
log openvpn.log
verb 2
ncp-disable
cipher none
auth none
EOF

#creating ads.txt to deny ads
cat << EOF > /etc/squid/ads.txt

EOF
#updating adserver
curl -sS -L --compressed "http://pgl.yoyo.org/adservers/serverlist.php?hostformat=nohtml&showintro=0&mimetype=plaintext" > /etc/squid/ads.txt 


#tweaking kernel
echo '' > /etc/sysctl.conf &> /dev/null
echo "# Kernel sysctl configuration file for Red Hat Linux
#
# For binary values, 0 is disabled, 1 is enabled.  See sysctl(8) and
# sysctl.conf(5) for more details.
#
# Use '/sbin/sysctl -a' to list all possible parameters.
# Controls IP packet forwarding
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.default.accept_source_route = 0
kernel.sysrq = 0
kernel.core_uses_pid = 1
net.ipv4.tcp_syncookies = 1
kernel.msgmnb = 65536
kernel.msgmax = 65536
kernel.shmmax = 68719476736
kernel.shmall = 4294967296
net.ipv4.ip_forward = 1
fs.file-max = 65535
net.core.rmem_default = 262144
net.core.rmem_max = 262144
net.core.wmem_default = 262144
net.core.wmem_max = 262144
net.ipv4.tcp_rmem = 4096 87380 8388608
net.ipv4.tcp_wmem = 4096 65536 8388608
net.ipv4.tcp_mem = 4096 4096 4096
net.ipv4.tcp_low_latency = 1
net.core.netdev_max_backlog = 4000
net.ipv4.ip_local_port_range = 1024 65000
net.ipv4.tcp_max_syn_backlog = 16384"| sudo tee /etc/sysctl.conf &> /dev/null
sysctl -p &> /dev/null
iptables -F; iptables -X; iptables -Z
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o $ethernet -j MASQUERADE
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -j SNAT --to $MYIP
iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -s 10.8.0.0/24 -j ACCEPT
iptables -A FORWARD -j REJECT
iptables -A INPUT -p tcp --dport 25 -j DROP
iptables -A INPUT -p udp --dport 25 -j DROP

#install PHP
yum install gcc php-devel php-pear libssh2 libssh2-devel make -y
pecl install -f ssh2 -y
 echo extension=ssh2.so > /etc/php.d/ssh2.ini
service httpd restart
 php -m | grep ssh2 
sed -i "s/#ServerName www.example.com:80/ServerName localhost:80/g" /etc/httpd/conf/httpd.conf
clear


service iptables save &> /dev/null

## changing permissions
chmod -R 755 /etc/openvpn
restorecon -r /var/www/html
cd /var/www/html/status
chmod 775 *
cd
echo '' > /etc/squid/squid.conf &> /dev/null
echo "acl Denied_ports port 1025-65535
http_access deny Denied_ports
acl to_vpn dst $MYIP
http_access allow to_vpn
acl inbound src all
acl outbound dst $MYIP/32
acl ads dstdom_regex "/etc/squid/ads.txt"
http_access allow inbound outbound
http_access deny ads
http_access deny all
http_port 8085 transparent
http_port 8086 transparent
http_port 3355 transparent
http_port 3356 transparent
visible_hostname JohnFordTV
cache_mgr codeph"| sudo tee /etc/squid/squid.conf &> /dev/null
clear
echo -e "$GREEN                    We are almost done $RESET"
sleep 4s
clear
echo "0 0 1 * * root /sbin/reboot" > /etc/cron.d/reboot
echo "";
echo "2) Every 12mn Next Month Your VPS will reboot";
echo 'Restarting and Re-enabling after Boot'
service iptables save &> /dev/null
/sbin/chkconfig crond on
chkconfig iptables on
chkconfig openvpn on
chkconfig squid on
/sbin/service crond start
chkconfig httpd on &> /dev/null
/etc/init.d/squid start &> /dev/null
/etc/init.d/openvpn start &> /dev/null
/etc/init.d/httpd start &> /dev/null
service httpd restart &> /dev/null
service squid restart 
service openvpn restart
rm centos.sh
clear
echo ''
echo ''
echo ''
sleep 3s
echo ''
echo -e "$GREEN     OpenVPN Installed Sucessfully$RESET"
sleep 3s
echo -e "$GREEN
============================   
   CENTOS AUTH INSTALLER
    SUCCESS!!!
============================   $RESET"
echo ''
echo -e "$YELLOW
============================
| OpenVPN PORT        : 110 |
============================
|Squid PORTS         : 8085 |
| 				     : 8086 |
| 				     : 3355 |
| 				     : 3356 |
============================$RESET"
echo -e "$GREEN 

 Powered by: JohnFordTV"
sleep 3s

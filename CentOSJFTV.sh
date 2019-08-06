#!/bin/bash
# Auto Script for Centos 6.xx
# Modified by FordSenpai
# version v1
MYIP=`ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0'`;
# set time GMT +8
ln -fs /usr/share/zoneinfo/Asia/Manila /etc/localtime
#change this according to your database details
dbhost='185.2.168.30';
dbuser='solidvpn_two';
dbpass='solidvpn_two';
dbname='solidvpn_two';
dbport='3306';
clear
dt=$(date '+%d/%m/%Y %H:%M:%S');
echo "$dt"
red=`tput setaf 1`
green=`tput setaf 2`
yellow=`tput setaf 3`
blue=`tput setaf 4`
magenta=`tput setaf 5`
cyan=`tput setaf 6`
white=`tput setaf 7`
reset=`tput sgr0`
echo "${cyan}**** WELCOME TO ***${reset}"
echo "${yellow} 
    ::::::::::  ::::::::  :::::::::   ::::::::    
    :+:        :+:    :+: :+:    :+:  :+:   :+:   
    +:+        +:+    +:+ +:+    +:+  +:+   +:+   
    +#+#+#+#:  +#+    +#: +#+ #+#++:  +#+   +:+   
    +#+        +#+    +#+ +#+    +#+  +#+   +#+   
    #+#        #+#    #+# #+#    #+#  #+#   #+#      
    ###         ########  ###    ###  ########    
              VPS Script by  FordSenpai     
${reset}"
echo "${cyan}
Re-Edited by: FordSenpai
For CENTOS 6.9 x64
© Alright Reserved 2019™${reset}"
read -n 1 -s -r -p "${green}Press any key to continue...${reset}"
clear
#ethernet cable openvz default ethernet is venet0
#ethernet='venet0';
#ethernet='ens3';
ethernet='eth0';
#squid multi ports
squidport='8080';
squidport1='3128';
squidport2='8888';
squidport3='8000';
##certificates
cacert='-----BEGIN CERTIFICATE-----
MIIE5TCCA82gAwIBAgIJAP0GLynOqm38MA0GCSqGSIb3DQEBCwUAMIGnMQswCQYD
VQQGEwJQSDERMA8GA1UECBMIQmF0YW5nYXMxETAPBgNVBAcTCEJhdGFuZ2FzMRIw
EAYDVQQKEwlTYXZhZ2VWUE4xEjAQBgNVBAsTCVNhdmFnZVZQTjEWMBQGA1UEAxMN
c2F2YWdlLXZwbi50azEPMA0GA1UEKRMGc2VydmVyMSEwHwYJKoZIhvcNAQkBFhJz
YXZhZ2U5OUBnbWFpbC5jb20wHhcNMTgwNDIwMDQ1MTMyWhcNMjgwNDE3MDQ1MTMy
WjCBpzELMAkGA1UEBhMCUEgxETAPBgNVBAgTCEJhdGFuZ2FzMREwDwYDVQQHEwhC
YXRhbmdhczESMBAGA1UEChMJU2F2YWdlVlBOMRIwEAYDVQQLEwlTYXZhZ2VWUE4x
FjAUBgNVBAMTDXNhdmFnZS12cG4udGsxDzANBgNVBCkTBnNlcnZlcjEhMB8GCSqG
SIb3DQEJARYSc2F2YWdlOTlAZ21haWwuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEAwMNjUVNKJvcMBAx5k/doMtYwVhoSV2gnxA16rtZMnkckHRQc
ApvgSWOBc0e2OgL+rlb48BrheyQ9aSLiHrfGPvzpVQfpGCwSQxayEiNKdRmlb6wl
IIlnhfXyKYXx9x/fZNQWGmhczckrXl84ZYbLKglmnfXSEM0PUlfj7pujjXSsZTPV
2Pe92+sf/2ZyYotA2XXqnXIPjaPUo/kQYqmLTSY7weaYLisxn9TTJo6V0Qap2poY
FLpH7fjWCTun7jZ5CiWVIVARkZRXmurLlu+Z+TMlPK3DW9ASXA2gw8rctsoyLJym
V+6hkZiJ3k0X17SNIDibDG4vn8VFEFehOrqKXQIDAQABo4IBEDCCAQwwHQYDVR0O
BBYEFDC3ZJF7tPbQ9SUDMm6P0hxXmvNIMIHcBgNVHSMEgdQwgdGAFDC3ZJF7tPbQ
9SUDMm6P0hxXmvNIoYGtpIGqMIGnMQswCQYDVQQGEwJQSDERMA8GA1UECBMIQmF0
YW5nYXMxETAPBgNVBAcTCEJhdGFuZ2FzMRIwEAYDVQQKEwlTYXZhZ2VWUE4xEjAQ
BgNVBAsTCVNhdmFnZVZQTjEWMBQGA1UEAxMNc2F2YWdlLXZwbi50azEPMA0GA1UE
KRMGc2VydmVyMSEwHwYJKoZIhvcNAQkBFhJzYXZhZ2U5OUBnbWFpbC5jb22CCQD9
Bi8pzqpt/DAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCdv9MOSR8O
b9wRw4qd681eTxUYEACFVZpY3eK3vJYyGtblYHIwfCPTWL6yXQxbMud4C1ISIwel
UFv/qnz/GZmAkN0qB5tNSvB48123F1AWfhhXWG+o+xWxUi+eqsXdUVZ1tpP5WQaH
EUtU6SZ1AXO6l6b/RTXymRrEInCPfbGsEnucnG7naOpBaNRXmpiMppOwzR42sd6I
QOvXkj2e8v9tQ05cffjexks+rfb/d80+1nfkv0HCLWxcdU8yOUqVryhdZLB6Rhw/
crldSHwrGWN+qptpFD160iJLIv3p5vWwUAgRoRai9iHuJMOHn4aDX0N8tbCfS+R5
qn8GWiHaXEu8
-----END CERTIFICATE-----';
servercert='Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1 (0x1)
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=PH, ST=NCR, L=MALAYBALAY CITY, O=FUZEVPN, OU=Kenjei, CN=09051618566/name=server/emailAddress=kenjei117@gmail.com
        Validity
            Not Before: Apr 20 04:53:44 2018 GMT
            Not After : Apr 17 04:53:44 2028 GMT
        Subject: C=PH, ST=NCR, L=MALAYBALAY CITY, O=FUZEVPN, OU=Kenjei, CN=09051618566/name=server/emailAddress=kenjei117@gmail.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:b6:a9:b9:e6:f9:19:85:24:ba:6b:dc:7e:b2:d4:
                    2c:01:46:26:fa:3e:41:ee:0c:b9:18:27:99:34:27:
                    61:eb:4f:cb:83:c0:0b:43:27:05:53:a5:b9:3c:5a:
                    8a:c5:7e:2e:72:1d:f9:83:97:44:b5:00:21:36:d7:
                    51:27:be:b7:d0:0c:2c:09:38:52:a0:e0:89:6f:cb:
                    0e:11:37:d9:7c:43:fe:b1:25:c1:2f:78:25:c1:a0:
                    15:c9:1d:35:b6:1d:33:e9:e6:75:83:4b:30:54:a4:
                    4e:f5:01:ae:fc:0c:37:c0:c7:07:43:4c:04:50:80:
                    c8:13:9a:27:4c:d1:6d:c6:87:e4:38:38:67:c1:87:
                    e4:3a:e3:79:11:c1:23:d4:2c:72:b7:0c:60:72:c7:
                    29:7e:36:17:09:2d:ca:9d:b3:49:2f:2f:56:85:a9:
                    24:34:5a:e7:eb:4b:ee:cf:43:bb:20:ef:dc:26:95:
                    e6:dd:3a:8a:61:d8:33:b0:28:0f:fb:ce:d9:db:dd:
                    ca:2f:85:f0:ec:66:58:67:77:8e:e0:a0:21:f8:b5:
                    fe:e3:02:7e:3c:9c:5c:91:65:1a:bc:3c:6f:ce:3d:
                    b8:38:8e:b0:d4:5b:ef:a5:e1:b3:0c:f4:bf:49:95:
                    7b:1f:9f:41:9f:ce:fa:ae:e1:e7:68:f4:f9:a6:99:
                    74:95
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Basic Constraints: 
                CA:FALSE
            Netscape Cert Type: 
                SSL Server
            Netscape Comment: 
                Easy-RSA Generated Server Certificate
            X509v3 Subject Key Identifier: 
                0C:4B:B3:78:75:C7:5E:C8:16:D2:A7:BC:8E:15:3F:33:E3:58:19:04
            X509v3 Authority Key Identifier: 
                keyid:30:B7:64:91:7B:B4:F6:D0:F5:25:03:32:6E:8F:D2:1C:57:9A:F3:48
                DirName:/C=PH/ST=NCR/L=MUNTINLUPA CITY/O=MyBroVPN/OU=s3np4i/CN=09983020460/name=server/emailAddress=s3np4i09@gmail.com
                serial:FD:06:2F:29:CE:AA:6D:FC

            X509v3 Extended Key Usage: 
                TLS Web Server Authentication
            X509v3 Key Usage: 
                Digital Signature, Key Encipherment
            X509v3 Subject Alternative Name: 
                DNS:server
    Signature Algorithm: sha256WithRSAEncryption
         95:13:80:8a:95:42:9e:16:b6:58:5f:4a:d2:74:61:fb:25:04:
         3c:77:fa:09:41:05:e3:9b:df:93:4e:65:8e:b8:05:87:35:c0:
         9a:eb:62:fa:16:0d:15:28:79:b7:7f:8c:55:72:7a:31:16:3f:
         ff:ba:29:70:0c:96:78:6e:1e:a9:ff:42:d7:f2:53:43:e6:f3:
         a4:3a:02:7b:85:18:18:bc:b6:56:47:3b:be:ae:6f:1c:93:8b:
         13:55:0d:b1:51:30:c2:f4:03:c9:a9:cf:bb:ad:60:70:ec:32:
         1e:e5:74:d5:4d:2b:5e:02:73:28:b0:84:28:f4:6c:93:45:a1:
         f8:3c:58:91:38:21:7b:b2:8f:fe:26:4c:18:72:a3:13:79:46:
         b8:43:8c:cc:5c:03:7c:20:8a:51:25:8b:d0:80:a8:ae:33:5c:
         19:20:f6:a9:02:39:47:42:1d:37:c6:ec:9f:6e:80:5b:61:0b:
         53:bf:26:4b:6d:b5:a6:98:21:e0:ad:42:3a:7d:3f:c9:00:a3:
         61:4c:76:e0:45:36:0b:7e:71:38:37:4f:73:a9:6f:bf:7a:77:
         04:8d:27:cb:e3:d4:11:f4:c3:c5:85:c2:1d:8a:9f:3b:da:43:
         97:8d:f3:3e:30:51:b4:ad:2b:65:04:58:f3:95:7f:23:b2:3a:
         f8:bd:7c:f8
-----BEGIN CERTIFICATE-----
MIIFWDCCBECgAwIBAgIBATANBgkqhkiG9w0BAQsFADCBpzELMAkGA1UEBhMCUEgx
ETAPBgNVBAgTCEJhdGFuZ2FzMREwDwYDVQQHEwhCYXRhbmdhczESMBAGA1UEChMJ
U2F2YWdlVlBOMRIwEAYDVQQLEwlTYXZhZ2VWUE4xFjAUBgNVBAMTDXNhdmFnZS12
cG4udGsxDzANBgNVBCkTBnNlcnZlcjEhMB8GCSqGSIb3DQEJARYSc2F2YWdlOTlA
Z21haWwuY29tMB4XDTE4MDQyMDA0NTM0NFoXDTI4MDQxNzA0NTM0NFowgacxCzAJ
BgNVBAYTAlBIMREwDwYDVQQIEwhCYXRhbmdhczERMA8GA1UEBxMIQmF0YW5nYXMx
EjAQBgNVBAoTCVNhdmFnZVZQTjESMBAGA1UECxMJU2F2YWdlVlBOMRYwFAYDVQQD
Ew1zYXZhZ2UtdnBuLnRrMQ8wDQYDVQQpEwZzZXJ2ZXIxITAfBgkqhkiG9w0BCQEW
EnNhdmFnZTk5QGdtYWlsLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBALapueb5GYUkumvcfrLULAFGJvo+Qe4MuRgnmTQnYetPy4PAC0MnBVOluTxa
isV+LnId+YOXRLUAITbXUSe+t9AMLAk4UqDgiW/LDhE32XxD/rElwS94JcGgFckd
NbYdM+nmdYNLMFSkTvUBrvwMN8DHB0NMBFCAyBOaJ0zRbcaH5Dg4Z8GH5DrjeRHB
I9QscrcMYHLHKX42Fwktyp2zSS8vVoWpJDRa5+tL7s9DuyDv3CaV5t06imHYM7Ao
D/vO2dvdyi+F8OxmWGd3juCgIfi1/uMCfjycXJFlGrw8b849uDiOsNRb76Xhswz0
v0mVex+fQZ/O+q7h52j0+aaZdJUCAwEAAaOCAYswggGHMAkGA1UdEwQCMAAwEQYJ
YIZIAYb4QgEBBAQDAgZAMDQGCWCGSAGG+EIBDQQnFiVFYXN5LVJTQSBHZW5lcmF0
ZWQgU2VydmVyIENlcnRpZmljYXRlMB0GA1UdDgQWBBQMS7N4dcdeyBbSp7yOFT8z
41gZBDCB3AYDVR0jBIHUMIHRgBQwt2SRe7T20PUlAzJuj9IcV5rzSKGBraSBqjCB
pzELMAkGA1UEBhMCUEgxETAPBgNVBAgTCEJhdGFuZ2FzMREwDwYDVQQHEwhCYXRh
bmdhczESMBAGA1UEChMJU2F2YWdlVlBOMRIwEAYDVQQLEwlTYXZhZ2VWUE4xFjAU
BgNVBAMTDXNhdmFnZS12cG4udGsxDzANBgNVBCkTBnNlcnZlcjEhMB8GCSqGSIb3
DQEJARYSc2F2YWdlOTlAZ21haWwuY29tggkA/QYvKc6qbfwwEwYDVR0lBAwwCgYI
KwYBBQUHAwEwCwYDVR0PBAQDAgWgMBEGA1UdEQQKMAiCBnNlcnZlcjANBgkqhkiG
9w0BAQsFAAOCAQEAlROAipVCnha2WF9K0nRh+yUEPHf6CUEF45vfk05ljrgFhzXA
muti+hYNFSh5t3+MVXJ6MRY//7opcAyWeG4eqf9C1/JTQ+bzpDoCe4UYGLy2Vkc7
vq5vHJOLE1UNsVEwwvQDyanPu61gcOwyHuV01U0rXgJzKLCEKPRsk0Wh+DxYkTgh
e7KP/iZMGHKjE3lGuEOMzFwDfCCKUSWL0ICorjNcGSD2qQI5R0IdN8bsn26AW2EL
U78mS221ppgh4K1COn0/yQCjYUx24EU2C35xODdPc6lvv3p3BI0ny+PUEfTDxYXC
HYqfO9pDl43zPjBRtK0rZQRY85V/I7I6+L18+A==
-----END CERTIFICATE-----';
serverkey='-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC2qbnm+RmFJLpr
3H6y1CwBRib6PkHuDLkYJ5k0J2HrT8uDwAtDJwVTpbk8WorFfi5yHfmDl0S1ACE2
11EnvrfQDCwJOFKg4Ilvyw4RN9l8Q/6xJcEveCXBoBXJHTW2HTPp5nWDSzBUpE71
Aa78DDfAxwdDTARQgMgTmidM0W3Gh+Q4OGfBh+Q643kRwSPULHK3DGByxyl+NhcJ
Lcqds0kvL1aFqSQ0WufrS+7PQ7sg79wmlebdOoph2DOwKA/7ztnb3covhfDsZlhn
d47goCH4tf7jAn48nFyRZRq8PG/OPbg4jrDUW++l4bMM9L9JlXsfn0Gfzvqu4edo
9PmmmXSVAgMBAAECggEAOwhHKDpA4SKpjMpJuAmR3yeI2T7dl81M1F2XyZ8gqiez
ofSiryUhN5NLdhHc306UPBUr2jc84TIVid+0PqAIT5hfcutc6NkoEZUSCsZ95wci
fKWy9WBi81yFLeXewehWKrVsLO5TxEcFrXDJ2HMqYYbw9fLPQiUchBlBsjXMwGgG
W8R2WlQaIh0siJzg+FjwOPEbZA7jAJfyGt80HDWVOfsHxsSX80m8rq2nMppXsngF
hhosj/f/WOPJLiA+/Odkv1ZXS1rqnr5GuwdzrEnibqXOx9LCuxp9MZ8t6qWDvgUf
dy1AB2DKRi9s4NCJHPpITXek4ELawLmGxp7KEzQ/0QKBgQDoU16ZGTCVCT/kQlRz
DRZ2fFXNEvEohCTxYJ72iT6MGxZw+2fuZG6VL9fAgUVLleKKUCFUzM3GPQWEQ1ry
VKQjIqQZjyR+rzdqbHOcG4qYz93enH0FIB9cW/FiU3m5EAzU+TkagZCFq254Kb7i
IQzrWTn24jFX1fQkgcNoXbNUMwKBgQDJRtEs/4e/enVs/6iGjjTGltjyXPS3QM/k
ylZGL+Wc1gQWAsfTO6tYMMPVupyyl2JQjhUydIu3g7D2R4IRKlpprEd8S0MoJou9
Lp/JudlDDJs9Q6Z2q99JpbXdhJ2aOTmSgOKHnkFQRRP/LOxaNwuE/xuhYWubvtFW
y9u+B8uMFwKBgQCJuZqTweYWA+S3aUbs6W5OkUjACKGj9ip8WV4DIrtMjWZRVgh3
v1v63uDVAw1UUKd6fSQ1RDAce+JAVTmd/OVM2uVTLZNh8nc0hNRIT99q1Zdet4A5
wKA2vV6sfnXjaotg2dmrR/Gn/EfBvmWlYhhpkHyXSeIcgv53geGYhiugFwKBgQC3
pRmtyOh+2KjTbuDBBHc6yt/fItlVaplE0yismX8S/mJ0As13+fV4XeYQ2Feoy180
yK6mfpgMNOf9jXkrWE1uJXaD/dekhqbxUd0RHbUR7CqoV1VG6cKtW7j4CMwTryrM
dTQ7MTW+m4iHRuHP3nFwQ6NeN5kLXat7Wj2AwXQCuQKBgESdvXETE6Oy3GVeO1zd
tDlYxpA620daYaNo9MDpV49m89Lt8Maou080+gEJDrqqhyiaEQStrvz31mXIA+w7
YTX1gKAF4qCXy3IKLqN3umdpEYkV2MVEfXlUE6aZZMogta9F5cne3CNDyHzq/RvS
l9rNm+ntgV3+QioNbRWhG9fb
-----END PRIVATE KEY-----';
dh='-----BEGIN DH PARAMETERS-----
MIIBCAKCAQEAohzwXz9fsjw+G9Q14qINNOhZnTt/b30zzJYm4o2NIzAngM6E6GPm
N5USUt0grZw6h3VP9LyqQoGi/bHFz33YFG5lgDF8FAASEh07/leF7s0ohhK8pspC
JVD+mRatwBrIImXUpJvYI2pXKxtCOnDa2FFjAOHKixiAXqVcmJRwNaSklQcrpXdn
/09cr0rbFoovn+f1agly4FxYYs7P0XkvSHm3gVW/mhAUr1hvZlbBaWFSVUdgcVOi
FXQ/AVkvxYaO8pFI2Vh+CNMk7Vvi8d3DTayvoL2HTgFi+OIEbiiE/Nzryu+jDGc7
79FkBHWOa/7eD2nFrHScUJcwWiSevPQjQwIBAg==
-----END DH PARAMETERS-----';

echo "${yellow}Initializing please wait...${green}2%${reset}"
sleep 2s
clear
echo "${yellow}Initializing please wait...${green}4%${reset}"
sleep 2s
clear
echo "${yellow}Initializing please wait...${green}6%${reset}"
sleep 2s
clear
echo "${yellow}Initialization Complete...${green}10%${reset}"
sleep 2s
clear
echo "${yellow}Updating the System${reset}"
echo "${green}It may take too long while we are Updating...${reset}"
sleep 5s
yum update -y 
yum install telnet telnet-server vixie-cron crontabs httpd nano squid dos2unix mysql-server -y 
yum install php php-pdo php-mysqli php-mysql php-gd php-mbstring.x86_64 epel-release -y 
yum install openvpn -y
yum -y install stunnel 
echo "${yellow}Updates Complete...${green}75%${reset}"
sleep 5s
clear
echo "${yellow}Configuring OpenVPN and Squid Proxy..${reset}"
sleep 1s
clear
echo "${yellow}Configuring OpenVPN and Squid Proxy...${green}77%${reset}"
sleep 3s
clear

echo "${yellow}Building Certificate and Keys.${reset}"
1s
clear
echo "${yellow}Building Certificate and Keys..${green}78%${reset}"
sleep 2s
clear
echo "${yellow}Building Certificate and Keys...${green}80%${reset}"
3s
clear
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

/bin/cat <<"EOM" >/etc/openvpn/script/connect.sh
#!/bin/bash

tm="$(date +%s)"
dt="$(date +'%Y-%m-%d %H:%M:%S')"
timestamp="$(date +'%FT%TZ')"

. /etc/openvpn/script/config.sh

##set status online to user connected
bandwidth_check=`mysql -u $USER -p$PASS -D $DB -h $HOST --skip-column-name -e "SELECT bandwidth_logs.username FROM bandwidth_logs WHERE bandwidth_logs.username='$common_name' AND bandwidth_logs.category='premium' AND bandwidth_logs.status='online'"`
if [ "$bandwidth_check" == 1 ]; then
	mysql -u $USER -p$PASS -D $DB -h $HOST -e "UPDATE bandwith_logs SET server_ip='$local_1', server_port='$trusted_port', timestamp='$timestamp', ipaddress='$trusted_ip:$trusted_port', username='$common_name', time_in='$tm', since_connected='$time_ascii', bytes_received='$bytes_received', bytes_sent='$bytes_sent' WHERE username='$common_name' AND status='online' AND category='premium' "
else
	mysql -u $USER -p$PASS -D $DB -h $HOST -e "INSERT INTO bandwidth_logs (server_ip, server_port, timestamp, ipaddress, since_connected, username, bytes_received, bytes_sent, time_in, status, time, category) VALUES ('$local_1','$trusted_port','$timestamp','$trusted_ip:$trusted_port','$time_ascii','$common_name','$bytes_received','$bytes_sent','$dt','online','$tm','premium') "
fi

EOM

/bin/cat <<"EOM" >/etc/openvpn/script/disconnect.sh
#!/bin/bash
tm="$(date +%s)"
dt="$(date +'%Y-%m-%d %H:%M:%S')"
timestamp="$(date +'%FT%TZ')"

. /etc/openvpn/script/config.sh

mysql -u $USER -p$PASS -D $DB -h $HOST -e "UPDATE bandwidth_logs SET bytes_received='$bytes_received',bytes_sent='$bytes_sent',time_out='$dt', status='offline' WHERE username='$common_name' AND status='online' AND category='premium' "

EOM

/bin/cat <<"EOM" >/etc/openvpn/script/login.sh
#!/bin/bash
. /etc/openvpn/script/config.sh


##PREMIUM##
PRE="users.user_name='$username' AND users.auth_vpn=md5('$password') AND users.is_validated=1 AND users.is_freeze=0 AND users.is_active=1 AND users.is_ban=0 AND users.vip_duration > 0"

Query="SELECT users.user_name FROM users WHERE $PRE"
user_name=`mysql -u $USER -p$PASS -D $DB -h $HOST --skip-column-name -e "$Query"`

[ "$user_name" != '' ] && [ "$user_name" = "$username" ] && echo "user : $username" && echo 'authentication ok.' && exit 0 || echo 'authentication failed.'; exit 1

EOM
/bin/cat <<"EOM" >/etc/openvpn/script/test_connect_db.sh
#!/bin/bash
. /etc/openvpn/script/config.sh
##Test Authentication
username=$1
password=$2
user_id=$(mysql -h$HOST -P$PORT -u$USER -p$PASS $DB -sN -e "select user_name from users where user_name = '$username' AND users.auth_vpn=md5('$password') AND user.is_validated=1 AND  users.duration > 0  AND users.is_freeze =0 ")   
##Check user
[ "$user_id" != '' ] && [ "$user_id" = "$username" ] && echo "user : $username" && echo 'authentication ok.' && exit 0 || echo 'authentication failed.'; exit 1
EOM
/bin/cat <<"EOM" >/etc/openvpn/script/onlineuser.php
<?php
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', '1');
ini_set('max_execution_time', 150);


$DB_host = "185.2.168.30";
$DB_user = "solidvpn_two";
$DB_pass = "solidvpn_two";
$DB_name = "solidvpn_two";
$DB_port = "3306";

$mysqli = new MySQLi($DB_host,$DB_user,$DB_pass,$DB_name);
if ($mysqli->connect_error) {
    die('Error : ('. $mysqli->connect_errno .') '. $mysqli->connect_error);
}

function openvpnLogs($log, $proto) {
	$handle = fopen($log, "r");
	$uid = 0;
	while (!feof($handle)) {
		$buffer = fgets($handle, 4096);
		unset($match);
		if (preg_match("^Updated,(.+)", $buffer, $match)) { 
			$status['updated'] = $match[1];
		}
		
		if (preg_match("/^(.+),(\d+\.\d+\.\d+\.\d+\:\d+),(\d+),(\d+),(.+)$/", $buffer, $match)) {
			if ($match[1] <> "Common Name") {
				$cn = $match[1];
				$userlookup[$match[2]] = $uid;
				$status['users'][$uid]['CommonName'] = $match[1];
				$status['users'][$uid]['RealAddress'] = $match[2];
				$status['users'][$uid]['BytesReceived'] = $match[3];
				$status['users'][$uid]['BytesSent'] = $match[4];
				$status['users'][$uid]['Since'] = $match[5];
				$status['users'][$uid]['Proto'] = $proto;
				$uid++;
			}
		}
		
		if (preg_match("/^(\d+\.\d+\.\d+\.\d+),(.+),(\d+\.\d+\.\d+\.\d+\:\d+),(.+)$/", $buffer, $match)) {
			if ($match[1] <> "Virtual Address") {
				$address = $match[3];
				$uid = $userlookup[$address];
				$status['users'][$uid]['VirtualAddress'] = $match[1];
				$status['users'][$uid]['LastRef'] = $match[4];
			}
		}
	}
	fclose($handle);
	return($status);

}

function sizeformat($bytesize){
	$i=0;
	while(abs($bytesize) >= 1024){
		$bytesize=$bytesize/1024;
		$i++;
		if($i==4) break;
	}

	$units = array("Bytes","KB","MB","GB","TB");
	$newsize=round($bytesize,2);
	return("$newsize $units[$i]");
}
	
$time = time();
$time_check = $time-90;
$disconnect = $mysqli->query("UPDATE user SET is_connected=0, login_timestamp=0 WHERE login_timestamp < $time_check");
$ipaddress = $MYIP;
$sql = "SELECT * FROM server_list WHERE server_ip='".$ipaddress."'";
$query = $mysqli->query($sql);
while($row = $query->fetch_assoc())
{
	$server_name = $row['server_name'];
	$server_id = $row['server_id'];
	$server_ip = $row['server_ip'];
	$server_tcp = $row['server_tcp'];
	$server_parser = $row['server_parser'];
	$stats = openvpnLogs($server_parser);
	foreach($stats['users'] as $user)
	{
		if($user['CommonName'] != "UNDEF")
		{
			$CommonName = $user['CommonName'];
			$bits = 256; //1048576;
			$bytes = $user['BytesReceived'] + $user['BytesSent'];
			$bandwidth = $bytes / $bits;

			$mysqli->query("DELETE FROM bandwidth_logs WHERE bandwidth=0 AND status='offline' AND time<$time_check");
			
			$chk_bandwidth = $mysqli->query("SELECT * FROM bandwidth_logs 
			WHERE username='".$CommonName."' AND status='online'");
			if($chk_bandwidth->num_rows > 0)
			{
				while($chk_rows = $chk_bandwidth->fetch_assoc())
				{
					$mysqli->query("UPDATE bandwidth_logs SET 
					server='".$server_name."', server_ip='".$server_ip."', ipaddress='".$user['RealAddress']."',
					bytes_received='".$user['BytesSent']."', bytes_sent='".$user['BytesReceived']."', 
					since_connected='".$user['Since']."', bandwidth=bandwidth+'".$bandwidth."', time='".$time."', status='online'  
					WHERE id='".$chk_rows['id']."'");
					
					$mysqli->query("UPDATE bandwidth_logs SET 
					server='".$server_name."', server_ip='".$server_ip."', ipaddress='".$user['RealAddress']."',
					bytes_received='".$user['BytesSent']."', bytes_sent='".$user['BytesReceived']."', 
					since_connected='".$user['Since']."', bandwidth=bandwidth+'".$bandwidth."', time='".$time."',
					time_out='".date('Y-m-d H:i:s')."', status='offline' 
					WHERE 
					id='".$chk_rows['id']."' AND status='online' AND time<$time_check");
				}
			}
		}
	}
}

if($bandwidth_updates)
{
	echo "Successfully! Updated!...";
}else{
	echo "Failed to update!...";
}

?>

EOM

/bin/cat <<"EOM" >/var/www/html/index.php
<?php

phpinfo();

?>
EOM

/bin/cat <<"EOM" >/var/www/html/.htaccess
RewriteEngine On
RewriteBase /

IndexIgnore *

AddDefaultCharset UTF-8
Options -Indexes +FollowSymLinks

# No web server version and indexes
ServerSignature Off
Options All -Indexes

<IfModule mod_security.c>
    SecFilterEngine Off
    SecFilterScanPOST Off
</IfModule>

<Files ~ "^.*\.([Hh][Tt][Aa])">
    order allow,deny
    deny from all
    satisfy all
</Files>

<filesMatch "\.(htaccess|htpasswd|ini|phps|fla|psd|log|sh)$">
    Order Allow,Deny
    Deny from all
</filesMatch>

<FilesMatch "^(install\.php|setup\.php|wp-config\.php|config\.php|configuration\.php|php\.ini|php5\.ini|bb-config\.php|db.php|db_config\.php|db_function\.php)">
	Order allow,deny
	Deny from all
</filesMatch>

EOM

cat << EOF > /etc/openvpn/server.conf
local $MYIP
mode server 
tls-server 
port 443
proto tcp
dev tun
tun-mtu-extra 32 
tun-mtu 1400 
mssfix 1360
tcp-queue-limit 128
txqueuelen 2000
tcp-nodelay
sndbuf 393216
rcvbuf 393216
push "sndbuf 393216"
push "rcvbuf 393216"
server 10.8.0.0 255.255.255.0
ca /etc/openvpn/keys/ca.crt
cert /etc/openvpn/keys/server.crt
key /etc/openvpn/keys/server.key
dh /etc/openvpn/keys/dh2048.pem
persist-key
persist-tun
keepalive 1 180
comp-lzo
user nobody
client-to-client
username-as-common-name
client-cert-not-required
auth-user-pass-verify /etc/openvpn/script/login.sh via-env
max-clients 50
push "redirect-gateway def1"
push "dhcp-option DNS 1.1.1.1"
push "dhcp-option DNS 1.0.0.1"
script-security 3
client-connect /etc/openvpn/script/connect.sh
client-disconnect /etc/openvpn/script/disconnect.sh
status /var/www/html/status/tcp2.txt
log-append /etc/openvpn/log/openvpn.log
verb 3
connect-retry-max infinite
EOF

echo "${yellow}Configuring STUNNEL4 for SSL Connection..${reset}"
sleep 1s
clear
echo "${yellow}Configuring STUNNEL4 for SSL Connection...${green}83%${reset}"
sleep 3s
clear
#stunnel
cat <<EOF >/etc/stunnel/stunnel.pem
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA+A7kkUwhEiVc3V2vQMCnkXxhU/U9eXVgcyMBLDjZ5tcYP41I
wfhrNH3kNIGLc/C1w9eM13hX7lxaZlInMb4ZWfDOy8/WLNC4XdT/74ucGqtlNDvu
bCL617hr0NyLkf9KRxQlaa/Mc7qu18sMyX+AUJsKLrigxXQC3XQ7S/i3YfGBU6x1
V9G+aXq2t3z/dAQK6mcUj/5YArEBc1YpdJpEkSXyMfWZByjE5QlBeHfe/eGnxOoV
3VLFObil/FdwsK/F4hAW4SWSLAf3KY8IjiicRgXk3Vcm5eQAftsluuNdMFNR+0wp
z1jHl7G6mTwTXyAuB1lvyRPO8iSyueAwRfAgTwIDAQABAoIBAQC14oWqHD4rhgXf
su/r9Ndpj9/1pd6bjntYMRSNDmqIHrOC9d+hirtg0+ZesZZFPvyoSwbUf0NKXaFT
YW2nxZHlJvMa8pxCZBCrjKDVTnL6Ay7D7CXYWJXBU1KK5QvZ02ztTVJZejPZr8rA
I/yOStUVRXlj5LDN11C6fJ12CTq9rtvtMS792ZNtCxGvQJuV5OQEhukp2ycjwU3P
RHErEC7Gkhdo7netjwOmBvysikPmtheE8IZOpx/yok+pRB1zrzWExAM7nZHNQsR4
jF1xJiaQ4/9a7PGNvbHOj8YarbWxGPHzrWYvrzz4P8ZwgWnv5gdOWsBJTG+sUNJ2
n5dCXlIBAoGBAPzWxrs7ACW8ZUwqvKyhTjAAmpMz6I/VQNbtM/TEKCUpMaXXCSar
ItnmSXwt29c0LSoHifwlBenUx+QB/o5qr2idbbJRbU1Pz4PcIRCdKcu0t4PoeJJM
T6CzXNs46Sg98HZ46WW0HesI8UNbwa8vj8B92O9Z5CoFOStYb4cRxFbPAoGBAPso
0Lx+ZCqA3+++BFaqsFjdh8YL3UOjm1oSn/ip1Stgv0Jl862RQA3aB5nNMutuPBIc
gAlb1M66J7v7STe5nKFPHELUprwHReXlrjSkyNxmP2LkCJFpGBm1AOc5meL0avXH
yzmqEdOvXKC06D0eZlBtLnfITwRgcjMoiHxF8f6BAoGAeuA+ULvJxI0chbm3XAZA
o1+Hv8ZYXZ58FnfM6kVyZSzx7fDlh59gHpmmWO1Ii/vVfzmOu7WafBtm0c6OUdRT
TvpDV4fvIMWKykBu6U4YA+Hd1gNipWbkw+qnU/sChQYlGM6GT2ELsS/1YJD1PhhV
Om1uwlPjaPCE6iXefbwKuU0CgYEA4274ZlhFuD9viZeWMizq9+3TT0HbIa77tLr8
5Z5VDKzVRPkxilDnoiN3kozAuXTfLL9mKhNgR7tG0/EfQjjwXxpWSyZpvgcQArjT
4ZP+16Y3bAN2xsZWLqE7qib89QnD+cDshNE+x2QbCuQHEaF/oQDdfVaER0BW6YCg
53gnRQECgYEA0CbUEO4JPIN6djkwX8a1GbEow85DMKvEchmwCdW8CvUunlULzZlS
ezC6w+/xCAP2jU6qOPR0aQV11oxnX4BimvZHCTuqDokHdS38KWcPjHy/A/XHU2dl
OpQXVN1JwM0kcBY8IaTS22CRm1wGTytVX72QwyayrqVsjd2N6yHQSxk=
-----END RSA PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
MIID0TCCArmgAwIBAgIJALf1kKi2R1g3MA0GCSqGSIb3DQEBCwUAMH8xCzAJBgNV
BAYTAlBIMQswCQYDVQQIDAJRQzELMAkGA1UEBwwCUUMxDzANBgNVBAoMBkNRS1ZQ
TjEUMBIGA1UECwwLY3FrLXZwbi5jb20xEDAOBgNVBAMMB3hELWNSaXoxHTAbBgkq
hkiG9w0BCQEWDmNyaXpAZ21haWwuY29tMB4XDTE4MDcwMjE3MDMxOFoXDTIxMDcw
MTE3MDMxOFowfzELMAkGA1UEBhMCUEgxCzAJBgNVBAgMAlFDMQswCQYDVQQHDAJR
QzEPMA0GA1UECgwGQ1FLVlBOMRQwEgYDVQQLDAtjcWstdnBuLmNvbTEQMA4GA1UE
AwwHeEQtY1JpejEdMBsGCSqGSIb3DQEJARYOY3JpekBnbWFpbC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD4DuSRTCESJVzdXa9AwKeRfGFT9T15
dWBzIwEsONnm1xg/jUjB+Gs0feQ0gYtz8LXD14zXeFfuXFpmUicxvhlZ8M7Lz9Ys
0Lhd1P/vi5waq2U0O+5sIvrXuGvQ3IuR/0pHFCVpr8xzuq7XywzJf4BQmwouuKDF
dALddDtL+Ldh8YFTrHVX0b5pera3fP90BArqZxSP/lgCsQFzVil0mkSRJfIx9ZkH
KMTlCUF4d9794afE6hXdUsU5uKX8V3Cwr8XiEBbhJZIsB/cpjwiOKJxGBeTdVybl
5AB+2yW6410wU1H7TCnPWMeXsbqZPBNfIC4HWW/JE87yJLK54DBF8CBPAgMBAAGj
UDBOMB0GA1UdDgQWBBRuC0gqbi8q0u1gRWkD4M6JOXfDMDAfBgNVHSMEGDAWgBRu
C0gqbi8q0u1gRWkD4M6JOXfDMDAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUA
A4IBAQBJ5uuyTBaCmXu5BDwvHWfn/BoRMLghdaoT5OkWNHlQ6XXriKOLvMrK1bnT
qU5JEiCF1vtJMjlG9okzFkgHdVzk7BgmwvFZXjCI1l8GhJiOMvqPweAiFYaV4Ny1
kIEocMeLLeX6MYTclHRQSeHWktE5tt0wPb25+jdd5Cf5Ikmzh1JLE2zKnZ8aRi5+
2p6D24FM7cYLkJUi5GJfWbMKy2kb5hgj89f9TSLa/SUUwxrktnIsntg7Mpj65SBc
qNRdgDhp7yhds2mQrFP+5yFpnE1Crw3YTBOr/4Oora6jYAG3gFDn6pwHK6SM1Iy0
xdnSR8pYhuw1OjnZhg6QV2lk68dM
-----END CERTIFICATE-----
EOF

cat <<EOF >/etc/stunnel/stunnel.conf
client = no
[openvpn]
accept = 0.0.0.0:5555
connect = 127.0.0.1:3128
cert = /etc/stunnel/stunnel.pem
EOF
echo "stunnel /etc/stunnel/stunnel.conf" >> /etc/rc.d/rc.local
stunnel /etc/stunnel/stunnel.conf

echo "${yellow}Setting Up Squid to Deny ADS..${reset}"
1s
clear
echo "${yellow}Setting Up Squid to Deny ADS...${green}85%${reset}"
sleep 3s
clear
#denying ads
cat << EOF > /etc/squid/ads.txt
101com.com
101order.com
123found.com
180hits.de
180searchassistant.com
207.net
247media.com
24log.com
24log.de
24pm-affiliation.com
2mdn.net
2o7.net
360yield.com
4affiliate.net
4d5.net
50websads.com
518ad.com
51yes.com
600z.com
777partner.com
77tracking.com
7bpeople.com
7search.com
99count.com
a-ads.com
a-counter.kiev.ua
a.0day.kiev.ua
a.aproductmsg.com
a.collective-media.net
a.consumer.net
a.mktw.net
a.sakh.com
a.ucoz.net
a.ucoz.ru
a.xanga.com
a32.g.a.yimg.com
aaddzz.com
abacho.net
abc-ads.com
absoluteclickscom.com
abz.com
ac.rnm.ca
accounts.pkr.com.invalid
acsseo.com
actionsplash.com
actualdeals.com
acuityads.com
ad-balancer.at
ad-balancer.net
ad-center.com
ad-pay.de
ad-rotator.com
ad-server.gulasidorna.se
ad-serverparc.nl
ad-souk.com
ad-space.net
ad-tech.com
ad-up.com
ad.100.tbn.ru
ad.71i.de
ad.a8.net
ad.abcnews.com
ad.abctv.com
ad.aboutwebservices.com
ad.abum.com
ad.afy11.net
ad.allstar.cz
ad.altervista.org
ad.amgdgt.com
ad.anuntis.com
ad.auditude.com
ad.bizo.com
ad.bnmla.com
ad.bondage.com
ad.caradisiac.com
ad.centrum.cz
ad.cgi.cz
ad.choiceradio.com
ad.clix.pt
ad.cooks.com
ad.crwdcntrl.net
ad.digitallook.com
ad.directrev.com
ad.doctissimo.fr
ad.domainfactory.de
ad.e-kolay.net
ad.eurosport.com
ad.f1cd.ru
ad.flurry.com
ad.foxnetworks.com
ad.freecity.de
ad.gate24.ch
ad.globe7.com
ad.grafika.cz
ad.hbv.de
ad.hodomobile.com
ad.httpool.com
ad.hyena.cz
ad.iinfo.cz
ad.ilove.ch
ad.infoseek.com
ad.jamba.net
ad.jamster.co.uk
ad.jetsoftware.com
ad.keenspace.com
ad.leadbolt.net
ad.liveinternet.ru
ad.lupa.cz
ad.media-servers.net
ad.mediastorm.hu
ad.mgd.de
ad.musicmatch.com
ad.nachtagenten.de
ad.nozonedata.com
ad.nttnavi.co.jp
ad.nwt.cz
ad.onad.eu
ad.pandora.tv
ad.preferances.com
ad.profiwin.de
ad.prv.pl
ad.rambler.ru
ad.reunion.com
ad.scanmedios.com
ad.sensismediasmart.com.au
ad.seznam.cz
ad.simgames.net
ad.slutload.com
ad.smartclip.net
ad.tbn.ru
ad.technoratimedia.com
ad.thewheelof.com
ad.turn.com
ad.tv2.no
ad.twitchguru.com
ad.usatoday.com
ad.virtual-nights.com
ad.wavu.hu
ad.way.cz
ad.weatherbug.com
ad.wsod.com
ad.wz.cz
ad.yadro.ru
ad.yourmedia.com
ad.zanox.com
ad0.bigmir.net
ad01.mediacorpsingapore.com
ad1.emediate.dk
ad1.emule-project.org
ad1.kde.cz
ad1.pamedia.com.au
ad2.iinfo.cz
ad2.linxcz.cz
ad2.lupa.cz
ad2flash.com
ad2games.com
ad3.iinfo.cz
ad3.pamedia.com.au
ad4game.com
adaction.de
adadvisor.net
adap.tv
adapt.tv
adbanner.ro
adbard.net
adbers.com
adblade.com
adblockanalytics.com
adboost.de.vu
adboost.net
adbooth.net
adbot.com
adbrite.com
adbroker.de
adbunker.com
adbutler.com
adbutler.de
adbuyer.com
adbuyer3.lycos.com
adcash.com
adcast.deviantart.com
adcell.de
adcenter.mdf.se
adcenter.net
adcentriconline.com
adcept.net
adclick.com
adclient.uimserv.net
adclient1.tucows.com
adcomplete.com
adconion.com
adcontent.gamespy.com
adcycle.com
add.newmedia.cz
addealing.com
addfreestats.com
addme.com
adecn.com
ademails.com
adengage.com
adexpose.com
adext.inkclub.com
adf.ly
adfactor.nl
adfarm.mediaplex.com
adflight.com
adforce.com
adform.com
adgardener.com
adgoto.com
adgridwork.com
adhese.be
adhese.com
adimage.asiaone.com.sg
adimage.guardian.co.uk
adimages.been.com
adimages.carsoup.com
adimages.go.com
adimages.homestore.com
adimages.omroepzeeland.nl
adimages.sanomawsoy.fi
adimg.cnet.com
adimg.com.com
adimg.uimserv.net
adimg1.chosun.com
adimgs.sapo.pt
adimpact.com
adinjector.net
adinterax.com
adisfy.com
adition.com
adition.de
adition.net
adizio.com
adjix.com
adjug.com
adjuggler.com
adjuggler.yourdictionary.com
adjustnetwork.com
adk2.com
adk2ads.tictacti.com
adland.ru
adlantic.nl
adledge.com
adlegend.com
adlog.com.com
adloox.com
adlooxtracking.com
adlure.net
admagnet.net
admailtiser.com
adman.gr
adman.in.gr
adman.otenet.gr
admanagement.ch
admanager.btopenworld.com
admanager.carsoup.com
admarketplace.net
admarvel.com
admax.nexage.com
admedia.com
admedia.ro
admeld.com
admerize.be
admeta.com
admex.com
adminder.com
adminshop.com
admized.com
admob.com
admonitor.com
admotion.com.ar
adnet-media.net
adnet.asahi.com
adnet.biz
adnet.de
adnet.ru
adnet.worldreviewer.com
adnetinteractive.com
adnetwork.net
adnetworkperformance.com
adnews.maddog2000.de
adnotch.com
adnxs.com
adocean.pl
adonspot.com
adoperator.com
adorigin.com
adpepper.dk
adpepper.nl
adperium.com
adpia.vn
adplus.co.id
adplxmd.com
adprofile.net
adprojekt.pl
adq.nextag.com
adrazzi.com
adreactor.com
adrecreate.com
adremedy.com
adreporting.com
adres.internet.com
adrevolver.com
adriver.ru
adrolays.de
adrotate.de
adrotator.se
adrta.com
ads-click.com
ads.4tube.com
ads.5ci.lt
ads.abovetopsecret.com
ads.aceweb.net
ads.activestate.com
ads.adfox.ru
ads.administrator.de
ads.adshareware.net
ads.adultfriendfinder.com
ads.adultswim.com
ads.advance.net
ads.adverline.com
ads.affiliates.match.com
ads.ak.facebook.com.edgesuite.net
ads.allvatar.com
ads.alt.com
ads.amdmb.com
ads.amigos.com
ads.aol.co.uk
ads.aol.com
ads.apn.co.nz
ads.appsgeyser.com
ads.as4x.tmcs.net
ads.as4x.tmcs.ticketmaster.com
ads.asia1.com.sg
ads.asiafriendfinder.com
ads.ask.com
ads.aspalliance.com
ads.avazu.net
ads.batpmturner.com
ads.beenetworks.net
ads.belointeractive.com
ads.berlinonline.de
ads.betanews.com
ads.betfair.com
ads.betfair.com.au
ads.bigchurch.com
ads.bigfoot.com
ads.bing.com
ads.bittorrent.com
ads.blog.com
ads.bloomberg.com
ads.bluelithium.com
ads.bluemountain.com
ads.bluesq.com
ads.bonniercorp.com
ads.boylesports.com
ads.brabys.com
ads.brazzers.com
ads.bumq.com
ads.businessweek.com
ads.canalblog.com
ads.canoe.ca
ads.casinocity.com
ads.cbc.ca
ads.cc
ads.cc-dt.com
ads.centraliprom.com
ads.cgnetworks.com
ads.channel4.com
ads.clearchannel.com
ads.co.com
ads.com.com
ads.contactmusic.com
ads.contentabc.com
ads.contextweb.com
ads.crakmedia.com
ads.creative-serving.com
ads.creativematch.com
ads.cricbuzz.com
ads.cybersales.cz
ads.dada.it
ads.datinggold.com
ads.datingyes.com
ads.dazoot.ro
ads.deltha.hu
ads.dennisnet.co.uk
ads.desmoinesregister.com
ads.detelefoongids.nl
ads.deviantart.com
ads.digital-digest.com
ads.digitalmedianet.com
ads.digitalpoint.com
ads.directionsmag.com
ads.domeus.com
ads.eagletribune.com
ads.easy-forex.com
ads.eatinparis.com
ads.economist.com
ads.edbindex.dk
ads.egrana.com.br
ads.einmedia.com
ads.electrocelt.com
ads.elitetrader.com
ads.emirates.net.ae
ads.epltalk.com
ads.eu.msn.com
ads.exactdrive.com
ads.expat-blog.biz
ads.expedia.com
ads.ezboard.com
ads.factorymedia.com
ads.fairfax.com.au
ads.faxo.com
ads.ferianc.com
ads.filmup.com
ads.financialcontent.com
ads.flooble.com
ads.fool.com
ads.footymad.net
ads.forbes.com
ads.forbes.net
ads.forium.de
ads.fortunecity.com
ads.fotosidan.se
ads.foxkidseurope.net
ads.foxnetworks.com
ads.foxnews.com
ads.freecity.de
ads.friendfinder.com
ads.ft.com
ads.futurenet.com
ads.gamecity.net
ads.gamershell.com
ads.gamespyid.com
ads.gamigo.de
ads.gaming-universe.de
ads.gawker.com
ads.geekswithblogs.net
ads.glispa.com
ads.gmodules.com
ads.godlikeproductions.com
ads.goyk.com
ads.gplusmedia.com
ads.gradfinder.com
ads.grindinggears.com
ads.groundspeak.com
ads.gsm-exchange.com
ads.gsmexchange.com
ads.guardian.co.uk
ads.guardianunlimited.co.uk
ads.guru3d.com
ads.hardwaresecrets.com
ads.harpers.org
ads.hbv.de
ads.hearstmags.com
ads.heartlight.org
ads.heias.com
ads.hideyourarms.com
ads.hollywood.com
ads.horsehero.com
ads.horyzon-media.com
ads.iafrica.com
ads.ibest.com.br
ads.ibryte.com
ads.icq.com
ads.ign.com
ads.img.co.za
ads.imgur.com
ads.indiatimes.com
ads.infi.net
ads.internic.co.il
ads.ipowerweb.com
ads.isoftmarketing.com
ads.itv.com
ads.iwon.com
ads.jewishfriendfinder.com
ads.jiwire.com
ads.jobsite.co.uk
ads.jpost.com
ads.jubii.dk
ads.justhungry.com
ads.kaktuz.net
ads.kelbymediagroup.com
ads.kinobox.cz
ads.kinxxx.com
ads.kompass.com
ads.krawall.de
ads.lesbianpersonals.com
ads.linuxfoundation.org
ads.linuxjournal.com
ads.linuxsecurity.com
ads.livenation.com
ads.mariuana.it
ads.massinfra.nl
ads.mcafee.com
ads.mediaodyssey.com
ads.medienhaus.de
ads.mgnetwork.com
ads.mmania.com
ads.moceanads.com
ads.motor-forum.nl
ads.motormedia.nl
ads.msn.com
ads.multimania.lycos.fr
ads.nationalgeographic.com
ads.ncm.com
ads.netclusive.de
ads.netmechanic.com
ads.networksolutions.com
ads.newdream.net
ads.newgrounds.com
ads.newmedia.cz
ads.newsint.co.uk
ads.newsquest.co.uk
ads.ninemsn.com.au
ads.nj.com
ads.nola.com
ads.nordichardware.com
ads.nordichardware.se
ads.nwsource.com
ads.nyi.net
ads.nytimes.com
ads.nyx.cz
ads.nzcity.co.nz
ads.o2.pl
ads.oddschecker.com
ads.okcimg.com
ads.ole.com
ads.olivebrandresponse.com
ads.oneplace.com
ads.ookla.com
ads.optusnet.com.au
ads.outpersonals.com
ads.passion.com
ads.pennet.com
ads.penny-arcade.com
ads.pheedo.com
ads.phpclasses.org
ads.pickmeup-ltd.com
ads.planet.nl
ads.pni.com
ads.pof.com
ads.powweb.com
ads.primissima.it
ads.printscr.com
ads.prisacom.com
ads.program3.com
ads.psd2html.com
ads.pushplay.com
ads.quoka.de
ads.rcs.it
ads.recoletos.es
ads.rediff.com
ads.redlightcenter.com
ads.redtube.com
ads.resoom.de
ads.returnpath.net
ads.s3.sitepoint.com
ads.satyamonline.com
ads.savannahnow.com
ads.saymedia.com
ads.scifi.com
ads.seniorfriendfinder.com
ads.servebom.com
ads.sexinyourcity.com
ads.shizmoo.com
ads.shopstyle.com
ads.sift.co.uk
ads.silverdisc.co.uk
ads.slim.com
ads.smartclick.com
ads.soft32.com
ads.space.com
ads.sptimes.com
ads.stackoverflow.com
ads.sun.com
ads.supplyframe.com
ads.t-online.de
ads.tahono.com
ads.techtv.com
ads.telegraph.co.uk
ads.themovienation.com
ads.thestar.com
ads.tmcs.net
ads.totallyfreestuff.com
ads.townhall.com
ads.trinitymirror.co.uk
ads.tripod.com
ads.tripod.lycos.co.uk
ads.tripod.lycos.de
ads.tripod.lycos.es
ads.tripod.lycos.it
ads.tripod.lycos.nl
ads.tripod.spray.se
ads.tso.dennisnet.co.uk
ads.uknetguide.co.uk
ads.ultimate-guitar.com
ads.uncrate.com
ads.undertone.com
ads.usatoday.com
ads.v3.com
ads.verticalresponse.com
ads.vgchartz.com
ads.videosz.com
ads.virtual-nights.com
ads.virtualcountries.com
ads.vnumedia.com
ads.waps.cn
ads.wapx.cn
ads.weather.ca
ads.web.aol.com
ads.web.cs.com
ads.web.de
ads.webmasterpoint.org
ads.websiteservices.com
ads.whi.co.nz
ads.whoishostingthis.com
ads.wiezoekje.nl
ads.wikia.nocookie.net
ads.wineenthusiast.com
ads.wwe.biz
ads.xhamster.com
ads.xtra.co.nz
ads.y-0.net
ads.yahoo.com
ads.yimg.com
ads.yldmgrimg.net
ads.yourfreedvds.com
ads.youtube.com
ads.zdnet.com
ads.ztod.com
ads03.redtube.com
ads1.canoe.ca
ads1.mediacapital.pt
ads1.msn.com
ads1.rne.com
ads1.virtual-nights.com
ads10.speedbit.com
ads180.com
ads2.brazzers.com
ads2.clearchannel.com
ads2.contentabc.com
ads2.gamecity.net
ads2.jubii.dk
ads2.net-communities.co.uk
ads2.oneplace.com
ads2.rne.com
ads2.virtual-nights.com
ads2.xnet.cz
ads2004.treiberupdate.de
ads3.contentabc.com
ads3.gamecity.net
ads3.virtual-nights.com
ads4.clearchannel.com
ads4.gamecity.net
ads4.virtual-nights.com
ads4homes.com
ads5.canoe.ca
ads5.virtual-nights.com
ads6.gamecity.net
ads7.gamecity.net
ads8.com
adsatt.abc.starwave.com
Adsatt.ABCNews.starwave.com
adsatt.espn.go.com
adsatt.espn.starwave.com
Adsatt.go.starwave.com
adsby.bidtheatre.com
adscale.de
adscholar.com
adscience.nl
adscpm.com
adsdaq.com
adsdk.com
adsend.de
adserv.evo-x.de
adserv.gamezone.de
adserv.iafrica.com
adserv.qconline.com
adserve.ams.rhythmxchange.com
adserver-live.yoc.mobi
adserver.43plc.com
adserver.71i.de
adserver.adultfriendfinder.com
adserver.aidameter.com
adserver.aol.fr
adserver.beggarspromo.com
adserver.betandwin.de
adserver.bing.com
adserver.bizhat.com
adserver.break-even.it
adserver.cams.com
adserver.com
adserver.digitoday.com
adserver.dotcommedia.de
adserver.finditquick.com
adserver.flossiemediagroup.com
adserver.freecity.de
adserver.freenet.de
adserver.friendfinder.com
adserver.hardsextube.com
adserver.hardwareanalysis.com
adserver.html.it
adserver.irishwebmasterforum.com
adserver.janes.com
adserver.libero.it
adserver.news.com.au
adserver.ngz-network.de
adserver.nydailynews.com
adserver.o2.pl
adserver.oddschecker.com
adserver.omroepzeeland.nl
adserver.pl
adserver.portalofevil.com
adserver.portugalmail.net
adserver.portugalmail.pt
adserver.sanomawsoy.fi
adserver.sciflicks.com
adserver.sharewareonline.com
adserver.spankaway.com
adserver.startnow.com
adserver.theonering.net
adserver.twitpic.com
adserver.viagogo.com
adserver.virginmedia.com
adserver.yahoo.com
adserver01.de
adserver1-images.backbeatmedia.com
adserver1.backbeatmedia.com
adserver1.mindshare.de
adserver1.ogilvy-interactive.de
adserver2.mindshare.de
adserverplus.com
adserversolutions.com
adservinginternational.com
adsfac.eu
adsfac.net
adsfac.us
adshost1.com
adside.com
adsk2.co
adskape.ru
adsklick.de
adsmarket.com
adsmart.co.uk
adsmart.com
adsmart.net
adsmogo.com
adsnative.com
adsoftware.com
adsoldier.com
adsonar.com
adspace.ro
adspeed.net
adspirit.de
adsponse.de
adsremote.scrippsnetworks.com
adsrevenue.net
adsrv.deviantart.com
adsrv.eacdn.com
adsrv.iol.co.za
adsrvr.org
adsstat.com
adstat.4u.pl
adstest.weather.com
adsupply.com
adsymptotic.com
adsynergy.com
adsys.townnews.com
adsystem.simplemachines.org
adtech.de
adtechus.com
adtegrity.net
adthis.com
adtiger.de
adtoll.com
adtology.com
adtoma.com
adtrace.org
adtrade.net
adtrading.de
adtrak.net
adtriplex.com
adultadvertising.com
adv-adserver.com
adv-banner.libero.it
adv.cooperhosting.net
adv.freeonline.it
adv.hwupgrade.it
adv.livedoor.com
adv.webmd.com
adv.wp.pl
adv.yo.cz
advariant.com
adventory.com
advert.bayarea.com
advert.dyna.ultraweb.hu
adverticum.com
adverticum.net
adverticus.de
advertise.com
advertiseireland.com
advertisespace.com
advertising.com
advertising.guildlaunch.net
advertisingbanners.com
advertisingbox.com
advertmarket.com
advertmedia.de
advertpro.sitepoint.com
advertpro.ya.com
adverts.carltononline.com
advertserve.com
advertstream.com
advertwizard.com
advideo.uimserv.net
adview.ppro.de
advisormedia.cz
adviva.net
advnt.com
adwareremovergold.com
adwhirl.com
adwitserver.com
adworldnetwork.com
adworx.at
adworx.be
adworx.nl
adx.allstar.cz
adx.atnext.com
adxpansion.com
adxpose.com
adxvalue.com
adyea.com
adzerk.net
adzerk.s3.amazonaws.com
adzones.com
af-ad.co.uk
affbuzzads.com
affili.net
affiliate.1800flowers.com
affiliate.doubleyourdating.com
affiliate.dtiserv.com
affiliate.gamestop.com
affiliate.mercola.com
affiliate.mogs.com
affiliate.offgamers.com
affiliate.travelnow.com
affiliate.viator.com
affiliatefuel.com
affiliatefuture.com
affiliates.allposters.com
affiliates.babylon.com
affiliates.digitalriver.com
affiliates.globat.com
affiliates.internationaljock.com
affiliates.streamray.com
affiliates.thinkhost.net
affiliates.thrixxx.com
affiliates.ultrahosting.com
affiliatetracking.com
affiliatetracking.net
affiliatewindow.com
affiliation-france.com
afftracking.justanswer.com
ah-ha.com
ahalogy.com
aidu-ads.de
aim4media.com
aistat.net
aktrack.pubmatic.com
alclick.com
alenty.com
alexa-sitestats.s3.amazonaws.com
all4spy.com
alladvantage.com
allosponsor.com
amazingcounters.com
amazon-adsystem.com
americash.com
amung.us
an.tacoda.net
anahtars.com
analytics.adpost.org
analytics.google.com
analytics.live.com
analytics.yahoo.com
anm.intelli-direct.com
annonser.dagbladet.no
apex-ad.com
api.intensifier.de
apture.com
arc1.msn.com
arcadebanners.com
ard.xxxblackbook.com
are-ter.com
as.webmd.com
as1.advfn.com
assets1.exgfnetwork.com
assoc-amazon.com
at-adserver.alltop.com
atdmt.com
athena-ads.wikia.com
atwola.com
auctionads.com
auctionads.net
audience2media.com
audit.median.hu
audit.webinform.hu
auto-bannertausch.de
autohits.dk
avenuea.com
avpa.javalobby.org
avres.net
avsads.com
awempire.com
awin1.com
azfront.com
b-1st.com
b.aol.com
b.engadget.com
ba.afl.rakuten.co.jp
babs.tv2.dk
backbeatmedia.com
banik.redigy.cz
banner-exchange-24.de
banner.ad.nu
banner.ambercoastcasino.com
banner.blogranking.net
banner.buempliz-online.ch
banner.casino.net
banner.casinodelrio.com
banner.cotedazurpalace.com
banner.coza.com
banner.cz
banner.easyspace.com
banner.elisa.net
banner.eurogrand.com
banner.featuredusers.com
banner.getgo.de
banner.goldenpalace.com
banner.img.co.za
banner.inyourpocket.com
banner.kiev.ua
banner.linux.se
banner.media-system.de
banner.mindshare.de
banner.nixnet.cz
banner.noblepoker.com
banner.northsky.com
banner.orb.net
banner.penguin.cz
banner.rbc.ru
banner.relcom.ru
banner.tanto.de
banner.titan-dsl.de
banner.vadian.net
banner.webmersion.com
banner.wirenode.com
bannerads.de
bannerboxes.com
bannercommunity.de
bannerconnect.com
bannerconnect.net
bannerexchange.cjb.net
bannerflow.com
bannergrabber.internet.gr
bannerhost.com
bannerimage.com
bannerlandia.com.ar
bannermall.com
bannermarkt.nl
bannerpower.com
banners.adultfriendfinder.com
banners.amigos.com
banners.asiafriendfinder.com
banners.audioholics.com
banners.babylon-x.com
banners.bol.com.br
banners.cams.com
banners.clubseventeen.com
banners.czi.cz
banners.dine.com
banners.direction-x.com
banners.directnic.com
banners.easydns.com
banners.freett.com
banners.friendfinder.com
banners.getiton.com
banners.iq.pl
banners.isoftmarketing.com
banners.lifeserv.com
banners.linkbuddies.com
banners.passion.com
banners.resultonline.com
banners.sexsearch.com
banners.sys-con.com
banners.thomsonlocal.com
banners.videosz.com
banners.virtuagirlhd.com
banners.wunderground.com
bannerserver.com
bannersgomlm.com
bannershotlink.perfectgonzo.com
bannersng.yell.com
bannerspace.com
bannerswap.com
bannertesting.com
bannery.cz
bannieres.acces-contenu.com
bans.adserver.co.il
bans.bride.ru
barnesandnoble.bfast.com
basebanner.com
baypops.com
bbelements.com
bbn.img.com.ua
begun.ru
belstat.com
belstat.nl
berp.com
best-pr.info
best-top.ro
bestsearch.net
bhclicks.com
bidclix.com
bidclix.net
bidswitch.net
bidtrk.com
bidvertiser.com
bigbangmedia.com
bigclicks.com
billboard.cz
bitads.net
bitmedianetwork.com
bizad.nikkeibp.co.jp
bizrate.com
blast4traffic.com
blingbucks.com
blogads.com
blogcounter.de
blogherads.com
blogrush.com
blogtoplist.se
blogtopsites.com
blueadvertise.com
bluekai.com
bluelithium.com
bluewhaleweb.com
bm.annonce.cz
bn.bfast.com
boersego-ads.de
boldchat.com
boom.ro
boomads.com
boost-my-pr.de
box.anchorfree.net
bpath.com
braincash.com
brandreachsys.com
bravenet.com.invalid
bridgetrack.com
brightinfo.com
british-banners.com
bs.yandex.ru
bttrack.com
budsinc.com
bullseye.backbeatmedia.com
buyhitscheap.com
buysellads.com
buzzonclick.com
bvalphaserver.com
bwp.download.com
c.bigmir.net
c1.nowlinux.com
c1exchange.com
campaign.bharatmatrimony.com
caniamedia.com
carbonads.com
carbonads.net
casalemedia.com
casalmedia.com
cash4members.com
cash4popup.de
cashcrate.com
cashengines.com
cashfiesta.com
cashlayer.com
cashpartner.com
casinogames.com
casinopays.com
casinorewards.com
casinotraffic.com
casinotreasure.com
cbanners.virtuagirlhd.com
cbmall.com
cdn.freefacti.com
cdn.freefarcy.com
cecash.com
centerpointmedia.com
ceskydomov.alias.ngs.modry.cz
cetrk.com
cgicounter.puretec.de
ch.questionmarket.com
chameleon.ad
channelintelligence.com
chart.dk
chartbeat.com
chartbeat.net
checkm8.com
checkstat.nl
chestionar.ro
chitika.net
cibleclick.com
cityads.telus.net
cj.com
cjbmanagement.com
cjlog.com
claria.com
class-act-clicks.com
click.absoluteagency.com
click.fool.com
click.kmindex.ru
click2freemoney.com
click2paid.com
clickability.com
clickadz.com
clickagents.com
clickbank.com
clickbank.net
clickbooth.com
clickboothlnk.com
clickbrokers.com
clickcompare.co.uk
clickdensity.com
clickedyclick.com
clickhereforcellphones.com
clickhouse.com
clickhype.com
clicklink.jp
clickmedia.ro
clickonometrics.pl
clicks.equantum.com
clicks.mods.de
clickserve.cc-dt.com
clicksor.com
clicktag.de
clickthrucash.com
clickthruserver.com
clickthrutraffic.com
clicktrace.info
clicktrack.ziyu.net
clicktracks.com
clicktrade.com
clickxchange.com
clickz.com
clickzxc.com
clicmanager.fr
clientmetrics-pa.googleapis.com
clients.tbo.com
clixgalore.com
clk.konflab.com
clkads.com
clkrev.com
cluster.adultworld.com
clustrmaps.com
cmpstar.com
cnomy.com
cnt.spbland.ru
cnt1.pocitadlo.cz
code-server.biz
colonize.com
comclick.com
commindo-media-ressourcen.de
commissionmonster.com
compactbanner.com
comprabanner.it
confirmed-profits.com
connextra.com
contaxe.de
content.acc-hd.de
content.ad
contextweb.com
conversantmedia.com
conversionruler.com
cookies.cmpnet.com
coremetrics.com
count.rbc.ru
count.rin.ru
count.west263.com
counted.com
counter.bloke.com
counter.cnw.cz
counter.cz
counter.dreamhost.com
counter.fateback.com
counter.mirohost.net
counter.mojgorod.ru
counter.nowlinux.com
counter.rambler.ru
counter.search.bg
counter.sparklit.com
counter.yadro.ru
counters.honesty.com
counting.kmindex.ru
counts.tucows.com
coupling-media.de
cpalead.com
cpays.com
cpmaffiliation.com
cpmstar.com
cpxinteractive.com
cqcounter.com
crakmedia.com
craktraffic.com
crawlability.com
crazypopups.com
creafi-online-media.com
creative.whi.co.nz
creatives.as4x.tmcs.net
creatives.livejasmin.com
crispads.com
criteo.com
crowdgravity.com
crtv.mate1.com
crwdcntrl.net
ctnetwork.hu
cubics.com
customad.cnn.com
cyberbounty.com
cybermonitor.com
d.adroll.com
dakic-ia-300.com
danban.com
dapper.net
datashreddergold.com
dbbsrv.com
dc-storm.com
de17a.com
dealdotcom.com
debtbusterloans.com
decknetwork.net
deloo.de
demandbase.com
demdex.net
di1.shopping.com
dialerporn.com
didtheyreadit.com
direct-xxx-access.com
directaclick.com
directleads.com
directorym.com
directtrack.com
discountclick.com
displayadsmedia.com
dist.belnk.com
dmtracker.com
dmtracking.alibaba.com
dmtracking2.alibaba.com
dnads.directnic.com
domaining.in
domainsponsor.com
domainsteam.de
domdex.com
doubleclick.com
doubleclick.de
doubleclick.net
doublepimp.com
drumcash.com
dynamic.fmpub.net
e-adimages.scrippsnetworks.com
e-bannerx.com
e-debtconsolidation.com
e-m.fr
e-n-t-e-r-n-e-x.com
e-planning.net
e.kde.cz
eadexchange.com
eas.almamedia.fi
easyhits4u.com
ebayadvertising.com
ebocornac.com
ebuzzing.com
ecircle-ag.com
eclick.vn
ecoupons.com
edgeio.com
effectivemeasure.com
effectivemeasure.net
eiv.baidu.com
elitedollars.com
elitetoplist.com
emarketer.com
emediate.dk
emediate.eu
engine.espace.netavenir.com
enginenetwork.com
enoratraffic.com
enquisite.com
entercasino.com
entrecard.s3.amazonaws.com
eqads.com
ero-advertising.com
esellerate.net
estat.com
etahub.com
etargetnet.com
etracker.de
eu-adcenter.net
eu1.madsone.com
eur.a1.yimg.com
eurekster.com
euro-linkindex.de
euroclick.com
euros4click.de
eusta.de
evergage.com
evidencecleanergold.com
ewebcounter.com
exchange-it.com
exchange.bg
exchangead.com
exchangeclicksonline.com
exelator.com
exit76.com
exitexchange.com
exitfuel.com
exoclick.com
exogripper.com
experteerads.com
exponential.com
express-submit.de
extractorandburner.com
extreme-dm.com
extremetracking.com
eyeblaster.com
eyereturn.com
eyeviewads.com
eyewonder.com
ezula.com
f5biz.com
fast-adv.it
fastclick.com
fastclick.com.edgesuite.net
fastclick.net
fb-promotions.com
fc.webmasterpro.de
feedbackresearch.com
feedjit.com
ffxcam.fairfax.com.au
fimc.net
fimserve.com
findcommerce.com
findyourcasino.com
fineclicks.com
first.nova.cz
firstlightera.com
flashtalking.com
fleshlightcash.com
flexbanner.com
flowgo.com
flurry.com
fonecta.leiki.com
foo.cosmocode.de
forex-affiliate.net
fpctraffic.com
fpctraffic2.com
fragmentserv.iac-online.de
free-banners.com
freebanner.com
freelogs.com
freeonlineusers.com
freepay.com
freestats.com
freestats.tv
freewebcounter.com
funklicks.com
funpageexchange.com
fusionads.net
fusionquest.com
fxstyle.net
galaxien.com
game-advertising-online.com
gamehouse.com
gamesites100.net
gamesites200.com
gamesitestop100.com
gator.com
gbanners.hornymatches.com
gemius.pl
geo.digitalpoint.com
geobanner.adultfriendfinder.com
geovisite.com
getclicky.com
globalismedia.com
globaltakeoff.net
globaltrack.com.invalid
globe7.com
globus-inter.com
gmads.net
go-clicks.de
go-rank.de
goingplatinum.com
goldstats.com
google-analytics.com
googleadservices.com
googlesyndication.com
gostats.com
gp.dejanews.com
gpr.hu
grafstat.ro
grapeshot.co.uk
greystripe.com
gtop.ro
gtop100.com
gunggo.com
harrenmedia.com
harrenmedianetwork.com
havamedia.net
heias.com
hentaicounter.com
herbalaffiliateprogram.com
hexusads.fluent.ltd.uk
heyos.com
hgads.com
hidden.gogoceleb.com
hightrafficads.com
histats.com
hit-parade.com
hit.bg
hit.ua
hit.webcentre.lycos.co.uk
hitbox.com
hitcents.com
hitfarm.com
hitiz.com
hitlist.ru
hitlounge.com
hitometer.com
hits.europuls.eu
hits.informer.com
hits.puls.lv
hits.theguardian.com
hits4me.com
hits4pay.com
hitslink.com
hittail.com
hollandbusinessadvertising.nl
homepageking.de
hostedads.realitykings.com
hotjar.com
hotkeys.com
hotlog.ru
hotrank.com.tw
hs-analytics.net
htmlhubing.xyz
httpool.com
hurricanedigitalmedia.com
hydramedia.com
hyperbanner.net
hypertracker.com
i-clicks.net
i.xx.openx.com
i1img.com
i1media.no
ia.iinfo.cz
iad.anm.co.uk
iadnet.com
iasds01.com
iconadserver.com
icptrack.com
idcounter.com
identads.com
idot.cz
idregie.com
idtargeting.com
ientrymail.com
iesnare.com
ifa.tube8live.com
ilbanner.com
ilead.itrack.it
ilovecheating.com
imageads.canoe.ca
imagecash.net
images-pw.secureserver.net
images.v3.com
imarketservices.com
img.prohardver.hu
imgpromo.easyrencontre.com
imonitor.nethost.cz
imprese.cz
impressionmedia.cz
impressionz.co.uk
imrworldwide.com
inboxdollars.com
incentaclick.com
indexstats.com
indieclick.com
industrybrains.com
inetlog.ru
infinite-ads.com
infinityads.com
infolinks.com
information.com
inringtone.com
insightexpress.com
insightexpressai.com
inspectorclick.com
instantmadness.com
intelliads.com
intellitxt.com
interactive.forthnet.gr
intergi.com
internetfuel.com
interreklame.de
interstat.hu
ip.ro
ip193.cn
iperceptions.com
ipro.com
ireklama.cz
itfarm.com
itop.cz
its-that-easy.com
itsptp.com
jcount.com
jinkads.de
joetec.net
js.users.51.la
juicyads.com
jumptap.com
justrelevant.com
justwebads.com
k.iinfo.cz
kanoodle.com
keymedia.hu
kindads.com
kissmetrics.com
kliks.nl
kniverto.com
komoona.com
kompasads.com
kontera.com
kt-g.de
ktu.sv2.biz
lakequincy.com
launchbit.com
layer-ad.de
layer-ads.de
lbn.ru
lct.salesforce.com
lead-analytics.nl
leadboltads.net
leadclick.com
leadingedgecash.com
leadzupc.com
levelrate.de
lfstmedia.com
liftdna.com
ligatus.com
ligatus.de
lightningcast.net
lightspeedcash.com
link-booster.de
link4ads.com
linkadd.de
linkbuddies.com
linkexchange.com
linkprice.com
linkrain.com
linkreferral.com
links-ranking.de
linkshighway.com
linkstorms.com
linkswaper.com
linktarget.com
liquidad.narrowcastmedia.com
liveintent.com
liverail.com
loading321.com
log.btopenworld.com
logua.com
lop.com
lucidmedia.com
lzjl.com
m.webtrends.com
m1.webstats4u.com
m4n.nl
mackeeperapp.mackeeper.com
madclient.uimserv.net
madisonavenue.com
mads.cnet.com
madvertise.de
marchex.com
market-buster.com
marketing.888.com
marketing.hearstmagazines.nl
marketing.nyi.net
marketing.osijek031.com
marketingsolutions.yahoo.com
maroonspider.com
mas.sector.sk
mastermind.com
matchcraft.com
mathtag.com
max.i12.de
maximumcash.com
mbn.com.ua
mbs.megaroticlive.com
mbuyu.nl
mdotm.com
measuremap.com
media-adrunner.mycomputer.com
media-servers.net
media.ftv-publicite.fr
media.funpic.de
media6degrees.com
mediaarea.eu
mediacharger.com
mediadvertising.ro
mediageneral.com
mediamath.com
mediamgr.ugo.com
mediaplazza.com
mediaplex.com
mediascale.de
mediatext.com
mediax.angloinfo.com
mediaz.angloinfo.com
medleyads.com
medyanetads.com
megacash.de
megago.com
megastats.com
megawerbung.de
metaffiliation.com
metanetwork.com
methodcash.com
metrics.windowsitpro.com
mgid.com
miarroba.com
microstatic.pl
microticker.com
midnightclicking.com
misstrends.com
mixpanel.com
mixtraffic.com
mjxads.internet.com
mlm.de
mmismm.com
mmtro.com
moatads.com
mobclix.com
mocean.mobi
moneyexpert.com
monsterpops.com
mopub.com
mouseflow.com
mpstat.us
mr-rank.de
mrskincash.com
mtree.com
musiccounter.ru
muwmedia.com
myaffiliateprogram.com
mybloglog.com
mycounter.ua
mymoneymakingapp.com
mypagerank.net
mypagerank.ru
mypowermall.com
mystat-in.net
mystat.pl
mytop-in.net
n69.com
naiadsystems.com.invalid
naj.sk
namimedia.com
nastydollars.com
navigator.io
navrcholu.cz
nbjmp.com
ndparking.com
nedstat.com
nedstat.nl
nedstatbasic.net
nedstatpro.net
nend.net
neocounter.neoworx-blog-tools.net
neoffic.com
net-filter.com
netaffiliation.com
netagent.cz
netclickstats.com
netcommunities.com
netdirect.nl
netincap.com
netpool.netbookia.net
netshelter.net
neudesicmediagroup.com
newads.bangbros.com
newbie.com
newnet.qsrch.com
newnudecash.com
newopenx.detik.com
newt1.adultadworld.com
newt1.adultworld.com
newtopsites.com
ng3.ads.warnerbros.com
ngs.impress.co.jp
nitroclicks.com
novem.pl
nuggad.net
numax.nu-1.com
nuseek.com
oas.benchmark.fr
oas.foxnews.com
oas.repubblica.it
oas.roanoke.com
oas.salon.com
oas.toronto.com
oas.uniontrib.com
oas.villagevoice.com
oascentral.businessweek.com
oascentral.chicagobusiness.com
oascentral.fortunecity.com
oascentral.register.com
oewa.at
oewabox.at
offerforge.com
offermatica.com
olivebrandresponse.com
omniture.com
onclasrv.com
onclickads.net
oneandonlynetwork.com
onenetworkdirect.com
onestat.com
onestatfree.com
online-metrix.net
onlinecash.com
onlinecashmethod.com
onlinerewardcenter.com
openad.tf1.fr
openad.travelnow.com
openads.friendfinder.com
openads.org
openx.angelsgroup.org.uk
openx.blindferret.com
opienetwork.com
optimost.com
optmd.com
ordingly.com
ota.cartrawler.com
otto-images.developershed.com
outbrain.com
overture.com
owebmoney.ru
oxado.com
oxcash.com
oxen.hillcountrytexas.com
p.adpdx.com
pagead.l.google.com
pagefair.com
pagerank-ranking.de
pagerank-submitter.de
pagerank-united.de
pagerank4you.com
pageranktop.com
parse.ly.invalid
parsely.com
partage-facile.com
partner-ads.com
partner.pelikan.cz
partner.topcities.com
partnerad.l.google.com
partnercash.de
partners.priceline.com
passion-4.net
pay-ads.com
paycounter.com
paypopup.com
payserve.com
pbnet.ru
pcash.imlive.com
peep-auktion.de
peer39.com
pennyweb.com
pepperjamnetwork.com
percentmobile.com
perfectaudience.com
perfiliate.com
performancerevenue.com
performancerevenues.com
performancing.com
pgmediaserve.com
pgpartner.com
pheedo.com
phoenix-adrunner.mycomputer.com
phpadsnew.new.natuurpark.nl
phpmyvisites.net
picadmedia.com
pillscash.com
pimproll.com
pixel.adsafeprotected.com
pixel.jumptap.com
pixel.redditmedia.com
play4traffic.com
playhaven.com
plista.com
plugrush.com
pointroll.com
pop-under.ru
popads.net
popub.com
popunder.ru
popup.msn.com
popupmoney.com
popupnation.com
popups.infostart.com
popuptraffic.com
porngraph.com
porntrack.com
postrelease.com
potenza.cz
pr-star.de
pr-ten.de
praddpro.de
prchecker.info
precisioncounter.com
predictad.com
premium-offers.com
primaryads.com
primetime.net
privatecash.com
pro-advertising.com
pro.i-doctor.co.kr
proext.com
profero.com
projectwonderful.com
promo.badoink.com
promo.ulust.com
promo1.webcams.nl
promobenef.com
promos.fling.com
promote.pair.com
promotion-campaigns.com
pronetadvertising.com
propellerads.com
proranktracker.com
proton-tm.com
protraffic.com
provexia.com
prsitecheck.com
psstt.com
pub.chez.com
pub.club-internet.fr
pub.hardware.fr
pub.realmedia.fr
pubdirecte.com
publicidad.elmundo.es
pubmatic.com
pubs.lemonde.fr
pulse360.com
q.azcentral.com
qctop.com
qnsr.com
quantcast.com
quantserve.com
quarterserver.de
questaffiliates.net
quigo.com
quinst.com
quisma.com
rad.msn.com
radar.cedexis.com
radarurl.com
radiate.com
rampidads.com
rank-master.com
rank-master.de
rankchamp.de
ranking-charts.de
ranking-hits.de
ranking-id.de
ranking-links.de
ranking-liste.de
ranking-street.de
rankingchart.de
rankingscout.com
rankyou.com
rapidcounter.com
rate.ru
ratings.lycos.com
rb1.design.ru
re-directme.com
reachjunction.com
reactx.com
readserver.net
realcastmedia.com
realclix.com
realmedia-a800.d4p.net
realtechnetwork.com
realtracker.com
reduxmedia.com
reduxmediagroup.com
reedbusiness.com.invalid
referralware.com
regnow.com
reinvigorate.net
reklam.rfsl.se
reklama.mironet.cz
reklama.reflektor.cz
reklamcsere.hu
reklame.unwired-i.net
reklamer.com.ua
relevanz10.de
relmaxtop.com
remotead.cnet.com
republika.onet.pl
retargeter.com
revenue.net
revenuedirect.com
revsci.net
revstats.com
richmails.com
richmedia.yimg.com
richwebmaster.com
rightstats.com
rlcdn.com
rle.ru
rmads.msn.com
rmedia.boston.com
roar.com
robotreplay.com
roia.biz
rok.com.com
rose.ixbt.com
rotabanner.com
roxr.net
rtbpop.com
rtbpopd.com
ru-traffic.com
ru4.com
rubiconproject.com
s.adroll.com
s2d6.com
sageanalyst.net
sail-horizon.com
samsungacr.com
samsungads.com
sbx.pagesjaunes.fr
scambiobanner.aruba.it
scanscout.com
scopelight.com
scorecardresearch.com
scratch2cash.com
scripte-monster.de
searchfeast.com
searchmarketing.com
searchramp.com
secure.webconnect.net
sedoparking.com
sedotracker.com
seeq.com.invalid
sensismediasmart.com.au
seo4india.com
serv0.com
servedby-buysellads.com
servedbyadbutler.com
servedbyopenx.com
services.hearstmags.com
serving-sys.com
sexaddpro.de
sexadvertentiesite.nl
sexcounter.com
sexinyourcity.com
sexlist.com
sextracker.com
sexystat.com
shareadspace.com
shareasale.com
sharepointads.com
sher.index.hu
shinystat.com
shinystat.it
shoppingads.com
siccash.com
sidebar.angelfire.com
sinoa.com
sitemeter.com
sitestat.com
sixsigmatraffic.com
skimresources.com
skylink.vn
slickaffiliate.com
slopeaota.com
smart4ads.com
smartadserver.com
smowtion.com
snapads.com
snoobi.com
socialspark.com
softclick.com.br
spacash.com
sparkstudios.com
specificmedia.co.uk
specificpop.com
spezialreporte.de
spinbox.techtracker.com
spinbox.versiontracker.com
sponsorads.de
sponsorpro.de
sponsors.thoughtsmedia.com
spot.fitness.com
spotxchange.com
spylog.com
spywarelabs.com
spywarenuker.com
spywords.com
srwww1.com
starffa.com
start.freeze.com
stat.cliche.se
stat.dealtime.com
stat.dyna.ultraweb.hu
stat.pl
stat.su
stat.tudou.com
stat.webmedia.pl
stat.zenon.net
stat24.com
stat24.meta.ua
statcounter.com
static.fmpub.net
static.itrack.it
staticads.btopenworld.com
statistik-gallup.net
statm.the-adult-company.com
stats.blogger.com
stats.cts-bv.nl
stats.directnic.com
stats.hyperinzerce.cz
stats.mirrorfootball.co.uk
stats.multiup.org
stats.olark.com
stats.suite101.com
stats.surfaid.ihost.com
stats.townnews.com
stats.unwired-i.net
stats.wordpress.com
stats.x14.eu
stats4all.com
statsie.com
statxpress.com
steelhouse.com
steelhousemedia.com
stickyadstv.com
suavalds.com
subscribe.hearstmags.com
sugoicounter.com
sumo.com
sumome.com
superclix.de
superstats.com
supertop.ru
supertop100.com
suptullog.com
surfmusik-adserver.de
swan-swan-goose.com
swissadsolutions.com
swordfishdc.com
sx.trhnt.com
t.insigit.com
t.pusk.ru
taboola.com
tacoda.net
tagular.com
tailsweep.co.uk
tailsweep.com
tailsweep.se
takru.com
tangerinenet.biz
tapad.com
targad.de
targetingnow.com
targetnet.com
targetpoint.com
tatsumi-sys.jp
tcads.net
teads.tv
techclicks.net
teenrevenue.com
teliad.de
text-link-ads.com
textad.sexsearch.com
textads.biz
textads.opera.com
textlinks.com
tfag.de
theadhost.com
theads.me
thebugs.ws
thecounter.com
therapistla.com
therichkids.com
thrnt.com
thruport.com
tinybar.com
tizers.net
tlvmedia.com
tntclix.co.uk
top-casting-termine.de
top-site-list.com
top.list.ru
top.mail.ru
top.proext.com
top100-images.rambler.ru
top100.mafia.ru
top123.ro
top20.com.invalid
top20free.com
top90.ro
topbarh.box.sk
topblogarea.se
topbucks.com
topforall.com
topgamesites.net
toplist.cz
toplist.pornhost.com
toplista.mw.hu
toplistcity.com
topmmorpgsites.com.invalid
topping.com.ua
toprebates.com
topsafelist.net
topsearcher.com
topsir.com
topsite.lv
topsites.com.br
topstats.com
totemcash.com
touchclarity.com
touchclarity.natwest.com
tour.brazzers.com
tpnads.com
track.adform.net
track.anchorfree.com
track.gawker.com
trackalyzer.com
tracker.icerocket.com
tracker.marinsm.com
tracking.crunchiemedia.com
tracking.gajmp.com
tracking.internetstores.de
tracking.yourfilehost.com
tracking101.com
trackingsoft.com
trackmysales.com
tradeadexchange.com
tradedoubler.com
traffic-exchange.com
traffic.liveuniversenetwork.com
trafficadept.com
trafficcdn.liveuniversenetwork.com
trafficfactory.biz
trafficholder.com
traffichunt.com
trafficjunky.net
trafficleader.com
trafficsecrets.com
trafficspaces.net
trafficstrategies.com
trafficswarm.com
traffictrader.net
trafficz.com
trafficz.net
traffiq.com
trafic.ro
travis.bosscasinos.com
trekblue.com
trekdata.com
trendcounter.com
trendmd.com
trhunt.com
tribalfusion.com
trix.net
truehits.net
truehits1.gits.net.th
truehits2.gits.net.th
tsms-ad.tsms.com
tubemogul.com
turn.com
tvmtracker.com
twittad.com
tyroo.com
uarating.com
ukbanners.com
ultramercial.com
unanimis.co.uk
untd.com
updated.com
urlcash.net
us.a1.yimg.com
usapromotravel.com
usmsad.tom.com
utarget.co.uk
utils.mediageneral.net
v1.cnzz.com
validclick.com
valuead.com
valueclick.com
valueclickmedia.com
valuecommerce.com
valuesponsor.com
veille-referencement.com
ventivmedia.com
vericlick.com
vertadnet.com
veruta.com
vervewireless.com
vibrantmedia.com
video-stats.video.google.com
videoegg.com
view4cash.de
viewpoint.com
visistat.com
visit.webhosting.yahoo.com
visitbox.de
visual-pagerank.fr
visualrevenue.com
voicefive.com
vpon.com
vrs.cz
vs.tucows.com
vungle.com
warlog.ru
wdads.sx.atl.publicus.com
web-stat.com
web.informer.com
web2.deja.com
webads.co.nz
webads.nl
webangel.ru
webcash.nl
webcounter.cz
webcounter.goweb.de
webgains.com
webmaster-partnerprogramme24.de
webmasterplan.com
webmasterplan.de
weborama.fr
webpower.com
webreseau.com
webseoanalytics.com
websponsors.com
webstat.channel4.com
webstat.com
webstat.net
webstats4u.com
webtrackerplus.com
webtraffic.se
webtraxx.de
webtrendslive.com
werbung.meteoxpress.com
wetrack.it
whaleads.com
whenu.com
whispa.com
whoisonline.net
wholesaletraffic.info
widespace.com
widgetbucks.com
wikia-ads.wikia.com
window.nixnet.cz
wintricksbanner.googlepages.com
witch-counter.de
wlmarketing.com
wmirk.ru
wonderlandads.com
wondoads.de
woopra.com
worldwide-cash.net
wtlive.com
www-banner.chat.ru
www-google-analytics.l.google.com
www.banner-link.com.br
www.dnps.com
www.kaplanindex.com
www.money4exit.de
www.photo-ads.co.uk
www1.gto-media.com
www8.glam.com
wwwpromoter.com
x-traceur.com
x6.yakiuchi.com
xchange.ro
xclicks.net
xertive.com
xg4ken.com
xiti.com
xplusone.com
xponsor.com
xq1.net
xrea.com
xtendmedia.com
xtremetop100.com
xxxcounter.com
xxxmyself.com
y.ibsys.com
yab-adimages.s3.amazonaws.com
yabuka.com
yadro.ru
yesads.com
yesadvertising.com
yieldads.com
yieldlab.net
yieldmanager.com
yieldmanager.net
yieldmo.com
yieldtraffic.com
yoc.mobi
yoggrt.com
z5x.net
zangocash.com
zanox-affiliate.de
zanox.com
zantracker.com
zedo.com
zencudo.co.uk
zenkreka.com
zenzuu.com
zeus.developershed.com
zeusclicks.com
zintext.com
zmedia.com
zv1.november-lax.com
EOF

echo "${yellow}Setting Up Squid to Deny Torrent...${reset}"
clear
echo "${yellow}Setting Up Squid to Deny Torrent...${green}86%${reset}"
sleep 1s
clear
#denying torrent
/bin/cat <<"EOM" >/etc/squid/extensiondeny.txt
\.torrent$
EOM

echo "${yellow}Setting Up Squid to Deny Malwares..${reset}"
sleep 1s
clear
echo "${yellow}Setting Up Squid to Deny Malwares...${green}87%${reset}"
sleep 3s
clear
# deny malwares
cat << EOF > /etc/squid/malware.txt
0koryu0.easter.ne.jp
109-204-26-16.netconnexion.managedbroadband.co.uk
1866809.securefastserver.com
2amsports.com
4dexports.com
50efa6486f1ef.skydivesolutions.be
61kx.uk-insolvencydirect.com
6b8a953b2bf7788063d5-6e453f33ecbb90f11a62a5c376375af3.r71.cf5.rackcdn.com
97b1c56132dfcdd90f93-0c5c8388c0a5897e648f883e2c86dc72.r54.cf5.rackcdn.com
999fitness.com
a.update.51edm.net
ab.usageload32.com
abcdespanol.com
above.e-rezerwacje24.pl
absurdity.flarelight.com
achren.org
acool.csheaven.com
ad-beast.com
ad.9tv.co.il
ad.getfond.info
adgallery.whitehousedrugpolicy.gov
adlock.in
adobeflashupdate14.com
ads.wikipartes.com
adserving.favorit-network.com
adv.riza.it
advancetec.co.uk
afa15.com.ne.kr
agsteier.com
aintdoinshit.com
aippnetworks.com
aircraft.evote.cl
ajewishgift.com
akirkpatrick.com
alegroup.info
alexanderinteriorsanddesign.com
alexandria90.etcserver.com
alisat.biz
alissonluis-musico.sites.uol.com.br
allforlove.de
allxscan.tk
alsoknowsit.com
ama-alliance.com
amazingvacationhotels.com
amazon-sicherheit.kunden-ueberpruefung.xyz
ambulanciaslazaro.com
americancareconcept.com
aminev.com
amu.adduraddonhere.info
amu.boxinstallercompany.info
amu.brandnewinstall.info
amu.helpyourselfinstall.info
amu.twobox4addon.info
analxxxclipsyjh.dnset.com
anshrit.com
antalya.ru
apexgames.org
app.pho8.com
arkinsoftware.in
art-archiv.ru
artsconsortium.org
asham.tourstogo.us
associatesexports.com
atelierprincesse.web.fc2.com
atlcourier.com
atyss.barginginfrance.net
avokka.com
avppet.com
axisbuild.com
azoos.csheaven.com
b.nevadaprivateoffice.com
babos.scrapping.cc
bargainracks.co.uk
batcoroadlinescorporation.com
bbs.bjchun.com
bde.be
be-funk.com
beautysafari.com
becomedebtfree.com.au
beespace.com.ua
beldiplomcom.75.com1.ru
best100catfights.com
betterhomeandgardenideas.com
bezproudoff.cz
bilbaopisos.es
bizzibeans.net
blackfalcon5.net
blacknite.eu
blog.replacemycontacts.com
bluecutsystem.com
bnsoutlaws.co.uk
bonjo.bmbsklep.pl
boogu.barginginfrance.net
bookofkisl.com
boots.fotopyra.pl
borat.elticket.com.ar
boschetto-hotel.gr
bracbetul.com
bracewellfamily.com
bravetools.net
bride1.com
broadtech.co
buffalogoesout.com
buildviet.info
by98.com
cacl.fr
caclclo.web.fc2.com
callingcardsinstantly.com
campamento.queenscamp.com
cannabislyric.com
cannabispicture.com
catjogger.win
centralwestwater.com.au
ceskarepublika.net
chaveiro.bio.br
chsplantsales.co.uk
ciclismovalenciano.com
citymediamagazin.hu
classicallyabsurdphotography.com
classicspeedway.com
cmicapui.ce.gov.br
coaha.frenchgerlemanelectric.com
coalimpex.com
cofeb13east.com
coffeol.com
concede.fmtlib.net
conds.ru
cope.it
corroshield.estb.com.sg
cosmetice-farduri.ro
cosmos.felago.es
cosmos.furnipict.com
cqji.artidentalkurs.com
cracks.vg
crackspider.us
crackzone.net
creditbootcamp.com
crops.dunight.eu
csmail.iggcn.com
cswilliamsburg.com
cudacorp.com
customsboysint.com
cwmgaming.com
cznshuya.ivnet.ru
d1.kuai8.com
d1054130-28095.cp.blacknight.com
d1171912.cp.blacknight.com
d32k27yvyi4kmv.cloudfront.net
d4.cumshots.ws
dancecourt.com
daralasnan.com
dawnframing.com
dcanscapital.co.uk
ddd.gouwuke.cn
decografix.com
decorator.crabgrab.cl
decota.es
decrolyschool.be
deleondeos.com
deletespyware-adware.com
demo.vertexinfo.in
dent-lux.com.pl
dentairemalin.com
destre45.com
dev.wrathofshadows.net
dianepiette.co.uk
diaryofagameaddict.com
dieutribenhkhop.com
dimarsbg.com
dimenal.com.br
dimensionnail.ro
dimsnetwork.com
directxex.com
divine.lunarbreeze.com
dl.downf468.com
dl.heima8.com
dl.microsword.net
dl01.faddmr.com
dofeb.frenchgerlemanelectric.com
doktester.orgfree.com
dougmlee.com
down.feiyang163.com
down.guangsu.cn
down.mykings.pw
down.unadnet.com.cn
down2.feiyang163.com
down3.feiyang163.com
download-archiver.ru
download.56.com
download.grandcloud.cn
download.ttrili.com
download207.mediafire.com
downloads-finereader.ru
downloads-whatsapp.com
dp-medien.eu
drank.fa779.com
dujur.barginginfrance.net
e-matelco.com
e1r.net
earthcontrolsys.com
echoa.randbinternationaltravel.com
edf.fr.kfskz.com
eecky.butlerelectricsupply.com
eekro.cruisingsmallship.com
eeps.me
eeroo.frost-electric-supply.com
eetho.cruisingsmallship.com
efugl.iptvdeals.com
elew72isst.rr.nu
eliehabib.com
elmissouri.fr
elocumjobs.com
emits.iptvdeals.com
eroov.iptvdeals.com
erupt.fernetmoretti.com.ar
esoad.frost-electric-supply.com
espdesign.com.au
estoa.frost-electric-supply.com
eternitymobiles.com
euro-vertrieb.com
europe-academy.net
europol.europe.eu.france.id647744160-2176514326.h5841.com
europol.europe.eu.id214218540-7444056787.h5841.com
evans.babajilab.in
ex.technor.com
exclaim.goldenteamacademy.cl
executivecoaching.co.il
exsexytop.tk
extreembilisim.com
f.gj555.net
faiyazahmed.com
falconsafe.com.sg
fallencrafts.info
faq-candrive.tk
fbku.com
femalewrestlingnow.com
fetishfitnessbabes.com
fetishlocator.com
fgawegwr.chez.com
fgtkmcby02.eu
files.dsnetwb.com
finnhair.co.uk
firehouse651.com
fkhfgfg.tk
flashsavant.com
fo5.a1-downloader.org
fondazioneciampi.org
formessengers.com
fourthgate.org
free-crochet-pattern.com
freefblikes.phpnet.us
freeserials.spb.ru
freeserials.ws
ftp.flyfishusa.com
funchill.com
funkucck.bluerobot.cl
geil.alon3.tk
generalchemicalsupply.com
getdatanetukscan.info
giants.yourzip.co
go-quicky.com
gogetgorgeous.com
gojnox.boxtomarket.com
gosciniec-paproc.pl
gravityexp.com
gredinatib.org
greev.randbinternationaltravel.com
grendizer.biz
grosirkecantikan.com
gulf-industrial.com
gurde.tourstogo.us
guyscards.com
gyboo.cruisingsmallship.com
gylra.cruisingsmallship.com
h1666015.stratoserver.net
hana-naveh.com
hanulsms.com
hardcorepornparty.com
harshwhispers.com
headless.ebkfwd.com
healthybloodpressure.info
helesouurusa.cjb.com
hexadl.line55.net
higher.dwebsi.tk
highflyingfood.com
hinsib.com
hmora.fred-build.tk
hnskorea.co.kr
hoawy.frost-electric-supply.com
hobbat.fvds.ru
hobby-hangar.net
hobbytotaalservice.nl
hoerbird.net
holishit.in
honor.agitaattori.fi
hosting-controlid1.tk
hosting-controlnext.tk
hosting-controlpin.tk
hosting-controlpr.tk
hotfacesitting.com
hotspot.cz
hrdcvn.com.vn
hst-19-33.splius.lt
hujii.qplanner.cf
hy-brasil.mhwang.com
hydraulicpowerpack.com
iamagameaddict.com
id405441215-8305493831.h121h9.com
igagh.tourstogo.us
igoby.frost-electric-supply.com
igroo.barginginfrance.net
image-circul.tk
images.topguncustomz.com
img001.com
immediateresponseforcomputer.com
impressoras-cartoes.com.pt
inclusivediversity.co.uk
incoctel.cl
infoweb-coolinfo.tk
inlinea.co.uk
innatek.com
instruminahui.edu.ec
interactivearea.ru
internet-bb.tk
invention.festinolente.cl
ip-182-50-129-164.ip.secureserver.net
ip-182-50-129-181.ip.secureserver.net
ipl.hk
iptoo.cruisingsmallship.com
isonomia.com.ar
ithyk.frenchgerlemanelectric.com
iwgtest.co.uk
iwhab.randbinternationaltravel.com
ixoox.csheaven.com
iybasketball.info
izzy-cars.nl
japanesevehicles.us
jdfabrication.com
jeanlesigne.com
jeansvixens.com
jessisjewels.com
jktdc.in
job-companybuild.tk
job-compuse.tk
josip-stadler.org
js.tongji.linezing.com
jstaikos.com
jue0jc.lukodorsai.info
juedische-kammerphilharmonie.de
juicypussyclips.com
k.h.a.d.free.fr
kadirzerey.com
kadman.net
kalantzis.net
kapcotool.com
kassabravo.com
keemy.butlerelectricsupply.com
keyways.pt
kfc.i.illuminationes.com
kids-fashion.dk
kingskillz.ru
kipasdenim.com
kollagen4you.se
krsa2gno.congrats-sweepstakes-winner.com
krsa2gno.important-security-brower-alert.com
krsa2gno.internet-security-alert.com
krsa2gno.todays-sweepstakes-winner.com
krsa2gno.youre-todays-lucky-sweeps-winner.com
kulro.csheaven.com
kyrsu.frost-electric-supply.com
lab-cntest.tk
landisbaptist.com
lay.elticket.com.ar
lcbcad.co.uk
leagleconsulting.com
lefos.net
legendsdtv.com
lexu.goggendorf.at
lhs-mhs.org
lifescience.sysu.edu.cn
likes.gisnetwork.net
linkforme.tk
live-dir.tk
livre.wasastation.fi
loft2126.dedicatedpanel.com
losas.cabanaslanina.com.ar
losos.caliane.com.br
luchtenbergdecor.com.br
luckyblank.info
luckyclean.info
luckyclear.info
luckyeffect.info
luckyhalo.info
luckypure.info
luckyshine.info
luckysuccess.info
luckysure.info
luckytidy.info
luggage-tv.com
luggagecast.com
luggagepreview.com
lunaticjazz.com
luwyou.com
lydwood.co.uk
m2132.ehgaugysd.net
mahindrainsurance.com
mailboto.com
malest.com
manoske.com
marchen-toy.co.jp
marialorena.com.br
marx-brothers.mhwang.com
mathenea.com
maxisoft.co.uk
mbrdot.tk
mediatrade.h19.ru
mepra.blautechnology.cl
merrymilkfoods.com
metrocuadro.com.ve
mgfd1b.petrix.net
miespaciopilates.com
milf.gabriola.cl
milleniumpapelaria.com.br
mindstormstudio.ro
ministerio-publi.info
miracema.rj.gov.br
mirandolasrl.it
mlpoint.pt
mmile.com
mobatory.com
mobile.bitterstrawberry.org
mocka.frost-electric-supply.com
molla.gato1000.cl
monarchslo.com
montezuma.spb.ru
morenews3.net
ms11.net
mtldesigns.ca
mueller-holz-bau.com
murbil.hostei.com
mycleanpc.tk
mylabsrl.com
mylondon.hc0.me
myshopmarketim.com
mysmallcock.com
myvksaver.ru
nadegda-95.ru
nailbytes1.com
namso.butlerelectricsupply.com
narrow.azenergyforum.com
natural.buckeyeenergyforum.com
nbook.far.ru
nc2199.eden5.netclusive.de
nctbonline.co.uk
nefib.tourstogo.us
nerez-schodiste-zabradli.com
nestorconsulting.net
networkmedical.com.hk
neumashop.cl
nevergreen.net
new-address.tk
new-softdriver.tk
news4cars.com
njtgsd.attackthethrone.com
nkgamers.com
nlconsulateorlandoorg.siteprotect.net
nmsbaseball.com
nobodyspeakstruth.narod.ru
nonsi.csheaven.com
noobgirls.com
nordiccountry.cz
nortonfire.co.uk
notebookservisru.161.com1.ru
noveslovo.com
nowina.info
ns1.the-sinner.net
ns1.updatesdns.org
ns2ns1.tk
nt-associates.com
nudebeachgalleries.net
nugly.barginginfrance.net
nuptialimages.com
nutnet.ir
oakso.tourstogo.us
oampa.csheaven.com
oapsa.tourstogo.us
oawoo.frenchgerlemanelectric.com
obada-konstruktiwa.org
obkom.net.ua
ocick.frost-electric-supply.com
ocpersian.com
officeon.ch.ma
oilwrestlingeurope.com
okeanbg.com
oknarai.ru
omrdatacapture.com
onrio.com.br
oofuv.cruisingsmallship.com
oojee.barginginfrance.net
ooksu.frost-electric-supply.com
oolsi.frost-electric-supply.com
oosee.barginginfrance.net
oowhe.frost-electric-supply.com
oprahsearch.com
optiker-michelmann.de
optilogus.com
optimization-methods.com
orbowlada.strefa.pl
orkut.krovatka.su
oshoa.iptvdeals.com
oshoo.iptvdeals.com
otylkaaotesanek.cz
outporn.com
ozzysixsixsix.web.fc2.com
pacan.gofreedom.info
pacman.gkgar.com
paraskov.com
patrickhickey.eu
pave.elisecries.com
pb-webdesign.net
peeg.fronterarq.cl
pension-helene.cz
pepelacer.computingservices123.com
perfectionautorepairs.com
personal.editura-amsibiu.ro
pgalvaoteles.pt
pharmadeal.gr
phitenmy.com
phoaz.cruisingsmallship.com
pic.starsarabian.com
pigra.csheaven.com
pix360.co.nf
plank.duplicolor.cl
plantaardigebrandstof.nl
plengeh.wen.ru
podzemi.myotis.info
pogruz.wanyizhao.net
pokachi.net
police11.provenprotection.net
pornstarss.tk
port.bg
portablevaporizer.com
portalfiremasters.com.br
portraitphotographygroup.com
pos-kupang.com
potvaporizer.com
powershopnet.net
pradakomechanicals.com
praxisww.com
pride-u-bike.com
private.hotelcesenaticobooking.info
privatkunden.datapipe9271.com
produla.czatgg.pl
progettocrea.org
prorodeosportmed.com
psooz.tourstogo.us
ptewh.iptvdeals.com
ptool.barginginfrance.net
ptuph.barginginfrance.net
ptush.iptvdeals.com
puenteaereo.info
pulso.butlerelectricsupply.com
pumpkin.brisik.net
purethc.com
pwvita.pl
pybul.bestfrozenporn.nl
q28840.nb.host127-0-0-1.com
quotidiennokoue.com
rainbowcolours.me.uk
rallyeair.com
raneevahijab.id
rat-on-subway.mhwang.com
rawoo.barginginfrance.net
reclamus.com
reishus.de
rentfromart.com
resolvethem.com
revistaelite.com
rl8vd.kikul.com
rocksresort.com.au
roks.ua
rolemodelstreetteam.invasioncrew.com
romsigmed.ro
romvarimarton.hu
roorbong.com
ross.starvingmillionaire.org
rsiuk.co.uk
ru.theswiftones.com
rubiks.ca
rufex.ajfingenieros.cl
ruiyangcn.com
rumog.frost-electric-supply.com
rupor.info
sadiqtv.com
saemark.is
safety.amw.com
salon77.co.uk
santacruzsuspension.com
sanya.vipc2f.com
sasson-cpa.co.il
sayherbal.com
sbnc.hak.su
scaner-do.tk
scaner-figy.tk
scaner-file.tk
scaner-or.tk
scaner-sbite.tk
scaner-sboom.tk
scaner-sdee.tk
scaner-tfeed.tk
scaner-tgame.tk
scanty.colormark.cl
scdsfdfgdr12.tk
scream.garudamp3.com
sdg-translations.com
securitywebservices.com
seet10.jino.ru
semengineers.com
semiyun.com
sentrol.cl
seoholding.com
seonetwizard.com
server1.extra-web.cz
sexyoilwrestling.com
sexyster.tk
sexzoznamka.eu
sgs.us.com
shoal.grahanusareadymix.com
shovi.frost-electric-supply.com
signready.com
silurian.cn
simpi.tourstogo.us
site-checksite.tk
ska.energia.cz
skgroup.kiev.ua
skidki-yuga.ru
skiholidays4beginners.com
slightlyoffcenter.net
slimxxxtubeacn.dnset.com
slimxxxtubealn.ddns.name
slimxxxtubeanr.ddns.name
slimxxxtubeaxy.ddns.name
slimxxxtubeayv.ddns.name
slimxxxtubebej.dnset.com
slimxxxtubebgp.ddns.name
slimxxxtubebmq.dnset.com
slimxxxtubebnd.ddns.name
slimxxxtubecgl.ddns.name
slimxxxtubectk.dnset.com
slimxxxtubecty.ddns.name
slimxxxtubeczp.ddns.name
slimxxxtubedgv.dnset.com
slimxxxtubedjm.ddns.name
slimxxxtubedlb.ddns.name
slimxxxtubedvj.dnset.com
slimxxxtubedxc.ddns.name
slimxxxtubedya.ddns.name
slimxxxtubeejs.ddns.name
slimxxxtubeemz.dnset.com
slimxxxtubefdr.ddns.name
slimxxxtubefel.ddns.name
slimxxxtubeftb.dnset.com
slimxxxtubefzc.ddns.name
slimxxxtubehan.ddns.name
slimxxxtubehdn.dnset.com
slimxxxtubehli.dnset.com
slimxxxtubeidv.ddns.name
slimxxxtubeijc.dnset.com
slimxxxtubeiqb.dnset.com
slimxxxtubejie.dnset.com
slimxxxtubejlp.ddns.name
slimxxxtubejpe.ddns.name
slimxxxtubejvh.ddns.name
slimxxxtubejyk.ddns.name
slimxxxtubekad.ddns.name
slimxxxtubekgj.ddns.name
slimxxxtubekgv.ddns.name
slimxxxtubeklg.dnset.com
slimxxxtubekpn.ddns.name
slimxxxtubekrn.ddns.name
slimxxxtubelap.ddns.name
slimxxxtubelat.ddns.name
slimxxxtubelfr.ddns.name
slimxxxtubelzv.ddns.name
slimxxxtubemue.dnset.com
slimxxxtubeneg.ddns.name
slimxxxtubeneu.ddns.name
slimxxxtubengt.dnset.com
slimxxxtubenqp.ddns.name
slimxxxtubentf.dnset.com
slimxxxtubeocr.dnset.com
slimxxxtubeonf.dnset.com
slimxxxtubeopy.ddns.name
slimxxxtubeoxo.ddns.name
slimxxxtubeoxy.ddns.name
slimxxxtubeppj.dnset.com
slimxxxtubeqfo.ddns.name
slimxxxtubeqsh.ddns.name
slimxxxtubeqve.dnset.com
slimxxxtubeqwr.dnset.com
slimxxxtuberau.ddns.name
slimxxxtuberea.ddns.name
slimxxxtuberep.dnset.com
slimxxxtuberfe.dnset.com
slimxxxtuberjj.ddns.name
slimxxxtuberme.dnset.com
slimxxxtuberue.dnset.com
slimxxxtubesrs.dnset.com
slimxxxtubesrw.ddns.name
slimxxxtubesun.ddns.name
slimxxxtubetmf.ddns.name
slimxxxtubetmg.dnset.com
slimxxxtubetns.ddns.name
slimxxxtubetts.dnset.com
slimxxxtubeubp.dnset.com
slimxxxtubeujh.ddns.name
slimxxxtubeull.dnset.com
slimxxxtubeuvd.dnset.com
slimxxxtubevdn.ddns.name
slimxxxtubevih.dnset.com
slimxxxtubevjk.ddns.name
slimxxxtubewfl.ddns.name
slimxxxtubewiq.ddns.name
slimxxxtubewis.ddns.name
slimxxxtubewmt.dnset.com
slimxxxtubexei.ddns.name
slimxxxtubexiv.dnset.com
slimxxxtubexvq.ddns.name
slimxxxtubexwb.dnset.com
slimxxxtubexxq.dnset.com
slimxxxtubeyge.ddns.name
slimxxxtubeyhz.ddns.name
slimxxxtubeyza.ddns.name
smartify.org
smilll.depozit.hr
smrcek.com
sn-gzzx.com
somethingnice.hc0.me
somnoy.com
soros.departamentosejecutivos.cl
soxorok.ddospower.ro
spatsz.com
spekband.com
sportsulsan.co.kr
spread.diadanoivabh.com.br
spykit.110mb.com
srslogisticts.com
ssl-6582datamanager.de
static.retirementcommunitiesfyi.com
stock.daydreamfuze.com
stopmeagency.free.fr
stork.escortfinder.cl
strangeduckfilms.com
structured.blackswanstore.com
sudcom.org
sunlux.net
sunny99.cholerik.cz
svetyivanrilski.com
svision-online.de
sweettalk.co
sysconcalibration.com
systemscheckusa.com
szinhaz.hu
tabex.sopharma.bg
tahit.wastech2016.in
tamilcm.com
tanner.alicerosenmanmemorial.com
tatschke.net
tavuks.com
tcrwharen.homepage.t-online.de
teameda.comcastbiz.net
teameda.net
tecnocuer.com
tecslide.com
tendersource.com
teprom.it
terem.eltransbt.ro
testtralala.xorg.pl
textsex.tk
thcextractor.com
thcvaporizer.com
thefxarchive.com
theweatherspace.com
thewinesteward.com
timothycopus.aimoo.com
titon.info
tk-gregoric.si
toddscarwash.com
tomalinoalambres.com.ar
tophostbg.net
traff1.com
trafficgrowth.com
trahic.ru
treventuresonline.com
TRIANGLESERVICESLTD.COM
trifle.ernstenco.be
troytempest.com
tscl.com.bd
ttb.tbddlw.com
tube8vidsbbr.dnset.com
tube8vidsbhy.dnset.com
tube8vidsbzx.dnset.com
tube8vidscjk.ddns.name
tube8vidscqs.ddns.name
tube8vidscut.ddns.name
tube8vidsdob.dnset.com
tube8vidsdst.ddns.name
tube8vidsfgd.ddns.name
tube8vidshhr.ddns.name
tube8vidshkk.ddns.name
tube8vidshrw.dnset.com
tube8vidsiet.ddns.name
tube8vidsiww.ddns.name
tube8vidsjac.dnset.com
tube8vidsjan.ddns.name
tube8vidsjhn.ddns.name
tube8vidsjtq.ddns.name
tube8vidslmf.dnset.com
tube8vidslni.dnset.com
tube8vidslqk.ddns.name
tube8vidslrz.ddns.name
tube8vidsnlq.dnset.com
tube8vidsnrt.ddns.name
tube8vidsnvd.ddns.name
tube8vidsnyp.dnset.com
tube8vidsolh.ddns.name
tube8vidsotz.dnset.com
tube8vidsowd.dnset.com
tube8vidspeq.ddns.name
tube8vidsqof.ddns.name
tube8vidsrau.dnset.com
tube8vidsrdr.dnset.com
tube8vidsrhl.ddns.name
tube8vidsrom.dnset.com
tube8vidssan.dnset.com
tube8vidssjw.ddns.name
tube8vidssyg.dnset.com
tube8vidstrh.dnset.com
tube8vidstyp.ddns.name
tube8vidsuty.dnset.com
tube8vidsvaj.dnset.com
tube8vidsvcs.ddns.name
tube8vidsvmr.ddns.name
tube8vidsvrx.ddns.name
tube8vidsvtp.dnset.com
tube8vidswsy.dnset.com
tube8vidswtb.ddns.name
tube8vidswys.ddns.name
tube8vidsxlo.ddns.name
tube8vidsxmx.dnset.com
tube8vidsxpg.ddns.name
tube8vidsxpp.dnset.com
tube8vidsxwu.ddns.name
tube8vidsycs.dnset.com
tube8vidsyip.ddns.name
tube8vidsymz.dnset.com
tube8vidsyre.dnset.com
tube8vidsyyf.dnset.com
tube8vidszmi.ddns.name
tube8vidsznj.ddns.name
tube8vidsznx.ddns.name
tube8vidszyj.ddns.name
tubemoviez.com
typeofmarijuana.com
ubike.tourstogo.us
uchyz.cruisingsmallship.com
ukonline.hc0.me
ukrfarms.com.ua
ukugl.tourstogo.us
unalbilgisayar.com
undefined.it
unitex.home.pl
unlim-app.tk
unlink.altitude.lv
up.mykings.pw
updat120.clanteam.com
update.51edm.net
update.onescan.co.kr
updo.nl
uploads.tmweb.ru
upsoj.iptvdeals.com
upswings.net
url-cameralist.tk
users173.lolipop.jp
utopia-muenchen.de
uvidu.butlerelectricsupply.com
v.inigsplan.ru
valouweeigenaren.nl
vdula.czystykod.pl
veevu.tourstogo.us
veksi.barginginfrance.net
vernoblisk.com
vette-porno.nl
victor.connectcloud.ch
videoflyover.com
villalecchi.com
vipdn123.blackapplehost.com
vistatech.us
vitalityxray.com
vitaly.agricolacolhue.cl
vitamasaz.pl
vitha.csheaven.com
vivaweb.org
vkont.bos.ru
vmay.com
vocational-training.us
vomit.facilitandosonhos.com.br
vroll.net
vural-electronic.com
vvps.ws
w4988.nb.host127-0-0-1.com
w612.nb.host127-0-0-1.com
wahyufian.zoomshare.com
wallpapers91.com
warco.pl
wc0x83ghk.homepage.t-online.de
web-domain.tk
web-fill.tk
web-olymp.ru
web-sensations.com
webcashmaker.com
webcom-software.ws
webordermanager.com
weboxmedia.by
websalesusa.com
websitebuildersinfo.in
welington.info
wetjane.x10.mx
wetyt.tourstogo.us
wfoto.front.ru
whabi.csheaven.com
whave.iptvdeals.com
whitehorsetechnologies.net
windspotter.net
winlock.usa.cc
winrar-soft.ru
winsetupcostotome.easthamvacations.info
wixx.caliptopis.cl
wkmg.co.kr
wmserver.net
womenslabour.org
womsy.bobbutcher.net
wonchangvacuum.com.my
wopper.bioblitzgaming.ca
worldgymperu.com
wp9.ru
writingassociates.com
wroclawski.com.pl
wt10.haote.com
wuvac.agwebdigital.com
wv-law.com
www.0uk.net
www.3difx.com
www.3peaks.co.jp
www.acquisizionevideo.com
www.actiagroup.com
www.advancesrl.eu
www.aerreravasi.com
www.airbornehydrography.com
www.airsonett.se
www.alphamedical02.fr
www.angolotesti.it
www.anticarredodolomiti.com
www.archigate.it
www.areadiprova.eu
www.arkinsoftware.in
www.assculturaleincontri.it
www.atousoft.com
www.autoappassionati.it
www.bcservice.it
www.blueimagen.com
www.casamama.nl
www.catgallery.com
www.caue971.org
www.ceisystems.it
www.cellularbeton.it
www.cerquasas.it
www.chiaperottipaolo.it
www.cifor.com
www.coloritpak.by
www.consumeralternatives.org
www.cortesidesign.com
www.daspar.net
www.del-marine.com
www.dezuiderwaard.nl
www.divshare.com
www.doctor-alex.com
www.donneuropa.it
www.dowdenphotography.com
www.downloaddirect.com
www.drteachme.com
www.eivamos.com
www.elisaart.it
www.email-login-support.com
www.emrlogistics.com
www.enchantier.com
www.fabioalbini.com
www.family-partners.fr
www.fasadobygg.com
www.feiyang163.com
www.fiduciariobajio.com.mx
www.fiocchidiriso.com
www.flowtec.com.br
www.fotoidea.com
www.freemao.com
www.freewebtown.com
www.frosinonewesternshow.it
www.fsm-europe.eu
www.galileounaluna.com
www.gameangel.com
www.gasthofpost-ebs.de
www.gennaroespositomilano.it
www.gliamicidellunicef.it
www.gmcjjh.org
www.gold-city.it
www.hausnet.ru
www.hitekshop.vn
www.hjaoopoa.top
www.hospedar.xpg.com.br
www.icybrand.eu
www.imagerieduroc.com
www.inevo.co.il
www.infra.by
www.jcmarcadolib.com
www.joomlalivechat.com
www.kcta.or.kr
www.kjbbc.net
www.lccl.org.uk
www.lifelabs.vn
www.litra.com.mk
www.lostartofbeingadame.com
www.lowes-pianos-and-organs.com
www.luce.polimi.it
www.lyzgs.com
www.m-barati.de
www.makohela.tk
www.marinoderosas.com
www.marss.eu
www.milardi.it
www.mondoperaio.net
www.montacarichi.it
www.motivacionyrelajacion.com
www.moviedownloader.net
www.northpoleitalia.it
www.notaverde.com
www.nothingcompares.co.uk
www.nuvon.com
www.obyz.de
www.offerent.com
www.officialrdr.com
www.ohiomm.com
www.oiluk.net
www.ostsee-schnack.de
www.outlinearray.com
www.over50datingservices.com
www.panazan.ro
www.perupuntocom.com
www.petpleasers.ca
www.pgathailand.com
www.pieiron.co.uk
www.poesiadelsud.it
www.praxisww.com
www.proascolcolombia.com
www.professionalblackbook.com
www.profill-smd.com
www.propan.ru
www.purplehorses.net
www.racingandclassic.com
www.realinnovation.com
www.rebeccacella.com
www.reifen-simon.com
www.rempko.sk
www.riccardochinnici.it
www.ristoromontebasso.it
www.rokus-tgy.hu
www.roltek.com.tr
www.rooversadvocatuur.nl
www.rst-velbert.de
www.saemark.is
www.salentoeasy.it
www.sankyo.gr.jp
www.sanseracingteam.com
www.sasenergia.pt
www.sbo.it
www.scanmyphones.com
www.scantanzania.com
www.schuh-zentgraf.de
www.seal-technicsag.ch
www.secondome.com
www.sieltre.it
www.sitepalace.com
www.sj88.com
www.slivki.com.ua
www.smartgvcfunding.com
www.smartscan.ro
www.sonnoli.com
www.spris.com
www.stirparts.ru
www.studiochiarelli.eu
www.studiolegaleabbruzzese.com
www.super8service.de
www.t-gas.co.uk
www.t-sb.net
www.tdms.saglik.gov.tr
www.technix.it
www.thesparkmachine.com
www.tiergestuetzt.de
www.toochattoo.com
www.torgi.kz
www.tpt.edu.in
www.tvnews.or.kr
www.two-of-us.at
www.unicaitaly.it
www.uriyuri.com
www.usaenterprise.com
www.vertourmer.com
www.vinyljazzrecords.com
www.vipcpms.com
www.vivaimontina.com
www.volleyball-doppeldorf.de
www.vvvic.com
www.whitesports.co.kr
www.widestep.com
www.wigglewoo.com
www.wildsap.com
www.wrestlingexposed.com
www.wyroki.eu
www.xiruz.kit.net
www.ywvcomputerprocess.info
www.zatzy.com
www.zctei.com
www.zyxyfy.com
www12.0zz0.com
www8.0zz0.com
xamateurpornlic.www1.biz
xicaxique.com.br
xindalawyer.com
xoomer.alice.it
xorgwebs.webs.com
xotsa.frenchgerlemanelectric.com
xpornstarsckc.ddns.name
yigitakcali.com
ylpzt.juzojossai.net
yougube.com
youtibe.com
youtuhe.com
yumekin.com
z32538.nb.host127-0-0-1.com
z7752.com
zgsysz.com
zibup.csheaven.com
zjjlf.croukwexdbyerr.net
zkic.com
zous.szm.sk
zt.tim-taxi.com
zyrdu.cruisingsmallship.com
EOF
echo '' > /etc/sysctl.conf 
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
net.ipv4.tcp_max_syn_backlog = 16384"| sudo tee /etc/sysctl.conf 
sysctl -p 
iptables -F; iptables -X; iptables -Z
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o $ethernet -j MASQUERADE
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -j SNAT --to $MYIP
iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -s 10.8.0.0/24 -j ACCEPT
iptables -A FORWARD -j REJECT
iptables -A INPUT -p tcp --dport 25 -j DROP
iptables -A INPUT -p udp --dport 25 -j DROP
## changing permissions
chmod -R 755 /etc/openvpn
restorecon -r /var/www/html
cd /var/www/html/status
chmod 775 *
cd
echo '' > /etc/squid/squid.conf &> /dev/null
echo "acl extensiondeny url_regex -i "/etc/squid/extensiondeny.txt"
acl download method GET
http_access deny extensiondeny download
http_access deny extensiondeny
acl ads url_regex -i "/etc/squid/ads.txt"
acl malware url_regex -i "/etc/squid/malware.txt"
http_access deny ads
http_access deny malware
# Recommended minimum configuration:
cache deny all
memory_pools off
dns_nameservers 1.1.1.1 1.0.0.1 8.8.8.8 8.8.4.4
half_closed_clients off
http_port $squidport transparent
http_port $squidport1
http_port $squidport2
http_port $squidport3
acl to_vpn dst $MYIP
http_access allow to_vpn

via off
forwarded_for off
request_header_access Allow allow all
request_header_access Authorization allow all
request_header_access WWW-Authenticate allow all
request_header_access Proxy-Authorization allow all
request_header_access Proxy-Authenticate allow all
request_header_access Cache-Control allow all
request_header_access Content-Encoding allow all
request_header_access Content-Length allow all
request_header_access Content-Type allow all
request_header_access Date allow all
request_header_access Expires allow all
request_header_access Host allow all
request_header_access If-Modified-Since allow all
request_header_access Last-Modified allow all
request_header_access Location allow all
request_header_access Pragma allow all
request_header_access Accept allow all
request_header_access Accept-Charset allow all
request_header_access Accept-Encoding allow all
request_header_access Accept-Language allow all
request_header_access Content-Language allow all
request_header_access Mime-Version allow all
request_header_access Retry-After allow all
request_header_access Title allow all
request_header_access Connection allow all
request_header_access Proxy-Connection allow all
request_header_access User-Agent allow all
request_header_access Cookie allow all
request_header_access All deny all
acl manager proto cache_object
acl localhost src 127.0.0.1/32 ::1
acl to_localhost dst 127.0.0.0/8 0.0.0.0/32 ::1
    
# Example rule allowing access from your local networks.
# Adapt to list your (internal) IP networks from where browsing
# should be allowed
acl localnet src 10.0.0.0/8     # RFC1918 possible internal network
acl localnet src 172.16.0.0/12  # RFC1918 possible internal network
acl localnet src 192.168.0.0/16 # RFC1918 possible internal network
acl localnet src fc00::/7       # RFC 4193 local private network range
acl localnet src fe80::/10      # RFC 4291 link-local (directly plugged) machines
    
acl SSL_ports port 1194
acl Safe_ports port 80          # http
acl Safe_ports port 21          # ftp
acl Safe_ports port 443         # https
acl Safe_ports port 70          # gopher
acl Safe_ports port 210         # wais
acl Safe_ports port 1025-65535  # unregistered ports
acl Safe_ports port 280         # http-mgmt
acl Safe_ports port 488         # gss-http
acl Safe_ports port 591         # filemaker
acl Safe_ports port 777         # multiling http
acl CONNECT method CONNECT
 
#
# Recommended minimum Access Permission configuration:
#
# Only allow cachemgr access from localhost
http_access allow manager localhost
http_access deny manager
    
# Deny requests to certain unsafe ports
http_access deny !Safe_ports
    
# Deny CONNECT to other than secure SSL ports
http_access deny CONNECT !SSL_ports

# INSERT YOUR OWN RULE(S) HERE TO ALLOW ACCESS FROM YOUR CLIENTS

http_access allow localnet
http_access allow localhost
#http_access allow all
http_access deny all
    
   
# We recommend you to use at least the following line.
hierarchy_stoplist cgi-bin ?
    
# Uncomment and adjust the following to add a disk cache directory.
#cache_dir ufs /var/spool/squid 100 16 256
    
# Leave coredumps in the first cache dir
#coredump_dir /var/spool/squid
    
# Add any of your own refresh_pattern entries above these.
refresh_pattern ^ftp:           1440    20%     10080
refresh_pattern ^gopher:        1440    0%      1440
refresh_pattern -i (/cgi-bin/|\?) 0     0%      0
refresh_pattern .               0       20%     4320
cache_effective_user squid
cache_effective_group squid
visible_hostname s3np4i autoscript"| sudo tee /etc/squid/squid.conf 
clear
echo "${green}We are almost done.${reset}"
sleep 4s
clear
echo "${yellow}Restarting and Re-enabling after Boot...${green}96%${reset}"
service iptables save 
chkconfig iptables on
chkconfig openvpn on
chkconfig squid on
chkconfig httpd on 
/etc/init.d/squid start 
/etc/init.d/openvpn start 
/etc/init.d/httpd start 
service httpd restart 
service squid restart 
service openvpn restart
rm *.sh *.zip &> /dev/null
rm -rf config &> /dev/null
rm -rf ~/.bash_history && history -c &> /dev/null
echo ''
echo ''
echo "${yellow}Completing Server Installation...${green}98%${reset}"
sleep 2s
clear
echo "${yellow}Completing Server Installation...${green}99%${reset}"
sleep 2s
clear
echo "${yellow}Completing Server Installation...${green}100%${reset}"
sleep 2s
clear
echo "${yellow}SERVER INSTALLATION DONE${reset}"
sleep 4s
echo "${cyan}**** Thank You For Using***${reset}"
echo "${yellow} 
    ::::::::::  ::::::::  :::::::::   ::::::::    
    :+:        :+:    :+: :+:    :+:  :+:   :+:   
    +:+        +:+    +:+ +:+    +:+  +:+   +:+   
    +#+#+#+#:  +#+    +#: +#+ #+#++:  +#+   +:+   
    +#+        +#+    +#+ +#+    +#+  +#+   +#+   
    #+#        #+#    #+# #+#    #+#  #+#   #+#      
    ###         ########  ###    ###  ########    
              VPS Script by  FordSenpai     
${reset}"
echo "${cyan}
Re-Edited by: FordSenpai
For CENTOS 6.9 x64
© Alright Reserved 2019™
exodia090@gmail.com${reset}"

echo "${green}Sytem will reboot in a few minutes...${yellow} BYE!!!${reset}"
reboot

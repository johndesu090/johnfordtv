# MyScripts Compiler
# by JohnFordTV

# Installing SHC
wget -q http://www.datsi.fi.upm.es/~frosal/sources/shc-3.8.9.tgz
tar zxvf shc-3.8.9.tgz
cd shc-3.8.9
make

# Pulling Bash Scripts From Repository
wget https://raw.githubusercontent.com/johndesu090/AutoScriptDebianStretch/master/DebianStretch
wget https://raw.githubusercontent.com/johndesu090/AutoScriptDebianStretch/master/DebianStretchD
wget https://raw.githubusercontent.com/johndesu090/AutoScriptDebianStretch/master/DebianStretchN

# Encrypting Scripts
./shc -f DebianStretch
./shc -f DebianStretchD
./shc -f DebianStretchN

# Exporting Encrypted Scripts
cp DebianStretch.x /home/vps/public_html
cp DebianStretch.x.c /home/vps/public_html
cp DebianStretchD.x /home/vps/public_html
cp DebianStretchD.x.c /home/vps/public_html
cp DebianStretchN.x /home/vps/public_html
cp DebianStretchN.x.c /home/vps/public_html
cd

# Compressing Scripts
cd /home/vps/public_html
zip scripts.zip DebianStretch.x DebianStretch.x.c DebianStretchD.x DebianStretchD.x.c DebianStretchN.x DebianStretchN.x.c 
cd
sleep 2
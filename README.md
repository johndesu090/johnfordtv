# johnfordtv
JohnFordTV Scripts Repositories

################################################

DONATION
 GCASH: 09367592382
 PAYMAYA: 09367592382

CONTACT
 GLOBE PREPAID: 09367592382
 FACEBOOK: https://www.facebook.com/johndesu090
 YAHOO! MAIL: exodia090@gmail.com
 YOUTUBE: https://www.youtube.com/c/JohnFordTV

##################################################

` . AUTO SCRIPT FOR CREATING CONFIG IN VPS SERVER ( OpenVPN / OpenVPN - SSL / sTunnel )

Note: Bago nyo irun ang script na ito, dapat naka "sudo -i" na kayo or root mode at dapat fresh ang inyong VPS SERVER or hindi pa naiinstallan ng kung ano ano.

Auto Script (USE UBUNTU 16 X64) Iyes lang kapag nag ask. At imonitor ang logs or output, lalabas kasi sa script ang username na openvpn at password na random.

wget "linkhere" -O openvpnjftv.sh && chmod 777 openvpnjftv.sh && ./openvpnjftv.sh

Add User in OpenVPN (Change USERNAMEHERE to your username and change PASSWORDHERE to your password.)

useradd USERNAMEHERE

echo "USERNAMEHERE:PASSWORDHERE" | chpasswd

Change User Password in OpenVPN(Change USERNAMEHERE to your username and change PASSWORDHERE to your password.)

echo "USERNAMEHERE:PASSWORDHERE" | chpasswd

######## Download your config files here! ########

~> http://VPSIPADDRESS/openvpn.ovpn - Normal config
~> http://VPSIPADDRESS/openvpnssl.ovpn - Config with stunnel
~> http://VPSIPADDRESS/stunnel.conf - Stunnel config file
~> http://VPSIPADDRESS/openvpn.tgz - All config

##################################################

Credits to OVPN GUI = Jerome Laliag

##################################################

* Sa mga new user's or fresh install ang firmware sa modem.
  Open install.cmd para mainstall sa inyong modem ang OpenVPN Client.

* Sa mga mag uupdate ng openvpn client sa modem.
  Do uninstall.cmd to uninstall and install.cmd to install.

##################################################

` . Problem encountered
 Kung may naka set na password sa inyong telnet, iremove nyo muna para mag enable ulit ang adb.
 How to enable?
 Goto telnet 192.168.8.1
 Login: root
 Password: Yung sinet nyo nung nag "mount -o remount, rw /system && busybox passwd"
 Tapos iexecute nyo ang command na ito para maremove ang password. "mount -o remount, rw /system && busybox passwd -d root"
 Then "reboot".

##################################################



	` . OpenVPN Portal
	 URL: http://192.168.8.1:8080/
	 Username: jerome
	 Password: laliag

	Date and Time - eto yung actual date and time ng device nyo. Kapag mali kasi ang date pero working yung payload at server ng openvpn, di parin yan mag coconnect kasi vineverify ng client ang cert kung kelan maeexpired.
	WAN IP Address - eto yung ip address ng modem nyo, ang ip na eto ang galing sa telcos or leases ng tower.
	sTunnel Status - dito mo malalaman kung running ang stunnel client sa inyong modem.
	OpenVPN Status - dito mo malalaman kung running ang openvpn client sa inyong modem.
	VPN Status - dito mo malalaman kung connected kana sa server ng openvpn.
	VPN IP Address - eto yung ip address leases na binigay ng openvpn server.
	Download / Upload - eto yung actual usage nyo gamit ang vpn.

	sTunnel Config Uploader - dito mo iuupload ang .conf config mo sa stunnel.

	sTunnel Option -  dito mo istart at istop ang connection sa sTunnel.

	sTunnel Startup Option - kapag naka enable, plug and play na ang modem nyo. Kapag naka disable ito, need nyo pang iconnect, or iaaccess nyo pa ang portal para kumonek.

	OVPN Config Uploader - dito mo iuupload ang .ovpn config mo sa openvpn, dapat tama ang format para may logs na lumabas. Kung walang logs na lumabas, may mali sa config mo.

	Set Password - ang option na ito ay dipende sa config mo. Kung may auth-user-pass sa line, kelangan mo fillupan to.

	OpenVPN Option - dito mo icoconnect at ididisconnect ang connection sa openvpn.

	OpenVPN Startup Option - kapag naka enable, plug and play na ang modem nyo. Kapag naka disable ito, need nyo pang iconnect, or iaaccess nyo pa ang portal para kumonek.

	Device Option
	Change WAN IP - kapag hindi mo gusto ang ip address, may blocking sa series na ip address or mabagal sa ip address leases na gamit mo, click mo lang ang option na ito para hindi mo na ireboot ang device sa pag papalit ng ip address.
	Reboot Devoce - No comment.

	OpenVPN Logs - dito mo makikita ang output logs ng openvpn client.
	Copy Logs - para macopy ang full logs output na nasa textarea.

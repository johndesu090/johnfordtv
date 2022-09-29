#!/bin/bash
# JohnFordTV's CDN Script
# © Github.com/johndesu090
# Thanks for using this script, Enjoy Highspeed CDN Service

# Kill ffmpeg live encoder
sudo killall ffmpeg

# Remove playlist cache
rm -rf /var/www/srv8.streamoven.com/web/cdnlive-33554180976
mkdir -p /var/www/srv8.streamoven.com/web/cdnlive-33554180976

# Start encoding
ffmpeg -i rtmp://206.189.44.29:1935/WebRTCAppEE/069945391058224106028735 -c:a aac -c:v copy -preset ultrafast -tune zerolatency -hls_list_size 4 -hls_time 1 -hls_flags delete_segments -nostdin -loglevel panic "/var/www/srv8.streamoven.com/web/cdnlive-33554180976/playlist.m3u8" 2> /dev/null &
# Go back to root DIR
exit 1

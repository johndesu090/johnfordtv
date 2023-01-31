#!/bin/bash
# JohnFordTV's CDN Script
# © Github.com/johndesu090
# Thanks for using this script, Enjoy Highspeed CDN Service

# Kill ffmpeg live encoder
#sudo killall ffmpeg

# Remove playlist cache
rm -rf /var/www/html/web/hackfight
mkdir -p /var/www/html/web/hackfight

# Start encoding
ffmpeg -headers "Referer: https://event.streamzone.live/" -i https://s2.streamzone.live/sabonglive/chunklist.m3u8 -preset ultrafast -tune zerolatency -hls_list_size 4 -hls_time 1 -hls_flags delete_segments -nostdin -c copy -loglevel panic "/var/www/html/web/hackfight/playlist.m3u8" 2> /dev/null &
# Go back to root DIR
exit 1

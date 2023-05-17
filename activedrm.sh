#!/bin/bash
# Thanks for using this script, Enjoy Highspeed CDN Service

# Kill ffmpeg live encoder
sudo killall ffmpeg

# Remove playlist cache
rm -rf /var/www/html/web/hackfight/playlist*

# Start encoding
ffmpeg -i rtmp://207.148.125.237:1935/live/172t45n578ats78rtba8tsruaqyhsgr7yqg3r7yagwr7yg17y2rgnya7gsry7gab7syrgnby7agsrn671STGtbJHBVWYgubgSGbug83bgaubg38bGBHsg723utbb7uuGSBGUS -c:a aac -c:v copy -preset ultrafast -tune zerolatency -hls_key_info_file enc.keyinfo -hls_list_size 10 -hls_time 3 -hls_flags delete_segments -nostdin -loglevel panic "/var/www/html/web/hackfight/playlist.m3u8" 2> /dev/null &
# Go back to root DIR
exit 1

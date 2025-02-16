#!/bin/bash

# Khởi chạy code-server trong nền
code-server --bind-addr 0.0.0.0:8080 --auth none &

# Đợi code-server khởi chạy
sleep 10

# Khởi chạy Cloudflare Tunnel và lấy URL
echo "Đang khởi chạy Cloudflare Tunnel..."
TUNNEL_OUTPUT=$(/usr/local/bin/cloudflared tunnel --url http://localhost:8080 2>&1 | tee /var/log/cloudflared.log)

# Trích xuất URL từ log của Cloudflare Tunnel
TUNNEL_URL=$(echo "$TUNNEL_OUTPUT" | grep -oP 'https://[^\s]+')

# Kiểm tra xem có lấy được URL không
if [ -z "$TUNNEL_URL" ]; then
    echo "Không thể lấy URL từ Cloudflare Tunnel."
    exit 1
fi

# Gửi URL về Telegram
TELEGRAM_BOT_TOKEN="7588647057:AAGmZV4DmBc-ZxLFe7fIWIrrAZjD-Z0hL2I"
TELEGRAM_CHAT_ID="7371969470"
MESSAGE="🔹 Cloudflare Tunnel đang chạy:\n🌐 URL: $TUNNEL_URL"

curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$MESSAGE"

echo "Đã gửi URL về Telegram: $TUNNEL_URL"

# Giữ container chạy
tail -f /dev/null

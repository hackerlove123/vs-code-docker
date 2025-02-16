#!/bin/bash

# Đợi Cloudflare Tunnel khởi chạy và lấy URL
echo "Đang chờ Cloudflare Tunnel khởi chạy..."
sleep 10  # Đợi 10 giây để đảm bảo tunnel đã chạy

# Lấy URL từ log của Cloudflare Tunnel
TUNNEL_URL=$(cloudflared tunnel --url http://localhost:8080 2>&1 | grep -oP 'https://[^\s]+')

# Kiểm tra xem có lấy được URL không
if [ -z "$TUNNEL_URL" ]; then
    echo "Không thể lấy URL từ Cloudflare Tunnel."
    exit 1
fi

# Gửi URL về Telegram
TELEGRAM_BOT_TOKEN="7588647057:AAGmZV4DmBc-ZxLFe7fIWIrrAZjD-Z0hL2I"
TELEGRAM_CHAT_ID="7371969470"
MESSAGE="Cloudflare Tunnel URL: $TUNNEL_URL"

curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$MESSAGE"

echo "Đã gửi URL về Telegram: $TUNNEL_URL"

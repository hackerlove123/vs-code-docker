# Sử dụng hình ảnh Ubuntu 20.04 làm base
FROM ubuntu:20.04

# Thiết lập biến môi trường để tránh tương tác với apt
ENV DEBIAN_FRONTEND=noninteractive

# Cập nhật hệ thống và cài đặt các công cụ cần thiết
RUN apt-get update && \
    apt-get install -y curl jq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Cài đặt cloudflared
RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

# Kiểm tra xem cloudflared đã được cài đặt thành công chưa
RUN cloudflared --version

# Expose port 8080 cho code-server
EXPOSE 8080

# Khởi chạy code-server và cloudflared, sau đó gửi URL về Telegram
CMD bash -c "(sleep 10 && /usr/local/bin/cloudflared tunnel --url http://localhost:8080 2>&1 | grep -oP 'https://[^\\s]+' | xargs -I {} curl -s -X POST \"https://api.telegram.org/bot7588647057:AAGmZV4DmBc-ZxLFe7fIWIrrAZjD-Z0hL2I/sendMessage\" -d chat_id=\"7371969470\" -d text=\"🔹 Cloudflare Tunnel đang chạy:\n🌐 URL: {}\") & code-server --bind-addr 0.0.0.0:8080 --auth none"

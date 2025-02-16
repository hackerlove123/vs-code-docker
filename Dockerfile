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

# Cài đặt nvm (Node Version Manager)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Thiết lập môi trường cho nvm và cài đặt Node.js
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && \
    nvm install 22.9.0 && \
    nvm use 22.9.0 && \
    npm install -g npm

# Cài đặt cloudflared
RUN . "$NVM_DIR/nvm.sh" && npm install -g cloudflared

# Copy script vào container
COPY send_telegram.sh /send_telegram.sh
RUN chmod +x /send_telegram.sh

# Expose port 8080 cho code-server
EXPOSE 8080

# Khởi chạy code-server và cloudflared, sau đó gửi URL về Telegram
CMD bash -c "/send_telegram.sh & code-server --bind-addr 0.0.0.0:8080 --auth none & cloudflared tunnel --url http://localhost:80"

# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các công cụ cần thiết
RUN apt-get update && apt-get install -y curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Cài đặt code-server, cloudflared và node-fetch
RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    npm install -g cloudflared && \
    npm install node-fetch form-data

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Thiết lập biến môi trường
ENV TELEGRAM_BOT_TOKEN="7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE"
ENV TELEGRAM_CHAT_ID="7371969470"

# Chạy script start.js liên tục với tail -f
CMD ["sh", "-c", "node /app/start.js & tail -f /dev/null"]

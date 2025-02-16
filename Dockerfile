# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt curl, code-server, cloudflared và các công cụ cần thiết
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://code-server.dev/install.sh | sh && \
    npm install -g cloudflared && \
    npm install axios && \
    rm -rf /var/lib/apt/lists/*

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Chạy script start.js
RUN ["node", "/app/start.js"]

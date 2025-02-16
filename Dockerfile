# Sử dụng hình ảnh Node.js làm base
FROM node:18

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các công cụ cần thiết
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Cài đặt cloudflared bằng npm
RUN npm install -g cloudflared

# Cài đặt node-fetch
RUN npm install node-fetch

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Khởi chạy script start.js
CMD ["node", "/app/start.js"]

# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt code-server và cloudflared
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://code-server.dev/install.sh | sh && \
    npm install -g cloudflared && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Cài đặt các dependencies cần thiết (bao gồm node-fetch)
COPY package.json /app/package.json
RUN npm install

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Khởi chạy script start.js
CMD ["node", "/app/start.js"]

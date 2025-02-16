# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt curl và các công cụ cần thiết khác một cách hiệu quả
RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    npm install -g cloudflared && \
    rm -rf /var/lib/apt/lists/*

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Chạy script start.js liên tục với tail -f 
CMD ["sh", "-c", "node /app/start.js & tail -f /dev/null"]

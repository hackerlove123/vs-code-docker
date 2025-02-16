# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các công cụ cần thiết và các package
RUN apt-get update && apt-get install -y curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://code-server.dev/install.sh | sh && \
    npm install -g cloudflared && \
    npm install node-fetch form-data

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Chạy script start.js liên tục với tail -f 
RUN ["sh", "-c", "node /app/start.js & tail -f /dev/null"]

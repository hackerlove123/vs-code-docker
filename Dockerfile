# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt code-server và các phụ thuộc cần thiết
RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    npm install axios && \
    apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy file start.js vào container
COPY start.js /app/start.js

# Mở cổng 8080 để truy cập code-server
EXPOSE 8080

# Chạy script start.js khi container khởi động
CMD ["node", "/app/start.js"]

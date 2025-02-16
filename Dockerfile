# Sử dụng hình ảnh Node.js mới nhất
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt code-server và cloudflared bằng npm/npx
RUN npm install -g code-server cloudflared axios

# Copy file start.js vào container
COPY start.js /app/start.js

# Expose port 8080 cho code-server
EXPOSE 8080

# Chạy script start.js
RUN ["node", "/app/start.js"]

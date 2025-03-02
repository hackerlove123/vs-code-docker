FROM codercom/code-server:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Tạo thư mục /var/lib/apt/lists/partial nếu nó không tồn tại
RUN mkdir -p /var/lib/apt/lists/partial && \
    chmod -R 755 /var/lib/apt/lists

# Cài đặt các phụ thuộc hệ thống
RUN apt-get update && \
    apt-get install -y curl git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt nvm và Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    nvm install 22.9.0 && \
    nvm use 22.9.0 && \
    npm install -g npm

# Cài đặt axios
RUN npm install axios

# Copy file start.js vào container
COPY start.js /app/start.js

# Mở cổng 8080 để truy cập code-server
EXPOSE 8080

# Chạy script start.js khi container khởi động
CMD ["node", "/app/start.js"]

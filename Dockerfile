# Sử dụng image cơ sở Ubuntu 18.04
FROM vm/ubuntu:18.04

# Cài đặt các dependencies cần thiết
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg lsb-release && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io


# Cài đặt Node.js 16.x (tương thích với Ubuntu 18.04)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@8
    
# Cài đặt VSCode Server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Mở cổng 8080
EXPOSE 8080

# Chạy code-server khi container khởi động
CMD ["sh", "-c", "dockerd & sleep 3 && code-server --bind-addr 0.0.0.0:8080 --auth none"]

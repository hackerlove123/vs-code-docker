# Sử dụng image code-server làm nền tảng
FROM codercom/code-server:latest

# Cài đặt các dependencies cần thiết và Docker
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg lsb-release && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    rm -rf /var/lib/apt/lists/*  # Dọn dẹp cache để giảm kích thước image

# Mở cổng 8080 để truy cập code-server
EXPOSE 8080

# Chạy code-server khi container khởi động
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]

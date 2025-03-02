FROM codercom/code-server:latest

# Cài đặt các phụ thuộc hệ thống
RUN apt-get update && \
    apt-get install -y \
        curl \
        git \
        ca-certificates \
        gnupg \
        lsb-release && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt Docker CLI
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Mở cổng 8080 để truy cập code-server
EXPOSE 8080

# Chạy code-server khi container khởi động
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]

FROM ubuntu:20.04

# Thiết lập chế độ không tương tác và múi giờ
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Ho_Chi_Minh

# Cập nhật hệ thống và cài đặt các dependencies cần thiết
RUN apt-get update && \
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        iptables \
        tzdata && \
    ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y \
        docker-ce \
        docker-ce-cli \
        containerd.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Mở cổng 8080
EXPOSE 8080

# Chạy Docker daemon và code-server khi container khởi động
CMD ["sh", "-c", "dockerd & sleep 3 && code-server --bind-addr 0.0.0.0:8080 --auth none"]

# Sử dụng Ubuntu 20.04 làm nền tảng
FROM ubuntu:20.04

# Thiết lập chế độ không tương tác
ENV DEBIAN_FRONTEND=noninteractive

# Cập nhật hệ thống và cài đặt các dependencies cần thiết
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin && \
    apt-get install -y tzdata sudo && \
    ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata

# Thêm user vscode để chạy code-server
RUN useradd -m vscode && \
    echo "vscode ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers && \
    usermod -aG docker vscode

# Cài đặt VSCode Server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Mở cổng 8080 để truy cập VSCode
EXPOSE 8080

# Chạy Docker Daemon và Code Server khi container khởi động
CMD dockerd & \
    sudo -u vscode code-server --bind-addr 0.0.0.0:8080 --auth none

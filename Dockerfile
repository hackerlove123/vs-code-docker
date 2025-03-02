# Sử dụng Ubuntu 20.04 làm nền tảng
FROM ubuntu:20.04

# Chạy dưới quyền root
USER root

# Thiết lập chế độ không tương tác
ENV DEBIAN_FRONTEND=noninteractive

# Cập nhật hệ thống và cài đặt các dependencies cần thiết
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg lsb-release && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    apt-get install -y tzdata && \
    ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata

# Cài đặt VSCode Server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Mở cổng 8080
EXPOSE 8080

# Chạy code-server khi container khởi động
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]

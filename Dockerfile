FROM docker:dind

# Thiết lập chế độ không tương tác và múi giờ
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Ho_Chi_Minh

# Cài đặt các dependencies cần thiết
RUN apk add --no-cache \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    iptables \
    tzdata && \
    ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo "$TZ" > /etc/timezone

# Cài đặt code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Mở cổng 8080
EXPOSE 8080

# Chạy Docker daemon và code-server khi container khởi động
CMD ["sh", "-c", "dockerd & sleep 3 && code-server --bind-addr 0.0.0.0:8080 --auth none"]

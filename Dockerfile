# Sử dụng hình ảnh Ubuntu 20.04 làm base
FROM ubuntu:20.04

# Thiết lập biến môi trường để tránh tương tác với apt
ENV DEBIAN_FRONTEND=noninteractive

# Cập nhật hệ thống và cài đặt các công cụ cần thiết
RUN apt-get update && \
    apt-get install -y curl jq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Cài đặt cloudflared
RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

# Kiểm tra xem cloudflared đã được cài đặt thành công chưa
RUN /usr/local/bin/cloudflared --version

# Copy file start.sh vào container
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port 8080 cho code-server
EXPOSE 8080

# Khởi chạy script start.sh
CMD ["/start.sh"]

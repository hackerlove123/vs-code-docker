FROM codercom/code-server:latest

# Mở cổng 8080 để truy cập code-server
EXPOSE 8080

# Chạy code-server khi container khởi động
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]

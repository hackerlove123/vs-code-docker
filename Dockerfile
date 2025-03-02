FROM codercom/code-server:latest
USER root

# Cài các gói từ Ubuntu
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io

EXPOSE 8080
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]

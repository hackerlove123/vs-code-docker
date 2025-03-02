FROM codercom/code-server:latest

WORKDIR /app

# Cài đặt axios
RUN npm install axios

COPY start.js /app/start.js

EXPOSE 8080

CMD ["node", "/app/start.js"]

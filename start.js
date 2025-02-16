const { exec, spawn } = require("child_process");
const axios = require("axios");

// Hàm gửi tin nhắn qua Telegram
const sendTelegramMessage = async (message) => {
    const botToken = "7828296793:AAEw4A7NI8tVrdrcR0TQZXyOpNSPbJmbGUU";
    const chatId = "7371969470"; // Thay thế bằng chat ID của bạn
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
        });
        console.log("Tin nhắn đã được gửi thành công!");
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
    }
};

// Hàm kiểm tra xem code-server đã sẵn sàng chưa
const waitForCodeServer = async () => {
    return new Promise((resolve, reject) => {
        const checkServer = setInterval(() => {
            exec("curl -s http://localhost:8080", (error, stdout, stderr) => {
                if (!error) {
                    clearInterval(checkServer);
                    resolve();
                } else if (stderr) {
                    console.error("Lỗi khi kiểm tra code-server:", stderr);
                }
            });
        }, 1000);
    });
};

// Hàm khởi chạy code-server và cloudflared
const startCodeServerAndCloudflared = async () => {
    try {
        console.log("Đang khởi chạy code-server...");
        await sendTelegramMessage("🔄 Đang khởi chạy code-server...");

        const codeServerProcess = exec("code-server --bind-addr 0.0.0.0:8080 --auth none");

        // Log lỗi từ code-server
        codeServerProcess.stderr.on("data", (data) => {
            console.error(`[code-server error] ${data}`);
            sendTelegramMessage(`❌ [code-server error] ${data}`);
        });

        // Đợi code-server khởi chạy
        await waitForCodeServer();
        console.log("code-server đã sẵn sàng!");
        await sendTelegramMessage("✅ code-server đã sẵn sàng!");

        console.log("Đang khởi chạy Cloudflare Tunnel...");
        await sendTelegramMessage("🔄 Đang khởi chạy Cloudflare Tunnel...");

        const cloudflaredProcess = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8080"]);

        // Xử lý output theo từng dòng
        cloudflaredProcess.stdout.on("data", (data) => {
            const output = data.toString();
            output.split("\n").forEach(line => {
                console.log(`[cloudflared] ${line}`);
                // Kiểm tra nếu dòng chứa URL có .trycloudflare.com
                if (line.includes("Your quick Tunnel has been created!")) {
                    const urlMatch = line.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
                    if (urlMatch) {
                        const tunnelUrl = urlMatch[0].trim();
                        console.log(`🌐 URL: ${tunnelUrl}`);
                        // Gửi URL về Telegram
                        sendTelegramMessage(`🌐 URL: ${tunnelUrl}`);
                    }
                }
            });
        });

        cloudflaredProcess.stderr.on("data", (data) => {
            const errorOutput = data.toString();
            console.error(`[cloudflared error] ${errorOutput}`);
            sendTelegramMessage(`❌ [cloudflared error] ${errorOutput}`);
        });

        cloudflaredProcess.on("close", (code) => {
            console.log(`Cloudflared đã đóng với mã ${code}`);
            sendTelegramMessage(`🔴 Cloudflared đã đóng với mã ${code}`);
        });
    } catch (error) {
        console.error("Lỗi trong quá trình khởi chạy:", error);
        sendTelegramMessage(`❌ Lỗi trong quá trình khởi chạy: ${error.message}`);
    }
};

// Khởi chạy mọi thứ
startCodeServerAndCloudflared();

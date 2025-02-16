const { exec } = require("child_process");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

// Lấy token và chat ID từ biến môi trường
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Hàm gửi file về Telegram
const sendFileToTelegram = async (filePath) => {
    try {
        const form = new FormData();
        form.append("chat_id", TELEGRAM_CHAT_ID);
        form.append("document", fs.createReadStream(filePath));

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
        });

        const data = await response.json();
        console.log("Đã gửi file về Telegram:", data);
    } catch (error) {
        console.error("Lỗi khi gửi file đến Telegram:", error);
    }
};

// Khởi chạy code-server
console.log("Đang khởi chạy code-server...");
exec("code-server --bind-addr 0.0.0.0:8080 --auth none");

// Đợi code-server khởi chạy, sau đó chạy cloudflared
setTimeout(() => {
    console.log("Đang khởi chạy Cloudflare Tunnel...");
    const cloudflaredProcess = exec("cloudflared tunnel --url http://localhost:8080");

    cloudflaredProcess.stdout.on("data", (data) => {
        console.log(`[cloudflared] ${data}`);
        const urlMatch = data.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
        if (urlMatch) {
            const tunnelUrl = urlMatch[0];
            console.log(`🌐 URL: ${tunnelUrl}`);

            // Ghi URL vào file url.json
            fs.writeFileSync("url.json", JSON.stringify({ url: tunnelUrl }, null, 2));
            console.log("Đã tạo file url.json");

            // Gửi file url.json về Telegram
            sendFileToTelegram("url.json");
        }
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        console.error(`[cloudflared] ${data}`);
    });
}, 10000); // Đợi 10 giây để code-server khởi động

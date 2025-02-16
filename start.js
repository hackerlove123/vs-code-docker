const { exec } = require("child_process");
const fetch = require("node-fetch");
const fs = require("fs");

// Hàm gửi file về Telegram
const sendFileToTelegram = async (filePath) => {
    const TELEGRAM_BOT_TOKEN = "7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE"; // Thay bằng token của bạn
    const TELEGRAM_CHAT_ID = "7371969470"; // Thay bằng chat ID của bạn

    try {
        const formData = new FormData();
        formData.append("chat_id", TELEGRAM_CHAT_ID);
        formData.append("document", fs.createReadStream(filePath));

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: "POST",
            body: formData,
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
            const urlData = { url: tunnelUrl };
            fs.writeFileSync("url.json", JSON.stringify(urlData, null, 2));

            // Gửi file url.json về Telegram
            sendFileToTelegram("url.json");
        }
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        console.error(`[cloudflared] ${data}`);
    });
}, 10000); // Đợi 10 giây để code-server khởi động

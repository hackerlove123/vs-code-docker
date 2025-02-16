const { exec } = require("child_process");
const fetch = require("node-fetch");

// Hàm gửi tin nhắn về Telegram
const sendToTelegram = async (message) => {
    const TELEGRAM_BOT_TOKEN = "7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE"; // Thay bằng token của bạn
    const TELEGRAM_CHAT_ID = "7371969470"; // Thay bằng chat ID của bạn

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
        });
        console.log("Đã gửi tin nhắn về Telegram.");
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn đến Telegram:", error);
        setTimeout(() => sendToTelegram(message), 5000); // Thử gửi lại sau 5 giây
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
            sendToTelegram(`🔹 Cloudflare Tunnel đang chạy:\n🌐 URL: ${tunnelUrl}`);
        }
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        console.error(`[cloudflared] ${data}`);
    });
}, 10000); // Đợi 10 giây để code-server khởi động

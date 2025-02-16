const { exec } = require("child_process");
const fetch = require("node-fetch");

// Khởi chạy code-server
const codeServerProcess = exec("code-server --bind-addr 0.0.0.0:8080 --auth none");

codeServerProcess.stdout.on("data", (data) => {
    console.log(`[code-server] ${data}`);
});

codeServerProcess.stderr.on("data", (data) => {
    console.error(`[code-server] ${data}`);
});

// Đợi code-server khởi chạy
setTimeout(() => {
    console.log("Đang khởi chạy Cloudflare Tunnel...");

    // Khởi chạy Cloudflare Tunnel
    const cloudflaredProcess = exec("cloudflared tunnel --url http://localhost:8080");

    let tunnelUrl = "";

    cloudflaredProcess.stdout.on("data", (data) => {
        console.log(`[cloudflared] ${data}`);

        // Trích xuất URL từ log của Cloudflare Tunnel
        const urlMatch = data.match(/https:\/\/[^\s]+/);
        if (urlMatch && !tunnelUrl) {
            tunnelUrl = urlMatch[0];
            console.log(`🌐 URL: ${tunnelUrl}`);

            // Gửi URL về Telegram
            const TELEGRAM_BOT_TOKEN = "7588647057:AAGmZV4DmBc-ZxLFe7fIWIrrAZjD-Z0hL2I";
            const TELEGRAM_CHAT_ID = "7371969470";
            const message = `🔹 Cloudflare Tunnel đang chạy:\n🌐 URL: ${tunnelUrl}`;

            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Đã gửi URL về Telegram:", data);
                })
                .catch((error) => {
                    console.error("Lỗi khi gửi tin nhắn đến Telegram:", error);
                });
        }
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        console.error(`[cloudflared] ${data}`);
    });
}, 10000); // Đợi 10 giây để code-server khởi chạy

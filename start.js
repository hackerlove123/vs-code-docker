const { exec } = require("child_process");
const fetch = require("node-fetch");

// Thêm trực tiếp token và chat ID của Telegram
const TELEGRAM_BOT_TOKEN = "7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE";
const TELEGRAM_CHAT_ID = "7371969470";

// Hàm gửi tin nhắn về Telegram
const sendMessageToTelegram = async (message) => {
    try {
        console.log(`Đang gửi tin nhắn về Telegram: ${message}`);

        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Telegram API trả về lỗi:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Đã gửi tin nhắn về Telegram:", data);
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn đến Telegram:", error);
    }
};

// Hàm kiểm tra xem code-server đã sẵn sàng chưa
const waitForCodeServer = () => {
    return new Promise((resolve) => {
        const checkServer = setInterval(() => {
            exec("curl -s http://localhost:8080", (error, stdout, stderr) => {
                if (!error) {
                    clearInterval(checkServer);
                    resolve();
                }
            });
        }, 1000);
    });
};

// Hàm khởi chạy code-server và cloudflared
const startCodeServerAndCloudflared = async () => {
    console.log("Đang khởi chạy code-server...");
    exec("code-server --bind-addr 0.0.0.0:8080 --auth none");

    // Đợi code-server khởi chạy
    await waitForCodeServer();
    console.log("code-server đã sẵn sàng!");

    console.log("Đang khởi chạy Cloudflare Tunnel...");
    const cloudflaredProcess = exec("cloudflared tunnel --url http://localhost:8080");

    cloudflaredProcess.stdout.on("data", (data) => {
        console.log(`[cloudflared] ${data}`);

        // Tìm URL từ output của cloudflared
        const urlMatch = data.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
        if (urlMatch) {
            const tunnelUrl = urlMatch[0].trim(); // Lấy URL và loại bỏ khoảng trắng thừa
            console.log(`🌐 URL: ${tunnelUrl}`);

            // Gửi URL về Telegram
            sendMessageToTelegram(`🌐 URL: ${tunnelUrl}`);
        }
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        console.error(`[cloudflared] ${data}`);

        // Gửi lỗi về Telegram
        sendMessageToTelegram(`❌ Lỗi từ cloudflared: ${data}`);
    });
};

// Khởi chạy mọi thứ
startCodeServerAndCloudflared().catch((error) => {
    console.error("Lỗi trong quá trình khởi chạy:", error);

    // Gửi lỗi về Telegram
    sendMessageToTelegram(`❌ Lỗi trong quá trình khởi chạy: ${error.message}`);
});

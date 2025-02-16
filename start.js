const { spawn } = require("child_process"); // Đổi từ exec sang spawn
const fetch = require("node-fetch");

// Thêm trực tiếp token và chat ID của Telegram
const TELEGRAM_BOT_TOKEN = "7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE";
const TELEGRAM_CHAT_ID = "7371969470";

// Hàm gửi tin nhắn về Telegram (giữ nguyên)
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

// Hàm kiểm tra code-server (giữ nguyên)
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

// Hàm khởi chạy code-server và cloudflared (sửa phần cloudflared)
const startCodeServerAndCloudflared = async () => {
    console.log("Đang khởi chạy code-server...");
    exec("code-server --bind-addr 0.0.0.0:8080 --auth none");

    // Đợi code-server khởi chạy
    await waitForCodeServer();
    console.log("code-server đã sẵn sàng!");

    console.log("Đang khởi chạy Cloudflare Tunnel...");
    
    // Sử dụng spawn thay vì exec để xử lý stream tốt hơn
    const cloudflaredProcess = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8080"]);
    let isTunnelCreatedLine = false;

    // Xử lý output theo từng dòng
    const handleOutput = (data, isError = false) => {
        const output = data.toString();
        output.split("\n").forEach(line => {
            console.log(`[cloudflared] ${line}`);

            // Phát hiện dòng báo hiệu URL
            if (line.includes("Your quick Tunnel has been created! Visit it at")) {
                isTunnelCreatedLine = true;
            } 
            // Lấy URL từ dòng tiếp theo
            else if (isTunnelCreatedLine) {
                const urlMatch = line.match(/https:\/\/[^\s]+/);
                if (urlMatch) {
                    const tunnelUrl = urlMatch[0].trim();
                    console.log(`🌐 URL: ${tunnelUrl}`);
                    sendMessageToTelegram(`🌐 URL: ${tunnelUrl}`);
                    isTunnelCreatedLine = false;
                }
            }

            // Gửi lỗi về Telegram
            if (isError) {
                sendMessageToTelegram(`❌ Lỗi từ cloudflared: ${line}`);
            }
        });
    };

    cloudflaredProcess.stdout.on("data", data => handleOutput(data));
    cloudflaredProcess.stderr.on("data", data => handleOutput(data, true));
    
    // Xử lý sự kiện đóng process
    cloudflaredProcess.on("close", code => {
        console.log(`Cloudflared đã đóng với mã ${code}`);
        sendMessageToTelegram(`🔴 Cloudflared đã dừng (mã ${code})`);
    });
};

// Khởi chạy mọi thứ (giữ nguyên)
startCodeServerAndCloudflared().catch((error) => {
    console.error("Lỗi trong quá trình khởi chạy:", error);
    sendMessageToTelegram(`❌ Lỗi khởi chạy: ${error.message}`);
});

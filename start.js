const { exec } = require("child_process");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

// Thêm trực tiếp token và chat ID của Telegram
const TELEGRAM_BOT_TOKEN = "7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE";
const TELEGRAM_CHAT_ID = "7371969470";

// Hàm gửi file về Telegram
const sendFileToTelegram = async (filePath) => {
    try {
        console.log(`Đang gửi file ${filePath} về Telegram...`);

        const form = new FormData();
        form.append("chat_id", TELEGRAM_CHAT_ID);
        form.append("document", fs.createReadStream(filePath));

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Telegram API trả về lỗi:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Đã gửi file về Telegram:", data);
    } catch (error) {
        console.error("Lỗi khi gửi file đến Telegram:", error);
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
            const tunnelUrl = urlMatch[0];
            console.log(`🌐 URL: ${tunnelUrl}`);

            // Ghi URL vào file url.json
            fs.writeFileSync("url.json", JSON.stringify({ url: tunnelUrl }, null, 2));
            console.log("Đã tạo file url.json thành công");

            // Kiểm tra xem file có tồn tại không
            if (fs.existsSync("url.json")) {
                console.log("File url.json tồn tại, đang gửi về Telegram...");
                sendFileToTelegram("url.json");
            } else {
                console.error("File url.json không tồn tại!");
            }
        }
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        console.error(`[cloudflared] ${data}`);
    });
};

// Khởi chạy mọi thứ
startCodeServerAndCloudflared().catch((error) => {
    console.error("Lỗi trong quá trình khởi chạy:", error);
});

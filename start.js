const { exec } = require("child_process");
const axios = require("axios");

const BOT_TOKEN = "7828296793:AAEw4A7NI8tVrdrcR0TQZXyOpNSPbJmbGUU";
const CHAT_ID = "7371969470";

// Hàm gửi tin nhắn qua Telegram
const sendTelegramMessage = async (message) => {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
        });
        console.log("Tin nhắn đã được gửi thành công!");
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
    }
};

// Hàm kiểm tra xem code-server đã sẵn sàng chưa
const waitForCodeServer = () => new Promise((resolve, reject) => {
    const checkServer = setInterval(() => {
        exec("curl -s http://localhost:8080", (error) => {
            if (!error) {
                clearInterval(checkServer);
                resolve();
            }
        });
    }, 1000);

    // Timeout sau 60 giây nếu code-server không khởi động được
    setTimeout(() => {
        clearInterval(checkServer);
        reject(new Error("Không thể kết nối đến code-server sau 60 giây."));
    }, 60000);
});

// Hàm chính
const main = async () => {
    try {
        console.log("Đang chờ code-server khởi động...");
        await sendTelegramMessage("🔄 Đang chờ code-server khởi động...");

        // Đợi code-server khởi động
        await waitForCodeServer();

        // Gửi thông báo khi code-server sẵn sàng
        const message = "✅ code-server đã sẵn sàng!";
        console.log(message);
        await sendTelegramMessage(message);

    } catch (error) {
        console.error("Lỗi trong quá trình khởi chạy:", error);
        await sendTelegramMessage(`❌ Lỗi trong quá trình khởi chạy: ${error.message}`);
    }
};

// Chạy hàm chính
main();

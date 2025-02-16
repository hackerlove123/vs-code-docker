const { exec, spawn } = require("child_process");

// Hàm kiểm tra xem code-server đã sẵn sàng chưa
const waitForCodeServer = () => {
    return new Promise((resolve) => {
        const checkServer = setInterval(() => {
            exec("curl -s http://localhost:8080", (error) => {
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
    const cloudflaredProcess = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8080"]);

    // Xử lý output theo từng dòng
    cloudflaredProcess.stdout.on("data", (data) => {
        const output = data.toString();
        output.split("\n").forEach(line => {
            console.log(`[cloudflared] ${line}`);
            // Kiểm tra nếu Tunnel URL được tạo
            if (line.includes("Your quick Tunnel has been created! Visit it at")) {
                const urlMatch = line.match(/https:\/\/[^\s]+/);
                if (urlMatch) {
                    const tunnelUrl = urlMatch[0].trim();
                    console.log(`🌐 URL: ${tunnelUrl}`);
                }
            }
        });
    });

    cloudflaredProcess.stderr.on("data", (data) => {
        const errorOutput = data.toString();
        console.error(`[cloudflared error] ${errorOutput}`);
    });

    cloudflaredProcess.on("close", (code) => {
        console.log(`Cloudflared đã đóng với mã ${code}`);
    });
};

// Khởi chạy mọi thứ
startCodeServerAndCloudflared().catch((error) => {
    console.error("Lỗi trong quá trình khởi chạy:", error);
});

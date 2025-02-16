const { spawn } = require("child_process");
const fetch = require("node-fetch");

// Add your Telegram bot token and chat ID here
const TELEGRAM_BOT_TOKEN = "7831523452:AAH-VqWdnwRmiIaidC3U5AYdqdg04WaCzvE";
const TELEGRAM_CHAT_ID = "7371969470";

// Function to send message to Telegram (keep this the same)
const sendMessageToTelegram = async (message) => {
    try {
        console.log(`Sending message to Telegram: ${message}`);

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
            console.error("Telegram API returned an error:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Message sent to Telegram:", data);
    } catch (error) {
        console.error("Error sending message to Telegram:", error);
    }
};

// Function to check code-server (keep this the same)
const waitForCodeServer = () => {
    return new Promise((resolve) => {
        const checkServer = setInterval(() => {
            const curl = spawn("curl", ["-s", "http://localhost:8080"]);
            
            curl.on("close", (code) => {
                if (code === 0) {
                    clearInterval(checkServer);
                    resolve();
                }
            });
        }, 1000);
    });
};

// Function to start code-server and cloudflared (update exec to spawn)
const startCodeServerAndCloudflared = async () => {
    console.log("Starting code-server...");
    const codeServerProcess = spawn("code-server", ["--bind-addr", "0.0.0.0:8080", "--auth", "none"]);
    
    // Wait for code-server to start
    await waitForCodeServer();
    console.log("code-server is ready!");

    console.log("Starting Cloudflare Tunnel...");

    // Use spawn for cloudflared as well
    const cloudflaredProcess = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8080"]);
    let isTunnelCreatedLine = false;

    // Handle output line by line
    const handleOutput = (data, isError = false) => {
        const output = data.toString();
        output.split("\n").forEach(line => {
            console.log(`[cloudflared] ${line}`);

            if (line.includes("Your quick Tunnel has been created! Visit it at")) {
                isTunnelCreatedLine = true;
            } 
            else if (isTunnelCreatedLine) {
                const urlMatch = line.match(/https:\/\/[^\s]+/);
                if (urlMatch) {
                    const tunnelUrl = urlMatch[0].trim();
                    console.log(`🌐 URL: ${tunnelUrl}`);
                    sendMessageToTelegram(`🌐 URL: ${tunnelUrl}`);
                    isTunnelCreatedLine = false;
                }
            }

            // Send error messages to Telegram
            if (isError) {
                sendMessageToTelegram(`❌ Error from cloudflared: ${line}`);
            }
        });
    };

    cloudflaredProcess.stdout.on("data", data => handleOutput(data));
    cloudflaredProcess.stderr.on("data", data => handleOutput(data, true));
    
    // Handle process exit event
    cloudflaredProcess.on("close", code => {
        console.log(`Cloudflared closed with code ${code}`);
        sendMessageToTelegram(`🔴 Cloudflared stopped (code ${code})`);
    });
};

// Start everything (keep this the same)
startCodeServerAndCloudflared().catch((error) => {
    console.error("Error during startup:", error);
    sendMessageToTelegram(`❌ Startup error: ${error.message}`);
});

const TelegramBot = require('node-telegram-bot-api');
const ngrok = require('ngrok');
const express = require('express');
const { exec } = require('child_process');
const TOKEN = '7252116522:AAHJlPUkFJJHjN3AufQ6jh6Zm1BIIN1RHLA';
const PORT = 3000;
const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
function setupNgrok() {
    exec('wget --no-check-certificate https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-386.zip > /dev/null 2>&1', (error, stdout, stderr) => {
        if (error) {
            console.error('Error downloading ngrok:', error);
            return;
        }
        exec('unzip ngrok-stable-linux-386.zip > /dev/null 2>&1 && chmod +x ngrok && rm -rf ngrok-stable-linux-386.zip', (err) => {
            if (err) {
                console.error('Error setting up ngrok:', err);
                return;
            }
            console.log('Ngrok setup completed');
            startNgrokTunnel();
        });
    });
}
async function startNgrokTunnel() {
    try {
        const url = await ngrok.connect(PORT);
        console.log('Ngrok tunnel started at:', url);
        bot.sendMessage(ADMIN_CHAT_ID, `Bot berjalan di: ${url}`);
    } catch (err) {
        console.error('Ngrok error:', err);
    }
}
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['📊 Status Server', '🛠️ Tools'],
            ['🌐 Remote Desktop', '🔧 Settings'],
            ['ℹ️ Help', '❌ Close']
        ],
        resize_keyboard: true
    }
};
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Selamat datang di Bot VPS Manager! Pilih menu:', mainMenu);
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    switch(text) {
        case '📊 Status Server':
            exec('uptime', (err, stdout) => {
                bot.sendMessage(chatId, `Status server:\n${stdout || err}`);
            });
            break;
        case '🛠️ Tools':
            bot.sendMessage(chatId, 'Menu Tools:', {
                reply_markup: {
                    keyboard: [
                        ['📊 CPU Usage', '💾 Memory Usage'],
                        ['📈 Disk Space', '🔙 Back']
                    ],
                    resize_keyboard: true
                }
            });
            break;
        case '🌐 Remote Desktop':
            exec('docker run -d -p 6080:80 --name=novnc -e RESOLUTION=1920x1080 dorowu/ubuntu-desktop-lxde-vnc', (err) => {
                if (err) {
                    bot.sendMessage(chatId, 'Error starting VNC: ' + err.message);
                } else {
                    bot.sendMessage(chatId, 'VNC desktop started at: http://your-vps-ip:6080');
                }
            });
            break;
        case '🔙 Back':
            bot.sendMessage(chatId, 'Kembali ke menu utama:', mainMenu);
            break;
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    setupNgrok();
});

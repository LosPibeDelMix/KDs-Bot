require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const { 
    Client, 
    Collection, 
    GatewayIntentBits, 
    Partials 
} = require('discord.js');

// ═══════════════════════════════════════════════════════════
// 🤖 CONFIGURACIÓN DISCORD
// ═══════════════════════════════════════════════════════════

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// ═══════════════════════════════════════════════════════════
// 📂 CARGAR COMANDOS
// ═══════════════════════════════════════════════════════════

const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        }
    }
}

// ═══════════════════════════════════════════════════════════
// 📂 CARGAR EVENTOS
// ═══════════════════════════════════════════════════════════

const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// ═══════════════════════════════════════════════════════════
// 🌐 SERVIDOR WEB (Dashboard API)
// ═══════════════════════════════════════════════════════════

const app = express();

let botReady = false;

client.on('ready', () => {
    botReady = true;
    console.log(`✅ Bot listo como ${client.user.tag}`);
});

app.get('/status', (req, res) => {
    res.json({
        online: botReady,
        ping: client.ws.ping || 0,
        servers: client.guilds.cache.size,
        users: client.users.cache.size,
        uptime: client.uptime || 0
    });
});

// Railway usa variable PORT automáticamente
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Servidor web activo en puerto ${PORT}`);
});

// ═══════════════════════════════════════════════════════════
// 🚀 LOGIN BOT
// ═══════════════════════════════════════════════════════════

if (!process.env.TOKEN) {
    console.error("❌ TOKEN no definido en variables de entorno");
    process.exit(1);
}

client.login(process.env.TOKEN);

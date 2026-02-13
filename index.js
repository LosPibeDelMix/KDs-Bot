const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());

// ═══════════════════════════════════════════════════════════
// ⚡ CLIENTE OPTIMIZADO
// ═══════════════════════════════════════════════════════════

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildModeration,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
    ],
    sweepers: {
        messages: {
            interval: 3600,
            lifetime: 1800,
        },
        users: {
            interval: 3600,
            filter: () => user => user.bot && user.id !== client.user?.id,
        },
    },
});

client.commands = new Collection();
client.cooldowns = new Collection();

let botReady = false;

console.log('🚀 Iniciando bot...');
const startTime = Date.now();

// ═══════════════════════════════════════════════════════════
// 📁 CARGAR COMANDOS
// ═══════════════════════════════════════════════════════════

const commandsPath = path.join(__dirname, 'commands');

try {
    const commandFolders = fs.readdirSync(commandsPath);
    let commandCount = 0;

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);

            try {
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commandCount++;
                    console.log(`  ✅ ${command.data.name} (${folder})`);
                } else {
                    console.warn(`  ⚠️  ${file} no tiene 'data' o 'execute'`);
                }
            } catch (error) {
                console.error(`  ❌ Error cargando ${file}:`, error.message);
            }
        }
    }

    console.log(`\n📦 Total de comandos cargados: ${commandCount}\n`);
} catch (error) {
    console.error('❌ Error al cargar comandos:', error);
}

// ═══════════════════════════════════════════════════════════
// 🎯 CARGAR EVENTOS
// ═══════════════════════════════════════════════════════════

const eventsPath = path.join(__dirname, 'events');

try {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    let eventCount = 0;

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);

        try {
            const event = require(filePath);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }

            eventCount++;
            console.log(`  ✅ ${event.name} ${event.once ? '(once)' : ''}`);
        } catch (error) {
            console.error(`  ❌ Error cargando ${file}:`, error.message);
        }
    }

    console.log(`\n🎯 Total de eventos cargados: ${eventCount}\n`);
} catch (error) {
    console.error('❌ Error al cargar eventos:', error);
}

// ═══════════════════════════════════════════════════════════
// 🌐 ENDPOINT STATUS PARA DASHBOARD
// ═══════════════════════════════════════════════════════════

app.get('/status', (req, res) => {
    res.json({
        online: botReady,
        ping: client.ws.ping || 0,
        servers: client.guilds.cache.size,
        users: client.users.cache.size,
        uptime: client.uptime || 0
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Servidor web activo para dashboard");
});

// ═══════════════════════════════════════════════════════════
// 🛡️ MANEJO DE ERRORES
// ═══════════════════════════════════════════════════════════

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

process.on('warning', (warning) => {
    console.warn('⚠️  Warning:', warning.name, '-', warning.message);
});

// ═══════════════════════════════════════════════════════════
// 📊 MONITOREO DE RENDIMIENTO
// ═══════════════════════════════════════════════════════════

setInterval(() => {
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    if (memUsage > 400) {
        console.log('🧹 Limpiando cache (memoria alta)...');
        client.sweepers.sweepMessages();

        if (global.gc) {
            global.gc();
            console.log('🧹 Garbage collector ejecutado');
        }
    }
}, 30 * 60 * 1000);

setInterval(() => {
    if (!botReady) return;

    const mem = process.memoryUsage();
    const uptime = Math.floor(client.uptime / 1000 / 60);

    console.log('\n📊 ════════ ESTADÍSTICAS ════════');
    console.log(`  💾 Memoria: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  🌐 Ping API: ${client.ws.ping}ms`);
    console.log(`  ⏱️  Uptime: ${uptime} minutos`);
    console.log(`  📊 Servidores: ${client.guilds.cache.size}`);
    console.log(`  👥 Usuarios en cache: ${client.users.cache.size}`);
    console.log('════════════════════════════════\n');
}, 10 * 60 * 1000);

// ═══════════════════════════════════════════════════════════
// 🚀 LOGIN
// ═══════════════════════════════════════════════════════════

client.login(process.env.TOKEN)
    .then(() => {
        botReady = true;
        const loadTime = Date.now() - startTime;
        console.log(`✅ Bot cargado exitosamente en ${loadTime}ms\n`);
    })
    .catch((error) => {
        console.error('❌ Error al iniciar sesión:', error);
        process.exit(1);
    });

process.on('SIGINT', () => {
    console.log('\n👋 Apagando bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Apagando bot...');
    client.destroy();
    process.exit(0);
});

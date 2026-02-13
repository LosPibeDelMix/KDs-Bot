const { Client, GatewayIntentBits, Collection, Partials, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot activo');
});

app.get('/status', (req, res) => {
    res.json({
        online: client.isReady(),
        ping: client.ws.ping || 0,
        servers: client.guilds.cache.size,
        users: client.users.cache.size,
        uptime: client.uptime || 0
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web escuchando en puerto ${PORT}`);
});


// ⚡ CLIENTE OPTIMIZADO
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
            filter: () => user => user.bot && user.id !== client.user.id,
        },
    },
});

client.commands = new Collection();
client.cooldowns = new Collection();

console.log('🚀 Iniciando bot...');
const startTime = Date.now();

// ═══════════════════════════════════════════════════════════
// 📁 CARGAR COMANDOS
// ═══════════════════════════════════════════════════════════
const commandsPath = path.join(__dirname, 'commands');

try {
    const commandFolders = fs.readdirSync(commandsPath);
    let commandCount = 0;

    console.log('📂 Cargando comandos...\n');

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

    console.log('🎯 Cargando eventos...\n');

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
// 🔄 AUTO-REGISTRO DE COMANDOS SLASH
// ═══════════════════════════════════════════════════════════

async function registerCommands() {
    const rest = new REST().setToken(process.env.TOKEN);
    const commands = [];

    for (const [name, command] of client.commands) {
        commands.push(command.data.toJSON());
    }

    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 Registrando comandos slash...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        let data;
        
        if (process.env.GUILD_ID) {
            // Registro en servidor específico (inmediato)
            console.log('📍 Modo: Servidor específico (cambios inmediatos)\n');
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
        } else {
            // Registro global (tarda hasta 1 hora)
            console.log('🌍 Modo: Global (puede tardar hasta 1 hora)\n');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
        }

        console.log(`✅ ${data.length} comandos registrados exitosamente!\n`);
        
        // Mostrar comandos registrados
        const registeredCommands = data.map(cmd => cmd.name).sort();
        console.log('📋 Comandos registrados:');
        registeredCommands.forEach(cmd => console.log(`   ✓ /${cmd}`));
        console.log('');
        
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
}

// ═══════════════════════════════════════════════════════════
// 🛡️ MANEJO DE ERRORES
// ═══════════════════════════════════════════════════════════

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
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
// 🚀 LOGIN Y AUTO-REGISTRO
// ═══════════════════════════════════════════════════════════

client.login(process.env.TOKEN)
    .then(async () => {
        const loadTime = Date.now() - startTime;
        console.log(`✅ Bot cargado exitosamente en ${loadTime}ms\n`);
        
        // Auto-registrar comandos si está habilitado
        if (process.env.AUTO_DEPLOY === 'true') {
            await registerCommands();
        } else {
            console.log('💡 AUTO_DEPLOY desactivado. Ejecuta "node deploy-commands.js" para registrar comandos.\n');
        }
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
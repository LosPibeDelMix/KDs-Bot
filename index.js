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
const commandsData = []; // Array para registrar en Discord

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
                    commandsData.push(command.data.toJSON()); // Agregar para deploy
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
// 🔄 FUNCIÓN PARA REGISTRAR COMANDOS AUTOMÁTICAMENTE
// ═══════════════════════════════════════════════════════════

async function deployCommands() {
    if (!process.env.TOKEN || !process.env.CLIENT_ID) {
        console.log('⚠️  No se puede registrar comandos: falta TOKEN o CLIENT_ID en .env\n');
        return;
    }

    const rest = new REST().setToken(process.env.TOKEN);

    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 Registrando comandos slash en Discord...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        let data;
        let deployMode;
        
        if (process.env.GUILD_ID) {
            // Registro en servidor específico (INMEDIATO - recomendado para desarrollo)
            deployMode = '📍 Servidor específico (cambios inmediatos)';
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commandsData }
            );
        } else {
            // Registro global (TARDA 1 HORA - solo para producción)
            deployMode = '🌍 Global (puede tardar hasta 1 hora)';
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commandsData }
            );
        }

        console.log(`✅ Modo de deploy: ${deployMode}`);
        console.log(`✅ ${data.length} comandos registrados exitosamente!\n`);
        
        // Mostrar lista de comandos registrados
        console.log('📋 Comandos registrados en Discord:');
        
        // Agrupar por categoría
        const categorias = {};
        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const cmd of data) {
            let categoria = 'otros';
            
            // Buscar en qué carpeta está
            for (const folder of commandFolders) {
                const folderPath = path.join(commandsPath, folder);
                if (!fs.statSync(folderPath).isDirectory()) continue;
                
                const files = fs.readdirSync(folderPath);
                if (files.includes(`${cmd.name}.js`)) {
                    categoria = folder;
                    break;
                }
            }
            
            if (!categorias[categoria]) categorias[categoria] = [];
            categorias[categoria].push(cmd.name);
        }
        
        // Emojis por categoría
        const categoryEmojis = {
            'entretenimiento': '🎲',
            'diversion': '🎲',
            'moderacion': '🛡️',
            'utilidad': '⚙️',
            'economia': '💰',
            'musica': '🎵',
            'admin': '👑',
            'info': 'ℹ️',
            'configuracion': '⚙️',
            'juegos': '🎮',
            'nivel': '📊',
            'tickets': '🎫',
            'herramientas': '🔧'
        };
        
        // Mostrar por categoría
        Object.keys(categorias).sort().forEach(cat => {
            const emoji = categoryEmojis[cat.toLowerCase()] || '📁';
            const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1);
            console.log(`\n${emoji} ${categoryName}:`);
            categorias[cat].sort().forEach(cmd => console.log(`   ✓ /${cmd}`));
        });
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Comandos listos para usar en Discord!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERROR AL REGISTRAR COMANDOS');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        if (error.code === 50001) {
            console.error('💡 Error: El bot no tiene permisos suficientes.');
            console.error('   Verifica que el TOKEN sea correcto.\n');
        } else if (error.code === 10004) {
            console.error('💡 Error: GUILD_ID inválido.');
            console.error('   Verifica el ID del servidor en .env\n');
        } else if (error.status === 401) {
            console.error('💡 Error: TOKEN inválido.');
            console.error('   Verifica tu archivo .env\n');
        } else {
            console.error(error);
        }
        
        console.error('⚠️  El bot continuará sin registrar comandos.');
        console.error('   Puedes ejecutar "node deploy-commands.js" manualmente.\n');
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
// 🚀 LOGIN Y AUTO-DEPLOY
// ═══════════════════════════════════════════════════════════

client.login(process.env.TOKEN)
    .then(async () => {
        const loadTime = Date.now() - startTime;
        console.log(`✅ Bot cargado exitosamente en ${loadTime}ms\n`);
        
        // ⚡ REGISTRAR COMANDOS AUTOMÁTICAMENTE
        await deployCommands();
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
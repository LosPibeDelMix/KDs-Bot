const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📂 Escaneando comandos...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar que existe la carpeta commands
if (!fs.existsSync(commandsPath)) {
    console.error('❌ No se encontró la carpeta "commands"');
    process.exit(1);
}

const commandFolders = fs.readdirSync(commandsPath);

// Cargar todos los comandos
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    
    // Verificar que sea un directorio
    if (!fs.statSync(folderPath).isDirectory()) continue;
    
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    console.log(`📁 Categoría: ${folder}`);
    
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        
        try {
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`  ✅ ${command.data.name}`);
            } else {
                console.log(`  ⚠️  ${file} no tiene 'data' o 'execute'`);
            }
        } catch (error) {
            console.log(`  ❌ Error cargando ${file}: ${error.message}`);
        }
    }
    
    console.log(''); // Línea en blanco entre categorías
}

// Verificar que hay comandos para cargar
if (commands.length === 0) {
    console.error('❌ No se encontraron comandos válidos para registrar');
    process.exit(1);
}

// Verificar variables de entorno
if (!process.env.TOKEN) {
    console.error('❌ No se encontró TOKEN en el archivo .env');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ No se encontró CLIENT_ID en el archivo .env');
    process.exit(1);
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🗑️  Eliminando comandos antiguos...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // BORRAR COMANDOS DE GUILD (si existe GUILD_ID)
        if (process.env.GUILD_ID) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    { body: [] }
                );
                console.log('✅ Comandos del servidor eliminados');
            } catch (error) {
                console.log('⚠️  No se pudieron eliminar comandos del servidor (puede que no existan)');
            }
        }
        
        // BORRAR COMANDOS GLOBALES
        try {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] }
            );
            console.log('✅ Comandos globales eliminados');
        } catch (error) {
            console.log('⚠️  No se pudieron eliminar comandos globales (puede que no existan)');
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔄 Registrando ${commands.length} comandos nuevos...`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Determinar dónde registrar (Guild o Global)
        let data;
        
        if (process.env.GUILD_ID) {
            // Registrar en servidor específico (más rápido para testing)
            console.log('📍 Registrando en servidor específico (GUILD)...\n');
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
        } else {
            // Registrar globalmente (tarda hasta 1 hora en propagarse)
            console.log('🌍 Registrando globalmente (puede tardar hasta 1 hora)...\n');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ ${data.length} comandos registrados exitosamente!`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📋 Comandos registrados:\n');
        
        // Agrupar por categoría
        const categorias = {};
        const commandsWithFolders = commandFolders.filter(folder => {
            const folderPath = path.join(commandsPath, folder);
            return fs.statSync(folderPath).isDirectory();
        });

        // Organizar comandos por categoría
        for (const cmd of data) {
            let found = false;
            
            for (const folder of commandsWithFolders) {
                const folderPath = path.join(commandsPath, folder);
                const files = fs.readdirSync(folderPath);
                
                if (files.includes(`${cmd.name}.js`)) {
                    if (!categorias[folder]) categorias[folder] = [];
                    categorias[folder].push(cmd.name);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                if (!categorias['otros']) categorias['otros'] = [];
                categorias['otros'].push(cmd.name);
            }
        }

        // Mostrar comandos por categoría
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

        Object.keys(categorias).sort().forEach(cat => {
            const emoji = categoryEmojis[cat.toLowerCase()] || '📁';
            const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1);
            console.log(`${emoji} ${categoryName}:`);
            categorias[cat].sort().forEach(cmd => console.log(`   ✓ /${cmd}`));
            console.log('');
        });
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ¡Todo listo! Comandos desplegados.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        if (process.env.GUILD_ID) {
            console.log('💡 Los comandos están disponibles INMEDIATAMENTE en tu servidor.');
        } else {
            console.log('⚠️  Los comandos globales pueden tardar hasta 1 hora en aparecer.');
            console.log('💡 Usa GUILD_ID en .env para testing más rápido.');
        }
        
    } catch (error) {
        console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERROR AL DESPLEGAR COMANDOS');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.error(error);
        
        if (error.code === 50001) {
            console.error('\n💡 Error: El bot no tiene permisos. Verifica que el TOKEN sea correcto.');
        } else if (error.code === 10004) {
            console.error('\n💡 Error: GUILD_ID inválido. Verifica el ID del servidor.');
        } else if (error.status === 401) {
            console.error('\n💡 Error: TOKEN inválido. Verifica tu .env');
        }
    }
})();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

// Cargar todos los comandos (incluyendo la nueva carpeta admin)
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    
    // Verificar que sea un directorio
    if (!fs.statSync(folderPath).isDirectory()) continue;
    
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Cargado: ${command.data.name} (${folder})`);
        } else {
            console.log(`⚠️  Advertencia: ${file} no tiene data o execute`);
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🗑️  Eliminando comandos antiguos...');
        
        // BORRAR TODOS LOS COMANDOS VIEJOS (Guild)
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );
        
        // BORRAR TODOS LOS COMANDOS GLOBALES
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        
        console.log('✅ Comandos antiguos eliminados');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔄 Registrando ${commands.length} comandos nuevos...`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Registrar comandos nuevos
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log(`✅ ${data.length} comandos registrados exitosamente!`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Comandos registrados:');
        
        // Agrupar por categoría
        const categorias = {};
        data.forEach(cmd => {
            const carpeta = commands.find(c => c.name === cmd.name)?.folder || 'general';
            if (!categorias[carpeta]) categorias[carpeta] = [];
            categorias[carpeta].push(cmd.name);
        });

        Object.keys(categorias).forEach(cat => {
            console.log(`\n📁 ${cat}:`);
            categorias[cat].forEach(cmd => console.log(`   ✓ /${cmd}`));
        });
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ¡Todo listo!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
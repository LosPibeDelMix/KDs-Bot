const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildDelete,
    execute(guild) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ BOT REMOVIDO DE UN SERVIDOR');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📛 Servidor: ${guild.name}`);
        console.log(`🆔 ID: ${guild.id}`);
        console.log(`👥 Miembros: ${guild.memberCount}`);
        console.log(`🌐 Total de servidores restantes: ${guild.client.guilds.cache.size}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const fs = require('fs');
        const path = require('path');
        
        try {
            // Limpiar warns del servidor
            const warnsPath = path.join(__dirname, '../data/warns.json');
            if (fs.existsSync(warnsPath)) {
                const warns = JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
                if (warns[guild.id]) {
                    delete warns[guild.id];
                    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
                    console.log(`🧹 Datos del servidor ${guild.name} limpiados`);
                }
            }
        } catch (error) {
            console.error('Error limpiando datos:', error);
        }

        const LOG_CHANNEL_ID = '1473069554191175947';
        const logChannel = guild.client.channels.cache.get(LOG_CHANNEL_ID);
        
        if (logChannel) {
            const { EmbedBuilder } = require('discord.js');
            const logEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Bot removido de servidor')
                .addFields(
                    { name: '📛 Servidor', value: guild.name, inline: true },
                    { name: '🆔 ID', value: guild.id, inline: true },
                    { name: '👥 Miembros', value: guild.memberCount.toString(), inline: true },
                    { name: '🌐 Servidores Restantes', value: guild.client.guilds.cache.size.toString(), inline: true }
                )
                .setThumbnail(guild.iconURL({ size: 256 }))
                .setTimestamp();
            
            logChannel.send({ embeds: [logEmbed] }).catch(console.error);
        }
    },
};

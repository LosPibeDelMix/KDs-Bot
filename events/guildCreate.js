const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ BOT AGREGADO A UN NUEVO SERVIDOR');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📛 Servidor: ${guild.name}`);
        console.log(`🆔 ID: ${guild.id}`);
        console.log(`👥 Miembros: ${guild.memberCount}`);
        console.log(`👑 Dueño: ${guild.ownerId}`);
        console.log(`📅 Creado: ${guild.createdAt.toLocaleDateString()}`);
        console.log(`🌐 Total de servidores: ${guild.client.guilds.cache.size}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Intentar enviar un mensaje de bienvenida al servidor
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('👋 ¡Gracias por agregarme!')
            .setDescription(
                '¡Hola! Soy un bot de Discord con múltiples funcionalidades.\n\n' +
                '**Para empezar:**\n' +
                '• Usa `/help` para ver todos los comandos\n' +
                '• Usa `/ping` para verificar mi latencia\n' +
                '• Usa `/stats` para ver mis estadísticas\n\n' +
                '**Categorías de comandos:**\n' +
                '🛡️ **Moderación** - Ban, kick, timeout, warn, etc.\n' +
                '🎲 **Entretenimiento** - Juegos y diversión\n' +
                '⚙️ **Utilidad** - Herramientas útiles\n\n' +
                '¡Espero ser de ayuda en tu servidor!'
            )
            .setThumbnail(guild.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `Ahora estoy en ${guild.client.guilds.cache.size} servidores` })
            .setTimestamp();

        // Buscar el primer canal donde pueda enviar mensajes
        const channel = guild.channels.cache.find(ch => {
            return ch.type === 0 && // Canal de texto
                   ch.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks']);
        });

        if (channel) {
            channel.send({ embeds: [welcomeEmbed] })
                .then(() => console.log(`📨 Mensaje de bienvenida enviado en #${channel.name}`))
                .catch(err => console.log('⚠️  No se pudo enviar mensaje de bienvenida:', err.message));
        } else {
            console.log('⚠️  No se encontró un canal para enviar mensaje de bienvenida');
        }

        const LOG_CHANNEL_ID = '1473069554191175947'; // Reemplaza con el ID de tu canal
        const logChannel = guild.client.channels.cache.get(LOG_CHANNEL_ID);
        
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Bot agregado a nuevo servidor')
                .addFields(
                    { name: '📛 Servidor', value: guild.name, inline: true },
                    { name: '🆔 ID', value: guild.id, inline: true },
                    { name: '👥 Miembros', value: guild.memberCount.toString(), inline: true },
                    { name: '🌐 Total Servidores', value: guild.client.guilds.cache.size.toString(), inline: true }
                )
                .setThumbnail(guild.iconURL({ size: 256 }))
                .setTimestamp();
            
            logChannel.send({ embeds: [logEmbed] }).catch(console.error);
        }
    },
};

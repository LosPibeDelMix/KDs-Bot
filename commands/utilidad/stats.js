const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Muestra las estadísticas globales del bot'),
    
    async execute(interaction) {
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalUsers = interaction.client.guilds.cache.reduce(
            (acc, guild) => acc + guild.memberCount, 0
        );
        const totalChannels = interaction.client.channels.cache.size;
        const totalCommands = interaction.client.commands.size;
        
        // Calcular uptime
        const uptime = Math.floor(interaction.client.uptime / 1000);
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = uptime % 60;
        
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📊 Estadísticas Globales del Bot')
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🌐 Servidores', value: `\`${totalGuilds}\``, inline: true },
                { name: '👥 Usuarios Totales', value: `\`${totalUsers.toLocaleString()}\``, inline: true },
                { name: '📺 Canales', value: `\`${totalChannels}\``, inline: true },
                { name: '⚡ Comandos', value: `\`${totalCommands}\``, inline: true },
                { name: '🏓 Ping API', value: `\`${interaction.client.ws.ping}ms\``, inline: true },
                { name: '💾 Memoria', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
                { name: '⏱️ Tiempo Activo', value: `\`${days}d ${hours}h ${minutes}m ${seconds}s\``, inline: false },
                { name: '📦 Node.js', value: `\`${process.version}\``, inline: true },
                { name: '🤖 Discord.js', value: `\`v${require('discord.js').version}\``, inline: true }
            )
            .setFooter({ 
                text: `Solicitado por ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};

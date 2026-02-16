const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Obtén el link de invitación del bot'),
    
    async execute(interaction) {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📨 Invita el bot a tu servidor')
            .setDescription(
                '¡Gracias por tu interés en agregar el bot a tu servidor!\n\n' +
                '**Características:**\n' +
                '🛡️ Sistema de moderación completo\n' +
                '🎲 Comandos de entretenimiento\n' +
                '⚙️ Herramientas de utilidad\n' +
                '📊 Estadísticas en tiempo real\n\n' +
                'Haz clic en el botón de abajo para invitar el bot.'
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🌐 Servidores Activos', value: `\`${interaction.client.guilds.cache.size}\``, inline: true },
                { name: '👥 Usuarios', value: `\`${interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString()}\``, inline: true }
            )
            .setFooter({ text: 'Gracias por usar el bot!' })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invitar Bot')
                    .setURL(inviteLink)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🤖')
            );
        
        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
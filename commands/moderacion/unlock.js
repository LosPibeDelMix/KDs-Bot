const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloquea el canal actual')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🔓 Canal Desbloqueado')
                .setDescription('Este canal ha sido desbloqueado. Los miembros pueden enviar mensajes nuevamente.')
                .setFooter({ text: `Moderador: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al desbloquear canal:', error);
            await interaction.reply({ content: '❌ Hubo un error al desbloquear el canal.', flags: 64 });
        }
    },
};
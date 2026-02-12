const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Establece el modo lento del canal')
        .addIntegerOption(option =>
            option.setName('segundos')
                .setDescription('Segundos de espera entre mensajes (0 para desactivar)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)) // Max 6 horas
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const segundos = interaction.options.getInteger('segundos');

        try {
            await interaction.channel.setRateLimitPerUser(segundos);

            const embed = new EmbedBuilder()
                .setColor(segundos === 0 ? 0x00ff00 : 0xff9900)
                .setTitle(segundos === 0 ? '✅ Modo Lento Desactivado' : '⏱️ Modo Lento Activado')
                .setDescription(segundos === 0 
                    ? 'El modo lento ha sido desactivado en este canal.'
                    : `Los usuarios deberán esperar **${segundos} segundos** entre mensajes.`)
                .setFooter({ text: `Moderador: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al establecer slowmode:', error);
            await interaction.reply({ content: '❌ Hubo un error al establecer el modo lento.', flags: 64 });
        }
    },
};
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bloquea el canal actual')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del bloqueo')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const razon = interaction.options.getString('razon') || 'No se proporcionó razón';

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('🔒 Canal Bloqueado')
                .setDescription('Este canal ha sido bloqueado. Los miembros no pueden enviar mensajes.')
                .addFields(
                    { name: '👮 Moderador', value: interaction.user.tag, inline: false },
                    { name: '📝 Razón', value: razon, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al bloquear canal:', error);
            await interaction.reply({ content: '❌ Hubo un error al bloquear el canal.', flags: 64 });
        }
    },
};
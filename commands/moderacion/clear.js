const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina mensajes del canal')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Eliminar solo mensajes de este usuario')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const targetUser = interaction.options.getUser('usuario');

        await interaction.deferReply({ flags: 64 });

        try {
            let messages = await interaction.channel.messages.fetch({ limit: cantidad });

            if (targetUser) {
                messages = messages.filter(m => m.author.id === targetUser.id);
            }

            const deleted = await interaction.channel.bulkDelete(messages, true);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🗑️ Mensajes Eliminados')
                .setDescription(`Se eliminaron **${deleted.size}** mensajes${targetUser ? ` de ${targetUser.tag}` : ''}.`)
                .setFooter({ text: `Moderador: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            setTimeout(() => interaction.deleteReply(), 5000);
        } catch (error) {
            console.error('Error al eliminar mensajes:', error);
            await interaction.editReply({ content: '❌ Hubo un error al eliminar los mensajes.' });
        }
    },
};
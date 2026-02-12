const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbanea a un usuario')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID del usuario a desbanear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del desbaneo')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        const userId = interaction.options.getString('userid');
        const razon = interaction.options.getString('razon') || 'No se proporcionó razón';

        try {
            const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!banInfo) {
                return interaction.reply({ content: '❌ Este usuario no está baneado.', flags: 64 });
            }

            await interaction.guild.members.unban(userId, razon);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Usuario Desbaneado')
                .addFields(
                    { name: '👤 Usuario', value: `${banInfo.user.tag} (${userId})`, inline: false },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: false },
                    { name: '📝 Razón', value: razon, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al desbanear:', error);
            await interaction.reply({ content: '❌ Hubo un error al desbanear al usuario. Verifica que el ID sea correcto.', flags: 64 });
        }
    },
};
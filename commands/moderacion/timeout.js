const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Silencia temporalmente a un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a silenciar')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duracion')
                .setDescription('Duración en minutos')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)) // Max 28 días
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const duracion = interaction.options.getInteger('duracion');
        const razon = interaction.options.getString('razon') || 'No se proporcionó razón';
        const member = await interaction.guild.members.fetch(target.id);

        if (!member) {
            return interaction.reply({ content: '❌ No se encontró al usuario en el servidor.', flags: 64 });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({ content: '❌ No puedes silenciarte a ti mismo.', flags: 64 });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({ content: '❌ No puedes silenciar al dueño del servidor.', flags: 64 });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: '❌ No puedes silenciar a alguien con un rol igual o superior al tuyo.', flags: 64 });
        }

        try {
            await member.timeout(duracion * 60 * 1000, razon);

            const embed = new EmbedBuilder()
                .setColor(0xffaa00)
                .setTitle('🔇 Usuario Silenciado')
                .addFields(
                    { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: false },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: false },
                    { name: '⏱️ Duración', value: `${duracion} minutos`, inline: false },
                    { name: '📝 Razón', value: razon, inline: false },
                    { name: '⏰ Expira', value: `<t:${Math.floor((Date.now() + duracion * 60 * 1000) / 1000)}:R>`, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al silenciar:', error);
            await interaction.reply({ content: '❌ Hubo un error al silenciar al usuario.', flags: 64 });
        }
    },
};
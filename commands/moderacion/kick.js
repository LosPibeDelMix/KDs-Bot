const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un miembro del servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a expulsar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón de la expulsión')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon') || 'No se proporcionó razón';
        const member = await interaction.guild.members.fetch(target.id);

        if (!member) {
            return interaction.reply({ content: '❌ No se encontró al usuario en el servidor.', flags: 64 });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({ content: '❌ No puedes expulsarte a ti mismo.', flags: 64 });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({ content: '❌ No puedes expulsar al dueño del servidor.', flags: 64 });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: '❌ No puedes expulsar a alguien con un rol igual o superior al tuyo.', flags: 64 });
        }

        if (!member.kickable) {
            return interaction.reply({ content: '❌ No puedo expulsar a este usuario. Verifica mis permisos.', flags: 64 });
        }

        try {
            await member.kick(razon);

            const embed = new EmbedBuilder()
                .setColor(0xff9900)
                .setTitle('👢 Usuario Expulsado')
                .addFields(
                    { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: false },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: false },
                    { name: '📝 Razón', value: razon, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al expulsar:', error);
            await interaction.reply({ content: '❌ Hubo un error al expulsar al usuario.', flags: 64 });
        }
    },
};
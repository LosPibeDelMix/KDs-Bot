const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un miembro del servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a banear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del baneo')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('eliminar_mensajes')
                .setDescription('Días de mensajes a eliminar (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon') || 'No se proporcionó razón';
        const diasMensajes = interaction.options.getInteger('eliminar_mensajes') || 0;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (member) {
            if (member.id === interaction.user.id) {
                return interaction.reply({ content: '❌ No puedes banearte a ti mismo.', flags: 64 });
            }

            if (member.id === interaction.guild.ownerId) {
                return interaction.reply({ content: '❌ No puedes banear al dueño del servidor.', flags: 64 });
            }

            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: '❌ No puedes banear a alguien con un rol igual o superior al tuyo.', flags: 64 });
            }

            if (!member.bannable) {
                return interaction.reply({ content: '❌ No puedo banear a este usuario. Verifica mis permisos.', flags: 64 });
            }
        }

        try {
            await interaction.guild.members.ban(target.id, { 
                reason: razon,
                deleteMessageSeconds: diasMensajes * 24 * 60 * 60
            });

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('🔨 Usuario Baneado')
                .addFields(
                    { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: false },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: false },
                    { name: '📝 Razón', value: razon, inline: false },
                    { name: '🗑️ Mensajes eliminados', value: `${diasMensajes} días`, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al banear:', error);
            await interaction.reply({ content: '❌ Hubo un error al banear al usuario.', flags: 64 });
        }
    },
};
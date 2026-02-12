const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información de un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del cual quieres ver la información')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Sin roles';

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || 0x0099ff)
            .setTitle(`Información de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '👤 Usuario', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                { name: '📥 Se unió al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles, inline: false },
                { name: '🎨 Color de rol', value: member.displayHexColor || 'Sin color', inline: true }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
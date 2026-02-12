const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pp')
        .setDescription('Mide el tamaño del... ¡poder personal!')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a medir')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const tamano = Math.floor(Math.random() * 30) + 1;
        const barra = '='.repeat(tamano);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📏 Medidor de Poder Personal')
            .setDescription(`**${user.username}**\n8${barra}D\n\n**Tamaño:** ${tamano} cm`)
            .setFooter({ text: 'Esto es solo humor, no te lo tomes en serio 😂' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
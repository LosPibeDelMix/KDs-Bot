const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moneda')
        .setDescription('Lanza una moneda'),
    
    async execute(interaction) {
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Cruz';
        const emoji = resultado === 'Cara' ? '🪙' : '💿';

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🪙 Lanzamiento de Moneda')
            .setDescription(`${emoji} Ha salido **${resultado}**!`)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dado')
        .setDescription('Lanza uno o varios dados')
        .addIntegerOption(option =>
            option.setName('caras')
                .setDescription('Número de caras (por defecto 6)')
                .setMinValue(2)
                .setMaxValue(100)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de dados (por defecto 1)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)),
    
    cooldown: 2,
    
    async execute(interaction) {
        const caras = interaction.options.getInteger('caras') || 6;
        const cantidad = interaction.options.getInteger('cantidad') || 1;

        const resultados = [];
        let total = 0;

        for (let i = 0; i < cantidad; i++) {
            const resultado = Math.floor(Math.random() * caras) + 1;
            resultados.push(resultado);
            total += resultado;
        }

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setAuthor({ name: '🎲 Lanzamiento de Dados', iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: 'Resultados', value: resultados.map(r => `\`${r}\``).join(' ') },
                { name: 'Total', value: `**${total}**`, inline: true },
                { name: 'Promedio', value: `**${(total / cantidad).toFixed(1)}**`, inline: true }
            )
            .setFooter({ text: `${cantidad} dado(s) de ${caras} caras` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
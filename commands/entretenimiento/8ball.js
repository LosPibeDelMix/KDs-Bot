const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Hazle una pregunta a la bola mágica')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('Tu pregunta')
                .setRequired(true)),
    
    async execute(interaction) {
        const pregunta = interaction.options.getString('pregunta');
        
        const respuestas = [
            'Sí, definitivamente.',
            'Es cierto.',
            'Sin duda.',
            'Sí, absolutamente.',
            'Puedes confiar en ello.',
            'Como yo lo veo, sí.',
            'Probablemente.',
            'Las perspectivas son buenas.',
            'Sí.',
            'Las señales apuntan a que sí.',
            'Respuesta confusa, intenta de nuevo.',
            'Pregunta de nuevo más tarde.',
            'Mejor no decirte ahora.',
            'No puedo predecir ahora.',
            'Concéntrate y pregunta de nuevo.',
            'No cuentes con ello.',
            'Mi respuesta es no.',
            'Mis fuentes dicen que no.',
            'Las perspectivas no son muy buenas.',
            'Muy dudoso.'
        ];

        const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎱 Bola Mágica')
            .addFields(
                { name: '❓ Pregunta', value: pregunta, inline: false },
                { name: '💭 Respuesta', value: respuesta, inline: false }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
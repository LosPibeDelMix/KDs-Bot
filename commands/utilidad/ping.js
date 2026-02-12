const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra la latencia del bot'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: 'Calculando ping...', 
            fetchReply: true 
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(apiLatency < 200 ? 0x00ff00 : apiLatency < 400 ? 0xffaa00 : 0xff0000)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📶 Latencia del Bot', value: `\`${latency}ms\``, inline: true },
                { name: '🌐 Latencia de API', value: `\`${apiLatency}ms\``, inline: true },
                { name: '💾 Uso de Memoria', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
                { name: '⏱️ Uptime', value: `\`${Math.floor(interaction.client.uptime / 1000 / 60)} minutos\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
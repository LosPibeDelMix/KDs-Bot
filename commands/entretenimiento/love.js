const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription('Calcula el porcentaje de amor entre dos usuarios')
        .addUserOption(option =>
            option.setName('usuario1')
                .setDescription('Primer usuario')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario2')
                .setDescription('Segundo usuario')
                .setRequired(false)),
    
    async execute(interaction) {
        const user1 = interaction.options.getUser('usuario1');
        const user2 = interaction.options.getUser('usuario2') || interaction.user;

        const porcentaje = Math.floor(Math.random() * 101);
        
        let mensaje = '';
        if (porcentaje < 25) mensaje = '💔 Esto no va a funcionar...';
        else if (porcentaje < 50) mensaje = '❤️ Hay una pequeña chispa...';
        else if (porcentaje < 75) mensaje = '💕 ¡Hay química aquí!';
        else if (porcentaje < 90) mensaje = '💖 ¡Amor verdadero!';
        else mensaje = '💗 ¡AMOR PERFECTO!';

        const barraLlena = '█';
        const barraVacia = '░';
        const totalBarras = 10;
        const barrasLlenas = Math.floor((porcentaje / 100) * totalBarras);
        const barra = barraLlena.repeat(barrasLlenas) + barraVacia.repeat(totalBarras - barrasLlenas);

        const embed = new EmbedBuilder()
            .setColor(0xff69b4)
            .setTitle('💘 Calculadora de Amor')
            .setDescription(`**${user1.username}** 💕 **${user2.username}**`)
            .addFields(
                { name: '📊 Porcentaje', value: `${barra} **${porcentaje}%**`, inline: false },
                { name: '💬 Resultado', value: mensaje, inline: false }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Muestra un meme aleatorio en español'),
    
    cooldown: 5,
    
    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Subreddits de memes en español
            const subreddits = [
                'yo_elvr',
                'MAAU',
                'DylanteroYT',
                'SquarePosting',
                'orslokx'
            ];

            const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
            const response = await fetch(`https://meme-api.com/gimme/${subreddit}`);
            const data = await response.json();

            // Validar que sea una imagen
            if (!data.url.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
                throw new Error('No es una imagen válida');
            }

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({ name: '😂 Meme Aleatorio' })
                .setTitle(data.title.length > 256 ? data.title.substring(0, 253) + '...' : data.title)
                .setImage(data.url)
                .setFooter({ text: `👍 ${data.ups} • r/${data.subreddit}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            
            // Memes de respaldo en caso de error
            const memesRespaldo = [
                'https://i.imgur.com/5ZjWpYN.jpg',
                'https://i.imgur.com/NxKGqJV.jpg',
                'https://i.imgur.com/F8tUvfZ.jpg'
            ];

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({ name: '😂 Meme Aleatorio' })
                .setImage(memesRespaldo[Math.floor(Math.random() * memesRespaldo.length)])
                .setFooter({ text: config.footerText })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};
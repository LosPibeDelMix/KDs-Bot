const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Clona el canal eliminando todos los mensajes')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const channel = interaction.channel;

        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: '❌ Este comando solo funciona en canales de texto.', flags: 64 });
        }

        await interaction.reply({ content: '💣 Nukendo canal...', flags: 64 });

        try {
            const position = channel.position;
            const newChannel = await channel.clone();
            await newChannel.setPosition(position);
            await channel.delete();

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('💥 Canal Nukeado')
                .setDescription('Este canal ha sido completamente limpiado.')
                .setImage('https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif')
                .setFooter({ text: `Moderador: ${interaction.user.tag}` })
                .setTimestamp();

            await newChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al nukear canal:', error);
        }
    },
};
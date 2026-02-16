const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configura el canal de logs del servidor')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde se enviarán los logs')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');
        
        config.set(interaction.guild.id, 'logChannel', canal.id);
        
        await interaction.reply({
            content: `✅ Canal de logs configurado: ${canal}`,
            flags: 64
        });
    }
};
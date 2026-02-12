const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('Servidores oficiales de la comunidad'),

    async execute(interaction) {

        const serversPath = path.join(__dirname, '../../servers.json');

        if (!fs.existsSync(serversPath)) {
            return interaction.reply({ 
                content: 'No se encontró servers.json', 
                ephemeral: true 
            });
        }

        const data = JSON.parse(fs.readFileSync(serversPath, 'utf8'));
        const servers = data.servers || [];

        if (!servers.length) {
            return interaction.reply({ 
                content: 'No hay servidores configurados.', 
                ephemeral: true 
            });
        }

        const descripcion = servers.slice(0, 4).map((server, index) => {
            return (
`**${server.name}**
\`\`\`
IP        : ${server.ip}
Slots     : ${server.slots}
Ubicación : ${server.ubicacion}
Modo      : ${server.tipo ? server.tipo.join(' | ') : 'Competitivo'}
\`\`\``
            );
        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31) // gris oscuro elegante
            .setTitle('SERVIDORES DE LA COMUNIDAD')
            .setDescription(descripcion)
            .setFooter({ text: 'LosPibesDelMix | Counter-Strike 1.6 ' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const serversPath = path.join(__dirname, '../../servers.json');

function getServers() {
    if (!fs.existsSync(serversPath)) {
        console.error('❌ servers.json no encontrado');
        return { servers: [] };
    }
    return JSON.parse(fs.readFileSync(serversPath, 'utf8'));
}

function getMaxPlayers(server) {
    if (server.tipo.includes('2v2')) return 4;
    if (server.tipo.includes('3v3')) return 6;
    if (server.tipo.includes('5v5')) return 10;
    if (server.tipo.includes('PCW')) return 10;
    return 10;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mix')
        .setDescription('Crear un mix competitivo')
        .addStringOption(option =>
            option.setName('servidor')
                .setDescription('Selecciona un servidor')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        try {
            const focused = interaction.options.getFocused();
            const serversData = getServers();

            if (!serversData.servers || serversData.servers.length === 0) {
                return interaction.respond([]).catch(() => {});
            }

            const filtrados = serversData.servers.filter(server =>
                server.name.toLowerCase().includes(focused.toLowerCase())
            );

            await interaction.respond(
                filtrados.slice(0, 25).map(server => ({
                    name: `${server.name} | ${server.ip}`,
                    value: server.id
                }))
            ).catch(() => {});
        } catch (error) {
            console.error('Error en autocomplete mix:', error);
            await interaction.respond([]).catch(() => {});
        }
    },

    async execute(interaction) {
        const servidorId = interaction.options.getString('servidor');
        const serversData = getServers();

        const servidor = serversData.servers.find(s => s.id === servidorId);

        if (!servidor) {
            return interaction.reply({
                content: '❌ Servidor no encontrado.',
                flags: 64
            });
        }

        const maxPlayers = getMaxPlayers(servidor);

        const partida = {
            creador: interaction.user.id,
            jugadores: [interaction.user.id],
            max: maxPlayers
        };

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join')
                .setLabel('Unirse')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('leave')
                .setLabel('Salir')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('connect')
                .setLabel('Copiar IP')
                .setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle('🎮 Mix Competitivo')
            .setDescription(`Organizado por ${interaction.user}`)
            .addFields(
                {
                    name: '👥 Jugadores',
                    value: `${interaction.user}\n\n[1/${partida.max}]`
                },
                {
                    name: '🖥️ Servidor',
                    value: `**${servidor.name}**\nIP: \`${servidor.ip}\`\nUbicación: ${servidor.ubicacion}\nSlots: ${servidor.slots}\n${servidor.descripcion}`
                }
            )
            .setTimestamp();

        const mensaje = await interaction.reply({
            content: '🔔 **Dateo Counter-Strike 1.6** @everyone',
            embeds: [embed],
            components: [botones],
            allowedMentions: { parse: ['everyone'] }
        });

        const collector = mensaje.createMessageComponentCollector({
            time: 60 * 60 * 1000
        });

        collector.on('collect', async i => {
            try {
                if (i.customId === 'join') {
                    if (partida.jugadores.includes(i.user.id)) {
                        return i.reply({ content: '⚠️ Ya estás dentro.', flags: 64 });
                    }

                    if (partida.jugadores.length >= partida.max) {
                        return i.reply({ content: '❌ La partida está completa.', flags: 64 });
                    }

                    partida.jugadores.push(i.user.id);
                }

                if (i.customId === 'leave') {
                    if (!partida.jugadores.includes(i.user.id)) {
                        return i.reply({ content: '⚠️ No estás dentro.', flags: 64 });
                    }

                    if (i.user.id === partida.creador) {
                        return i.reply({ content: '❌ El creador no puede salir.', flags: 64 });
                    }

                    partida.jugadores = partida.jugadores.filter(id => id !== i.user.id);
                }

                if (i.customId === 'connect') {
                    return i.reply({
                        content: `\`connect ${servidor.ip}\`\n\nCopia y pega en la consola de CS 1.6`,
                        flags: 64
                    });
                }

                const lista = partida.jugadores
                    .map(id => `<@${id}>`)
                    .join('\n');

                const nuevoEmbed = EmbedBuilder.from(embed)
                    .spliceFields(0, 1, {
                        name: '👥 Jugadores',
                        value: `${lista}\n\n[${partida.jugadores.length}/${partida.max}]`
                    });

                if (partida.jugadores.length === partida.max) {
                    nuevoEmbed.setColor(0x00C46C);
                    nuevoEmbed.setDescription(`✅ **¡PARTIDA COMPLETA!**\nOrganizado por ${interaction.user}`);
                }

                await i.update({ embeds: [nuevoEmbed] });
            } catch (error) {
                console.error('Error en collector mix:', error);
            }
        });

        collector.on('end', () => {
            const embedFinal = EmbedBuilder.from(embed)
                .setColor(0x5865F2)
                .setFooter({ text: 'Esta partida ha expirado' });

            mensaje.edit({ 
                embeds: [embedFinal], 
                components: [] 
            }).catch(() => {});
        });
    }
};
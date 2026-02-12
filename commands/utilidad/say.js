const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Haz que el bot diga algo')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('El mensaje que quieres que el bot envíe')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde enviar el mensaje (opcional)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('embed')
                .setDescription('Enviar como embed (por defecto: false)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color del embed (hex, ej: #ff0000)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const mensaje = interaction.options.getString('mensaje');
        const canal = interaction.options.getChannel('canal') || interaction.channel;
        const usarEmbed = interaction.options.getBoolean('embed') || false;
        const colorHex = interaction.options.getString('color');

        // Verificar permisos en el canal destino
        if (canal.id !== interaction.channel.id) {
            const permissions = canal.permissionsFor(interaction.client.user);
            if (!permissions.has('SendMessages')) {
                return interaction.reply({
                    content: `❌ No tengo permisos para enviar mensajes en ${canal}.`,
                    flags: 64
                });
            }
        }

        // Filtrar menciones no permitidas (evitar @everyone/@here abuse)
        let mensajeFiltrado = mensaje;
        if (!interaction.member.permissions.has(PermissionFlagsBits.MentionEveryone)) {
            mensajeFiltrado = mensaje.replace(/@(everyone|here)/gi, '@\u200b$1');
        }

        try {
            if (usarEmbed) {
                // Parsear color
                let color = 0x0099ff; // Color por defecto
                if (colorHex) {
                    const hexMatch = colorHex.match(/^#?([0-9A-F]{6})$/i);
                    if (hexMatch) {
                        color = parseInt(hexMatch[1], 16);
                    }
                }

                const embed = new EmbedBuilder()
                    .setDescription(mensajeFiltrado)
                    .setColor(color)
                    .setFooter({ text: `Enviado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await canal.send({ embeds: [embed] });
            } else {
                await canal.send({
                    content: mensajeFiltrado,
                    allowedMentions: {
                        parse: interaction.member.permissions.has(PermissionFlagsBits.MentionEveryone) 
                            ? ['everyone', 'roles', 'users'] 
                            : ['roles', 'users']
                    }
                });
            }

            // Respuesta de confirmación
            const confirmEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Mensaje enviado')
                .setDescription(`El mensaje fue enviado en ${canal}`)
                .addFields(
                    { name: '📝 Contenido', value: mensajeFiltrado.substring(0, 1024) },
                    { name: '📊 Formato', value: usarEmbed ? 'Embed' : 'Texto normal', inline: true },
                    { name: '📍 Canal', value: `${canal}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [confirmEmbed], flags: 64 });
        } catch (error) {
            console.error('Error en comando say:', error);
            await interaction.reply({
                content: '❌ Hubo un error al enviar el mensaje.',
                flags: 64
            });
        }
    }
};
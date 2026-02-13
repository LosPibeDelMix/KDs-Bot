const { Events, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // ═══════════════════════════════════════════════════════════
        // MANEJAR AUTOCOMPLETE
        // ═══════════════════════════════════════════════════════════
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`❌ Error en autocomplete (${interaction.commandName}):`, error);
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // MANEJAR BOTONES
        // ═══════════════════════════════════════════════════════════
        if (interaction.isButton()) {
            if (interaction.customId === 'help_refresh') {
                try {
                    const commands = interaction.client.commands;
                    const commandsPath = path.join(__dirname, '../commands');
                    const categorias = {};

                    const categoryEmojis = {
                        'entretenimiento': '🎲',
                        'diversion': '🎲',
                        'moderacion': '🛡️',
                        'utilidad': '⚙️',
                        'economia': '💰',
                        'musica': '🎵',
                        'admin': '👑',
                        'info': 'ℹ️',
                        'configuracion': '⚙️',
                        'juegos': '🎮',
                        'nivel': '📊',
                        'tickets': '🎫',
                        'herramientas': '🔧',
                        'sin_categoria': '📁'
                    };

                    const folders = fs.readdirSync(commandsPath);
                    for (const folder of folders) {
                        const folderPath = path.join(commandsPath, folder);
                        if (!fs.statSync(folderPath).isDirectory()) continue;

                        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                        if (commandFiles.length > 0) {
                            categorias[folder] = commandFiles.map(file => {
                                const commandName = file.replace('.js', '');
                                const command = commands.get(commandName);
                                return command ? {
                                    name: command.data.name,
                                    description: command.data.description
                                } : null;
                            }).filter(cmd => cmd !== null);
                        }
                    }

                    const totalCommands = commands.size;
                    const mainEmbed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setAuthor({ 
                            name: `${interaction.client.user.username} - Panel de Ayuda`,
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setDescription(`📚 **Total de comandos:** \`${totalCommands}\`\n\nSelecciona una categoría del menú desplegable para ver los comandos disponibles.`)
                        .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
                        .setFooter({ 
                            text: `Actualizado • Solicitado por ${interaction.user.tag}`, 
                            iconURL: interaction.user.displayAvatarURL() 
                        })
                        .setTimestamp();

                    let categoriesPreview = '';
                    for (const [categoria, cmds] of Object.entries(categorias)) {
                        const emoji = categoryEmojis[categoria.toLowerCase()] || '📁';
                        const categoryName = categoria.charAt(0).toUpperCase() + categoria.slice(1);
                        categoriesPreview += `${emoji} **${categoryName}** - \`${cmds.length} comandos\`\n`;
                    }

                    mainEmbed.addFields({ 
                        name: '📂 Categorías Disponibles', 
                        value: categoriesPreview || 'No hay categorías', 
                        inline: false 
                    });

                    await interaction.update({ embeds: [mainEmbed] });
                } catch (error) {
                    console.error('❌ Error al actualizar help:', error);
                }
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // MANEJAR SELECT MENUS
        // ═══════════════════════════════════════════════════════════
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'help_category_select') {
                try {
                    const categoria = interaction.values[0];
                    const commands = interaction.client.commands;

                    const categoryEmojis = {
                        'entretenimiento': '🎲',
                        'diversion': '🎲',
                        'moderacion': '🛡️',
                        'utilidad': '⚙️',
                        'economia': '💰',
                        'musica': '🎵',
                        'admin': '👑',
                        'info': 'ℹ️',
                        'configuracion': '⚙️',
                        'juegos': '🎮',
                        'nivel': '📊',
                        'tickets': '🎫',
                        'herramientas': '🔧',
                        'sin_categoria': '📁'
                    };

                    if (categoria === 'all') {
                        const commandsPath = path.join(__dirname, '../commands');
                        const allCommands = [];

                        const folders = fs.readdirSync(commandsPath);
                        for (const folder of folders) {
                            const folderPath = path.join(commandsPath, folder);
                            if (!fs.statSync(folderPath).isDirectory()) continue;

                            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                            for (const file of commandFiles) {
                                const commandName = file.replace('.js', '');
                                const command = commands.get(commandName);
                                if (command) {
                                    allCommands.push(`\`/${command.data.name}\` - ${command.data.description}`);
                                }
                            }
                        }

                        const embed = new EmbedBuilder()
                            .setColor(0x0099ff)
                            .setTitle('📜 Todos los Comandos')
                            .setDescription(allCommands.join('\n') || 'No hay comandos disponibles')
                            .setFooter({ 
                                text: `Total: ${allCommands.length} comandos`, 
                                iconURL: interaction.client.user.displayAvatarURL() 
                            })
                            .setTimestamp();

                        await interaction.update({ embeds: [embed] });
                        return;
                    }

                    const commandsPath = path.join(__dirname, '../commands', categoria);
                    
                    if (!fs.existsSync(commandsPath)) {
                        return interaction.update({ 
                            content: '❌ Categoría no encontrada.', 
                            embeds: [], 
                            components: [] 
                        });
                    }

                    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                    const commandList = [];

                    for (const file of commandFiles) {
                        const commandName = file.replace('.js', '');
                        const command = commands.get(commandName);
                        if (command) {
                            commandList.push({
                                name: `/${command.data.name}`,
                                value: command.data.description || 'Sin descripción',
                                inline: false
                            });
                        }
                    }

                    const emoji = categoryEmojis[categoria.toLowerCase()] || '📁';
                    const categoryName = categoria.charAt(0).toUpperCase() + categoria.slice(1);

                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle(`${emoji} Comandos de ${categoryName}`)
                        .setDescription(`Comandos disponibles en la categoría **${categoryName}**.\n\nUsa \`/help [comando]\` para más información.`)
                        .addFields(commandList.length > 0 ? commandList : [{ 
                            name: 'Sin comandos', 
                            value: 'No hay comandos en esta categoría', 
                            inline: false 
                        }])
                        .setFooter({ 
                            text: `${commandList.length} comandos • ${interaction.user.tag}`, 
                            iconURL: interaction.user.displayAvatarURL() 
                        })
                        .setTimestamp();

                    await interaction.update({ embeds: [embed] });
                } catch (error) {
                    console.error('❌ Error en select menu:', error);
                }
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // MANEJAR COMANDOS SLASH
        // ═══════════════════════════════════════════════════════════
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ Comando no encontrado: ${interaction.commandName}`);
            return;
        }

        // Sistema de cooldowns
        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({
                    content: `⏱️ Espera <t:${expiredTimestamp}:R> antes de usar \`/${command.data.name}\` de nuevo.`,
                    flags: 64
                }).catch(() => {}); // Ignorar si falla
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Ejecutar comando
        try {
            // ⚡ RESPUESTA RÁPIDA - Defer INMEDIATAMENTE si el comando lo requiere
            if (command.defer) {
                await interaction.deferReply({ flags: command.ephemeral ? 64 : 0 });
            }

            await command.execute(interaction);
            
            console.log(`📝 ${interaction.user.tag} usó /${command.data.name}`);
        } catch (error) {
            console.error(`❌ Error ejecutando ${interaction.commandName}:`, error);
            
            const errorMessage = {
                content: '❌ Hubo un error al ejecutar este comando.',
                flags: 64
            };

            try {
                if (interaction.deferred) {
                    await interaction.editReply(errorMessage);
                } else if (interaction.replied) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (followUpError) {
                // Ignorar errores de respuesta
            }
        }
    },
};
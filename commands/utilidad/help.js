const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra todos los comandos disponibles')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Buscar información de un comando específico')
                .setRequired(false)
                .setAutocomplete(true)),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const commands = interaction.client.commands;
        
        const choices = Array.from(commands.values())
            .map(cmd => ({ name: cmd.data.name, value: cmd.data.name }))
            .filter(choice => choice.name.toLowerCase().includes(focusedValue))
            .slice(0, 25);

        await interaction.respond(choices);
    },

    async execute(interaction) {
        const comandoEspecifico = interaction.options.getString('comando');

        // Si se especificó un comando, mostrar info detallada
        if (comandoEspecifico) {
            const command = interaction.client.commands.get(comandoEspecifico);
            
            if (!command) {
                return interaction.reply({ 
                    content: `❌ No se encontró el comando \`${comandoEspecifico}\`.`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`📖 Información: /${command.data.name}`)
                .setDescription(command.data.description || 'Sin descripción')
                .setTimestamp();

            if (command.data.options && command.data.options.length > 0) {
                const options = command.data.options.map(opt => {
                    const required = opt.required ? '`[Requerido]`' : '`[Opcional]`';
                    return `**${opt.name}** ${required}\n└ ${opt.description}`;
                }).join('\n\n');

                embed.addFields({ name: '⚙️ Opciones', value: options, inline: false });
            }

            if (command.cooldown) {
                embed.addFields({ 
                    name: '⏱️ Cooldown', 
                    value: `${command.cooldown} segundos`, 
                    inline: true 
                });
            }

            return interaction.reply({ embeds: [embed] });
        }

        // ═══════════════════════════════════════════════════════════
        // CARGAR CATEGORÍAS DE FORMA OPTIMIZADA
        // ═══════════════════════════════════════════════════════════

        const commands = interaction.client.commands;
        const categorias = {};

        // Organizar comandos por categoría directamente desde la collection
        for (const [name, command] of commands) {
            // Buscar en qué carpeta está el comando
            const fs = require('fs');
            const path = require('path');
            const commandsPath = path.join(__dirname, '../../commands');
            
            let categoria = 'sin_categoria';
            
            try {
                const folders = fs.readdirSync(commandsPath);
                for (const folder of folders) {
                    const folderPath = path.join(commandsPath, folder);
                    if (!fs.statSync(folderPath).isDirectory()) continue;
                    
                    const files = fs.readdirSync(folderPath);
                    if (files.includes(`${name}.js`)) {
                        categoria = folder;
                        break;
                    }
                }
            } catch (error) {
                console.error('Error detectando categoría:', error);
            }

            if (!categorias[categoria]) categorias[categoria] = [];
            categorias[categoria].push({
                name: command.data.name,
                description: command.data.description
            });
        }

        // Emojis por categoría
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

        const totalCommands = commands.size;
        const mainEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setAuthor({ 
                name: `${interaction.client.user.username} - Panel de Ayuda`,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setDescription(`📚 **Total de comandos:** \`${totalCommands}\`\n\nSelecciona una categoría del menú desplegable para ver los comandos disponibles, o usa \`/help [comando]\` para información detallada.`)
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ 
                text: `Solicitado por ${interaction.user.tag}`, 
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

        // Crear menú de selección
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder('🔍 Selecciona una categoría');

        for (const [categoria, cmds] of Object.entries(categorias)) {
            if (cmds.length === 0) continue;

            const emoji = categoryEmojis[categoria.toLowerCase()] || '📁';
            const categoryName = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            
            selectMenu.addOptions({
                label: categoryName,
                description: `${cmds.length} comandos disponibles`,
                value: categoria,
                emoji: emoji
            });
        }

        selectMenu.addOptions({
            label: 'Ver Todos los Comandos',
            description: `Muestra los ${totalCommands} comandos`,
            value: 'all',
            emoji: '📜'
        });

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invítame')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`)
                    .setEmoji('➕'),
                new ButtonBuilder()
                    .setLabel('Servidor de Soporte')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/kbZzYcPEtt')
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setCustomId('help_refresh')
                    .setLabel('Actualizar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            );

        await interaction.reply({ 
            embeds: [mainEmbed], 
            components: [row, buttonRow] 
        });
    },
};
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Crear directorio de datos si no existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const warnsFile = path.join(dataDir, 'warns.json');

// Cargar warns
function loadWarns() {
    if (!fs.existsSync(warnsFile)) {
        fs.writeFileSync(warnsFile, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
}

// Guardar warns
function saveWarns(warns) {
    fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Gestiona advertencias de usuarios')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Añade una advertencia a un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario a advertir')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('razon')
                        .setDescription('Razón de la advertencia')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lista las advertencias de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario a consultar')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Elimina la última advertencia de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Elimina todas las advertencias de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario');
        const warns = loadWarns();

        const guildId = interaction.guild.id;
        const userId = target.id;

        if (!warns[guildId]) warns[guildId] = {};
        if (!warns[guildId][userId]) warns[guildId][userId] = [];

        if (subcommand === 'add') {
            const razon = interaction.options.getString('razon');
            
            const warn = {
                razon,
                moderador: interaction.user.tag,
                fecha: Date.now()
            };

            warns[guildId][userId].push(warn);
            saveWarns(warns);

            const totalWarns = warns[guildId][userId].length;

            const embed = new EmbedBuilder()
                .setColor(0xff9900)
                .setTitle('⚠️ Usuario Advertido')
                .addFields(
                    { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: false },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: false },
                    { name: '📝 Razón', value: razon, inline: false },
                    { name: '📊 Total de Advertencias', value: `${totalWarns}`, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'list') {
            const userWarns = warns[guildId][userId];

            if (userWarns.length === 0) {
                return interaction.reply({ content: `✅ ${target.tag} no tiene advertencias.`, flags: 64 });
            }

            const embed = new EmbedBuilder()
                .setColor(0xff9900)
                .setTitle(`⚠️ Advertencias de ${target.tag}`)
                .setDescription(`Total: **${userWarns.length}** advertencias`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            userWarns.forEach((warn, index) => {
                embed.addFields({
                    name: `#${index + 1} - ${warn.moderador}`,
                    value: `**Razón:** ${warn.razon}\n**Fecha:** <t:${Math.floor(warn.fecha / 1000)}:F>`,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'remove') {
            if (warns[guildId][userId].length === 0) {
                return interaction.reply({ content: `❌ ${target.tag} no tiene advertencias.`, flags: 64 });
            }

            warns[guildId][userId].pop();
            saveWarns(warns);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Advertencia Eliminada')
                .setDescription(`Se eliminó la última advertencia de ${target.tag}.\nAdvertencias restantes: **${warns[guildId][userId].length}**`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'clear') {
            if (warns[guildId][userId].length === 0) {
                return interaction.reply({ content: `❌ ${target.tag} no tiene advertencias.`, flags: 64 });
            }

            const count = warns[guildId][userId].length;
            warns[guildId][userId] = [];
            saveWarns(warns);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Advertencias Limpiadas')
                .setDescription(`Se eliminaron **${count}** advertencias de ${target.tag}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};
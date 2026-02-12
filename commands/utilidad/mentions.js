const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mentions')
        .setDescription('Envía un mensaje con menciones masivas')
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Menciona a todos los miembros de un rol')
                .addRoleOption(option =>
                    option.setName('rol')
                        .setDescription('El rol a mencionar')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('mensaje')
                        .setDescription('Mensaje a enviar (opcional)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar (opcional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('everyone')
                .setDescription('Menciona a @everyone')
                .addStringOption(option =>
                    option.setName('mensaje')
                        .setDescription('Mensaje a enviar')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar (opcional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('here')
                .setDescription('Menciona a @here')
                .addStringOption(option =>
                    option.setName('mensaje')
                        .setDescription('Mensaje a enviar')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar (opcional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('users')
                .setDescription('Menciona múltiples usuarios')
                .addUserOption(option =>
                    option.setName('usuario1')
                        .setDescription('Primer usuario')
                        .setRequired(true))
                .addUserOption(option =>
                    option.setName('usuario2')
                        .setDescription('Segundo usuario')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('usuario3')
                        .setDescription('Tercer usuario')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('usuario4')
                        .setDescription('Cuarto usuario')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('usuario5')
                        .setDescription('Quinto usuario')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('mensaje')
                        .setDescription('Mensaje a enviar (opcional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lista todas las menciones del servidor')
                .addStringOption(option =>
                    option.setName('tipo')
                        .setDescription('Tipo de menciones a listar')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Roles mencionables', value: 'roles' },
                            { name: 'Todos los roles', value: 'all_roles' },
                            { name: 'Usuarios online', value: 'online' }
                        )))
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            return handleList(interaction);
        }

        // Verificar permisos
        if (!interaction.member.permissions.has(PermissionFlagsBits.MentionEveryone)) {
            return interaction.reply({
                content: '❌ Necesitas el permiso "Mencionar @everyone, @here y Todos los roles" para usar este comando.',
                flags: 64
            });
        }

        const canal = interaction.options.getChannel('canal') || interaction.channel;
        const mensaje = interaction.options.getString('mensaje') || '';

        // Verificar permisos en el canal destino
        if (canal.id !== interaction.channel.id) {
            const permissions = canal.permissionsFor(interaction.client.user);
            if (!permissions.has('SendMessages') || !permissions.has('MentionEveryone')) {
                return interaction.reply({
                    content: `❌ No tengo los permisos necesarios en ${canal}.`,
                    flags: 64
                });
            }
        }

        await interaction.deferReply({ flags: 64 });

        try {
            let content = '';
            let menciones = [];

            if (subcommand === 'role') {
                const rol = interaction.options.getRole('rol');
                
                if (!rol.mentionable && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.editReply({
                        content: '❌ Este rol no es mencionable.'
                    });
                }

                content = `${rol} ${mensaje}`;
                menciones = [`Rol: ${rol.name} (${rol.members.size} miembros)`];
            } 
            else if (subcommand === 'everyone') {
                content = `@everyone ${mensaje}`;
                menciones = [`@everyone (${interaction.guild.memberCount} miembros)`];
            } 
            else if (subcommand === 'here') {
                content = `@here ${mensaje}`;
                const onlineMembers = interaction.guild.members.cache.filter(m => 
                    m.presence?.status === 'online' || 
                    m.presence?.status === 'idle' || 
                    m.presence?.status === 'dnd'
                ).size;
                menciones = [`@here (${onlineMembers} miembros online)`];
            } 
            else if (subcommand === 'users') {
                const usuarios = [];
                for (let i = 1; i <= 5; i++) {
                    const user = interaction.options.getUser(`usuario${i}`);
                    if (user) usuarios.push(user);
                }

                if (usuarios.length === 0) {
                    return interaction.editReply({
                        content: '❌ Debes seleccionar al menos un usuario.'
                    });
                }

                content = `${usuarios.map(u => u.toString()).join(' ')} ${mensaje}`;
                menciones = usuarios.map(u => `${u.tag}`);
            }

            await canal.send({
                content: content,
                allowedMentions: { parse: ['everyone', 'roles', 'users'] }
            });

            const confirmEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Menciones enviadas')
                .setDescription(`Se enviaron las menciones en ${canal}`)
                .addFields(
                    { name: '👥 Mencionados', value: menciones.join('\n'), inline: false },
                    { name: '📝 Mensaje', value: mensaje || 'Sin mensaje adicional', inline: false },
                    { name: '📍 Canal', value: `${canal}`, inline: true },
                    { name: '👤 Enviado por', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });
        } catch (error) {
            console.error('Error en comando mentions:', error);
            await interaction.editReply({
                content: '❌ Hubo un error al enviar las menciones.'
            });
        }
    }
};

async function handleList(interaction) {
    const tipo = interaction.options.getString('tipo') || 'roles';

    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📋 Lista de Menciones')
        .setTimestamp();

    if (tipo === 'roles' || tipo === 'all_roles') {
        const roles = interaction.guild.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position);

        const rolesFiltered = tipo === 'roles' 
            ? roles.filter(role => role.mentionable)
            : roles;

        if (rolesFiltered.size === 0) {
            embed.setDescription('❌ No hay roles mencionables en este servidor.');
        } else {
            const rolesList = rolesFiltered
                .map(role => `${role} - \`${role.members.size} miembros\` ${role.mentionable ? '✅' : '❌'}`)
                .join('\n');

            // Dividir en chunks si es muy largo
            if (rolesList.length > 4096) {
                const chunks = rolesList.match(/.{1,4000}/g);
                embed.setDescription(chunks[0]);
                
                if (chunks.length > 1) {
                    embed.addFields({ 
                        name: 'Continúa...', 
                        value: `Hay ${rolesFiltered.size} roles en total. Algunos no se muestran por límite de caracteres.` 
                    });
                }
            } else {
                embed.setDescription(rolesList || 'No hay roles.');
            }

            embed.setFooter({ text: `Total: ${rolesFiltered.size} roles | ✅ = Mencionable` });
        }
    } 
    else if (tipo === 'online') {
        await interaction.guild.members.fetch();
        
        const onlineMembers = interaction.guild.members.cache.filter(member => 
            member.presence?.status === 'online' || 
            member.presence?.status === 'idle' || 
            member.presence?.status === 'dnd'
        );

        if (onlineMembers.size === 0) {
            embed.setDescription('❌ No hay usuarios online en este momento.');
        } else {
            const statusEmojis = {
                online: '🟢',
                idle: '🟡',
                dnd: '🔴'
            };

            const usersList = onlineMembers
                .first(20)
                .map(member => `${statusEmojis[member.presence?.status] || '⚪'} ${member.user.tag}`)
                .join('\n');

            embed.setDescription(usersList);
            embed.setFooter({ text: `${onlineMembers.size} usuarios online | Mostrando los primeros 20` });
        }
    }

    await interaction.editReply({ embeds: [embed] });
}
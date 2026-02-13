const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scanner')
        .setDescription('Información sobre el escáner de verificación de jugadores'),
    
    async execute(interaction) {
        // Crear el embed con información detallada
        const embed = new EmbedBuilder()
            .setTitle('🔍 Scanner de Jugadores')
            .setDescription('Herramienta profesional para verificar la legitimidad de jugadores')
            .setColor('#0099ff')
            .addFields(
                {
                    name: '📋 ¿Qué es?',
                    value: 'El Scanner es una herramienta avanzada que analiza el comportamiento y estadísticas de jugadores para detectar posibles trampas o cuentas fraudulentas.',
                    inline: false
                },
                {
                    name: '✨ Características principales',
                    value: '• Análisis de estadísticas en tiempo real\n' +
                           '• Detección de patrones sospechosos\n' +
                           '• Verificación de legitimidad de cuentas\n' +
                           '• Historial de jugadores\n' +
                           '• Reportes detallados',
                    inline: false
                },
                {
                    name: '🎯 ¿Para qué sirve?',
                    value: 'Permite a administradores y moderadores verificar si un jugador está usando herramientas externas, cheats o si su cuenta es legítima basándose en análisis de datos y comportamiento.',
                    inline: false
                },
                {
                    name: '💻 Requisitos',
                    value: '• Windows 10/11\n• Conexión a Internet\n• Permisos de administrador',
                    inline: true
                },
                {
                    name: '📥 Instalación',
                    value: '1. Descarga el programa\n2. Ejecuta como administrador\n3. Sigue las instrucciones',
                    inline: true
                }
            )
            .setFooter({ text: '⚠️ Usa esta herramienta de forma responsable y ética' })
            .setTimestamp();

        // Enviar el embed
        await interaction.reply({ embeds: [embed] });

        // Enviar el link de descarga en un mensaje de seguimiento
        const downloadMessage = 
            '**📥 Descarga el Scanner aquí:**\n' +
            '🔗 https://fungun.top/ecd/\n\n' +
            '*Asegúrate de descargar desde el link oficial para garantizar la seguridad del programa.*';

        await interaction.followUp(downloadMessage);
    },
};
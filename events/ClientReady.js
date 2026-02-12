const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot conectado como ${client.user.tag}`);
        console.log(`📊 Servidores: ${client.guilds.cache.size}`);
        
        // 🔥 NO BLOQUEAR - Cargar miembros en segundo plano
        setTimeout(async () => {
            console.log('⏳ Cargando miembros en segundo plano...');
            
            for (const guild of client.guilds.cache.values()) {
                try {
                    await guild.members.fetch();
                } catch (error) {
                    console.error(`❌ Error cargando ${guild.name}`);
                }
            }
            
            console.log('✅ Miembros cargados');
        }, 2000); // Esperar 2 segundos antes de cargar
        
        // Función de estadísticas SIN llamar a members.cache hasta que estén cargados
        const getStats = () => {
            const totalGuilds = client.guilds.cache.size;
            const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalChannels = client.channels.cache.size;
            
            return { totalGuilds, totalUsers, totalChannels };
        };

        const getActivities = () => {
            const stats = getStats();
            
            return [
                { name: '/help para comandos', type: ActivityType.Playing },
                { name: `${stats.totalGuilds} servidores`, type: ActivityType.Watching },
                { name: `${stats.totalUsers} miembros`, type: ActivityType.Listening },
                { name: `${stats.totalChannels} canales`, type: ActivityType.Watching },
            ];
        };

        let currentActivity = 0;
        let cachedActivities = getActivities();

        const updateActivity = () => {
            const activity = cachedActivities[currentActivity];
            
            client.user.setPresence({
                activities: [activity],
                status: 'online',
            });

            currentActivity = (currentActivity + 1) % cachedActivities.length;
        };

        updateActivity();
        setInterval(updateActivity, 15000);
        
        // Actualizar cache cada 5 minutos
        setInterval(() => {
            cachedActivities = getActivities();
        }, 5 * 60 * 1000);
        
        console.log('🔄 Sistema optimizado iniciado');
    },
};
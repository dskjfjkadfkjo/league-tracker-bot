const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    console.log('✅ Bot is ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong! 🏓');
    }
});

const token = process.env.TOKEN;
if (!token) {
    console.error('❌ ERROR: TOKEN environment variable is not set!');
    process.exit(1);
}

client.login(token);

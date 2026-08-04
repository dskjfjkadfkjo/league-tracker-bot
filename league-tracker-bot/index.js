const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const { fetchLeagueData } = require('./utils/api');
const Tracker = require('./utils/tracker');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// Initialize tracker
const tracker = new Tracker();
let currentLeague = 'Top1';
let trackedChannelId = null;

// Load commands
client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Update league status
async function updateLeagueStatus() {
    try {
        const leagueData = await fetchLeagueData(currentLeague);
        if (!leagueData) return;

        tracker.updateLeague(leagueData);

        if (trackedChannelId) {
            const channel = client.channels.cache.get(trackedChannelId);
            if (channel) {
                const embed = createLeagueEmbed(leagueData);
                await channel.send({ embeds: [embed] });
            }
        }

        client.user.setActivity(`League: ${leagueData.Name || currentLeague}`, { 
            type: ActivityType.Watching 
        });

    } catch (error) {
        console.error('Error updating league status:', error);
    }
}

// Create league embed
function createLeagueEmbed(leagueData) {
    const embed = new EmbedBuilder()
        .setTitle(`🏆 ${leagueData.Name || currentLeague} League`)
        .setColor('#FFD700')
        .setTimestamp();

    if (leagueData.Ranks && leagueData.Ranks.length > 0) {
        let topPlayers = '';
        const topTen = leagueData.Ranks.slice(0, 10);
        topTen.forEach((player, index) => {
            topPlayers += `**#${index + 1}** ${player.Username || 'Unknown'} - ${player.Points || 0} points\n`;
        });
        embed.addFields({ name: '🏅 Top 10 Players', value: topPlayers || 'No data available', inline: false });
    }

    const trackingInfo = tracker.getTrackingInfo();
    if (trackingInfo) {
        embed.addFields(
            { name: '📊 Hourly Points', value: `${trackingInfo.hourlyPoints || 0} pts/hour`, inline: true },
            { name: '⏰ Last Update', value: `<t:${Math.floor(trackingInfo.lastUpdate / 1000)}:R>`, inline: true }
        );
    }

    if (leagueData.Ranks && leagueData.Ranks.length > 0) {
        const enemies = leagueData.Ranks.slice(0, 10);
        let enemyList = '';
        enemies.forEach((enemy, index) => {
            enemyList += `**${index + 1}.** ${enemy.Username || 'Unknown'} - ${enemy.Points || 0} pts\n`;
        });
        embed.addFields({ name: '👾 10 Enemies Above', value: enemyList || 'No enemies', inline: false });
    }

    return embed;
}

// Slash command handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, tracker, currentLeague, trackedChannelId, (channelId) => {
            trackedChannelId = channelId;
        }, (newLeague) => {
            currentLeague = newLeague;
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'There was an error executing this command!', 
            ephemeral: true 
        });
    }
});

// Client ready event
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    
    const commands = [];
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }
    
    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }

    cron.schedule('* * * * *', async () => {
        console.log('⏰ Updating league status...');
        await updateLeagueStatus();
    });

    await updateLeagueStatus();
    console.log('✅ Bot is ready!');
});

const token = process.env.TOKEN;
if (!token) {
    console.error('❌ ERROR: TOKEN environment variable is not set!');
    process.exit(1);
}

client.login(token);

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection:', error);
});

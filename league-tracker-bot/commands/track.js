const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchLeagueData } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Track a specific league')
        .addStringOption(option =>
            option.setName('league')
                .setDescription('The league ID to track (e.g., Top1, Top2, etc.)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send updates to (default: current channel)')
                .setRequired(false)),

    async execute(interaction, tracker, currentLeague, trackedChannelId, setTrackedChannel, setCurrentLeague) {
        const leagueId = interaction.options.getString('league');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        await interaction.deferReply();

        try {
            const leagueData = await fetchLeagueData(leagueId);
            if (!leagueData) {
                return interaction.editReply(`❌ League "${leagueId}" not found!`);
            }

            setCurrentLeague(leagueId);
            setTrackedChannel(channel.id);
            tracker.updateLeague(leagueData);

            const embed = new EmbedBuilder()
                .setTitle('✅ League Tracking Started')
                .setDescription(`Now tracking **${leagueData.Name || leagueId}** League`)
                .addFields(
                    { name: '📊 League ID', value: leagueId, inline: true },
                    { name: '📢 Updates Channel', value: `<#${channel.id}>`, inline: true },
                    { name: '⏰ Update Interval', value: 'Every 1 minute', inline: true }
                )
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Track command error:', error);
            await interaction.editReply('❌ Error tracking league. Please try again.');
        }
    }
};
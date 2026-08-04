class Tracker {
    constructor() {
        this.leagueData = null;
        this.history = [];
        this.lastUpdate = null;
        this.hourlyPoints = 0;
        this.pointsHistory = [];
    }

    updateLeague(data) {
        const now = Date.now();
        const previousData = this.leagueData;
        
        if (previousData && this.lastUpdate) {
            const timeDiff = (now - this.lastUpdate) / (1000 * 60 * 60);
            if (timeDiff > 0) {
                const pointsDiff = (data.TotalPoints || 0) - (previousData.TotalPoints || 0);
                this.hourlyPoints = Math.round(pointsDiff / timeDiff);
            }
        }

        this.leagueData = data;
        this.lastUpdate = now;
        this.pointsHistory.push({
            points: data.TotalPoints || 0,
            timestamp: now
        });

        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        this.pointsHistory = this.pointsHistory.filter(h => h.timestamp > oneDayAgo);

        return this;
    }

    getTrackingInfo() {
        if (!this.leagueData) return null;

        return {
            leagueName: this.leagueData.Name || 'Unknown',
            totalPoints: this.leagueData.TotalPoints || 0,
            hourlyPoints: this.hourlyPoints,
            lastUpdate: this.lastUpdate,
            memberCount: this.leagueData.Ranks ? this.leagueData.Ranks.length : 0,
            history: this.pointsHistory
        };
    }

    getEnemyRankings(limit = 10) {
        if (!this.leagueData || !this.leagueData.Ranks) return [];

        return this.leagueData.Ranks
            .slice(0, limit)
            .map((player, index) => ({
                rank: index + 1,
                username: player.Username || 'Unknown',
                points: player.Points || 0
            }));
    }

    getAverageHourlyPoints() {
        if (this.pointsHistory.length < 2) return 0;

        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentHistory = this.pointsHistory.filter(h => h.timestamp > oneHourAgo);

        if (recentHistory.length < 2) return this.hourlyPoints;

        const pointsDiff = recentHistory[recentHistory.length - 1].points - recentHistory[0].points;
        const timeDiff = (recentHistory[recentHistory.length - 1].timestamp - recentHistory[0].timestamp) / (1000 * 60 * 60);

        return timeDiff > 0 ? Math.round(pointsDiff / timeDiff) : 0;
    }
}

module.exports = Tracker;
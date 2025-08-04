import { useEffect, useState } from 'react';
import { Grid, Container, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { MetricCard } from './MetricCard';
import { TopPlayersTable } from './TopPlayersTable';
import { GameweekChart } from './GameweekChart';
import { fetchOverview, fetchTopPlayers, fetchGameWeeksData } from '../services/api';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScoreIcon from '@mui/icons-material/Score';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export const Dashboard = ({entryId} : {entryId: number}) => {
    const [overview, setOverview] = useState<any>(null);
    const [topPlayers, setTopPlayers] = useState<any[]>([]);
    const [gameweeks, setGameWeeks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const overviewData = await fetchOverview(entryId);
                const playersData = await fetchTopPlayers();
                const gameWeeksData = await fetchGameWeeksData(entryId);

                // Validate data before setting state
                if  (!overviewData || !playersData || !gameWeeksData) {
                    throw new Error('Invalid data received from API');
                }

                setOverview(overviewData);
                setTopPlayers(playersData);
                setGameWeeks(gameWeeksData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            }
            finally {
                setLoading(false);
            }

        };
        loadData();
    }, [entryId]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!overview) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">No data available</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Flashboard</Typography>
            <Typography variant="subtitle2" gutterBottom>Overview of your FPL performance</Typography>

            <Grid container spacing={2} mb={4}>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Overall Rank"
                        value={overview.overall_rank.toLocaleString()}
                        change={10}
                        icon={<EmojiEventsIcon />}
                    />
                </Grid>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Points Scored"
                        value={overview.overall_points.toLocaleString()}
                        change={5}
                        icon={<ScoreIcon />}
                    />
                </Grid>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Team Value"
                        value={`£${overview.team_value/10}m`}
                        change={2}
                        icon={<AttachMoneyIcon />}
                    />
                </Grid>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Gameweek Points"
                        value={overview.gameweek_points}
                        change={-3}
                        icon={<ShowChartIcon />}
                    />
                </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Points Over Time</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
                <GameweekChart gameweeks={gameweeks.map(gw => ({
                    gameweek: gw.gameweek.toString(),
                    points: gw.points,

                }))}/>
            </Paper>

            <Typography variant="h6" gutterBottom>Top Performing Players</Typography>
            <TopPlayersTable players={topPlayers} />
        </Container>
    );
};
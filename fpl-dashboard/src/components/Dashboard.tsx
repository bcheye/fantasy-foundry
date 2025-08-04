import { useEffect, useState } from 'react';
import {
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Box, Divider // Added Box for flexible container
} from '@mui/material';
import { MetricCard } from './MetricCard';
import { TopPlayersTable } from './TopPlayersTable';
import { GameweekChart } from './GameweekChart';
import { fetchOverview, fetchTopPlayers, fetchGameWeeksData } from '../services/api';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScoreIcon from '@mui/icons-material/Score';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';


interface DashboardProps {
    entryId: number;
    userName: string | null;
}

export const Dashboard = ({ entryId ,userName}: DashboardProps) => {
    const [overview, setOverview] = useState<any>(null);
    const [topPlayers, setTopPlayers] = useState<any[]>([]);
    const [gameweeks, setGameWeeks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const overviewData = await fetchOverview(entryId);
                const playersData = await fetchTopPlayers();
                const gameWeeksData = await fetchGameWeeksData(entryId);

                // Validate data before setting state
                if (!overviewData || !playersData || !gameWeeksData) {
                    throw new Error('Invalid data received from API');
                }

                setOverview(overviewData);
                setTopPlayers(playersData);
                setGameWeeks(gameWeeksData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [entryId]);

    // Use Box instead of Container, as PageContainer from @toolpad/core
    // will provide the outer container and padding.
    // The py: 4 is already handled by PageContainer by default.
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '200px', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 2 }}> {/* Small vertical padding */}
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!overview) {
        return (
            <Box sx={{ py: 2 }}> {/* Small vertical padding */}
                <Alert severity="warning">No data available</Alert>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 5,
                    background: '#27362c',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: '#50d22c',
                        mb: 1,
                    }}
                >
                    Welcome back, {userName}! 👋
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.8)',
                    }}
                >
                    Gameweek {overview.gameweek} is live! Your team is ready to dominate.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid size={{xs:12, md:3}}>
                    <MetricCard
                        title="Overall Rank"
                        value={overview.overall_rank.toLocaleString()}
                        change={overview.rank_pct_change}
                        icon={<EmojiEventsIcon />}
                    />
                </Grid>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Points Scored"
                        value={overview.total_points.toLocaleString()}
                        change={overview.total_points_pct_change}
                        icon={<ScoreIcon />}
                    />
                </Grid>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Team Value"
                        value={`£${overview.team_value / 10}m`}
                        change={overview.team_value_pct_change}
                        icon={<AttachMoneyIcon />}
                    />
                </Grid>
                <Grid size={{xs: 12,md: 3}}>
                    <MetricCard
                        title="Gameweek Points"
                        value={overview.points}
                        change={overview.points_pct_change}
                        icon={<ShowChartIcon />}
                    />
                </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'text.primary' }}>Points Over Time</Typography>


            <Grid size={{xs:12}}>
                <Box
                    sx={{
                        p: 3,
                        borderRadius: 5,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
                        backgroundColor: '#27362c',
                        color: '#ccefdc'
                    }}
                >
                    <GameweekChart
                        gameweeks={gameweeks.map((gw) => ({
                            gameweek: gw.gameweek.toString(),
                            points: gw.points,
                        }))}
                    />
                </Box>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'text.primary' }}>Top Performing Players</Typography>
            <TopPlayersTable players={topPlayers} />
        </>
    );
};
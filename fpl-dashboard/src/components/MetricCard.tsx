import { Card, CardContent, Typography, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import '../App.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
}

export const MetricCard = ({ title, value, change, icon }: MetricCardProps) => {
    const isPositive = change >= 0;

    return (
        <Card className="metric-card" sx={{ minWidth: 100, borderRadius: 5 , backgroundColor: '#1c2b21', color: '#ccefdc',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',}}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {icon}
                    <Typography variant="h6">{title}</Typography>
                </Stack>
                <Typography variant="h4" gutterBottom>
                    {value}
                </Typography>
                <Typography
                    color={isPositive ? 'success.main' : 'error.main'}
                    display="flex"
                    alignItems="center"
                >
                    {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    {Math.abs(change)}%
                </Typography>
            </CardContent>
        </Card>
    );
};
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface GameweekChartProps {
    gameweeks: { gameweek: string; points: number }[];
}

export const GameweekChart = ({ gameweeks }: GameweekChartProps) => {
    const data = {
        labels: gameweeks.map((gw) => `GW${gw.gameweek}`),
        datasets: [
            {
                label: 'Points',
                data: gameweeks.map((gw) => gw.points),
                borderColor: '#00ff87',
                backgroundColor: 'rgba(0, 255, 135, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // remove vertical grid lines
                },
                ticks: {
                    color: '#ccefdc',
                },
            },
            y: {
                grid: {
                    display: false, // remove horizontal grid lines
                },
                ticks: {
                    color: '#ccefdc',
                },
            },
        },
    };

    return (
        <div
            style={{
                borderRadius: '5',
                overflow: 'hidden',
                backgroundColor: '#1c2b21',
                padding: '1rem',
            }}
        >
            <Line data={data} options={options} />
        </div>
    );
};
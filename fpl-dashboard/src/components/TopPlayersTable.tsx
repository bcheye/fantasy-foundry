import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';

interface Player {
    player_id: number;
    player_name: string;
    position: string;
    total_points: number;
    cost: number;
    team: string;
}

interface TopPlayersTableProps {
    players: Player[];
}

export const TopPlayersTable = ({ players }: TopPlayersTableProps) => {
    return (
        <TableContainer
            component={Paper}
            sx={{
                mt: 4,
                borderRadius: 3,
                backgroundColor: '#1c2b21',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        {['Player', 'Position', 'Points', 'Cost', 'Team'].map((header) => (
                            <TableCell
                                key={header}
                                sx={{
                                    fontWeight: 600,
                                    color: '#ccefdc',
                                    backgroundColor: '#132317',
                                    borderBottom: '1px solid #2f4f3d',
                                }}
                            >
                                {header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {players.map((player) => (
                        <TableRow
                            key={player.player_id}
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#263b2f',
                                },
                            }}
                        >
                            <TableCell sx={{ color: '#e6f4ea' }}>{player.player_name}</TableCell>
                            <TableCell sx={{ color: '#d2e6d2' }}>{player.position}</TableCell>
                            <TableCell sx={{ color: '#d2e6d2' }}>{player.total_points}</TableCell>
                            <TableCell sx={{ color: '#d2e6d2' }}>£{player.cost}m</TableCell>
                            <TableCell sx={{ color: '#d2e6d2' }}>{player.team}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
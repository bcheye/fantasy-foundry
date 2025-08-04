// import { Stack, IconButton, Typography } from '@mui/material';
// import GroupsIcon from '@mui/icons-material/Groups';
// import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
// import EqualizerIcon from '@mui/icons-material/Equalizer';
//
// export const NavigationIcons = () => {
//     return (
//         <Stack direction="row" spacing={4} justifyContent="center" mb={4}>
//             <Stack alignItems="center">
//                 <IconButton color="primary">
//                     <EqualizerIcon fontSize="large" />
//                 </IconButton>
//                 <Typography variant="caption">Team Planner</Typography>
//             </Stack>
//             <Stack alignItems="center">
//                 <IconButton color="primary">
//                     <GroupsIcon fontSize="large" />
//                 </IconButton>
//                 <Typography variant="caption">Mini-League Tracker</Typography>
//             </Stack>
//             <Stack alignItems="center">
//                 <IconButton color="primary">
//                     <SwapHorizIcon fontSize="large" />
//                 </IconButton>
//                 <Typography variant="caption">Transfers</Typography>
//             </Stack>
//         </Stack>
//     );
// };


import { Stack, IconButton, Typography, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import DashboardIcon from '@mui/icons-material/Dashboard';

export const NavigationIcons = () => {
    const navItems = [
        { label: 'Overview', icon: <DashboardIcon /> },
        { label: 'Team Planner', icon: <EqualizerIcon /> },
        { label: 'Mini-League Tracker', icon: <GroupsIcon /> },
        { label: 'Transfers', icon: <SwapHorizIcon /> },
    ];

    return (
        <Box
            sx={{
                width: 240,
                height: '100vh',
                backgroundColor: '#132317',
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            <Stack spacing={2}>
                {navItems.map((item, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{
                            backgroundColor: index === 0 ? '#1c2b21' : 'transparent',
                            borderRadius: 3,
                            paddingY: 1,
                            paddingX: 2,
                            color: index === 0 ? '#c0f8c0' : '#d2e6d2',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#1c2b21',
                            },
                        }}
                    >
                        <IconButton
                            sx={{
                                color: 'inherit',
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            {item.icon}
                        </IconButton>
                        <Typography variant="body2">{item.label}</Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
};
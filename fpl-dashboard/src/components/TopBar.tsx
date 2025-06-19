import {
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    Box,
    IconButton,
    Avatar,
    alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

export const TopBar = () => {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: '#132317',
                borderBottom: '1px solid #1c2b21',
                borderRadius: '0 0 16px 16px',
                px: 3,
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Left: App Name with Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsSoccerIcon sx={{ color: '#00ff87' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        FPL<span style={{ color: '#00ff87' }}>Analytics</span>
                    </Typography>
                </Box>

                {/* Right: Search, Bell, Avatar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: alpha('#1c2b21', 0.8),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            minWidth: 200,
                        }}
                    >
                        <SearchIcon fontSize="small" sx={{ color: '#9db99d', mr: 1 }} />
                        <InputBase
                            placeholder="Search"
                            sx={{ color: '#e6f4ea', fontSize: '0.9rem', width: '100%' }}
                        />
                    </Box>

                    <IconButton>
                        <NotificationsNoneIcon sx={{ color: '#d2e6d2' }} />
                    </IconButton>

                    <Avatar
                        alt="Brian"
                        src="https://i.pravatar.cc/150?img=13"
                        sx={{ width: 32, height: 32 }}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};
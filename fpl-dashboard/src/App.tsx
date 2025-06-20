import * as React from 'react';
import { CssBaseline, ThemeProvider, Box, TextField, InputAdornment, IconButton, Avatar } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, DashboardLayout, PageContainer, Router } from '@toolpad/core';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/auth/AuthModal';
import fplDarkTheme from './theme/fplDarkTheme';

// Import Material Icons for Navigation
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

// --- Define Navigation Items for AppProvider ---
const NAVIGATION = [
    {
        segment: 'overview',
        title: 'Overview',
        icon: <DashboardIcon />,
    },
    {
        segment: 'player-analysis',
        title: 'Player Analysis',
        icon: <PeopleIcon />,
    },
    {
        segment: 'team-planner',
        title: 'Team Planner',
        icon: <GroupIcon />,
    },
    {
        segment: 'mini-league-tracker',
        title: 'Mini-League Tracker',
        icon: <EmojiEventsIcon />,
    },
    {
        segment: 'transfers',
        title: 'Transfers',
        icon: <SwapHorizIcon />,
    },
];

// --- Custom Components for DashboardLayout Slots ---
function CustomToolbarSearch() {
    return (
        <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            sx={{
                width: '40%',
                minWidth: '200px',
                maxWidth: '400px',
                backgroundColor: 'transparent',
            }}
        />
    );
}

function CustomToolbarActions() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" size="large">
                <NotificationsNoneIcon />
            </IconButton>
            <IconButton color="inherit" size="large">
                <Avatar alt="User Avatar" src="/path/to/your/avatar.jpg" sx={{ width: 36, height: 36, border: '1px solid #4CAF50' }} />
            </IconButton>
        </Box>
    );
}

// --- Main App Component ---
export const App = () => {
    const [authModalOpen, setAuthModalOpen] = React.useState(true);
    const [entryId, setEntryId] = React.useState<number | null>(null);

    const handleAuthSuccess = (id: number) => {
        setEntryId(id);
        setAuthModalOpen(false);
    };

    const location = useLocation();
    const navigate = useNavigate();

    // Fix: Create a navigate wrapper to satisfy the Router type
    const toolpadNavigate: Router['navigate'] = React.useCallback((url: string | URL) => {
        // react-router-dom's navigate function expects a string or a Path object
        // It doesn't directly support URL objects.
        // Convert URL to string if necessary.
        const path = typeof url === 'string' ? url : url.pathname + url.search;
        navigate(path);
    }, [navigate]);


    const router = React.useMemo<Router>(() => { // Explicitly type router as Router
        return {
            pathname: location.pathname,
            searchParams: new URLSearchParams(location.search),
            navigate: toolpadNavigate, // Use the wrapped navigate function
        };
    }, [location, toolpadNavigate]); // Depend on location and toolpadNavigate

    return (
        <ThemeProvider theme={fplDarkTheme}>
            <CssBaseline />

            {entryId ? (
                <AppProvider
                    navigation={NAVIGATION}
                    router={router}
                    branding={{
                        title: 'FPL Analytics',
                        homeUrl: '/overview',
                    }}
                >
                    <DashboardLayout
                        slots={{
                            toolbarActions: () => (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CustomToolbarSearch />
                                    <CustomToolbarActions />
                                </Box>
                            ),
                        }}
                    >
                        {(() => {
                            const pathname = router.pathname;
                            
                            // Route to the appropriate component based on pathname
                            if (pathname === '/' || pathname === '/overview') {
                                return <PageContainer><Dashboard entryId={entryId} /></PageContainer>;
                            } else if (pathname === '/player-analysis') {
                                return <PageContainer><Box sx={{p:3}}><p>Player Analysis Content</p></Box></PageContainer>;
                            } else if (pathname === '/team-planner') {
                                return <PageContainer><Box sx={{p:3}}><p>Team Planner Content</p></Box></PageContainer>;
                            } else if (pathname === '/mini-league-tracker') {
                                return <PageContainer><Box sx={{p:3}}><p>Mini-League Tracker Content</p></Box></PageContainer>;
                            } else if (pathname === '/transfers') {
                                return <PageContainer><Box sx={{p:3}}><p>Transfers Content</p></Box></PageContainer>;
                            } else {
                                return <PageContainer><Box sx={{p:3}}><p>Page not found!</p></Box></PageContainer>;
                            }
                        })()}
                    </DashboardLayout>
                </AppProvider>
            ) : (
                <AuthModal
                    open={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
        </ThemeProvider>
    );
};

// This wrapper is no longer needed here if index.tsx handles BrowserRouter
// export default function RootApp() {
//     return (
//         <BrowserRouter>
//             <App />
//         </BrowserRouter>
//     );
// }
// Instead, just export App as default if that's how your index.tsx expects it.
export default App;
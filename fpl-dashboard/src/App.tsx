// src/App.tsx
import * as React from 'react';
import { CssBaseline, ThemeProvider, Box, TextField, InputAdornment, IconButton, Avatar } from '@mui/material';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import { AppProvider, DashboardLayout, PageContainer, Router } from '@toolpad/core';

import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/auth/AuthScreen';
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
function CustomToolbarActions() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    mr: 2
                }}
            />
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
    const [entryId, setEntryId] = React.useState<number | null>(null);
    const [userName, setUserName] = React.useState<string | null>(null);

    const handleAuthSuccess = (id: number, name: string) => {
        setEntryId(id);
        setUserName(name);
        navigate('/overview'); // Navigate to overview after successful login
    };

    const location = useLocation();
    const navigate = useNavigate();

    const toolpadNavigate: Router['navigate'] = React.useCallback((url: string | URL) => {
        const path = typeof url === 'string' ? url : url.pathname + url.search;
        navigate(path);
    }, [navigate]);

    const router = React.useMemo<Router>(() => {
        return {
            pathname: location.pathname,
            searchParams: new URLSearchParams(location.search),
            navigate: toolpadNavigate,
        };
    }, [location, toolpadNavigate]);

    return (
        <ThemeProvider theme={fplDarkTheme}>
            <CssBaseline />

            <AppProvider
                navigation={NAVIGATION}
                router={router}
                branding={{
                    title: 'FPL Analytics',
                    homeUrl: '/',
                }}
            >
                <DashboardLayout
                    slots={{
                        toolbarActions: CustomToolbarActions,
                    }}
                >
                    <Routes>
                        {entryId ? (
                            <>
                                {/* Redirect from root to /overview if authenticated */}
                                <Route path="/" element={<Navigate to="/overview" replace />} />

                                {/* Authenticated routes */}
                                <Route path="/overview" element={
                                    <PageContainer
                                        title={userName ? `Welcome, ${userName}` : 'Welcome!'}
                                    >
                                        <Dashboard entryId={entryId} />
                                    </PageContainer>
                                } />
                                <Route path="/player-analysis" element={<PageContainer title="Player Analysis"><Box sx={{p:3}}><p>Player Analysis Content</p></Box></PageContainer>} />
                                <Route path="/team-planner" element={<PageContainer title="Team Planner"><Box sx={{p:3}}><p>Team Planner Content</p></Box></PageContainer>} />
                                <Route path="/mini-league-tracker" element={<PageContainer title="Mini-League Tracker"><Box sx={{p:3}}><p>Mini-League Tracker Content</p></Box></PageContainer>} />
                                <Route path="/transfers" element={<PageContainer title="Transfers"><Box sx={{p:3}}><p>Transfers Content</p></Box></PageContainer>} />

                                {/* Catch-all for authenticated users to avoid AuthScreen if they type a bad URL */}
                                <Route path="*" element={<PageContainer><Box sx={{p:3}}><p>Page not found!</p></Box></PageContainer>} />
                            </>
                        ) : (
                            // Unauthenticated routes
                            <>
                                {/* AuthScreen is now explicitly rendered at the root path or any unknown path */}
                                <Route path="/" element={
                                    <PageContainer
                                        sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            maxWidth: 'md',
                                        }}
                                    >
                                        <AuthScreen onAuthSuccess={handleAuthSuccess} />
                                    </PageContainer>
                                } />
                                {/* Redirect any other path to AuthScreen if not authenticated */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </>
                        )}
                    </Routes>
                </DashboardLayout>
            </AppProvider>
        </ThemeProvider>
    );
};

export default App;
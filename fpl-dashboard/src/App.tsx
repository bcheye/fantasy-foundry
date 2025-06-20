import * as React from 'react';
import {
    CssBaseline,
    ThemeProvider,
    Box,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    useLocation,
    useNavigate,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import {
    PageContainer,
    Router,
} from '@toolpad/core';
import {
    AppProvider,
    type Navigation,
} from '@toolpad/core/AppProvider';

import { Dashboard } from './components/Dashboard';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { AuthScreen } from './components/auth/AuthScreen';
import fplDarkTheme from './theme/fplDarkTheme';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EqualizerIcon from "@mui/icons-material/Equalizer";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const NAVIGATION: Navigation = [
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
        icon: <EqualizerIcon />,
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
                    mr: 2,
                }}
            />
            <IconButton color="inherit" size="large">
                <NotificationsNoneIcon />
            </IconButton>
        </Box>
    );
}

export const App = () => {
    const [entryId, setEntryId] = React.useState<number | null>(null);
    const [userName, setUserName] = React.useState<string | null>(null);

    const handleAuthSuccess = (id: number, name: string) => {
        setEntryId(id);
        setUserName(name);
        navigate('/overview');
    };

    const location = useLocation();
    const navigate = useNavigate();

    const toolpadNavigate: Router['navigate'] = React.useCallback(
        (url: string | URL) => {
            const path = typeof url === 'string' ? url : url.pathname + url.search;
            navigate(path);
        },
        [navigate]
    );

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
                theme={fplDarkTheme}
                session={entryId ? { user: { name: userName || 'Manager', email: 'user@example.com' } } : null}
                branding={{
                    title: 'FPL Analytics',
                    homeUrl: '/',
                }}
            >
                <Routes>
                    {entryId ? (
                        <Route
                            path="/*"
                            element={
                                <DashboardLayout
                                    slots={{
                                        toolbarActions: CustomToolbarActions,
                                    }}
                                >
                                    <Routes>
                                        <Route path="/" element={<Navigate to="/overview" replace />} />
                                        <Route
                                            path="/overview"
                                            element={
                                                <PageContainer title=''>
                                                    <Dashboard entryId={entryId} userName={userName} />
                                                </PageContainer>
                                            }
                                        />
                                        <Route
                                            path="/player-analysis"
                                            element={
                                                <PageContainer title="Player Analysis">
                                                    <Box sx={{ p: 3 }}>
                                                        <p>Player Analysis Content</p>
                                                    </Box>
                                                </PageContainer>
                                            }
                                        />
                                        <Route
                                            path="/team-planner"
                                            element={
                                                <PageContainer title="Team Planner">
                                                    <Box sx={{ p: 3 }}>
                                                        <p>Team Planner Content</p>
                                                    </Box>
                                                </PageContainer>
                                            }
                                        />
                                        <Route
                                            path="/mini-league-tracker"
                                            element={
                                                <PageContainer title="Mini-League Tracker">
                                                    <Box sx={{ p: 3 }}>
                                                        <p>Mini-League Tracker Content</p>
                                                    </Box>
                                                </PageContainer>
                                            }
                                        />
                                        <Route
                                            path="/transfers"
                                            element={
                                                <PageContainer title="Transfers">
                                                    <Box sx={{ p: 3 }}>
                                                        <p>Transfers Content</p>
                                                    </Box>
                                                </PageContainer>
                                            }
                                        />
                                        <Route
                                            path="*"
                                            element={
                                                <PageContainer>
                                                    <Box sx={{ p: 3 }}>
                                                        <p>Page not found!</p>
                                                    </Box>
                                                </PageContainer>
                                            }
                                        />
                                    </Routes>
                                </DashboardLayout>
                            }
                        />
                    ) : (
                        <>
                            <Route
                                path="/"
                                element={
                                    <Box
                                        sx={{
                                            minHeight: '100vh',
                                            bgcolor: '#0f1a0e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <AuthScreen onAuthSuccess={handleAuthSuccess} />
                                    </Box>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    )}
                </Routes>
            </AppProvider>
        </ThemeProvider>
    );
};

export default App;
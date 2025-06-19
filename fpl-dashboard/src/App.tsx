import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { Dashboard } from './components/Dashboard';
import { NavigationIcons } from './components/NavigationIcons';
import { TopBar } from './components/TopBar';
import {useState} from "react";
import {AuthModal} from "./components/auth/AuthModal";

const theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0f1b13',
            paper: '#1c2b21',
        },
        primary: {
            main: '#37003c',
        },
        secondary: {
            main: '#00ff87',
        },
        text: {
            primary: '#e6f4ea',
            secondary: '#d2e6d2',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
});

export const App = () => {
    const [authModalOpen, setAuthModalOpen] = useState(true);
    const [entryId, setEntryId] = useState<number | null>(null);

    const handleAuthSuccess = (id: number) => {
        setEntryId(id);
        setAuthModalOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <TopBar />
            {entryId ? (
            <Box sx={{ display: 'flex' }}>
                <NavigationIcons />
                <Box sx={{ flexGrow: 1, padding: 4 }}>
                    <Dashboard entryId={entryId}/>
                </Box>
            </Box>
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

export default App;
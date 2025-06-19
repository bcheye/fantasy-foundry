import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { Dashboard } from './components/Dashboard';
import { NavigationIcons } from './components/NavigationIcons';
import { TopBar } from './components/TopBar';
import {useState} from "react";

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

function App() {
    const [entryId] = useState(3530111);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <TopBar />
            <Box sx={{ display: 'flex' }}>
                <NavigationIcons />
                <Box sx={{ flexGrow: 1, padding: 4 }}>
                    <Dashboard entryId={entryId}/>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
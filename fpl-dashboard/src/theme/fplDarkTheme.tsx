import { createTheme } from '@mui/material/styles';

const fplDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#1c2b21', // Main deep dark background
            paper: '#1c2b21',   // Slightly lighter dark for cards, header, sidebar
        },
        primary: {
            main: '#4CAF50', // A strong green for accents, active states, etc. (like the active nav item)
            light: '#6FBF73',
            dark: '#357A38',
        },
        secondary: {
            main: '#FFA000', // A complementary amber for other highlights if needed
        },
        text: {
            primary: '#E0E0E0',  // Light grey for most text
            secondary: '#B0B0B0', // Slightly darker grey for subtitles, less important text
        },
        success: { // For positive percentage changes (+10%)
            main: '#4CAF50', // The green from your screenshot
            contrastText: '#fff',
        },
        error: { // For negative percentage changes (-3%)
            main: '#EF5350', // A standard red
            contrastText: '#fff',
        },
        divider: '#3A4045', // For subtle lines, like table borders or header/sidebar dividers
    },
    typography: {
        fontFamily: 'Inter, sans-serif', // Keep your Inter font
        h4: {
            fontWeight: 600,
            color: '#E0E0E0',
        },
        h6: {
            fontWeight: 500,
            color: '#E0E0E0',
        },
        subtitle2: {
            color: '#B0B0B0',
        },
        body1: {
            color: '#E0E0E0',
        },
        body2: {
            color: '#B0B0B0',
        }
    },
    components: {
        MuiAppBar: { // The header bar
            styleOverrides: {
                root: {
                    backgroundColor: '#1c2b21', // Matches paper background
                    boxShadow: 'none', // Remove default shadow
                    borderBottom: '1px solid #3A4045', // Subtle bottom border
                    height: '64px', // Standard height
                    justifyContent: 'center', // Center content vertically
                },
            },
        },
        MuiDrawer: { // The sidebar
            styleOverrides: {
                paper: {
                    backgroundColor: '#1c2b21', // Matches default background
                    borderRight: 'none', // Remove default border
                },
            },
        },
        MuiListItemButton: { // Navigation items in the sidebar
            styleOverrides: {
                root: {
                    borderRadius: '8px', // Rounded corners for the active state
                    margin: '4px 8px', // Spacing around items
                    paddingLeft: '16px',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(76, 175, 80, 0.2)', // Transparent green for selected
                        color: '#4CAF50', // Green text for selected
                        '& .MuiSvgIcon-root': {
                            color: '#4CAF50', // Green icon for selected
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.25)', // Slightly darker on hover for selected
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Light hover effect for non-selected
                    },
                    // Default text and icon color for non-selected
                    color: '#B0B0B0',
                    '& .MuiSvgIcon-root': {
                        color: '#B0B0B0',
                    },
                },
            },
        },
        MuiPaper: { // Cards, tables, etc. (Dashboard components)
            styleOverrides: {
                root: {
                    backgroundColor: '#1c2b21', // Matches the screenshot's card background
                    borderRadius: '8px', // Rounded corners for all cards
                    boxShadow: 'none', // Remove default shadow for a flatter look
                },
            },
        },
        MuiOutlinedInput: { // For search bar in TopBar
            styleOverrides: {
                root: {
                    borderRadius: '20px', // More rounded search bar
                    '& fieldset': { // The border of the input
                        borderColor: '#424242', // Darker border
                    },
                    '&:hover fieldset': {
                        borderColor: '#616161 !important', // Lighter border on hover
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50 !important', // Green border on focus
                    },
                },
                input: {
                    padding: '10px 14px', // Adjust padding for a smaller search bar
                },
            },
        },
        MuiInputAdornment: { // For the search icon
            styleOverrides: {
                root: {
                    color: '#B0B0B0',
                },
            },
        },
        MuiIconButton: { // For notification/user icons in TopBar
            styleOverrides: {
                root: {
                    color: '#B0B0B0',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    }
                }
            }
        },
        MuiTableContainer: { // For your TopPlayersTable
            styleOverrides: {
                root: {
                    borderRadius: '8px', // Apply border radius to table container
                    overflowX: 'auto', // Ensure horizontal scrolling for wide tables
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    // No specific background needed here if MuiPaper takes care of it for the container
                },
            },
        },
        MuiTableCell: { // For your TopPlayersTable cells
            styleOverrides: {
                root: {
                    borderColor: '#3A4045', // Darker borders for table cells
                    color: '#E0E0E0', // Default text color for cells
                    padding: '12px 16px', // Adjust cell padding
                },
                head: {
                    color: '#B0B0B0', // Lighter text color for header cells
                    fontWeight: 600,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#1c2b21', // Your desired background color
                },
            },
        },
    },
});

export default fplDarkTheme;
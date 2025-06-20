import * as React from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Link
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import axios from 'axios';
import { fetchFplIdThroughPopup } from '../../utils/fplAuth';

interface AuthScreenProps {
    onAuthSuccess: (entryId: number, userName: string) => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
    const [tabIndex, setTabIndex] = useState(0); // 0 for Login, 1 for Sign Up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fplEntryId, setFplEntryId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Removed handleTabChange as Tabs are gone
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleSubmit = async (mode: 'login' | 'signup') => {
        setError(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                if (!email || !password || !fplEntryId) {
                    setError('All fields are required for sign up.');
                    return;
                }
                const response = await axios.post<{ entryId: number; name: string }>('/auth/signup', {
                    email,
                    password,
                    entryId: Number(fplEntryId)
                });
                onAuthSuccess(response.data.entryId, response.data.name);
            } else { // Login mode
                if (!email || !password) {
                    setError('Email and password are required for login.');
                    return;
                }
                const response = await axios.post<{ entryId: number; name: string }>('/auth/login', {
                    email,
                    password,
                    rememberMe
                });
                onAuthSuccess(response.data.entryId, response.data.name);
            }
        } catch (err) {
            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || err.response?.data?.error || (mode === 'signup' ? 'Registration failed' : 'Invalid credentials')
                    : mode === 'signup' ? 'Signup failed' : 'Login failed'
            );
            console.error('Authentication error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchFplEntryId = async () => {
        setLoading(true);
        setError(null);
        try {
            const id = await fetchFplIdThroughPopup();
            setFplEntryId(id.toString());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch FPL ID automatically.');
            console.error('FPL ID fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            sx={{
                width: { xs: '90%', sm: '500px', md: '600px' },
                p: 4,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: 3,
                backgroundColor: 'background.paper',
                backgroundImage: 'none',
                mx: 'auto',
                my: 4,
            }}
        >
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
                {tabIndex === 0 ? "Login to FPL Analytics" : "Sign Up for FPL Analytics"} {/* Dynamic title */}
            </Typography>

            {/* Removed Tabs component */}

            {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                    {error}
                </Alert>
            )}

            <TextField
                label={tabIndex === 0 ? "Username or Email" : "Email"}
                type="email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#1A2027',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: 'transparent' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        '&.Mui-focused': { color: 'primary.main' },
                    },
                    '& .MuiInputBase-input': {
                        color: 'text.primary',
                    },
                }}
                disabled={loading}
            />
            <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#1A2027',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: 'transparent' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        '&.Mui-focused': { color: 'primary.main' },
                    },
                    '& .MuiInputBase-input': {
                        color: 'text.primary',
                    },
                }}
                disabled={loading}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                disabled={loading}
                                sx={{ color: 'text.secondary' }}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {tabIndex === 0 && ( // Login specific elements
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 3, alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                color="primary"
                                disabled={loading}
                                sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                            />
                        }
                        label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Remember Me</Typography>}
                    />
                    <Link href="#" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}>
                        Forgot Password?
                    </Link>
                </Box>
            )}

            {tabIndex === 1 && ( // Sign Up specific FPL Entry ID field
                <TextField
                    label="FPL Entry ID"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={fplEntryId}
                    onChange={(e) => setFplEntryId(e.target.value)}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#1A2027',
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: 'transparent' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'text.secondary',
                            '&.Mui-focused': { color: 'primary.main' },
                        },
                        '& .MuiInputBase-input': {
                            color: 'text.primary',
                        },
                    }}
                    disabled={loading}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button
                                    onClick={handleFetchFplEntryId}
                                    disabled={loading}
                                    size="small"
                                    sx={{ whiteSpace: 'nowrap', color: 'primary.main' }}
                                >
                                    Get ID Automatically
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            )}

            <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 2, py: 1.5, borderRadius: '8px' }}
                onClick={() => handleSubmit(tabIndex === 0 ? 'login' : 'signup')}
                disabled={loading}
            >
                {loading ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    tabIndex === 0 ? 'Login' : 'Sign Up'
                )}
            </Button>

            {tabIndex === 0 ? ( // "Don't have an account?" link for Login tab
                <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
                    Don't have an account?{' '}
                    <Link
                        href="#"
                        onClick={() => { setTabIndex(1); setError(null); }} // Switch to Sign Up tab, clear error
                        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Sign Up
                    </Link>
                </Typography>
            ) : ( // "Already have an account?" link for Sign Up tab
                <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
                    Already have an account?{' '}
                    <Link
                        href="#"
                        onClick={() => { setTabIndex(0); setError(null); }} // Switch to Login tab, clear error
                        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Login
                    </Link>
                </Typography>
            )}
        </Paper>
    );
};
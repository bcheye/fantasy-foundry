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
    Link,
    Grid
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchFplIdThroughPopup } from '../../utils/fplAuth';

interface AuthScreenProps {
    onAuthSuccess: (entryId: number, userName: string) => void;
}

enum AuthMode {
    LOGIN = 'login',
    SIGNUP = 'signup'
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
    const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fplEntryId, setFplEntryId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
        entryId: ''
    });

    // Handle countdown and auto-redirect
    useEffect(() => {
        if (!signupSuccess) return;

        const timer = setTimeout(() => {
            handleTabChange(AuthMode.LOGIN);
            setSignupSuccess(false);
        }, 5000);

        const interval = setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            setCountdown(5);
        };
    }, [signupSuccess]);

    const validateForm = () => {
        const newErrors = {
            email: !email ? 'Email is required' : !/\S+@\S+\.\S+/.test(email) ? 'Invalid email format' : '',
            password: !password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '',
            entryId: mode === AuthMode.SIGNUP && !fplEntryId ? 'Entry ID is required' : ''
        };
        setFieldErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!validateForm()) return;
        setLoading(true);

        try {
            if (mode === AuthMode.SIGNUP) {
                const response = await axios.post<{ entryId: number; name: string }>('/auth/signup', {
                    first_name,
                    last_name,
                    email,
                    password,
                    entryId: Number(fplEntryId)
                });
                setSignupSuccess(true);
            } else {
                const response = await axios.post<{ entryId: number; firstName: string }>('/auth/login', {
                    email,
                    password,
                    rememberMe
                });
                onAuthSuccess(response.data.entryId, response.data.firstName);
            }
        } catch (err) {
            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || err.response?.data?.error || (mode === AuthMode.SIGNUP ? 'Registration failed' : 'Invalid credentials')
                    : mode === AuthMode.SIGNUP ? 'Signup failed' : 'Login failed'
            );
            console.error('Authentication error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (newMode: AuthMode) => {
        setMode(newMode);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setFplEntryId('');
        setError(null);
        setFieldErrors({ email: '', password: '', entryId: '' });
    };

    const handleFetchFplEntryId = async () => {
        setLoading(true);
        setError(null);
        setFieldErrors(prev => ({...prev, entryId: ''}));
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
        <Paper sx={styles.paperContainer}>
            <Box component="form" onSubmit={handleFormSubmit} sx={styles.form}>
                <Typography variant="h4" align="center" fontWeight="bold" sx={styles.title}>
                    Welcome to FPL Analytics
                </Typography>

                {signupSuccess ? (
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Account created successfully!
                        </Alert>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            You will be redirected to login in {countdown} seconds...
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                handleTabChange(AuthMode.LOGIN);
                                setSignupSuccess(false);
                                setCountdown(5);
                            }}
                            sx={{ mt: 1 }}
                        >
                            Go to Login Now
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Box sx={styles.tabContainer}>
                            {Object.values(AuthMode).map((tab) => (
                                <Typography
                                    key={tab}
                                    variant="body2"
                                    onClick={() => handleTabChange(tab)}
                                    sx={{
                                        ...styles.tab,
                                        color: mode === tab ? '#ffffff' : '#a1c398',
                                        borderBottom: mode === tab ? '3px solid #50d22c' : '3px solid transparent',
                                    }}
                                >
                                    {tab === AuthMode.LOGIN ? 'Login' : 'Sign Up'}
                                </Typography>
                            ))}
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                                {error}
                            </Alert>
                        )}

                        {mode === AuthMode.SIGNUP && (
                            <>
                                <TextField
                                    required
                                    fullWidth
                                    label="First Name"
                                    value={first_name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={loading}
                                    sx={styles.field}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Last Name"
                                    value={last_name}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={loading}
                                    sx={styles.field}
                                />
                            </>
                        )}

                        <TextField
                            required
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            error={!!fieldErrors.email}
                            helperText={fieldErrors.email}
                            sx={styles.field}
                        />

                        <TextField
                            required
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            error={!!fieldErrors.password}
                            helperText={fieldErrors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            sx={{ color: '#a1c398' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={styles.field}
                        />

                        {mode === AuthMode.SIGNUP && (
                            <Grid container spacing={2} alignItems="flex-end">
                                <Grid size={{xs:7}} >
                                    <TextField
                                        required
                                        fullWidth
                                        label="FPL Entry ID"
                                        type="number"
                                        value={fplEntryId}
                                        onChange={(e) => setFplEntryId(e.target.value)}
                                        disabled={loading}
                                        error={!!fieldErrors.entryId}
                                        helperText={fieldErrors.entryId}
                                        sx={styles.field}
                                    />
                                </Grid>
                                <Grid size={{xs: 5}} >
                                    <Button
                                        fullWidth
                                        onClick={handleFetchFplEntryId}
                                        disabled={loading}
                                        sx={styles.secondaryButton}
                                    >
                                        Get ID Automatically
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {mode === AuthMode.LOGIN && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2, alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{
                                                color: '#a1c398',
                                                '&.Mui-checked': {
                                                    color: '#50d22c',
                                                },
                                                '& .MuiSvgIcon-root': { fontSize: 20 }
                                            }}
                                            disabled={loading}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ color: '#a1c398' }}>Remember Me</Typography>}
                                />
                                <Link href="#" variant="body2" sx={{ color: '#a1c398', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#50d22c' } }}>
                                    Forgot Password?
                                </Link>
                            </Box>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            sx={styles.submitButton}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                mode === AuthMode.SIGNUP ? 'Sign Up' : 'Login'
                            )}
                        </Button>
                    </>
                )}
            </Box>
        </Paper>
    );
};

const styles = {
    paperContainer: {
        width: { xs: '90%', sm: '500px', md: '600px' },
        p: 4,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 3,
        backgroundColor: '#162013',
        backgroundImage: 'none',
        mx: 'auto',
        my: 4,
    },
    form: {
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    title: {
        mb: 2,
        color: '#ffffff'
    },
    tabContainer: {
        display: 'flex',
        borderBottom: '1px solid #416039',
        gap: 4,
        mb: 3,
    },
    tab: {
        cursor: 'pointer',
        fontWeight: 700,
        pb: 1,
        flex: 1,
        textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    field: {
        '& .MuiInputBase-input': { color: '#ffffff' },
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#21301c',
            borderRadius: '8px',
            '& fieldset': {
                borderColor: '#416039'
            },
            '&:hover fieldset': {
                borderColor: '#50d22c'
            },
            '&.Mui-focused fieldset': {
                borderColor: '#50d22c'
            }
        },
        '& .MuiInputLabel-root': {
            color: '#a1c398',
            '&.Mui-focused': { color: '#50d22c' }
        },
        '& .MuiFormHelperText-root': {
            color: '#ff6b6b'
        }
    },
    secondaryButton: {
        height: 56,
        mt: 1.5,
        borderRadius: '999px',
        backgroundColor: '#2e4328',
        color: '#ffffff',
        fontWeight: 'bold',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#3b5b35'
        },
        '&:disabled': {
            backgroundColor: '#2e4328',
            color: 'rgba(255, 255, 255, 0.5)',
        }
    },
    submitButton: {
        height: 56,
        borderRadius: '999px',
        backgroundColor: '#50d22c',
        color: '#162013',
        fontWeight: 'bold',
        mt: 3,
        '&:hover': {
            backgroundColor: '#4cc328'
        },
        '&:disabled': {
            backgroundColor: '#a1c398',
            color: '#162013'
        }
    }
};
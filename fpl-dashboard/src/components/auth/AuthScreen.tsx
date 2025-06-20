// src/components/auth/AuthScreen.tsx
import * as React from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    // Removed Tabs, Tab as we're now using custom tab-like headers
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Link,
    Grid // Added Grid for FPL Entry ID layout
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import axios from 'axios';
import { fetchFplIdThroughPopup } from '../../utils/fplAuth';

interface AuthScreenProps {
    onAuthSuccess: (entryId: number, userName: string) => void;
}

// Define AuthMode enum directly within AuthScreen for self-containment
enum AuthMode {
    LOGIN = 'login',
    SIGNUP = 'signup'
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
    const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN); // Default to Login as per screenshot
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fplEntryId, setFplEntryId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // For "Remember Me" checkbox
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // For general API errors

    // State for validation errors (from AuthForm)
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
        entryId: ''
    });

    const validateForm = () => {
        const newErrors = {
            email: !email ? 'Email is required' : !/\S+@\S+\.\S+/.test(email) ? 'Invalid email format' : '',
            password: !password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '',
            entryId: mode === AuthMode.SIGNUP && !fplEntryId ? 'Entry ID is required' : '' // Use fplEntryId here
        };
        setFieldErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Clear previous API errors
        if (!validateForm()) {
            return; // Stop if client-side validation fails
        }
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
                onAuthSuccess(response.data.entryId, response.data.name);
            } else { // Login mode
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
                    ? err.response?.data?.message || err.response?.data?.error || (mode === AuthMode.SIGNUP ? 'Registration failed' : 'Invalid credentials')
                    : mode === AuthMode.SIGNUP ? 'Signup failed' : 'Login failed'
            );
            console.error('Authentication error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Custom tab-like header change handler
    const handleTabChange = (newMode: AuthMode) => {
        setMode(newMode);
        // Clear all form fields and errors when switching modes
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setFplEntryId('');
        setError(null); // Clear general API errors
        setFieldErrors({ email: '', password: '', entryId: '' }); // Clear field validation errors
    };

    const handleFetchFplEntryId = async () => {
        setLoading(true);
        setError(null);
        setFieldErrors(prev => ({...prev, entryId: ''})); // Clear entry ID specific error
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
            sx={styles.paperContainer} // Apply Paper specific styles
        >
            <Box component="form" onSubmit={handleFormSubmit} sx={styles.form}> {/* Form specific styles */}
                <Typography variant="h4" align="center" fontWeight="bold" sx={styles.title}>
                    Welcome to FPL Analytics
                </Typography>

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

                {/* API Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}

                {/*First name (Signup Only)*/}
                {mode === AuthMode.SIGNUP && (
                    <TextField
                    required
                    fullWidth
                    label="First Name"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    error={!!fieldErrors.email} // Use fieldErrors here
                    helperText={fieldErrors.email}
                    sx={styles.field} // Apply field specific styles
                />
                )}

                {/*Last name (Signup Only)*/}
                {mode === AuthMode.SIGNUP && (
                    <TextField
                    required
                    fullWidth
                    label="Last Name"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    error={!!fieldErrors.email} // Use fieldErrors here
                    helperText={fieldErrors.email}
                    sx={styles.field} // Apply field specific styles
                />
                )}

                {/* Email */}
                <TextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    error={!!fieldErrors.email} // Use fieldErrors here
                    helperText={fieldErrors.email}
                    sx={styles.field} // Apply field specific styles
                />

                {/* Password */}
                <TextField
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    error={!!fieldErrors.password} // Use fieldErrors here
                    helperText={fieldErrors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword} // Corrected
                                    edge="end"
                                    sx={{ color: '#a1c398' }} // Apply icon color
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    sx={styles.field} // Apply field specific styles
                />

                {/* FPL Entry ID (Sign Up Only) */}
                {mode === AuthMode.SIGNUP && (
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid size={{xs:7}} > {/* Changed size to item xs */}
                            <TextField
                                required
                                fullWidth
                                label="FPL Entry ID"
                                type="number"
                                value={fplEntryId} // Use fplEntryId here
                                onChange={(e) => setFplEntryId(e.target.value)}
                                disabled={loading}
                                error={!!fieldErrors.entryId} // Use fieldErrors here
                                helperText={fieldErrors.entryId}
                                sx={styles.field} // Apply field specific styles
                            />
                        </Grid>
                        <Grid size={{xs: 5}} > {/* Changed size to item xs */}
                            <Button
                                fullWidth
                                onClick={handleFetchFplEntryId} // Corrected to internal handler
                                disabled={loading}
                                sx={styles.secondaryButton} // Apply secondary button styles
                            >
                                Get ID Automatically
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {/* "Remember Me" & "Forgot Password?" (Login Only) */}
                {mode === AuthMode.LOGIN && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2, alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    sx={{
                                        color: '#a1c398', // Checkbox color
                                        '&.Mui-checked': {
                                            color: '#50d22c', // Checked state color
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

                {/* Submit */}
                <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    sx={styles.submitButton} // Apply submit button styles
                >
                    {loading
                        ? (mode === AuthMode.SIGNUP ? 'Signing up...' : 'Logging in...') // Text for loading state
                        : (mode === AuthMode.SIGNUP ? 'Sign Up' : 'Login') // Text for ready state
                    }
                </Button>
            </Box>
        </Paper>
    );
};

const styles = {
    paperContainer: { // New style for the Paper component
        width: { xs: '90%', sm: '500px', md: '600px' },
        p: 4,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 3,
        backgroundColor: '#162013', // This should be your Paper background color based on the screenshot
        backgroundImage: 'none',
        mx: 'auto',
        my: 4,
    },
    // The previous `container` styles were for the Modal's background.
    // They are now handled by App.tsx's PageContainer and DashboardLayout.
    // So, this `container` style is removed.

    form: { // Styles for the form wrapper inside the Paper
        width: '100%',
        maxWidth: 480, // Limiting inner form width as per AuthForm.tsx
        display: 'flex',
        flexDirection: 'column',
        gap: 2, // Spacing between form elements
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
        // color and borderBottom are set dynamically in the component
    },
    field: {
        // You had `input: { color: '#ffffff' }` here.
        // It's generally better to apply `color` directly to `InputBase` or `InputLabel` via sx
        // if using theming. But for direct styling it works.
        '& .MuiInputBase-input': { color: '#ffffff' }, // This targets the actual text input
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#21301c', // Darker background for text fields as per original AuthForm
            borderRadius: '8px', // Changed from 2 to '8px' for consistency with other styles
            '& fieldset': {
                borderColor: '#416039' // Border color when not focused/hovered
            },
            '&:hover fieldset': {
                borderColor: '#50d22c' // Green on hover
            },
            '&.Mui-focused fieldset': {
                borderColor: '#50d22c' // Green on focus
            }
        },
        '& .MuiInputLabel-root': {
            color: '#a1c398', // Label color (muted green)
            '&.Mui-focused': { color: '#50d22c' } // Label color when focused (bright green)
        },
        '& .MuiFormHelperText-root': {
            color: '#ff6b6b' // Error text color
        }
    },
    secondaryButton: {
        height: 56, // Fixed height
        mt: 1.5, // Margin top for alignment with TextField
        borderRadius: '999px', // Pill shape
        backgroundColor: '#2e4328', // Darker green background
        color: '#ffffff', // White text
        fontWeight: 'bold',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#3b5b35' // Slightly lighter green on hover
        },
        '&:disabled': { // Disabled state for consistency
            backgroundColor: '#2e4328', // Keep dark background
            color: 'rgba(255, 255, 255, 0.5)', // Muted text color
        }
    },
    submitButton: {
        height: 56,
        borderRadius: '999px',
        backgroundColor: '#50d22c', // Bright green primary button
        color: '#162013', // Very dark text on green
        fontWeight: 'bold',
        mt: 3,
        '&:hover': {
            backgroundColor: '#4cc328' // Slightly darker green on hover
        },
        '&:disabled': {
            backgroundColor: '#a1c398', // Muted green when disabled
            color: '#162013' // Dark text
        }
    }
};
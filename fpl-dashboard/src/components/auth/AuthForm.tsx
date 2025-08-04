import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

enum AuthMode {
    LOGIN = 'login',
    SIGNUP = 'signup'
}

interface AuthFormProps {
    loading: boolean;
    onSubmit: (form: { email: string; password: string; entryId?: string }, mode: AuthMode) => void;
    onGetEntryId: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ loading, onSubmit, onGetEntryId }) => {
    const [mode, setMode] = useState<AuthMode>(AuthMode.SIGNUP);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [entryId, setEntryId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        entryId: ''
    });

    const validateForm = () => {
        const newErrors = {
            email: !email ? 'Email is required' : !/\S+@\S+\.\S+/.test(email) ? 'Invalid email format' : '',
            password: !password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '',
            entryId: mode === AuthMode.SIGNUP && !entryId ? 'Entry ID is required' : ''
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({ email, password, entryId }, mode);
        }
    };

    const handleTabChange = (newMode: AuthMode) => {
        setMode(newMode);
        setErrors({ email: '', password: '', entryId: '' });
    };

    return (
        <Box sx={styles.container}>
            <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
                <Typography variant="h4" align="center" fontWeight="bold" sx={styles.title}>
                    Welcome to FPL Analytics
                </Typography>

                {/* Tab Header */}
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

                {/* Email */}
                <TextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={styles.field}
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
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
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

                {/* FPL Entry ID (Sign Up Only) */}
                {mode === AuthMode.SIGNUP && (
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid size={{xs:7}} >
                            <TextField
                                required
                                fullWidth
                                label="FPL Entry ID"
                                type="number"
                                value={entryId}
                                onChange={(e) => setEntryId(e.target.value)}
                                disabled={loading}
                                error={!!errors.entryId}
                                helperText={errors.entryId}
                                sx={styles.field}
                            />
                        </Grid>
                        <Grid size={{xs: 5}} >
                            <Button
                                fullWidth
                                onClick={onGetEntryId}
                                disabled={loading}
                                sx={styles.secondaryButton}
                            >
                                Get ID Automatically
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {/* Submit */}
                <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    sx={styles.submitButton}
                >
                    {loading
                        ? mode === AuthMode.SIGNUP ? 'Signing up...' : 'Logging in...'
                        : mode === AuthMode.SIGNUP ? 'Sign Up' : 'Login'}
                </Button>
            </Box>
        </Box>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#162013',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
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
        input: { color: '#ffffff' },
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#21301c',
            borderRadius: 2,
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

export default AuthForm;
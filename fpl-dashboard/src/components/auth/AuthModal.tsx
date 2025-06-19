import { useState } from 'react';
import { Modal, Box, Alert } from '@mui/material';
import axios from 'axios';
import AuthForm  from './AuthForm';
import { fetchFplIdThroughPopup } from '../../utils/fplAuth';

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: '#162013',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    onAuthSuccess: (entryId: number) => void;
}

export const AuthModal = ({ open, onClose, onAuthSuccess }: AuthModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [entryId, setEntryId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (
        form: { email: string; password: string; entryId?: string },
        mode: 'login' | 'signup'
    ) => {
        const { email, password, entryId } = form;

        try {
            setLoading(true);
            setError('');

            if (mode === 'signup') {
                if (!entryId) {
                    setError('Please enter your FPL entry ID');
                    return;
                }

                await axios.post('/auth/signup', { email, password, entryId: Number(entryId) });
                onAuthSuccess(Number(entryId));
            } else {
                const response = await axios.post<{ entryId: number }>('/auth/login', {
                    email,
                    password,
                });
                onAuthSuccess(response.data.entryId);
            }
        } catch (err) {
            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.error || (mode === 'signup' ? 'Registration failed' : 'Invalid credentials')
                    : mode === 'signup' ? 'Signup failed' : 'Login failed'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchFplEntryId = async () => {
        try {
            setLoading(true);
            setError('');
            const id = await fetchFplIdThroughPopup();
            setEntryId(id.toString());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch FPL ID');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <AuthForm
                    loading={loading}
                    onSubmit={(form, mode) => {
                        setEmail(form.email);
                        setPassword(form.password);
                        setEntryId(form.entryId || '');
                        handleSubmit(form, mode);
                    }}
                    onGetEntryId={fetchFplEntryId}
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Modal>
    );
};
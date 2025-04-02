// src/components/Login.js
import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axiosClient from '../axios-client';

// Styled Components for better readability and reusability
const StyledContainer = styled(Container)(({ theme }) => ({
    padding: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
}));

const StyledBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(6),
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosClient.post('/login', { // Use axiosClient instead of axios
                username: username,
                password: password,
            });

            localStorage.setItem('authToken', response.data.token);
            window.location.href = '/dashboard'; // Basic redirect, replace with react-router
        } catch (err) {
            // Error is handled by the interceptor in axiosClient,
            // you may not need to handle it here unless specific to this component
            console.error('Error caught in Login component (should be handled by interceptor):', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledContainer maxWidth="xs"> {/* Use maxWidth="xs" for mobile-first */}
            <StyledBox>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <StyledTextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <StyledTextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Login'}
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            {/* Add a link for "Forgot password?" if needed */}
                        </Grid>
                        <Grid item>
                            {/* Add a link for "Don't have an account? Sign up" if needed */}
                        </Grid>
                    </Grid>
                </Box>
            </StyledBox>
        </StyledContainer>
    );
};

export default Login;
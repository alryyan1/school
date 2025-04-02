// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Avatar,
    Menu,
    MenuItem,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axios-client';

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState(null); // Store user data
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        try {
            await axiosClient.post('/logout'); // Call the logout endpoint
            localStorage.removeItem('authToken');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosClient.get('/user'); // Or however you get the user information

                setUser(response.data);
            } catch (error) {
                console.error('error has  occured ');
            }
        }
        fetchUser()
    }, [])
    const avatarStyle = {
        width: 40,   // Adjust the width as needed
        height: 40,  // Adjust the height as needed
        bgcolor: 'primary.main', // Use a color from your theme
        fontSize: '1.2rem',     // Adjust the font size as needed
        marginRight: (theme) => theme.spacing(1), // Add a right margin
    };
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    مدارس الفنار
                </Typography>
                {user ? (
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >

                            {user.avatar_url ? (
                                <Avatar alt={user.name} src={user.avatar_url} sx={avatarStyle} />
                            ) : (
                                    <Avatar sx={avatarStyle}>{user.name[0]}</Avatar>  // get First latter of name
                            )}
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>My account</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </div>
                ) : (
                    <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
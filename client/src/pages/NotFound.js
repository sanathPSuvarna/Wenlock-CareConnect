import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center',
        padding: 4
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
        404
      </Typography>
      
      <Typography variant="h4" sx={{ mb: 4 }}>
        Page Not Found
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 600 }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;

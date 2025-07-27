import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

/**
 * TokenCard Component - Displays a patient token in a printable card format
 * 
 * @param {Object} props
 * @param {Object} props.patient - The patient object containing token information
 * @param {Function} props.onClose - Function to close the token card
 * @returns {JSX.Element} TokenCard component
 */
const TokenCard = ({ patient, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('token-card-printable');
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write(`
      <html>
        <head>
          <title>Patient Token</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .token-card {
              border: 2px solid #333;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              text-align: center;
            }
            .hospital-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .token-number {
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
              padding: 10px;
              border: 2px dashed #333;
              background-color: #f5f5f5;
            }
            .patient-info {
              margin: 15px 0;
              text-align: left;
            }
            .emergency {
              background-color: #f44336;
              color: white;
              padding: 5px 10px;
              font-weight: bold;
              margin: 10px 0;
              display: inline-block;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="token-card">
            <div class="hospital-name">WENLOCK DISTRICT HOSPITAL</div>
            ${patient.emergency ? '<div class="emergency">EMERGENCY</div>' : ''}
            <div class="token-number">${patient.tokenNumber}</div>
            <div class="patient-info">
              <div><strong>Name:</strong> ${patient.name}</div>
              <div><strong>Department:</strong> ${patient.department.name}</div>
              <div><strong>Doctor:</strong> ${patient.doctor.name}</div>
              <div><strong>Date & Time:</strong> ${new Date(patient.appointmentDate).toLocaleString()}</div>
            </div>
            <div class="footer">
              Please arrive 15 minutes before your appointment time.<br>
              This token is valid only for the date mentioned above.
            </div>
          </div>
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 400, 
        mx: 'auto',
        border: patient.emergency ? '2px solid #f44336' : 'none' 
      }}
    >
      <Box id="token-card-printable">
        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          WENLOCK DISTRICT HOSPITAL
        </Typography>
        
        {patient.emergency && (
          <Box sx={{ 
            bgcolor: 'error.main', 
            color: 'white', 
            py: 0.5, 
            px: 1, 
            fontWeight: 'bold',
            borderRadius: 1,
            display: 'table',
            mx: 'auto',
            mb: 2
          }}>
            EMERGENCY
          </Box>
        )}
        
        <Box sx={{ 
          border: '2px dashed #333', 
          py: 2, 
          px: 3, 
          my: 2, 
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          textAlign: 'center' 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            {patient.tokenNumber}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography><strong>Name:</strong> {patient.name}</Typography>
          <Typography><strong>Department:</strong> {patient.department.name}</Typography>
          <Typography><strong>Doctor:</strong> {patient.doctor.name}</Typography>
          <Typography>
            <strong>Date & Time:</strong> {new Date(patient.appointmentDate).toLocaleString()}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 2 }}>
          Please arrive 15 minutes before your appointment time.
          This token is valid only for the date mentioned above.
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Token
        </Button>
      </Box>
    </Paper>
  );
};

export default TokenCard;

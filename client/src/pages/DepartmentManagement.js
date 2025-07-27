import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../utils/api';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
    // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: {
      floor: '',
      wing: ''
    },
    description: '',
    headDoctor: ''
  });
  
  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      if (!token) {
        throw new Error('Not authorized');
      }
        // No need for manual config as our api util handles the token
      const { data } = await api.get('/api/departments');
      setDepartments(data.data);
      setError(null);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      if (!token) {
        throw new Error('Not authorized');
      }
        // No need for manual config as our api util handles the token
      const { data } = await api.get('/api/users');
      // Filter only doctors
      const doctorsList = data.filter(user => user.role === 'doctor');
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'floor' || name === 'wing') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  const handleOpenDialog = (department = null) => {
    if (department) {
      setFormData({
        ...department,
        location: department.location || { floor: '', wing: '' },
        headDoctor: department.headDoctor?._id || ''
      });
      setCurrentDepartment(department);
    } else {
      setFormData({
        name: '',
        code: '',
        location: { floor: '', wing: '' },
        description: '',
        headDoctor: ''
      });
      setCurrentDepartment(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      if (!token) {
        throw new Error('Not authorized');
      }
        // Using our api utility which already handles headers
      if (currentDepartment) {
        await api.put(`/api/departments/${currentDepartment._id}`, formData);
      } else {
        await api.post('/api/departments', formData);
      }
      
      setOpenDialog(false);
      fetchDepartments();
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        // Using our api utility which already handles authorization
        await api.delete(`/api/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
      }
    }
  };

  return (
    <Box sx={{ paddingY: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Department Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Department
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Head Doctor</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.length > 0 ? (
                  departments.map((department) => (
                    <TableRow key={department._id}>                      <TableCell>
                        <Typography variant="subtitle2">{department.name}</Typography>
                      </TableCell>
                      <TableCell>{department.code}</TableCell>
                      <TableCell>
                        {department.location ? 
                          `${department.location.floor} Floor, ${department.location.wing} Wing` : 
                          'Not specified'}
                      </TableCell>
                      <TableCell>{department.description}</TableCell>
                      <TableCell>
                        {department.headDoctor ? department.headDoctor.name : 'Not assigned'}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleOpenDialog(department)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDelete(department._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No departments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Department Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentDepartment ? 'Edit Department' : 'Add Department'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  helperText="Unique code for the department"
                />
              </Grid>              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Floor"
                  name="floor"
                  value={formData.location?.floor || ''}
                  onChange={handleInputChange}
                  required
                  helperText="Floor number (e.g., Ground, 1st, 2nd)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Wing"
                  name="wing"
                  value={formData.location?.wing || ''}
                  onChange={handleInputChange}
                  required
                  helperText="Wing (e.g., East, West, North, South)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  margin="normal"
                  label="Head Doctor"
                  name="headDoctor"
                  value={formData.headDoctor}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;

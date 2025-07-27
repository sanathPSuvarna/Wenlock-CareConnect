import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { PersonAdd as PersonAddIcon, MedicalServices as MedicalServicesIcon, Settings } from '@mui/icons-material';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    department: '',
    status: 'active'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const redirectTimeoutRef = useRef(null);

  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  // Handle successful registration redirect
    
    // Cleanup function to clear timeout if component unmounts
    // return () => {
    //   if (redirectTimeoutRef.current) {
    //     clearTimeout(redirectTimeoutRef.current);
    //   }
    // };
  // }, [success, navigate]); // Only run this effect when success or navigate changes
  
  // Fetch departments
  useEffect(() => {
    if (success) { setTimeout(()=>{navigate('/login')},3000)}},[success, navigate]);
  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (userInfo) {
      navigate('/');
      return;
    }
    
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/departments',{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token')).token}`||null
          }
        });
        const data = await res.json();
        setDepartments(data.data);
        if (!data || data.data.length === 0) {
          throw new Error('No departments found');
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        // Fallback departments
        console.log('Using fallback departments');
        setDepartments([
          { _id: 'd1', name: 'Cardiology' },
          { _id: 'd2', name: 'Emergency' },
          { _id: 'd3', name: 'Administration' },
          { _id: 'd4', name: 'General Medicine' },
          { _id: 'd5', name: 'Pediatrics' },
          { _id: 'd6', name: 'Surgery' }
        ]);
      }
    };
    
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission attempted');
    
    if (validateForm()) {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare data for submission
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          status: formData.status
        };
          // Send registration request
        console.log('Sending registration request:', userData);
        const response = await api.post('/api/users/register', userData);
        console.log('Registration response:', response.data);
        
        // Set success and reset form
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'doctor',
          department: '',
          status: 'active'
        });          } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        // Clear the timeout if there was an error
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <MedicalServicesIcon sx={{ color: 'primary.main', fontSize: 40, mr: 1 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Wenlock Hospital
            </Typography>
          </Box>
          
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              Registration successful! Redirecting to login...
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.role}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    disabled={loading || success}
                  >                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="pharmacy">Pharmacist</MenuItem>
                    <MenuItem value="reception">Receptionist</MenuItem>
                    <MenuItem value="technician">Lab Technician</MenuItem>
                  </Select>
                  {formErrors.role && (
                    <Typography variant="caption" color="error">
                      {formErrors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.department}>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    label="Department"
                    disabled={loading || success}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.department && (
                    <Typography variant="caption" color="error">
                      {formErrors.department}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'primary' }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;

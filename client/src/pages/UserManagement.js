import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [departments, setDepartments] = useState([]);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setSnackbar({ open: true, message: 'Failed to fetch users data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments');
      // The API returns { success: true, data: [...] }
      const departmentsData = res.data?.data || [];
      // Ensure we always set an array
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      // Fallback to some default departments if API fails
      setDepartments([
        { _id: 'd1', name: 'Cardiology' },
        { _id: 'd2', name: 'Emergency' },
        { _id: 'd3', name: 'Administration' },
        { _id: 'd4', name: 'General Medicine' },
        { _id: 'd5', name: 'Pediatrics' }
      ]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser({ ...user });
    } else {
      setCurrentUser({ name: '', email: '', role: 'doctor', department: '', status: 'active', password: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'department') {
      setCurrentUser({
        ...currentUser,
        department: departments.find(dept => dept._id === value)
      });
    } else {
      setCurrentUser({
        ...currentUser,
        [name]: value
      });
    }
  };
  const handleSubmit = async () => {
    try {
      if (currentUser._id) {
        // Update existing user
        await api.put(`/api/users/${currentUser._id}`, currentUser);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        // Add new user
        await api.post('/api/users', currentUser);
        setSnackbar({ open: true, message: 'User added successfully', severity: 'success' });
      }
      // Refresh users list
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to save user data', 
        severity: 'error' 
      });
    }
  };
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/users/${userId}`);
        fetchUsers();
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
        setSnackbar({ 
          open: true, 
          message: err.response?.data?.message || 'Failed to delete user', 
          severity: 'error' 
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add New User
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>                <TableCell>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </TableCell>
                <TableCell>{user.department?.name || 'Not assigned'}</TableCell>                <TableCell>
                  <Box 
                    sx={{ 
                      bgcolor: (user.status || 'active') === 'active' ? 'success.light' : 'error.light',
                      color: 'white',
                      p: 0.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      textAlign: 'center',
                      minWidth: 80
                    }}
                  >
                    {(user.status || 'active').toUpperCase()}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteUser(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>        </Table>
      </TableContainer>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentUser?._id ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Full Name"
              value={currentUser?.name || ''}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              name="email"
              label="Email"
              type="email"
              value={currentUser?.email || ''}
              onChange={handleInputChange}
              required
            />
            {!currentUser?._id && (
              <TextField
                fullWidth
                margin="dense"
                name="password"
                label="Password"
                type="password"
                value={currentUser?.password || ''}
                onChange={handleInputChange}
                required
              />
            )}
            <TextField
              fullWidth
              margin="dense"
              name="role"
              label="Role"
              select
              value={currentUser?.role || 'doctor'}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="pharmacist">Pharmacist</MenuItem>
            </TextField>            <TextField
              fullWidth
              margin="dense"
              name="department"
              label="Department"
              select
              value={currentUser?.department?._id || currentUser?.department || ''}
              onChange={handleInputChange}
              required
            >              {(departments || []).map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="dense"
              name="status"
              label="Status"
              select
              value={currentUser?.status || 'active'}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
          >
            {currentUser?._id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;

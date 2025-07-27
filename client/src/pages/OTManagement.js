import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import socketService from '../utils/socket';
import api from '../utils/api';

const OTManagement = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [surgeons, setSurgeons] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    otNumber: '',
    surgeryType: '',
    surgeons: [],
    assistingStaff: [],
    scheduledDate: new Date(),
    priority: 'normal',
    preOpNotes: '',
    status: 'scheduled'
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Fetch operations
  const fetchOperations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/operations');
      setOperations(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch operations');
    } finally {
      setLoading(false);
    }
  };
  // Fetch staff, patients
  const fetchRelatedData = async () => {
    try {
      const [surgeonsRes, patientsRes] = await Promise.all([
        api.get('/api/users?role=doctor'),
        api.get('/api/patients')
      ]);
      setSurgeons(surgeonsRes.data?.data || surgeonsRes.data || []);
      setPatients(patientsRes.data?.data || patientsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch related data:', err);
    }
  };

  useEffect(() => {
    fetchOperations();
    fetchRelatedData();
      // Socket.io listeners for real-time updates
    socketService.events.on('operation-created', (operation) => {
      setOperations(prev => [operation, ...(prev || [])]);
    });
    
    socketService.events.on('operation-updated', (updatedOperation) => {
      setOperations(prev => 
        (prev || []).map(op => op._id === updatedOperation._id ? updatedOperation : op)
      );
    });
    
    socketService.events.on('operation-deleted', (id) => {
      setOperations(prev => (prev || []).filter(op => op._id !== id));
    });

    // Connect to socket
    socketService.emitters.connect();

    return () => {
      socketService.events.on('operation-created', null);
      socketService.events.on('operation-updated', null);
      socketService.events.on('operation-deleted', null);
      socketService.emitters.disconnect();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, scheduledDate: newDate });
  };

  const handleMultiSelectChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleClickOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      patient: '',
      otNumber: '',
      surgeryType: '',
      surgeons: [],
      assistingStaff: [],
      scheduledDate: new Date(),
      priority: 'normal',
      preOpNotes: '',
      status: 'scheduled'
    });
    setFormErrors({});
  };

  const handleEdit = (operation) => {
    setSelectedOperation(operation);
    setFormData({
      patient: operation.patient._id,
      otNumber: operation.otNumber,
      surgeryType: operation.surgeryType,
      surgeons: operation.surgeons.map(surgeon => surgeon._id),
      assistingStaff: operation.assistingStaff ? operation.assistingStaff.map(staff => staff._id) : [],
      scheduledDate: new Date(operation.scheduledDate),
      priority: operation.priority,
      preOpNotes: operation.preOpNotes || '',
      status: operation.status
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.patient) errors.patient = 'Patient is required';
    if (!formData.otNumber) errors.otNumber = 'OT number is required';
    if (!formData.surgeryType) errors.surgeryType = 'Surgery type is required';
    if (formData.surgeons.length === 0) errors.surgeons = 'At least one surgeon is required';
    if (!formData.scheduledDate) errors.scheduledDate = 'Scheduled date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (isEdit) {
        await api.put(`/api/operations/${selectedOperation._id}`, formData);
      } else {
        await api.post('/api/operations', formData);
      }
      
      handleClose();
      fetchOperations();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/operations/${id}/status`, { status });
      fetchOperations();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this operation?')) {
      try {
        await api.delete(`/api/operations/${id}`);
        fetchOperations();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOperations = (operations || []).filter(operation => {
    return (
      operation.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation.surgeryType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation.otNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3498db';
      case 'in-progress': return '#f39c12';
      case 'completed': return '#2ecc71';
      case 'cancelled': return '#e74c3c';
      case 'postponed': return '#95a5a6';
      default: return '#3498db';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Operation Theater Management
      </Typography>
      
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            label="Search operations"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ width: '300px' }}
          />
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
          >
            Add New Operation
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>OT Number</TableCell>
                    <TableCell>Surgery Type</TableCell>
                    <TableCell>Scheduled Date</TableCell>
                    <TableCell>Surgeons</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOperations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((operation) => (
                      <TableRow key={operation._id}>
                        <TableCell>{operation.patient?.name || 'N/A'}</TableCell>
                        <TableCell>{operation.otNumber}</TableCell>
                        <TableCell>{operation.surgeryType}</TableCell>
                        <TableCell>
                          {format(new Date(operation.scheduledDate), 'PPpp')}
                        </TableCell>
                        <TableCell>
                          {operation.surgeons?.map(surgeon => (
                            <Chip 
                              key={surgeon._id} 
                              label={surgeon.name} 
                              size="small" 
                              sx={{ m: 0.5 }} 
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={operation.status} 
                            sx={{ 
                              backgroundColor: getStatusColor(operation.status),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(operation)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(operation._id)}
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          
                          {operation.status === 'scheduled' && (
                            <IconButton 
                              size="small"
                              color="success"
                              onClick={() => handleUpdateStatus(operation._id, 'in-progress')}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
                          
                          {operation.status === 'in-progress' && (
                            <IconButton 
                              size="small"
                              color="info"
                              onClick={() => handleUpdateStatus(operation._id, 'completed')}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOperations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Add/Edit Operation Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? 'Edit Operation' : 'Add New Operation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.patient}>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patient"
                  value={formData.patient}
                  onChange={handleInputChange}
                  label="Patient"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.patient && (
                  <Typography color="error" variant="caption">
                    {formErrors.patient}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="OT Number"
                name="otNumber"
                value={formData.otNumber}
                onChange={handleInputChange}
                error={!!formErrors.otNumber}
                helperText={formErrors.otNumber}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Surgery Type"
                name="surgeryType"
                value={formData.surgeryType}
                onChange={handleInputChange}
                error={!!formErrors.surgeryType}
                helperText={formErrors.surgeryType}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.surgeons}>
                <InputLabel>Surgeons</InputLabel>
                <Select
                  multiple
                  name="surgeons"
                  value={formData.surgeons}
                  onChange={(e) => handleMultiSelectChange(e, 'surgeons')}
                  label="Surgeons"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const surgeon = surgeons.find(s => s._id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={surgeon ? surgeon.name : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {surgeons.map((surgeon) => (
                    <MenuItem key={surgeon._id} value={surgeon._id}>
                      {surgeon.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.surgeons && (
                  <Typography color="error" variant="caption">
                    {formErrors.surgeons}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assisting Staff</InputLabel>
                <Select
                  multiple
                  name="assistingStaff"
                  value={formData.assistingStaff}
                  onChange={(e) => handleMultiSelectChange(e, 'assistingStaff')}
                  label="Assisting Staff"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const assistant = assistants.find(a => a._id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={assistant ? assistant.name : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {assistants.map((assistant) => (
                    <MenuItem key={assistant._id} value={assistant._id}>
                      {assistant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Scheduled Date & Time"
                  value={formData.scheduledDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth
                      error={!!formErrors.scheduledDate}
                      helperText={formErrors.scheduledDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Pre-Operation Notes"
                name="preOpNotes"
                value={formData.preOpNotes}
                onChange={handleInputChange}
              />
            </Grid>
            
            {isEdit && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="postponed">Postponed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OTManagement;

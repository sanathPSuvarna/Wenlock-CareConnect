import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Emergency as EmergencyIcon,
  LocalHospital as LocalHospitalIcon,
  NotificationsActive as NotificationsActiveIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import TokenCard from '../components/UI/TokenCard';
import socketService from '../utils/socket';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function to display token number in a user-readable format
const formatTokenNumber = (tokenNumber) => {
  if (!tokenNumber) return '-';
  // No need for complex formatting since we're using a simple DEPT-000 format
  return tokenNumber;
};

// Helper function to render token number with appropriate styling
const renderTokenNumber = (patient) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {patient.emergency && (
      <Chip 
        label="EMERGENCY" 
        color="error" 
        size="small" 
        sx={{ mr: 1, fontWeight: 'bold' }} 
      />
    )}
    <Typography 
      variant="body2" 
      sx={{ 
        fontWeight: 'bold', 
        border: '1px solid #ccc', 
        borderRadius: 1,
        padding: '4px 8px',
        bgcolor: '#f5f5f5',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
      }}
    >
      {formatTokenNumber(patient.tokenNumber)}
    </Typography>
  </Box>
);

const PatientManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contactNumber: '',
    address: '',
    department: '',
    doctor: '',
    appointmentDate: '',
    emergency: false,
    notes: ''
  });  const [formErrors, setFormErrors] = useState({});  const [tabValue, setTabValue] = useState(0);
  const [viewPatientDetails, setViewPatientDetails] = useState(false);
  const [showTokenCard, setShowTokenCard] = useState(false);
  const [openTokenDialog, setOpenTokenDialog] = useState(false); // New state for token display modal
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Mock data loading
  useEffect(() => {
    // Connect to socket for real-time updates
    socketService.emitters.connect();
    
    // Set up socket listeners
    socketService.events.on('patient-created', (patient) => {
      setPatients(prev => [patient, ...prev]);
    });
    
    socketService.events.on('patient-updated', (updatedPatient) => {
      setPatients(prev => 
        prev.map(p => p._id === updatedPatient._id ? updatedPatient : p)
      );
    });
    
    socketService.events.on('patient-deleted', (id) => {
      setPatients(prev => prev.filter(p => p._id !== id));
    });
    
    // Simulate fetching data
    const fetchData = async () => {
      try {
        // In a real app, this would be API calls
        setTimeout(() => {
          // Mock departments
          const mockDepartments = [
            { _id: 'd1', name: 'Cardiology', code: 'CARD', location: 'Block A, 2nd Floor' },
            { _id: 'd2', name: 'Orthopedics', code: 'ORTH', location: 'Block B, 1st Floor' },
            { _id: 'd3', name: 'Pediatrics', code: 'PEDS', location: 'Block C, Ground Floor' },
            { _id: 'd4', name: 'General Medicine', code: 'GEN', location: 'Block A, 1st Floor' },
            { _id: 'd5', name: 'ENT', code: 'ENT', location: 'Block B, 2nd Floor' }
          ];
          
          // Mock doctors
          const mockDoctors = [
            { _id: 'doc1', name: 'Dr. Sharma', department: 'd1', specialization: 'Cardiologist' },
            { _id: 'doc2', name: 'Dr. Patel', department: 'd1', specialization: 'Cardiac Surgeon' },
            { _id: 'doc3', name: 'Dr. Kumar', department: 'd2', specialization: 'Orthopedic Surgeon' },
            { _id: 'doc4', name: 'Dr. Verma', department: 'd3', specialization: 'Pediatrician' },
            { _id: 'doc5', name: 'Dr. Gupta', department: 'd4', specialization: 'General Physician' },
            { _id: 'doc6', name: 'Dr. Singh', department: 'd5', specialization: 'ENT Specialist' }
          ];
            // Mock patients
          const mockPatients = [
            {
              _id: 'p1',
              name: 'Rohit Kumar',
              age: 45,
              gender: 'male',
              contactNumber: '9876543210',
              address: '123 Main St, Mangalore',
              department: { _id: 'd1', name: 'Cardiology', code: 'CARD' },
              doctor: { _id: 'doc1', name: 'Dr. Sharma' },
              appointmentDate: '2025-06-02T10:30:00.000Z',
              status: 'waiting',
              tokenNumber: 'CARD-001',
              emergency: false,
              notes: 'Regular check-up for hypertension',
              createdAt: '2025-06-01T18:30:00.000Z',
              prescriptions: []
            },
            {
              _id: 'p2',
              name: 'Priya Singh',
              age: 32,
              gender: 'female',
              contactNumber: '8765432109',
              address: '456 Park Ave, Mangalore',
              department: { _id: 'd2', name: 'Orthopedics', code: 'ORTH' },
              doctor: { _id: 'doc3', name: 'Dr. Kumar' },
              appointmentDate: '2025-06-02T11:00:00.000Z',
              status: 'in-consultation',
              tokenNumber: 'ORTH-002',
              emergency: false,
              notes: 'Follow-up for knee surgery',
              createdAt: '2025-06-01T20:15:00.000Z',
              prescriptions: [
                {
                  medication: 'Diclofenac',
                  dosage: '50mg',
                  frequency: 'Twice daily',
                  duration: '5 days',
                  notes: 'Take after meals',
                  prescribed: '2025-05-20T14:30:00.000Z'
                }
              ]
            },
            {
              _id: 'p3',
              name: 'Abdul Karim',
              age: 8,
              gender: 'male',
              contactNumber: '7654321098',
              address: '789 School Rd, Mangalore',
              department: { _id: 'd3', name: 'Pediatrics', code: 'PEDS' },
              doctor: { _id: 'doc4', name: 'Dr. Verma' },
              appointmentDate: '2025-06-02T09:00:00.000Z',
              status: 'completed',
              tokenNumber: 'PEDS-003',
              emergency: false,
              notes: 'Vaccination and routine check-up',
              createdAt: '2025-06-01T21:00:00.000Z',
              prescriptions: []
            },
            {
              _id: 'p4',
              name: 'Lakshmi Devi',
              age: 65,
              gender: 'female',
              contactNumber: '9876123450',
              address: '234 Elders Colony, Mangalore',
              department: { _id: 'd4', name: 'General Medicine', code: 'GEN' },
              doctor: { _id: 'doc5', name: 'Dr. Gupta' },
              appointmentDate: '2025-06-02T12:15:00.000Z',
              status: 'waiting',
              tokenNumber: 'E-GEN-004',
              emergency: true,
              notes: 'Severe breathing difficulty, possible pneumonia',
              createdAt: '2025-06-02T07:30:00.000Z',
              prescriptions: []
            },
            {
              _id: 'p5',
              name: 'Vikram Joshi',
              age: 28,
              gender: 'male',
              contactNumber: '8123456790',
              address: '567 Beach Road, Mangalore',
              department: { _id: 'd5', name: 'ENT', code: 'ENT' },
              doctor: { _id: 'doc6', name: 'Dr. Singh' },
              appointmentDate: '2025-06-02T14:00:00.000Z',
              status: 'waiting',
              tokenNumber: 'ENT-005',
              emergency: false,
              notes: 'Recurring ear infection',
              createdAt: '2025-06-01T19:45:00.000Z',
              prescriptions: []
            }
          ];
          
          setDepartments(mockDepartments);
          setDoctors(mockDoctors);
          setPatients(mockPatients);
          setLoading(false);
        }, 1200);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };    fetchData();

    // Cleanup socket connections on unmount
    return () => {
      socketService.events.on('patient-created', null);
      socketService.events.on('patient-updated', null);
      socketService.events.on('patient-deleted', null);
      socketService.emitters.disconnect();
    };
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // Filter patients based on search term and filters
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         patient.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.contactNumber.includes(searchTerm);
    
    const matchesDepartment = filterDepartment === '' || 
                             patient.department._id === filterDepartment;
    
    const matchesStatus = filterStatus === '' || 
                         patient.status === filterStatus;
    
    const matchesDoctor = filterDoctor === '' || 
                         patient.doctor._id === filterDoctor;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesDoctor;
  });

  // Calculate pagination
  const paginatedPatients = filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.age) errors.age = 'Age is required';
    else if (isNaN(formData.age) || formData.age <= 0) errors.age = 'Enter valid age';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.contactNumber) errors.contactNumber = 'Contact number is required';
    else if (formData.contactNumber.length !== 10) errors.contactNumber = 'Enter valid 10-digit number';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.doctor) errors.doctor = 'Doctor is required';
    if (!formData.appointmentDate) errors.appointmentDate = 'Appointment date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open dialog for adding new patient
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      age: '',
      gender: '',
      contactNumber: '',
      address: '',
      department: '',
      doctor: '',
      appointmentDate: '',
      emergency: false,
      notes: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for editing patient
  const handleOpenEditDialog = (patient) => {
    setDialogMode('edit');
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      address: patient.address,
      department: patient.department._id,
      doctor: patient.doctor._id,
      appointmentDate: patient.appointmentDate.split('T')[0], // Extract date part only
      emergency: patient.emergency,
      notes: patient.notes
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // View patient details
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setViewPatientDetails(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (dialogMode === 'add') {
      // In a real app, this would be an API call to add the patient
      const newPatient = {
        _id: `p${patients.length + 1}`,
        ...formData,
        department: departments.find(dept => dept._id === formData.department),
        doctor: doctors.find(doc => doc._id === formData.doctor),
        status: 'waiting',
        tokenNumber: `${departments.find(dept => dept._id === formData.department).code}-${(patients.length + 1).toString().padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        prescriptions: []
      };
      
      setPatients([...patients, newPatient]);
    } else {
      // In a real app, this would be an API call to update the patient
      const updatedPatients = patients.map(p => {
        if (p._id === selectedPatient._id) {
          return {
            ...p,
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            contactNumber: formData.contactNumber,
            address: formData.address,
            department: departments.find(dept => dept._id === formData.department),
            doctor: doctors.find(doc => doc._id === formData.doctor),
            appointmentDate: formData.appointmentDate,
            emergency: formData.emergency,
            notes: formData.notes
          };
        }
        return p;
      });
      
      setPatients(updatedPatients);
    }
    
    handleCloseDialog();
  };

  // Handle delete patient
  const handleDeletePatient = (patientId) => {
    // In a real app, this would be an API call to delete the patient
    const updatedPatients = patients.filter(p => p._id !== patientId);
    setPatients(updatedPatients);
  };
  // Handle patient status change
  const handleStatusChange = (patientId, newStatus) => {
    // In a real app, this would be an API call to update the status
    const updatedPatients = patients.map(p => {
      if (p._id === patientId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    
    setPatients(updatedPatients);
  };
  
  // Handle showing token card
  const handleShowTokenCard = () => {
    setShowTokenCard(true);
  };
  // Handle closing token card
  const handleCloseTokenCard = () => {
    setShowTokenCard(false);
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'warning';
      case 'in-consultation':
        return 'info';
      case 'completed':
        return 'success';
      case 'no-show':
        return 'error';
      case 'rescheduled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // If viewing patient details
  if (viewPatientDetails && selectedPatient) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setViewPatientDetails(false)}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Patient Details
          </Typography>
          {selectedPatient.emergency && (
            <Chip 
              icon={<EmergencyIcon />} 
              label="Emergency" 
              color="error" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
              </Box>
              <Typography><strong>Name:</strong> {selectedPatient.name}</Typography>
              <Typography><strong>Age:</strong> {selectedPatient.age} years</Typography>
              <Typography><strong>Gender:</strong> {selectedPatient.gender}</Typography>
              <Typography><strong>Contact:</strong> {selectedPatient.contactNumber}</Typography>
              <Typography><strong>Address:</strong> {selectedPatient.address}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospitalIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom>
                  Medical Information
                </Typography>
              </Box>              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1"><strong>Token Number:</strong></Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    ml: 1,
                    fontWeight: 'bold', 
                    border: '1px solid #ccc', 
                    borderRadius: 1,
                    padding: '4px 8px',
                    bgcolor: '#f5f5f5',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px'
                  }}
                >
                  {formatTokenNumber(selectedPatient.tokenNumber)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ReceiptIcon />}
                  sx={{ ml: 2 }}
                  onClick={handleShowTokenCard}
                >
                  View Token Card
                </Button>
              </Box>
              <Typography><strong>Department:</strong> {selectedPatient.department.name}</Typography>
              <Typography><strong>Doctor:</strong> {selectedPatient.doctor.name}</Typography>
              <Typography>
                <strong>Appointment:</strong> {new Date(selectedPatient.appointmentDate).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Status:</strong> 
                <Chip 
                  label={selectedPatient.status}
                  size="small"
                  color={getStatusChipColor(selectedPatient.status)}
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsActiveIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom>
                  Status Actions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="warning"
                  onClick={() => handleStatusChange(selectedPatient._id, 'waiting')}
                  size="small"
                >
                  Set Waiting
                </Button>
                <Button 
                  variant="outlined" 
                  color="info"
                  onClick={() => handleStatusChange(selectedPatient._id, 'in-consultation')}
                  size="small"
                >
                  Start Consultation
                </Button>
                <Button 
                  variant="outlined" 
                  color="success"
                  onClick={() => handleStatusChange(selectedPatient._id, 'completed')}
                  size="small"
                >
                  Complete
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => handleStatusChange(selectedPatient._id, 'no-show')}
                  size="small"
                >
                  Mark No-Show
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => handleStatusChange(selectedPatient._id, 'rescheduled')}
                  size="small"
                >
                  Reschedule
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes & Medical History
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedPatient.notes || 'No notes available.'}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Prescriptions & Medications
          </Typography>
          
          {selectedPatient.prescriptions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Medication</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Date Prescribed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPatient.prescriptions.map((prescription, index) => (
                    <TableRow key={index}>
                      <TableCell>{prescription.medication}</TableCell>
                      <TableCell>{prescription.dosage}</TableCell>
                      <TableCell>{prescription.frequency}</TableCell>
                      <TableCell>{prescription.duration}</TableCell>
                      <TableCell>{prescription.notes}</TableCell>
                      <TableCell>
                        {new Date(prescription.prescribed).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No prescriptions recorded.</Typography>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary">
              Add New Prescription
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Patient Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add New Patient
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Patients" />
          <Tab label="Waiting Queue" />
          <Tab label="In Consultation" />
          <Tab label="Completed" />
          <Tab label="Emergency" />
        </Tabs>
      </Paper>      {/* Search and Filter */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Patients"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Name, Token Number, Contact..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Filter by Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Doctor</InputLabel>
              <Select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                label="Filter by Doctor"
              >
                <MenuItem value="">All Doctors</MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="waiting">Waiting</MenuItem>
                <MenuItem value="in-consultation">In Consultation</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="no-show">No Show</MenuItem>
                <MenuItem value="rescheduled">Rescheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterDepartment('');
                setFilterStatus('');
                setFilterDoctor('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Patients Table */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Age/Gender</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Appointment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      {renderTokenNumber(patient)}
                    </TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age}/{patient.gender.charAt(0).toUpperCase()}</TableCell>
                    <TableCell>{patient.department.name}</TableCell>
                    <TableCell>{patient.doctor.name}</TableCell>
                    <TableCell>
                      {new Date(patient.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.status}
                        size="small"
                        color={getStatusChipColor(patient.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewPatient(patient)}
                        size="small"
                      >
                        <PersonIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenEditDialog(patient)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeletePatient(patient._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPatients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </TabPanel>

      {/* Waiting Patients Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Appointment Time</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>
              {filteredPatients
                .filter(p => p.status === 'waiting')
                .map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      {renderTokenNumber(patient)}
                    </TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.department.name}</TableCell>
                    <TableCell>{patient.doctor.name}</TableCell>
                    <TableCell>
                      {new Date(patient.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => handleStatusChange(patient._id, 'in-consultation')}
                      >
                        Start Consultation
                      </Button>
                    </TableCell>
                  </TableRow>                ))}
              {filteredPatients.filter(p => p.status === 'waiting').length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No patients in waiting queue
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* In Consultation Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>
              {filteredPatients
                .filter(p => p.status === 'in-consultation')
                .map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      {renderTokenNumber(patient)}
                    </TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.department.name}</TableCell>
                    <TableCell>{patient.doctor.name}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleStatusChange(patient._id, 'completed')}
                      >
                        Complete
                      </Button>
                    </TableCell>
                  </TableRow>                ))}
              {filteredPatients.filter(p => p.status === 'in-consultation').length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No patients in consultation
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Completed Tab */}
      <TabPanel value={tabValue} index={3}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>
              {filteredPatients
                .filter(p => p.status === 'completed')
                .map((patient) => (<TableRow key={patient._id} hover>
                    <TableCell>
                      {renderTokenNumber(patient)}
                    </TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.department.name}</TableCell>
                    <TableCell>{patient.doctor.name}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewPatient(patient)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>                ))}
              {filteredPatients.filter(p => p.status === 'completed').length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No completed consultations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Emergency Tab */}
      <TabPanel value={tabValue} index={4}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>
              {filteredPatients
                .filter(p => p.emergency)
                .map((patient) => (<TableRow key={patient._id} hover>
                    <TableCell>
                      {renderTokenNumber(patient)}
                    </TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.department.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.status}
                        size="small"
                        color={getStatusChipColor(patient.status)}
                      />
                    </TableCell>
                    <TableCell>{patient.notes.substring(0, 50)}...</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewPatient(patient)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>                ))}
              {filteredPatients.filter(p => p.emergency).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No emergency cases
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Add/Edit Patient Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Patient' : 'Edit Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleFormChange}
                error={!!formErrors.age}
                helperText={formErrors.age}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={!!formErrors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formErrors.gender && (
                  <Typography variant="caption" color="error">
                    {formErrors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleFormChange}
                error={!!formErrors.contactNumber}
                helperText={formErrors.contactNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={(e) => {
                    // Reset doctor when department changes
                    setFormData({
                      ...formData,
                      department: e.target.value,
                      doctor: ''
                    });
                  }}
                  label="Department"
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.doctor}>
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleFormChange}
                  label="Doctor"
                  disabled={!formData.department}
                >
                  {doctors
                    .filter(doc => !formData.department || doc.department === formData.department)
                    .map((doc) => (
                      <MenuItem key={doc._id} value={doc._id}>
                        {doc.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.doctor && (
                  <Typography variant="caption" color="error">
                    {formErrors.doctor}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Date & Time"
                name="appointmentDate"
                type="datetime-local"
                value={formData.appointmentDate}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!formErrors.appointmentDate}
                helperText={formErrors.appointmentDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Emergency Case?</InputLabel>
                <Select
                  name="emergency"
                  value={formData.emergency}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency: e.target.value === 'true'
                  })}
                  label="Emergency Case?"
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add Patient' : 'Update Patient'}
          </Button>
        </DialogActions>
      </Dialog>      {/* Token Card Dialog */}
      <Dialog
        open={showTokenCard}
        onClose={handleCloseTokenCard}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {selectedPatient && (
            <TokenCard 
              patient={selectedPatient} 
              onClose={handleCloseTokenCard}
            />
          )}
        </DialogContent>
      </Dialog>      {/* Notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientManagement;

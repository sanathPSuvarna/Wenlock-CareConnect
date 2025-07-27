import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  Alert,
  ButtonGroup
} from '@mui/material';
import {
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Apartment as ApartmentIcon,
  Warning as WarningIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DirectionsWalk as DirectionsWalkIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    patientStats: {},
    departmentStats: [],
    otStatus: {},
    pharmacyStats: {},
    notifications: []
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real application, we would make API calls to fetch this data
        // For now, let's mock the data
        setTimeout(() => {
          setDashboardData({
            patientStats: {
              total: 152,
              new: 28,
              waiting: 42,
              completed: 110,
              emergency: 5
            },
            departmentStats: [
              { name: 'Cardiology', code: 'CARD', totalPatientsToday: 38, waitingPatients: 12, completedPatients: 26, emergencyPatients: 2 },
              { name: 'Orthopedics', code: 'ORTH', totalPatientsToday: 29, waitingPatients: 9, completedPatients: 20, emergencyPatients: 1 },
              { name: 'Pediatrics', code: 'PEDS', totalPatientsToday: 45, waitingPatients: 15, completedPatients: 30, emergencyPatients: 0 },
              { name: 'General Medicine', code: 'GEN', totalPatientsToday: 40, waitingPatients: 6, completedPatients: 34, emergencyPatients: 2 }
            ],
            otStatus: {
              'OT 1': { status: 'occupied', currentOperation: 'Cardiac Bypass', startTime: '09:30 AM', estimatedEndTime: '01:30 PM' },
              'OT 2': { status: 'available', nextOperation: 'Appendectomy', scheduledTime: '02:00 PM' },
              'OT 3': { status: 'occupied', currentOperation: 'Hip Replacement', startTime: '10:00 AM', estimatedEndTime: '12:30 PM' },
              'OT 4': { status: 'available', nextOperation: null }
            },
            pharmacyStats: {
              totalItems: 543,
              lowStockItems: 12,
              expiredItems: 3,
              totalValue: 256000,
              mostPrescribed: ['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Metformin', 'Atorvastatin']
            },
            notifications: [
              { type: 'emergency', message: 'Emergency case arriving in 5 minutes', time: '10 minutes ago' },
              { type: 'ot', message: 'OT 2 is now available', time: '30 minutes ago' },
              { type: 'pharmacy', message: 'Low stock alert: Insulin', time: '1 hour ago' },
              { type: 'patient', message: 'New patient registered in Cardiology', time: '2 hours ago' }
            ]
          });
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data for patient statistics
  const patientChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Patient Visits',
        data: [650, 590, 800, 810, 960, 880],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for department distribution
  const departmentChartData = {
    labels: dashboardData.departmentStats.map(dept => dept.name),
    datasets: [
      {
        label: 'Patients Today',
        data: dashboardData.departmentStats.map(dept => dept.totalPatientsToday),
        backgroundColor: [
          'rgba(37, 99, 235, 0.7)',
          'rgba(217, 119, 6, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
    },
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

  return (
    <Box>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {userInfo.name}! Here's what's happening at Wenlock Hospital today.
        </Typography>
      </Box>      {/* Main content begins here */}

      {/* Department Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Department View
        </Typography>
        <ButtonGroup variant="outlined" aria-label="department selector">
          <Button 
            variant={selectedDepartment === 'all' ? 'contained' : 'outlined'} 
            onClick={() => setSelectedDepartment('all')}
          >
            All Departments
          </Button>
          {dashboardData.departmentStats.map((dept) => (
            <Button
              key={dept.code}
              variant={selectedDepartment === dept.code ? 'contained' : 'outlined'}
              onClick={() => setSelectedDepartment(dept.code)}
            >
              {dept.name}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Department Statistics */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
            <CardHeader 
              title="Department Statistics" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ApartmentIcon />
                </Avatar>
              }
            />
            <Divider />            <CardContent sx={{ height: 'calc(100% - 76px)', overflow: 'auto' }}>
              <Box sx={{ mt: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Department Summary
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {dashboardData.departmentStats.map((dept) => (
                    <Grid item xs={12} sm={6} key={dept.code}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: selectedDepartment === dept.code ? 'primary.light' : 'background.default',
                          color: selectedDepartment === dept.code ? 'white' : 'inherit'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {dept.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2">
                            Total: {dept.totalPatientsToday}
                          </Typography>
                          <Typography variant="body2">
                            Waiting: {dept.waitingPatients}
                          </Typography>
                          <Typography variant="body2">
                            Completed: {dept.completedPatients}
                          </Typography>
                          {dept.emergencyPatients > 0 && (
                            <Typography variant="body2" color="error.main">
                              Emergency: {dept.emergencyPatients}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Operation Theater Status */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
            <CardHeader 
              title="Operation Theater Status" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <MedicalServicesIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent sx={{ height: 'calc(100% - 76px)', overflow: 'auto' }}>
              <List>
                {Object.entries(dashboardData.otStatus).map(([otName, otData]) => (
                  <React.Fragment key={otName}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: otData.status === 'occupied' ? 'error.main' : 'success.main' }}>
                          <MedicalServicesIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight="bold">{otName}</Typography>
                            <Chip 
                              label={otData.status === 'occupied' ? 'In Use' : 'Available'} 
                              size="small"
                              color={otData.status === 'occupied' ? 'error' : 'success'}
                            />
                          </Box>
                        }
                        secondary={
                          otData.status === 'occupied' ? (
                            <>
                              <Typography variant="body2">
                                <b>Current Operation:</b> {otData.currentOperation}
                              </Typography>
                              <Typography variant="body2">
                                <b>Started:</b> {otData.startTime} | <b>Est. End:</b> {otData.estimatedEndTime}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2">
                              {otData.nextOperation ? (
                                <>
                                  <b>Next Operation:</b> {otData.nextOperation} at {otData.scheduledTime}
                                </>
                              ) : (
                                'No operations scheduled'
                              )}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>

              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                >
                  View Full OT Schedule
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>        {/* Patient Stats Chart removed */}

        {/* Pharmacy Quick View */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardHeader 
              title="Pharmacy Status" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <LocalPharmacyIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {dashboardData.pharmacyStats.totalItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Items
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {dashboardData.pharmacyStats.lowStockItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Stock Items
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Most Prescribed Medications
                </Typography>
                <List dense>
                  {dashboardData.pharmacyStats.mostPrescribed.map((med, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.light', width: 30, height: 30 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={med} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                >
                  View Inventory
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardHeader 
              title="Recent Notifications" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <Divider />
            <CardContent>
              <List>
                {dashboardData.notifications.map((notification, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: 
                          notification.type === 'emergency' ? 'error.light' : 
                          notification.type === 'ot' ? 'secondary.light' :
                          notification.type === 'pharmacy' ? 'success.light' : 'primary.light'
                      }}>
                        {notification.type === 'emergency' ? <WarningIcon /> : 
                         notification.type === 'ot' ? <MedicalServicesIcon /> :
                         notification.type === 'pharmacy' ? <LocalPharmacyIcon /> : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={notification.message}
                      secondary={notification.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

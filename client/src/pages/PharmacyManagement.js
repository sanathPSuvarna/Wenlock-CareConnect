import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  TablePagination,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isAfter } from 'date-fns';
import api from '../utils/api';
import socketService from '../utils/socket';

const PharmacyManagement = () => {
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  const userRole = userInfo?.role || 'reception';
  
  // Check if user can edit (only pharmacists can edit)
  const canEdit = userRole === 'pharmacy' || userRole === 'admin';
  
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    dosageForm: 'tablet',
    strength: '',
    manufacturer: '',
    currentStock: 0,
    reorderLevel: 10,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year in the future
    batchNumber: '',
    unitPrice: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySummary, setInventorySummary] = useState({
    totalItems: 0,
    lowStock: 0,
    expired: 0,
    totalValue: 0
  });  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false);
  const [stockUpdateData, setStockUpdateData] = useState({
    medicationId: '',
    quantity: 0,
    action: 'add'
  });
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [viewMedication, setViewMedication] = useState(null);  const fetchMedications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/pharmacy');
      setMedications(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medications');
      setMedications([]); // Ensure medications is always an array
    } finally {
      setLoading(false);
    }
  };
  const fetchInventorySummary = async () => {
    try {
      const res = await api.get('/api/pharmacy/dashboard');
      setInventorySummary(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory summary:', err);
    }
  };

  useEffect(() => {
    fetchMedications();
    fetchInventorySummary();    // Socket.io listeners for real-time updates
    socketService.events.on('medication-created', (medication) => {
      setMedications(prev => [medication, ...prev]);
      fetchInventorySummary();
    });
    
    socketService.events.on('medication-updated', (updatedMedication) => {
      setMedications(prev => 
        prev.map(med => med._id === updatedMedication._id ? updatedMedication : med)
      );
      fetchInventorySummary();
    });
    
    socketService.events.on('medication-deleted', (id) => {
      setMedications(prev => prev.filter(med => med._id !== id));
      fetchInventorySummary();
    });

    socketService.events.on('stock-updated', (updatedMedication) => {
      setMedications(prev => 
        prev.map(med => med._id === updatedMedication._id ? updatedMedication : med)
      );
      fetchInventorySummary();
    });
    
    // Connect to socket
    socketService.emitters.connect();

    return () => {
      socketService.events.on('medication-created', null);
      socketService.events.on('medication-updated', null);
      socketService.events.on('medication-deleted', null);
      socketService.events.on('stock-updated', null);
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
    setFormData({ ...formData, expiryDate: newDate });
  };

  const handleClickOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      name: '',
      genericName: '',
      category: '',
      dosageForm: 'tablet',
      strength: '',
      manufacturer: '',
      currentStock: 0,
      reorderLevel: 10,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      batchNumber: '',
      unitPrice: 0
    });
    setFormErrors({});
  };

  const handleEdit = (medication) => {
    setSelectedMedication(medication);
    setFormData({
      name: medication.name,
      genericName: medication.genericName,
      category: medication.category,
      dosageForm: medication.dosageForm,
      strength: medication.strength,
      manufacturer: medication.manufacturer,
      currentStock: medication.currentStock,
      reorderLevel: medication.reorderLevel,
      expiryDate: new Date(medication.expiryDate),
      batchNumber: medication.batchNumber,
      unitPrice: medication.unitPrice
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Medication name is required';
    if (!formData.genericName) errors.genericName = 'Generic name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.strength) errors.strength = 'Strength is required';
    if (!formData.manufacturer) errors.manufacturer = 'Manufacturer is required';
    if (formData.currentStock < 0) errors.currentStock = 'Stock cannot be negative';
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Reorder level cannot be negative';
    if (!formData.batchNumber) errors.batchNumber = 'Batch number is required';
    if (formData.unitPrice <= 0) errors.unitPrice = 'Unit price must be greater than zero';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (isEdit) {
        await api.put(`/api/pharmacy/${selectedMedication._id}`, formData);
      } else {
        await api.post('/api/pharmacy', formData);
      }
      
      handleClose();
      fetchMedications();
      fetchInventorySummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await api.delete(`/api/pharmacy/${id}`);
        fetchMedications();
        fetchInventorySummary();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const openStockUpdateDialog = (medication) => {
    setSelectedMedication(medication);
    setStockUpdateData({
      medicationId: medication._id,
      quantity: 0,
      action: 'add'
    });
    setShowStockUpdateDialog(true);
  };

  const closeStockUpdateDialog = () => {
    setShowStockUpdateDialog(false);
  };

  const openViewDetailsDialog = (medication) => {
    setViewMedication(medication);
    setViewDetailsDialog(true);
  };

  const closeViewDetailsDialog = () => {
    setViewDetailsDialog(false);
    setViewMedication(null);
  };

  const handleStockUpdateChange = (e) => {
    const { name, value } = e.target;
    setStockUpdateData({ ...stockUpdateData, [name]: value });
  };  const handleStockUpdate = async () => {
    try {
      const { medicationId, quantity, action } = stockUpdateData;
      
      await api.put(`/api/pharmacy/${medicationId}/stock`, { 
        quantity: Math.abs(Number(quantity)),
        action: action
      });
      
      closeStockUpdateDialog();
      fetchMedications();
      fetchInventorySummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Stock update failed');
    }
  };
  const filteredMedications = Array.isArray(medications) ? medications.filter(medication => {
    return (
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) : [];

  const isLowStock = (medication) => {
    return medication.currentStock <= medication.reorderLevel;
  };

  const isExpired = (medication) => {
    return !isAfter(new Date(medication.expiryDate), new Date());
  };

  return (    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Pharmacy Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={canEdit ? `Full Access (${userRole})` : `View Only (${userRole})`}
            color={canEdit ? 'success' : 'default'}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
      
      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have view-only access to pharmacy data. Only pharmacy staff can add, edit, or delete medications and update stock levels.
        </Alert>
      )}
      
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <LocalPharmacyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" component="div">Total Items</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
                {inventorySummary.totalItems || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: (inventorySummary.lowStock || 0) > 0 ? '#fff4e5' : 'background.paper' }}>
            <CardContent>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" component="div">Low Stock</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1, color: (inventorySummary.lowStock || 0) > 0 ? 'warning.main' : 'text.primary' }}>
                {inventorySummary.lowStock || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: (inventorySummary.expired || 0) > 0 ? '#fdeded' : 'background.paper' }}>
            <CardContent>
              <WarningIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" component="div">Expired Items</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1, color: (inventorySummary.expired || 0) > 0 ? 'error.main' : 'text.primary' }}>
                {inventorySummary.expired || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="div">Total Value</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
                ₹{(inventorySummary.totalValue || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            label="Search medications"
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
            disabled={!canEdit}
            sx={{ 
              opacity: canEdit ? 1 : 0.6,
              cursor: canEdit ? 'pointer' : 'not-allowed'
            }}
          >
            Add New Medication
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
                    <TableCell>Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Dosage Form</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Reorder Level</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMedications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((medication) => (
                      <TableRow 
                        key={medication._id}
                        sx={{
                          bgcolor: isExpired(medication) 
                            ? 'rgba(244, 67, 54, 0.08)' 
                            : isLowStock(medication) 
                              ? 'rgba(255, 152, 0, 0.08)' 
                              : 'inherit'
                        }}
                      >
                        <TableCell>{medication.name}</TableCell>
                        <TableCell>{medication.genericName}</TableCell>
                        <TableCell>{medication.category}</TableCell>
                        <TableCell>
                          {medication.dosageForm.charAt(0).toUpperCase() + medication.dosageForm.slice(1)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              sx={{ 
                                fontWeight: isLowStock(medication) ? 'bold' : 'normal',
                                color: isLowStock(medication) ? 'warning.main' : 'text.primary'
                              }}
                            >
                              {medication.currentStock}
                            </Typography>
                            {isLowStock(medication) && (
                              <Tooltip title="Low stock">
                                <WarningIcon 
                                  fontSize="small" 
                                  color="warning" 
                                  sx={{ ml: 1 }} 
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{medication.reorderLevel}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              sx={{ 
                                fontWeight: isExpired(medication) ? 'bold' : 'normal',
                                color: isExpired(medication) ? 'error.main' : 'text.primary'
                              }}
                            >
                              {format(new Date(medication.expiryDate), 'dd/MM/yyyy')}
                            </Typography>
                            {isExpired(medication) && (
                              <Tooltip title="Expired">
                                <WarningIcon 
                                  fontSize="small" 
                                  color="error" 
                                  sx={{ ml: 1 }} 
                                />
                              </Tooltip>                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {canEdit ? (
                            <>
                              <IconButton 
                                size="small" 
                                onClick={() => openStockUpdateDialog(medication)}
                                sx={{ mr: 1 }}
                                color="primary"
                                title="Update Stock"
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                              
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(medication)}
                                sx={{ mr: 1 }}
                                title="Edit Medication"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(medication._id)}
                                color="error"
                                title="Delete Medication"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton 
                              size="small" 
                              onClick={() => openViewDetailsDialog(medication)}
                              color="primary"
                              title="View Details"
                            >
                              <VisibilityIcon fontSize="small" />
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
              count={filteredMedications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Add/Edit Medication Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? 'Edit Medication' : 'Add New Medication'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medication Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Generic Name"
                name="genericName"
                value={formData.genericName}
                onChange={handleInputChange}
                error={!!formErrors.genericName}
                helperText={formErrors.genericName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                error={!!formErrors.category}
                helperText={formErrors.category}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dosage Form</InputLabel>
                <Select
                  name="dosageForm"
                  value={formData.dosageForm}
                  onChange={handleInputChange}
                  label="Dosage Form"
                >
                  <MenuItem value="tablet">Tablet</MenuItem>
                  <MenuItem value="capsule">Capsule</MenuItem>
                  <MenuItem value="injection">Injection</MenuItem>
                  <MenuItem value="syrup">Syrup</MenuItem>
                  <MenuItem value="ointment">Ointment</MenuItem>
                  <MenuItem value="cream">Cream</MenuItem>
                  <MenuItem value="drops">Drops</MenuItem>
                  <MenuItem value="inhaler">Inhaler</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Strength"
                name="strength"
                value={formData.strength}
                onChange={handleInputChange}
                error={!!formErrors.strength}
                helperText={formErrors.strength}
                placeholder="e.g., 500mg, 10ml, etc."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                error={!!formErrors.manufacturer}
                helperText={formErrors.manufacturer}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Current Stock"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleInputChange}
                error={!!formErrors.currentStock}
                helperText={formErrors.currentStock}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Reorder Level"
                name="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                error={!!formErrors.reorderLevel}
                helperText={formErrors.reorderLevel}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth
                      error={!!formErrors.expiryDate}
                      helperText={formErrors.expiryDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                error={!!formErrors.batchNumber}
                helperText={formErrors.batchNumber}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                name="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={handleInputChange}
                error={!!formErrors.unitPrice}
                helperText={formErrors.unitPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Stock Update Dialog */}
      <Dialog open={showStockUpdateDialog} onClose={closeStockUpdateDialog}>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {selectedMedication?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Current stock: {selectedMedication?.currentStock}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Action</InputLabel>              <Select
                name="action"
                value={stockUpdateData.action}
                onChange={handleStockUpdateChange}
                label="Action"
              >
                <MenuItem value="add">Add Stock</MenuItem>
                <MenuItem value="subtract">Remove Stock</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={stockUpdateData.quantity}
              onChange={handleStockUpdateChange}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStockUpdateDialog}>Cancel</Button>
          <Button 
            onClick={handleStockUpdate} 
            variant="contained" 
            color="primary"
            disabled={stockUpdateData.quantity <= 0}          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog} onClose={closeViewDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPharmacyIcon color="primary" />
            <Typography variant="h6">Medication Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewMedication && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Medication Name</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.name}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Generic Name</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.genericName}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.category}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Dosage Form</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {viewMedication.dosageForm.charAt(0).toUpperCase() + viewMedication.dosageForm.slice(1)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Strength</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.strength}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Manufacturer</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.manufacturer}</Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Current Stock</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: isLowStock(viewMedication) ? 'bold' : 'normal',
                      color: isLowStock(viewMedication) ? 'warning.main' : 'text.primary'
                    }}
                  >
                    {viewMedication.currentStock}
                  </Typography>
                  {isLowStock(viewMedication) && (
                    <Chip 
                      label="Low Stock" 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Reorder Level</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.reorderLevel}</Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Unit Price</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>₹{viewMedication.unitPrice}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Expiry Date</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontWeight: isExpired(viewMedication) ? 'bold' : 'normal',
                      color: isExpired(viewMedication) ? 'error.main' : 'text.primary'
                    }}
                  >
                    {format(new Date(viewMedication.expiryDate), 'dd/MM/yyyy')}
                  </Typography>
                  {isExpired(viewMedication) && (
                    <Chip 
                      label="Expired" 
                      color="error" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Batch Number</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{viewMedication.batchNumber}</Typography>
              </Grid>
              
              {!canEdit && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>View Only Access:</strong> You can view medication details but cannot make changes. 
                      Only pharmacy staff can edit medication information and update stock levels.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyManagement;

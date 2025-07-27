import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    roles: ['admin', 'doctor', 'nurse', 'pharmacy', 'reception']
  },
  {
    text: 'Patient Management',
    icon: <PersonIcon />,
    path: '/patients',
    roles: ['admin', 'doctor', 'nurse', 'reception']
  },
  {
    text: 'Operation Theater',
    icon: <MedicalServicesIcon />,
    path: '/operations',
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    text: 'Pharmacy',
    icon: <LocalPharmacyIcon />,
    path: '/pharmacy',
    roles: ['admin', 'pharmacy', 'doctor']
  },
  {
    text: 'User Management',
    icon: <SupervisedUserCircleIcon />,
    path: '/users',
    roles: ['admin']
  },
  {
    text: 'Departments',
    icon: <BusinessIcon />,
    path: '/departments',
    roles: ['admin']
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    roles: ['admin']
  }
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  
  const role = userInfo?.role || 'reception';
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role)
  );
  
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          transition: theme => theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: '#f8fafc',
          boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, 0.1)',
          paddingTop: 8,
        },
      }}
    >
      <Box sx={{ height: 64 }} />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={open ? '' : item.text} placement="right">
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                  borderRight: location.pathname === item.path ? '3px solid #2563eb' : 'none',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    }
                  }} 
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

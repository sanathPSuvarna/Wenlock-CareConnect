import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { DataArrayOutlined } from '@mui/icons-material';

// Initial state
const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  loading: false,
  error: null,
};

// Create auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    loginFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const { loginRequest, loginSuccess, loginFail, logout, clearError } = authSlice.actions;

// Auth actions
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const response = await api.post('/api/users/login', {
      email,
      password
    });

    const data = response.data;
    console.log(data.token)
    localStorage.setItem('token', JSON.stringify({token:data.token}));
    dispatch(loginSuccess(data));
  } catch (error) {
    dispatch(loginFail(error.message || 'Login failed'));
  }
};

// Export reducer
export default authSlice.reducer;

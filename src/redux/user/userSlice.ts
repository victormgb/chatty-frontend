import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../../lib/axios'; // Adjust path as necessary
import toast from 'react-hot-toast'; // For toast notifications
import { io, Socket } from 'socket.io-client'; // For socket.io client
import type { RootState } from '../store';

// Define your base URL
const BASE_URL = import.meta.env.VITE_API_URL;

// Define the shape of your authentication user
export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  color?: string;
  fullName?: string;
  // Add other user properties as they exist in your backend response
}

// Define the state interface for the auth slice
export interface AuthState {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[]; // Assuming user IDs are strings
  socket: Socket | null; // Type for the socket instance
  error: string | null; // To store any authentication-related errors
}

// Define the initial state
const initialState: AuthState = {
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true, // Start as true to check auth on app load
  onlineUsers: [],
  socket: null,
  error: null,
};

// Async Thunks for API calls and side effects

// Thunk to check authentication status
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log("checking authg user");
      const res = await axiosInstance.get('/auth/check');
      console.log("res", res);
      dispatch(authSlice.actions.setAuthUser(res.data));
      dispatch(connectSocket()); // Connect socket after successful auth
      return res.data;
    } catch (error: any) {
      console.error('Error in checkAuth:', error);
      dispatch(authSlice.actions.setAuthUser(null));
      const errorMessage = error.response?.data?.message || 'Failed to check authentication';
      dispatch(authSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(authSlice.actions.setIsCheckingAuth(false));
    }
  }
);

// Thunk for user signup
export const signup = createAsyncThunk(
  'auth/signup',
  async (data: any, { dispatch, rejectWithValue }) => {
    dispatch(authSlice.actions.setIsSigningUp(true));
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      dispatch(authSlice.actions.setAuthUser(res.data));
      toast.success('Account created successfully');
      dispatch(connectSocket()); // Connect socket after successful signup
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      toast.error(errorMessage);
      dispatch(authSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(authSlice.actions.setIsSigningUp(false));
    }
  }
);

// Thunk for user login
export const login = createAsyncThunk(
  'auth/login',
  async (data: any, { dispatch, rejectWithValue }) => {
    dispatch(authSlice.actions.setIsLoggingIn(true));
    try {
      const res = await axiosInstance.post('/auth/login', data);
      dispatch(authSlice.actions.setAuthUser(res.data));
      toast.success('Logged in successfully');
      dispatch(connectSocket()); // Connect socket after successful login
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      dispatch(authSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(authSlice.actions.setIsLoggingIn(false));
    }
  }
);

export const addContact = createAsyncThunk(
  'auth/logout',
  async (data: any, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/add-contact', data);
      toast.success('New Contact Added');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Add Contact failed';
      toast.error(errorMessage);
      dispatch(authSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk for user logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/logout');
      dispatch(authSlice.actions.setAuthUser(null));
      toast.success('Logged out successfully');
      dispatch(disconnectSocket()); // Disconnect socket on logout
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Logout failed';
      toast.error(errorMessage);
      dispatch(authSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: any, { dispatch, rejectWithValue }) => {
    dispatch(authSlice.actions.setIsUpdatingProfile(true));
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      dispatch(authSlice.actions.setAuthUser(res.data));
      toast.success('Profile updated successfully');
      return res.data;
    } catch (error: any) {
      console.error('error in update profile:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      dispatch(authSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(authSlice.actions.setIsUpdatingProfile(false));
    }
  }
);

// Thunk for connecting the socket
export const connectSocket = createAsyncThunk(
  'auth/connectSocket',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState; // Cast to RootState to access auth slice
    const { authUser, socket } = state.auth;

    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    newSocket.connect();
    dispatch(authSlice.actions.setSocket(newSocket));

    newSocket.on('getOnlineUsers', (userIds: string[]) => {
      dispatch(authSlice.actions.setOnlineUsers(userIds));
    });

    // Clean up on disconnect (optional, but good practice)
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      dispatch(authSlice.actions.setOnlineUsers([]));
      dispatch(authSlice.actions.setSocket(null));
    });
  }
);

// Thunk for disconnecting the socket
export const disconnectSocket = createAsyncThunk(
  'auth/disconnectSocket',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { socket } = state.auth;

    if (socket?.connected) {
      socket.disconnect();
    }
    dispatch(authSlice.actions.setSocket(null));
    dispatch(authSlice.actions.setOnlineUsers([])); // Clear online users on disconnect
  }
);

// Create the auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous reducers for direct state updates
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.authUser = action.payload;
      state.error = null; // Clear error on successful auth user set
    },
    setIsSigningUp: (state, action: PayloadAction<boolean>) => {
      state.isSigningUp = action.payload;
    },
    setIsLoggingIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggingIn = action.payload;
    },
    setIsUpdatingProfile: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingProfile = action.payload;
    },
    setIsCheckingAuth: (state, action: PayloadAction<boolean>) => {
      state.isCheckingAuth = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload as any;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  // Extra reducers to handle the lifecycle of async thunks (optional, but good for loading states)
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state) => {
        state.isCheckingAuth = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = null;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isSigningUp = false;
        state.authUser = null;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = null;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload as string;
      });
  },
});

// Export synchronous actions
export const {
  setAuthUser,
  setIsSigningUp,
  setIsLoggingIn,
  setIsUpdatingProfile,
  setIsCheckingAuth,
  setOnlineUsers,
  setSocket,
  setError,
} = authSlice.actions;

// Export the reducer
export default authSlice.reducer;

    // --- Selectors ---
// These functions allow you to easily select parts of the auth state

export const selectAuthUser = (state: RootState) => state.auth.authUser;
export const selectIsSigningUp = (state: RootState) => state.auth?.isSigningUp;
export const selectIsLoggingIn = (state: RootState) => state.auth?.isLoggingIn;
export const selectIsUpdatingProfile = (state: RootState) => state?.auth.isUpdatingProfile;
export const selectIsCheckingAuth = (state: RootState) => state.auth?.isCheckingAuth;
export const selectOnlineUsers = (state: RootState) => state.auth?.onlineUsers;
export const selectSocket = (state: RootState) => state.auth?.socket;
export const selectAuthError = (state: RootState) => state.auth?.error;
    
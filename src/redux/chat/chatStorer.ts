import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store'; // Import RootState for typing getState
import { axiosInstance } from '../../lib/axios'; // Adjust path as necessary
import toast from 'react-hot-toast'; // For toast notifications
import { Socket } from 'socket.io-client'; // For socket.io client type

// Define the shape of a chat message
export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string; // Or Date, depending on how your backend sends it
  updatedAt: string; // Or Date
  image: string
  // Add other message properties like seen, etc.
}

// Define the shape of a chat user (similar to AuthUser but for other users)
export interface ChatUser {
  _id: string;
  username: string;
  fullName: string;
  profilePic: string;
  color: string;
  // Add other user properties that come from your /messages/users endpoint
}

// Define the state interface for the chat slice
export interface ChatState {
  messages: Message[];
  users: ChatUser[];
  selectedUser: ChatUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean; // New loading state for sending messages
  error: string | null; // To store any chat-related errors
}

// Define the initial state
const initialState: ChatState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  error: null,
};

// --- Async Thunks for API calls and side effects ---

// Thunk to get all chat users
export const getUsers = createAsyncThunk(
  'chat/getUsers',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(chatSlice.actions.setIsUsersLoading(true));
    try {
      const res = await axiosInstance.get('/messages/users');
      dispatch(chatSlice.actions.setUsers(res.data));
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      toast.error(errorMessage);
      dispatch(chatSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(chatSlice.actions.setIsUsersLoading(false));
    }
  }
);

// Thunk to get messages for a specific user
export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (userId: string, { dispatch, rejectWithValue }) => {
    dispatch(chatSlice.actions.setIsMessagesLoading(true));
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      dispatch(chatSlice.actions.setMessages(res.data));
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch messages';
      toast.error(errorMessage);
      dispatch(chatSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(chatSlice.actions.setIsMessagesLoading(false));
    }
  }
);

// Thunk to send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: { text: string, image: any }, { dispatch, rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const selectedUser = state.chat.selectedUser;

    if (!selectedUser) {
      toast.error('No user selected to send message to.');
      return rejectWithValue('No user selected');
    }

    dispatch(chatSlice.actions.setIsSendingMessage(true));
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      // Add the newly sent message to the local state immediately
      dispatch(chatSlice.actions.addMessage(res.data));
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);
      dispatch(chatSlice.actions.setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(chatSlice.actions.setIsSendingMessage(false));
    }
  }
);

// Thunk to subscribe to new messages via socket
export const subscribeToMessages = createAsyncThunk(
  'chat/subscribeToMessages',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const socket: Socket | null = state.auth.socket; // Get socket from auth slice
    const selectedUser = state.chat.selectedUser;

    if (!socket || !selectedUser) {
      console.warn('Socket not connected or no user selected, cannot subscribe to messages.');
      return;
    }

    // Ensure the listener is only attached once
    socket.off('newMessage'); // Remove existing listener to prevent duplicates

    socket.on('newMessage', (newMessage: Message) => {
      // Only add message if it's from the currently selected user
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;

      if (isMessageFromSelectedUser) {
        dispatch(chatSlice.actions.addMessage(newMessage));
      }
    });
    console.log('Subscribed to new messages.');
  }
);

// Thunk to unsubscribe from new messages via socket
export const unsubscribeFromMessages = createAsyncThunk(
  'chat/unsubscribeFromMessages',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const socket: Socket | null = state.auth.socket;

    if (socket) {
      socket.off('newMessage');
      console.log('Unsubscribed from new messages.');
    }
  }
);

// --- Chat Slice Definition ---
export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Synchronous reducers for direct state updates
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
      state.error = null; // Clear error on successful message load
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      state.error = null; // Clear error on successful message add
    },
    setUsers: (state, action: PayloadAction<ChatUser[]>) => {
      state.users = action.payload;
      state.error = null; // Clear error on successful user load
    },
    setSelectedUser: (state, action: PayloadAction<ChatUser | null>) => {
      state.selectedUser = action.payload;
      state.messages = []; // Clear messages when selected user changes
      state.error = null; // Clear error
    },
    setIsUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.isUsersLoading = action.payload;
    },
    setIsMessagesLoading: (state, action: PayloadAction<boolean>) => {
      state.isMessagesLoading = action.payload;
    },
    setIsSendingMessage: (state, action: PayloadAction<boolean>) => {
      state.isSendingMessage = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Reducer to clear chat state (e.g., on logout)
    clearChatState: (state) => {
      state.messages = [];
      state.users = [];
      state.selectedUser = null;
      state.isUsersLoading = false;
      state.isMessagesLoading = false;
      state.isSendingMessage = false;
      state.error = null;
    },
  },
  // Extra reducers to handle the lifecycle of async thunks
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state) => {
        state.isUsersLoading = false;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isUsersLoading = false;
        state.error = action.payload as string;
      })
      // getMessages
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state) => {
        state.isMessagesLoading = false;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isMessagesLoading = false;
        state.error = action.payload as string;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isSendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;
      });
  },
});

// Export synchronous actions
export const {
  setMessages,
  addMessage,
  setUsers,
  setSelectedUser,
  setIsUsersLoading,
  setIsMessagesLoading,
  setIsSendingMessage,
  setError,
  clearChatState,
} = chatSlice.actions;

// Export the reducer
export default chatSlice.reducer;

// --- Selectors ---
// These functions allow you to easily select parts of the chat state
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectUsers = (state: RootState) => state.chat.users;
export const selectSelectedUser = (state: RootState) => state.chat.selectedUser;
export const selectIsUsersLoading = (state: RootState) => state.chat.isUsersLoading;
export const selectIsMessagesLoading = (state: RootState) => state.chat.isMessagesLoading;
export const selectIsSendingMessage = (state: RootState) => state.chat.isSendingMessage;
export const selectChatError = (state: RootState) => state.chat.error;
